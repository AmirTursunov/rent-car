"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";

interface FormData {
  name: string;
  email: string;
  password: string;
  phone: string;
  role?: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
      phone: string;
      role?: string;
    };
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
      // ✅ Agar admin email bo‘lsa, role ni "admin" qilib yuboramiz
      const dataToSend = {
        ...formData,
        role: formData.email === "admin@gmail.com" ? "admin" : "user",
      };

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      const data: AuthResponse = await response.json();

      if (!response.ok) throw new Error(data.error || "Xatolik yuz berdi");

      // ✅ localStorage ga to‘g‘ri saqlash
      localStorage.setItem("token", data.data!.token);
      localStorage.setItem("user", JSON.stringify(data.data!.user));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth-changed"));
      }

      // ✅ Admin bo‘lsa admin sahifasiga yo‘naltiramiz
      if (dataToSend.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      className="max-w-md mx-auto mt-30 shadow-lg rounded-2xl p-8 space-y-6"
      style={{ backgroundColor: "#ffffff" }}
      onSubmit={handleSubmit}
    >
      <h2
        className="text-2xl font-bold text-center"
        style={{ color: "#1f2937" }}
      >
        Ro'yxatdan o'tish
      </h2>

      {error && (
        <div
          className="rounded-lg p-3 border text-sm"
          style={{
            backgroundColor: "#fef2f2",
            borderColor: "#fecaca",
            color: "#b91c1c",
          }}
        >
          {error}
        </div>
      )}

      {["name", "email", "password", "phone"].map((field) => (
        <div key={field} className="space-y-1">
          <label
            htmlFor={field}
            className="text-sm font-medium"
            style={{ color: "#374151" }}
          >
            {field === "name"
              ? "Ism"
              : field === "email"
              ? "Elektron pochta"
              : field === "password"
              ? "Parol"
              : "Telefon raqami"}
          </label>
          <input
            id={field}
            name={field}
            type={field === "password" ? "password" : "text"}
            required
            className="block w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-blue-500 outline-none transition"
            style={{ borderColor: "#d1d5db" }}
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
          />
        </div>
      ))}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center py-3 px-4 rounded-lg text-white font-semibold transition-colors"
        style={{ backgroundColor: isLoading ? "#3b82f6cc" : "#3b82f6" }}
      >
        {isLoading ? "Yuklanmoqda..." : "Ro'yxatdan o'tish"}
      </button>
    </form>
  );
}
