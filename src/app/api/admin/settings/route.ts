import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { connectDB } from "@/lib/mongodb";
import Setting from "@/models/Setting";

export const runtime = "nodejs";

// COOKIE orqali tokenni tekshirish (JOSE bilan)
async function verifyAdmin(req: NextRequest) {
  try {
    // 🍪 Cookie’dan tokenni olish
    const token = req.cookies.get("token")?.value;
    if (!token) throw new Error("Unauthorized");

    // JOSE verify
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const decoded = await jwtVerify(token, secret);

    // admin bo‘lishi shart
    if (decoded.payload.role !== "admin") {
      throw new Error("Unauthorized");
    }

    return decoded.payload; // userId, role...
  } catch {
    throw new Error("Unauthorized");
  }
}

export async function GET(req: NextRequest) {
  try {
    await verifyAdmin(req);
    await connectDB();

    const setting = await (Setting as any).getSingleton();

    return NextResponse.json({
      success: true,
      data: setting,
    });
  } catch (err: any) {
    const msg = err?.message || "Server xatosi";
    const status = msg === "Unauthorized" ? 401 : 500;

    return NextResponse.json({ success: false, message: msg }, { status });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req);

    await connectDB();

    const body = await req.json();

    const setting = await (Setting as any).getSingleton();

    // Faqat kelgan maydonlarni yangilaymiz
    if (body.companyName !== undefined) setting.companyName = body.companyName;
    if (body.contactEmail !== undefined)
      setting.contactEmail = body.contactEmail;
    if (body.phone !== undefined) setting.phone = body.phone;
    if (body.address !== undefined) setting.address = body.address;
    if (body.currency !== undefined) setting.currency = body.currency;
    if (body.dateFormat !== undefined) setting.dateFormat = body.dateFormat;
    if (body.timezone !== undefined) setting.timezone = body.timezone;

    if (body.booking?.allowCancellationHours !== undefined) {
      setting.booking.allowCancellationHours = Number(
        body.booking.allowCancellationHours
      );
    }

    if (body.booking?.defaultStatus !== undefined) {
      setting.booking.defaultStatus = body.booking.defaultStatus;
    }

    if (body.ui?.theme !== undefined) setting.ui.theme = body.ui.theme;
    if (body.ui?.language !== undefined) setting.ui.language = body.ui.language;

    if (body.reports?.defaultRange !== undefined) {
      setting.reports.defaultRange = body.reports.defaultRange;
    }

    // Qaysi admin yangilagani
    setting.updatedBy = admin.userId;
    setting.updatedAt = new Date();

    await setting.save();

    return NextResponse.json({
      success: true,
      data: setting,
    });
  } catch (err: any) {
    const msg = err?.message || "Server xatosi";
    const status = msg === "Unauthorized" ? 401 : 500;

    return NextResponse.json({ success: false, message: msg }, { status });
  }
}
