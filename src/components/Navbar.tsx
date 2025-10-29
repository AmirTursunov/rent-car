"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Bosh sahifa" },
  { href: "/cars", label: "Mashinalar" },
  { href: "/bookings", label: "Buyurtmalarim" },
  { href: "/profile", label: "Profil" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-40">
      <div className="px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold">
          RentCar
        </Link>
        <nav className="flex items-center gap-4">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  active ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}


