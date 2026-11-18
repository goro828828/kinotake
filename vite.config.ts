import { defineConfig } from 'vite';

// base: './' so the built files work from any sub-path (GitHub Pages project pages, Vercel, Netlify).
export default defineConfig({
  base: './',
  server: { host: true },
});
