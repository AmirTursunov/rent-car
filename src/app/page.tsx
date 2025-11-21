"use client";
import React, { useEffect } from "react";
import HeroSection from "../components/home/HeroSection";
import FeaturesSection from "../components/home/FeaturesSection";
import HowItWorksSection from "../components/home/HowItWorksSection";
import CategoriesSection from "../components/home/CategoriesSection";
import WhyChooseUsSection from "../components/home/WhyChooseUsSection";
import TestimonialsSection from "../components/home/TestimonialsSection";
import CTASection from "../components/home/CTASection";
import ScrollTopButton from "@/components/ScrollTopButton";
import { redirect } from "next/navigation";

const ModernHomePage = () => {
  const [settings, setSettings] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(true);
  useEffect(() => {
    const storedUser =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;
    const user = storedUser ? JSON.parse(storedUser) : null;

    // 2️⃣ Role tekshirish
    if (user?.role === "admin") {
      redirect("/admin"); // admin bo‘lsa redirect
      return; // fetch qilmasdan to‘xtaydi
    }
  }, []);
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await fetch("/api/settings", { cache: "no-store" });
        const json = await res.json();
        if (isMounted && json?.success) setSettings(json.data || {});
      } catch (e) {
        // silent fallback
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);
  return (
    <div className="min-h-screen flex flex-col">
      {/* 1. Hero Section - Asosiy qism */}
      <HeroSection />

      {/* 2. Search Section - Qidiruv */}
      {/* <SearchSection /> */}

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
      {/* <PricingSection /> */}

      {/* 10. CTA - Call to Action */}
      <CTASection />
      <ScrollTopButton />
    </div>
  );
};

export default ModernHomePage;
