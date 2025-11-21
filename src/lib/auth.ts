// lib/auth.ts

import { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import type { JWTPayload } from "jose";

export interface DecodedUser extends JWTPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * 🔒 Cookie'dan tokenni o'qish va verify qilish
 */
export const verifyToken = async (
  request: NextRequest
): Promise<DecodedUser | null> => {
  try {
    // Cookie'dan token olish
    const token = request.cookies.get("token")?.value;

    if (!token) {
      console.log("Token cookie'da topilmadi");
      return null;
    }

    // JWT ni verify qilish (jose library)
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "your-secret-key"
    );

    const { payload } = await jwtVerify(token, secret);

    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as string,
    } as DecodedUser;
  } catch (error) {
    console.error("verifyToken error:", error);
    return null;
  }
};

/**
 * Admin tekshirish
 */
export const isAdmin = (user: DecodedUser | null): boolean => {
  return user?.role === "admin";
};

/**
 * User ID olish
 */
export const getUserId = async (
  request: NextRequest
): Promise<string | null> => {
  const user = await verifyToken(request);
  return user?.userId || null;
};

/**
 * Client-side: User ma'lumotlarini olish (localStorage'dan)
 */
export const getUser = (): {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
} | null => {
  if (typeof window === "undefined") return null;

  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

/**
 * Client-side: Tizimdan chiqish
 */
export const logout = async (): Promise<void> => {
  try {
    // Server'ga logout so'rovi
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    // localStorage'ni tozalash
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth-changed"));
    }
  } catch (error) {
    console.error("Logout error:", error);
  }
};

/**
 * Client-side: Autentifikatsiya tekshirish
 */
export const isAuthenticated = (): boolean => {
  return getUser() !== null;
};

/**
 * Client-side: Admin ekanini tekshirish
 */
export const isUserAdmin = (): boolean => {
  const user = getUser();
  return user?.role === "admin";
};
