// app/cars/[id]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { redirect, useParams } from "next/navigation";
import BookingModal from "../../../components/modal/BookingModal";
import {
  MapPin,
  Users,
  Fuel,
  Settings,
  Shield,
  CheckCircle,
} from "lucide-react";

interface Car {
  _id: string;
  brand: string;
  model: string;
  carModel?: string;
  year: number;
  pricePerDay: number;
  images: string[];
  rating: number;
  category: string;
  fuelType: string;
  transmission: string;
  seats: number;
  available: boolean;
  location?: {
    city?: string;
  };
  features?: string[];
  description?: string;
}

export default function CarDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const formatSom = (value: number) =>
    new Intl.NumberFormat("uz-UZ").format(value);

  useEffect(() => {
    async function fetchCar() {
      try {
        setLoading(true);
        const res = await fetch(`/api/cars/${id}`);
        const json = await res.json();
        if (json.success) {
          setCar(json.data.car);
        } else {
          setError(json.message || "Mashina topilmadi");
        }
      } catch (err) {
        console.error("Error fetching car:", err);
        setError("Mashina yuklanmadi");
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      fetchCar();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center text-red-400">
          <p className="text-2xl font-bold mb-2">
            {error || "Mashina topilmadi"}
          </p>
          <a href="/cars" className="text-yellow-400 hover:underline">
            Orqaga qaytish
          </a>
        </div>
      </div>
    );
  }

  const cover = car.images?.[0] || "/window.svg";
  const displayModel = car.carModel || car.model || "";

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Back Button */}
        <a
          href="/cars"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-yellow-400 mb-6 transition-colors"
        >
          ← Orqaga qaytish
        </a>

        <div className="grid md:grid-cols-2 gap-12 ">
          {/* Left - Images */}
          <div>
            <div className="aspect-[16/10] bg-gray-800 rounded-2xl overflow-hidden border border-yellow-400/30 shadow-[0_0_30px_rgba(251,191,36,0.2)] max-w-full mr-4 sm:mr-0">
              <img
                src={cover}
                alt={`${car.brand} ${displayModel}`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            {car.images && car.images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {car.images.slice(0, 4).map((img: string, i: number) => (
                  <div
                    key={i}
                    className="aspect-video bg-gray-800 rounded-lg overflow-hidden border border-white/10 hover:border-yellow-400/50 cursor-pointer transition-all"
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Features */}
            {car.features && car.features.length > 0 && (
              <div className="mt-6 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-yellow-400 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Xususiyatlar
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {car.features.map((feature: string, i: number) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-gray-300 text-sm"
                    >
                      <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right - Details */}
          <div className="space-y-6 ">
            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-3 ">
                <span className="px-3 py-1 bg-yellow-400/20 text-yellow-400 rounded-full text-sm font-semibold border border-yellow-400/30">
                  {car.category}
                </span>
                {car.available && (
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold border border-green-400/30">
                    Mavjud
                  </span>
                )}
              </div>

              <h1 className="text-4xl font-bold text-yellow-400 mb-2">
                {car.brand} {displayModel}
              </h1>

              <div className="flex items-center gap-4 text-gray-300">
                {/* <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="font-semibold">
                    {car.rating?.toFixed(1) || "N/A"}
                  </span>
                </div> */}
                <span>•</span>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-400" />
                  <span>{car.location?.city || "Toshkent"}</span>
                </div>
                <span>•</span>
                <span>{car.year}-yil</span>
              </div>
            </div>

            {/* Specs */}
            <div className="grid grid-cols-3 gap-4 mr-4 sm:mr-0">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <Users className="w-6 h-6 text-yellow-400 mb-2" />
                <p className="text-xs text-gray-400">O'rindiqlar</p>
                <p className="text-lg font-bold">{car.seats} ta</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <Settings className="w-6 h-6 text-yellow-400 mb-2" />
                <p className="text-xs text-gray-400">Uzatma</p>
                <p className="text-lg font-bold capitalize">
                  {car.transmission}
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <Fuel className="w-6 h-6 text-yellow-400 mb-2" />
                <p className="text-xs text-gray-400">Yoqilg'i</p>
                <p className="text-lg font-bold capitalize">{car.fuelType}</p>
              </div>
            </div>

            {/* Description */}
            {car.description && (
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-yellow-400 mb-3">
                  Tavsif
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {car.description}
                </p>
              </div>
            )}

            {/* Price & Booking */}
            <div className="bg-gradient-to-br from-yellow-400/10 to-orange-500/10 rounded-2xl p-5 mr-4 border border-yellow-400/30">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Kunlik narx</p>
                  <p className="text-4xl font-bold text-yellow-400">
                    {formatSom(car.pricePerDay)}
                    <span className="text-lg text-gray-300 ml-2">so'm</span>
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-green-400 text-sm mb-1">
                    <Shield className="w-4 h-4" />
                    <span>Sug'urtalangan</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-400 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>Bepul bekor qilish</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowBookingModal(true)}
                disabled={!car.available}
                className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-lg rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_30px_rgba(251,191,36,0.5)]"
              >
                {car.available ? "Band qilish" : "Mavjud emas"}
              </button>

              <p className="text-xs text-gray-400 text-center mt-4">
                * Depozit 700,000 so'mgacha 20%, undan yuqori 15%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => redirect("/bookings")}
          car={{
            _id: car._id,
            brand: car.brand,
            model: displayModel,
            pricePerDay: car.pricePerDay,
            image: cover,
          }}
        />
      )}
    </div>
  );
}
