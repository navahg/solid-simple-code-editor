import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [
    dts({ tsconfigPath: './tsconfig.build.json', rollupTypes: true }),
    solidPlugin({ ssr: false }),
  ],
  build: {
    lib: {
      entry: 'src/index.tsx',
      formats: ['cjs', 'es'],
      fileName: 'index'
    },
    minify: false,
    rollupOptions: {
      external: ['solid-js', 'solid-js/web'],
      output: {
        exports: 'named'
      }
    },
  },
});
