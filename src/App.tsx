import { useCallback, useEffect, useMemo, useState } from 'react'
import { Home } from './pages/Home'
import { PromotionsPage } from './pages/PromotionsPage'
import { BetslipPage } from './pages/BetslipPage'
import { MobileOnly } from './components/MobileOnly'
import { Navbar } from './components/Navbar'
import { Betslip } from './components/Betslip'
import { HeaderV2 } from './components/HeaderV2'
import { BetslipProvider } from './hooks/BetslipProvider'
import { useBetslip } from './hooks/useBetslip'
import type { ProductMode } from './types/home'

const defaultProduct: ProductMode = 'apostas'
const productRoutes: ProductMode[] = ['apostas', 'cassino']
const promotionsRouteSegment = 'promocoes'
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

const getNormalizedAppPath = (pathname: string) => stripBasePath(pathname).replace(/\/+$/, '') || '/'

const getRouteSegments = (pathname: string) => getNormalizedAppPath(pathname).split('/').filter(Boolean)

const isPromotionsPath = (pathname: string) => {
  const routeSegments = getRouteSegments(pathname)

  return (
    routeSegments[0] === promotionsRouteSegment &&
    routeSegments.length <= 2
  )
}

const isCanonicalPromotionsPath = (pathname: string) => {
  const routeSegments = getRouteSegments(pathname)
  return routeSegments.length === 1 && routeSegments[0] === promotionsRouteSegment
}

const resolveProductFromPath = (pathname: string) => {
  const routeSegments = getRouteSegments(pathname)
  const routeProduct = productRoutes.find((route) => route === routeSegments[0])
  const product = routeProduct ?? defaultProduct
  const isCanonicalProductRoute = routeSegments.length === 1 && routeSegments[0] === product

  return {
    product,
    isCanonicalProductRoute,
  }
}

const buildProductPath = (product: ProductMode) => {
  const basePath = getBasePath()
  return `${basePath}/${product}`
}

const buildPromotionsPath = () => {
  const basePath = getBasePath()
  return `${basePath}/${promotionsRouteSegment}`
}

