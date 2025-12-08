"use client";
import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Download,
  RefreshCw,
  AlertCircle,
  Car,
  Users,
  FileText,
  BarChart3,
} from "lucide-react";

interface ReportData {
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  bookings: {
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
  };
  cars: {
    total: number;
    available: number;
    rented: number;
    maintenance: number;
  };
  users: {
    total: number;
    new: number;
    active: number;
  };
  topCars: Array<{
    car: string;
    bookings: number;
    revenue: number;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    bookings: number;
  }>;
}

const AdminReportsPage = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });

      const response = await fetch(`/api/admin/reports?${params}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Response error:", errorText);
        throw new Error(`Ma'lumot yuklab bo'lmadi: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        setReportData(data.data);
      } else {
        throw new Error(data.message || "Ma'lumot topilmadi");
      }
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setError(err instanceof Error ? err.message : "Xatolik");
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (format: "pdf" | "excel") => {
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        format,
      });

      const response = await fetch(`/api/admin/reports/download?${params}`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Yuklab bo'lmadi");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hisobot-${dateRange.startDate}-${dateRange.endDate}.${
        format === "pdf" ? "pdf" : "xlsx"
      }`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik");
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  if (loading && !reportData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Hisobot yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hisobotlar</h1>
            <p className="text-gray-600 mt-1">Statistika va analitika</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchReport}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              Yangilash
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">Xatolik</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 text-sm underline ml-4"
            >
              Yopish
            </button>
          </div>
        )}

        {/* Date Range Filter */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4 flex-wrap">
            <Calendar className="w-5 h-5 text-gray-600" />
            <div className="flex items-center gap-4 flex-wrap flex-1">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 font-medium">
                  Dan:
                </label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, startDate: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 font-medium">
                  Gacha:
                </label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, endDate: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <button
                onClick={fetchReport}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? "Yuklanmoqda..." : "Qo'llash"}
              </button>
            </div>
          </div>
        </div>

        {/* Ma'lumot yo'q xabari */}
        {!reportData && !loading && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              Hisobot ma'lumotlari topilmadi
            </p>
            <button
              onClick={fetchReport}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Qayta yuklash
            </button>
          </div>
        )}

        {reportData && (
          <>
            {/* Revenue Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600 font-medium">
                    Jami daromad
                  </p>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {reportData.revenue.total.toLocaleString()} so'm
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">
                    {reportData.revenue.growth > 0 ? "+" : ""}
                    {reportData.revenue.growth}%
                  </span>
                  <span className="text-xs text-gray-500">bu oy</span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600 font-medium">
                    Buyurtmalar
                  </p>
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {reportData.bookings.total}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  ✅ {reportData.bookings.completed} bajarilgan
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600 font-medium">
                    Mashinalar
                  </p>
                  <Car className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {reportData.cars.total}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  ✅ {reportData.cars.available} mavjud
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600 font-medium">
                    Foydalanuvchilar
                  </p>
                  <Users className="w-8 h-8 text-orange-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {reportData.users.total}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  🆕 {reportData.users.new} yangi
                </p>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Revenue Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Oylik daromad
                </h3>
                {reportData.monthlyRevenue.length > 0 ? (
                  <div className="space-y-3">
                    {reportData.monthlyRevenue.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-sm text-gray-600 w-20 font-medium">
                            {item.month}
                          </span>
                          <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                            <div
                              className="bg-blue-600 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                              style={{
                                width: `${Math.max(
                                  10,
                                  (item.revenue /
                                    Math.max(
                                      ...reportData.monthlyRevenue.map(
                                        (m) => m.revenue
                                      )
                                    )) *
                                    100
                                )}%`,
                              }}
                            >
                              <span className="text-xs text-white font-medium">
                                {item.bookings}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-32 text-right">
                          {item.revenue.toLocaleString()} so'm
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Ma'lumot yo'q
                  </p>
                )}
              </div>

              {/* Top Cars */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Car className="w-5 h-5 text-purple-600" />
                  Top mashinalar
                </h3>
                {reportData.topCars.length > 0 ? (
                  <div className="space-y-4">
                    {reportData.topCars.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-bold text-sm">
                              #{index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {item.car}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.bookings} buyurtma
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-green-600">
                          {item.revenue.toLocaleString()} so'm
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Ma'lumot yo'q
                  </p>
                )}
              </div>
            </div>

            {/* Booking Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Buyurtmalar holati
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm text-blue-600 font-medium mb-1">Jami</p>
                  <p className="text-3xl font-bold text-blue-700">
                    {reportData.bookings.total}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                  <p className="text-sm text-green-600 font-medium mb-1">
                    Bajarilgan
                  </p>
                  <p className="text-3xl font-bold text-green-700">
                    {reportData.bookings.completed}
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                  <p className="text-sm text-yellow-600 font-medium mb-1">
                    Kutilmoqda
                  </p>
                  <p className="text-3xl font-bold text-yellow-700">
                    {reportData.bookings.pending}
                  </p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                  <p className="text-sm text-red-600 font-medium mb-1">
                    Bekor qilingan
                  </p>
                  <p className="text-3xl font-bold text-red-700">
                    {reportData.bookings.cancelled}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminReportsPage;
