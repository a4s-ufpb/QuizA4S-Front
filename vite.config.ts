import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react()],
  // sockjs-client referencia `global`; mapeia para o objeto global do browser.
  define: {
    global: "globalThis",
  },
  preview: {
    port: 80,
    strictPort: true,
    host: true,
  },
});
