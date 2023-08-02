import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [
    dts({ compilerOptions: { outFile: 'index.d.ts' }, tsconfigPath: './tsconfig.build.json' }),
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
    },
  },
});
