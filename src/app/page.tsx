"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import HeroSection from "../components/home/HeroSection";
import FeaturesSection from "../components/home/FeaturesSection";
import HowItWorksSection from "../components/home/HowItWorksSection";
import CategoriesSection from "../components/home/CategoriesSection";
import WhyChooseUsSection from "../components/home/WhyChooseUsSection";
import TestimonialsSection from "../components/home/TestimonialsSection";
import CTASection from "../components/home/CTASection";
import ScrollTopButton from "@/components/ScrollTopButton";

const ModernHomePage = () => {
  const router = useRouter();
  const [settings, setSettings] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // 🔐 Faqat ADMIN bo‘lsa redirect
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return; // ❗ sign-in qilmagan → home ochiq

    const user = JSON.parse(storedUser);

    if (user?.role === "admin") {
      router.replace("/admin"); // ✅ client-safe redirect
    }
  }, [router]);

  // ⚙️ Settings fetch
  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const res = await fetch("/api/settings", { cache: "no-store" });
        const json = await res.json();
        if (isMounted && json?.success) {
          setSettings(json.data || {});
        }
      } catch {
        // silent
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
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CategoriesSection />
      <WhyChooseUsSection />
      <TestimonialsSection />
      <CTASection />
      <ScrollTopButton />
    </div>
  );
};

export default ModernHomePage;
