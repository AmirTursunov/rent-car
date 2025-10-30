// app/cars/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  Star,
  Heart,
  Users,
  Fuel,
  Settings,
  ArrowRight,
  X,
  MapPin,
} from "lucide-react";

interface Car {
  _id: string;
  brand: string;
  model: string;
  year: number;
  pricePerDay: number;
  image: string;
  rating: number;
  category: string;
  fuelType: string;
  transmission: string;
  seats: number;
  available: boolean;
  location: string;
}

const CarsListingPage = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [likedCars, setLikedCars] = useState<Set<string>>(new Set());

  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    priceRange: [0, 1000],
    transmission: "all",
    fuelType: "all",
    seats: "all",
    sortBy: "popular",
  });

  useEffect(() => {
    fetchCars();
  }, [
    filters.category,
    filters.transmission,
    filters.fuelType,
    filters.sortBy,
  ]);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.category !== "all")
        params.append("category", filters.category);
      if (filters.transmission !== "all")
        params.append("transmission", filters.transmission);
      if (filters.fuelType !== "all")
        params.append("fuelType", filters.fuelType);
      params.append("available", "true");

      const response = await fetch(`/api/cars?${params}`);
      const data = await response.json();

      if (data.success) {
        let filteredCars = data.data.cars || [];

        if (filters.search) {
          filteredCars = filteredCars.filter((car: Car) =>
            `${car.brand} ${car.model}`
              .toLowerCase()
              .includes(filters.search.toLowerCase())
          );
        }

        filteredCars = filteredCars.filter(
          (car: Car) =>
            car.pricePerDay >= filters.priceRange[0] &&
            car.pricePerDay <= filters.priceRange[1]
        );

        if (filters.seats !== "all") {
          filteredCars = filteredCars.filter(
            (car: Car) => car.seats >= parseInt(filters.seats)
          );
        }

        if (filters.sortBy === "price-low") {
          filteredCars.sort((a: Car, b: Car) => a.pricePerDay - b.pricePerDay);
        } else if (filters.sortBy === "price-high") {
          filteredCars.sort((a: Car, b: Car) => b.pricePerDay - a.pricePerDay);
        } else if (filters.sortBy === "rating") {
          filteredCars.sort((a: Car, b: Car) => b.rating - a.rating);
        }

        setCars(filteredCars);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = (carId: string) => {
    setLikedCars((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(carId)) newSet.delete(carId);
      else newSet.add(carId);
      return newSet;
    });
  };

  const categories = [
    { id: "all", name: "Barchasi", icon: "🚗" },
    { id: "economy", name: "Ekonom", icon: "💰" },
    { id: "luxury", name: "Lux", icon: "💎" },
    { id: "suv", name: "SUV", icon: "🚙" },
    { id: "sports", name: "Sport", icon: "🏎️" },
  ];

  return (
    <div className="min-h-screen bg-[#030303] text-gray-100">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#202020] to-[#030303] text-[#DCFF00] py-16 border-b border-[#FFA400]/20">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-5xl font-bold mb-4">Avtomobillar</h1>
          <p className="text-lg text-gray-300">
            500+ dan ortiq premium avtomobillar sizni kutmoqda
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Search & Filters */}
        <div className="bg-[#202020] rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Qidirish: marka, model..."
                value={filters.search}
                onChange={(e) => {
                  setFilters({ ...filters, search: e.target.value });
                  setTimeout(() => fetchCars(), 500);
                }}
                className="w-full pl-12 pr-4 py-3 bg-[#030303] border border-[#FFA400]/40 rounded-xl text-gray-200 placeholder-gray-500 focus:border-[#DCFF00] outline-none transition-all"
              />
            </div>

            <select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters({ ...filters, sortBy: e.target.value })
              }
              className="px-4 py-3 bg-[#030303] border border-[#FFA400]/40 rounded-xl text-gray-200 focus:border-[#DCFF00] outline-none"
            >
              <option value="popular">Mashhur</option>
              <option value="price-low">Arzon narx</option>
              <option value="price-high">Qimmat narx</option>
              <option value="rating">Yuqori reyting</option>
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 bg-[#DCFF00] text-[#030303] font-semibold rounded-xl hover:bg-[#FFA400] transition-all flex items-center gap-2"
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filtrlar
            </button>
          </div>

          {/* Category Buttons */}
          <div className="flex gap-3 mt-5 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilters({ ...filters, category: cat.id })}
                className={`px-5 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                  filters.category === cat.id
                    ? "bg-[#DCFF00] text-[#030303]"
                    : "bg-[#030303] text-gray-300 hover:bg-[#202020]"
                }`}
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Car Results */}
        {loading ? (
          <div className="text-center text-gray-400 py-20">Yuklanmoqda...</div>
        ) : cars.length === 0 ? (
          <div className="text-center py-20 bg-[#202020] rounded-2xl">
            <h3 className="text-2xl font-bold text-[#DCFF00] mb-2">
              Avtomobillar topilmadi
            </h3>
            <p className="text-gray-400 mb-6">
              Filtrlarni o‘zgartiring yoki qayta urinib ko‘ring
            </p>
            <button
              onClick={() => {
                setFilters({
                  search: "",
                  category: "all",
                  priceRange: [0, 1000],
                  transmission: "all",
                  fuelType: "all",
                  seats: "all",
                  sortBy: "popular",
                });
                fetchCars();
              }}
              className="px-6 py-3 bg-[#DCFF00] text-[#030303] font-semibold rounded-xl hover:bg-[#FFA400] transition-all"
            >
              Filtrlarni tozalash
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cars.map((car) => (
              <div
                key={car._id}
                className="group bg-[#202020] rounded-3xl overflow-hidden shadow-xl hover:shadow-[#DCFF00]/30 transition-all duration-500 hover:-translate-y-2"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={
                      car.image ||
                      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800"
                    }
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <button
                    onClick={() => toggleLike(car._id)}
                    className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      likedCars.has(car._id)
                        ? "bg-[#FFA400] text-[#030303]"
                        : "bg-[#030303]/80 text-gray-200 hover:bg-[#DCFF00] hover:text-[#030303]"
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        likedCars.has(car._id) ? "fill-current" : ""
                      }`}
                    />
                  </button>
                  <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-[#030303]/70 rounded-full flex items-center gap-1 shadow-lg">
                    <Star className="w-4 h-4 text-[#FFA400] fill-current" />
                    <span className="text-sm font-bold text-[#DCFF00]">
                      {car.rating.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-[#DCFF00] mb-1">
                        {car.brand} {car.model}
                      </h3>
                      <p className="text-sm text-gray-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#FFA400]" />
                        {car.location || "Toshkent"}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-[#030303] text-[#FFA400] text-xs font-semibold rounded-full border border-[#FFA400]/40">
                      {car.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#FFA400]/10">
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Users className="w-4 h-4 text-[#DCFF00]" />
                      <span className="text-sm">{car.seats}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Settings className="w-4 h-4 text-[#DCFF00]" />
                      <span className="text-sm capitalize">
                        {car.transmission}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Fuel className="w-4 h-4 text-[#DCFF00]" />
                      <span className="text-sm capitalize">{car.fuelType}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Kunlik</p>
                      <p className="text-2xl font-bold text-[#FFA400]">
                        ${car.pricePerDay}
                      </p>
                    </div>
                    <button className="px-6 py-3 bg-[#DCFF00] text-[#030303] font-semibold rounded-xl hover:bg-[#FFA400] transition-all flex items-center gap-2">
                      Ko‘rish
                      <ArrowRight className="w-4 h-4" />
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

export default CarsListingPage;
