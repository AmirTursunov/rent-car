import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Car from "@/models/Car";
import { verifyToken } from "@/lib/auth";
import { ApiResponse } from "@/types";

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
    const booking = await Booking.findById(id).populate("car");

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

        // ✅ COMPLETED - Mashina qaytarildi
        if (newStatus === "completed" && oldStatus !== "completed") {
          car.availableCount = Math.min(car.availableCount + 1, car.totalCount);
          car.bookedCount = Math.max(0, car.bookedCount - 1);
          car.available = car.availableCount > 0;
          await car.save();
          console.log(
            `✅ COMPLETED: Mashina qaytarildi → available=${car.availableCount}, booked=${car.bookedCount}`
          );
        }

        // ✅ CANCELLED - Booking bekor qilindi, mashina bo'shadi
        else if (
          newStatus === "cancelled" &&
          (oldStatus === "pending" || oldStatus === "confirmed")
        ) {
          car.availableCount = Math.min(car.availableCount + 1, car.totalCount);
          car.bookedCount = Math.max(0, car.bookedCount - 1);
          car.available = car.availableCount > 0;
          await car.save();
          console.log(
            `❌ CANCELLED: Mashina bo'shadi → available=${car.availableCount}, booked=${car.bookedCount}`
          );
        }

        // ✅ CONFIRMED - Pending'dan tasdiqlandi (count allaqachon -1 qilingan POST'da)
        else if (newStatus === "confirmed" && oldStatus === "pending") {
          console.log(`✓ CONFIRMED: Count o'zgarmaydi (allaqachon band)`);
        }

        // ✅ NEED TO BE RETURNED - Mashina qaytarilishi kerak (hali qaytarilmagan)
        else if (String(newStatus) === "need to be returned") {
          console.log(`⏳ NEED TO BE RETURNED: Kutilmoqda, count o'zgarmaydi`);
        }

        // ✅ Completed → Need to be returned (xato bo'lsa qaytarish)
        else if (
          oldStatus === "completed" &&
          String(newStatus) === "need to be returned"
        ) {
          car.availableCount = Math.max(0, car.availableCount - 1);
          car.bookedCount = Math.min(car.bookedCount + 1, car.totalCount);
          car.available = car.availableCount > 0;
          await car.save();
          console.log(
            `↩️ COMPLETED → NEED TO BE RETURNED: Mashina qayta band → available=${car.availableCount}`
          );
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
