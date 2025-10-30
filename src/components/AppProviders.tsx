"use client";
import React from "react";
import { SettingsProvider } from "./context/SettingContext";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return <SettingsProvider>{children}</SettingsProvider>;
}
