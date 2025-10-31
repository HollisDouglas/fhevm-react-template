import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Provide necessary Node.js polyfills for Web3
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
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
      '@store': path.resolve(__dirname, './src/store'),
      '@fhevm/sdk': path.resolve(__dirname, '../../../packages/fhevm-sdk/src/index.ts'),
      '@fhevm/sdk/react': path.resolve(__dirname, '../../../packages/fhevm-sdk/src/react/index.tsx'),
      '@fhevm/sdk/core': path.resolve(__dirname, '../../../packages/fhevm-sdk/src/core/index.ts'),
    },
  },
  
  define: {
    // Define global variables for production environment
    global: 'globalThis',
  },
  
  server: {
    host: '0.0.0.0',
    port: 3000,
    hmr: {
      overlay: false
    }
  },
  
  preview: {
    host: '0.0.0.0',
    port: 3018
  },
  
  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          web3: ['ethers'],
          ui: ['lucide-react', 'react-hot-toast']
        }
      }
    }
  },
  
  optimizeDeps: {
    include: ['buffer', 'process']
  },
  
  // Environment variable configuration
  envPrefix: 'VITE_'
})