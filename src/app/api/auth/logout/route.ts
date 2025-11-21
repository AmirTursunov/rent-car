import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types";

/**
 * 🔒 Logout API - Cookie'ni o'chirish
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Tizimdan muvaffaqiyatli chiqildi",
    });

    // Cookie'ni o'chirish
    response.cookies.set({
      name: "token",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Darhol o'chirish
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server xatosi",
        error: "Logout xatosi",
      },
      { status: 500 }
    );
  }
}
