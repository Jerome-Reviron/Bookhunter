import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";
import mkcert from "vite-plugin-mkcert";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");

  return {
    plugins: [
      react(),
      tailwindcss(),
      mkcert(), // ⭐ Active automatiquement HTTPS sans config supplémentaire
    ],

    define: {
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
    },

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },

    server: {
      host: true, // ⭐ Permet l'accès depuis ton téléphone
      hmr: process.env.DISABLE_HMR !== "true",

      proxy: {
        "/api": {
          target: "http://localhost/Bookhunter",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, "/api"),
        },
      },
    },
  };
});
