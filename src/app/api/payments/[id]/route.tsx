import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Payment from "../../../../models/Payment";
import { verifyToken } from "@/lib/auth";

// GET - Bitta to'lovni olish
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Autentifikatsiya kerak",
        },
        { status: 401 }
      );
    }

    await connectDB();

    let filter: any = { _id: params.id };

    // Admin bo'lmasa faqat o'ziniki
    if (user.role !== "admin") {
      filter.user = user.userId;
    }

    const payment = await Payment.findOne(filter)
      .populate("user", "name email phone")
      .populate("booking", "car startDate endDate totalPrice status")
      .populate({
        path: "booking",
        populate: {
          path: "car",
          select: "brand model year",
        },
      });

    if (!payment) {
      return NextResponse.json(
        {
          success: false,
          error: "To'lov topilmadi",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "To'lov ma'lumotlari olindi",
      data: { payment },
    });
  } catch (error) {
    console.error("Get payment error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "To'lov ma'lumotlarini olishda xatolik",
      },
      { status: 500 }
    );
  }
}

// PUT - To'lov statusini yangilash (faqat admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const user = await verifyToken(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Admin huquqi kerak",
        },
        { status: 403 }
      );
    }

    await connectDB();
    const { status, failureReason } = await request.json();

    const validStatuses = [
      "pending",
      "processing",
      "completed",
      "failed",
      "cancelled",
      "refunded",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: "Noto'g'ri status",
        },
        { status: 400 }
      );
    }

    const updateData: any = { status };

    if (status === "completed") {
      updateData.paidAt = new Date();
    }

    if (status === "refunded") {
      updateData.refundedAt = new Date();
    }

    if (status === "failed" && failureReason) {
      updateData.failureReason = failureReason;
    }

    const payment = await Payment.findByIdAndUpdate(params.id, updateData, {
      new: true,
    })
      .populate("booking")
      .populate("user", "name email");

    if (!payment) {
      return NextResponse.json(
        {
          success: false,
          error: "To'lov topilmadi",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "To'lov status yangilandi",
      data: { payment },
    });
  } catch (error) {
    console.error("Update payment error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Status yangilashda xatolik",
      },
      { status: 500 }
    );
  }
}
