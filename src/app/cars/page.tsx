"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import CarCard from "@/components/CarCard";
import CarFilters from "@/components/CarFilters";

export default function CarsPage() {
  const [cars, setCars] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    async function fetchCars() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        searchParams.forEach((value, key) => {
          params.set(key, value);
        });
        
        const res = await fetch(`/api/cars?${params.toString()}`);
        const json = await res.json();
        setCars(json?.data?.cars || []);
        setPagination(json?.data?.pagination || { current: 1, pages: 1 });
      } catch (error) {
        console.error("Error fetching cars:", error);
        setCars([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCars();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Mashinalar</h1>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Mashinalar</h1>
      <CarFilters />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {cars.map((car: any) => (
          <CarCard key={car._id} car={car} />
        ))}
      </div>
      {pagination?.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <a
            className={`px-3 py-1.5 border rounded ${pagination.current <= 1 ? "pointer-events-none opacity-50" : ""}`}
            href={`?page=${pagination.current - 1}`}
          >
            Oldingi
          </a>
          <span className="text-sm text-gray-600">
            {pagination.current} / {pagination.pages}
          </span>
          <a
            className={`px-3 py-1.5 border rounded ${pagination.current >= pagination.pages ? "pointer-events-none opacity-50" : ""}`}
            href={`?page=${pagination.current + 1}`}
          >
            Keyingi
          </a>
        </div>
      )}
    </div>
  );
}


