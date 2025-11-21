// lib/auth-client.ts - Client-side auth utilities

/**
 * 🔐 Client-side: User ma'lumotlarini olish (localStorage'dan)
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
 * 🔐 Client-side: Autentifikatsiya tekshirish
 */
export const isAuthenticated = (): boolean => {
  return getUser() !== null;
};

/**
 * 🔐 Client-side: Admin ekanini tekshirish
 */
export const isUserAdmin = (): boolean => {
  const user = getUser();
  return user?.role === "admin";
};

/**
 * 🔐 Client-side: Tizimdan chiqish
 */
export const logout = async (): Promise<void> => {
  try {
    // Server'ga logout so'rovi (cookie'ni o'chiradi)
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
 * 🔐 Client-side: API so'rovlari uchun headers
 * Token cookie'da bo'lgani uchun credentials: "include" ishlatamiz
 */
export const getAuthHeaders = (): HeadersInit => {
  return {
    "Content-Type": "application/json",
    // Cookie avtomatik yuboriladi, token headerda kerak emas
  };
};

/**
 * 🔐 Client-side: Authenticated fetch wrapper
 */
export const authFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  return fetch(url, {
    ...options,
    credentials: "include", // Cookie'ni avtomatik yuborish
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });
};
