import App from "@/app/App.jsx";

import "@/shared/styles/globals.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")).render(<StrictMode><App /></StrictMode>);
