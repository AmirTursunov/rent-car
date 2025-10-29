import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
    try {
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log("Email service not configured");
        return false;
      }

      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject,
        html,
      });

      return true;
    } catch (error) {
      console.error("Email sending error:", error);
      return false;
    }
  }

  // Buyurtma tasdiqlash emaili
  async sendBookingConfirmation(
    to: string,
    bookingData: any
  ): Promise<boolean> {
    const html = `
      <h2>Buyurtmangiz tasdiqlandi!</h2>
      <p>Hurmatli mijoz,</p>
      <p>Sizning buyurtmangiz muvaffaqiyatli tasdiqlandi:</p>
      <ul>
        <li><strong>Mashina:</strong> ${bookingData.car.brand} ${
      bookingData.car.model
    }</li>
        <li><strong>Boshlanish:</strong> ${new Date(
          bookingData.startDate
        ).toLocaleDateString()}</li>
        <li><strong>Tugash:</strong> ${new Date(
          bookingData.endDate
        ).toLocaleDateString()}</li>
        <li><strong>Jami narx:</strong> ${bookingData.totalPrice.toLocaleString()} so'm</li>
      </ul>
      <p>Biz siz bilan tez orada bog'lanamiz.</p>
      <p>Rahmat!</p>
    `;

    return this.sendEmail({
      to,
      subject: "Buyurtma tasdiqlandi - RentCar",
      html,
    });
  }
}

export const emailService = new EmailService();
