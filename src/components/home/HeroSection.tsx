// components/home/HeroSection.tsx
"use client";
import React from "react";
import { Play, Star, CheckCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { redirect } from "next/navigation";

const HeroSection = () => {
  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.16,
      },
    },
  };
  const fadeVariant = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7 } },
  };
  const fadeScaleVariant = {
    hidden: { opacity: 0, scale: 0.92 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.8 } },
  };

  return (
    <div className="relative min-h-screen overflow-hidden ">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url(/bg-rent.jpg)] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-transparent"></div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        className="relative max-w-7xl mx-auto px-6 pt-32 pb-20"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white space-y-8">
            <motion.div
              variants={fadeVariant}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20"
            >
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium">4.9/5 reytingga ega</span>
              <span className="text-xs text-white/70">(15,000+ sharh)</span>
            </motion.div>

            <motion.h1
              variants={fadeScaleVariant}
              className="text-6xl md:text-7xl font-bold leading-tight"
            >
              Orzuingizdagi
              <span className="block bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Avtomobilni
              </span>
              ijaraga oling
            </motion.h1>

            <motion.p
              variants={fadeVariant}
              className="text-xl text-white/80 leading-relaxed max-w-xl"
            >
              Premium avtomobillar, eng yaxshi narxlar va ajoyib xizmat.
              Sayohatingizni unutilmas qiling!
            </motion.p>

            <motion.div variants={fadeVariant} className="flex flex-wrap gap-4">
              <button
                onClick={() => redirect("/cars")}
                className="group px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-2xl hover:shadow-2xl hover:shadow-orange-500/50 transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                Hozir boshlash
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button className="group px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-2xl border-2 border-white/20 hover:bg-white/20 transition-all duration-300 flex items-center gap-2">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Play className="w-4 h-4 fill-current" />
                </div>
                Video ko'rish
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20"
              variants={containerVariants}
            >
              <motion.div variants={fadeVariant}>
                <p className="text-3xl font-bold text-yellow-400">500+</p>
                <p className="text-sm text-white/70">Avtomobillar</p>
              </motion.div>
              <motion.div variants={fadeVariant}>
                <p className="text-3xl font-bold text-pink-400">25K+</p>
                <p className="text-sm text-white/70">Mijozlar</p>
              </motion.div>
              <motion.div variants={fadeVariant}>
                <p className="text-3xl font-bold text-purple-400">15+</p>
                <p className="text-sm text-white/70">Yillik tajriba</p>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Content - Car Image */}
          <div className="relative">
            {/* Floating Cards */}
            <div className="absolute top-10 -left-10 bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-2xl animate-float-slow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="text-white">
                  <p className="font-bold">To'liq sug'urtalangan</p>
                  <p className="text-xs text-white/70">100% xavfsizlik</p>
                </div>
              </div>
            </div>

            <div className="absolute bottom-10 -right-10 bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-2xl animate-float">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-white fill-current" />
                </div>
                <div className="text-white">
                  <p className="font-bold">Premium sifat</p>
                  <p className="text-xs text-white/70">Yuqori darajada</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-white rounded-full"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes float-slow {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default HeroSection;
