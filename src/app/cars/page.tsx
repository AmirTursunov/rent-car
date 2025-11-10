"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  Users,
  Fuel,
  Settings,
  ArrowRight,
  Droplet,
  MapPin,
} from "lucide-react";
import { CarsListingSkeleton } from "../../components/skeletons/car-card-skeleton";

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
  color: string;
}

const CarsListingPage = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const formatSom = (value: number) =>
    new Intl.NumberFormat("uz-UZ").format(value);

  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    priceRange: [0, 100000000],
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
      setError(null);
      const params = new URLSearchParams();
      if (filters.category !== "all")
        params.append("category", filters.category);
      if (filters.transmission !== "all")
        params.append("transmission", filters.transmission);
      if (filters.fuelType !== "all")
        params.append("fuelType", filters.fuelType);
      params.append("available", "true");

      const response = await fetch(`/api/cars?${params}`, {
        cache: "no-store",
      });
      const data = await response.json();

      if (response.ok && data.success) {
        // Normalize API cars -> UI shape
        let filteredCars: Car[] = (
          data.data && data.data.cars ? data.data.cars : []
        ).map((c: any) => ({
          _id: c._id,
          brand: c.brand,
          model: c.carModel ?? c.model ?? "",
          year: c.year,
          pricePerDay: c.pricePerDay,
          image:
            Array.isArray(c.images) && c.images.length > 0
              ? c.images[0]
              : c.image || "",
          rating:
            typeof c.rating === "number" ? c.rating : c.rating?.average ?? 0,
          category: c.category ?? c.fuelType ?? "general",
          fuelType: c.fuelType,
          transmission: c.transmission,
          seats: c.seats,
          available: c.available,
          location:
            typeof c.location === "string"
              ? c.location
              : c.location?.city ?? "",
          color: c.color ?? "Noma'lum",
        }));

        if (filters.search) {
          filteredCars = filteredCars.filter((car: Car) =>
            `${car.brand} ${car.model}`
              .toLowerCase()
              .includes(filters.search.toLowerCase())
          );
        }

        // Local category filter (frontend only)
        if (filters.category && filters.category !== "all") {
          const wanted = String(filters.category).toLowerCase();
          filteredCars = filteredCars.filter(
            (car: Car) => String(car.category || "").toLowerCase() === wanted
          );
        }

        if (
          Array.isArray(filters.priceRange) &&
          filters.priceRange.length === 2
        ) {
          filteredCars = filteredCars.filter(
            (car: Car) =>
              car.pricePerDay >= filters.priceRange[0] &&
              car.pricePerDay <= filters.priceRange[1]
          );
        }

        if (filters.seats !== "all") {
          filteredCars = filteredCars.filter(
            (car: Car) => car.seats >= Number.parseInt(filters.seats)
          );
        }

        if (filters.sortBy === "price-low") {
          filteredCars.sort((a: Car, b: Car) => a.pricePerDay - b.pricePerDay);
        } else if (filters.sortBy === "price-high") {
          filteredCars.sort((a: Car, b: Car) => b.pricePerDay - a.pricePerDay);
        } else if (filters.sortBy === "rating") {
          filteredCars.sort(
            (a: Car, b: Car) => (b.rating ?? 0) - (a.rating ?? 0)
          );
        }

        setCars(filteredCars);
        console.log(filteredCars);
      } else {
        setCars([]);
        setError(
          data?.error || data?.message || "Mashinalarni yuklab bo'lmadi"
        );
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Server bilan aloqa xatosi");
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  };

  const categories = [
    { id: "all", name: "Barchasi", icon: "🚗" },
    { id: "economy", name: "Ekonom", icon: "💰" },
    { id: "luxury", name: "Lux", icon: "💎" },
    { id: "suv", name: "SUV", icon: "🚙" },
    { id: "sports", name: "Sport", icon: "🏎️" },
  ];

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header Banner */}
      <div className="text-yellow-400 py-16 border-b border-orange-400/30">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-5xl font-bold mb-4">Avtomobillar</h1>
          <p className="text-lg text-gray-300">
            500+ dan ortiq premium avtomobillar sizni kutmoqda
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Search & Filters */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-all">
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
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/10 rounded-xl text-gray-200 placeholder-gray-500 focus:border-yellow-400 outline-none transition-all"
              />
            </div>

            <select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters({ ...filters, sortBy: e.target.value })
              }
              className="px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-gray-200 focus:border-yellow-400 outline-none"
            >
              <option value="popular">Mashhur</option>
              <option value="price-low">Arzon narx</option>
              <option value="price-high">Qimmat narx</option>
              <option value="rating">Yuqori reyting</option>
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold rounded-xl hover:opacity-90 transition-all flex items-center gap-2"
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
                    ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-black"
                    : "bg-white/10 text-gray-300 hover:text-yellow-400 border border-white/10"
                }`}
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {isInitialLoad && loading ? (
          <CarsListingSkeleton />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-400 text-lg">{error}</p>
            <button
              onClick={() => fetchCars()}
              className="mt-4 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold rounded-xl hover:opacity-90 transition-all"
            >
              Qayta urinib ko'ring
            </button>
          </div>
        ) : cars.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-300 text-lg">Mashinalar topilmadi</p>
          </div>
        ) : (
          /* Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cars.map((car) => (
              <div
                key={car._id}
                className="group bg-white/5 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/10 hover:border-yellow-400/30 hover:shadow-[0_0_25px_rgba(255,255,255,0.15)] transition-all duration-500 hover:-translate-y-2"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={
                      car.image ||
                      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800" ||
                      "/placeholder.svg"
                    }
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-yellow-400 mb-1">
                        {car.brand} {car.model}
                      </h3>
                      <p className="text-sm text-gray-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-orange-500" />
                        {car.location || "Toshkent"}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-white/10 text-orange-400 text-xs font-semibold rounded-full border border-orange-400/30">
                      {car.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-orange-400/10">
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Users className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm">{car.seats}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Settings className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm capitalize">
                        {car.transmission}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Fuel className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm capitalize">{car.fuelType}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Droplet className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm capitalize">{car.color}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Kunlik</p>
                      <p className="text-2xl font-bold bg-gradient-to-br from-green-400 to-emerald-500 bg-clip-text text-transparent">
                        {formatSom(car.pricePerDay)}
                        <span className="ml-2 text-sm text-gray-300 font-normal">
                          so'm
                        </span>
                      </p>
                    </div>
                    <Link
                      href={`/cars/${car._id}`}
                      className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold rounded-xl hover:opacity-90 transition-all flex items-center gap-2"
                      aria-label={`Ko'rish: ${car.brand} ${car.model}`}
                    >
                      Ko'rish
                      <ArrowRight className="w-4 h-4" />
                    </Link>
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
