"use client";
import { useEffect, useState } from "react";
import { User as UserIcon, Mail, Phone, Loader2 } from "lucide-react";
import { useToast } from "@/components/context/ToastContext";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const res = await fetch("/api/profile", {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) {
          setError("Autentifikatsiya kerak");
          return;
        }
        const json = await res.json();
        if (json.success) setUser(json.data.user);
      } catch {
        setError("Profil yuklanmadi");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      setSaving(true);
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const formData = new FormData(e.currentTarget);
      const payload = {
        name: formData.get("name"),
        phone: formData.get("phone"),
        email: formData.get("email"),
      } as Record<string, any>;

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.error || json.message || "Saqlashda xatolik");

      setUser(json.data.user);
      // localStorage yangilash: yangi token bo'lsa almashtiramiz, userni ham saqlaymiz
      if (typeof window !== "undefined") {
        if (json.data?.token) {
          localStorage.setItem("token", json.data.token as string);
        }
        try {
          localStorage.setItem("user", JSON.stringify(json.data.user));
        } catch {}
      }
      showToast("Profil muvaffaqiyatli saqlandi", "success");
    } catch (err: any) {
      setError("Saqlashda xatolik");
      showToast(err?.message || "Saqlashda xatolik yuz berdi", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col pt-24">
        <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
          <Loader2 className="animate-spin w-10 h-10 text-gray-600" />
          <p className="mt-4 text-gray-500">Profil yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex flex-col pt-24">
        <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
          <h1 className="text-2xl font-semibold mb-2">Profil topilmadi</h1>
          <p className="text-gray-600 mb-4">
            Profilni ko‘rish uchun tizimga kiring.
          </p>
          <a
            href="/sign-in"
            className="px-5 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
          >
            Kirish
          </a>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col ">
      <section className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-md border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100">
              <UserIcon className="text-gray-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">Profil</h1>
              <p className="text-sm text-gray-500">Shaxsiy maʼlumotlaringiz</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Ism</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  name="name"
                  defaultValue={user.name}
                  className="w-full pl-9 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  name="email"
                  defaultValue={user.email}
                  className="w-full pl-9 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">
                Telefon
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  name="phone"
                  defaultValue={user.phone}
                  className="w-full pl-9 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            <button
              disabled={saving}
              className="w-full bg-black text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {saving && <Loader2 className="animate-spin w-4 h-4" />}
              {saving ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
