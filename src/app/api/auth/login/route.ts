import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { ApiResponse } from "@/types";

interface LoginRequest {
  email: string;
  password: string;
}

/**
 * JWT yaratish (JOSE)
 */
async function createJWT(payload: {
  userId: string;
  email: string;
  role: string;
}): Promise<string> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .setIssuedAt()
    .sign(secret);
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    // JWT SECRET tekshiruvi
    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        {
          success: false,
          message: "Server konfiguratsiyasi xatosi",
          error: "JWT_SECRET is missing",
        },
        { status: 500 }
      );
    }

    await connectDB();

    const body: LoginRequest = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email va parol kerak",
          error: "Email yoki parol kiritilmagan",
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Foydalanuvchini topish
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Foydalanuvchi topilmadi",
          error: "Foydalanuvchi mavjud emas",
        },
        { status: 404 }
      );
    }

    // Parol tekshirish
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "Parol noto'g'ri",
          error: "Parol noto'g'ri",
        },
        { status: 401 }
      );
    }

    // JWT token yaratish (JOSE)
    const token = await createJWT({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Response (faqat user ma'lumotlari)
    const response = NextResponse.json({
      success: true,
      message: "Kirish muvaffaqiyatli",
      data: {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      },
    });

    // Tokenni cookie'da saqlash
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true, // XSSdan himoya
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 kun
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server xatosi",
        error: "Server xatosi",
      },
      { status: 500 }
    );
  }
}
