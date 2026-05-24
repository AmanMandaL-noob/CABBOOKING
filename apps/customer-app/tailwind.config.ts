import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17202a",
        mint: "#0f766e",
        amberline: "#f59e0b"
      }
    }
  },
  plugins: []
};

export default config;
