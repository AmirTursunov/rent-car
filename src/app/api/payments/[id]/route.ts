import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Payment from "../../../../models/Payment";
import { verifyToken } from "@/lib/auth";
import { emailService } from "@/lib/email";

// GET - Bitta to'lovni olish
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Autentifikatsiya kerak" },
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
        { success: false, error: "To'lov topilmadi" },
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
      { success: false, error: "To'lov ma'lumotlarini olishda xatolik" },
      { status: 500 }
    );
  }
}

// PUT - To'lov statusini yangilash (faqat admin)
// PUT - To'lov statusini yangilash (faqat admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const user = await verifyToken(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin huquqi kerak" },
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
        { success: false, error: "Noto'g'ri status" },
        { status: 400 }
      );
    }

    const updateData: any = { status };

    if (status === "completed") updateData.paidAt = new Date();
    if (status === "refunded") updateData.refundedAt = new Date();
    if (status === "failed" && failureReason)
      updateData.failureReason = failureReason;

    const payment = await Payment.findByIdAndUpdate(params.id, updateData, {
      new: true,
    })
      .populate("booking")
      .populate("user", "name email");

    if (!payment) {
      return NextResponse.json(
        { success: false, error: "To'lov topilmadi" },
        { status: 404 }
      );
    }

    // ✅ To‘lov rad etilganda email yuborish
    if (status === "cancelled" && payment.user?.email) {
      try {
        await emailService.sendEmail({
          to: payment.user.email,
          subject: "To‘lov rad etildi - RentCar",
          html: `
            <h2>Hurmatli ${payment.user.name || "foydalanuvchi"},</h2>
            <p>Afsuski, sizning to‘lovingiz rad etildi.</p>
            <ul>
              <li><strong>To‘lov ID:</strong> ${payment._id}</li>
              <li><strong>Holat:</strong> Rad etilgan</li>
              <li><strong>Sabab:</strong> ${
                failureReason || "Ko‘rsatilmagan"
              }</li>
            </ul>
            <p>Iltimos, to‘lovni qayta amalga oshirib ko‘ring yoki qo‘llab-quvvatlash xizmatiga murojaat qiling.</p>
            <hr/>
            <p><strong>RentCar jamoasi</strong></p>
          `,
        });
        console.log(
          "✅ To‘lov rad etish emaili yuborildi:",
          payment.user.email
        );
      } catch (err) {
        console.error("❌ To‘lov email yuborishda xato:", err);
      }
    }

    return NextResponse.json({
      success: true,
      message: "To'lov status yangilandi",
      data: { payment },
    });
  } catch (error) {
    console.error("Update payment error:", error);
    return NextResponse.json(
      { success: false, error: "Status yangilashda xatolik" },
      { status: 500 }
    );
  }
}

// DELETE - To‘lovni o‘chirish (faqat admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const user = await verifyToken(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Faqat admin o'chira oladi" },
        { status: 403 }
      );
    }

    await connectDB();

    const payment = await Payment.findByIdAndDelete(params.id);

    if (!payment) {
      return NextResponse.json(
        { success: false, error: "To'lov topilmadi" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "To'lov muvaffaqiyatli o'chirildi",
    });
  } catch (error) {
    console.error("Delete payment error:", error);
    return NextResponse.json(
      { success: false, error: "To'lovni o‘chirishda xatolik" },
      { status: 500 }
    );
  }
}
