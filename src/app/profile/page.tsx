"use client";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const res = await fetch("/api/profile");
        if (!res.ok) {
          setError("Autentifikatsiya kerak");
          return;
        }
        const json = await res.json();
        if (json.success) {
          setUser(json.data.user);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Profil yuklanmadi");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Profil</h1>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold">Profil</h1>
        <p className="text-gray-600">Profilni ko'rish uchun tizimga kiring.</p>
        <a href="/sign-in" className="inline-block bg-black text-white px-4 py-2 rounded">Kirish</a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Profil</h1>
      <form action="/api/profile" method="put" className="space-y-3 max-w-md">
        <div className="space-y-1">
          <label className="text-sm text-gray-600">Ism</label>
          <input name="name" defaultValue={user.name} className="w-full border rounded px-3 py-2 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-gray-600">Telefon</label>
          <input name="phone" defaultValue={user.phone} className="w-full border rounded px-3 py-2 text-sm" />
        </div>
        <button className="bg-black text-white px-4 py-2 rounded">Saqlash</button>
      </form>
    </div>
  );
}