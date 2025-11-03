import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Booking from "@/models/Booking";
import Car from "@/models/Car";
import "@/models/User"; // ensure User model is registered for populate
import jwt from "jsonwebtoken";

const verifyToken = (request: NextRequest) => {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );
    return decoded;
  } catch (error) {
    return null;
  }
};

// POST - Yangi buyurtma yaratish
export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Autentifikatsiya xatosi" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const {
      car: carId,
      startDate,
      endDate,
      location, // Bitta manzil
      passportSeries,
      passportNumber,
      phoneNumber,
      notes,
      totalPrice: clientTotalPrice,
      depositAmount: clientDepositAmount,
      depositPercent: clientDepositPercent,
    } = body;

    // Validatsiya
    if (!carId || !startDate || !endDate || !location) {
      return NextResponse.json(
        {
          success: false,
          message: "Barcha majburiy maydonlarni to'ldiring",
        },
        { status: 400 }
      );
    }

    if (!passportSeries || !passportNumber || !phoneNumber) {
      return NextResponse.json(
        {
          success: false,
          message: "Passport va telefon ma'lumotlari majburiy",
        },
        { status: 400 }
      );
    }

    // Mashinani tekshirish
    const car = await Car.findById(carId);
    if (!car) {
      return NextResponse.json(
        { success: false, message: "Mashina topilmadi" },
        { status: 404 }
      );
    }

    // Sanalarni tekshirish va normalize qilish
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { success: false, message: "Sanalar noto'g'ri formatda" },
        { status: 400 }
      );
    }

    if (start < now) {
      return NextResponse.json(
        {
          success: false,
          message: "Boshlanish sanasi o'tmishda bo'lishi mumkin emas",
        },
        { status: 400 }
      );
    }

    if (end <= start) {
      return NextResponse.json(
        {
          success: false,
          message: "Tugash sanasi boshlanish sanasidan keyin bo'lishi kerak",
        },
        { status: 400 }
      );
    }

    // Bandlikni tekshirish
    const conflict = await Booking.findOne({
      car: carId,
      status: { $nin: ["cancelled", "rejected"] },
      $and: [{ startDate: { $lte: end } }, { endDate: { $gte: start } }],
    });

    if (conflict) {
      return NextResponse.json(
        { success: false, message: "Mashina bu vaqtda band" },
        { status: 409 }
      );
    }

    // Kunlar soni
    const days = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Narxni hisoblash
    const calculatedTotalPrice = days * car.pricePerDay;

    // Depozit foizi
    let calculatedDepositPercent = 15; // default
    if (calculatedTotalPrice <= 700000) {
      calculatedDepositPercent = 20;
    }

    const calculatedDepositAmount = Math.round(
      (calculatedTotalPrice * calculatedDepositPercent) / 100
    );

    // Booking raqam
    const bookingNumber = `BK${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Paid va remaining summalar
    const paidAmount = calculatedDepositAmount;
    const remainingAmount = Math.max(0, calculatedTotalPrice - paidAmount);

    // Buyurtma yaratish
    const booking = await Booking.create({
      user: (user as any).id || (user as any).userId || (user as any)._id,
      car: carId,
      startDate: start,
      endDate: end,
      location,
      totalPrice: calculatedTotalPrice,
      depositAmount: calculatedDepositAmount,
      depositPercent: calculatedDepositPercent,
      paidAmount,
      remainingAmount,
      status: "pending", // admin hali tasdiqlamagan
      paymentStatus: "pending", // foydalanuvchi to‘lovni kutmoqda
      bookingNumber,
      passport: {
        series: String(passportSeries).toUpperCase(),
        number: String(passportNumber),
      },
      phoneNumber,
      notes,
    });

    // Populate qilish
    await booking.populate("car", "brand model year image pricePerDay images");
    await booking.populate("user", "name email");

    return NextResponse.json(
      {
        success: true,
        message:
          "Buyurtma muvaffaqiyatli yaratildi. Admin tasdiqlashini kuting.",
        data: { booking },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/bookings error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Buyurtma yaratishda xatolik",
        error: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}

// GET - Foydalanuvchi buyurtmalarini olish
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Autentifikatsiya xatosi" },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const filter: any = {
      user: (user as any).id || (user as any).userId || (user as any)._id,
    };

    if (status && status !== "all") {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate("car", "brand carModel year image pricePerDay images")
      .populate("user", "name email phone")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const total = await Booking.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: {
        bookings,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    console.error("GET /api/bookings error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Buyurtmalarni yuklashda xatolik",
        error: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
