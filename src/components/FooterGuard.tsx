"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function FooterGuard({ settings }: any) {
  const pathname = usePathname();

  // /admin yoki /admin/... bo‘lsa footer ko‘rinmaydi
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return <Footer settings={settings} />;
}
