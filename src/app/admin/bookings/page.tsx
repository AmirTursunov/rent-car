"use client";
import React, { useState, useEffect } from "react";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  AlertCircle,
  RefreshCw,
  X,
} from "lucide-react";

interface Booking {
  _id: string;
  bookingNumber?: string;
  user: { name: string; email: string; phone?: string };
  car: { brand: string; carModel: string; year?: number; image?: string };
  startDate: string;
  endDate: string;
  totalPrice: number;
  depositAmount?: number;
  depositPercent?: number;
  paidAmount?: number;
  remainingAmount?: number;
  location?: string;
  passport?: { series?: string; number?: string };
  notes?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  paymentStatus?: "pending" | "deposit_paid" | "paid" | "refunded";
  createdAt?: string;
  updatedAt?: string;
}

const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();
      if (!token) {
        setError("Token topilmadi");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Yuklab bo'lmadi");
      const data = await response.json();

      if (data.success) {
        setBookings(data.data.bookings || []);
      } else {
        setError(data.message || "Server xatosi");
      }
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik");
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.message || "Yangilashda xatolik");
      }

      await fetchBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik");
    }
  };

  const formatSom = (value?: number) =>
    typeof value === "number" ? value.toLocaleString("ru-RU") : "—";

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700",
      confirmed: "bg-blue-100 text-blue-700",
      completed: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
    };
    const labels: Record<string, string> = {
      pending: "Kutilmoqda",
      confirmed: "Tasdiqlangan",
      completed: "Yakunlangan",
      cancelled: "Bekor qilingan",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          styles[status] || "bg-gray-100 text-gray-700"
        }`}
      >
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
          <div>
            <p className="text-red-800 font-medium">Xatolik</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center">
          <Calendar className="w-6 h-6 mr-2 text-blue-600" />
          Buyurtmalar
        </h2>

        <button
          onClick={fetchBookings}
          className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Yangilash</span>
        </button>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">Jami</p>
            <p className="text-2xl font-bold">{bookings.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">Kutilayotgan</p>
            <p className="text-2xl font-bold text-yellow-600">
              {bookings.filter((b) => b.status === "pending").length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">Tasdiqlangan</p>
            <p className="text-2xl font-bold text-blue-600">
              {bookings.filter((b) => b.status === "confirmed").length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">Yakunlangan</p>
            <p className="text-2xl font-bold text-green-600">
              {bookings.filter((b) => b.status === "completed").length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold">
                    Mijoz
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">
                    Mashina
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">
                    Sana
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">
                    Narx
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <p className="font-medium">{booking.user.name}</p>
                      <p className="text-sm text-gray-500">
                        {booking.user.email}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-medium">
                        {booking.car.brand} {booking.car.carModel}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <p>{new Date(booking.startDate).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-500">
                        to {new Date(booking.endDate).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-bold">
                        {booking.totalPrice.toLocaleString()} so'm
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        {booking.status === "pending" && (
                          <>
                            <button
                              onClick={() =>
                                updateBookingStatus(booking._id, "confirmed")
                              }
                              className="p-2 text-green-600 hover:bg-green-50 rounded"
                              title="Tasdiqlash"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() =>
                                updateBookingStatus(booking._id, "cancelled")
                              }
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                              title="Bekor qilish"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Ko'rish"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {bookings.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Buyurtmalar yo'q</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white  rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border shadow-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="text-lg font-bold">
                  Buyurtma:{" "}
                  {selectedBooking.bookingNumber || selectedBooking._id}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedBooking.user.name} — {selectedBooking.user.email}
                </p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 rounded-full hover:bg-gray-100"
                title="Yopish"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-500">Mijoz</h4>
                  <p className="font-medium">{selectedBooking.user.name}</p>
                  <p className="text-sm text-gray-500">
                    {selectedBooking.user.email}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedBooking.user.phone || "—"}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-500">
                    Mashina
                  </h4>
                  <p className="font-medium">
                    {selectedBooking.car.brand} {selectedBooking.car.carModel}{" "}
                    {selectedBooking.car.year
                      ? `(${selectedBooking.car.year})`
                      : ""}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-500">Sana</h4>
                  <p className="font-medium">
                    {new Date(selectedBooking.startDate).toLocaleDateString()} —{" "}
                    {new Date(selectedBooking.endDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-500">
                    Joylashuv
                  </h4>
                  <p className="font-medium">
                    {selectedBooking.location || "—"}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-500">
                    Passport
                  </h4>
                  <p className="font-medium">
                    {selectedBooking.passport?.series || "—"}{" "}
                    {selectedBooking.passport?.number || ""}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-500">
                    Telefon
                  </h4>
                  <p className="font-medium">
                    {selectedBooking.user.phone || "—"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Jami narx</p>
                  <p className="text-xl font-bold">
                    {formatSom(selectedBooking.totalPrice)} so'm
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">
                    Depozit ({selectedBooking.depositPercent ?? "—"}%)
                  </p>
                  <p className="text-xl font-bold">
                    {formatSom(selectedBooking.depositAmount)} so'm
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">To'langan</p>
                  <p className="text-xl font-bold">
                    {formatSom(selectedBooking.paidAmount)} so'm
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-500">
                  To'lov holati va status
                </h4>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-gray-100 text-sm">
                    {selectedBooking.paymentStatus || "—"}
                  </span>
                  {getStatusBadge(selectedBooking.status)}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-500">
                  Qo'shimcha ma'lumot
                </h4>
                <p className="text-sm text-gray-600">
                  {selectedBooking.notes || "Izoh yo'q"}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-500">
                  <p>
                    Yaratildi:{" "}
                    {selectedBooking.createdAt
                      ? new Date(selectedBooking.createdAt).toLocaleString()
                      : "—"}
                  </p>
                  <p>
                    ID: <span className="font-mono">{selectedBooking._id}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {selectedBooking.status === "pending" && (
                    <>
                      <button
                        onClick={async () => {
                          await updateBookingStatus(
                            selectedBooking._id,
                            "confirmed"
                          );
                          setSelectedBooking(null);
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg"
                      >
                        Tasdiqlash
                      </button>
                      <button
                        onClick={async () => {
                          await updateBookingStatus(
                            selectedBooking._id,
                            "cancelled"
                          );
                          setSelectedBooking(null);
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg"
                      >
                        Bekor qilish
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="px-4 py-2 bg-gray-100 rounded-lg"
                  >
                    Yopish
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
