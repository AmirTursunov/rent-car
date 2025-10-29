// components/home/CTASection.tsx
"use client";
import React from "react";
import { ArrowRight, Phone, Mail, MapPin, Star } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-24 px-6 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl animate-pulse animation-delay-2000"></div>
      </div>

      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4zIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Main CTA */}
        <div className="text-center text-white mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full font-semibold text-sm mb-6">
            <Star className="w-4 h-4 text-yellow-300 fill-current" />
            <span>25,000+ qoniqarli mijozlar</span>
          </div>

          <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Orzuingizdagi avtomobilni
            <br />
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              hoziroq bron qiling!
            </span>
          </h2>

          <p className="text-2xl mb-10 text-white/90 max-w-3xl mx-auto">
            Premium avtomobillar, qulay narxlar va professional xizmat.
            Sayohatingizni unutilmas qiling!
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button className="group px-10 py-5 bg-white text-purple-600 font-bold rounded-2xl hover:shadow-2xl transform hover:scale-105 transition-all text-lg flex items-center gap-2">
              Hozir boshlash
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-10 py-5 bg-white/10 backdrop-blur-sm text-white font-bold rounded-2xl border-2 border-white hover:bg-white/20 transition-all text-lg flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Qo'ng'iroq qilish
            </button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-white/90">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-yellow-300 fill-current"
                  />
                ))}
              </div>
              <span className="font-semibold">4.9/5 Reyting</span>
            </div>
            <div className="w-px h-8 bg-white/30"></div>
            <div>
              <span className="text-3xl font-bold">25K+</span>
              <span className="ml-2">Mijozlar</span>
            </div>
            <div className="w-px h-8 bg-white/30"></div>
            <div>
              <span className="text-3xl font-bold">500+</span>
              <span className="ml-2">Avtomobillar</span>
            </div>
          </div>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Phone,
              title: "Telefon",
              info: "+998 90 123 45 67",
              subtitle: "Har kuni 24/7",
            },
            {
              icon: Mail,
              title: "Email",
              info: "info@rentcar.uz",
              subtitle: "Tezkor javob",
            },
            {
              icon: MapPin,
              title: "Manzil",
              info: "Toshkent, Chilonzor",
              subtitle: "Markaz ofis",
            },
          ].map((contact, index) => {
            const Icon = contact.icon;
            return (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-white text-left">
                    <p className="text-sm text-white/70 mb-1">
                      {contact.title}
                    </p>
                    <p className="text-lg font-bold mb-1">{contact.info}</p>
                    <p className="text-sm text-white/70">{contact.subtitle}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Guarantee */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-xl rounded-2xl px-8 py-4 border border-white/20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="text-white font-semibold">100% Kafolat</span>
            </div>
            <div className="w-px h-6 bg-white/30"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <span className="text-white font-semibold">Xavfsiz to'lov</span>
            </div>
            <div className="w-px h-6 bg-white/30"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span className="text-white font-semibold">
                24/7 Qo'llab-quvvatlash
              </span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </section>
  );
};

export default CTASection;
