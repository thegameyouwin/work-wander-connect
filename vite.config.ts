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
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    // Add this custom plugin for SPA routing
    {
      name: 'rewrite-all-to-index',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Skip if it's a file request (has extension)
          if (req.url?.match(/\.[a-zA-Z0-9]+$/)) {
            return next();
          }
          
          // For API routes, pass through
          if (req.url?.startsWith('/api/')) {
            return next();
          }
          
          // Rewrite all other routes to index.html
          req.url = '/index.html';
          next();
        });
      }
    }
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Important for SPA routing
  appType: 'spa',
  build: {
    // This ensures proper routing in production
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      }
    },
    outDir: 'dist'
  },
  // Preview configuration
  preview: {
    port: 8080,
    strictPort: true,
    // Add middleware for preview server too
    middlewareMode: true,
  }
}));
