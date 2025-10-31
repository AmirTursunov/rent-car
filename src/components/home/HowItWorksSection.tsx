// components/home/HowItWorksSection.tsx
"use client";
import React from "react";
import { Search, Calendar, Key, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useSettings } from "../context/SettingContext";
const headerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stepsGridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const HowItWorksSection = () => {
  const { settings } = useSettings();
  const steps = [
    {
      icon: Search,
      title: "Avtomobil tanlang",
      description:
        "500+ dan ortiq avtomobillar orasidan o'zingizga mos keladiganini toping.",
      gradient: "from-yellow-400 to-orange-500",
      number: "01",
    },
    {
      icon: Calendar,
      title: "Sana belgilang",
      description:
        "Qulay sana va vaqtni tanlang — bron qilish jarayoni bir necha daqiqa.",
      gradient: "from-orange-500 to-yellow-400",
      number: "02",
    },
    {
      icon: Key,
      title: "Kalitlarni oling",
      description:
        "Manzilga yetkazib beramiz yoki o‘zingiz kelib olishingiz mumkin.",
      gradient: "from-yellow-400 to-orange-500",
      number: "03",
    },
    {
      icon: CheckCircle,
      title: "Zavqlaning",
      description: "Xavfsiz, qulay va ishonchli sayohatdan bahramand bo‘ling.",
      gradient: "from-orange-500 to-yellow-400",
      number: "04",
    },
  ];

  return (
    <section className="py-24 px-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        className="max-w-7xl mx-auto relative z-10 text-center mb-20"
        variants={headerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.5 }}
      >
        <motion.div
          variants={fadeUp}
          className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full font-semibold text-sm mb-6"
        >
          ⚡ Qadam-baqadam
        </motion.div>
        <motion.h2
          variants={fadeUp}
          className="text-5xl md:text-6xl font-bold mb-6 leading-tight"
        >
          Bu qanday{" "}
          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            ishlaydi?
          </span>
        </motion.h2>
        <motion.p variants={fadeUp} className="text-lg text-gray-300">
          Avtomobil ijarasi 4 ta oddiy qadamda amalga oshadi.
        </motion.p>
      </motion.div>

      <motion.div
        className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 relative z-10"
        variants={stepsGridVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.div
              variants={fadeUp}
              key={index}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 shadow-xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 group relative overflow-hidden"
            >
              {/* Step Number */}
              <div className="absolute top-6 left-6 text-8xl font-extrabold text-gray-700/20 select-none z-0">
                {step.number}
              </div>
              {/* Icon */}
              <div
                className={`w-16 h-16 bg-gradient-to-br ${step.gradient} rounded-2xl flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform duration-300`}
              >
                <Icon className="w-8 h-8 text-white" />
              </div>
              {/* Title */}
              <h3 className="text-xl font-bold mb-3 relative z-10 text-white">
                {step.title}
              </h3>
              {/* Description */}
              <p className="text-gray-300 leading-relaxed relative z-10">
                {step.description}
              </p>
              {/* Bottom border animation */}
              <div
                className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${step.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}
              ></div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* CTA */}
      <motion.div
        className="text-center mt-20"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.73 }}
        viewport={{ once: true, amount: 0.35 }}
      >
        <p className="text-gray-400 mb-6">
          Hali ham savollaringiz bormi? Biz doimo yordam beramiz.
        </p>
        <a
          href={`tel:${(settings.phone || "").replace(/\s/g, "")}`}
          className="relative px-8 py-4 font-bold text-black rounded-2xl
             bg-gradient-to-r from-yellow-400 to-orange-500 
             transition-transform duration-300 transform hover:scale-105
             before:content-[''] before:absolute before:inset-0 before:rounded-2xl 
             before:transition-all before:duration-300 
             before:shadow-[0_0_25px_rgba(255,165,0,0)] 
             hover:before:shadow-[0_0_25px_rgba(255,165,0,0.6)] 
             before:-z-10"
        >
          Biz bilan bog‘lanish
        </a>
      </motion.div>
    </section>
  );
};

export default HowItWorksSection;
