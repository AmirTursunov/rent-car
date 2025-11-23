import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { verifyToken } from "@/lib/auth";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER,
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASSWORD,
  },
});

export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request);

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Ruxsat yo'q" },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { bookingId, userEmail, userName, endDate } = body;

    if (!bookingId || !userEmail) {
      return NextResponse.json(
        { success: false, message: "Majburiy ma'lumotlar yetishmayapti" },
        { status: 400 }
      );
    }

    // Booking'ni tekshirish va car ni populate qilish
    const booking = await Booking.findById(bookingId).populate({
      path: "car",
      select: "carModel brand year color",
    });
    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Buyurtma topilmadi" },
        { status: 404 }
      );
    }
    const car = booking.car as {
      carModel: string;
      brand?: string;
      color?: string;
      year?: number;
    } | null;
    const carModel = car?.carModel || "Mashina nomi noma'lum";
    const carBrand = car?.brand || "";
    const carcolor = car?.color || "";
    const carYear = car?.year ? `(${car.year})` : "";

    const endDateFormatted = new Date(endDate).toLocaleString("uz-UZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const daysRemaining = Math.ceil(
      (new Date(endDate).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );

    // Kechikish uchun jarima summasi (masalan, kuniga 50,000 so'm)
    const penaltyPerDay = 50000;

    await transporter.sendMail({
      from: process.env.SMTP_USER || process.env.EMAIL_USER,
      to: userEmail,
      subject: `⚠️ Eslatma: ${carModel} mashinani qaytarish sanasi yaqinlashmoqda`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .alert-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .info-box { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #3b82f6; }
            .warning-box { background: #fffbeb; border: 2px solid #fbbf24; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
            .highlight { font-size: 24px; font-weight: bold; color: #dc2626; }
            strong { color: #111827; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">⚠️ MUHIM ESLATMA</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Mashina qaytarish sanasi yaqinlashmoqda</p>
            </div>
            
            <div class="content">
              <p style="font-size: 16px; margin-bottom: 20px;">Hurmatli <strong>${userName}</strong>,</p>

              <div class="alert-box">
                <h3 style="margin-top: 0; color: #dc2626;">🚗 Mashina qaytarish sanasi</h3>
                <p style="margin: 10px 0;"><strong>Mashina:</strong>${carBrand} ${carModel} - ${carYear}</p>
                <p style="margin: 10px 0;"><strong>Qaytarish sanasi:</strong></p>
                <div class="highlight">${endDateFormatted} 18:00 gacha!</div>
                <p style="margin: 10px 0; color: #6b7280;">
                  ${
                    daysRemaining > 0
                      ? `Qaytarishga ${daysRemaining} kun qoldi`
                      : daysRemaining === 0
                      ? "BUGUN qaytarish kerak!"
                      : `KECHIKISH: ${Math.abs(daysRemaining)} kun`
                  }
                </p>
              </div>

              <div class="warning-box">
                <h3 style="margin-top: 0; color: #f59e0b;">⏰ MUHIM MA'LUMOT</h3>
                <p style="margin: 10px 0; font-size: 15px;">
                  Iltimos, mashinani belgilangan vaqtda qaytarishingizni so'raymiz.
                </p>
                <p style="margin: 15px 0 5px 0; font-weight: bold; color: #dc2626;">
                  ❗ DIQQAT: Kechikish uchun jarima
                </p>
                <ul style="margin: 5px 0; padding-left: 20px; color: #374151;">
                  <li>Har bir kechikkan kun uchun <strong style="color: #dc2626;">${penaltyPerDay.toLocaleString()} so'm</strong> jarima</li>
                  <li>Jarima avtomatik hisoblanadi</li>
                  <li>Kafolat puli ya'ni zalogdan ushlab qolinadi</li>
                </ul>
              </div>

              <div class="info-box">
                <h3 style="margin-top: 0; color: #3b82f6;">📞 Aloqa</h3>
                <p style="margin: 5px 0;">Agar qo'shimcha vaqt kerak bo'lsa yoki savol bo'lsa:</p>
                <p style="margin: 10px 0;">
                  <strong>Telefon:</strong> +998 XX XXX XX XX<br/>
                  <strong>Email:</strong> ${
                    process.env.SMTP_USER || "support@rentcar.uz"
                  }
                </p>
              </div>

              <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
                Bu avtomatik eslatma xabari. Iltimos, belgilangan vaqtda mashinani qaytarishingizni so'raymiz.
              </p>
            </div>

            <div class="footer">
              <p>© ${new Date().getFullYear()} Rent Car. Barcha huquqlar himoyalangan.</p>
              <p style="margin-top: 5px;">Bu email avtomatik yuborilgan</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Eslatma muvaffaqiyatli yuborildi",
    });
  } catch (error) {
    console.error("Send reminder error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Email yuborishda xatolik",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
