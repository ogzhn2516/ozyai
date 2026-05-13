import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        fig: {
          ink: "#17211a",
          cream: "#f7f0df",
          sand: "#e9d9b7",
          clay: "#b8754d",
          moss: "#526b3f",
          leaf: "#91a865",
        },
      },
      boxShadow: {
        panel: "0 24px 80px rgba(43, 52, 36, 0.18)",
        card: "0 16px 40px rgba(43, 52, 36, 0.10)",
      },
      fontFamily: {
        display: ["Georgia", "Times New Roman", "serif"],
        sans: ["Trebuchet MS", "Verdana", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
