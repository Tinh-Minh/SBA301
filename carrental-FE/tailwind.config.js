import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const tokens = require("./src/shared/styles/tokens.json");

/** @type {import("tailwindcss").Config} */
export default {
  content: ["./src/**/*.{js,jsx}"],
  theme: { extend: tokens },
  plugins: [],
};
