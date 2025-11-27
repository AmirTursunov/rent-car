"use client";
import React, { useState, useEffect } from "react";
import {
  Car,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
} from "lucide-react";

interface DashboardStats {
  totalCars: number;
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  availableCars: number; // Bo'sh mashinalar
  bookedCars: number; // Band mashinalar
}

interface RecentBooking {
  _id: string;
  user: { name: string; email: string };
  car: { brand: string; carModel: string };
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
}

const AdminDashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalCars: 0,
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    availableCars: 0,
    bookedCars: 0,
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/dashboard/stats", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Ma'lumotlarni yuklab bo'lmadi");
      }

      const data = await response.json();
      console.log("Dashboard data:", data);

      if (data.success && data.data) {
        setStats({
          totalCars: data.data.overview?.totalCars || 0,
          totalUsers: data.data.overview?.totalUsers || 0,
          totalBookings: data.data.overview?.totalBookings || 0,
          totalRevenue: data.data.overview?.totalRevenue || 0,
          availableCars: data.data.overview?.availableCars || 0,
          bookedCars: data.data.overview?.bookedCars || 0,
        });

        if (data.data.recentBookings) {
          setRecentBookings(data.data.recentBookings.slice(0, 10));
        }
      }

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi");
      setLoading(false);
    }
  };

  const StatCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    value: string | number;
    trend?: string;
    color: string;
  }> = ({ icon, title, value, trend, color }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-2">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 mt-1 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              {trend}
            </p>
          )}
        </div>
        <div className={`${color} p-3 rounded-lg`}>{icon}</div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Xatolik yuz berdi</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="text-red-600 text-sm underline mt-2 hover:text-red-800"
            >
              Qayta urinish
            </button>
          </div>
        </div>
      )}

      {/* 📊 Asosiy Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Car className="w-6 h-6 text-white" />}
          title="Jami Mashinalar"
          value={stats.totalCars}
          color="bg-blue-500"
        />
        <StatCard
          icon={<Users className="w-6 h-6 text-white" />}
          title="Foydalanuvchilar"
          value={stats.totalUsers}
          color="bg-green-500"
        />
        <StatCard
          icon={<Calendar className="w-6 h-6 text-white" />}
          title="Jami Buyurtmalar"
          value={stats.totalBookings}
          color="bg-purple-500"
        />
        <StatCard
          icon={<DollarSign className="w-6 h-6 text-white" />}
          title="Jami Daromad"
          value={`${(stats.totalRevenue / 1000000).toFixed(1)}M so'm`}
          color="bg-orange-500"
        />
      </div>

      {/* ✅ BO'SH VA BAND MASHINALAR - ASOSIY QISM */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Bo'sh Mashinalar
            </h3>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <div className="flex items-baseline">
            <span className="text-4xl font-bold text-green-600">
              {stats.availableCars}
            </span>
            <span className="text-gray-500 ml-3 text-lg">ta mavjud</span>
          </div>
          <div className="mt-4 bg-green-50 rounded-lg p-3">
            <p className="text-sm text-green-700">
              ✅ Hozir ijaraga berishingiz mumkin
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Band Mashinalar
            </h3>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <div className="flex items-baseline">
            <span className="text-4xl font-bold text-red-600">
              {stats.bookedCars}
            </span>
            <span className="text-gray-500 ml-3 text-lg">ta band</span>
          </div>
          <div className="mt-4 bg-red-50 rounded-lg p-3">
            <p className="text-sm text-red-700">
              🚗 Hozirda mijozlar foydalanmoqda
            </p>
          </div>
        </div>
      </div>

      {/* 📈 Band/Bo'sh Foiz Ko'rsatkichi */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Mashina Holati
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Bo'sh mashinalar
              </span>
              <span className="text-sm font-semibold text-green-600">
                {stats.availableCars + stats.bookedCars > 0
                  ? (
                      (stats.availableCars /
                        (stats.availableCars + stats.bookedCars)) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${
                    stats.availableCars + stats.bookedCars > 0
                      ? (stats.availableCars /
                          (stats.availableCars + stats.bookedCars)) *
                        100
                      : 0
                  }%`,
                }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Band mashinalar
              </span>
              <span className="text-sm font-semibold text-red-600">
                {stats.availableCars + stats.bookedCars > 0
                  ? (
                      (stats.bookedCars /
                        (stats.availableCars + stats.bookedCars)) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-red-500 h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${
                    stats.availableCars + stats.bookedCars > 0
                      ? (stats.bookedCars /
                          (stats.availableCars + stats.bookedCars)) *
                        100
                      : 0
                  }%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* 📋 So'nggi Buyurtmalar */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            So'nggi Buyurtmalar
          </h3>
          <button
            onClick={fetchDashboardData}
            className="text-blue-600 text-sm hover:text-blue-800"
          >
            Yangilash
          </button>
        </div>

        {recentBookings.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Hozircha buyurtmalar yo'q</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    Mijoz
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    Mashina
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    Sana
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    Narx
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr
                    key={booking._id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-800">
                        {booking.user.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {booking.user.email}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-800">
                        {booking.car.brand} {booking.car.carModel}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-gray-800">
                        {new Date(booking.startDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        to {new Date(booking.endDate).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-800">
                        {booking.totalPrice.toLocaleString()} so'm
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          booking.status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : booking.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : booking.status === "completed"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {booking.status === "confirmed"
                          ? "Tasdiqlangan"
                          : booking.status === "pending"
                          ? "Kutilayapti"
                          : booking.status === "completed"
                          ? "Yakunlangan"
                          : booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ⚡ Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a
          href="/admin/cars"
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-6 flex items-center justify-between transition-colors"
        >
          <div className="text-left">
            <p className="text-sm opacity-90">Yangi Mashina</p>
            <p className="text-lg font-semibold">Qo'shish</p>
          </div>
          <Car className="w-8 h-8" />
        </a>

        <a
          href="/admin/bookings"
          className="bg-green-500 hover:bg-green-600 text-white rounded-lg p-6 flex items-center justify-between transition-colors"
        >
          <div className="text-left">
            <p className="text-sm opacity-90">Buyurtmalarni</p>
            <p className="text-lg font-semibold">Ko'rish</p>
          </div>
          <Calendar className="w-8 h-8" />
        </a>

        <a
          href="/admin/reports"
          className="bg-purple-500 hover:bg-purple-600 text-white rounded-lg p-6 flex items-center justify-between transition-colors"
        >
          <div className="text-left">
            <p className="text-sm opacity-90">Hisobot</p>
            <p className="text-lg font-semibold">Yaratish</p>
          </div>
          <BarChart3 className="w-8 h-8" />
        </a>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
