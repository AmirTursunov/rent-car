import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Car from "@/models/Car";
import { verifyToken } from "@/lib/auth";
import { ApiResponse } from "@/types";
import { emailService } from "@/lib/email"; // ✅ email service import

interface UpdateStatusRequest {
  status:
    | "pending"
    | "confirmed"
    | "completed"
    | "cancelled"
    | "need to be returned";
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } } // Next.js 15 va 14 uchun
): Promise<NextResponse<ApiResponse>> {
  try {
    const user = await verifyToken(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Ruxsat yo'q. Faqat admin status o'zgartira oladi.",
          error: "Ruxsat yo'q",
        },
        { status: 403 }
      );
    }

    // ✅ Next.js 15 uchun params Promise bo'lishi mumkin
    const params = await Promise.resolve(context.params);
    const { id } = params;

    await connectDB();
    const body: UpdateStatusRequest = await request.json();
    const { status: newStatus } = body;

    // ✅ Valid statuslar
    const validStatuses = [
      "pending",
      "confirmed",
      "completed",
      "cancelled",
      "need to be returned",
    ];

    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json(
        {
          success: false,
          message: "Noto'g'ri status",
          error: "Noto'g'ri status",
        },
        { status: 400 }
      );
    }

    // ✅ Bookingni topish
    const booking = await Booking.findById(id)
      .populate("car")
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

    const oldStatus = booking.status;
    const carId = booking.car?._id;

    console.log(`\n🔄 Status yangilanmoqda: ${oldStatus} → ${newStatus}`);

    // ✅ Status o'zgarganda mashina countlarini yangilash
    if (oldStatus !== newStatus && carId) {
      const car = await Car.findById(carId);

      if (car) {
        console.log(
          `📊 Hozirgi: available=${car.availableCount}, booked=${car.bookedCount}, total=${car.totalCount}`
        );

        if (newStatus === "completed" && oldStatus !== "completed") {
          car.availableCount = Math.min(car.availableCount + 1, car.totalCount);
          car.bookedCount = Math.max(0, car.bookedCount - 1);
          car.available = car.availableCount > 0;
          await car.save();
        } else if (
          newStatus === "cancelled" &&
          (oldStatus === "pending" || oldStatus === "confirmed")
        ) {
          car.availableCount = Math.min(car.availableCount + 1, car.totalCount);
          car.bookedCount = Math.max(0, car.bookedCount - 1);
          car.available = car.availableCount > 0;
          await car.save();
        } else if (newStatus === "confirmed" && oldStatus === "pending") {
          // count allaqachon band
        } else if (String(newStatus) === "need to be returned") {
          // hali qaytarilmagan
        } else if (
          oldStatus === "completed" &&
          String(newStatus) === "need to be returned"
        ) {
          car.availableCount = Math.max(0, car.availableCount - 1);
          car.bookedCount = Math.min(car.bookedCount + 1, car.totalCount);
          car.available = car.availableCount > 0;
          await car.save();
        }
      }
    }

    // ✅ Booking statusini yangilash
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { status: newStatus },
      { new: true }
    )
      .populate(
        "car",
        "brand carModel year availableCount totalCount bookedCount"
      )
      .populate("user", "name email");

    console.log(`✅ Status yangilandi: ${oldStatus} → ${newStatus}\n`);

    // 📧 Email jo‘natish (confirmed va cancelled)
    if (newStatus === "confirmed") {
      await emailService.sendBookingConfirmation(
        booking.user.email,
        updatedBooking
      );
    } else if (newStatus === "cancelled") {
      const reason = "Admin tomonidan bekor qilindi";
      await emailService.sendBookingRejection(
        booking.user.email,
        updatedBooking,
        reason
      );
    }

    return NextResponse.json({
      success: true,
      message: "Buyurtma statusi muvaffaqiyatli yangilandi",
      data: { booking: updatedBooking },
    });
  } catch (error) {
    console.error("Update booking status error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server xatosi",
        error:
          error instanceof Error ? error.message : "Status yangilashda xatolik",
      },
      { status: 500 }
    );
  }
}
