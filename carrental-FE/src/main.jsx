import App from "@/App.jsx";

import "@/styles/style.css";
import "@/styles/refine.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")).render(<StrictMode><App /></StrictMode>);
