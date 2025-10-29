// components/home/PopularCarsSection.tsx
"use client";
import React, { useState, useEffect } from "react";
import {
  Star,
  Heart,
  Users,
  Fuel,
  Settings,
  ArrowRight,
  Zap,
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
  trending?: boolean;
}

const PopularCarsSection = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/cars?available=true&limit=6");
      const data = await response.json();
      if (data.success) {
        setCars(data.data.cars || []);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: "all", label: "Barchasi", icon: "🚗" },
    { id: "luxury", label: "Lux", icon: "💎" },
    { id: "suv", label: "SUV", icon: "🚙" },
    { id: "sports", label: "Sport", icon: "🏎️" },
    { id: "economy", label: "Ekonom", icon: "💰" },
  ];

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 bg-orange-100 text-orange-600 rounded-full font-semibold text-sm mb-4">
            🔥 Eng mashhur
          </div>
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Taniqli
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              {" "}
              Avtomobillar
            </span>
          </h2>
          <p className="text-xl text-gray-600">
            Mijozlarimiz eng ko'p tanlaydigan modellar
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex justify-center gap-3 mb-12 overflow-x-auto pb-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 whitespace-nowrap ${
                activeTab === cat.id
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/50 scale-110"
                  : "bg-white text-gray-700 hover:bg-gray-50 shadow"
              }`}
            >
              <span className="mr-2">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Cars Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl overflow-hidden shadow-lg animate-pulse"
              >
                <div className="h-56 bg-gray-200"></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cars.map((car, index) => (
              <div
                key={car._id}
                className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                  <img
                    src={
                      car.image ||
                      `https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800`
                    }
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {car.trending && (
                      <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-lg">
                        <Zap className="w-3 h-3 fill-current" />
                        Trending
                      </span>
                    )}
                    {car.available && (
                      <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg">
                        Mavjud
                      </span>
                    )}
                  </div>

                  {/* Like Button */}
                  <button className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all group/like">
                    <Heart className="w-5 h-5 group-hover/like:scale-110 transition-transform" />
                  </button>

                  {/* Rating */}
                  <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full flex items-center gap-1 shadow-lg">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-bold text-gray-900">
                      {car.rating.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-red-500 group-hover:bg-clip-text transition-all">
                        {car.brand} {car.model}
                      </h3>
                      <p className="text-sm text-gray-500">{car.year}-yil</p>
                    </div>
                    <span className="px-3 py-1 bg-purple-100 text-purple-600 text-xs font-semibold rounded-full">
                      {car.category}
                    </span>
                  </div>

                  {/* Specs */}
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{car.seats}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Settings className="w-4 h-4" />
                      <span className="text-sm capitalize">
                        {car.transmission}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Fuel className="w-4 h-4" />
                      <span className="text-sm capitalize">{car.fuelType}</span>
                    </div>
                  </div>

                  {/* Price & CTA */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Kunlik narx</p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                        ${car.pricePerDay}
                      </p>
                    </div>
                    <button className="group/btn px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-500/50 transition-all flex items-center gap-2">
                      Bron qilish
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View All Button */}
        <div className="text-center mt-12">
          <button className="group px-8 py-4 bg-gradient-to-r from-gray-900 to-gray-700 text-white font-bold rounded-2xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2 mx-auto">
            Barcha avtomobillarni ko'rish
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default PopularCarsSection;
