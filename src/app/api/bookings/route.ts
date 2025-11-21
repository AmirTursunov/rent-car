// app/api/bookings/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Car from "@/models/Car";
import "@/models/User";
import { verifyToken, isAdmin } from "@/lib/auth";
import nodemailer from "nodemailer";

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER,
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASSWORD,
  },
});

// Admin email yuborish
const sendAdminNotification = async (booking: any, user: any, car: any) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
    if (!adminEmail) {
      console.warn("Admin email not configured");
      return;
    }

    const startDate = new Date(booking.startDate).toLocaleDateString("uz-UZ");
    const endDate = new Date(booking.endDate).toLocaleDateString("uz-UZ");

    await transporter.sendMail({
      from: process.env.SMTP_USER || process.env.EMAIL_USER,
      to: adminEmail,
      subject: `🚗 Yangi buyurtma - ${car.brand} ${car.carModel}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #667eea; }
            .price-box { background: #fef3c7; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
            .price { font-size: 32px; font-weight: bold; color: #f59e0b; }
            .alert { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; border-radius: 6px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚗 Yangi Buyurtma!</h1>
              <p>Buyurtma raqami: ${booking.bookingNumber}</p>
            </div>
            <div class="content">
              <div class="alert">
                <strong>⚠️ Diqqat!</strong> Yangi buyurtma qabul qilinishini kutmoqda.
              </div>
              <div class="info-box">
                <h3>👤 Mijoz: ${user.name}</h3>
                <p>Email: ${user.email}</p>
                <p>Telefon: ${booking.phoneNumber || "—"}</p>
              </div>
              <div class="info-box">
                <h3>🚗 Mashina: ${car.brand} ${car.carModel}</h3>
                <p>Sana: ${startDate} - ${endDate}</p>
                <p>Manzil: ${booking.location}</p>
              </div>
              <div class="price-box">
                <div class="price">${booking.totalPrice.toLocaleString()} so'm</div>
                <p>Depozit: ${booking.depositAmount.toLocaleString()} so'm</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    console.log("✅ Admin notification sent");
  } catch (error) {
    console.error("❌ Failed to send admin notification:", error);
  }
};

// Sana kesishishini tekshirish
function datesOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  // Sanalarni timestamp'ga o'tkazamiz (vaqt qismisiz)
  const s1 = start1.getTime();
  const e1 = end1.getTime();
  const s2 = start2.getTime();
  const e2 = end2.getTime();

  // Kesishish: start1 <= end2 AND end1 >= start2
  const overlaps = s1 <= e2 && e1 >= s2;

  // Debug log
  console.log("📅 Date overlap check:", {
    range1: `${start1.toISOString().split("T")[0]} - ${
      end1.toISOString().split("T")[0]
    }`,
    range2: `${start2.toISOString().split("T")[0]} - ${
      end2.toISOString().split("T")[0]
    }`,
    overlaps,
  });

  return overlaps;
}

// 🟢 POST - Yangi buyurtma yaratish
export async function POST(request: NextRequest) {
  try {
    // ✅ Cookie'dan token olish
    const user = await verifyToken(request);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Autentifikatsiya xatosi. Iltimos, tizimga kiring.",
        },
        { status: 401 }
      );
    }

    await connectDB();

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Noto'g'ri JSON format" },
        { status: 400 }
      );
    }

    const {
      car: carId,
      startDate,
      endDate,
      location,
      passportSeries,
      passportNumber,
      phoneNumber,
      notes,
    } = body;

    // ✅ Majburiy maydonlar
    if (!carId || !startDate || !endDate || !location) {
      return NextResponse.json(
        { success: false, message: "Barcha majburiy maydonlarni to'ldiring" },
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

    // ✅ Mashinani topish
    const car = await Car.findById(carId).select(
      "pricePerDay availableCount totalCount brand carModel year"
    );

    if (!car) {
      return NextResponse.json(
        { success: false, message: "Mashina topilmadi" },
        { status: 404 }
      );
    }

    if (car.availableCount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Bu mashina hozirda mavjud emas. Barcha mashinalar band.",
        },
        { status: 400 }
      );
    }

    // ✅ Sanalarni tekshirish
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const now = new Date();
    now.setHours(0, 0, 0, 0);

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
        { success: false, message: "Tugash sanasi noto'g'ri" },
        { status: 400 }
      );
    }

    // ✅ 1. User buyurtmalari sonini tekshirish (maksimal 3 ta)
    const activeBookingsCount = await Booking.countDocuments({
      user: user.userId,
      status: { $in: ["pending", "confirmed", "approved", "active"] },
    });

    if (activeBookingsCount >= 3) {
      return NextResponse.json(
        {
          success: false,
          message:
            "❌ Siz maksimal 3 ta faol buyurtma qilishingiz mumkin. Avval joriy buyurtmalaringizni tugatishingiz kerak.",
        },
        { status: 400 }
      );
    }

    // ✅ 2. Sanalar kesishishini tekshirish
    const existingBookings = await Booking.find({
      user: user.userId,
      status: { $in: ["pending", "confirmed", "approved", "active"] },
    }).lean();

    console.log("🔍 Checking date conflicts for user:", user.userId);
    console.log("📋 Existing bookings:", existingBookings.length);
    console.log("📅 New booking dates:", {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    });

    for (const existingBooking of existingBookings) {
      const existingStart = new Date(existingBooking.startDate);
      const existingEnd = new Date(existingBooking.endDate);

      // ✅ MUHIM: Vaqtni 00:00:00 ga o'rnatish
      existingStart.setHours(0, 0, 0, 0);
      existingEnd.setHours(0, 0, 0, 0);

      console.log("🔄 Checking against booking:", {
        bookingNumber: existingBooking.bookingNumber,
        existingStart: existingStart.toISOString().split("T")[0],
        existingEnd: existingEnd.toISOString().split("T")[0],
      });

      if (datesOverlap(start, end, existingStart, existingEnd)) {
        const conflictStart = existingStart.toLocaleDateString("uz-UZ");
        const conflictEnd = existingEnd.toLocaleDateString("uz-UZ");

        console.log("❌ Date conflict detected!");

        return NextResponse.json(
          {
            success: false,
            message: `❌ Siz bu sanalarda allaqachon buyurtma qilgansiz (${conflictStart} - ${conflictEnd}). Boshqa sanani tanlang.`,
            conflictingBooking: {
              bookingNumber: existingBooking.bookingNumber,
              startDate: conflictStart,
              endDate: conflictEnd,
            },
          },
          { status: 400 }
        );
      }
    }

    console.log("✅ No date conflicts found");

    // ✅ Narxni hisoblash
    const days = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    const calculatedTotalPrice = days * car.pricePerDay;

    let calculatedDepositPercent = 15;
    if (calculatedTotalPrice <= 700000) calculatedDepositPercent = 20;

    const calculatedDepositAmount = Math.round(
      (calculatedTotalPrice * calculatedDepositPercent) / 100
    );

    const bookingNumber = `BK${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const paidAmount = calculatedDepositAmount;
    const remainingAmount = Math.max(0, calculatedTotalPrice - paidAmount);

    // ✅ Booking yaratish
    const booking = await Booking.create({
      user: user.userId,
      car: carId,
      startDate: start,
      endDate: end,
      location,
      totalPrice: calculatedTotalPrice,
      depositAmount: calculatedDepositAmount,
      depositPercent: calculatedDepositPercent,
      paidAmount,
      remainingAmount,
      status: "pending",
      paymentStatus: "pending",
      bookingNumber,
      passport: {
        series: String(passportSeries).toUpperCase(),
        number: String(passportNumber),
      },
      phoneNumber,
      notes,
    });

    // ✅ Mashinaning count'ini yangilash
    await Car.findByIdAndUpdate(carId, {
      $inc: {
        availableCount: -1,
        bookedCount: 1,
      },
      $set: {
        available: car.availableCount - 1 > 0,
      },
    });

    // ✅ Populate
    await booking.populate([
      {
        path: "car",
        select:
          "brand carModel year image pricePerDay images availableCount totalCount",
      },
      { path: "user", select: "name email role" },
    ]);

    // ✅ Admin email (async)
    sendAdminNotification(
      {
        bookingNumber,
        totalPrice: calculatedTotalPrice,
        depositAmount: calculatedDepositAmount,
        depositPercent: calculatedDepositPercent,
        startDate: start,
        endDate: end,
        location,
        phoneNumber,
        notes,
        passport: {
          series: String(passportSeries).toUpperCase(),
          number: String(passportNumber),
        },
      },
      booking.user,
      car
    ).catch((err) => console.error("Admin email failed:", err));

    return NextResponse.json(
      {
        success: true,
        message:
          "✅ Buyurtma muvaffaqiyatli yaratildi! Admin tasdiqlashini kuting.",
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

// 🔵 GET - Buyurtmalarni olish
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // ✅ Cookie'dan token
    const user = await verifyToken(request);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Autentifikatsiya xatosi. Iltimos, tizimga kiring.",
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const carId = searchParams.get("car");
    const status = searchParams.get("status");

    // ✅ Filter: Admin - barcha, User - faqat o'zniki
    let filter: any = isAdmin(user) ? {} : { user: user.userId };

    if (carId) {
      filter.car = carId;
    }

    if (status === "active") {
      filter.status = { $in: ["pending", "confirmed", "approved", "active"] };
    } else if (status) {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate(
        "car",
        "brand carModel pricePerDay availableCount totalCount bookedCount image images year"
      )
      .populate("user", "name email role phone")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({
      success: true,
      data: { bookings },
      isAdmin: isAdmin(user),
    });
  } catch (error) {
    console.error("GET bookings error:", error);
    return NextResponse.json(
      { success: false, message: "Buyurtmalarni olishda xatolik" },
      { status: 500 }
    );
  }
}
