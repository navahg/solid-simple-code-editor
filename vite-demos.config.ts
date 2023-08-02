import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [
    solidPlugin({ ssr: false }),
  ],
  build: {
    emptyOutDir: true,
    minify: 'terser',
    outDir: '../../built',
  },
  root: 'demos/simple'
});
