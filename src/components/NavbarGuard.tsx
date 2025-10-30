"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import { PublicSettings } from "../lib/function";

export interface NavbarGuardProps {
  settings: PublicSettings;
}

export default function NavbarGuard({ settings }: NavbarGuardProps) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) return null;

  return <Navbar settings={settings} />;
}
