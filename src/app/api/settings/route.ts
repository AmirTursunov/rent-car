import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Setting from "@/models/Setting";

export const runtime = "nodejs";

export async function GET() {
  try {
    await connectDB();
    const setting = await (Setting as any).getSingleton();
    const { companyName, contactEmail, phone, address } = setting;
    return NextResponse.json({ success: true, data: { companyName, contactEmail, phone, address } });
  } catch (err: any) {
    const msg = err?.message || "Server xatosi";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
