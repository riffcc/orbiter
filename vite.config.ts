// Plugins
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import rollupNodePolyFill from 'rollup-plugin-polyfill-node'

// Utilities
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

// Good reference: https://stackoverflow.com/questions/69286329/polyfill-node-os-module-with-vite-rollup-js

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: 'es2020',
    rollupOptions: {
      plugins: [
        rollupNodePolyFill()
      ]
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020'
    },
    exclude: ["chokidar"],
  },
  plugins: [
    vue(),
    // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
    vuetify({
      autoImport: true,
    }),
    NodeGlobalsPolyfillPlugin({
      buffer: true,
      process: true
    }),
  ],
  define: { 
    global: "globalThis",

  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      assert: 'rollup-plugin-node-polyfills/polyfills/assert',
      crypto: "crypto-browserify",
      path: 'rollup-plugin-node-polyfills/polyfills/path',
    },
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
    ],
  },
  server: {
    port: 3000,
  },
})
