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

    // 🔹 Bookingni topish
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

    // 🔹 Faqat admin yoki shu user o'zgartiradi
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

    // ✅ Status o'zgarganda mashina countlarini boshqarish
    if (oldStatus !== newStatus && carId) {
      const car = await Car.findById(carId);

      if (car) {
        console.log(`🔄 Status o'zgarishi: ${oldStatus} → ${newStatus}`);
        console.log(
          `📊 Eski: available=${car.availableCount}, booked=${car.bookedCount}`
        );

        // ✅ COMPLETED - Mashina qaytarildi
        if (newStatus === "completed" && oldStatus !== "completed") {
          car.availableCount = Math.min(car.availableCount + 1, car.totalCount);
          car.bookedCount = Math.max(0, car.bookedCount - 1);
          car.available = car.availableCount > 0;
          await car.save();
          console.log(
            `✅ COMPLETED: available=${car.availableCount}, booked=${car.bookedCount}`
          );
        }

        // ✅ CANCELLED/REJECTED - Mashina band emas
        else if (
          (newStatus === "cancelled" || newStatus === "rejected") &&
          (oldStatus === "pending" ||
            oldStatus === "confirmed" ||
            oldStatus === "approved")
        ) {
          car.availableCount = Math.min(car.availableCount + 1, car.totalCount);
          car.bookedCount = Math.max(0, car.bookedCount - 1);
          car.available = car.availableCount > 0;
          await car.save();
          console.log(
            `❌ CANCELLED: available=${car.availableCount}, booked=${car.bookedCount}`
          );
        }

        // ✅ CONFIRMED/APPROVED - Mashina band (pending'dan kelsa)
        else if (
          (newStatus === "confirmed" || newStatus === "approved") &&
          oldStatus === "pending"
        ) {
          // Allaqachon band qilingan (POST'da -1 qilingan)
          console.log(`✓ CONFIRMED: countlar o'zgarmaydi (allaqachon band)`);
        }

        // ✅ NEED TO BE RETURNED - Hali qaytarilmagan
        else if (newStatus === "need to be returned") {
          // Hali qaytarilmagan, count o'zgarmaydi
          console.log(`⏳ NEED TO BE RETURNED: kutilmoqda, count o'zgarmaydi`);
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
  context: { params: { id: string } }
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

    const { id } = context.params;
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

    // ✅ Pending/Confirmed/Approved → mashina qaytadi
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
        console.log(
          `🗑️ DELETE: Mashina qaytarildi - available=${car.availableCount}`
        );
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
