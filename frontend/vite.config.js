import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "monaco-editor/esm/vs/editor/editor.api.js": "monaco-editor",
    },
  },
  optimizeDeps: {
    include: ["@monaco-editor/react", "yjs", "y-monaco", "y-socket.io"],
  },
});
