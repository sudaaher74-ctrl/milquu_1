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
        ],
        shortcuts: [
          {
            name: 'MilQuu AI Chatbot',
            short_name: 'AI Chatbot',
            description: 'AI business analyst powered by Sarvam 105B',
            url: '/chatbot?source=pwa',
            icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'Shop POS',
            short_name: 'POS',
            description: 'Dairy counter billing and Khata',
            url: '/admin/pos?source=pwa',
            icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }]
          }
        ]
      },
      workbox: {
        // Precache the app shell only. Product and banner photos (≈85 MB) used
        // to be precached too, so installing the app downloaded all of them
        // up front; they are cached on first view by the images-cache rule below.
        globPatterns: ['**/*.{js,css,html,ico,svg}', 'pwa-*.png', 'brand-logo.jpg'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // 4 MB (largest JS chunk is ~3 MB)
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
              networkTimeoutSeconds: 2,
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 5, // 5 minutes fallback so stock changes reflect quickly
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // ── Admin Dashboard API caching (offline read access) ──────────
          {
            // /api/erp/* — analytics, orders, expenses, purchases, wastages,
            // procurements, delivery-staff, inventory
            urlPattern: /\/api\/erp\//i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-erp-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 15, // 15 minutes — operational data refreshes often
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // /api/admin/* — customers, withdrawals, settings, employees, audit-logs, wallets
            urlPattern: /\/api\/admin\//i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-admin-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 40,
                maxAgeSeconds: 60 * 60, // 1 hour — settings/employees change less often
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // /api/subscriptions — subscription list & management
            urlPattern: /\/api\/subscriptions/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-subscriptions-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 15,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // /api/free-sample/* — free sample campaigns
            urlPattern: /\/api\/free-sample\//i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-free-sample-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 30, // 30 minutes
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // /api/service-areas — delivery area data (rarely changes)
            urlPattern: /\/api\/service-areas/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-service-areas-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
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
