// components/home/FeaturesSection.tsx
"use client";
import React from "react";
import { Shield, Clock, Award, Headphones, DollarSign, MapPin, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const headerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.15 },
  },
};
const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};
const cardGridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11, delayChildren: 0.22 } },
};

const FeaturesSection = () => {
  const features = [
    {
      icon: Shield,
      title: "100% Xavfsizlik",
      description: "Barcha avtomobillar to'liq sug'urtalangan va texnik jihatdan mukammal holatda.",
    },
    {
      icon: Clock,
      title: "24/7 Qo'llab-quvvatlash",
      description: "Har qanday vaqtda yordam va maslahat olishingiz mumkin, doim aloqadamiz.",
    },
    {
      icon: Award,
      title: "Premium Sifat",
      description: "Faqat eng yaxshi va yangi model avtomobillar, professional texnik xizmat.",
    },
    {
      icon: DollarSign,
      title: "Qulay Narxlar",
      description: "Raqobatbardosh narxlar va maxsus chegirmalar, eng yaxshi takliflar.",
    },
    {
      icon: MapPin,
      title: "Istalgan Joyda",
      description: "Shaharning istalgan nuqtasida tez va qulay yetkazib berish xizmati.",
    },
    {
      icon: Headphones,
      title: "Professional Xizmat",
      description: "Tajribali va do'stona xizmat ko'rsatuvchi jamoa sizga yordam beradi.",
    },
  ];

  return (
    <section className="py-24 px-6 bg-[#030303] text-white relative overflow-hidden">
      {/* Yorug‘lik effektlari */}
      <div className="absolute top-20 -left-20 w-96 h-96 bg-[#DCFF00]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 -right-20 w-96 h-96 bg-[#FFA400]/10 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Bo‘lim sarlavhasi */}
        <motion.div className="text-center mb-16" variants={headerVariants} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.5 }}>
          <motion.div variants={fadeUp} className="inline-block px-4 py-2 bg-[#202020] text-[#DCFF00] rounded-full font-semibold text-sm mb-4 border border-[#DCFF00]/30">
            ⚡ Nima uchun bizni tanlashadi?
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-5xl font-bold mb-4">
            Bizning <span className="text-[#FFA400]">Afzalliklarimiz</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-gray-400 max-w-2xl mx-auto">
            Mijozlarimizga eng yaxshi tajriba va xizmatni taqdim etamiz
          </motion.p>
        </motion.div>

        {/* Xususiyatlar grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={cardGridVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                variants={fadeUp}
                key={index}
                className="group relative bg-[#202020] rounded-3xl p-8 shadow-lg hover:shadow-[#DCFF00]/20 hover:-translate-y-2 transition-all duration-500 border border-[#333]"
              >
                {/* Ikonka */}
                <div className="w-16 h-16 bg-gradient-to-br from-[#DCFF00] to-[#FFA400] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Icon className="w-8 h-8 text-[#030303]" />
                </div>
                {/* Sarlavha */}
                <h3 className="text-xl font-bold mb-3 group-hover:text-[#DCFF00] transition-colors duration-300">
                  {feature.title}
                </h3>
                {/* Tavsif */}
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
                {/* Hover chizig‘i */}
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#DCFF00] to-[#FFA400] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Pastdagi CTA */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.25 }}
        >
          <div className="inline-flex items-center gap-6 bg-gradient-to-r from-[#DCFF00] to-[#FFA400] text-[#030303] px-8 py-4 rounded-2xl shadow-xl hover:shadow-[#FFA400]/30 transition-all duration-300 group cursor-pointer">
            <div className="flex -space-x-3">
              {["😊", "🚗", "⭐", "💯"].map((emoji, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-[#030303]/10 border-2 border-[#030303] flex items-center justify-center text-xl group-hover:scale-110 transition-transform"
                >
                  {emoji}
                </div>
              ))}
            </div>
            <div className="text-left">
              <p className="font-bold text-lg flex items-center gap-2">
                25,000+ qoniqarli mijozlar
                <CheckCircle className="w-5 h-5" />
              </p>
              <p className="text-[#030303]/70 text-sm">Sizni ham kutamiz!</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
