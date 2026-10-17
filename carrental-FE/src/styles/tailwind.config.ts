import type { Config } from "tailwindcss";
import tokens from "./tokens.json";

export default {
  // Đường dẫn tính từ thư mục chứa file này (src/styles).
  content: ["../../index.html", "../**/*.{ts,tsx}"],
  theme: { extend: tokens as unknown as Config["theme"] },
  plugins: [],
} satisfies Config;
