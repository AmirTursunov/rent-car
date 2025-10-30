// components/home/Navbar.tsx
"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import MenuOverlay from "./MenuOverlay";
import { NavbarGuardProps } from "./NavbarGuard";
export default function Navbar({ settings }: NavbarGuardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [brandName, setBrandName] = useState("RentCar");

  useEffect(() => {
    // Bunda brand nomi backendan olinishi mumkin (fetch yoki props orqali), hozircha static
    async function fetchBrand() {
      // const resp = await fetch('/api/settings');
      // const json = await resp.json();
      // setBrandName(json.brandName);
      setBrandName("RentCar");
    }
    fetchBrand();
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex items-center justify-between h-20 py-4">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 bg-clip-text text-transparent hover:opacity-90 transition-opacity"
          >
            {settings.companyName}
          </Link>
          {/* BAR faqat o'ng tomonda */}
          <button
            onClick={() => setIsOpen(true)}
            className="text-yellow-400 hover:text-orange-400 transition"
          >
            <Menu className="w-7 h-7" />
          </button>
        </div>
      </div>
      {/* MenuOverlay */}
      {isOpen && (
        <MenuOverlay onClose={() => setIsOpen(false)} brandName={brandName} />
      )}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out;
        }
      `}</style>
    </header>
  );
}
