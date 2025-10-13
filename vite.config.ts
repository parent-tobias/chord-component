import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'chord-diagram': resolve(__dirname, 'src/chord-diagram.ts'),
        'chord-list': resolve(__dirname, 'src/chord-list.ts')
      },
      formats: ['es']
    },
    rollupOptions: {
      external: ['lit', 'svguitar'],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src'
      }
    }
  },
  server: {
    open: '/demo/'
  }
});