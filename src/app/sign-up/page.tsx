"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Mail, Phone, UserIcon } from "lucide-react";

interface FormData {
  name: string;
  email: string;
  password: string;
  phone: string;
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

export default function RegisterForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include", // 🔒 Cookie yuborish uchun kerak
      });

      const data: AuthResponse = await response.json();

      if (!response.ok) throw new Error(data.error || "Xatolik yuz berdi");

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
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[712px] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <form
        onSubmit={handleSubmit}
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
      >
        {/* Sarlovha */}
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center border border-white/30">
            <UserIcon className="text-white w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white">
              Ro'yxatdan o'tish
            </h1>
            <p className="text-white/60 text-sm">Yangi akkaunt yarating</p>
          </div>
        </div>

        {/* Xato xabari */}
        {error && (
          <div className="rounded-lg p-3 border text-sm bg-red-50 border-red-200 text-red-700">
            {error}
          </div>
        )}

        {/* FIELDS */}
        {["name", "email", "password", "phone"].map((field) => (
          <div key={field} className="space-y-1">
            <label
              htmlFor={field}
              className="text-sm font-medium text-white mb-1 block"
            >
              {field === "name"
                ? "Ism"
                : field === "email"
                ? "Elektron pochta"
                : field === "password"
                ? "Parol"
                : "Telefon raqami"}
            </label>
            <div className="relative">
              {field === "name" && (
                <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-white/40" />
              )}
              {field === "email" && (
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-white/40" />
              )}
              {field === "password" && (
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-white/40" />
              )}
              {field === "phone" && (
                <Phone className="absolute left-3 top-2.5 w-4 h-4 text-white/40" />
              )}
              <input
                id={field}
                name={field}
                type={field === "password" ? "password" : "text"}
                required
                placeholder={
                  field === "name"
                    ? "Ismingiz"
                    : field === "email"
                    ? "Elektron pochta manzilingiz"
                    : field === "password"
                    ? "Parolingiz"
                    : "Telefon raqamingiz"
                }
                value={(formData as any)[field]}
                onChange={handleChange}
                className="w-full pl-10 bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2.5 text-sm placeholder-white/40 focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 outline-none"
              />
            </div>
          </div>
        ))}

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center py-3 px-4 rounded-lg text-black font-semibold transition-colors bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50"
        >
          {isLoading && <Loader2 className="animate-spin w-5 h-5 mr-2" />}
          {isLoading ? "Yuklanmoqda..." : "Ro'yxatdan o'tish"}
        </button>
      </form>
    </div>
  );
}
