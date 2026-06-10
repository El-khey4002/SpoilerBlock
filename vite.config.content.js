import { defineConfig } from 'vite'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      input: { content: resolve(__dirname, 'src/content/index.js') },
      output: {
        entryFileNames: '[name].js',
        format: 'iife',
      },
    },
  },
})