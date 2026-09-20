import { defineConfig } from 'vite';

// GH_PAGES_BASE mirrors the same trick used for the main Expo app: a GitHub Pages project
// site serves everything from a subpath, so the production build needs to know it'll live
// at /<repo>/game/ instead of the domain root. Local `npm run dev`/`npm run build` without
// that env var keeps the default root base, unaffected.
export default defineConfig({
  base: process.env.GH_PAGES_BASE ?? '/',
});
