import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  env: {
    NEXT_PUBLIC_API_URL: process.env.NODE_ENV === "development" ? "http://localhost:4000/api/v1" : "https://api.cwayacademy.com/api/v1",
    NEXT_PUBLIC_APP_URL: process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://cwayacademy.com",
  },
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "**.cloudflare.com" },
      { protocol: "https", hostname: "**.r2.dev" },
      { protocol: "https", hostname: "pub-*.r2.dev" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cwayacademy.netlify.app" },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "framer-motion"],
  },
  serverExternalPackages: ["canvas", "@napi-rs/canvas"],
};

export default nextConfig;
