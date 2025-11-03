import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { verifyToken } from "@/lib/auth";
import { ApiResponse } from "@/types";

interface UpdateStatusRequest {
  status: "pending" | "confirmed" | "completed" | "cancelled";
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // params endi Promise
): Promise<NextResponse<ApiResponse>> {
  try {
    const user = await verifyToken(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Ruxsat yo'q",
          error: "Ruxsat yo'q",
        },
        { status: 403 }
      );
    }

    // 🧩 params ni kutish kerak
    const { id } = await context.params;

    await connectDB();
    const body: UpdateStatusRequest = await request.json();
    const { status } = body;

    const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Noto'g'ri status",
          error: "Noto'g'ri status",
        },
        { status: 400 }
      );
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
      .populate("car", "brand model")
      .populate("user", "name email");

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          message: "Buyurtma topilmadi",
          error: "Buyurtma topilmadi",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Buyurtma status muvaffaqiyatli yangilandi",
      data: { booking },
    });
  } catch (error) {
    console.error("Update booking status error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server xatosi",
        error: "Status yangilashda xatolik",
      },
      { status: 500 }
    );
  }
}
