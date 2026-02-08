import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Add this for client-side routing support
  appType: 'spa',
  // Add this build configuration
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
    // Generate manifest for better caching
    manifest: true,
  },
  // Add this for development server routing
  preview: {
    port: 8080,
    strictPort: true,
  },
}));
