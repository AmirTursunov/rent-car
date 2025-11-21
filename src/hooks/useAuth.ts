"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser, logout as logoutUtil, isUserAdmin } from "@/lib/auth-client";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export const useAuth = (requireAdmin = false) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const currentUser = getUser();

      if (!currentUser) {
        router.push("/sign-in");
        return;
      }

      if (requireAdmin && currentUser.role !== "admin") {
        router.push("/");
        return;
      }

      setUser(currentUser);
      setLoading(false);
    };

    checkAuth();

    // Auth o'zgarishlarini kuzatish
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener("auth-changed", handleAuthChange);

    return () => {
      window.removeEventListener("auth-changed", handleAuthChange);
    };
  }, [requireAdmin, router]);

  const logout = async () => {
    await logoutUtil();
    router.push("/sign-in");
  };

  return {
    user,
    loading,
    isAdmin: isUserAdmin(),
    logout,
  };
};
