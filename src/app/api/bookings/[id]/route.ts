import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Car from "@/models/Car";
import { verifyToken } from "@/lib/auth";
import { ApiResponse } from "@/types";

// 🔹 GET /api/bookings/[id]
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> } // async params
): Promise<NextResponse<ApiResponse>> {
  try {
    const { id } = await context.params; // await qo'shildi
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
  context: { params: Promise<{ id: string }> } // async params
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

    const { id } = await context.params; // await qo'shildi
    await connectDB();
    const updateData = await request.json();

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
    const carId = booking.car._id;

    if (oldStatus !== newStatus && carId) {
      const car = await Car.findById(carId);

      if (car) {
        console.log(`🔄 Status o'zgarishi: ${oldStatus} → ${newStatus}`);
        console.log(
          `📊 Eski: available=${car.availableCount}, booked=${car.bookedCount}`
        );

        if (newStatus === "completed" && oldStatus !== "completed") {
          car.availableCount = Math.min(car.availableCount + 1, car.totalCount);
          car.bookedCount = Math.max(0, car.bookedCount - 1);
          car.available = car.availableCount > 0;
          await car.save();
        } else if (
          (newStatus === "cancelled" || newStatus === "rejected") &&
          (oldStatus === "pending" ||
            oldStatus === "confirmed" ||
            oldStatus === "approved")
        ) {
          car.availableCount = Math.min(car.availableCount + 1, car.totalCount);
          car.bookedCount = Math.max(0, car.bookedCount - 1);
          car.available = car.availableCount > 0;
          await car.save();
        }
      }
    }

    const updatedBooking = await Booking.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate(
        "car",
        "brand carModel year availableCount totalCount bookedCount"
      )
      .populate("user", "name email");

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
  context: { params: Promise<{ id: string }> } // async params
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

    const { id } = await context.params; // await qo'shildi
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

    if (
      booking.status === "pending" ||
      booking.status === "confirmed" ||
      booking.status === "approved"
    ) {
      const car = await Car.findById(booking.car._id);
      if (car) {
        car.availableCount = Math.min(car.availableCount + 1, car.totalCount);
        car.bookedCount = Math.max(0, car.bookedCount - 1);
        car.available = car.availableCount > 0;
        await car.save();
      }
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
