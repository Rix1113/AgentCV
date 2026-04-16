import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f5f7fb",
        surface: "#ffffff",
        surfaceAlt: "#eef3ff",
        border: "#d9e0ef",
        accent: "#375dfb",
        accentSoft: "#e7eeff",
        ink: "#16213e",
        muted: "#62708a",
      },
      boxShadow: {
        card: "0 18px 50px rgba(23, 37, 84, 0.08)",
        soft: "0 10px 30px rgba(55, 93, 251, 0.08)",
      },
    },
  },
  plugins: [],
} satisfies Config;
