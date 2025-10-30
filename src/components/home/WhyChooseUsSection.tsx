// components/home/WhyChooseUsSection.tsx
"use client";
import React from "react";
import {
  CheckCircle,
  Shield,
  Award,
  Clock,
  DollarSign,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const headerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.14 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.57 } },
};
const featuresListVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11, delayChildren: 0.24 } },
};
const statsGridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.20 } },
};

const WhyChooseUsSection = () => {
  const features = [
    {
      icon: Shield,
      title: "To'liq sug'urtalangan avtomobillar",
      description: "Barcha holatlar uchun kafolat",
    },
    {
      icon: Award,
      title: "Premium sifatli xizmat",
      description: "15 yillik tajriba va mukammallik",
    },
    {
      icon: DollarSign,
      title: "Eng yaxshi narxlar kafolati",
      description: "Raqobatbardosh va adolatli narxlar",
    },
    {
      icon: Clock,
      title: "24/7 qo'llab-quvvatlash",
      description: "Har qanday vaqtda yordam",
    },
    {
      icon: Zap,
      title: "Bepul yetkazib berish",
      description: "Shahar bo'ylab bepul xizmat",
    },
    {
      icon: Users,
      title: "Professional jamoa",
      description: "Tajribali va do'stona xodimlar",
    },
  ];

  const stats = [
    {
      number: "15+",
      label: "Yillik tajriba",
      color: "from-blue-500 to-cyan-500",
    },
    {
      number: "25K+",
      label: "Qoniqarli mijozlar",
      color: "from-purple-500 to-pink-500",
    },
    {
      number: "500+",
      label: "Avtomobillar",
      color: "from-orange-500 to-red-500",
    },
    {
      number: "98%",
      label: "Qayta mijozlar",
      color: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <section className="py-24 px-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div variants={headerVariants} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.45 }}>
            <motion.div variants={fadeUp} className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full font-semibold text-sm mb-6">
              💎 Nima uchun biz?
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Nima uchun bizni
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                tanlashadi?
              </span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-xl text-gray-300 mb-8 leading-relaxed">
              15 yillik tajriba va 25,000+ qoniqarli mijozlar bizga ishonishadi.
              Har bir sayohatingizni maxsus va xavfsiz qilamiz.
            </motion.p>
            {/* Features List */}
            <motion.div variants={featuresListVariants} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.33 }} className="space-y-4 mb-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    variants={fadeUp}
                    key={index}
                    className="flex items-start gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-lg font-bold mb-1">{feature.title}</p>
                      <p className="text-sm text-gray-400">{feature.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
            <Link href="/about">
              <motion.button
                className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-2xl hover:shadow-2xl hover:shadow-orange-500/50 transform hover:scale-105 transition-all duration-300"
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7 }}
                viewport={{ once: true, amount: 0.33 }}
              >
                Batafsil ma'lumot
              </motion.button>
            </Link>
          </motion.div>

          {/* Right Content - Image & Stats */}
          <div className="relative">
            {/* Main Image */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.92 }} viewport={{ once: true, amount: 0.33 }} className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800"
                alt="Luxury Car"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
              {/* Overlay Stats */}
              <div className="absolute bottom-8 left-8 right-8">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                      <Award className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">2024 yil mukofoti</p>
                      <p className="text-sm text-gray-300">Eng yaxshi rent-a-car xizmati</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            {/* Stats Grid */}
            <motion.div
              className="grid grid-cols-2 gap-4 mt-8"
              variants={statsGridVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
            >
              {stats.map((stat, index) => (
                <motion.div
                  variants={fadeUp}
                  key={index}
                  className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300 shadow-xl`}
                >
                  <p className="text-4xl font-bold text-white mb-2">{stat.number}</p>
                  <p className="text-sm text-white/90">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
