// app/api/admin/users/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";

interface RouteContext {
  params: {
    id: string;
  };
}

// GET - Bitta userni olish
export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const admin = await verifyToken(request);

    if (!admin || admin.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admin huquqi kerak" },
        { status: 403 }
      );
    }

    await connectDB();

    const { id } = context.params;

    const user = await User.findById(id).select("-password").lean();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Foydalanuvchi topilmadi" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    console.error("GET /api/admin/users/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Foydalanuvchini olishda xatolik",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// PATCH - User ma'lumotlarini yangilash
export async function PATCH(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const admin = await verifyToken(request);

    if (!admin || admin.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admin huquqi kerak" },
        { status: 403 }
      );
    }

    await connectDB();

    const { id } = context.params;
    const body = await request.json();

    // O'zini o'chirishni oldini olish
    if (id === admin.userId && body.isActive === false) {
      return NextResponse.json(
        { success: false, message: "O'zingizni bloklab bo'lmaydi" },
        { status: 400 }
      );
    }

    // Password update bo'lsa hash qilish
    if (body.password) {
      const bcrypt = require("bcryptjs");
      body.password = await bcrypt.hash(body.password, 12);
    }

    // Email update bo'lsa unikal ekanini tekshirish
    if (body.email) {
      const existingUser = await User.findOne({
        email: body.email.toLowerCase(),
        _id: { $ne: id },
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, message: "Bu email allaqachon band" },
          { status: 400 }
        );
      }

      body.email = body.email.toLowerCase();
    }

    const user = await User.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Foydalanuvchi topilmadi" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Foydalanuvchi yangilandi",
      data: user,
    });
  } catch (error: any) {
    console.error("PATCH /api/admin/users/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Foydalanuvchini yangilashda xatolik",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE - Userni o'chirish
export async function DELETE(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const admin = await verifyToken(request);

    if (!admin || admin.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admin huquqi kerak" },
        { status: 403 }
      );
    }

    await connectDB();

    const { id } = context.params;

    // O'zini o'chirishni oldini olish
    if (id === admin.userId) {
      return NextResponse.json(
        { success: false, message: "O'zingizni o'chirib bo'lmaydi" },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Foydalanuvchi topilmadi" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Foydalanuvchi o'chirildi",
    });
  } catch (error: any) {
    console.error("DELETE /api/admin/users/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Foydalanuvchini o'chirishda xatolik",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
