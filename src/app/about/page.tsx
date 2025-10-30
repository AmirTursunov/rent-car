"use client";
import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, Star, Shield, Award, Users, Zap, Clock, MapPin, Mail, Linkedin, Calendar, ArrowRight } from "lucide-react";
import Image from "next/image";

const headerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.11 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const cardGridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.18 } },
};

const advantages = [
  {
    icon: <Shield className="w-7 h-7 text-yellow-400" />,    
    title: "To'liq sug'urtalangan flot",
    desc: "Barcha avtomobillar har tomonlama sug‘urtalangan va texnik holati yuqori darajada nazorat qilinadi.",
    bg: "from-yellow-300/5 to-yellow-600/10"
  },
  {
    icon: <Award className="w-7 h-7 text-pink-500" />,
    title: "25,000+ mijoz ishonchi",
    desc: "Biz haqimizda doim faqat ijobiy fikrlar va baland reyting — yuqori xizmat standarti garovi.",
    bg: "from-pink-300/10 to-pink-600/10"    
  },
  {
    icon: <Users className="w-7 h-7 text-indigo-500" />,
    title: "Professional jamoa",
    desc: "Tajriba va sadoqatli mutaxassislar har bir buyurtmada do‘stona va tezkor yondashuvni ta'minlaydi.",
    bg: "from-indigo-300/10 to-indigo-700/10"
  },
  {
    icon: <Zap className="w-7 h-7 text-orange-400" />,
    title: "Zamonaviy va premium flot",
    desc: "Faqat so‘nggi model, premium va toza avtomobillar — brendlar testdan o‘tgan.",
      bg: "from-orange-300/10 to-orange-600/10"
  },
  {
    icon: <Clock className="w-7 h-7 text-green-400" />,
    title: "Doyim yordam — 24/7!",
    desc: "Istalgan paytda savol yoki yordam? Telefon, ijtimoiy tarmoq va onlayn chat doim ochiq.",
      bg: "from-green-400/20 to-green-600/10"
  },
  {
    icon: <MapPin className="w-7 h-7 text-purple-400" />,
    title: "Toshkent va viloyatlar",
    desc: "Yetkazib berish va taqdimot xizmatlari nafaqat poytaxt, balki butun respublika bo‘ylab!",
    bg: "from-purple-300/10 to-purple-600/10"
  },
];

const team = [
  {
    name: "Dilshod Ismoilov",
    role: "Bosh direktor / Founder",
    avatar: "/team1.jpg",
    linkedin: "#",
    desc: "Avtomobillar va servis sohasida 12+ yil tajriba, mukammallik va innovatsiya asoschisi.",
  },
  {
    name: "Sardor Yusupov",
    role: "Xizmat rahbari",
    avatar: "/team2.jpg",
    linkedin: "#",
    desc: "Jamoamizga jo‘shqinlik va qulaylik olib kiradi, eng samimiy support lideri!",
  },
  {
    name: "Madina Qodirova",
    role: "Mijozlar bilan ishlash",
    avatar: "/team3.jpg",
    linkedin: "#",
    desc: "Aloqadorlik va tavsiya — har bir mijozni eslaydi va qulay yechim taklif qiladi.",
  },
];

