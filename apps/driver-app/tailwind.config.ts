import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        graphite: "#18212f",
        signal: "#2563eb",
        go: "#059669"
      }
    }
  },
  plugins: []
};

export default config;
