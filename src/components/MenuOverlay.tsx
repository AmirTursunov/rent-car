"use client";
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
  { href: "/#category", label: "Kategoriyalar" },
];

const navVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.12 },
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

export default function MenuOverlay({
  onClose,
  brandName,
}: {
  onClose: () => void;
  brandName: string;
}) {
  const [imgIdx, setImgIdx] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const timer = setInterval(() => {
      setImgIdx((prev) => (prev + 1) % images.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

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
    e.preventDefault();

    if (href.startsWith("/#")) {
      const id = href.split("#")[1];
      if (pathname !== "/") {
        router.push(`/#${id}`);
        setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 600);
      } else {
        document.getElementById(id)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
      onClose();
      return;
    }

    router.push(href);
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 w-screen h-screen app-gradient-bg z-[200] flex flex-col xl:flex-row items-stretch overflow-hidden"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.12 }}
    >
      {/* Chap qism (rasm) */}
      <div
        className="relative xl:w-[70vw] w-full h-[40vh] xl:h-full flex flex-col justify-end items-stretch"
        style={{
          backgroundImage: `url(${images[imgIdx]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Logotip */}
        <div className="absolute top-6 left-6 z-20">
          <span className="text-2xl md:text-3xl font-black tracking-tight text-yellow-400 drop-shadow-lg select-none">
            {brandName}
          </span>
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/20 to-black/75 pointer-events-none" />

        {/* Thumbnails */}
        <div className="absolute bottom-4 left-5 flex gap-2 z-10">
          {images.map((img, i) => (
            <button
              key={img}
              onClick={() => setImgIdx(i)}
              aria-label={`Switch to image ${i + 1}`}
              className={`h-12 w-20 md:h-16 md:w-24 rounded-lg overflow-hidden transition hover:scale-105 ${
                imgIdx === i
                  ? "opacity-100  outline-2 outline-yellow-400"
                  : "opacity-40"
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

      {/* O‘ng qism (menyu) */}
      <div className="app-gradient-bg-2 relative flex-1 flex flex-col justify-start items-end py-10 md:py-16 xl:py-20 px-6 md:px-12 xl:px-24 overflow-y-auto before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-10 before:bg-gradient-to-l before:from-black/40 before:via-transparent before:to-transparent before:z-30">
        {/* Yopish tugmasi */}
        <button
          className="absolute top-6 right-6 md:top-8 md:right-10 text-white hover:text-yellow-400 transition z-40"
          onClick={onClose}
          aria-label="Yopish"
        >
          <X className="w-8 h-8 md:w-10 md:h-10" />
        </button>

        {/* Menyu ro‘yxati */}
        <motion.nav
          className="flex flex-col gap-4 md:gap-6 mt-20 md:mt-32 items-end z-40"
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
                className="text-white text-base md:text-lg xl:text-[1.4rem] font-semibold tracking-tight leading-tight hover:text-yellow-400 transition-all duration-150 border-r-4 border-transparent hover:border-yellow-400 pr-6 md:pr-10"
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
