import { createServer } from 'vite';
import react from '@vitejs/plugin-react';

const server = await createServer({
  configFile: false,
  cacheDir: './.vite_cache',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
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
  }
});

await server.listen();
server.printUrls();
