"use client";
import React, { useEffect, useState } from "react";
import { ArrowRight, Phone, Mail, MapPin, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useSettings } from "../context/SettingContext";
import { redirect } from "next/navigation";

const headerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.12 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.57 } },
};
const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.13, delayChildren: 0.18 } },
};

const CTASection = () => {
  const { settings, isLoading } = useSettings();
  const [highlight, setHighlight] = useState(false);

  useEffect(() => {
    const trigger = () => {
      setHighlight(true);
      const t = setTimeout(() => setHighlight(false), 1200);
      return () => clearTimeout(t);
    };

    if (typeof window !== "undefined") {
      if (window.location.hash === "#contact") {
        trigger();
      }
      const handler = () => trigger();
      window.addEventListener("contact-focus", handler as EventListener);
      return () =>
        window.removeEventListener("contact-focus", handler as EventListener);
    }
  }, []);

  const contactGrid = [
    {
      icon: Phone,
      title: "Telefon",
      info: settings.phone || "+998 90 123 45 67",
      subtitle: "24/7",
    },
    {
      icon: Mail,
      title: "Email",
      info: settings.contactEmail || "info@rentcar.uz",
      subtitle: "Tezkor javob",
    },
    {
      icon: MapPin,
      title: "Manzil",
      info: settings.address || "Toshkent, Chilonzor",
      subtitle: settings.companyName || "Markaz ofis",
    },
  ];

  return (
    <section
      id="contact"
      className={`py-24 px-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden transition-all duration-700 ${
        highlight
          ? "ring-2 ring-yellow-400/60 shadow-[0_0_40px_rgba(250,204,21,.35)]"
          : ""
      }`}
    >
      {/* Background Decorations */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
      </div>

      <motion.div
        className="max-w-7xl mx-auto relative z-10 text-center mb-16"
        variants={headerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.48 }}
      >
        {/* Heading */}
        <motion.div
          variants={fadeUp}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full font-semibold text-sm mb-6"
        >
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span>25,000+ qoniqarli mijozlar</span>
        </motion.div>
        <motion.h2
          variants={fadeUp}
          className="text-5xl md:text-6xl font-bold mb-6 leading-tight"
        >
          Orzuingizdagi avtomobilni{" "}
          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            hoziroq bron qiling!
          </span>
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="text-lg text-gray-300 max-w-3xl mx-auto mb-12"
        >
          Premium avtomobillar, qulay narxlar va professional xizmat.
          Sayohatingizni unutilmas qiling!
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={fadeUp}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <button
            onClick={() => redirect("/cars")}
            className="group px-10 py-5 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-2xl hover:shadow-2xl transform hover:scale-105 transition-all text-lg flex items-center gap-2"
          >
            Hozir boshlash
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <a
            href={`tel:${(settings.phone || "").replace(/\s/g, "")}`}
            className="px-10 py-5 bg-white/10 backdrop-blur-sm text-white font-bold rounded-2xl border-2 border-white hover:bg-white/20 transition-all text-lg flex items-center gap-2"
          >
            <Phone className="w-5 h-5" />
            Qo'ng'iroq qilish
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={fadeUp}
          className="flex flex-wrap items-center justify-center gap-8 text-white/90 mb-16"
        >
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2 gap-2.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className="w-5 h-5 text-yellow-400 fill-current"
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
        </motion.div>
      </motion.div>

      {/* Contact Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        variants={gridVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.34 }}
      >
        {contactGrid.map((contact, idx) => {
          const Icon = contact.icon;
          return (
            <motion.div
              variants={fadeUp}
              key={idx}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-300 mb-1">{contact.title}</p>
                  <p className="text-lg font-bold mb-1">
                    {isLoading && idx === 0 ? "..." : contact.info}
                  </p>
                  <p className="text-sm text-gray-300">{contact.subtitle}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Bottom Guarantee */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.72 }}
        viewport={{ once: true, amount: 0.36 }}
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 bg-white/5 backdrop-blur-sm rounded-2xl px-6 sm:px-8 py-5 border border-white/10 w-full max-w-[800px] mx-auto">
          {/* 1️⃣ Kafolat */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-green-500 rounded-full flex items-center justify-center">
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
            <span className="text-white font-semibold text-sm sm:text-base">
              100% Kafolat
            </span>
          </div>

          {/* Divider (faqat katta ekranlarda ko‘rinadi) */}
          <div className="hidden sm:block w-px h-6 bg-white/30"></div>

          {/* 2️⃣ Xavfsiz to‘lov */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-500 rounded-full flex items-center justify-center">
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
            <span className="text-white font-semibold text-sm sm:text-base">
              Xavfsiz to'lov
            </span>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-6 bg-white/30"></div>

          {/* 3️⃣ Qo'llab-quvvatlash */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-purple-500 rounded-full flex items-center justify-center">
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
            <span className="text-white font-semibold text-sm sm:text-base">
              24/7 Qo'llab-quvvatlash
            </span>
          </div>
        </div>
      </motion.div>
      <style jsx>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </section>
  );
};

export default CTASection;
