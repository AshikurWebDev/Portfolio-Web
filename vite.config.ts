import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { seo } from './vite-plugin-seo.ts'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  return {
    // seo(): JSON-LD, canonical/og tags, robots.txt and sitemap.xml (see vite-plugin-seo.ts)
    plugins: [react(), seo(env.VITE_SITE_URL ?? '')],
    server: {
      // In development the API runs on :5180. Proxying /api and /mcp through the
      // Vite server keeps everything on one origin (http://localhost:5173), so the
      // HttpOnly refresh cookie (SameSite=Strict) works without CORS tricks.
      proxy: {
        '/api': 'http://localhost:5180',
        // SignalR hub for live updates (WebSockets).
        '/hubs': { target: 'http://localhost:5180', ws: true },
      },
    },
  }
})
