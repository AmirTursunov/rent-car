// app/api/payment/manual/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import Payment from "@/models/Payment";
import Booking from "@/models/Booking";
import { v2 as cloudinary } from "cloudinary";
import { jwtVerify } from "jose";

// Cloudinary konfiguratsiyasi
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🔒 Cookie'dan tokenni verify qilish
async function verifyToken(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) return null;

    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "your-secret-key"
    );
    const { payload } = await jwtVerify(token, secret);

    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as string,
    };
  } catch (error) {
    console.error("JWT verify error:", error);
    return null;
  }
}

// 🔹 POST - manual payment yaratish
export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Autentifikatsiya xatosi" },
        { status: 401 }
      );
    }

    await connectDB();

    const formData = await request.formData();
    const bookingId = formData.get("bookingId") as string;
    const paymentMethod = formData.get("paymentMethod") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const screenshot = formData.get("screenshot") as File;
    const senderCardNumber = formData.get("senderCardNumber") as string;
    const senderCardHolder = formData.get("senderCardHolder") as string;
    const transactionDate = formData.get("transactionDate") as string;
    const transactionId = formData.get("transactionId") as string;
    const receiverCardNumber = formData.get("receiverCardNumber") as string;

    if (!bookingId || !paymentMethod || !amount || !screenshot) {
      return NextResponse.json(
        { success: false, message: "Barcha maydonlarni to'ldiring" },
        { status: 400 }
      );
    }

    if (!senderCardNumber || !senderCardHolder) {
      return NextResponse.json(
        { success: false, message: "Karta ma'lumotlarini kiriting" },
        { status: 400 }
      );
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking topilmadi" },
        { status: 404 }
      );
    }

    const bytes = await screenshot.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadToCloudinary = () =>
      new Promise<string>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "payments" },
          (error, result) => {
            if (error || !result) reject(error || "Upload error");
            else resolve(result.secure_url);
          }
        );
        stream.end(buffer);
      });

    const screenshotUrl = await uploadToCloudinary();

    const payment = await Payment.create({
      booking: bookingId,
      user: booking.user,
      amount,
      currency: "UZS",
      paymentMethod,
      status: "pending",
      paymentProvider: "manual",
      transactionId: transactionId || `MANUAL-${Date.now()}`,
      providerData: {
        senderCardNumber,
        senderCardHolder,
        receiverCardNumber,
        transactionDate,
        transactionId,
        screenshotUrl,
      },
    });

    await Booking.findByIdAndUpdate(bookingId, {
      paymentStatus: "pending",
      status: "pending",
    });

    return NextResponse.json({
      success: true,
      message: "To'lov ma'lumotlari yuborildi. Admin tasdiqlashini kuting.",
      data: { payment },
    });
  } catch (error: any) {
    console.error("Manual payment error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "To'lovni saqlashda xatolik",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// 🔹 GET - foydalanuvchi to'lovlarini olish
export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Autentifikatsiya xatosi" },
        { status: 401 }
      );
    }

    await connectDB();

    const payments = await Payment.find({
      user: user.userId,
      paymentProvider: "manual",
    })
      .populate("booking")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: { payments } });
  } catch (error: any) {
    console.error("Get manual payments error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "To'lovlarni yuklashda xatolik",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
