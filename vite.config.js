import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'https://dev.cluborbit.com/playerserver',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/playerserver/v1/api'), 
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            const ct = req.headers['content-type'] || '';
            if (ct.includes('multipart/form-data')) {
              proxyReq.setHeader('Content-Type', ct);
            }
            // Add CORS headers
            proxyReq.setHeader('Origin', 'https://dev.cluborbit.com');
            proxyReq.setHeader('Referer', 'https://dev.cluborbit.com/');
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // Add CORS headers to response
            proxyRes.headers['Access-Control-Allow-Origin'] = '*';
            proxyRes.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS';
            proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Origin, X-Requested-With, Accept';
          });
        },
      },

      // Google Places Autocomplete
      '/maps/autocomplete': {
        target: 'https://maps.googleapis.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/maps\/autocomplete/, '/maps/api/place/autocomplete/json'),
      },

      // Google Places Details
      '/maps/details': {
        target: 'https://maps.googleapis.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/maps\/details/, '/maps/api/place/details/json'),
      },
    },
  },
});