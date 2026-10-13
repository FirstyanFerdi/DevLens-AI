import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        miku: {
          cyan: "#39C5BB",
          "cyan-bright": "#56D8CE",
          "cyan-dark": "#299C94",
          "cyan-deep": "#1B6D67",
          mint: "#E0F7F6",
          "mint-light": "#F0FDFD",
          "mint-border": "#C7F1EE",
          pink: "#FF6B9D",
          "pink-vivid": "#E12885",
          "pink-soft": "#FFEBF2",
          slate: "#334155",
          "slate-dark": "#1E293B",
          "slate-light": "#475569",
          "slate-subtle": "#64748B",
          mist: "#F3F7FA",
        },
      },
      borderRadius: {
        "3xl": "1.5rem", // 24px
        "4xl": "2rem",
      },
      boxShadow: {
        miku: "0 10px 25px -5px rgba(57, 197, 187, 0.15), 0 8px 10px -6px rgba(57, 197, 187, 0.1)",
        "miku-lg": "0 20px 35px -5px rgba(57, 197, 187, 0.25), 0 10px 15px -5px rgba(57, 197, 187, 0.15)",
        "miku-glow": "0 0 20px rgba(57, 197, 187, 0.4)",
        "pink-glow": "0 0 20px rgba(255, 107, 157, 0.4)",
        card: "0 4px 20px 0 rgba(44, 62, 80, 0.06)",
        "card-hover": "0 12px 30px 0 rgba(44, 62, 80, 0.12)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 4s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
