// lib/email.ts

import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // ✅ Gmail service ishlatish (eng oson)
    const useGmail = process.env.SMTP_SERVICE === "gmail";

    if (useGmail) {
      this.transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // Yoki custom SMTP
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
  }

  async sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
    try {
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn(
          "⚠️ Email service not configured (SMTP_USER or SMTP_PASS missing)"
        );
        return false;
      }

      console.log(`📧 Sending email to: ${to}`);
      console.log(`📋 Subject: ${subject}`);

      await this.transporter.sendMail({
        from: `"Rent Car" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
      });

      console.log(`✅ Email sent successfully to: ${to}`);
      return true;
    } catch (error) {
      console.error("❌ Email sending error:", error);
      return false;
    }
  }

  // Buyurtma tasdiqlash emaili (Professional)
  async sendBookingConfirmation(
    to: string,
    bookingData: any
  ): Promise<boolean> {
    const startDate = new Date(bookingData.startDate).toLocaleDateString(
      "uz-UZ",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
    const endDate = new Date(bookingData.endDate).toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
          .content { padding: 30px; }
          .success-badge { background: #d1fae5; color: #065f46; padding: 12px 20px; border-radius: 8px; text-align: center; font-weight: bold; margin-bottom: 25px; }
          .info-section { background: #f9fafb; border-left: 4px solid #10b981; padding: 20px; margin: 15px 0; border-radius: 8px; }
          .info-section h3 { margin: 0 0 15px 0; color: #1f2937; font-size: 18px; }
          .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .info-row:last-child { border-bottom: none; }
          .label { color: #6b7280; font-weight: 500; }
          .value { color: #111827; font-weight: 600; }
          .price-section { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 25px; border-radius: 12px; text-align: center; margin: 25px 0; }
          .price { font-size: 36px; font-weight: bold; color: #92400e; margin: 10px 0; }
          .price-label { color: #78350f; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
          .instructions { background: #eff6ff; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 25px 0; }
          .instructions h3 { color: #1e40af; margin: 0 0 15px 0; }
          .instructions ul { margin: 10px 0; padding-left: 25px; }
          .instructions li { margin: 8px 0; color: #1e3a8a; }
          .contact-box { background: #f0fdf4; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
          .contact-box p { margin: 5px 0; color: #166534; }
          .footer { background: #f9fafb; padding: 25px; text-align: center; border-top: 1px solid #e5e7eb; }
          .footer p { margin: 5px 0; color: #6b7280; font-size: 13px; }
          .button { display: inline-block; background: #10b981; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Buyurtma Tasdiqlandi!</h1>
            <p>Hurmatli ${bookingData.user?.name || "Mijoz"}</p>
          </div>
          
          <div class="content">
            <div class="success-badge">
              🎉 Sizning buyurtmangiz muvaffaqiyatli tasdiqlandi!
            </div>

            <p style="color: #374151; font-size: 16px; line-height: 1.8;">
              Sizning <strong>${bookingData.car.brand} ${
      bookingData.car.carModel
    }</strong> uchun buyurtmangiz admin tomonidan tasdiqlandi. 
              Quyida buyurtma tafsilotlarini ko'rishingiz mumkin.
            </p>

            <div class="info-section">
              <h3>📋 Buyurtma Ma'lumotlari</h3>
              <div class="info-row">
                <span class="label">Buyurtma raqami:</span>
                <span class="value">${bookingData.bookingNumber || "—"}</span>
              </div>
              <div class="info-row">
                <span class="label">Status:</span>
                <span class="value" style="color: #10b981;">✅ Tasdiqlangan</span>
              </div>
            </div>

            <div class="info-section">
              <h3>🚗 Mashina Ma'lumotlari</h3>
              <div class="info-row">
                <span class="label">Mashina:</span>
                <span class="value">${bookingData.car.brand} ${
      bookingData.car.carModel
    }</span>
              </div>
              ${
                bookingData.car.year
                  ? `
              <div class="info-row">
                <span class="label">Yili:</span>
                <span class="value">${bookingData.car.year}</span>
              </div>
              `
                  : ""
              }
            </div>

            <div class="info-section">
              <h3>📅 Ijara Davri</h3>
              <div class="info-row">
                <span class="label">Boshlanish:</span>
                <span class="value">${startDate}</span>
              </div>
              <div class="info-row">
                <span class="label">Tugash:</span>
                <span class="value">${endDate}</span>
              </div>
              <div class="info-row">
                <span class="label">Olib ketish joyi:</span>
                <span class="value">${bookingData.location || "—"}</span>
              </div>
            </div>

            <div class="price-section">
              <p class="price-label">Jami To'lov</p>
              <div class="price">${bookingData.totalPrice.toLocaleString()} so'm</div>
             <p style="margin-top: 15px; font-size: 14px; line-height: 1.5;">
  <span style="background-color: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 4px; font-weight: bold;">
    💰 Depozit (${bookingData.depositPercent || 20}%)
  </span>: 
  <strong style="color: #78350f;">
    ${bookingData.depositAmount?.toLocaleString() || "0"} so'm to'langan
    <br>
    <small style="color: #92400e;">
      (Depozit mashinani oldindan band qilish uchun to'lanadi, mashina qaytarilgandan keyin depozit sizga qaytariladi!)
    </small>
  </strong>
  <br>
  💵 Qolgan summa: <strong>${bookingData.totalPrice.toLocaleString()} so'm</strong>
</p>
            </div>

            <div class="instructions">
              <h3>📝 Keyingi Qadamlar</h3>
              <ul>
                <li><strong>Hujjatlar:</strong> Pasport nusxangizni va haydovchilik guvohnomasini tayyorlab qo'ying.</li>
                <li><strong>Vaqtida keling:</strong> Belgilangan sanada ko'rsatilgan manzilga keling.</li>
                <li><strong>Aloqa:</strong> Savollar bo'lsa, biz bilan bog'laning.</li>
              </ul>
            </div>

            <div class="contact-box">
              <p><strong>📞 Aloqa uchun:</strong></p>
              <p>Telefon: ${
                process.env.ADMIN_PHONE_NUMBER || "+998 90 123 45 67"
              }</p>
              <p>Email: ${process.env.ADMIN_EMAIL}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${
                process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
              }/my-bookings" class="button">
                Buyurtmalarimni Ko'rish
              </a>
            </div>
          </div>

          <div class="footer">
            <p><strong>Rent Car</strong> - Ishonchli avtomobil ijarasi xizmati</p>
            <p>Bu xabar avtomatik yuborilgan. Iltimos, javob bermang.</p>
            <p style="margin-top: 15px; color: #9ca3af;">
              © ${new Date().getFullYear()} Rent Car. Barcha huquqlar himoyalangan.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to,
      subject: "✅ Buyurtmangiz tasdiqlandi! - Rent Car",
      html,
    });
  }

  // Buyurtma rad etish emaili
  async sendBookingRejection(
    to: string,
    bookingData: any,
    rejectionReason: string
  ): Promise<boolean> {
    const startDate = new Date(bookingData.startDate).toLocaleDateString(
      "uz-UZ"
    );
    const endDate = new Date(bookingData.endDate).toLocaleDateString("uz-UZ");

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 40px 30px; text-align: center; }
          .content { padding: 30px; }
          .alert-box { background: #fee2e2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .info-box { background: #f9fafb; padding: 20px; margin: 15px 0; border-radius: 8px; }
          .reason-box { background: #fef2f2; border: 2px solid #fca5a5; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .footer { background: #f9fafb; padding: 25px; text-align: center; border-top: 1px solid #e5e7eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ Buyurtma Rad Etildi</h1>
            <p>Hurmatli ${bookingData.user?.name || "Mijoz"}</p>
          </div>
          
          <div class="content">
            <div class="alert-box">
              <h3 style="margin: 0 0 10px 0; color: #991b1b;">Afsuski, sizning buyurtmangiz rad etildi</h3>
              <p style="margin: 0; color: #7f1d1d;">Quyida tafsilotlarni ko'ring</p>
            </div>

            <div class="info-box">
              <h3>📋 Buyurtma Tafsilotlari</h3>
              <p><strong>Mashina:</strong> ${bookingData.car.brand} ${
      bookingData.car.carModel
    }</p>
              <p><strong>Boshlanish:</strong> ${startDate}</p>
              <p><strong>Tugash:</strong> ${endDate}</p>
              <p><strong>Jami narx:</strong> ${bookingData.totalPrice.toLocaleString()} so'm</p>
            </div>

            <div class="reason-box">
              <h3 style="color: #991b1b;">Rad etish sababi:</h3>
              <p style="font-size: 16px; color: #7f1d1d; line-height: 1.8;">
                ${rejectionReason || "Sabab ko'rsatilmagan"}
              </p>
            </div>

            <p>Iltimos, muammoni tuzatib, qayta urinib ko'ring yoki qo'llab-quvvatlash xizmatiga murojaat qiling.</p>

            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>📞 Aloqa:</strong></p>
              <p>Telefon: ${process.env.ADMIN_PHONE || "+998 90 123 45 67"}</p>
              <p>Email: ${process.env.ADMIN_EMAIL || process.env.SMTP_USER}</p>
            </div>
          </div>

          <div class="footer">
            <p>Hurmat bilan, Rent Car jamoasi</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to,
      subject: "❌ Buyurtmangiz rad etildi - Rent Car",
      html,
    });
  }

  // Admin uchun yangi buyurtma xabarnomasi
  async sendAdminNewBooking(
    adminEmail: string,
    bookingData: any
  ): Promise<boolean> {
    const startDate = new Date(bookingData.startDate).toLocaleDateString(
      "uz-UZ"
    );
    const endDate = new Date(bookingData.endDate).toLocaleDateString("uz-UZ");

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #667eea; }
          .price-box { background: #fef3c7; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
          .price { font-size: 32px; font-weight: bold; color: #f59e0b; }
          .alert { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; border-radius: 6px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚗 Yangi Buyurtma!</h1>
            <p>Buyurtma raqami: ${bookingData.bookingNumber}</p>
          </div>
          <div class="content">
            <div class="alert">
              <strong>⚠️ Diqqat!</strong> Yangi buyurtma qabul qilinishini kutmoqda.
            </div>
            <div class="info-box">
              <h3>👤 Mijoz: ${bookingData.user.name}</h3>
              <p>Email: ${bookingData.user.email}</p>
              <p>Telefon: ${bookingData.phoneNumber || "—"}</p>
            </div>
            <div class="info-box">
              <h3>🚗 Mashina: ${bookingData.car.brand} ${
      bookingData.car.carModel
    }</h3>
              <p>Sana: ${startDate} - ${endDate}</p>
              <p>Manzil: ${bookingData.location}</p>
            </div>
            <div class="price-box">
              <div class="price">${bookingData.totalPrice.toLocaleString()} so'm</div>
              <p>Depozit: ${bookingData.depositAmount.toLocaleString()} so'm</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: adminEmail,
      subject: `🚗 Yangi buyurtma - ${bookingData.car.brand} ${bookingData.car.carModel}`,
      html,
    });
  }
}

export const emailService = new EmailService();
