// components/home/HowItWorksSection.tsx
"use client";
import React from "react";
import { Search, Calendar, Key, CheckCircle } from "lucide-react";

const HowItWorksSection = () => {
  const steps = [
    {
      icon: Search,
      title: "Avtomobil tanlang",
      description:
        "500+ dan ortiq avtomobillar orasidan o'zingizga mos keladiganini toping",
      color: "from-blue-500 to-cyan-500",
      number: "01",
    },
    {
      icon: Calendar,
      title: "Sana belgilang",
      description:
        "Qulayroq sana va vaqtni tanlang, bron qilish bir daqiqa ichida",
      color: "from-purple-500 to-pink-500",
      number: "02",
    },
    {
      icon: Key,
      title: "Kalitlarni oling",
      description: "Manzilga yetkazib beramiz yoki o'zingiz kelishingiz mumkin",
      color: "from-orange-500 to-red-500",
      number: "03",
    },
    {
      icon: CheckCircle,
      title: "Zavqlaning",
      description: "Xavfsiz va qulay sayohat qiling, biz doim yoningizda",
      color: "from-green-500 to-emerald-500",
      number: "04",
    },
  ];

  return (
    <section className="py-24 px-6 bg-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-64 h-64 bg-blue-100 rounded-full opacity-50 blur-3xl"></div>
        <div className="absolute bottom-20 -right-20 w-64 h-64 bg-purple-100 rounded-full opacity-50 blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-blue-100 text-blue-600 rounded-full font-semibold text-sm mb-4">
            ⚡ Oddiy va tez
          </div>
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Qanday
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}
              Ishlaydi?
            </span>
          </h2>
          <p className="text-xl text-gray-600">
            4 ta oddiy qadam orqali avtomobil ijaraga oling
          </p>
        </div>

        <div className="relative">
          {/* Connection Line */}
          <div className="hidden md:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500  to-green-500 opacity-20 z-0"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative group">
                  <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 relative overflow-hidden">
                    {/* Number Background */}
                    <div className="absolute top-6 left-6 text-8xl font-bold text-gray-50 -z-0 select-none">
                      {step.number}
                    </div>

                    {/* Icon */}
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mb-6 relative z-10 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 relative z-10">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 relative z-10 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Hover Effect Line */}
                    <div
                      className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${step.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}
                    ></div>
                  </div>

                  {/* Arrow Between Steps */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-20">
                      <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-200">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-6">
            Hali ham savollaringiz bormi? Biz sizga yordam beramiz!
          </p>
          <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-blue-500/50 transform hover:scale-105 transition-all duration-300">
            Biz bilan bog'lanish
          </button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
