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
        background: "#0b1020",
        surface: "#121935",
        border: "#24304f",
        accent: "#7dd3fc",
      },
    },
  },
  plugins: [],
} satisfies Config;
