import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/embed/embed.ts',
      name: 'FeederEmbed',
      formats: ['iife'],
      fileName: () => 'embed.js',
    },
    outDir: 'dist-embed',
    emptyOutDir: true,
  },
})
