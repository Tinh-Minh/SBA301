import type { Config } from "tailwindcss";
import tokens from "./src/styles/tokens.json";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: tokens as unknown as Config["theme"] },
  plugins: [],
} satisfies Config;
