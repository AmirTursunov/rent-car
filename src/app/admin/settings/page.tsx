"use client";
import React, { useEffect, useState } from "react";

type Setting = {
  companyName: string;
  contactEmail: string;
  phone: string;
  address: string;
  currency: string;
  dateFormat: string;
  timezone: string;
  booking: {
    allowCancellationHours: number;
    defaultStatus: "pending" | "completed" | "cancelled";
  };
  ui: {
    theme: "light" | "dark" | "system";
    language: "uz" | "ru" | "en";
  };
  reports: {
    defaultRange: "month" | "week" | "custom";
  };
};

const defaultSetting: Setting = {
  companyName: "",
  contactEmail: "",
  phone: "",
  address: "",
  currency: "USD",
  dateFormat: "YYYY-MM-DD",
  timezone: "Asia/Tashkent",
  booking: {
    allowCancellationHours: 24,
    defaultStatus: "pending",
  },
  ui: {
    theme: "light",
    language: "uz",
  },
  reports: {
    defaultRange: "month",
  },
};

export default function AdminSettingsPage() {
  const [data, setData] = useState<Setting>(defaultSetting);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();
      if (!token) {
        setError("Token topilmadi");
        return;
      }
      const res = await fetch("/api/admin/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.message || "Ma'lumotni yuklab bo'lmadi");
      setData(json.data);
    } catch (e: any) {
      setError(e?.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const token = getToken();
      if (!token) {
        setError("Token topilmadi");
        return;
      }
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...data }),
      });
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.message || "Saqlashda xatolik");
      setSuccess("Sozlamalar muvaffaqiyatli saqlandi");
      setData(json.data);
    } catch (e: any) {
      setError(e?.message || "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sozlamalar</h1>
            <p className="text-gray-600 mt-1">Tizim sozlamalarini boshqarish</p>
          </div>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium">Xatolik</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium">Muvaffaqiyat</p>
            <p className="text-green-600 text-sm">{success}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Kompaniya ma'lumotlari
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Kompaniya nomi
              </label>
              <input
                type="text"
                value={data.companyName}
                onChange={(e) =>
                  setData({ ...data, companyName: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Masalan: FastCar Rent"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <input
                type="email"
                value={data.contactEmail}
                onChange={(e) =>
                  setData({ ...data, contactEmail: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="info@example.com"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Telefon
              </label>
              <input
                type="text"
                value={data.phone}
                onChange={(e) => setData({ ...data, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="+998 XX XXX XX XX"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-1">Manzil</label>
              <input
                type="text"
                value={data.address}
                onChange={(e) => setData({ ...data, address: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Toshkent shahri, ..."
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Umumiy</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Valyuta
              </label>
              <input
                type="text"
                value={data.currency}
                onChange={(e) => setData({ ...data, currency: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="USD, UZS, EUR"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Sana formati
              </label>
              <input
                type="text"
                value={data.dateFormat}
                onChange={(e) =>
                  setData({ ...data, dateFormat: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="YYYY-MM-DD"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Vaqt mintaqasi
              </label>
              <input
                type="text"
                value={data.timezone}
                onChange={(e) => setData({ ...data, timezone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Asia/Tashkent"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Buyurtmalar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Bekor qilishga ruxsat (soat)
              </label>
              <input
                type="number"
                min={0}
                value={data.booking.allowCancellationHours}
                onChange={(e) =>
                  setData({
                    ...data,
                    booking: {
                      ...data.booking,
                      allowCancellationHours: Number(e.target.value),
                    },
                  })
                }
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Default holat
              </label>
              <select
                value={data.booking.defaultStatus}
                onChange={(e) =>
                  setData({
                    ...data,
                    booking: {
                      ...data.booking,
                      defaultStatus: e.target
                        .value as Setting["booking"]["defaultStatus"],
                    },
                  })
                }
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="pending">Kutilmoqda</option>
                <option value="completed">Bajarilgan</option>
                <option value="cancelled">Bekor qilingan</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Interfeys</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Mavzu</label>
              <select
                value={data.ui.theme}
                onChange={(e) =>
                  setData({
                    ...data,
                    ui: {
                      ...data.ui,
                      theme: e.target.value as Setting["ui"]["theme"],
                    },
                  })
                }
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="light">Yorug‘</option>
                <option value="dark">Qorong‘u</option>
                <option value="system">Tizim bo‘yicha</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Til</label>
              <select
                value={data.ui.language}
                onChange={(e) =>
                  setData({
                    ...data,
                    ui: {
                      ...data.ui,
                      language: e.target.value as Setting["ui"]["language"],
                    },
                  })
                }
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="uz">O‘zbekcha</option>
                <option value="ru">Ruscha</option>
                <option value="en">Inglizcha</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Hisobotlar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Standart davr
              </label>
              <select
                value={data.reports.defaultRange}
                onChange={(e) =>
                  setData({
                    ...data,
                    reports: {
                      ...data.reports,
                      defaultRange: e.target
                        .value as Setting["reports"]["defaultRange"],
                    },
                  })
                }
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="month">Oy</option>
                <option value="week">Hafta</option>
                <option value="custom">Moslash</option>
              </select>
            </div>
          </div>
        </div>

        {loading && <div className="text-sm text-gray-600">Yuklanmoqda...</div>}
      </div>
    </div>
  );
}
