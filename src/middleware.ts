// middleware.ts (root papkada)

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

interface DecodedToken {
  userId: string;
  email: string;
  role: string;
}

/**
 * 🔒 JWT Token verify qilish (jose library - Edge Runtime'da ishlaydi)
 */
async function verifyJWT(token: string): Promise<DecodedToken | null> {
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "your-secret-key"
    );

    const { payload } = await jwtVerify(token, secret);

    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as string,
    };
  } catch (error) {
    console.error("JWT verify error:", error);
    return null;
  }
}

/**
 * 🔒 Middleware - himoyalangan yo'llarni tekshirish
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Token olish
  const token = request.cookies.get("token")?.value;

  // Admin yo'llarini himoya qilish
  if (pathname.startsWith("/admin")) {
    if (!token) {
      console.log("Admin: Token yo'q");
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    const decoded = await verifyJWT(token);

    if (!decoded) {
      console.log("Admin: Token yaroqsiz");
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    if (decoded.role !== "admin") {
      console.log("Admin: Role admin emas:", decoded.role);
      return NextResponse.redirect(new URL("/", request.url));
    }

    console.log("Admin: Ruxsat berildi", decoded.email);
    return NextResponse.next();
  }

  // User profil yo'lini himoya qilish
  if (pathname.startsWith("/profile") || pathname.startsWith("/my-bookings")) {
    if (!token) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    const decoded = await verifyJWT(token);
    if (!decoded) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    return NextResponse.next();
  }

  // Login/Register sahifalariga kirish (agar authenticated bo'lsa)
  if (pathname === "/sign-in" || pathname === "/sign-up") {
    if (token) {
      const decoded = await verifyJWT(token);

      if (decoded) {
        // Admin bo'lsa admin panelga
        if (decoded.role === "admin") {
          return NextResponse.redirect(new URL("/admin", request.url));
        }

        // User bo'lsa asosiy sahifaga
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  return NextResponse.next();
}

/**
 * Middleware qaysi yo'llarda ishlashi kerak
 */
export const config = {
  matcher: [
    "/admin/:path*",
    "/profile/:path*",
    "/my-bookings/:path*",
    "/sign-in",
    "/sign-up",
  ],
};
