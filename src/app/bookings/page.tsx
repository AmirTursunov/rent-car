"use client";
import { useEffect, useState, useCallback } from "react";
import useSWR from "swr";
import { formatPrice } from "@/lib/utils";
import { MyBookingsSkeleton } from "../../components/skeletons/my-booking-skeleton";
import { redirect } from "next/navigation";

type BookingStatus =
  | "pending"
  | "confirmed"
  | "active"
  | "completed"
  | "cancelled"
  | "no_show";
type PaymentStatus =
  | "pending"
  | "deposit_paid"
  | "fully_paid"
  | "refunded"
  | string;

interface Car {
  brand?: string;
  model?: string;
  carModel?: string;
  year?: number;
  images?: string[];
}

interface Booking {
  _id: string;
  car?: Car;
  startDate: string;
  endDate: string;
  location?: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  totalPrice: number;
}

interface Stats {
  pending: number;
  confirmed: number;
  cancelled: number;
  totalSpent: number;
}

const fetcher = async (url: string) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) {
    throw new Error("Autentifikatsiya kerak");
  }
  return res.json();
};

export default function MyBookingsPage() {
  const [mounted, setMounted] = useState(false);

  const { data, error, isLoading } = useSWR(
    mounted ? "/api/bookings/my" : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // Cache for 30 seconds
      focusThrottleInterval: 300000, // Don't revalidate on focus for 5 min
    }
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const bookings: Booking[] = data?.data?.bookings || [];
  // const stats: Stats | null = data?.data?.stats || null;

  // const statusBadge = useCallback((status: BookingStatus) => {
  //   const map: Record<string, { c: string; bg: string; label: string }> = {
  //     pending: {
  //       c: "text-yellow-700",
  //       bg: "bg-yellow-100",
  //       label: "Kutilmoqda",
  //     },
  //     confirmed: {
  //       c: "text-green-700",
  //       bg: "bg-green-100",
  //       label: "Tasdiqlangan",
  //     },
  //     active: { c: "text-blue-700", bg: "bg-blue-100", label: "Faol" },
  //     completed: {
  //       c: "text-emerald-700",
  //       bg: "bg-emerald-100",
  //       label: "Yakunlangan",
  //     },
  //     cancelled: {
  //       c: "text-gray-700",
  //       bg: "bg-gray-200",
  //       label: "Bekor qilingan",
  //     },
  //     no_show: { c: "text-red-700", bg: "bg-red-100", label: "Kelmagan" },
  //   };
  //   const cfg = map[status] || {
  //     c: "text-gray-700",
  //     bg: "bg-gray-100",
  //     label: status,
  //   };
  //   return (
  //     <span
  //       className={`px-2 py-0.5 rounded text-xs font-semibold ${cfg.c} ${cfg.bg}`}
  //     >
  //       {cfg.label}
  //     </span>
  //   );
  // }, []);

  const paymentBadge = useCallback((status: PaymentStatus) => {
    const map: Record<string, { c: string; bg: string; label: string }> = {
      pending: {
        c: "text-orange-700",
        bg: "bg-orange-100",
        label: "Kutilmoqda",
      },
      deposit_paid: {
        c: "text-green-700",
        bg: "bg-green-100",
        label: "Depozit to'langan",
      },
      paid: {
        c: "text-green-700",
        bg: "bg-green-100",
        label: "Depozit to'langan",
      },
      confirmed: {
        c: "text-green-700",
        bg: "bg-green-100",
        label: "Depozit to'langan",
      },
      fully_paid: {
        c: "text-emerald-700",
        bg: "bg-emerald-100",
        label: "To'liq to'langan",
      },
      refunded: {
        c: "text-gray-700",
        bg: "bg-gray-100",
        label: "Qaytarilgan",
      },
      cancelled: {
        c: "text-black",
        bg: "bg-red-400",
        label: "Bekor qilingan",
      },
    };
    const cfg = map[status] || {
      c: "text-gray-700",
      bg: "bg-gray-100",
      label: status,
    };
    return (
      <span
        className={`px-2 py-0.5 rounded text-xs font-semibold ${cfg.c} ${cfg.bg}`}
      >
        {cfg.label}
      </span>
    );
  }, []);

  if (isLoading) {
    return <MyBookingsSkeleton />;
  }

  if (error) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen py-30 px-6 text-white">
      <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-12">
        Mening buyurtmalarim
      </h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {bookings.map((b) => (
          <div
            key={b._id}
            className="bg-white/5 border border-yellow-400/20 rounded-2xl shadow-[0_0_15px_rgba(251,191,36,0.1)] hover:shadow-[0_0_25px_rgba(251,191,36,0.3)] transition-all overflow-hidden"
          >
            <img
              src={b.car?.images?.[0] || "/window.svg"}
              alt=""
              className="w-full h-60 object-cover border-b border-yellow-400/20"
            />
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-yellow-400">
                  {b.car?.brand} {b.car?.carModel}
                  <sub className="text-green-400">{b.car?.year}</sub>
                </h2>
                <div className="flex gap-2">
                  {paymentBadge(b.paymentStatus)}
                </div>
              </div>

              <p className="text-sm text-gray-400">
                {new Date(b.startDate).toLocaleDateString("uz-UZ")} →{" "}
                {new Date(b.endDate).toLocaleDateString("uz-UZ")}
              </p>

              <p className="text-sm text-gray-400">
                <span className="font-medium text-gray-300">Manzil:</span>{" "}
                {b.location || "Ko'rsatilmagan"}
              </p>

              <p className="text-sm text-gray-400">
                <span className="font-medium text-gray-300">Jami:</span>{" "}
                <span className="text-yellow-400 font-semibold">
                  {formatPrice(b.totalPrice)}
                </span>
              </p>

              {b.paymentStatus === "pending" ? (
                <div className="px-4 py-2 text-sm rounded-lg bg-yellow-400/10 text-yellow-300 border border-yellow-400/30">
                  Depozit to'lovi ko'rib chiqilmoqda ⏳
                </div>
              ) : b.paymentStatus === "cancelled" ? (
                <div className="px-4 py-2 text-sm rounded-lg bg-red-500/10 text-red-400 border border-red-400/30">
                  Depozit to'lovi rad qilindi ❌
                </div>
              ) : (
                <div className="px-4 py-2 text-sm rounded-lg bg-green-500/10 text-green-400 border border-green-400/30">
                  Depozit to'lovi tasdiqlandi ✅
                </div>
              )}
            </div>
          </div>
        ))}

        {bookings.length === 0 && (
          <p className="text-center text-gray-400 mt-20 text-lg">
            Sizda hali hech qanday buyurtma yo'q
          </p>
        )}
      </div>
    </div>
  );
}
