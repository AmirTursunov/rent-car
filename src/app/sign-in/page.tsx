"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";

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
    token: string;
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
      });

      const data: AuthResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || "Xatolik yuz berdi");
      }

      // Token va user ma’lumotlarini saqlaymiz
      if (data.data) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("auth-changed"));
        }

        // Admin foydalanuvchini /admin sahifasiga yo‘naltiramiz
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
    <form
      className="max-w-md mx-auto mt-60 shadow-lg rounded-2xl p-8 space-y-6 bg-white"
      onSubmit={handleSubmit}
    >
      <h2 className="text-2xl font-bold text-center text-gray-800">
        Tizimga kirish
      </h2>

      {error && (
        <div className="rounded-lg p-3 border text-sm bg-red-50 border-red-200 text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium text-gray-700">
          Elektron pochta
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="block w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition border-gray-300 text-gray-900"
          placeholder="Elektron pochta manzilingiz"
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium text-gray-700">
          Parol
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="block w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition border-gray-300 text-gray-900"
          placeholder="Parolingiz"
          value={formData.password}
          onChange={handleChange}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center py-3 px-4 rounded-lg font-semibold transition-colors bg-blue-600 text-white disabled:bg-blue-400"
      >
        {isLoading && (
          <svg
            className="animate-spin h-5 w-5 mr-2 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        )}
        {isLoading ? "Yuklanmoqda..." : "Tizimga kirish"}
      </button>
    </form>
  );
}
