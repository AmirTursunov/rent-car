// components/home/Navbar.tsx
"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, User } from "lucide-react";
import MenuOverlay from "./MenuOverlay";
import { NavbarGuardProps } from "./NavbarGuard";

export default function Navbar({ settings }: NavbarGuardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        setIsLoggedIn(!!token);
      } catch (_) {
        setIsLoggedIn(false);
      }
    };

    checkAuth();

    const onStorage = (e: StorageEvent) => {
      if (e.key === "token") {
        checkAuth();
      }
    };

    const onAuthChanged = () => checkAuth();

    window.addEventListener("storage", onStorage);
    window.addEventListener("auth-changed", onAuthChanged as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("auth-changed", onAuthChanged as EventListener);
    };
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

          {/* Sign In / Profile + Menu */}
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <Link
                href="/profile"
                className="p-2 rounded-xl border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black transition inline-flex items-center justify-center"
                aria-label="Profile"
                title="Profile"
              >
                <User className="w-5 h-5" />
              </Link>
            ) : (
              <Link
                href="/sign-in"
                className="px-4 py-2 rounded-xl border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black transition"
              >
                Sign In
              </Link>
            )}

            <button
              onClick={() => setIsOpen(true)}
              className="text-yellow-400 hover:text-orange-400 transition"
            >
              <Menu className="w-7 h-7" />
            </button>
          </div>
        </div>
      </div>

      {/* MenuOverlay */}
      {isOpen && (
        <MenuOverlay
          onClose={() => setIsOpen(false)}
          brandName={settings.companyName}
        />
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
