import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from 'path';

export default defineConfig({
  plugins: [
    vue(),
    nodePolyfills({
      include: ['buffer', 'crypto', 'stream', 'util', 'process'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@composables': path.resolve(__dirname, './src/composables'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
      '@views': path.resolve(__dirname, './src/views'),
    },
  },

  define: {
    global: 'globalThis',
  },

  server: {
    port: 3000,
    open: true,
  },

  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router'],
          web3: ['ethers', '@fhevm/sdk'],
        },
      },
    },
  },

  optimizeDeps: {
    include: ['buffer', 'process'],
  },
});
