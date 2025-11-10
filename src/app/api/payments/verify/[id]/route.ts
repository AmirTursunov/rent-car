import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Booking from "@/models/Booking";
import Car from "@/models/Car";
import { verifyToken } from "@/lib/auth";
import nodemailer from "nodemailer";

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyToken(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Faqat admin tasdiqlashi mumkin" },
        { status: 403 }
      );
    }

    // ✅ params.id ni await bilan olish
    const { id } = await params;

    const { approved, reason } = await request.json();

    await connectDB();

    const payment = await Payment.findById(id)
      .populate("user", "name email")
      .populate({
        path: "booking",
        populate: { path: "car", select: "brand carModel year pricePerDay" },
      });

    if (!payment) {
      return NextResponse.json(
        { success: false, message: "To'lov topilmadi" },
        { status: 404 }
      );
    }

    if (approved) {
      // ✅ To'lovni tasdiqlash
      payment.status = "completed";
      payment.verifiedAt = new Date();
      payment.verifiedBy = user.userId;
      await payment.save();

      // Booking'ni tasdiqlash
      if (payment.booking) {
        await Booking.findByIdAndUpdate(payment.booking._id, {
          status: "approved",
          paymentStatus: "confirmed",
        });
      }

      // Email yuborish
      try {
        const bookingData = payment.booking;
        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: payment.user.email,
          subject: "Buyurtmangiz tasdiqlandi - Rent Car",
          html: `
            <h2>Buyurtmangiz tasdiqlandi!</h2>
            <p>Hurmatli ${payment.user.name},</p>
            <p>Sizning buyurtmangiz muvaffaqiyatli tasdiqlandi:</p>
            <ul>
              <li><strong>Mashina:</strong> ${bookingData.car.brand} ${
            bookingData.car.carModel
          } (${bookingData.car.year || ""})</li>
              <li><strong>Boshlanish:</strong> ${new Date(
                bookingData.startDate
              ).toLocaleDateString("uz-UZ")}</li>
              <li><strong>Tugash:</strong> ${new Date(
                bookingData.endDate
              ).toLocaleDateString("uz-UZ")}</li>
              <li><strong>Jami narx:</strong> ${bookingData.totalPrice.toLocaleString()} so'm</li>
            </ul>
            <p>Biz siz bilan tez orada bog'lanamiz.</p>
            <p>Rahmat!</p>
          `,
        });
      } catch (emailError) {
        console.error("Email sending error:", emailError);
      }

      return NextResponse.json({
        success: true,
        message: "To'lov tasdiqlandi",
        data: { payment },
      });
    } else {
      // ❌ To'lovni rad etish
      payment.status = "cancelled";
      payment.reason = reason;
      payment.verifiedAt = new Date();
      payment.verifiedBy = user.userId;
      await payment.save();

      if (payment.booking) {
        const booking = await Booking.findById(payment.booking._id).populate(
          "car"
        );
        if (booking) {
          booking.status = "cancelled";
          booking.paymentStatus = "cancelled";
          booking.reason = reason;
          await booking.save();

          if (booking.car) {
            await Car.findByIdAndUpdate(booking.car._id, {
              $inc: { availableCount: 1, bookedCount: -1 },
              $set: { available: true },
            });
          }
        }
      }

      // Rad etish emaili
      try {
        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: payment.user.email,
          subject: "To'lovingiz rad etildi - Rent Car",
          html: `
            <h2>To'lovingiz rad etildi</h2>
            <p>Hurmatli ${payment.user.name},</p>
            <p>Afsuski, sizning to'lovingiz rad etildi:</p>
            <ul>
              <li><strong>Summa:</strong> ${payment.amount.toLocaleString()} UZS</li>
              <li><strong>Transaction ID:</strong> ${payment.transactionId}</li>
            </ul>
            <hr/>
            <h3>Rad etish sababi:</h3>
            <p style="background: #fee; padding: 15px; border-left: 4px solid #c00; border-radius: 4px;">
              ${reason || "Sabab ko'rsatilmagan"}
            </p>
            <hr/>
            <p>Iltimos, muammoni tuzatib, qayta urinib ko'ring yoki qo'llab-quvvatlash xizmatiga murojaat qiling.</p>
            <p><strong>Telefon:</strong> +998 XX XXX XX XX</p>
            <br/>
            <p>Hurmat bilan,<br/>Rent Car jamoasi</p>
          `,
        });
      } catch (emailError) {
        console.error("Email sending error:", emailError);
      }

      return NextResponse.json({
        success: true,
        message: "To'lov rad etildi va foydalanuvchiga xabar yuborildi",
        data: { payment },
      });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { success: false, message: "Server xatosi" },
      { status: 500 }
    );
  }
}
