// components/home/CategoriesSection.tsx
"use client";
import React from "react";
import { ArrowRight } from "lucide-react";

const CategoriesSection = () => {
  const categories = [
    {
      name: "Lux Avtomobillar",
      count: "150+",
      description: "Premium va hashamatli avtomobillar",
      image:
        "https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=500",
      color: "from-yellow-500 to-orange-500",
    },
    {
      name: "Sport Avtomobillar",
      count: "80+",
      description: "Tezlik va quvvat sevuvchilar uchun",
      image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500",
      color: "from-red-500 to-pink-500",
    },
    {
      name: "SUV va Jeeplar",
      count: "120+",
      description: "Qishloq va tog'lar uchun ideal",
      image:
        "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=500",
      color: "from-green-500 to-emerald-500",
    },
    {
      name: "Ekonom sinf",
      count: "200+",
      description: "Tejamkor va qulay narxlarda",
      image: "https://images.unsplash.com/photo-1550355291-bbee04a92027?w=500",
      color: "from-blue-500 to-cyan-500",
    },
  ];

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-purple-100 text-purple-600 rounded-full font-semibold text-sm mb-4">
            🚗 Kategoriyalar
          </div>
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Kategoriyalar bo'yicha
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {" "}
              Ko'rib chiqing
            </span>
          </h2>
          <p className="text-xl text-gray-600">
            Har bir ehtiyojingiz uchun ideal avtomobil
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, index) => (
            <div
              key={index}
              className="group relative h-96 rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500"
            >
              {/* Image */}
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />

              {/* Gradient Overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-t ${cat.color} opacity-60 group-hover:opacity-80 transition-opacity duration-300`}
              ></div>

              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                <div className="transform group-hover:translate-y-0 translate-y-2 transition-transform duration-300">
                  <p className="text-5xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">
                    {cat.count}
                  </p>
                  <h3 className="text-2xl font-bold mb-2">{cat.name}</h3>
                  <p className="text-sm text-white/90 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {cat.description}
                  </p>

                  {/* Button */}
                  <button className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl text-sm font-semibold border border-white/30 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-white/30">
                    Ko'rish
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Top Badge */}
              <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Mashhur
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Info */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl px-8 py-6 border border-purple-100">
            <div className="flex -space-x-2">
              {["🚗", "🏎️", "🚙", "🚕"].map((emoji, i) => (
                <div
                  key={i}
                  className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl border-2 border-purple-200 shadow-lg"
                >
                  {emoji}
                </div>
              ))}
            </div>
            <div className="text-left">
              <p className="text-xl font-bold text-gray-900">
                500+ avtomobil turli kategoriyalarda
              </p>
              <p className="text-gray-600">Har biriga professional xizmat</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
