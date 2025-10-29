import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Car from "@/models/Car";
import { verifyToken } from "@/lib/auth";
import { ApiResponse } from "@/types";

interface CreateBookingRequest {
  carId: string;
  startDate: string;
  endDate: string;
  notes?: string;
  passportImage?: string; // 🔹 qo‘shildi
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Autentifikatsiya kerak",
          error: "Autentifikatsiya kerak",
        },
        { status: 401 }
      );
    }

    await connectDB();

    let bookings;
    if (user.role === "admin") {
      bookings = await Booking.find()
        .populate("user", "name email phone")
        .populate("car", "brand model year pricePerDay images location")
        .sort({ createdAt: -1 });
    } else {
      bookings = await Booking.find({ user: user.userId })
        .populate("car", "brand model year pricePerDay images location")
        .sort({ createdAt: -1 });
    }

    return NextResponse.json({
      success: true,
      message: "Buyurtmalar muvaffaqiyatli olindi",
      data: { bookings },
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server xatosi",
        error: "Buyurtmalarni olishda xatolik",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Autentifikatsiya kerak",
          error: "Autentifikatsiya kerak",
        },
        { status: 401 }
      );
    }

    await connectDB();
    const body: CreateBookingRequest = await request.json();
    const { carId, startDate, endDate, notes, passportImage } = body;

    // Mashina mavjudligini tekshirish
    const car = await Car.findById(carId);
    if (!car || !car.available) {
      return NextResponse.json(
        {
          success: false,
          message: "Mashina mavjud emas yoki band",
          error: "Mashina mavjud emas yoki band",
        },
        { status: 400 }
      );
    }

    // Sana validatsiyasi
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return NextResponse.json(
        {
          success: false,
          message: "Boshlanish sanasi bugungi sanadan kichik bo'lmasligi kerak",
          error: "Boshlanish sanasi bugungi sanadan kichik bo'lmasligi kerak",
        },
        { status: 400 }
      );
    }

    if (end <= start) {
      return NextResponse.json(
        {
          success: false,
          message: "Tugash sanasi boshlanish sanasidan keyingi bo'lishi kerak",
          error: "Tugash sanasi boshlanish sanasidan keyingi bo'lishi kerak",
        },
        { status: 400 }
      );
    }

    // Mavjud buyurtmalarni tekshirish
    const existingBooking = await Booking.findOne({
      car: carId,
      status: { $in: ["pending", "confirmed"] },
      $or: [
        {
          startDate: { $lte: end },
          endDate: { $gte: start },
        },
      ],
    });

    if (existingBooking) {
      return NextResponse.json(
        {
          success: false,
          message: "Bu sanalar uchun mashina allaqachon band",
          error: "Bu sanalar uchun mashina allaqachon band",
        },
        { status: 400 }
      );
    }

    // Kunlar sonini hisoblash
    const days = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    const totalPrice = car.pricePerDay * days;

    // Buyurtma yaratish
    const booking = await Booking.create({
      user: user.userId,
      car: carId,
      startDate: start,
      endDate: end,
      totalPrice,
      status: "pending",
      paymentStatus: "pending",
      notes,
      passportImage, // 🔹 qo‘shildi
    });

    await booking.populate("car", "brand model year pricePerDay images");

    return NextResponse.json(
      {
        success: true,
        message: "Buyurtma muvaffaqiyatli yaratildi",
        data: { booking },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create booking error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server xatosi",
        error: "Buyurtma yaratishda xatolik",
      },
      { status: 500 }
    );
  }
}
