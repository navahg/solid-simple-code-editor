import { defineConfig, Plugin } from 'vite';
import ts from 'typescript';
import solidPlugin from 'vite-plugin-solid';

const tsconfigFile = 'tsconfig.build.json';

/**
 * A custom vite plugin to generate .jsx files and .d.ts files from .tsx files.
 * 
 * For example:
 * src/index.tsx -> dist/source/index.jsx and dist/types/index.d.ts
 * 
 * @returns custom vite plugin
 */
const generateSource = () => {
  return {
    name: 'generate-source',
    buildEnd() {
      const configFile = ts.findConfigFile(process.cwd(), ts.sys.fileExists, tsconfigFile);
      if (!configFile) throw Error(`${tsconfigFile} not found`);
      const { config } = ts.readConfigFile(configFile, ts.sys.readFile);
      
      const { errors, fileNames, options } = ts.parseJsonConfigFileContent(config, ts.sys, process.cwd());
      const program = ts.createProgram({
        options,
        rootNames: fileNames,
        configFileParsingDiagnostics: errors
      });
      const { diagnostics, emitSkipped } = program.emit();
      const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(diagnostics, errors);
    
      if (allDiagnostics.length) {
        const formatHost: ts.FormatDiagnosticsHost = {
          getCanonicalFileName: (path) => path,
          getCurrentDirectory: ts.sys.getCurrentDirectory,
          getNewLine: () => ts.sys.newLine,
        };
        const message = ts.formatDiagnostics(allDiagnostics, formatHost);
        console.warn(message);
      }
  
      if (emitSkipped) throw Error('Cannot emit ts files');
    }
  } as Plugin;
};

export default defineConfig({
  plugins: [
    solidPlugin({ ssr: false }),
    generateSource()
  ],
  build: {
    lib: {
      entry: 'src/index.tsx',
      fileName: 'index'
    },
    minify: false,
    rollupOptions: {
      external: ['solid-js', 'solid-js/web'],
      output: [
        {
          format: 'cjs',
          dir: 'dist/cjs',
          exports: 'named'
        },
        {
          format: 'esm',
          dir: 'dist/esm',
          exports: 'named'
        }
      ]
    },
  },
});
