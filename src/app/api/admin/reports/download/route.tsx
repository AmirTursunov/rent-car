import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

// TODO: change these to your actual paths
import { connectDB } from "../../../../../lib/mongodb";
import Booking from "@/models/Booking";

export const runtime = "nodejs";

function requireAuth(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const [, token] = auth.split(" ");
  if (!token) throw new Error("Unauthorized");
  try {
    const secret = process.env.JWT_SECRET || "";
    jwt.verify(token, secret);
  } catch {
    throw new Error("Unauthorized");
  }
}

function parseDateRange(searchParams: URLSearchParams) {
  const startDateStr = searchParams.get("startDate");
  const endDateStr = searchParams.get("endDate");
  const start = startDateStr
    ? new Date(startDateStr + "T00:00:00.000Z")
    : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const end = endDateStr ? new Date(endDateStr + "T23:59:59.999Z") : new Date();
  return { start, end };
}

async function getSummary(start: Date, end: Date) {
  const [revenueAgg] = await Booking.aggregate([
    { $match: { status: "completed", createdAt: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: null,
        total: { $sum: "$totalPrice" },
        bookings: { $sum: 1 },
      },
    },
  ]);

  const monthly = await Booking.aggregate([
    { $match: { status: "completed", createdAt: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        revenue: { $sum: "$totalPrice" },
        bookings: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, month: "$_id", revenue: 1, bookings: 1 } },
  ]);

  return {
    totalRevenue: revenueAgg?.total ?? 0,
    totalBookings: revenueAgg?.bookings ?? 0,
    monthly,
  };
}

export async function GET(req: Request) {
  try {
    requireAuth(req);
    await connectDB();

    const { searchParams } = new URL(req.url);
    const { start, end } = parseDateRange(searchParams);
    const format = (searchParams.get("format") || "excel").toLowerCase();

    const summary = await getSummary(start, end);

    if (format === "excel") {
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Report");

      ws.columns = [
        { header: "Ko'rsatkich", key: "k", width: 30 },
        { header: "Qiymat", key: "v", width: 20 },
      ];

      ws.addRow({ k: "Boshlanish", v: start.toISOString().slice(0, 10) });
      ws.addRow({ k: "Tugash", v: end.toISOString().slice(0, 10) });
      ws.addRow({ k: "Jami daromad", v: summary.totalRevenue });
      ws.addRow({ k: "Jami buyurtmalar", v: summary.totalBookings });
      ws.addRow({});
      ws.addRow({ k: "Oylik daromad (oy)", v: "Daromad / Buyurtma" });

      for (const m of summary.monthly) {
        ws.addRow({ k: m.month, v: `${m.revenue} / ${m.bookings}` });
      }

      const buffer = await wb.xlsx.writeBuffer();
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="hisobot-${start
            .toISOString()
            .slice(0, 10)}-${end.toISOString().slice(0, 10)}.xlsx"`,
        },
      });
    }

    if (format === "pdf") {
      const doc = new PDFDocument({ size: "A4", margin: 40 });
      const chunks: Buffer[] = [];
      doc.on("data", (c) => chunks.push(c));
      const done = new Promise<Buffer>((resolve) => {
        doc.on("end", () => resolve(Buffer.concat(chunks)));
      });

      doc.fontSize(18).text("Hisobot", { align: "center" });
      doc.moveDown();
      doc
        .fontSize(12)
        .text(
          `Davr: ${start.toISOString().slice(0, 10)} — ${end
            .toISOString()
            .slice(0, 10)}`
        );
      doc.moveDown();
      doc.text(`Jami daromad: ${summary.totalRevenue}`);
      doc.text(`Jami buyurtmalar: ${summary.totalBookings}`);
      doc.moveDown();
      doc.fontSize(14).text("Oylik daromad", { underline: true });
      doc.moveDown(0.5);
      summary.monthly.forEach((m) => {
        doc.fontSize(12).text(`${m.month}: ${m.revenue} (${m.bookings} ta)`);
      });

      doc.end();
      const pdfBuffer = await done;

      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="hisobot-${start
            .toISOString()
            .slice(0, 10)}-${end.toISOString().slice(0, 10)}.pdf"`,
        },
      });
    }

    return NextResponse.json(
      { success: false, message: "Noto‘g‘ri format" },
      { status: 400 }
    );
  } catch (err: any) {
    const msg = err?.message || "Server error";
    const status = msg === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, message: msg }, { status });
  }
}
