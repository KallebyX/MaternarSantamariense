import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')

  const isProduction = mode === 'production'
  const isDevelopment = mode === 'development'
  const isLocal = mode === 'local' || (!isProduction && !isDevelopment)

  return {
    plugins: [react()],

    // Path aliases for cleaner imports
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@lib': path.resolve(__dirname, './src/lib'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@graphql': path.resolve(__dirname, './src/graphql'),
        '@locales': path.resolve(__dirname, './src/locales'),
      },
    },

    // Development server configuration
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: !isProduction,
      proxy: isLocal ? {
        // Proxy API requests to local backend in development
        '/api': {
          target: 'http://localhost:4000',
          changeOrigin: true,
          secure: false,
        },
        '/graphql': {
          target: 'http://localhost:4000',
          changeOrigin: true,
          secure: false,
        },
        '/socket.io': {
          target: 'http://localhost:4000',
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      } : undefined,
    },

    // Preview server configuration
    preview: {
      port: 3000,
      host: '0.0.0.0',
    },

    // Build configuration
    build: {
      outDir: 'dist',
      sourcemap: !isProduction,
      minify: isProduction ? 'esbuild' : false,
      rollupOptions: {
        output: {
          manualChunks: {
            // Split vendor chunks for better caching
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'apollo-vendor': ['@apollo/client', 'graphql'],
            'ui-vendor': ['framer-motion', 'lucide-react'],
          },
        },
      },
      // Increase chunk size warning limit
      chunkSizeWarningLimit: 1000,
    },

    // Define global constants
    define: {
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || '2.0.0'),
      __APP_ENV__: JSON.stringify(mode),
    },

    // Optimize dependencies
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@apollo/client',
        'graphql',
        'framer-motion',
      ],
    },
  }
})
