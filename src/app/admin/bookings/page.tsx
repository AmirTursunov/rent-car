"use client";
import type React from "react";
import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  AlertCircle,
  RefreshCw,
  X,
  Trash,
} from "lucide-react";
import { BookingSkeleton } from "./booking-skeleton";

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
  status:
    | "pending"
    | "confirmed"
    | "completed"
    | "cancelled"
    | "need to be returned";
  paymentStatus?: "pending" | "deposit_paid" | "paid" | "refunded";
  createdAt?: string;
  updatedAt?: string;
}

const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      // ✅ Cookie avtomatik yuboriladi, credentials: "include" ishlatamiz
      const response = await fetch("/api/bookings", {
        method: "GET",
        credentials: "include", // Cookie yuborish uchun
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Ma'lumotlarni yuklab bo'lmadi");
      }

      const data = await response.json();

      if (data.success) {
        setBookings(data.data.bookings || []);
      } else {
        setError(data.message || "Server xatosi");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchBookings();
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      // Optimistic update
      setBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId ? { ...b, status: newStatus as any } : b
        )
      );

      // ✅ Cookie avtomatik yuboriladi
      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: "PUT",
        credentials: "include", // Cookie yuborish
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.message || "Yangilashda xatolik");
      }

      // Agar modal ochiq bo'lsa, uni ham yangilash
      if (selectedBooking?._id === bookingId) {
        setSelectedBooking((prev) =>
          prev ? { ...prev, status: newStatus as any } : null
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik");
      // Xatolik bo'lsa qayta yuklash
      fetchBookings();
    }
  };

  const deleteBooking = async (bookingId: string) => {
    if (!confirm("Bu buyurtmani o'chirmoqchimisiz?")) return;

    try {
      const deletedBooking = bookings.find((b) => b._id === bookingId);

      // Optimistic update
      setBookings((prev) => prev.filter((b) => b._id !== bookingId));
      if (selectedBooking?._id === bookingId) {
        setSelectedBooking(null);
      }

      // ✅ Cookie avtomatik yuboriladi
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
        credentials: "include", // Cookie yuborish
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);

        // Xatolik bo'lsa qaytarish
        setBookings((prev) => {
          const updated = [...prev];
          if (deletedBooking) {
            updated.push(deletedBooking);
          }
          return updated;
        });

        throw new Error(err?.message || "O'chirishda xatolik");
      }
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
      approved: "bg-blue-100 text-blue-700",
      completed: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
    };
    const labels: Record<string, string> = {
      pending: "Kutilmoqda",
      confirmed: "Tasdiqlangan",
      approved: "Tasdiqlangan",
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
    return <BookingSkeleton />;
  }

  return (
    <div className="space-y-6 p-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
          <div className="flex-1">
            <p className="text-red-800 font-medium">Xatolik</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center">
          <Calendar className="w-6 h-6 mr-2 text-blue-600" />
          Buyurtmalar
        </h2>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center space-x-2 disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          <span>{isRefreshing ? "Yangilanyapti..." : "Yangilash"}</span>
        </button>
      </div>

      <div className="space-y-6">
        {/* Stats */}
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

        {/* Warning */}
        <div
          className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4"
          role="alert"
        >
          <p className="font-bold">Diqqat!</p>
          <p>
            Iltimos buyurtmani qabul qilishdan oldin, to'lov qilinganligini
            tekshiring!
          </p>
        </div>

        {/* Table */}
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
                        {booking.car?.brand} {booking.car?.carModel}
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
                        {booking.status === "need to be returned" && (
                          <button
                            onClick={() =>
                              updateBookingStatus(booking._id, "completed")
                            }
                            className="p-2 text-green-600 hover:bg-green-50 rounded"
                            title="Tugatish"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Ko'rish"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => deleteBooking(booking._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="O'chirish"
                        >
                          <Trash className="w-5 h-5" />
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

      {/* Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border shadow-lg">
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
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
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
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Bekor qilish
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
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
