import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // relative paths — works for both gh-pages and itch.io
  build: {
    assetsInlineLimit: 0, // never inline images as base64
  },
});
