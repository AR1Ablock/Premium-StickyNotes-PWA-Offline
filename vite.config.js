import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),

    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['robots.txt', 'App_Icon/*.png'],
      manifest: {
        name: 'Sticky Colorful Notes App',
        short_name: 'Sticky Notes',
        start_url: '/',
        display: 'standalone',
        background_color: '#f5f5f5',
        theme_color: '#4CAF50',
        scope: '/',
        orientation: 'portrait',
        lang: 'en-US',
        description: 'A beautiful, native-like notes app built with Vue.js.',
        icons: [
          {
            "src": "/App_Icon/note_1536.png",
            "sizes": "1536x1536",
            "type": "image/png"
          },
          {
            "src": "/App_Icon/note_512.png",
            "sizes": "512x512",
            "type": "image/png"
          }
        ],
        screenshots: [
          {
            "src": "/App_Icon/note_1536.png",
            "sizes": "1536x1536",
            "type": "image/png",
            "form_factor": "wide"
          },
          {
            "src": "/App_Icon/note_512.png",
            "sizes": "512x512",
            "type": "image/png"
          }
        ]
      }
    }),
  ],
  server: {
    // host: true,
    hmr : true,
    watch: {
      ignored: ['**/node_modules/**', '**/dist/**']  // add other paths as needed
    },
    host: '0.0.0.0', // Allow access from any device
    port: 5173, // Your Vite port
    strictPort: true, // Ensure it always uses this port
    cors: true, // Allow cross-origin requests
    allowedHosts: ['.ngrok-free.app'], // Allow all Ngrok subdomains
  }

});