import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["mammoth", "pdf-parse", "pdfjs-dist", "tesseract.js"],
};

export default nextConfig;
