"use client";
import React from "react";
import HeroSection from "../components/home/HeroSection";
import SearchSection from "../components/home/SearchSection";
import FeaturesSection from "../components/home/FeaturesSection";
import HowItWorksSection from "../components/home/HowItWorksSection";
// import PopularCarsSection from "../components/home/PopularCarsSection";
import CategoriesSection from "../components/home/CategoriesSection";
import WhyChooseUsSection from "../components/home/WhyChooseUsSection";
import TestimonialsSection from "../components/home/TestimonialsSection";
import PricingSection from "../components/home/PricingSection";
import CTASection from "../components/home/CTASection";

const ModernHomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex flex-col gap-50">
      {/* 1. Hero Section - Asosiy qism */}
      <HeroSection />

      {/* 2. Search Section - Qidiruv */}
      <SearchSection />

      {/* 3. Features Section - Xususiyatlar */}
      <FeaturesSection />

      {/* 4. How It Works - Qanday ishlaydi */}
      <HowItWorksSection />

      {/* 5. Popular Cars - Mashhur mashinalar */}
      {/* <PopularCarsSection /> */}

      {/* 6. Categories - Kategoriyalar */}
      <CategoriesSection />

      {/* 7. Why Choose Us - Nima uchun biz */}
      <WhyChooseUsSection />

      {/* 8. Testimonials - Mijozlar fikri */}
      <TestimonialsSection />

      {/* 9. Pricing - Narxlar */}
      <PricingSection />

      {/* 10. CTA - Call to Action */}
      <CTASection />
    </div>
  );
};

export default ModernHomePage;
