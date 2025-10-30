"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { ICar } from "@/models/Car";

export default function CarDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [car, setCar] = useState<ICar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Yuklanmoqda...</p>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="text-center py-12 text-red-600">
        {error || "Mashina topilmadi"}
      </div>
    );
  }

  const cover = car.images?.[0] || "/window.svg";

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <div className="aspect-[16/10] bg-gray-100 rounded overflow-hidden">
          <img
            src={cover}
            alt={`${car.brand}`}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="mt-4 grid grid-cols-4 gap-3">
          {car.images?.slice(0, 4).map((img: string, i: number) => (
            <img
              key={i}
              src={img}
              alt=""
              className="h-20 w-full object-cover rounded"
            />
          ))}
        </div>
      </div>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">
            {car.brand} {String((car.carModel || car.model) ?? "")} {car.year}
          </h1>
          <p className="text-gray-600">
            {car.location?.city} · {car.transmission} · {car.fuelType} ·{" "}
            {car.seats} o'rindiq
          </p>
        </div>
        <div>
          <div className="text-2xl font-bold">
            {formatPrice(car.pricePerDay)}/kun
          </div>
        </div>
        <form
          action="/api/bookings"
          method="post"
          className="space-y-3 border rounded p-4"
        >
          <input type="hidden" name="carId" value={car._id} />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm text-gray-600">Boshlanish</label>
              <input
                required
                type="date"
                name="startDate"
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600">Tugash</label>
              <input
                required
                type="date"
                name="endDate"
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-600">Izoh (ixtiyoriy)</label>
            <textarea
              name="notes"
              className="w-full border rounded px-3 py-2 text-sm"
              rows={3}
            />
          </div>
          <button className="w-full bg-black text-white rounded py-2">
            Band qilish
          </button>
          <p className="text-xs text-gray-500">
            Band qilish uchun tizimga kirgan bo'lishingiz kerak.
          </p>
        </form>
      </div>
    </div>
  );
}
