import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";
import { verifyToken } from "@/lib/auth";

interface RouteContext {
  params: {
    id: string;
  };
}

// POST - Verify Payment (Approve/Reject)
// ...

export async function POST(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    await connectDB();

    // ✅ Cookie'dan token o'qish
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Autentifikatsiya xatosi" },
        { status: 401 }
      );
    }

    // ✅ Faqat admin verify qila oladi
    if (user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Ruxsat yo'q" },
        { status: 403 }
      );
    }

    // ✅ context.params endi Promise
    const { id } = await context.params;

    const body = await request.json();
    const { approved, reason } = body;

    if (typeof approved !== "boolean") {
      return NextResponse.json(
        { success: false, message: "approved field majburiy" },
        { status: 400 }
      );
    }

    // Payment topish
    const payment = await Payment.findById(id);
    if (!payment) {
      return NextResponse.json(
        { success: false, message: "To'lov topilmadi" },
        { status: 404 }
      );
    }

    // Statusni yangilash
    if (approved) {
      payment.status = "completed";
      payment.verifiedAt = new Date();
      payment.verifiedBy = user.userId;
    } else {
      payment.status = "failed";
      payment.rejectedAt = new Date();
      payment.rejectedBy = user.userId;
      payment.rejectionReason = reason || "Admin tomonidan rad etildi";
    }

    await payment.save();

    // Populate qilib qaytarish
    await payment.populate("user", "name email phone");

    return NextResponse.json({
      success: true,
      message: approved ? "To'lov tasdiqlandi" : "To'lov rad etildi",
      data: payment,
    });
  } catch (error: any) {
    console.error("POST /api/payments/verify error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "To'lovni tasdiqlashda xatolik",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
