// Saubera: pages are prerendered to static HTML; the form endpoints, /admin, the directory and the
// local pages run on the server.
// server.mjs wraps the adapter's handler to add security headers to every response.
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';
import { leistungen } from './src/data/leistungen.ts';
import { orte } from './src/data/orte.ts';

const site = process.env.SITE_URL ?? 'https://saubera.42cloudz.com';
// The local pages render on the server (they list companies from the database), so the sitemap
// integration does not see them. "Leistung in Ort" goes in; the Objektart variants are linked from there.
const localPages = leistungen.flatMap((l) => orte.map((o) => `${site}/leistungen/${l.slug}/${o.slug}`));

export default defineConfig({
  site,
  output: 'static',
  adapter: node({ mode: 'standalone' }),
  integrations: [sitemap({ customPages: [...localPages, `${site}/firmen`], filter: (page) => !page.includes('/admin') && !page.includes('/danke') })],
  trailingSlash: 'ignore',
  // No inline scripts or styles: the CSP in server.mjs allows only files from this server.
  build: { inlineStylesheets: 'never' },
  vite: { build: { assetsInlineLimit: 0 } },
  // Behind Traefik the pod sees http while browsers send an https Origin, so Astro's own origin
  // check would refuse every form. server.mjs compares the Origin's host with the Host header instead.
  security: { checkOrigin: false },
});
