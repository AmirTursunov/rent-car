import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import "@/models/User"; // ensure User schema is registered for populate
import Car from "@/models/Car";
import { verifyToken } from "@/lib/auth";
import { ApiResponse } from "@/types";

export async function GET({
  params,
}: {
  params: { id: string };
}): Promise<NextResponse<ApiResponse>> {
  try {
    // Next.js warning: await params before using its properties
    const { id } = (await params) as { id?: string };

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Mashina ID topilmadi",
          error: "Mashina ID topilmadi",
        },
        { status: 400 }
      );
    }

    await connectDB();
    const car = await Car.findById(id).populate("owner", "name email phone");

    if (!car) {
      return NextResponse.json(
        {
          success: false,
          message: "Mashina topilmadi",
          error: "Mashina topilmadi",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Mashina ma'lumotlari olindi",
      data: { car },
    });
  } catch (error) {
    console.error("GET /cars/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server xatosi",
        error: "Mashina ma'lumotlarini olishda xatolik",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { id } = (await params) as { id?: string };

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Mashina ID topilmadi",
          error: "Mashina ID topilmadi",
        },
        { status: 400 }
      );
    }

    const user = await verifyToken(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Ruxsat yo‘q",
          error: "Ruxsat yo‘q",
        },
        { status: 403 }
      );
    }

    await connectDB();
    const updateData = await request.json();

    const car = await Car.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!car) {
      return NextResponse.json(
        {
          success: false,
          message: "Mashina topilmadi",
          error: "Mashina topilmadi",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Mashina muvaffaqiyatli yangilandi",
      data: { car },
    });
  } catch (error) {
    console.error("PUT /cars/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server xatosi",
        error: "Mashina yangilashda xatolik",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { id } = (await params) as { id?: string };

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Mashina ID topilmadi",
          error: "Mashina ID topilmadi",
        },
        { status: 400 }
      );
    }

    const user = await verifyToken(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Ruxsat yo‘q",
          error: "Ruxsat yo‘q",
        },
        { status: 403 }
      );
    }

    await connectDB();
    const car = await Car.findByIdAndDelete(id);

    if (!car) {
      return NextResponse.json(
        {
          success: false,
          message: "Mashina topilmadi",
          error: "Mashina topilmadi",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Mashina muvaffaqiyatli o‘chirildi",
    });
  } catch (error) {
    console.error("DELETE /cars/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server xatosi",
        error: "Mashina o‘chirishda xatolik",
      },
      { status: 500 }
    );
  }
}
