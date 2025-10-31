"use client";
import React from "react";
import { SettingsProvider } from "./context/SettingContext";
import { ToastProvider } from "./context/ToastContext";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <ToastProvider>{children}</ToastProvider>
    </SettingsProvider>
  );
}
