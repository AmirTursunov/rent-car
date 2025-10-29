// components/home/PricingSection.tsx
"use client";
import React, { useState } from "react";
import { CheckCircle, X, Zap } from "lucide-react";

const PricingSection = () => {
  const [billingType, setBillingType] = useState<
    "daily" | "weekly" | "monthly"
  >("weekly");

  const plans = [
    {
      name: "Kunlik",
      slug: "daily",
      price: "50",
      originalPrice: "60",
      description: "Qisqa muddatli sayohatlar uchun",
      features: [
        { text: "1 kun ijara", included: true },
        { text: "100 km limit", included: true },
        { text: "Asosiy sug'urta", included: true },
        { text: "24/7 qo'llab-quvvatlash", included: true },
        { text: "Bepul yetkazib berish", included: false },
        { text: "VIP xizmat", included: false },
      ],
      popular: false,
      color: "from-blue-500 to-cyan-500",
    },
    {
      name: "Haftalik",
      slug: "weekly",
      price: "300",
      originalPrice: "420",
      description: "Eng mashhur tanlov",
      features: [
        { text: "7 kun ijara", included: true },
        { text: "700 km limit", included: true },
        { text: "To'liq sug'urta", included: true },
        { text: "24/7 qo'llab-quvvatlash", included: true },
        { text: "Bepul yetkazib berish", included: true },
        { text: "VIP xizmat", included: false },
      ],
      popular: true,
      color: "from-purple-500 to-pink-500",
    },
    {
      name: "Oylik",
      slug: "monthly",
      price: "1000",
      originalPrice: "1500",
      description: "Uzoq muddatli sayohatlar uchun",
      features: [
        { text: "30 kun ijara", included: true },
        { text: "Cheksiz kilometr", included: true },
        { text: "Premium sug'urta", included: true },
        { text: "24/7 VIP qo'llab-quvvatlash", included: true },
        { text: "Bepul yetkazib berish", included: true },
        { text: "Bepul yanchish", included: true },
      ],
      popular: false,
      color: "from-orange-500 to-red-500",
    },
  ];

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-green-100 text-green-600 rounded-full font-semibold text-sm mb-4">
            💰 Narxlar
          </div>
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Narxlar va
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {" "}
              Paketlar
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Har bir ehtiyojingiz uchun mos narx
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-2 p-2 bg-gray-100 rounded-2xl">
            {["daily", "weekly", "monthly"].map((type) => (
              <button
                key={type}
                onClick={() => setBillingType(type as typeof billingType)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  billingType === type
                    ? "bg-white text-gray-900 shadow-lg"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {type === "daily" && "Kunlik"}
                {type === "weekly" && "Haftalik"}
                {type === "monthly" && "Oylik"}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-3xl p-8 transition-all duration-300 ${
                plan.popular
                  ? "border-4 border-purple-500 shadow-2xl scale-105 z-10"
                  : "border-2 border-gray-200 shadow-lg hover:shadow-xl hover:scale-105"
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                  <div className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-sm font-bold shadow-lg">
                    <Zap className="w-4 h-4 fill-current" />
                    Eng mashhur
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="text-center mb-8">
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${plan.color} rounded-2xl mb-4`}
                >
                  <span className="text-2xl font-bold text-white">
                    {plan.name.charAt(0)}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-gray-600">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="text-center mb-8 pb-8 border-b border-gray-100">
                <div className="flex items-end justify-center gap-2 mb-2">
                  <span className="text-5xl font-bold text-gray-900">
                    ${plan.price}
                  </span>
                  <span className="text-gray-500 mb-2">/ dan boshlab</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm text-gray-400 line-through">
                    ${plan.originalPrice}
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-600 text-xs font-bold rounded-full">
                    {Math.round(
                      (1 -
                        parseFloat(plan.price) /
                          parseFloat(plan.originalPrice)) *
                        100
                    )}
                    % CHEGIRMA
                  </span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    {feature.included ? (
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <X className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                    <span
                      className={`text-sm ${
                        feature.included ? "text-gray-700" : "text-gray-400"
                      }`}
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                className={`w-full py-4 rounded-xl font-bold transition-all duration-300 ${
                  plan.popular
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl hover:shadow-purple-500/50 hover:scale-105"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200 hover:scale-105"
                }`}
              >
                {plan.popular ? "Hozir boshlash" : "Tanlash"}
              </button>
            </div>
          ))}
        </div>

        {/* Bottom Info */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-4 bg-blue-50 rounded-2xl px-8 py-6 border border-blue-100">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <p className="text-lg font-bold text-gray-900">
                Barcha paketlarda:
              </p>
              <p className="text-gray-600">
                24/7 qo'llab-quvvatlash • To'liq sug'urta • Bepul bekor qilish
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
