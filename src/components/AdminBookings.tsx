import { type NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Car from "@/models/Car";
import "@/models/User";
import jwt, { type JwtPayload } from "jsonwebtoken";
import nodemailer from "nodemailer";

interface DecodedUser extends JwtPayload {
  userId: string;
  role: string;
  email?: string;
}

const verifyToken = (request: NextRequest): DecodedUser | null => {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as DecodedUser;

    return decoded;
  } catch (error) {
    console.error("verifyToken error:", error);
    return null;
  }
};

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER,
    pass: process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD,
  },
});

// Admin email yuborish funksiyasi
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
            .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .info-row:last-child { border-bottom: none; }
            .label { font-weight: bold; color: #6b7280; }
            .value { color: #111827; }
            .price-box { background: #fef3c7; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
            .price { font-size: 32px; font-weight: bold; color: #f59e0b; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
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
                <strong>⚠️ Diqqat!</strong> Yangi buyurtma qabul qilinishini kutmoqda. Iltimos, to'lovni tekshiring va buyurtmani tasdiqlang.
              </div>

              <div class="info-box">
                <h3>👤 Mijoz ma'lumotlari</h3>
                <div class="info-row">
                  <span class="label">Ism:</span>
                  <span class="value">${user.name}</span>
                </div>
                <div class="info-row">
                  <span class="label">Email:</span>
                  <span class="value">${user.email}</span>
                </div>
                <div class="info-row">
                  <span class="label">Telefon:</span>
                  <span class="value">${
                    booking.phoneNumber || "Ko'rsatilmagan"
                  }</span>
                </div>
                <div class="info-row">
                  <span class="label">Passport:</span>
                  <span class="value">${booking.passport?.series || ""} ${
        booking.passport?.number || ""
      }</span>
                </div>
              </div>

              <div class="info-box">
                <h3>🚗 Mashina ma'lumotlari</h3>
                <div class="info-row">
                  <span class="label">Mashina:</span>
                  <span class="value">${car.brand} ${car.carModel} (${
        car.year || ""
      })</span>
                </div>
                <div class="info-row">
                  <span class="label">Boshlanish:</span>
                  <span class="value">${startDate}</span>
                </div>
                <div class="info-row">
                  <span class="label">Tugash:</span>
                  <span class="value">${endDate}</span>
                </div>
                <div class="info-row">
                  <span class="label">Manzil:</span>
                  <span class="value">${
                    booking.location || "Ko'rsatilmagan"
                  }</span>
                </div>
              </div>

              <div class="price-box">
                <p style="margin: 0; color: #6b7280;">Jami summa</p>
                <div class="price">${booking.totalPrice.toLocaleString()} so'm</div>
                <p style="margin: 10px 0 0 0; color: #6b7280;">Depozit (${
                  booking.depositPercent
                }%): ${booking.depositAmount.toLocaleString()} so'm</p>
              </div>

              ${
                booking.notes
                  ? `
              <div class="info-box">
                <h3>📝 Qo'shimcha izoh</h3>
                <p>${booking.notes}</p>
              </div>
              `
                  : ""
              }

              <div style="text-align: center; margin-top: 30px;">
                <a href="${
                  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
                }/admin/bookings" class="button">
                  Buyurtmalarni ko'rish
                </a>
              </div>
            </div>

            <div class="footer">
              <p>Bu email avtomatik yuborildi</p>
              <p>Rent Car Admin Panel</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Admin notification sent successfully");
  } catch (error) {
    console.error("Failed to send admin notification:", error);
    // Email yuborilmasa ham booking yaratiladi
  }
};

// 🟢 POST - Yangi buyurtma yaratish
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

    const car = await Car.findById(carId).select(
      "pricePerDay availableCount totalCount brand carModel year"
    );
    if (!car) {
      return NextResponse.json(
        { success: false, message: "Mashina topilmadi" },
        { status: 404 }
      );
    }

    // ✅ Mavjud mashinalar borligini tekshirish
    if (car.availableCount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Bu mashina hozirda mavjud emas. Barcha mashinalar band.",
        },
        { status: 400 }
      );
    }

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

    await booking.populate([
      {
        path: "car",
        select:
          "brand carModel year image pricePerDay images availableCount totalCount",
      },
      { path: "user", select: "name email role" },
    ]);

    // ✅ Adminga email yuborish (async, booking yaratishni to'xtatmaydi)
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
    ).catch((err) => {
      console.error("Admin email notification failed:", err);
    });

    // ✅ Socket.IO orqali real-time bildirishnoma
    try {
      const io = (global as any).io;
      if (io) {
        // Adminga yangi booking haqida xabar
        io.to("admin").emit("booking:new", {
          booking: booking.toObject(),
          message: `Yangi buyurtma: ${car.brand} ${car.carModel}`,
        });

        // User'ga o'z booking haqida xabar
        io.to(`user:${user.userId}`).emit("booking:created", {
          booking: booking.toObject(),
          message: "Buyurtmangiz muvaffaqiyatli yaratildi",
        });

        console.log("📡 Socket events emitted for new booking");
      }
    } catch (socketError) {
      console.error("Socket emit error:", socketError);
    }

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

// 🔵 GET - Admin barcha buyurtmalarni ko'radi, user esa o'zini
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = verifyToken(request);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Token yaroqsiz yoki topilmadi" },
        { status: 401 }
      );
    }

    const filter =
      user.email === "amirtursunov2@gmail.com" ? {} : { user: user.userId };

    const bookings = await Booking.find(filter)
      .populate(
        "car",
        "brand carModel pricePerDay availableCount totalCount bookedCount"
      )
      .populate("user", "name email role")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({ success: true, data: { bookings } });
  } catch (error) {
    console.error("GET bookings error:", error);
    return NextResponse.json(
      { success: false, message: "Buyurtmalarni olishda xatolik" },
      { status: 500 }
    );
  }
}
