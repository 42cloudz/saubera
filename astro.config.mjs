// Saubera: pages are prerendered to static HTML; only the form endpoints and /admin run on the server.
// server.mjs wraps the adapter's handler to add security headers to every response.
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://saubera.42cloudz.com',
  output: 'static',
  adapter: node({ mode: 'standalone' }),
  integrations: [sitemap({ filter: (page) => !page.includes('/admin') && !page.includes('/danke') })],
  trailingSlash: 'ignore',
  // No inline scripts or styles: the CSP in server.mjs allows only files from this server.
  build: { inlineStylesheets: 'never' },
  vite: { build: { assetsInlineLimit: 0 } },
  // Behind Traefik the pod sees http while browsers send an https Origin, so Astro's own origin
  // check would refuse every form. server.mjs compares the Origin's host with the Host header instead.
  security: { checkOrigin: false },
});
