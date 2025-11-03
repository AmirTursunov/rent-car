// app/api/admin/payments/verify/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/mongodb";
import Payment from "@/models/Payment";
import Booking from "@/models/Booking";
import jwt from "jsonwebtoken";

const verifyAdmin = (request: NextRequest) => {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    if (decoded.role !== "admin") return null;
    return decoded;
  } catch (error) {
    return null;
  }
};

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Admin huquqi kerak" },
        { status: 403 }
      );
    }

    await connectDB();

    const { approved } = await request.json();
    const { id: paymentId } = params;

    // Payment ni topish
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return NextResponse.json(
        { success: false, message: "Payment topilmadi" },
        { status: 404 }
      );
    }

    if (approved) {
      // Tasdiqlash
      payment.status = "completed";
      payment.paidAt = new Date();
      await payment.save();

      // Booking ni yangilash
      await Booking.findByIdAndUpdate(payment.booking, {
        paymentStatus: "deposit_paid",
        paidAmount: payment.amount,
        status: "confirmed",
        confirmedAt: new Date(),
      });

      return NextResponse.json({
        success: true,
        message: "To'lov tasdiqlandi",
        data: { payment },
      });
    } else {
      // Rad etish
      payment.status = "failed";
      payment.failureReason = "Admin tomonidan rad etildi";
      await payment.save();

      // Booking ni yangilash
      await Booking.findByIdAndUpdate(payment.booking, {
        paymentStatus: "pending",
        status: "cancelled",
      });

      return NextResponse.json({
        success: true,
        message: "To'lov rad etildi",
        data: { payment },
      });
    }
  } catch (error: any) {
    console.error("Verify payment error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "To'lovni tekshirishda xatolik",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// app/api/admin/payments/pending/route.ts
export async function GET_PENDING(request: NextRequest) {
  try {
    const admin = verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Admin huquqi kerak" },
        { status: 403 }
      );
    }

    await connectDB();

    const payments = await Payment.find({
      status: "pending",
      paymentProvider: "manual",
    })
      .populate("user", "name email phone")
      .populate("booking", "bookingNumber")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: { payments },
    });
  } catch (error: any) {
    console.error("Get pending payments error:", error);
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
