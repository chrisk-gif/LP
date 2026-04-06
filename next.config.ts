import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  async redirects() {
    return [
      { source: "/dashboard", destination: "/", permanent: true },
      { source: "/i-dag", destination: "/idag", permanent: true },
      { source: "/mal", destination: "/maal", permanent: true },
    ];
  },
};

export default nextConfig;
