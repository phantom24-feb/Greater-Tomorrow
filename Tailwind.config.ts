import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#14213D",
          ink: "#0D1730",
        },
        oxblood: {
          DEFAULT: "#5C1A24",
          dark: "#47141C",
        },
        bgsoft: "#F4F6FA",
        ink: "#12172B",
        muted: "#5B647A",
        bordersoft: "#DDE2EC",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "sans-serif"],
      },
      keyframes: {
        "hero-rise": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "hero-rise": "hero-rise 0.7s ease both",
      },
    },
  },
  plugins: [],
};

export default config;
