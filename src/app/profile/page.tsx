"use client";
import { useEffect, useState } from "react";
import { User as UserIcon, Mail, Phone, Loader2, LogOut } from "lucide-react";
import { useToast } from "@/components/context/ToastContext";
import { useAuth } from "@/hooks/useAuth";

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
  const { logout } = useAuth(false);

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
    <div className="min-h-screen flex flex-col justify-center items-center px-4 pt-24">
      <div
        className="
      w-full max-w-xl
      rounded-2xl
      backdrop-blur-xl
      bg-white/10
      border border-white/20
      shadow-[0_8px_32px_rgba(0,0,0,0.25)]
      p-10
    "
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center border border-white/30">
              <UserIcon className="text-white w-7 h-7" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold text-white">Profil</h1>
              <p className="text-white/60 text-sm">Shaxsiy ma’lumotlaringiz</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="
          w-12 h-12
          rounded-xl
          bg-white/10
          hover:bg-white/20
          border border-white/20
          flex items-center justify-center
          transition
        "
          >
            <LogOut className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* NAME */}
          <div>
            <label className="text-sm font-medium text-white mb-1 block">
              Ism
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-white/40" />
              <input
                name="name"
                defaultValue={user.name}
                className="
              w-full pl-10
              bg-white/10
              text-white
              border border-white/20
              rounded-lg px-3 py-2.5 text-sm
              placeholder-white/40
              focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50
              outline-none
            "
              />
            </div>
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-sm font-medium text-white mb-1 block">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-white/40" />
              <input
                name="email"
                defaultValue={user.email}
                className="
              w-full pl-10
              bg-white/10
              text-white
              border border-white/20
              rounded-lg px-3 py-2.5 text-sm
              placeholder-white/40
              focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50
              outline-none
            "
              />
            </div>
          </div>

          {/* PHONE */}
          <div>
            <label className="text-sm font-medium text-white mb-1 block">
              Telefon
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 w-4 h-4 text-white/40" />
              <input
                name="phone"
                defaultValue={user.phone}
                className="
              w-full pl-10
              bg-white/10
              text-white
              border border-white/20
              rounded-lg px-3 py-2.5 text-sm
              placeholder-white/40
              focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50
              outline-none
            "
              />
            </div>
          </div>

          {/* SAVE BUTTON */}
          <button
            type="submit"
            disabled={saving}
            className="
          w-full
          bg-yellow-500
          text-black
          py-3 rounded-lg font-medium
          hover:bg-yellow-400
          transition
          flex items-center justify-center gap-2
          disabled:opacity-50
        "
          >
            {saving && <Loader2 className="animate-spin w-5 h-5" />}
            {saving ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </form>
      </div>
    </div>
  );
}
