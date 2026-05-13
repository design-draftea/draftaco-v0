import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const basePath = '/pitaquinho'

export default defineConfig({
  base: `${basePath}/`,
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
  server: {
    proxy: {
      '/sportsdb': {
        target: 'https://www.thesportsdb.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/sportsdb/, ''),
      },
    },
  },
})
