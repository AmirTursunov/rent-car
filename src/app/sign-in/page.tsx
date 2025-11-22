"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Mail, UserIcon } from "lucide-react";

interface FormData {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      name: string;
      email: string;
      phone: string;
      role: string;
    };
    // Token yo'q - cookie'da saqlanadi
  };
  error?: string;
}

export default function LoginForm() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        // credentials: "include", // 🔒 Cookie yuborish uchun kerak
      });

      const data: AuthResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || "Xatolik yuz berdi");
      }

      // ✅ Faqat user ma'lumotlarini localStorage'ga saqlaymiz (token yo'q!)
      if (data.data) {
        localStorage.setItem("user", JSON.stringify(data.data.user));

        // Auth state o'zgarganini bildirish
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("auth-changed"));
        }

        // Yo'naltirish
        if (data.data.user.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      }
    } catch (err: any) {
      setError(err.message || "Tizimga kirishda xatolik");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[712px] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <form
        className="w-full
    max-w-sm
    sm:max-w-md
    lg:w-[450px]
    mx-auto
    mt-10 sm:mt-16 lg:mt-20
    shadow-lg
    rounded-2xl
    p-6 sm:p-8
    space-y-6
    bg-white/10
    backdrop-blur-xl
    border border-white/20"
        onSubmit={handleSubmit}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center border border-white/30">
              <UserIcon className="text-white w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white">
                Tizimga kirish
              </h2>
              <p className="text-white/60 text-sm">Xush kelibsiz</p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg p-3 border text-sm bg-red-50 border-red-200 text-red-700">
            {error}
          </div>
        )}

        {/* Email */}
        <div className="space-y-1">
          <label
            htmlFor="email"
            className="text-sm font-medium text-white mb-1 block"
          >
            Elektron pochta
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 w-4 h-4 text-white/40" />
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full pl-10 bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2.5 text-sm placeholder-white/40 focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 outline-none"
              placeholder="Elektron pochta manzilingiz"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label
            htmlFor="password"
            className="text-sm font-medium text-white mb-1 block"
          >
            Parol
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 w-4 h-4 text-white/40" />
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full pl-10 bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2.5 text-sm placeholder-white/40 focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 outline-none"
              placeholder="Parolingiz"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex flex-col items-center gap-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center py-3 px-4 rounded-lg font-semibold transition-colors bg-yellow-500 text-black hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading && <Loader2 className="animate-spin w-5 h-5 mr-2" />}
            {isLoading ? "Yuklanmoqda..." : "Tizimga kirish"}
          </button>
          <p className="text-sm text-white/40 mt-4">
            Ro'yxatdan o'tmaganmisiz?{" "}
            <a
              href="/sign-up"
              className="text-yellow-500 hover:underline transition-colors duration-200"
            >
              Ro'yxatdan o'ting
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
