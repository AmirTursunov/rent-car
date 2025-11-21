import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Car from "@/models/Car";
import { verifyToken } from "@/lib/auth";
import { ApiResponse } from "@/types";

// 🔹 GET /api/bookings/[id]
export async function GET(
  _request: NextRequest,
  context: { params: { id: string } }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { id } = context.params;
    await connectDB();

    const booking = await Booking.findById(id)
      .populate("user", "name email phone")
      .populate(
        "car",
        "brand carModel year availableCount totalCount bookedCount"
      );

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking topilmadi",
          error: "Booking topilmadi",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Booking ma'lumotlari olindi",
      data: { booking },
    });
  } catch (error) {
    console.error("Get booking error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server xatosi",
        error: "Booking ma'lumotlarini olishda xatolik",
      },
      { status: 500 }
    );
  }
}

// 🔹 PUT /api/bookings/[id]
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
): Promise<NextResponse<ApiResponse>> {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Ruxsat yo'q",
          error: "Token noto'g'ri yoki mavjud emas",
        },
        { status: 403 }
      );
    }

    const { id } = context.params;
    await connectDB();
    const updateData = await request.json();

    // ✅ Admin yoki o'sha user o'zgartira oladi
    const booking = await Booking.findById(id).populate("car");
    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking topilmadi",
          error: "Booking topilmadi",
        },
        { status: 404 }
      );
    }

    if (user.role !== "admin" && booking.user.toString() !== user.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Siz bu bookingni o'zgartira olmaysiz",
          error: "Ruxsat yo'q",
        },
        { status: 403 }
      );
    }

    const oldStatus = booking.status;
    const newStatus = updateData.status;

    // ✅ Status o'zgarganda count'ni boshqarish
    if (oldStatus !== newStatus) {
      const carId = booking.car._id;

      // Booking completed bo'lganda - mashina qaytarildi
      if (newStatus === "completed" && oldStatus !== "completed") {
        await Car.findByIdAndUpdate(carId, {
          $inc: {
            availableCount: 1,
            bookedCount: -1,
          },
          $set: {
            available: true,
          },
        });
      }

      // Booking cancelled yoki rejected bo'lganda - mashina qaytarildi
      if (
        (newStatus === "cancelled" || newStatus === "rejected") &&
        (oldStatus === "pending" || oldStatus === "approved")
      ) {
        await Car.findByIdAndUpdate(carId, {
          $inc: {
            availableCount: 1,
            bookedCount: -1,
          },
          $set: {
            available: true,
          },
        });
      }

      // Booking approved bo'lganda - hech narsa qilmaymiz (allaqachon band)
      // Booking pending bo'lganda - allaqachon band qilingan
    }

    const updatedBooking = await Booking.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate(
      "car",
      "brand carModel year availableCount totalCount bookedCount"
    );

    return NextResponse.json({
      success: true,
      message: "Booking muvaffaqiyatli yangilandi",
      data: { booking: updatedBooking },
    });
  } catch (error) {
    console.error("Update booking error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server xatosi",
        error: "Booking yangilashda xatolik",
      },
      { status: 500 }
    );
  }
}

// 🔹 DELETE /api/bookings/[id]
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } } // params shu yerda
): Promise<NextResponse> {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Ruxsat yo'q",
          error: "Token noto'g'ri yoki mavjud emas",
        },
        { status: 403 }
      );
    }

    const { id } = context.params; // params.id o‘rniga context.params destructure qiling
    await connectDB();

    const booking = await Booking.findById(id).populate("car");
    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking topilmadi",
          error: "Booking topilmadi",
        },
        { status: 404 }
      );
    }

    if (user.role !== "admin" && booking.user.toString() !== user.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Siz bu bookingni o'chira olmaysiz",
          error: "Ruxsat yo'q",
        },
        { status: 403 }
      );
    }

    if (booking.status === "pending" || booking.status === "approved") {
      await Car.findByIdAndUpdate(booking.car._id, {
        $inc: { availableCount: 1, bookedCount: -1 },
        $set: { available: true },
      });
    }

    await Booking.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Booking muvaffaqiyatli o'chirildi",
    });
  } catch (error) {
    console.error("Delete booking error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server xatosi",
        error: "Booking o'chirishda xatolik",
      },
      { status: 500 }
    );
  }
}
