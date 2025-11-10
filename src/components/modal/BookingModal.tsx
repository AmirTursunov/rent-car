"use client";
import React, { useEffect, useState } from "react";
import ManualPaymentModal from "./ManualPaymentModal";
import {
  X,
  Calendar,
  FileText,
  CheckCircle,
  AlertCircle,
  Phone,
  MapPin,
  DollarSign,
  Info,
  Clock,
} from "lucide-react";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  car: {
    _id: string;
    brand: string;
    model: string;
    pricePerDay: number;
    image: string;
  };
}

const BookingModal = ({ isOpen, onClose, car }: BookingModalProps) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [awaitingApproval, setAwaitingApproval] = useState(false);
  const [existingBookingWarning, setExistingBookingWarning] = useState(false);

  const [bookingData, setBookingData] = useState({
    startDate: "",
    endDate: "",
    location: "",
    passportSeries: "",
    passportNumber: "",
    phoneNumber: "",
    notes: "",
  });

  const formatSom = (value: number) =>
    new Intl.NumberFormat("uz-UZ").format(value);

  const calculateDays = () => {
    if (!bookingData.startDate || !bookingData.endDate) return 0;
    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    const days = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    return days > 0 ? days : 0;
  };

  const calculateTotalPrice = () => {
    const days = calculateDays();
    return days * car.pricePerDay;
  };

  const calculateDepositPercent = () => {
    const totalPrice = calculateTotalPrice();
    if (totalPrice <= 700000) {
      return 20;
    } else {
      return 15;
    }
  };

  const calculateDeposit = () => {
    const totalPrice = calculateTotalPrice();
    const percent = calculateDepositPercent();
    return (totalPrice * percent) / 100;
  };

  const handleSubmit = async (): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);

      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      if (!token) {
        setError("Tizimga kirish kerak");
        return null;
      }

      const payload = {
        car: car._id,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        location: bookingData.location,
        passportSeries: bookingData.passportSeries,
        passportNumber: bookingData.passportNumber,
        phoneNumber: bookingData.phoneNumber,
        notes: bookingData.notes,
        totalPrice: calculateTotalPrice(),
        depositAmount: calculateDeposit(),
        depositPercent: calculateDepositPercent(),
      };

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      console.log("POST /api/bookings response:", {
        status: response.status,
        data,
      });

      // 201 Created - yangi booking yaratildi
      if (response.status === 201 && data?.data?.booking?._id) {
        const id = data.data.booking._id;
        const booking = data.data.booking;

        setCreatedBookingId(id);

        // MUHIM: Backend "Depozit to'landi" deb javob bersa ham,
        // admin tasdiqlamaguncha step 2 da qolamiz
        console.log("Booking created, ID:", id, "Status:", booking.status);

        // Agar backend allaqachon approved deb belgilagan bo'lsa (bu kamdan-kam holat)
        if (
          booking.status === "approved" ||
          booking.paymentStatus === "approved"
        ) {
          return id; // Bu holda step 3 ga o'tishga ruxsat
        }

        // Aks holda, to'lov yuborilgandan keyin kutish holatida qolamiz
        return id;
      } // 200 OK - yangilangan booking
      if (response.ok && data?.success && data.data?.booking?._id) {
        const id = data.data.booking._id;
        setCreatedBookingId(id);
        return id;
      }

      // 409 Conflict - buyurtma allaqachon mavjud
      if (response.status === 409) {
        // Turli xil formatlarni tekshirish
        const existingId =
          data?.data?.booking?._id ||
          data?.data?.existingBookingId ||
          data?.existingBookingId ||
          data?.booking?._id ||
          null;

        console.log("409 Conflict detected, existing booking ID:", existingId);

        if (existingId) {
          setCreatedBookingId(existingId);
          // Agar to'lov allaqachon yuborilgan bo'lsa
          const bookingStatus =
            data?.data?.booking?.status || data?.booking?.status;
          if (
            bookingStatus === "pending" ||
            bookingStatus === "payment_submitted"
          ) {
            setAwaitingApproval(true);
            setStep(2);
          } else {
            // Foydalanuvchiga mavjud booking haqida ogohlantirish
            setExistingBookingWarning(true);
          }
          return existingId;
        }

        // ID topilmasa, xato ko'rsatish
        setError(
          "Siz uchun allaqachon faol buyurtma mavjud. Iltimos, avval uni tugating yoki bekor qiling."
        );
        return null;
      }

      setError(data?.message || "Buyurtma yaratishda xatolik");
      return null;
    } catch (err) {
      console.error("Booking submission error:", err);
      setError("Server bilan aloqa xatosi");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPayment = async () => {
    setError(null);
    if (loading || awaitingApproval) return;

    if (createdBookingId) {
      setShowPaymentModal(true);
      return;
    }

    const id = await handleSubmit();
    if (id) {
      setShowPaymentModal(true);
    }
  };

  const checkBookingStatus = async () => {
    if (!createdBookingId) return;
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) return;

      const res = await fetch(`/api/bookings/${createdBookingId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data?.data?.booking) {
        const b = data.data.booking;
        const approved =
          b.status === "approved" ||
          b.status === "confirmed" ||
          b.paid === true ||
          b.isPaid === true ||
          b.paymentStatus === "confirmed" ||
          b.paymentStatus === "paid" ||
          b.paymentStatus === "approved" ||
          b.paymentStatus === "deposit_paid"; // backend verify sets this

        if (approved) {
          setAwaitingApproval(false);
          setStep(3);
          setError(null);
        }
      }
    } catch (err) {
      // polling paytida xatoni UI’da ko‘rsatmaymiz
      console.error("Booking status check error:", err);
    }
  };

  // Avto-polling olib tashlandi — admin tasdiqlagach, user oynani yopib ochsa yoki keyinroq qaytsa step 3 ko'rinadi.

  if (!isOpen) return null;

  const days = calculateDays();
  const totalPrice = calculateTotalPrice();
  const depositPercent = calculateDepositPercent();
  const depositAmount = calculateDeposit();
  return (
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-yellow-400/30 shadow-[0_0_50px_rgba(251,191,36,0.3)]">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-yellow-400 to-orange-500 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-black">Band qilish</h2>
            <p className="text-black/80">
              {car.brand} {car.model}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center transition-all"
          >
            <X className="w-6 h-6 text-black" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-6 border-b border-yellow-400/20">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[
              { num: 1, label: "Ma'lumotlar" },
              { num: 2, label: "Depozit to'lovi" },
              { num: 3, label: "Tasdiqlash" },
            ].map((s, i) => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                      step >= s.num
                        ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-black"
                        : "bg-gray-700 text-gray-400"
                    }`}
                  >
                    {step > s.num ? <CheckCircle className="w-6 h-6" /> : s.num}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      step >= s.num ? "text-yellow-400" : "text-gray-500"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < 2 && (
                  <div
                    className={`flex-1 h-1 mx-4 rounded transition-all ${
                      step > s.num
                        ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                        : "bg-gray-700"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 font-medium">Xatolik</p>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          )}{" "}
          {/* Mavjud booking ogohlantirish */}
          {existingBookingWarning && (
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <div className="flex items-start gap-3 mb-3">
                <Info className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-400 font-medium">
                    Mavjud buyurtma topildi
                  </p>
                  <p className="text-yellow-300 text-sm mt-1">
                    Sizda bu mashina uchun allaqachon faol buyurtma mavjud.
                    Davom etish uchun quyidagi tugmani bosing.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setExistingBookingWarning(false);
                    setStep(2);
                  }}
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold rounded-lg hover:opacity-90 transition-all"
                >
                  Mavjud buyurtmani davom ettirish
                </button>
                <button
                  onClick={() => {
                    setExistingBookingWarning(false);
                    setCreatedBookingId(null);
                  }}
                  className="py-2 px-4 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all"
                >
                  Bekor qilish
                </button>
              </div>
            </div>
          )}
          {/* Step 1: Ma'lumotlar */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 text-yellow-400" />
                    Boshlanish sanasi
                  </label>
                  <input
                    type="date"
                    value={bookingData.startDate}
                    onChange={(e) =>
                      setBookingData({
                        ...bookingData,
                        startDate: e.target.value,
                      })
                    }
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-200 focus:border-yellow-400 outline-none"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 text-yellow-400" />
                    Tugash sanasi
                  </label>
                  <input
                    type="date"
                    value={bookingData.endDate}
                    onChange={(e) =>
                      setBookingData({
                        ...bookingData,
                        endDate: e.target.value,
                      })
                    }
                    min={
                      bookingData.startDate ||
                      new Date().toISOString().split("T")[0]
                    }
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-200 focus:border-yellow-400 outline-none"
                  />
                </div>{" "}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                    <MapPin className="w-4 h-4 text-yellow-400" />
                    Manzil (olish va qaytarish)
                  </label>
                  <input
                    type="text"
                    value={bookingData.location}
                    onChange={(e) =>
                      setBookingData({
                        ...bookingData,
                        location: e.target.value,
                      })
                    }
                    placeholder="Toshkent, Chilonzor tumani..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-200 placeholder-gray-500 focus:border-yellow-400 outline-none"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    * Mashina shu manzildan olinadi va qaytariladi
                  </p>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                    <FileText className="w-4 h-4 text-yellow-400" />
                    Passport seriya
                  </label>
                  <input
                    type="text"
                    value={bookingData.passportSeries}
                    onChange={(e) =>
                      setBookingData({
                        ...bookingData,
                        passportSeries: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="AB"
                    maxLength={2}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-200 placeholder-gray-500 focus:border-yellow-400 outline-none uppercase"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                    <FileText className="w-4 h-4 text-yellow-400" />
                    Passport raqam
                  </label>
                  <input
                    type="text"
                    value={bookingData.passportNumber}
                    onChange={(e) =>
                      setBookingData({
                        ...bookingData,
                        passportNumber: e.target.value,
                      })
                    }
                    placeholder="1234567"
                    maxLength={7}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-200 placeholder-gray-500 focus:border-yellow-400 outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                    <Phone className="w-4 h-4 text-yellow-400" />
                    Telefon raqam
                  </label>
                  <input
                    type="tel"
                    value={bookingData.phoneNumber}
                    onChange={(e) =>
                      setBookingData({
                        ...bookingData,
                        phoneNumber: e.target.value,
                      })
                    }
                    placeholder="+998 90 123 45 67"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-200 placeholder-gray-500 focus:border-yellow-400 outline-none"
                  />
                </div>{" "}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                    <FileText className="w-4 h-4 text-yellow-400" />
                    Qo'shimcha izoh (ixtiyoriy)
                  </label>
                  <textarea
                    value={bookingData.notes}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, notes: e.target.value })
                    }
                    rows={3}
                    placeholder="Qo'shimcha talablar yoki izohlar..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-200 placeholder-gray-500 focus:border-yellow-400 outline-none resize-none"
                  />
                </div>
              </div>

              {days > 0 && (
                <div className="bg-gradient-to-br from-yellow-400/10 to-orange-500/10 border border-yellow-400/30 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-yellow-400 mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Narxlar hisob-kitobi
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-300">
                      <span>
                        {formatSom(car.pricePerDay)} so'm x {days} kun
                      </span>
                      <span className="font-bold text-xl">
                        {formatSom(totalPrice)} so'm
                      </span>
                    </div>
                    <div className="border-t border-yellow-400/30 pt-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-300">
                          Depozit ({depositPercent}%)
                        </span>
                        <span className="font-bold text-xl text-orange-400">
                          {formatSom(depositAmount)} so'm
                        </span>
                      </div>
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mt-3">
                        <p className="text-sm text-blue-300 flex items-start gap-2">
                          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>
                            <strong>Hozir to'lanadigan:</strong> Faqat depozit{" "}
                            {formatSom(depositAmount)} so'm. Qolgan{" "}
                            {formatSom(totalPrice - depositAmount)} so'm mashina
                            olinganda to'lanadi.
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  if (
                    !bookingData.startDate ||
                    !bookingData.endDate ||
                    !bookingData.location ||
                    !bookingData.passportSeries ||
                    !bookingData.passportNumber ||
                    !bookingData.phoneNumber
                  ) {
                    setError("Barcha majburiy maydonlarni to'ldiring");
                    return;
                  }
                  if (days <= 0) {
                    setError("Sanalar noto'g'ri");
                    return;
                  }
                  setError(null);
                  setStep(2);
                }}
                className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-xl hover:opacity-90 transition-all"
              >
                Davom etish
              </button>
            </div>
          )}{" "}
          {/* Step 2: Depozit To'lovi */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-yellow-400/10 to-orange-500/10 border border-yellow-400/30 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-yellow-400 mb-6">
                  Depozit to'lovi
                </h3>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-300">
                    <span>Jami ijara narxi:</span>
                    <span className="font-bold text-lg">
                      {formatSom(totalPrice)} so'm
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Depozit ({depositPercent}%):</span>
                    <span className="font-bold text-lg text-orange-400">
                      {formatSom(depositAmount)} so'm
                    </span>
                  </div>
                  <div className="border-t border-yellow-400/30 pt-4">
                    <div className="flex justify-between text-2xl font-bold">
                      <span className="text-yellow-400">Hozir to'lanadi:</span>
                      <span className="text-yellow-400">
                        {formatSom(depositAmount)} so'm
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <p className="text-sm text-green-300 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      Depozit mashina qaytarilgandan keyin 24 soat ichida
                      qaytariladi
                    </p>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <p className="text-sm text-red-300 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      Agar belgilangan vaqtda mashina olinmasa, depozit
                      qaytarilmaydi
                    </p>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                    <p className="text-sm text-blue-300 flex items-start gap-2">
                      <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      Qolgan {formatSom(totalPrice - depositAmount)} so'm
                      mashina olinganda naqd to'lanadi
                    </p>
                  </div>
                </div>
                {!awaitingApproval && (
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setStep(1)}
                      className="py-3 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-600 transition-all"
                    >
                      Orqaga
                    </button>

                    <button
                      onClick={handleOpenPayment}
                      disabled={loading}
                      className="py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
                    >
                      {loading ? "Yuklanmoqda..." : "To'lov usulini tanlash"}
                    </button>
                  </div>
                )}{" "}
                {/* Kutish holati */}
                {awaitingApproval && (
                  <div className="mt-6 p-5 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border-2 border-yellow-400/50 rounded-xl">
                    <div className="flex items-start gap-3 mb-4">
                      <Clock className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1 animate-pulse" />
                      <div>
                        <h4 className="text-lg font-bold text-yellow-400 mb-2">
                          To'lov yuborildi
                        </h4>
                        <p className="text-sm text-gray-300 mb-3">
                          Chekingiz adminstratorga yuborildi. To'lov
                          tasdiqlanishi uchun 5-10 daqiqa kutish kerak.
                          Tasdiqlangach avtomatik ravishda keyingi qadamga
                          o'tasiz.
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-3 text-center">
                      * Agar to'lovda muammo bo'lsa, qo'llab-quvvatlash
                      xizmatiga murojaat qiling
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Step 3: Tasdiqlash */}
          {step === 3 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-green-400 mb-4">
                {awaitingApproval ? "Yuborildi!" : "Muvaffaqiyatli!"}
              </h3>
              {awaitingApproval ? (
                <p className="text-gray-300 text-lg mb-4">
                  To'lov ma'lumotlari muvaffaqiyatli yuborildi. Admin
                  tasdiqlashi uchun 5-10 daqiqa kuting.
                </p>
              ) : (
                <p className="text-gray-300 text-lg mb-4">
                  Depozit tasdiqlandi. Buyurtmangiz qabul qilindi.
                </p>
              )}
              <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-4 mb-8 max-w-md mx-auto">
                <p className="text-gray-300 text-sm leading-relaxed">
                  Tez orada sizga aloqaga chiqamiz. Mashina olish sanasi:{" "}
                  <strong className="text-yellow-400">
                    {new Date(bookingData.startDate).toLocaleDateString(
                      "uz-UZ"
                    )}
                  </strong>
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-xl hover:opacity-90 transition-all"
              >
                Yopish
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Payment Selection Modal */}
      {showPaymentModal && createdBookingId && (
        <ManualPaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
          }}
          bookingId={createdBookingId}
          amount={depositAmount}
          onSuccess={() => {
            setShowPaymentModal(false);
            setAwaitingApproval(true);
            setStep(3);
          }}
        />
      )}
    </div>
  );
};

export default BookingModal;
