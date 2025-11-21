"use client";
import { useState, useEffect } from "react";
import {
  DollarSign,
  RefreshCw,
  AlertCircle,
  Eye,
  CheckCircle,
  Clock,
  Search,
  X,
  Trash,
} from "lucide-react";
import { PaymentSkeleton } from "./payment-skeleton";

interface Payment {
  _id: string;
  booking?: string;
  amount: number;
  paymentMethod: string;
  status: string;
  transactionId: string;
  createdAt: string;
  user: { _id?: string; name: string; email: string };
  paymentProvider?: string;
  providerData?: {
    senderCardNumber?: string;
    senderCardHolder?: string;
    receiverCardNumber?: string;
    transactionDate?: string;
    transactionId?: string;
    screenshotUrl?: string;
  };
}

const AdminPaymentsPage = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [viewPayment, setViewPayment] = useState<Payment | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [rejectModal, setRejectModal] = useState<{
    isOpen: boolean;
    paymentId: string | null;
    paymentDetails: Payment | null;
  }>({
    isOpen: false,
    paymentId: null,
    paymentDetails: null,
  });
  const [rejectReason, setRejectReason] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 20;

  // Fetch all payments
  const fetchPayments = async (
    pageNum = 1,
    search = "",
    status = "all",
    method = "all"
  ) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: ITEMS_PER_PAGE.toString(),
      });

      // Faqat bo'sh bo'lmasa qo'shish
      if (search) params.append("search", search);
      if (status && status !== "all") params.append("status", status);
      if (method && method !== "all") params.append("method", method);

      const res = await fetch(`/api/payments?${params.toString()}`, {
        method: "GET",
        credentials: "include", // ✅ Cookie yuboradi
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || `Server xatosi: ${res.status}`);
      }

      const data = await res.json();

      if (data.success) {
        // ✅ API structure'ga moslashgan
        const fetchedPayments = data.data?.payments || data.data || [];
        setPayments(fetchedPayments);
        setHasMore(data.data?.hasMore || false);
        setPage(pageNum);
      } else {
        throw new Error(data.message || "Ma'lumotlarni yuklashda xatolik");
      }
    } catch (err) {
      console.error("Fetch payments error:", err);
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const updateSinglePayment = (
    paymentId: string,
    updates: Partial<Payment>
  ) => {
    setPayments((prev) =>
      prev.map((p) => (p._id === paymentId ? { ...p, ...updates } : p))
    );
    if (viewPayment?._id === paymentId) {
      setViewPayment({ ...viewPayment, ...updates });
    }
  };

  const handleDelete = async (paymentId: string) => {
    if (!confirm("Bu to'lovni o'chirishni istaysizmi?")) return;

    try {
      setActionLoadingId(paymentId);

      const res = await fetch(`/api/payments/${paymentId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(
          data?.message || "To'lovni o'chirishda xatolik yuz berdi"
        );
      }

      setPayments((prev) => prev.filter((p) => p._id !== paymentId));

      if (viewPayment?._id === paymentId) {
        setViewPayment(null);
      }
    } catch (err) {
      console.error("Delete payment error:", err);
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPayments(page, searchTerm, statusFilter, methodFilter);
    setIsRefreshing(false);
  };

  // Initial fetch
  useEffect(() => {
    fetchPayments(1, searchTerm, statusFilter, methodFilter);
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        fetchPayments(1, searchTerm, statusFilter, methodFilter);
      } else {
        setPage(1);
        fetchPayments(1, searchTerm, statusFilter, methodFilter);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, methodFilter]);

  const handleVerify = async (
    paymentId: string,
    approved: boolean,
    reason?: string
  ) => {
    try {
      setActionLoadingId(paymentId);

      const res = await fetch(`/api/payments/verify/${paymentId}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ approved, reason }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Amalni bajarib bo'lmadi");
      }

      // ✅ Status yangilash
      updateSinglePayment(paymentId, {
        status: approved ? "completed" : "failed",
      });

      setRejectModal({ isOpen: false, paymentId: null, paymentDetails: null });
      setRejectReason("");

      if (viewPayment?._id === paymentId) {
        setViewPayment(null);
      }
    } catch (e) {
      console.error("Verify payment error:", e);
      setError(e instanceof Error ? e.message : "Xatolik yuz berdi");
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; label: string }> =
      {
        pending: {
          bg: "bg-yellow-100",
          text: "text-yellow-700",
          label: "Kutilmoqda",
        },
        processing: {
          bg: "bg-blue-100",
          text: "text-blue-700",
          label: "Jarayonda",
        },
        completed: {
          bg: "bg-green-100",
          text: "text-green-700",
          label: "To'langan",
        },
        failed: {
          bg: "bg-red-100",
          text: "text-red-700",
          label: "Muvaffaqiyatsiz",
        },
        cancelled: {
          bg: "bg-gray-100",
          text: "text-gray-700",
          label: "Bekor qilingan",
        },
        refunded: {
          bg: "bg-orange-100",
          text: "text-orange-700",
          label: "Qaytarilgan",
        },
      };

    const cfg = config[status] || {
      bg: "bg-gray-100",
      text: "text-gray-700",
      label: status,
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}
      >
        {cfg.label}
      </span>
    );
  };

  const canTakeAction = (status: string) => {
    return status === "pending" || status === "processing";
  };

  const totalAmount = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);

  if (loading && payments.length === 0) return <PaymentSkeleton />;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">To'lovlar</h1>
            <p className="text-gray-600 mt-1">Barcha to'lovlarni boshqarish</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {isRefreshing ? "Yangilanyapti..." : "Yangilash"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">Xatolik</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Jami to'lovlar</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {payments.length}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">To'langan summa (so'm)</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {totalAmount.toLocaleString()}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Kutilayotgan (so'm)</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {pendingAmount.toLocaleString()}
                </p>
              </div>
              <Clock className="w-10 h-10 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Qidiruv (ID, ism, email)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Barcha statuslar</option>
              <option value="pending">Kutilmoqda</option>
              <option value="processing">Jarayonda</option>
              <option value="completed">To'langan</option>
              <option value="failed">Muvaffaqiyatsiz</option>
              <option value="cancelled">Bekor qilingan</option>
              <option value="refunded">Qaytarilgan</option>
            </select>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Barcha usullar</option>
              <option value="card">Karta</option>
              <option value="cash">Naqd</option>
              <option value="transfer">O'tkazma</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {payments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {loading ? "Yuklanmoqda..." : "To'lovlar topilmadi"}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Foydalanuvchi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Summa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usul
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sana
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amallar
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {p.transactionId}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {p.user?.name || "—"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {p.user?.email || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {p.amount.toLocaleString()} so'm
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                        {p.paymentMethod}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(p.status)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(p.createdAt).toLocaleDateString("uz-UZ")}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setViewPayment(p)}
                            className="text-blue-600 hover:text-blue-800 transition"
                            title="Ko'rish"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          {/* {canTakeAction(p.status) && (
                            <>
                              <button
                                onClick={() => handleVerify(p._id, true)}
                                disabled={actionLoadingId === p._id}
                                className="px-3 py-1 text-sm rounded bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 transition"
                                title="Tasdiqlash"
                              >
                                {actionLoadingId === p._id
                                  ? "..."
                                  : "Tasdiqlash"}
                              </button>
                              <button
                                onClick={() =>
                                  setRejectModal({
                                    isOpen: true,
                                    paymentId: p._id,
                                    paymentDetails: p,
                                  })
                                }
                                disabled={actionLoadingId === p._id}
                                className="px-3 py-1 text-sm rounded bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 transition"
                                title="Rad etish"
                              >
                                {actionLoadingId === p._id
                                  ? "..."
                                  : "Rad etish"}
                              </button>
                            </>
                          )}
                          {!canTakeAction(p.status) && (
                            <span className="text-xs text-gray-400 italic">
                              Amal bajarilgan
                            </span>
                          )} */}
                          <button
                            onClick={() => handleDelete(p._id)}
                            disabled={actionLoadingId === p._id}
                            className="text-red-600 hover:text-red-800 transition disabled:opacity-50"
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
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {viewPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
              <div>
                <h3 className="text-lg font-semibold">To'lov tafsilotlari</h3>
                <p className="text-sm text-gray-500">
                  ID: {viewPayment.transactionId}
                </p>
              </div>
              <button
                onClick={() => setViewPayment(null)}
                className="p-2 hover:bg-gray-100 rounded transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-auto">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Foydalanuvchi:</span>{" "}
                  {viewPayment.user.name}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Email:</span>{" "}
                  {viewPayment.user.email}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Summa:</span>{" "}
                  {viewPayment.amount.toLocaleString()} UZS
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Usul:</span>{" "}
                  {viewPayment.paymentMethod}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Status:</span>{" "}
                  {getStatusBadge(viewPayment.status)}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Yaratilgan:</span>{" "}
                  {new Date(viewPayment.createdAt).toLocaleString("uz-UZ")}
                </p>
              </div>

              {viewPayment.providerData && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Jo'natuvchi karta:</span>{" "}
                    {viewPayment.providerData.senderCardNumber}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Karta egasi:</span>{" "}
                    {viewPayment.providerData.senderCardHolder}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Qabul qiluvchi karta:</span>{" "}
                    {viewPayment.providerData.receiverCardNumber}
                  </p>
                  {viewPayment.providerData.transactionDate && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Tranzaksiya vaqti:</span>{" "}
                      {new Date(
                        viewPayment.providerData.transactionDate
                      ).toLocaleString("uz-UZ")}
                    </p>
                  )}
                  {viewPayment.providerData.transactionId && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Tranzaksiya ID:</span>{" "}
                      {viewPayment.providerData.transactionId}
                    </p>
                  )}
                </div>
              )}

              {viewPayment.providerData?.screenshotUrl && (
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    To'lov cheki:
                  </p>
                  <img
                    src={viewPayment.providerData.screenshotUrl}
                    alt="Payment screenshot"
                    className="w-full rounded-lg border shadow-sm"
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t flex items-center justify-end gap-3 flex-shrink-0">
              <button
                onClick={() => setViewPayment(null)}
                className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              >
                Yopish
              </button>
              {canTakeAction(viewPayment.status) && (
                <>
                  <button
                    onClick={() => handleVerify(viewPayment._id, true)}
                    disabled={actionLoadingId === viewPayment._id}
                    className="px-4 py-2  rounded bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 transition"
                    title="Tasdiqlash"
                  >
                    {actionLoadingId === viewPayment._id
                      ? "Tasdiqlanmoqda..."
                      : "Tasdiqlash"}
                  </button>
                  <button
                    onClick={() =>
                      setRejectModal({
                        isOpen: true,
                        paymentId: viewPayment._id,
                        paymentDetails: viewPayment,
                      })
                    }
                    disabled={actionLoadingId === viewPayment._id}
                    className="px-4 py-2 rounded bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 transition"
                    title="Rad etish"
                  >
                    {actionLoadingId === viewPayment._id
                      ? "Biroz kuting..."
                      : "Rad etish"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.isOpen && rejectModal.paymentDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
            <button
              onClick={() =>
                setRejectModal({
                  isOpen: false,
                  paymentId: null,
                  paymentDetails: null,
                })
              }
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-900 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">To'lovni rad etish</h2>
            <p className="text-gray-600 mb-3">
              Rad etish sababi kiriting (ixtiyoriy):
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Sabab..."
              rows={4}
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setRejectModal({
                    isOpen: false,
                    paymentId: null,
                    paymentDetails: null,
                  });
                  setRejectReason("");
                }}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              >
                Bekor qilish
              </button>
              <button
                onClick={() => {
                  if (rejectModal.paymentId) {
                    handleVerify(rejectModal.paymentId, false, rejectReason);
                  }
                }}
                disabled={actionLoadingId === rejectModal.paymentId}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
              >
                {actionLoadingId === rejectModal.paymentId
                  ? "Yuklanmoqda..."
                  : "Rad etish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentsPage;
