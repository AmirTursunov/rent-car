// app/api/admin/users/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";

// GET - Barcha foydalanuvchilarni olish (faqat admin)
export async function GET(request: NextRequest) {
  try {
    // ✅ Cookie'dan token o'qish
    const admin = await verifyToken(request);

    if (!admin || admin.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admin huquqi kerak" },
        { status: 403 }
      );
    }

    await connectDB();

    // Query parametrlari
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Filter yaratish
    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    if (role && role !== "all") {
      filter.role = role;
    }

    if (status === "active") {
      filter.isActive = true;
    } else if (status === "blocked") {
      filter.isActive = false;
    }

    // Users olish
    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const total = await User.countDocuments(filter);

    // Statistics
    const stats = {
      total: await User.countDocuments(),
      active: await User.countDocuments({ isActive: true }),
      blocked: await User.countDocuments({ isActive: false }),
      admins: await User.countDocuments({ role: "admin" }),
    };

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats,
    });
  } catch (error: any) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Foydalanuvchilarni olishda xatolik",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// POST - Yangi user yaratish (faqat admin)
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyToken(request);

    if (!admin || admin.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admin huquqi kerak" },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { name, email, password, phone, role } = body;

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Majburiy maydonlar to'ldirilmagan" },
        { status: 400 }
      );
    }

    // Email unikal bo'lishi kerak
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Bu email allaqachon ro'yxatdan o'tgan" },
        { status: 400 }
      );
    }

    // Parolni hash qilish
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(password, 12);

    // User yaratish
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      role: role || "user",
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      message: "Foydalanuvchi yaratildi",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error: any) {
    console.error("POST /api/admin/users error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Foydalanuvchi yaratishda xatolik",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
