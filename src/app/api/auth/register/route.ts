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

    // Emailni normalizatsiya (kichik harf)
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

    // Agar email admin@gmail.com bo'lsa role admin qilib saqlaymiz
    const role = normalizedEmail === "admin@gmail.com" ? "admin" : "user";

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

    // Tokenni cookie sifatida ham qo'yish (xohlasangiz)
    const res = NextResponse.json({
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
        token,
      },
    });

    // Agar cookie orqali saqlamoqchi bo'lsangiz:
    // res.cookies.set("token", token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 });

    return res;
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
