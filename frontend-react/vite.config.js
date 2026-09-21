import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ViteImageOptimizer({
      jpg: {
        quality: 80,
      },
      png: {
        quality: 80,
      },
      webp: {
        lossless: true,
      },
      avif: {
        lossless: true,
      },
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['brand-logo.jpg', 'pwa-192x192.png', 'pwa-512x512.png', 'robots.txt'],
      manifest: {
        id: '/',
        name: 'MilQuu Fresh – Farm Fresh Dairy',
        short_name: 'MilQuu',
        description: 'Fresh milk subscriptions and dairy delivered daily before 7 AM across Navi Mumbai.',
        theme_color: '#ffffff',
        background_color: '#FDFBF7',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/?source=pwa',
        scope: '/',
        categories: ['food', 'shopping', 'lifestyle'],
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp}'],
        maximumFileSizeToCacheInBytes: 10485760, // 10 MB
        navigateFallback: '/index.html',
        navigateFallbackAllowlist: [/^(?!\/__).*/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 120,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
              },
            },
          },
          {
            urlPattern: /\/api\/products/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-products-cache',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours fallback
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor-react';
            if (id.includes('recharts')) return 'vendor-charts';
            if (id.includes('jspdf') || id.includes('html2canvas')) return 'vendor-pdf';
            if (id.includes('tailwindcss') || id.includes('framer-motion') || id.includes('lucide-react')) return 'vendor-ui';
            return 'vendor-core';
          }
        }
      }
    }
  }
})
