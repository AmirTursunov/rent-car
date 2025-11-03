// app/api/payment/manual/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import Payment from "@/models/Payment";
import Booking from "@/models/Booking";
import { writeFile } from "fs/promises";
import { join } from "path";
import jwt from "jsonwebtoken";

const verifyToken = (request: NextRequest) => {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

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

    // Validatsiya
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

    // Bookingni tekshirish
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking topilmadi" },
        { status: 404 }
      );
    }

    // Screenshot saqlash
    const bytes = await screenshot.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Public folder ga saqlash
    const filename = `payment-${Date.now()}-${screenshot.name}`;
    const filepath = join(
      process.cwd(),
      "public",
      "uploads",
      "payments",
      filename
    );

    // Ensure directory exists
    const { mkdir } = await import("fs/promises");
    const dir = join(process.cwd(), "public", "uploads", "payments");
    try {
      await mkdir(dir, { recursive: true });
    } catch (error) {
      // Directory already exists
    }

    await writeFile(filepath, buffer);
    const screenshotUrl = `/uploads/payments/${filename}`;

    // Payment yaratish
    const payment = await Payment.create({
      booking: bookingId,
      user: booking.user,
      amount: amount,
      currency: "UZS",
      paymentMethod: paymentMethod,
      status: "pending", // Admin tasdiqlashi kerak
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

    // Bookingni yangilash (pending holatida)
    await Booking.findByIdAndUpdate(bookingId, {
      paymentStatus: "pending", // Admin tasdiqlagunga qadar
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

// GET - Foydalanuvchi to'lovlarini olish
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

    const payments = await Payment.find({
      user: (user as any).userId || (user as any).id,
      paymentProvider: "manual",
    })
      .populate("booking")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: { payments },
    });
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
