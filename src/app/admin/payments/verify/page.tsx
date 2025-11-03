"use client";
import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Eye,
  CreditCard,
  User,
  Calendar,
  DollarSign,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface Payment {
  _id: string;
  booking: {
    _id: string;
    bookingNumber: string;
  };
  user: {
    name: string;
    email: string;
  };
  amount: number;
  status: string;
  transactionId: string;
  providerData: {
    senderCardNumber: string;
    senderCardHolder: string;
    receiverCardNumber: string;
    transactionDate: string;
    screenshotUrl: string;
  };
  createdAt: string;
}

const AdminPaymentVerification = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const formatSom = (value: number) =>
    new Intl.NumberFormat("uz-UZ").format(value);

  const fetchPendingPayments = async () => {
    try {
      setLoading(true);
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const response = await fetch("/api/admin/payments/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setPayments(data.data.payments || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (paymentId: string, approved: boolean) => {
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const response = await fetch(`/api/admin/payments/verify/${paymentId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ approved }),
      });

      const data = await response.json();
      if (data.success) {
        fetchPendingPayments();
        setSelectedPayment(null);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-yellow-400 mb-2">
              To'lovlarni Tasdiqlash
            </h1>
            <p className="text-gray-400">Kutilayotgan manual to'lovlar</p>
          </div>
          <button
            onClick={fetchPendingPayments}
            className="flex items-center gap-2 px-6 py-3 bg-yellow-400 text-black font-semibold rounded-xl hover:bg-yellow-500 transition-all"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            Yangilash
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Kutilmoqda</p>
                <p className="text-3xl font-bold text-yellow-400">
                  {payments.length}
                </p>
              </div>
              <AlertCircle className="w-12 h-12 text-yellow-400" />
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Jami summa</p>
                <p className="text-3xl font-bold text-green-400">
                  {formatSom(payments.reduce((sum, p) => sum + p.amount, 0))}{" "}
                  so'm
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-green-400" />
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Bugun</p>
                <p className="text-3xl font-bold text-blue-400">
                  {
                    payments.filter((p) => {
                      const today = new Date().toDateString();
                      return new Date(p.createdAt).toDateString() === today;
                    }).length
                  }
                </p>
              </div>
              <Calendar className="w-12 h-12 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Payments List */}
        {loading && payments.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mx-auto"></div>
            <p className="text-gray-400 mt-4">Yuklanmoqda...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
            <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-4" />
            <p className="text-2xl font-bold text-gray-300 mb-2">
              Hammasi tasdiqlangan!
            </p>
            <p className="text-gray-500">
              Hozircha kutilayotgan to'lovlar yo'q
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {payments.map((payment) => (
              <div
                key={payment._id}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-yellow-400/50 transition-all"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left - Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-yellow-400 mb-1">
                          {formatSom(payment.amount)} so'm
                        </h3>
                        <p className="text-sm text-gray-400">
                          ID: {payment.transactionId}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-yellow-400/20 text-yellow-400 rounded-full text-xs font-semibold border border-yellow-400/30">
                        Kutilmoqda
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-400">Mijoz</p>
                          <p className="text-sm font-semibold text-white">
                            {payment.user.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {payment.user.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <CreditCard className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-400">
                            Yuboruvchi karta
                          </p>
                          <p className="text-sm font-semibold text-white">
                            {payment.providerData.senderCardNumber}
                          </p>
                          <p className="text-xs text-gray-500">
                            {payment.providerData.senderCardHolder}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <CreditCard className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-400">
                            Qabul qiluvchi karta
                          </p>
                          <p className="text-sm font-semibold text-white">
                            {payment.providerData.receiverCardNumber}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-400">
                            O'tkazma sanasi
                          </p>
                          <p className="text-sm font-semibold text-white">
                            {new Date(
                              payment.providerData.transactionDate
                            ).toLocaleString("uz-UZ")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right - Screenshot & Actions */}
                  <div className="lg:w-80 space-y-4">
                    <div className="bg-black/20 rounded-xl overflow-hidden">
                      <img
                        src={payment.providerData.screenshotUrl}
                        alt="Chek"
                        className="w-full h-48 object-contain cursor-pointer"
                        onClick={() =>
                          window.open(
                            payment.providerData.screenshotUrl,
                            "_blank"
                          )
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleVerify(payment._id, true)}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Tasdiqlash
                      </button>
                      <button
                        onClick={() => handleVerify(payment._id, false)}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all"
                      >
                        <XCircle className="w-5 h-5" />
                        Rad etish
                      </button>
                    </div>

                    <button
                      onClick={() => setSelectedPayment(payment)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all"
                    >
                      <Eye className="w-4 h-4" />
                      Batafsil
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPaymentVerification;
