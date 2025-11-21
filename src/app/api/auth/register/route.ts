import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { ApiResponse } from "@/types";

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined");
      return NextResponse.json(
        {
          success: false,
          message: "Server konfiguratsiyasi xatosi",
          error: "JWT_SECRET missing",
        },
        { status: 500 }
      );
    }

    await connectDB();
    const body: RegisterRequest = await request.json();
    const { name, email, password, phone } = body;

    // Validatsiya
    if (!name || !email || !password || !phone) {
      return NextResponse.json(
        {
          success: false,
          message: "Barcha maydonlar to'ldirilishi kerak",
          error: "Barcha maydonlar to'ldirilishi kerak",
        },
        { status: 400 }
      );
    }

    // Emailni normalizatsiya
    const normalizedEmail = email.trim().toLowerCase();

    // Email format tekshirish
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        {
          success: false,
          message: "To'g'ri email format kiriting",
          error: "To'g'ri email format kiriting",
        },
        { status: 400 }
      );
    }

    // Parol uzunligini tekshirish
    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Parol kamida 6 ta belgidan iborat bo'lishi kerak",
          error: "Parol kamida 6 ta belgidan iborat bo'lishi kerak",
        },
        { status: 400 }
      );
    }

    // Email unikal ekanligini tekshirish
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Bu email allaqachon ro'yxatdan o'tgan",
          error: "Bu email allaqachon ro'yxatdan o'tgan",
        },
        { status: 400 }
      );
    }

    // Parolni hashlash
    const hashedPassword = await bcrypt.hash(password, 12);

    // Admin emailni tekshirish
    const role =
      normalizedEmail === "amirtursunov2@gmail.com" ? "admin" : "user";

    // Yangi foydalanuvchi yaratish
    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      phone,
      role,
    });

    // JWT token yaratish
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    // Response yaratish (faqat user ma'lumotlari)
    const response = NextResponse.json({
      success: true,
      message: "Ro'yxatdan o'tish muvaffaqiyatli",
      data: {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        // Token yo'q! Cookie'da saqlanadi
      },
    });

    // 🔒 httpOnly cookie'da saqlash (XSS'dan himoya)
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true, // JavaScript orqali o'qib bo'lmaydi
      secure: process.env.NODE_ENV === "production", // Faqat HTTPS
      sameSite: "lax", // CSRF himoyasi
      maxAge: 7 * 24 * 60 * 60, // 7 kun
      path: "/", // Barcha yo'llarda ishlaydi
    });

    return response;
  } catch (error) {
    console.error("Register error:", error);
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
