import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Dynamically import cartographer if needed
  const cartographerPlugin = 
    process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined
      ? [(await import("@replit/vite-plugin-cartographer")).cartographer()]
      : [];
  
  return {
    plugins: [
      react(),
      runtimeErrorOverlay(),
      ...cartographerPlugin,
    ],
    resolve: {
      alias: {
        "@": path.resolve(process.cwd(), "client", "src"),
        "@shared": path.resolve(process.cwd(), "shared"),
        "@assets": path.resolve(process.cwd(), "attached_assets"),
      },
    },
    root: path.resolve(process.cwd(), "client"),
    build: {
      outDir: path.resolve(process.cwd(), "dist/public"),
      emptyOutDir: true,
    },
    // Define environment variables
    define: {
      'import.meta.env.API_URL': JSON.stringify(env.API_URL || ''),
      'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV || mode)
    }
  };
});
