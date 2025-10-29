// components/home/FeaturesSection.tsx
"use client";
import React from "react";
import {
  Shield,
  Clock,
  Award,
  Headphones,
  DollarSign,
  MapPin,
  CheckCircle,
} from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Shield,
      title: "100% Xavfsizlik",
      description:
        "Barcha avtomobillar to'liq sug'urtalangan va texnik jihatdan mukammal holatda",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      delay: "0",
    },
    {
      icon: Clock,
      title: "24/7 Qo'llab-quvvatlash",
      description:
        "Har qanday vaqtda yordam va maslahat olishingiz mumkin, doim aloqadamiz",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      delay: "100",
    },
    {
      icon: Award,
      title: "Premium Sifat",
      description:
        "Faqat eng yaxshi va yangi model avtomobillar, professional texnik xizmat",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
      delay: "200",
    },
    {
      icon: DollarSign,
      title: "Qulay Narxlar",
      description:
        "Raqobatbardosh narxlar va maxsus chegirmalar, eng yaxshi takliflar",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      delay: "300",
    },
    {
      icon: MapPin,
      title: "Istalgan Joyda",
      description:
        "Shaharning istalgan nuqtasida bepul yetkazib berish xizmati",
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-50",
      delay: "400",
    },
    {
      icon: Headphones,
      title: "Professional Xizmat",
      description:
        "Tajribali va do'stona xizmat ko'rsatuvchi jamoa sizga yordam beradi",
      color: "from-indigo-500 to-purple-500",
      bgColor: "bg-indigo-50",
      delay: "500",
    },
  ];

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-purple-100 rounded-full opacity-50 blur-3xl"></div>
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-blue-100 rounded-full opacity-50 blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-purple-100 text-purple-600 rounded-full font-semibold text-sm mb-4">
            ✨ Nima uchun bizni tanlashadi?
          </div>
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Bizning
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {" "}
              Afzalliklarimiz
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Mijozlarimizga eng yaxshi tajriba va xizmatni taqdim etamiz
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 overflow-hidden"
                style={{ animationDelay: `${feature.delay}ms` }}
              >
                {/* Background Decoration */}
                <div
                  className={`absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-10 rounded-full group-hover:scale-150 transition-transform duration-500`}
                ></div>

                {/* Icon */}
                <div
                  className={`relative w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text transition-all">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Effect Line */}
                <div
                  className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${feature.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}
                ></div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer">
            <div className="flex -space-x-3">
              {[
                { emoji: "😊", delay: "0" },
                { emoji: "🚗", delay: "100" },
                { emoji: "⭐", delay: "200" },
                { emoji: "💯", delay: "300" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-white/20 border-2 border-white flex items-center justify-center text-xl group-hover:scale-110 transition-transform"
                  style={{ transitionDelay: `${item.delay}ms` }}
                >
                  {item.emoji}
                </div>
              ))}
            </div>
            <div className="text-left">
              <p className="font-bold text-lg flex items-center gap-2">
                25,000+ qoniqarli mijozlar
                <CheckCircle className="w-5 h-5" />
              </p>
              <p className="text-white/80 text-sm">Sizni ham kutamiz!</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
