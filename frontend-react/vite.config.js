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
      includeAssets: ['brand-logo.jpg'],
      manifest: {
        name: 'MilQuu Fresh',
        short_name: 'MilQuu',
        description: 'Premium dairy delivery in Navi Mumbai',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'brand-logo.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp}'],
        maximumFileSizeToCacheInBytes: 10485760, // 10 MB
        navigateFallback: '/index.html',
        navigateFallbackAllowlist: [/^(?!\/__).*/],
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
