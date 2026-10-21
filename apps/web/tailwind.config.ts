import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#061116",
        midnight: "#10222E",
        slate: "#344B60",
        cyan: {
          DEFAULT: "#65D8F5",
          glow: "rgba(101, 216, 245, 0.4)"
        },
        mint: {
          DEFAULT: "#77E8C2",
          glow: "rgba(119, 232, 194, 0.4)"
        },
        primary: "#F0F6FC",
        secondary: "#A9BDCD",
        subtle: "rgba(145, 190, 210, 0.18)",
        glass: "rgba(35, 57, 74, 0.55)"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(101, 216, 245, 0.25)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)"
      }
    },
  },
  plugins: [],
};

export default config;
