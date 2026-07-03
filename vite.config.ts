import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

const basePath = '/draftaco-v0'

export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : `${basePath}/`,
  plugins: [
    ...(process.env.VITE_DEV_HTTPS === '1'
      ? [
          basicSsl({
            name: 'draftaco-dev',
          }),
        ]
      : []),
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
    host: '0.0.0.0',
    proxy: {
      '/sportsdb': {
        target: 'https://www.thesportsdb.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/sportsdb/, ''),
      },
    },
  },
}))
