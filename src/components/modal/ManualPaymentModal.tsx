// components/ManualPaymentModal.tsx
"use client";
import React, { useState } from "react";
import {
  X,
  CreditCard,
  Copy,
  Check,
  Upload,
  AlertCircle,
  Info,
  User,
  Calendar,
  Building2,
} from "lucide-react";

interface ManualPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  amount: number;
  onSuccess: () => void;
}

const ManualPaymentModal = ({
  isOpen,
  onClose,
  bookingId,
  amount,
  onSuccess,
}: ManualPaymentModalProps) => {
  const [paymentMethod, setPaymentMethod] = useState<"uzcard" | "humo" | null>(
    null
  );
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [senderInfo, setSenderInfo] = useState({
    cardNumber: "",
    cardHolder: "",
    transactionDate: "",
    transactionId: "",
  });

  const formatSom = (value: number) =>
    new Intl.NumberFormat("uz-UZ").format(value);

  // Firma kartalar ma'lumotlari
  const companyCards = {
    uzcard: {
      number: "8600 1234 5678 9012",
      holder: "RENT CAR COMPANY",
      bank: "Xalq Banki",
      icon: "💳",
    },
    humo: {
      number: "9860 9876 5432 1098",
      holder: "RENT CAR COMPANY",
      bank: "Agrobank",
      icon: "💳",
    },
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text.replace(/\s/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshot(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!paymentMethod || !screenshot) {
        setError("Barcha maydonlarni to'ldiring");
        return;
      }

      if (!senderInfo.cardNumber || !senderInfo.cardHolder) {
        setError("Karta ma'lumotlarini kiriting");
        return;
      }

      const token =
        typeof window !== "undefined" ? localStorage.getItem("user") : null;

      // FormData yaratish
      const formData = new FormData();
      formData.append("bookingId", bookingId);
      formData.append("paymentMethod", paymentMethod);
      formData.append("amount", amount.toString());
      formData.append("screenshot", screenshot);
      formData.append("senderCardNumber", senderInfo.cardNumber);
      formData.append("senderCardHolder", senderInfo.cardHolder);
      formData.append("transactionDate", senderInfo.transactionDate);
      formData.append("transactionId", senderInfo.transactionId);
      formData.append("receiverCardNumber", companyCards[paymentMethod].number);

      const response = await fetch("/api/payments/manual", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
      } else {
        setError(data.message || "Xatolik yuz berdi");
      }
    } catch (err) {
      setError("Server bilan aloqa xatosi");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl max-w-3xl w-full my-8 border border-yellow-400/30 shadow-[0_0_50px_rgba(251,191,36,0.3)] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 flex items-center justify-between rounded-t-3xl">
          <div>
            <h2 className="text-2xl font-bold text-black">
              Kartaga pul o'tkazish
            </h2>
            <p className="text-black/80">To'lov: {formatSom(amount)} so'm</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center transition-all"
          >
            <X className="w-6 h-6 text-black" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 font-medium">Xatolik</p>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Info Alert */}
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-300 space-y-1">
              <p className="font-semibold">Qanday to'lash:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Quyidagi karta raqamini nusxalang</li>
                <li>O'z bankingizdagi ilovadan pul o'tkazing</li>
                <li>Chek rasmini yuklab yuborish</li>
                <li>Tasdiqlashni kuting (24 soat ichida)</li>
              </ol>
            </div>
          </div>

          {/* Step 1: Karta tanlash */}
          <div>
            <h3 className="text-lg font-bold text-yellow-400 mb-4">
              1. Kartani tanlang
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {(["uzcard", "humo"] as const).map((type) => {
                const card = companyCards[type];
                return (
                  <button
                    key={type}
                    onClick={() => setPaymentMethod(type)}
                    className={`p-6 rounded-2xl border-2 transition-all ${
                      paymentMethod === type
                        ? "border-yellow-400 bg-gradient-to-br from-yellow-400/10 to-orange-500/10 scale-105"
                        : "border-white/10 bg-white/5 hover:border-yellow-400/50"
                    }`}
                  >
                    <div className="text-4xl mb-3">{card.icon}</div>
                    <p className="text-lg font-bold text-white mb-1 uppercase">
                      {type}
                    </p>
                    <p className="text-xs text-gray-400">{card.bank}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Karta ma'lumotlari */}
          {paymentMethod && (
            <div className="animate-fadeIn ">
              <h3 className="text-lg font-bold text-yellow-400 mb-4">
                2. Ushbu kartaga pul o'tkazing
              </h3>
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs text-gray-400 mb-2">KARTA RAQAMI</p>
                    <p className="text-2xl font-mono font-bold text-white tracking-wider">
                      {companyCards[paymentMethod].number}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(companyCards[paymentMethod].number)
                    }
                    className="p-3 bg-yellow-400 hover:bg-yellow-500 text-black rounded-xl transition-all"
                    title="Nusxalash"
                  >
                    {copied ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400 mb-1">Karta egasi:</p>
                    <p className="text-white font-semibold">
                      {companyCards[paymentMethod].holder}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Bank:</p>
                    <p className="text-white font-semibold">
                      {companyCards[paymentMethod].bank}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">To'lanadigan summa:</span>
                    <span className="text-2xl font-bold text-yellow-400">
                      {formatSom(amount)} so'm
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: O'tkazma ma'lumotlari */}
          {paymentMethod && (
            <div className="animate-fadeIn">
              <h3 className="text-lg font-bold text-yellow-400 mb-4">
                3. O'tkazma ma'lumotlarini kiriting
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                    <CreditCard className="w-4 h-4 text-yellow-400" />
                    Sizning karta raqamingiz
                  </label>
                  <input
                    type="text"
                    value={senderInfo.cardNumber}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 16);
                      const formatted = value.replace(/(\d{4})/g, "$1 ").trim();
                      setSenderInfo({ ...senderInfo, cardNumber: formatted });
                    }}
                    placeholder="8600 1234 5678 9012"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-200 placeholder-gray-500 focus:border-yellow-400 outline-none"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                    <User className="w-4 h-4 text-yellow-400" />
                    Karta egasi (Ismingiz)
                  </label>
                  <input
                    type="text"
                    value={senderInfo.cardHolder}
                    onChange={(e) =>
                      setSenderInfo({
                        ...senderInfo,
                        cardHolder: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="ALISHER NAVOIY"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-200 placeholder-gray-500 focus:border-yellow-400 outline-none uppercase"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 text-yellow-400" />
                    O'tkazma sanasi
                  </label>
                  <input
                    type="datetime-local"
                    value={senderInfo.transactionDate}
                    onChange={(e) =>
                      setSenderInfo({
                        ...senderInfo,
                        transactionDate: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-200 focus:border-yellow-400 outline-none"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                    <Building2 className="w-4 h-4 text-yellow-400" />
                    Tranzaksiya ID (ixtiyoriy)
                  </label>
                  <input
                    type="text"
                    value={senderInfo.transactionId}
                    onChange={(e) =>
                      setSenderInfo({
                        ...senderInfo,
                        transactionId: e.target.value,
                      })
                    }
                    placeholder="TXN123456789"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-200 placeholder-gray-500 focus:border-yellow-400 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Screenshot yuklash */}
          {paymentMethod && (
            <div className="animate-fadeIn">
              <h3 className="text-lg font-bold text-yellow-400 mb-4">
                4. Chek rasmini yuklang
              </h3>

              {!screenshotPreview ? (
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshotUpload}
                    className="hidden"
                  />
                  <div className="border-2 border-dashed border-yellow-400/50 rounded-2xl p-12 text-center cursor-pointer hover:border-yellow-400 hover:bg-yellow-400/5 transition-all">
                    <Upload className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                    <p className="text-white font-semibold mb-2">
                      Chek rasmini yuklash uchun bosing
                    </p>
                    <p className="text-sm text-gray-400">
                      PNG, JPG yoki PDF (max 5MB)
                    </p>
                  </div>
                </label>
              ) : (
                <div className="relative">
                  <img
                    src={screenshotPreview}
                    alt="Screenshot"
                    className="w-full h-64 object-contain bg-black/20 rounded-2xl"
                  />
                  <button
                    onClick={() => {
                      setScreenshot(null);
                      setScreenshotPreview(null);
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          {paymentMethod && (
            <div className="pt-6 border-t border-white/10">
              <button
                onClick={handleSubmit}
                disabled={
                  loading ||
                  !screenshot ||
                  !senderInfo.cardNumber ||
                  !senderInfo.cardHolder
                }
                className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-lg rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Yuklanmoqda..." : "Tasdiqlash uchun yuborish"}
              </button>
              <p className="text-xs text-gray-400 text-center mt-3">
                * Admin 5-10 daqiqa ichida to'lovni tasdiqlaydi
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ManualPaymentModal;
