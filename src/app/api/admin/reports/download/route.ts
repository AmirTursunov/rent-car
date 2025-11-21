// app/api/admin/reports/export/route.ts

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { verifyToken } from "@/lib/auth"; // Cookie orqali admin tekshirish

export const runtime = "nodejs";

// URL params orqali startDate va endDate ni olish
function parseDateRange(searchParams: URLSearchParams) {
  const startDateStr = searchParams.get("startDate");
  const endDateStr = searchParams.get("endDate");

  const start = startDateStr
    ? new Date(startDateStr + "T00:00:00.000Z")
    : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const end = endDateStr ? new Date(endDateStr + "T23:59:59.999Z") : new Date();

  return { start, end };
}

// Bookinglar bo‘yicha summary olish
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

// GET /api/admin/reports/export?format=excel|pdf&startDate=...&endDate=...
export async function GET(req: NextRequest) {
  try {
    // ✅ Admin tekshirish
    const admin = await verifyToken(req);
    if (!admin || admin.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admin huquqi kerak" },
        { status: 403 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const { start, end } = parseDateRange(searchParams);
    const format = (searchParams.get("format") || "excel").toLowerCase();

    const summary = await getSummary(start, end);

    if (format === "excel") {
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Hisobot");

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

      summary.monthly.forEach((m) => {
        ws.addRow({ k: m.month, v: `${m.revenue} / ${m.bookings}` });
      });

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
      const done = new Promise<Buffer>((resolve) =>
        doc.on("end", () => resolve(Buffer.concat(chunks)))
      );

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

      return new NextResponse(new Uint8Array(pdfBuffer), {
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
    console.error("Export report error:", err);
    const msg = err?.message || "Server error";
    const status = msg === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, message: msg }, { status });
  }
}
