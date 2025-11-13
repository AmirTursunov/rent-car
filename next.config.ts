import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // <--- Build paytida ESLint xatolarini e'tiborsiz qoldiradi
  },
  typescript: {
    ignoreBuildErrors: true, // ✅ Buildda TypeScript xatolarini e'tiborsiz qiladi
  },
  // boshqa config opsiyalari ham bo‘lishi mumkin
};

export default nextConfig;
