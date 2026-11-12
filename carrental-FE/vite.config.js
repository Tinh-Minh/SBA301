import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");
    const proxy = { "/api": { target: env.API_PROXY_TARGET || "http://127.0.0.1:8080", changeOrigin: true, configure: proxyServer => { proxyServer.on("proxyReq", proxyRequest => proxyRequest.removeHeader("origin")); } } };
    return {
    plugins: [react()],
    resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
    server: { port: 3000, strictPort: true, proxy },
    preview: { port: 3000, strictPort: true, proxy },
    };
});
