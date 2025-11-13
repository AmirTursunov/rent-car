// src/app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { z } from "zod";

// ------------------------
// Async verifyAdmin
// ------------------------
const verifyAdmin = async (request: NextRequest) => {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    if (decoded.role !== "admin") return null;

    return decoded;
  } catch (error) {
    return null;
  }
};

// ------------------------
// Zod schemas
// ------------------------
const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: z.enum(["user", "admin"]).optional(),
  password: z.string().min(6).optional(),
});

const patchUserSchema = z.object({
  isActive: z.boolean(),
});

// ------------------------
// GET - Bitta user olish
// ------------------------
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin)
      return NextResponse.json(
        { success: false, message: "Admin huquqi kerak" },
        { status: 403 }
      );

    await connectDB();

    const user = await User.findById(params.id).select("-password").lean();
    if (!user)
      return NextResponse.json(
        { success: false, message: "Foydalanuvchi topilmadi" },
        { status: 404 }
      );

    return NextResponse.json({ success: true, data: { user } });
  } catch (error: any) {
    console.error("GET /api/admin/users/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Xatolik", error: error.message },
      { status: 500 }
    );
  }
}

// ------------------------
// PUT - User yangilash
// ------------------------
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin)
      return NextResponse.json(
        { success: false, message: "Admin huquqi kerak" },
        { status: 403 }
      );

    await connectDB();
    const body = updateUserSchema.safeParse(await request.json());
    if (!body.success)
      return NextResponse.json(
        { success: false, message: body.error.message },
        { status: 400 }
      );

    const { name, email, phone, role, password } = body.data;

    const user = await User.findById(params.id);
    if (!user)
      return NextResponse.json(
        { success: false, message: "Foydalanuvchi topilmadi" },
        { status: 404 }
      );

    // Self role-change block
    if (admin.userId === params.id && role && role !== user.role) {
      return NextResponse.json(
        { success: false, message: "O'zingizning rolni o'zgartira olmaysiz" },
        { status: 400 }
      );
    }

    // Email uniqueness
    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing)
        return NextResponse.json(
          { success: false, message: "Bu email band" },
          { status: 400 }
        );
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (role) user.role = role;
    if (password && password.trim() !== "")
      user.password = await bcrypt.hash(password, 10);

    await user.save();
    const updatedUser = await User.findById(params.id).select("-password");

    return NextResponse.json({
      success: true,
      message: "Foydalanuvchi yangilandi",
      data: { user: updatedUser },
    });
  } catch (error: any) {
    console.error("PUT /api/admin/users/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Xatolik", error: error.message },
      { status: 500 }
    );
  }
}

// ------------------------
// DELETE - User o'chirish
// ------------------------
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin)
      return NextResponse.json(
        { success: false, message: "Admin huquqi kerak" },
        { status: 403 }
      );

    await connectDB();

    if (admin.userId === params.id)
      return NextResponse.json(
        { success: false, message: "O'zingizni o'chira olmaysiz" },
        { status: 400 }
      );

    const user = await User.findById(params.id);
    if (!user)
      return NextResponse.json(
        { success: false, message: "Foydalanuvchi topilmadi" },
        { status: 404 }
      );

    await User.findByIdAndDelete(params.id);
    return NextResponse.json({
      success: true,
      message: "Foydalanuvchi o'chirildi",
    });
  } catch (error: any) {
    console.error("DELETE /api/admin/users/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Xatolik", error: error.message },
      { status: 500 }
    );
  }
}

// ------------------------
// PATCH - isActive (block/unblock)
// ------------------------
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin)
      return NextResponse.json(
        { success: false, message: "Admin huquqi kerak" },
        { status: 403 }
      );

    await connectDB();
    const body = patchUserSchema.safeParse(await request.json());
    if (!body.success)
      return NextResponse.json(
        { success: false, message: body.error.message },
        { status: 400 }
      );

    const { isActive } = body.data;

    if (admin.userId === params.id)
      return NextResponse.json(
        { success: false, message: "O'zingizni bloklay olmaysiz" },
        { status: 400 }
      );

    const user = await User.findById(params.id);
    if (!user)
      return NextResponse.json(
        { success: false, message: "Foydalanuvchi topilmadi" },
        { status: 404 }
      );

    user.isActive = isActive;
    await user.save();

    const updatedUser = await User.findById(params.id).select("-password");
    return NextResponse.json({
      success: true,
      message: isActive ? "Foydalanuvchi aktiv" : "Foydalanuvchi bloklandi",
      data: { user: updatedUser },
    });
  } catch (error: any) {
    console.error("PATCH /api/admin/users/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Xatolik", error: error.message },
      { status: 500 }
    );
  }
}
