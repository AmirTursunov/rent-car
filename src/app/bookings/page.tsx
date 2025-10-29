"use client";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchBookings() {
      try {
        setLoading(true);
        const res = await fetch("/api/bookings/my");
        if (!res.ok) {
          setError("Autentifikatsiya kerak");
          return;
        }
        const json = await res.json();
        if (json.success) {
          setBookings(json.data.bookings || []);
          setStats(json.data.stats || null);
        }
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError("Buyurtmalar yuklanmadi");
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Buyurtmalarim</h1>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Buyurtmalarim</h1>
        <div className="text-center py-12 text-red-600">
          <p>{error}</p>
          <a href="/sign-in" className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded">Kirish</a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Buyurtmalarim</h1>
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="border rounded p-3"><div className="text-gray-600">Kutilmoqda</div><div className="text-xl font-semibold">{stats.pending}</div></div>
          <div className="border rounded p-3"><div className="text-gray-600">Tasdiqlangan</div><div className="text-xl font-semibold">{stats.confirmed}</div></div>
          <div className="border rounded p-3"><div className="text-gray-600">Bekor qilingan</div><div className="text-xl font-semibold">{stats.cancelled}</div></div>
          <div className="border rounded p-3"><div className="text-gray-600">Umumiy xarajat</div><div className="text-xl font-semibold">{formatPrice(stats.totalSpent || 0)}</div></div>
        </div>
      )}
      <div className="space-y-3">
        {bookings.map((b: any) => (
          <div key={b._id} className="border rounded p-4 flex items-center gap-4">
            <img src={b.car?.images?.[0] || "/window.svg"} alt="" className="h-20 w-28 object-cover rounded" />
            <div className="flex-1">
              <div className="font-medium">{b.car?.brand} {(b.car?.carModel || b.car?.model) ?? ""} {b.car?.year}</div>
              <div className="text-sm text-gray-600">{new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}</div>
              <div className="text-sm">Holat: <span className="uppercase">{b.status}</span> · To'lov: {b.paymentStatus}</div>
            </div>
            <div className="font-semibold">{formatPrice(b.totalPrice)}</div>
          </div>
        ))}
        {bookings.length === 0 && (
          <div className="text-gray-600">Sizda hali buyurtmalar yo'q.</div>
        )}
      </div>
    </div>
  );
}