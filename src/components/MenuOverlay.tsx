import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";

const images = ["/menu1.jpg", "/menu2.jpg", "/menu3.jpg"];

const navLinks = [
  { href: "/", label: "Bosh sahifa" },
  { href: "/cars", label: "Mashinalar" },
  { href: "/bookings", label: "Buyurtmalarim" },
  { href: "/profile", label: "Profil" },
  { href: "/about", label: "Biz haqimizda" },
  { href: "/#contact", label: "Kontaktlar" },
];

const navVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.12,
    },
  },
};

const navItemVariants = {
  hidden: { opacity: 0, x: 30 },
  show: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.22, delay: i * 0.03 },
  }),
};

export default function MenuOverlay({ onClose, brandName }: { onClose: () => void, brandName: string }) {
  const [imgIdx, setImgIdx] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const timer = setInterval(() => {
      setImgIdx((prev) => (prev + 1) % images.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // Prefetch common routes for instant nav
  useEffect(() => {
    ["/", "/cars", "/bookings", "/profile", "/about"].forEach((r) => {
      try {
        router.prefetch?.(r as any);
      } catch (_) {}
    });
  }, [router]);

  const handleNavClick = async (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    href: string
  ) => {
    // In-page anchor like '/#contact'
    if (href.startsWith("/#")) {
      e.preventDefault();
      const id = href.split("#")[1];
      if (pathname !== "/") {
        router.push(href);
      } else {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      try { window.dispatchEvent(new Event("contact-focus")); } catch(_) {}
      onClose();
      return;
    }
    // Normal route navigation — push immediately, then close overlay
    e.preventDefault();
    router.push(href);
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 w-screen h-screen app-gradient-bg z-[100] flex items-stretch overflow-hidden"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.12 }}
    >
      {/* Chap - BG image bilan o'ngdan gradient overlay va brend */}
      <div
        className="relative w-[70vw] min-w-[380px] max-w-[1200px] flex flex-col justify-end items-stretch"
        style={{
          backgroundImage: `url(${images[imgIdx]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Logotip yuqorida chapda */}
        <div className="absolute top-8 left-8 z-20">
          <span className="text-3xl font-black tracking-tight text-yellow-400 drop-shadow-lg select-none">
            {brandName}
          </span>
        </div>
        {/* YANGI: O'ng tomonga qorayish uchun horizontal gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/20 to-black/75 pointer-events-none" />
        {/* Previews/thumbnails - brandigo-style, bottom left */}
        <div className="absolute bottom-6 left-7 flex gap-2 z-10">
          {images.map((img, i) => (
            <button
              key={img}
              onClick={() => setImgIdx(i)}
              aria-label={`Switch to image ${i + 1}`}
              className={`h-16 w-24 rounded-lg overflow-hidden transition hover:scale-105 border-none p-0 shadow-none ${
                imgIdx === i ? "opacity-100 outline-2 outline-yellow-400" : "opacity-40"
              }`}
              style={{ background: "rgba(0,0,0,0.25)" }}
            >
              <img
                src={img}
                alt="menu thumb"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
      {/* O‘ng - Menyular va X. Chap ssilkasiga diffuz shadow efekt */}
      <div className="relative grow flex flex-col justify-start items-end py-20 px-24 overflow-y-auto before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-14 before:bg-gradient-to-l before:from-black/40 before:via-transparent before:to-transparent before:z-30">
        <button
          className="absolute top-10 right-12 text-white text-3xl hover:text-yellow-400 transition z-40"
          onClick={onClose}
          aria-label="Yopish"
        >
          <X className="w-10 h-10" />
        </button>
        <motion.nav
          className="flex flex-col gap-6 mt-32 items-end z-40"
          variants={navVariants}
          initial="hidden"
          animate="show"
        >
          {navLinks.map((link, i) => (
            <motion.li
              key={link.href}
              className="list-none"
              custom={i}
              variants={navItemVariants}
            >
              <Link
                href={link.href}
                prefetch
                className="text-white text-[1rem] md:text-[1.40rem] font-semibold tracking-tight leading-tight hover:text-yellow-400 transition-all duration-150 border-r-4 border-transparent hover:border-yellow-400 pr-10"
                onClick={(e) => handleNavClick(e, link.href)}
              >
                {"/ " + link.label}
              </Link>
            </motion.li>
          ))}
        </motion.nav>
      </div>
    </motion.div>
  );
}
