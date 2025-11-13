import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // <--- Build paytida ESLint xatolarini e'tiborsiz qoldiradi
  },
  // boshqa config opsiyalari ham bo‘lishi mumkin
};

export default nextConfig;
