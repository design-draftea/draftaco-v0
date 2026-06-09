import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const basePath = '/pitaquinho'

export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : `${basePath}/`,
  plugins: [
    react(),
    {
      name: 'redirect-base-path',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === basePath) {
            res.statusCode = 302
            res.setHeader('Location', `${basePath}/`)
            res.end()
            return
          }

          next()
        })
      },
    },
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-dom/client'],
        },
      },
    },
  },
  server: {
    proxy: {
      '/sportsdb': {
        target: 'https://www.thesportsdb.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/sportsdb/, ''),
      },
    },
  },
}))
