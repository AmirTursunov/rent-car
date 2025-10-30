"use client";
import React from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const headerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.14 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.57 } },
};
const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.13, delayChildren: 0.2 } },
};

const CategoriesSection = () => {
  const categories = [
    {
      name: "Lux Avtomobillar",
      count: "150+",
      description: "Premium va hashamatli avtomobillar",
      image: "https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=500",
      color: "from-[#FFA400]/90 to-[#DCFF00]/80",
    },
    {
      name: "Sport Avtomobillar",
      count: "80+",
      description: "Tezlik va quvvat sevuvchilar uchun",
      image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500",
      color: "from-[#DCFF00]/80 to-[#FFA400]/70",
    },
    {
      name: "SUV va Jeeplar",
      count: "120+",
      description: "Qishloq va tog'lar uchun ideal",
      image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=500",
      color: "from-[#FFA400]/80 to-[#DCFF00]/70",
    },
    {
      name: "Ekonom sinf",
      count: "200+",
      description: "Tejamkor va qulay narxlarda",
      image: "https://images.unsplash.com/photo-1550355291-bbee04a92027?w=500",
      color: "from-[#DCFF00]/70 to-[#FFA400]/80",
    },
  ];

  return (
    <section className="py-24 px-6 bg-[#030303] text-[#DCFF00] relative overflow-hidden">
      {/* Neon Glow Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#202020]/40 to-[#030303]"></div>
      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          variants={headerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.45 }}
        >
          <motion.div variants={fadeUp} className="inline-block px-5 py-2 bg-[#202020] text-[#FFA400] rounded-full font-semibold text-sm mb-4 border border-[#FFA400]/40 shadow-[0_0_15px_#FFA400]">
            🚗 Kategoriyalar
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-5xl font-bold mb-4">
            Kategoriyalar bo‘yicha{" "}
            <span className="text-[#FFA400] drop-shadow-[0_0_10px_#FFA400]">
              Ko‘rib chiqing
            </span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-[#DCFF00]/80">
            Har bir ehtiyojingiz uchun ideal avtomobilni tanlang
          </motion.p>
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={gridVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
        >
          {categories.map((cat, index) => (
            <motion.div
              variants={fadeUp}
              key={index}
              className="group relative h-96 rounded-3xl overflow-hidden cursor-pointer border border-[#202020] bg-[#202020]/70 hover:shadow-[0_0_25px_#FFA400] transition-all duration-500"
            >
              {/* Image */}
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover opacity-70 group-hover:scale-110 transition-transform duration-700"
              />
              {/* Gradient Overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-t ${cat.color} opacity-50 group-hover:opacity-80 transition-opacity duration-300`}
              ></div>
              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end text-[#030303]">
                <div className="transform group-hover:translate-y-0 translate-y-2 transition-transform duration-300">
                  <p className="text-5xl font-extrabold mb-2 text-[#DCFF00] drop-shadow-[0_0_10px_#DCFF00]">
                    {cat.count}
                  </p>
                  <h3 className="text-2xl font-bold text-black mb-2">
                    {cat.name}
                  </h3>
                  <p className="text-sm text-black mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {cat.description}
                  </p>
                  {/* Button */}
                  <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#030303]/80 text-[#DCFF00] rounded-xl text-sm font-semibold border border-[#FFA400]/60 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-[#202020] hover:text-[#FFA400] hover:shadow-[0_0_10px_#FFA400]">
                    Ko‘rish
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
              {/* Top Badge */}
              <div className="absolute top-4 right-4 px-3 py-1 bg-[#FFA400]/90 rounded-full text-xs font-bold text-[#030303] shadow-[0_0_10px_#FFA400] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Mashhur
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Info */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true, amount: 0.40 }}
        >
          <div className="inline-flex items-center gap-6 bg-[#202020] rounded-2xl px-10 py-6 border border-[#FFA400]/40 shadow-[0_0_20px_#FFA400]/30">
            <div className="flex -space-x-2">
              {["🚗", "🏎️", "🚙", "🚕"].map((emoji, i) => (
                <div
                  key={i}
                  className="w-12 h-12 bg-[#030303] rounded-full flex items-center justify-center text-2xl border-2 border-[#FFA400]/50 shadow-[0_0_10px_#FFA400]/30"
                >
                  {emoji}
                </div>
              ))}
            </div>
            <div className="text-left">
              <p className="text-xl font-bold text-[#FFA400]">
                500+ avtomobil turli kategoriyalarda
              </p>
              <p className="text-[#DCFF00]/80">
                Har bir mijoz uchun maxsus xizmat
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CategoriesSection;
