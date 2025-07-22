import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  build: {
    rollupOptions: {
      // Exclude backend from the build bundle
      external: [
        // You can use a glob or regex if needed
        /src\/backend\//
      ]
    }
  },
  server: {
    watch: {
      // Ignore backend directory for HMR/file watching
      ignored: ['**/src/backend/**']
    }
  },
  plugins: [
    tailwindcss(),
  ]
});
