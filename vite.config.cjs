const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');

// https://vitejs.dev/config/
module.exports = defineConfig({
  cacheDir: './.vite_cache',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  optimizeDeps: {
    force: false
  },
  build: {
    emptyOutDir: false
  }
});
