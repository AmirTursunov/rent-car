"use client";
import React, { useState, useEffect } from "react";
import {
  DollarSign,
  RefreshCw,
  AlertCircle,
  Eye,
  CheckCircle,
  Clock,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Payment {
  _id: string;
  booking: string;
  amount: number;
  paymentMethod: string;
  status: string;
  transactionId: string;
  createdAt: string;
  user: { name: string; email: string };
}

const AdminPaymentsPage = () => {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");

  const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();

      if (!token) {
        setError("Token topilmadi");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/payments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Yuklab bo‘lmadi");

      const data = await res.json();
      if (data.success) setPayments(data.data.payments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

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

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const matchesMethod =
      methodFilter === "all" || p.paymentMethod === methodFilter;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  const totalAmount = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">To‘lovlar</h1>
            <p className="text-gray-600 mt-1">Barcha to‘lovlarni boshqarish</p>
          </div>
          <button
            onClick={fetchPayments}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Yangilash
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
              className="text-red-500 text-sm underline ml-4"
            >
              Yopish
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Jami to‘lovlar</p>
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
                <p className="text-sm text-gray-600">To‘langan summa</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  ${totalAmount.toLocaleString()}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Kutilayotgan</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  ${pendingAmount.toLocaleString()}
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
              <option value="completed">To‘langan</option>
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
              <option value="transfer">O‘tkazma</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {filteredPayments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">To‘lovlar topilmadi</p>
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
                  {filteredPayments.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {p.transactionId}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {p.user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {p.user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {p.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                        {p.paymentMethod}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(p.status)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(p.createdAt).toLocaleDateString("uz-UZ")}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button className="text-blue-600 hover:text-blue-800 transition">
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPaymentsPage;
