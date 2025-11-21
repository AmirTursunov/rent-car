import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";
import { verifyToken } from "@/lib/auth";

interface RouteContext {
  params: {
    id: string;
  };
}

// GET - Single Payment
export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    await connectDB();

    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Autentifikatsiya xatosi" },
        { status: 401 }
      );
    }

    const { id } = context.params;

    const payment = await Payment.findById(id)
      .populate("user", "name email phone")
      .populate("booking", "bookingNumber startDate endDate");

    if (!payment) {
      return NextResponse.json(
        { success: false, message: "To'lov topilmadi" },
        { status: 404 }
      );
    }

    // User faqat o'zining to'lovini ko'ra oladi
    if (user.role !== "admin" && payment.user._id.toString() !== user.userId) {
      return NextResponse.json(
        { success: false, message: "Ruxsat yo'q" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: payment,
    });
  } catch (error: any) {
    console.error("GET /api/payments/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "To'lovni yuklashda xatolik",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// PUT - Update Payment
export async function PUT(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    await connectDB();

    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Autentifikatsiya xatosi" },
        { status: 401 }
      );
    }

    // Faqat admin update qila oladi
    if (user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Ruxsat yo'q" },
        { status: 403 }
      );
    }

    const { id } = context.params;
    const body = await request.json();

    const payment = await Payment.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).populate("user", "name email phone");

    if (!payment) {
      return NextResponse.json(
        { success: false, message: "To'lov topilmadi" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "To'lov yangilandi",
      data: payment,
    });
  } catch (error: any) {
    console.error("PUT /api/payments/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "To'lovni yangilashda xatolik",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete Payment
export async function DELETE(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    await connectDB();

    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Autentifikatsiya xatosi" },
        { status: 401 }
      );
    }

    // Faqat admin o'chira oladi
    if (user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Ruxsat yo'q" },
        { status: 403 }
      );
    }

    const { id } = context.params;

    const payment = await Payment.findByIdAndDelete(id);

    if (!payment) {
      return NextResponse.json(
        { success: false, message: "To'lov topilmadi" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "To'lov o'chirildi",
    });
  } catch (error: any) {
    console.error("DELETE /api/payments/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "To'lovni o'chirishda xatolik",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
