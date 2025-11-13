import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/mongodb";
import User from "../../../../../models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const verifyAdmin = (request: NextRequest) => {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    if (decoded.role !== "admin") {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
};

// GET - Bitta foydalanuvchini olish
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Admin huquqi kerak" },
        { status: 403 }
      );
    }

    await connectDB();

    const user = await User.findById(params.id).select("-password").lean();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Foydalanuvchi topilmadi" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { user },
    });
  } catch (error: any) {
    console.error("GET /api/admin/users/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Foydalanuvchi ma'lumotlarini olishda xatolik",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// PUT - Foydalanuvchini yangilash
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Admin huquqi kerak" },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { name, email, phone, role, password } = body;

    // Foydalanuvchini topish
    const user = await User.findById(params.id);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Foydalanuvchi topilmadi" },
        { status: 404 }
      );
    }

    // O'zini o'chirish yoki role o'zgartirishni oldini olish
    if (admin.userId === params.id && role && role !== user.role) {
      return NextResponse.json(
        {
          success: false,
          message: "O'zingizning rolengizni o'zgartira olmaysiz",
        },
        { status: 400 }
      );
    }

    // Email unikal ekanligini tekshirish (agar o'zgartirilgan bo'lsa)
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { success: false, message: "Bu email band" },
          { status: 400 }
        );
      }
    }

    // Ma'lumotlarni yangilash
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (role) user.role = role;

    // Agar parol o'zgartirilgan bo'lsa
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    await user.save();

    // Parolsiz qaytarish
    const updatedUser = await User.findById(params.id).select("-password");

    return NextResponse.json({
      success: true,
      message: "Foydalanuvchi muvaffaqiyatli yangilandi",
      data: { user: updatedUser },
    });
  } catch (error: any) {
    console.error("PUT /api/admin/users/[id] error:", error);
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

// DELETE - Foydalanuvchini o'chirish
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Admin huquqi kerak" },
        { status: 403 }
      );
    }

    await connectDB();

    // O'zini o'chirishni oldini olish
    if (admin.userId === params.id) {
      return NextResponse.json(
        { success: false, message: "O'zingizni o'chira olmaysiz" },
        { status: 400 }
      );
    }

    const user = await User.findById(params.id);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Foydalanuvchi topilmadi" },
        { status: 404 }
      );
    }

    await User.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: "Foydalanuvchi muvaffaqiyatli o'chirildi",
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

// PATCH -  statusini o'(block/unblock)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Admin huquqi kerak" },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { isActive } = body;

    // O'zini bloklashni oldini olish
    if (admin.userId === params.id) {
      return NextResponse.json(
        { success: false, message: "O'zingizni bloklay olmaysiz" },
        { status: 400 }
      );
    }

    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Foydalanuvchi topilmadi" },
        { status: 404 }
      );
    }

    user.isActive = isActive; // 🔹 asosiy o'zgarish shu yerda
    await user.save();

    const updatedUser = await User.findById(params.id).select("-password");

    return NextResponse.json({
      success: true,
      message: isActive
        ? "Foydalanuvchi aktivlashtirildi"
        : "Foydalanuvchi bloklandi",
      data: { user: updatedUser },
    });
  } catch (error: any) {
    console.error("PATCH /api/admin/users/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Foydalanuvchi statusini o'zgartirishda xatolik",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
