import { useCallback, useEffect, useMemo, useState } from 'react'
import { Home } from './pages/Home'
import { MobileOnly } from './components/MobileOnly'
import { Navbar } from './components/Navbar'
import type { HeaderVisualVariant } from './components/Header'
import type { ProductMode } from './types/home'

const defaultProduct: ProductMode = 'apostas'
const productRoutes: ProductMode[] = ['apostas', 'cassino']
const liquidGlassRouteSegment = 'header-liquid-glass'
const liquidGlassNewRouteSegment = 'liquid-glass-new'
const deployedBasePath = '/pitaquinho'

const getBasePath = () => {
  const baseUrl = import.meta.env.BASE_URL || '/'
  if (baseUrl !== '/') return baseUrl.replace(/\/+$/, '')

  return window.location.pathname === deployedBasePath || window.location.pathname.startsWith(`${deployedBasePath}/`)
    ? deployedBasePath
    : ''
}

const stripBasePath = (pathname: string) => {
  const basePath = getBasePath()
  if (!basePath) return pathname || '/'

  if (pathname === basePath) return '/'
  if (pathname.startsWith(`${basePath}/`)) return pathname.slice(basePath.length) || '/'

  return pathname || '/'
}

const getHeaderVariantFromPath = (pathname: string): HeaderVisualVariant => {
  const routeSegments = stripBasePath(pathname).split('/').filter(Boolean)

  if (routeSegments.includes(liquidGlassNewRouteSegment)) return 'liquid-glass-new'

  return routeSegments.includes(liquidGlassRouteSegment) ? 'liquid-glass' : 'default'
}

const resolveProductFromPath = (pathname: string) => {
  const appPath = stripBasePath(pathname).replace(/\/+$/, '') || '/'
  const routeSegments = appPath.split('/').filter(Boolean)
  const routeProduct = productRoutes.find((route) => route === routeSegments[0])
  const headerVariant = getHeaderVariantFromPath(pathname)
  const product = routeProduct ?? defaultProduct
  const expectedSegments = [
    product,
    headerVariant === 'liquid-glass' ? liquidGlassRouteSegment : '',
    headerVariant === 'liquid-glass-new' ? liquidGlassNewRouteSegment : '',
  ].filter(Boolean)

  return {
    product,
    headerVariant,
    isCanonicalProductRoute: routeSegments.join('/') === expectedSegments.join('/'),
  }
}

const buildProductPath = (
  product: ProductMode,
  headerVariant: HeaderVisualVariant = 'default'
) => {
  const basePath = getBasePath()
  const variantPath = headerVariant === 'liquid-glass'
    ? `/${liquidGlassRouteSegment}`
    : headerVariant === 'liquid-glass-new'
      ? `/${liquidGlassNewRouteSegment}`
      : ''
  return `${basePath}/${product}${variantPath}`
}

function App() {
  const [pathname, setPathname] = useState(() => window.location.pathname)
  const productRoute = useMemo(() => resolveProductFromPath(pathname), [pathname])

  useEffect(() => {
    if (productRoute.isCanonicalProductRoute) return

    const nextPath = buildProductPath(productRoute.product, productRoute.headerVariant)
    window.history.replaceState({}, '', nextPath)
    const timer = window.setTimeout(() => {
      setPathname(window.location.pathname)
    }, 0)

    return () => window.clearTimeout(timer)
  }, [productRoute])

  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const handleProductChange = useCallback((product: ProductMode) => {
    const nextPath = buildProductPath(product, productRoute.headerVariant)

    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath)
    }

    setPathname(window.location.pathname)
  }, [productRoute.headerVariant])

  return (
    <>
      <MobileOnly />
      <Home
        headerVariant={productRoute.headerVariant}
        activeProduct={productRoute.product}
        onProductChange={handleProductChange}
      />
      <Navbar activeProduct={productRoute.product} visualVariant={productRoute.headerVariant} />
    </>
  )
}

export default App
