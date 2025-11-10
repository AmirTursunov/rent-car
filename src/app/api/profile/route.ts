import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";
import { sanitizeUser } from "@/lib/utils";
import { ApiResponse } from "@/types";

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    // Token tekshirish
    const tokenUser = await verifyToken(request);
    if (!tokenUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Autentifikatsiya kerak",
          error: "Token topilmadi yoki noto‘g‘ri",
        },
        { status: 401 }
      );
    }

    // DB ga ulanish
    await connectDB();

    // Foydalanuvchini topish
    const user = await User.findById(tokenUser.userId);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Foydalanuvchi topilmadi",
          error: "User ID noto‘g‘ri",
        },
        { status: 404 }
      );
    }

    // Javob qaytarish
    return NextResponse.json({
      success: true,
      message: "Profil ma'lumotlari olindi",
      data: { user: sanitizeUser(user) },
    });
  } catch (err) {
    console.error("Get profile error:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Server xatosi",
        error: "Profil ma'lumotlarini olishda xatolik",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    // Token tekshirish
    const tokenUser = await verifyToken(request);
    if (!tokenUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Autentifikatsiya kerak",
          error: "Token topilmadi yoki noto‘g‘ri",
        },
        { status: 401 }
      );
    }

    // DB ga ulanish
    await connectDB();

    // Yangilanish ma’lumotlarini olish
    const updateData = await request.json();
    const { password, email, ...allowedFields } = updateData;

    // Agar email yuborilgan bo'lsa, unikal va format tekshirish
    if (email) {
      const exists = await User.findOne({ email: String(email).toLowerCase() });
      if (exists && String(exists._id) !== tokenUser.userId) {
        return NextResponse.json(
          {
            success: false,
            message: "Bu email allaqachon band",
            error: "Email already in use",
          },
          { status: 409 }
        );
      }
      (allowedFields as any).email = String(email).toLowerCase();
    }

    // Foydalanuvchini yangilash
    const user = await User.findByIdAndUpdate(tokenUser.userId, allowedFields, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Foydalanuvchi topilmadi",
          error: "User ID noto‘g‘ri",
        },
        { status: 404 }
      );
    }

    // Agar email o'zgargan bo'lsa, yangi token qaytaramiz
    let token: string | undefined;
    try {
      const { generateToken } = await import("@/lib/auth");
      token = generateToken({
        userId: user._id.toString(),
        email: user.email,
        role: (tokenUser as any).role || "user",
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Profil muvaffaqiyatli yangilandi",
      data: { user: sanitizeUser(user), token },
    });
  } catch (err) {
    console.error("Update profile error:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Server xatosi",
        error: "Profilni yangilashda xatolik",
      },
      { status: 500 }
    );
  }
}
