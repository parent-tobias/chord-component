import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.spec.ts', 'src/**/*.test.ts']
      // No rollupTypes — with preserveModules, we want per-file .d.ts
      // emitted alongside the .js files.
    })
  ],
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