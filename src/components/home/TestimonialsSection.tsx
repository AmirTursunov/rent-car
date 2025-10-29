// components/home/TestimonialsSection.tsx
"use client";
import React, { useState } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "Sardor Rahimov",
      role: "Tadbirkor",
      image: "https://i.pravatar.cc/150?img=12",
      rating: 5,
      text: "Ajoyib xizmat! Avtomobil tozaligi va sifati meni hayratda qoldirdi. Narxlar ham juda qulay. Albatta yana murojaat qilaman.",
      date: "2 hafta oldin",
    },
    {
      id: 2,
      name: "Nilufar Karimova",
      role: "Marketing menejeri",
      image: "https://i.pravatar.cc/150?img=45",
      rating: 5,
      text: "Professional jamoa va tezkor xizmat. To'y marosimimiz uchun lux avtomobil ijaraga oldik. Hamma narsa mukammal bo'ldi!",
      date: "1 oy oldin",
    },
    {
      id: 3,
      name: "Javohir Tursunov",
      role: "IT mutaxassis",
      image: "https://i.pravatar.cc/150?img=33",
      rating: 5,
      text: "Onlayn bron qilish jarayoni juda sodda. Qo'llab-quvvatlash xizmati 24/7 ishlaydi. Juda qulayroq narxlarda premium avtomobillar.",
      date: "3 hafta oldin",
    },
    {
      id: 4,
      name: "Madina Alieva",
      role: "Fotograf",
      image: "https://i.pravatar.cc/150?img=23",
      rating: 5,
      text: "Men muntazam mijozman. Har safar yangi tajriba va professional munosabat. Barcha do'stlarimga tavsiya qilaman!",
      date: "1 hafta oldin",
    },
  ];

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  return (
    <section className="py-24 px-6 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full font-semibold text-sm mb-4">
            💬 Mijozlar fikri
          </div>
          <h2 className="text-5xl font-bold text-white mb-4">
            Mijozlarimiz
            <span className="bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
              {" "}
              Biz Haqimizda
            </span>
          </h2>
          <p className="text-xl text-white/80">
            25,000+ qoniqarli mijozlar bizga ishonishadi
          </p>
        </div>

        {/* Testimonials Slider */}
        <div className="relative">
          {/* Main Testimonial */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20 shadow-2xl">
              {/* Quote Icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mb-8 mx-auto">
                <Quote className="w-8 h-8 text-white" />
              </div>

              {/* Rating */}
              <div className="flex items-center justify-center gap-1 mb-6">
                {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-6 h-6 text-yellow-400 fill-current"
                  />
                ))}
              </div>

              {/* Text */}
              <p className="text-2xl text-white text-center leading-relaxed mb-8 font-medium">
                "{testimonials[activeIndex].text}"
              </p>

              {/* Author */}
              <div className="flex items-center justify-center gap-4">
                <img
                  src={testimonials[activeIndex].image}
                  alt={testimonials[activeIndex].name}
                  className="w-16 h-16 rounded-full border-4 border-white/20"
                />
                <div className="text-left">
                  <p className="text-xl font-bold text-white">
                    {testimonials[activeIndex].name}
                  </p>
                  <p className="text-white/70">
                    {testimonials[activeIndex].role}
                  </p>
                  <p className="text-sm text-white/50">
                    {testimonials[activeIndex].date}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={prevTestimonial}
                className="w-14 h-14 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full flex items-center justify-center transition-all border border-white/20"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>

              {/* Dots */}
              <div className="flex items-center gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`transition-all rounded-full ${
                      index === activeIndex
                        ? "w-8 h-3 bg-white"
                        : "w-3 h-3 bg-white/30 hover:bg-white/50"
                    }`}
                  ></button>
                ))}
              </div>

              <button
                onClick={nextTestimonial}
                className="w-14 h-14 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full flex items-center justify-center transition-all border border-white/20"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          {/* Side Testimonials Preview */}
          <div className="hidden lg:block">
            {/* Previous */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-64 opacity-30 hover:opacity-50 transition-opacity">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={
                      testimonials[
                        (activeIndex - 1 + testimonials.length) %
                          testimonials.length
                      ].image
                    }
                    alt=""
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="text-white font-semibold text-sm">
                      {
                        testimonials[
                          (activeIndex - 1 + testimonials.length) %
                            testimonials.length
                        ].name
                      }
                    </p>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-3 h-3 text-yellow-400 fill-current"
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-white/70 text-sm line-clamp-3">
                  {
                    testimonials[
                      (activeIndex - 1 + testimonials.length) %
                        testimonials.length
                    ].text
                  }
                </p>
              </div>
            </div>

            {/* Next */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 opacity-30 hover:opacity-50 transition-opacity">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={
                      testimonials[(activeIndex + 1) % testimonials.length]
                        .image
                    }
                    alt=""
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="text-white font-semibold text-sm">
                      {
                        testimonials[(activeIndex + 1) % testimonials.length]
                          .name
                      }
                    </p>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-3 h-3 text-yellow-400 fill-current"
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-white/70 text-sm line-clamp-3">
                  {testimonials[(activeIndex + 1) % testimonials.length].text}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
          {[
            { number: "25K+", label: "Qoniqarli mijozlar" },
            { number: "4.9/5", label: "O'rtacha reyting" },
            { number: "98%", label: "Qayta mijozlar" },
            { number: "500+", label: "Avtomobillar" },
          ].map((stat, index) => (
            <div
              key={index}
              className="text-center bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
            >
              <p className="text-4xl font-bold text-white mb-2">
                {stat.number}
              </p>
              <p className="text-white/70">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
