import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import solidPlugin from 'vite-plugin-solid';
import path from 'node:path';

export default defineConfig({
  plugins: [
    dts({
      tsconfigPath: path.resolve(__dirname, 'tsconfig.build.json'),
    }),
    solidPlugin({ ssr: false }),
  ],
  build: {
    lib: {
      entry: 'src/index.tsx',
      formats: ['cjs', 'es'],
    },
    minify: false,
    rollupOptions: {
      external: ['solid-js', 'solid-js/web'],
    },
  },
});