function AppContent() {
  const [pathname, setPathname] = useState(() => window.location.pathname)
  const { summary: betslipSummary } = useBetslip()
  const productRoute = useMemo(() => resolveProductFromPath(pathname), [pathname])
  const isPromotionsPage = useMemo(() => isPromotionsPath(pathname), [pathname])
  const [promotionsProduct, setPromotionsProduct] = useState<ProductMode>(() => productRoute.product)
  const [isFullBetslipOpen, setIsFullBetslipOpen] = useState(false)
  const [liveEventUi, setLiveEventUi] = useState({
    isOpen: false,
    isEventBetslipVisible: false,
    betslipMotionKey: 0,
  })
  const activeProduct = isPromotionsPage ? promotionsProduct : productRoute.product

  useEffect(() => {
    if (isPromotionsPage) return
    if (productRoute.isCanonicalProductRoute) return

    const nextPath = buildProductPath(productRoute.product)
    window.history.replaceState({}, '', nextPath)
    const timer = window.setTimeout(() => {
      setPathname(window.location.pathname)
    }, 0)

    return () => window.clearTimeout(timer)
  }, [isPromotionsPage, productRoute])

  useEffect(() => {
    if (!isPromotionsPage) return
    if (isCanonicalPromotionsPath(pathname)) return

    const nextPath = buildPromotionsPath()
    window.history.replaceState({}, '', nextPath)
    const timer = window.setTimeout(() => {
      setPathname(window.location.pathname)
    }, 0)

    return () => window.clearTimeout(timer)
  }, [isPromotionsPage, pathname])

  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const handleProductChange = useCallback((product: ProductMode) => {
    if (isPromotionsPage) {
      setPromotionsProduct(product)
      const nextPath = buildProductPath(product)

      if (window.location.pathname !== nextPath) {
        window.history.pushState({}, '', nextPath)
      }

      setPathname(window.location.pathname)
      return
    }

    const nextPath = buildProductPath(product)

    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath)
    }

    setPathname(window.location.pathname)
  }, [isPromotionsPage])

  const handleNavbarItemSelect = useCallback((itemId: string) => {
    if (itemId === promotionsRouteSegment) {
      const nextPath = buildPromotionsPath()
      setPromotionsProduct(activeProduct)

      if (window.location.pathname !== nextPath) {
        window.history.pushState({}, '', nextPath)
      }

      setPathname(window.location.pathname)
      return
    }

    if (isPromotionsPage && itemId === 'home') {
      const nextPath = buildProductPath(activeProduct)

      if (window.location.pathname !== nextPath) {
        window.history.pushState({}, '', nextPath)
      }

      setPathname(window.location.pathname)
    }
  }, [activeProduct, isPromotionsPage])

  const handleBetslipClose = useCallback(() => {
    setIsFullBetslipOpen(false)
  }, [])

  const handleBetslipOpen = useCallback(() => {
    setIsFullBetslipOpen(true)
  }, [])

  const handleLiveEventOpenChange = useCallback((isOpen: boolean) => {
    setLiveEventUi((current) => {
      if (current.isOpen === isOpen) return current

      if (isOpen) {
        return {
          isOpen: true,
          isEventBetslipVisible: false,
          betslipMotionKey: current.betslipMotionKey,
        }
      }

      return {
        ...current,
        isOpen: false,
        isEventBetslipVisible: false,
      }
    })
  }, [])

  const handleLiveEventOpenSettled = useCallback(() => {
    setLiveEventUi((current) => {
      if (!current.isOpen || current.isEventBetslipVisible) return current

      return {
        ...current,
        isEventBetslipVisible: true,
        betslipMotionKey: current.betslipMotionKey + 1,
      }
    })
  }, [])

  const handleLiveEventCloseStart = useCallback(() => {
    setLiveEventUi((current) => {
      if (!current.isEventBetslipVisible) return current

      return {
        ...current,
        isEventBetslipVisible: false,
      }
    })
  }, [])

  const showCompactBetslip = activeProduct === 'apostas' && !isPromotionsPage && betslipSummary.hasSelections
  const shouldShowEventBetslip = showCompactBetslip && liveEventUi.isOpen && liveEventUi.isEventBetslipVisible

  return (
    <div className="app-shell">
      <MobileOnly />
      {isPromotionsPage ? (
        <PromotionsPage
          activeProduct={activeProduct}
          HeaderComponent={HeaderV2}
          onProductChange={handleProductChange}
        />
      ) : (
        <Home
          activeProduct={activeProduct}
          HeaderComponent={HeaderV2}
          onProductChange={handleProductChange}
          onLiveEventOpenChange={handleLiveEventOpenChange}
          onLiveEventOpenSettled={handleLiveEventOpenSettled}
          onLiveEventCloseStart={handleLiveEventCloseStart}
        />
      )}
      {isFullBetslipOpen ? (
        <BetslipPage onClose={handleBetslipClose} />
      ) : null}
      <Betslip
        visible={showCompactBetslip}
        summary={betslipSummary}
        presentationKey="base"
        onOpen={handleBetslipOpen}
      />
      <Betslip
        visible={shouldShowEventBetslip}
        summary={betslipSummary}
        compactOnly={true}
        presentationKey={`live-event-${liveEventUi.betslipMotionKey}`}
        onOpen={handleBetslipOpen}
      />
      <Navbar
        activeProduct={activeProduct}
        activeItemId={isPromotionsPage ? promotionsRouteSegment : undefined}
        onItemSelect={handleNavbarItemSelect}
      />
    </div>
  )
}

function App() {
  return (
    <BetslipProvider>
      <AppContent />
    </BetslipProvider>
  )
}

export default App
