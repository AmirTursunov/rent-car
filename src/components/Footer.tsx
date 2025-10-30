"use client";

import { NavbarGuardProps } from "./NavbarGuard";

export default function Footer({ settings }: NavbarGuardProps) {
  return (
    <footer className="relative  border-t border-white/10 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Gradient Overlay (light shimmer) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

      <div className="relative max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left */}
        <p className="text-sm text-white/70">
          © {new Date().getFullYear()}{" "}
          <span className="text-yellow-400 font-semibold">
            {settings.companyName}
          </span>
          . Barcha huquqlar himoyalangan.
        </p>

        {/* Right */}
        <div className="flex gap-6 text-sm">
          <a
            href="/privacy"
            className="text-white/70 hover:text-yellow-400 transition-colors duration-300"
          >
            Maxfiylik
          </a>
          <a
            href="/terms"
            className="text-white/70 hover:text-yellow-400 transition-colors duration-300"
          >
            Shartlar
          </a>
        </div>
      </div>

      {/* Subtle top glow line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-yellow-400/20 via-pink-400/20 to-purple-400/20"></div>
    </footer>
  );
}
