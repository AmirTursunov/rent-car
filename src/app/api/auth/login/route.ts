import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { ApiResponse } from "@/types";

interface LoginRequest {
  email: string;
  password: string;
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
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email va parol kerak",
          error: "Email va parol kerak",
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Foydalanuvchi topilmadi",
          error: "Foydalanuvchi topilmadi",
        },
        { status: 401 }
      );
    }

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

    // Agar email admin@gmail.com bo'lsa, server tomonida ham role admin qilamiz (agar kerak bo'lsa yangilab qo'yish)
    if (normalizedEmail === "admin@gmail.com" && user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    const res = NextResponse.json({
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
        token,
      },
    });

    // res.cookies.set("token", token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 });

    return res;
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