const timeline = [
  {
    year: "2021",
    icon: <Calendar className="w-5 h-5 text-yellow-400" />,    
    title: "Kompaniya asos solindi",
    desc: "RentCar brendi dunyoga keldi va Toshkentga birinchi mashinalar taqdim etildi.",
  },
  {
    year: "2022",
    icon: <Star className="w-5 h-5 text-pink-400" />,    
    title: "10,000-chi mijozimiz!",
    desc: "Yangilanish, yangi flot va ko‘plab hamkorlar — geografiyamiz kengaydi.",
  },
  {
    year: "2023",
    icon: <Award className="w-5 h-5 text-indigo-400" />,    
    title: "Eng yaxshi mahalliy servis",
    desc: "Yuqori sifat mukofoti va O‘zbekiston bo‘ylab kengayish.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen text-white">
      {/* Hero Section */}
      <section className="relative py-28 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500 rounded-full blur-3xl"></div>
        </div>
        <motion.div
          className="relative max-w-5xl mx-auto text-center"
          variants={headerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm mb-6">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span>Biz haqimizda</span>
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl font-extrabold mb-4">
            RentCar — Sizning ishonchli hamkoringiz
          </motion.h1>
          <motion.p variants={fadeUp} className="text-lg text-white/80 max-w-3xl mx-auto">
            Biz mijozlarimizga premium avtomobillar, qulay narxlar va doimo yoningizda bo‘ladigan xizmatni taklif etamiz. Maqsadimiz — har bir safaringizni yanada yoqimli va xavfsiz qilish.
          </motion.p>
        </motion.div>
      </section>

      {/* Values Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
          <motion.div
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-4">Bizning qadriyatlar</h2>
            <ul className="space-y-3 text-white/80">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                Ishonchlilik va shaffoflik — har bir mijoz bilan adolatli munosabat.
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                Xavfsizlik — avtomobillarimiz muntazam texnik ko‘rikdan o‘tadi.
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                Qulaylik — onlayn bron qilish, tezkor yetkazib berish va 24/7 yordam.
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                Qadr — mijozlarimizning vaqtini va ehtiyojlarini qadrlaymiz.
              </li>
            </ul>
          </motion.div>

          <motion.div
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2 className="text-3xl font-bold mb-4">Nega biz?</h2>
            <div className="space-y-4 text-white/80">
              <p className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-yellow-400 mt-1" />
                To‘liq sug‘urtalangan avtomobillar, premium tozaligi va tayyor holat.
              </p>
              <p className="flex items-start gap-3">
                <Star className="w-5 h-5 text-pink-400 mt-1" />
                25,000+ qoniqarli mijozlar va yuqori reyting — sifat kafolati.
              </p>
              <p className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
                Tez va qulay: onlayn bron, shartnoma va yetkazib berish xizmati.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Afzalliklar (Advantages) Grid */}
      <section className="py-20 px-6">
        <motion.div
          className="max-w-7xl mx-auto"
          variants={cardGridVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <h2 className="text-4xl md:text-5xl font-black text-center mb-12 text-yellow-400 drop-shadow">Bizning afzalliklarimiz</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advantages.map((adv, i) => (
              <motion.div
                variants={fadeUp}
                key={i}
                className={`bg-gradient-to-br ${adv.bg} rounded-2xl border border-white/10 p-8 flex flex-col gap-4 shadow-xl`}
              >
                <div className="flex items-center gap-3 mb-2">{adv.icon}<b className="text-lg">{adv.title}</b></div>
                <div className="text-white/90">{adv.desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-6">
        <motion.div
          className="max-w-6xl mx-auto"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <h2 className="text-4xl md:text-5xl font-black text-center mb-12 text-pink-400 drop-shadow">Jamoamiz</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {team.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.07 }}
                viewport={{ once: true, amount: 0.2 }}
                className="bg-white/10 rounded-2xl border border-white/15 backdrop-blur-md p-8 flex flex-col items-center text-center shadow-lg"
              >
                <div className="rounded-full overflow-hidden border-4 border-yellow-400 shadow-xl w-28 h-28 mb-4">
                  <Image src={item.avatar} width={112} height={112} alt={item.name} className="object-cover w-28 h-28" />
                </div>
                <div className="font-bold text-xl mb-1 text-yellow-300">{item.name}</div>
                <div className="text-white/80 text-sm mb-2">{item.role}</div>
                <div className="text-white/70 text-sm mb-3">{item.desc}</div>
                <div className="flex gap-3">
                  <a href={item.linkedin} target="_blank" rel="noopener" className="hover:text-blue-400"><Linkedin className="w-5 h-5" /></a>
                  <a href="#" className="hover:text-purple-400"><Mail className="w-5 h-5" /></a>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-10 text-green-300 drop-shadow">Kompaniya tarixi</h2>
          <ul className="flex flex-col gap-7 border-l-2 border-yellow-400/30 pl-6">
            {timeline.map((item, i) => (
              <li key={i} className="relative flex flex-col gap-2 ml-1">
                <div className="absolute -left-6 top-2 bg-gradient-to-br from-yellow-300/70 to-pink-300/70 rounded-full w-7 h-7 flex items-center justify-center shadow">
                  {item.icon}
                </div>
                <span className="uppercase tracking-wider text-yellow-400 font-bold text-xs">{item.year}</span>
                <span className="font-semibold text-lg text-white drop-shadow-sm">{item.title}</span>
                <span className="text-white/80 text-base">{item.desc}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA && Contacts */}
      <section className="py-16 px-6">
        <motion.div
          className="max-w-xl mx-auto bg-white/10 rounded-2xl p-10 text-center border border-white/15 backdrop-blur-lg shadow-xl"
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.66 }}
        >
          <h2 className="text-3xl font-bold mb-3 text-yellow-400 drop-shadow">Savolingiz bormi?</h2>
          <p className="text-lg mb-7 text-white/80">Bizga bemalol yozing — jamoamiz tez va ochiq fikr bilan javob beradi!</p>
          <a
            href="mailto:info@rentcar.uz"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-2xl hover:shadow-2xl hover:shadow-orange-500/50 transform hover:scale-105 transition-all duration-300"
          >
            <Mail className="w-5 h-5" /> info@rentcar.uz <ArrowRight className="w-6 h-6" />
          </a>
        </motion.div>
      </section>
    </div>
  );
}
