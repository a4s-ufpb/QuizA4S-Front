import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Config isolada dos testes (Vitest + Testing Library, ambiente jsdom).
export default defineConfig({
  plugins: [react()],
  // sockjs-client referencia `global` (mesmo motivo do vite.config).
  define: {
    global: "globalThis",
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
    include: ["src/**/*.test.{ts,tsx}"],
    css: false,
  },
});
