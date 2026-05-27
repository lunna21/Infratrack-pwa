import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      includeAssets: [
        'manifest.json',
        'icons/web-app-manifest-192x192.png',
        'icons/icon512_maskable.png',
        'icons/icon512_rounded.png',
      ],
      manifest: {
        name: 'Censo de Mascotas PWA',
        short_name: 'Mascotas',
        description: 'Aplicación para el registro y visualización del censo de mascotas',
        lang: 'es-CO',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        id: 'censo-mascotas-pwa',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#B0F0FF',
        background_color: '#f8fafc',
        categories: ['utilities', 'education'],
        icons: [
          {
            src: '/icons/web-app-manifest-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/icons/icon512_maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/icons/icon512_rounded.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        importScripts: ['/sw-push.js'],
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,webmanifest,wasm}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname === '/manifest.json',
            handler: 'CacheFirst',
            options: {
              cacheName: 'manifest-cache',
            },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
            },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://lottie.host',
            handler: 'CacheFirst',
            options: {
              cacheName: 'lottie-files',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
          {
            urlPattern: ({ url }) =>
              url.origin === 'https://cdn.jsdelivr.net' ||
              url.origin === 'https://unpkg.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'cdn-assets',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/v1/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60,
              },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
            },
          },
        ],
      },
    }),
  ],
})
