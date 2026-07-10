import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { LiveEventOpenPayload } from './pages/LiveEventPage'
import { MobileOnly } from './components/MobileOnly'
import { Navbar } from './components/Navbar'
import { Betslip } from './components/Betslip'
import { HeaderV2 } from './components/HeaderV2'
import { DepositPanel } from './components/DepositPanel'
import { FeatureFlagsPanel } from './components/FeatureFlagsPanel'
import { LocationPermissionGate } from './components/LocationPermissionGate'
import { BetslipProvider } from './hooks/BetslipProvider'
import { FeatureFlagsProvider } from './hooks/FeatureFlagsProvider'
import { useFeatureFlags } from './hooks/useFeatureFlags'
import { useBetslip } from './hooks/useBetslip'
import { getBetslipTurboEligibleSelectionCount } from './hooks/betslipTurboBonus'
import type { ProductMode } from './types/home'
import { BETSLIP_LIVE_EVENT_OPEN_EVENT } from './utils/betslipLiveEvent'
import { BrandLocalizationEffect } from './i18n/brandLocalization'
import { LoginPage } from './pages/LoginPage'
import type { BetSuccessReceipt } from './pages/BetSuccessPage'

const Home = lazy(() => import('./pages/Home').then((m) => ({ default: m.Home })))
const PromotionsPage = lazy(() => import('./pages/PromotionsPage').then((m) => ({ default: m.PromotionsPage })))
const BetslipPageV2 = lazy(() => import('./pages/BetslipPageV2').then((m) => ({ default: m.BetslipPageV2 })))
const BetSuccessPage = lazy(() => import('./pages/BetSuccessPage').then((m) => ({ default: m.BetSuccessPage })))
const LiveEventPage = lazy(() => import('./pages/LiveEventPage').then((m) => ({ default: m.LiveEventPage })))
const HandoffPage = lazy(() => import('./pages/Handoff').then((m) => ({ default: m.HandoffPage })))

const RouteFallback = () => (
  <div
    style={{ minHeight: '100dvh', background: 'var(--ds-background-app, var(--tokens-background-background))' }}
    aria-busy="true"
  />
)

const defaultProduct: ProductMode = 'apostas'
const productRoutes: ProductMode[] = ['apostas', 'cassino']
const promotionsRouteSegment = 'promocoes'
const handoffRouteSegment = 'handoff'
const loginRouteSegment = 'entrar'
const signupRouteSegment = 'criar-conta'
const deployedBasePath = '/draftaco-v0'
const ENABLE_APP_PROMOTIONS_NAV_LINK = false
const brasileiraoLeagueIdPattern = /(?:brasil-serie-a|fut-brasileir|fut-brasileirao-a)/
const brasileiraoLeagueNamePattern = /(?:brasileir|brasileir[aã]o|brasil\s*-\s*s[eé]rie\s*a|s[eé]rie\s*a)/i

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

const isHandoffPath = (pathname: string) => {
  const routeSegments = getRouteSegments(pathname)

  return routeSegments.length === 1 && routeSegments[0] === handoffRouteSegment
}

const isLoginPath = (pathname: string) => {
  const routeSegments = getRouteSegments(pathname)

  return routeSegments.length === 1 && routeSegments[0] === loginRouteSegment
}

const isSignupPath = (pathname: string) => {
  const routeSegments = getRouteSegments(pathname)

  return routeSegments.length === 1 && routeSegments[0] === signupRouteSegment
}

const isAuthPath = (pathname: string) => isLoginPath(pathname) || isSignupPath(pathname)

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

const buildLoginPath = () => {
  const basePath = getBasePath()
  return `${basePath}/${loginRouteSegment}`
}

const buildSignupPath = () => {
  const basePath = getBasePath()
  return `${basePath}/${signupRouteSegment}`
}

const getCurrentPathWithSearch = () => `${window.location.pathname}${window.location.search}`

const getPathnameFromPathWithSearch = (pathWithSearch: string) => pathWithSearch.split('?')[0] || '/'

const hasGarantidaBannerParam = (search: string) => new URLSearchParams(search).get('banner') === 'garantida'

const getGarantidaBannerSearch = (search: string) => (hasGarantidaBannerParam(search) ? '?banner=garantida' : '')

const withSearch = (path: string, search: string) => `${path}${search}`

type AuthVariant = 'logged-in' | 'logged-out'
type AuthOverlayOrigin = 'default' | 'betslip'
type LoginMotionState = 'entering' | 'open' | 'exiting'
type DepositPanelOrigin = 'standard' | 'signup'
type SignupPendingRequirement = 'identity' | 'limits'
type AuthScrollLockState = {
  scrollY: number
  bodyOverflow: string
  rootOverflow: string
}

const loginMotionDurationMs = 320
const loggedInInitialBalanceCents = 25000
const signupInitialBalanceCents = 0

function AppContent() {
  const [pathname, setPathname] = useState(() => window.location.pathname)
  const [search, setSearch] = useState(() => window.location.search)
  const [isSignupGarantidaBannerEnabled, setIsSignupGarantidaBannerEnabled] = useState(() => (
    !isAuthPath(window.location.pathname) && hasGarantidaBannerParam(window.location.search)
  ))
  const loginReturnPathRef = useRef<string | null>(
    isAuthPath(window.location.pathname) ? buildProductPath(defaultProduct) : null
  )
  const loginMotionTimerRef = useRef<number | null>(null)
  const signupDepositExitPathRef = useRef<string | null>(null)
  const authScrollLockRef = useRef<AuthScrollLockState | null>(null)
  const [authVariant, setAuthVariant] = useState<AuthVariant>('logged-out')
  const [balanceCents, setBalanceCents] = useState(0)
  const [loginMotionState, setLoginMotionState] = useState<LoginMotionState | null>(
    isAuthPath(window.location.pathname) ? 'open' : null
  )
  const [authOverlayOrigin, setAuthOverlayOrigin] = useState<AuthOverlayOrigin>('default')
  const { selections: betslipSelections, summary: betslipSummary } = useBetslip()
  const { brandMode, isFeatureEnabled } = useFeatureFlags()
  const betslipTurboEligibleSelectionCount = useMemo(
    () => getBetslipTurboEligibleSelectionCount(betslipSelections),
    [betslipSelections]
  )
  const hasOnlyBrasileiraoSelections = useMemo(() => (
    betslipSelections.length > 0 && betslipSelections.every((selection) => (
      (!!selection.leagueId && brasileiraoLeagueIdPattern.test(selection.leagueId)) ||
      (!!selection.leagueName && brasileiraoLeagueNamePattern.test(selection.leagueName))
    ))
  ), [betslipSelections])
  const actualProductRoute = useMemo(() => resolveProductFromPath(pathname), [pathname])
  const isCurrentPromotionsPage = useMemo(() => isPromotionsPath(pathname), [pathname])
  const isHandoffPage = useMemo(() => isHandoffPath(pathname), [pathname])
  const isLoginPage = useMemo(() => isLoginPath(pathname), [pathname])
  const isSignupPage = useMemo(() => isSignupPath(pathname), [pathname])
  const isAuthPage = isLoginPage || isSignupPage
  const renderedPathname = isAuthPage
    ? getPathnameFromPathWithSearch(loginReturnPathRef.current ?? buildProductPath(defaultProduct))
    : pathname
  const productRoute = useMemo(() => resolveProductFromPath(renderedPathname), [renderedPathname])
  const isPromotionsPage = useMemo(() => isPromotionsPath(renderedPathname), [renderedPathname])
  const [promotionsProduct, setPromotionsProduct] = useState<ProductMode>(() => productRoute.product)
  const [isFullBetslipOpen, setIsFullBetslipOpen] = useState(false)
  const [betSuccessReceipt, setBetSuccessReceipt] = useState<BetSuccessReceipt | null>(null)
  const [isCompactBetslipSuppressed, setIsCompactBetslipSuppressed] = useState(false)
  const [isDepositPanelOpen, setIsDepositPanelOpen] = useState(false)
  const [depositPanelOrigin, setDepositPanelOrigin] = useState<DepositPanelOrigin>('standard')
  const [signupPendingDepositAmountCents, setSignupPendingDepositAmountCents] = useState<number | null>(null)
  const [signupPendingRequirement, setSignupPendingRequirement] = useState<SignupPendingRequirement | null>(null)
  const [isFeatureFlagsPanelOpen, setIsFeatureFlagsPanelOpen] = useState(false)
  const [liveEventUi, setLiveEventUi] = useState({
    isOpen: false,
    isEventBetslipVisible: false,
    betslipMotionKey: 0,
  })
  const [betslipOriginLiveEvent, setBetslipOriginLiveEvent] = useState<{
    isOpen: boolean
    payload: LiveEventOpenPayload
  } | null>(null)
  const activeProduct = isPromotionsPage ? promotionsProduct : productRoute.product
  const showSignupGarantidaBanner = isSignupPage && isSignupGarantidaBannerEnabled
  const hasSignupDepositPending = signupPendingDepositAmountCents !== null
  const hasSignupIdentityPending = signupPendingRequirement === 'identity'
  const hasSignupLimitsPending = signupPendingRequirement === 'limits'
  const headerDepositStatus = hasSignupDepositPending
    ? 'deposit-pending'
    : hasSignupIdentityPending
      ? 'identity-pending'
      : hasSignupLimitsPending
        ? 'limits-pending'
        : undefined
  const depositConfirmationMode = depositPanelOrigin === 'signup' ? 'on-pix-copy' : 'on-pix-generated'
  const depositPanelInitialView = depositPanelOrigin === 'signup' && hasSignupDepositPending ? 'pix' : 'form'
  const depositPanelInitialAmountCents = depositPanelOrigin === 'signup'
    ? signupPendingDepositAmountCents
    : null
  const isDepositRequiredForBetting = authVariant === 'logged-in' && balanceCents <= 0

  const syncBrowserLocation = useCallback(() => {
    const nextPathname = window.location.pathname
    const nextSearch = window.location.search

    setPathname(nextPathname)
    setSearch(nextSearch)

    if (!isAuthPath(nextPathname)) {
      setIsSignupGarantidaBannerEnabled(hasGarantidaBannerParam(nextSearch))
    }
  }, [])

  useEffect(() => {
    if (isCurrentPromotionsPage) return
    if (isHandoffPage) return
    if (isAuthPage) return
    if (actualProductRoute.isCanonicalProductRoute) return

    const nextPath = withSearch(buildProductPath(actualProductRoute.product), getGarantidaBannerSearch(search))
    window.history.replaceState({}, '', nextPath)
    const timer = window.setTimeout(() => {
      syncBrowserLocation()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [actualProductRoute, isCurrentPromotionsPage, isAuthPage, isHandoffPage, search, syncBrowserLocation])

  useEffect(() => {
    if (!isCurrentPromotionsPage) return
    if (isCanonicalPromotionsPath(pathname)) return

    const nextPath = withSearch(buildPromotionsPath(), getGarantidaBannerSearch(search))
    window.history.replaceState({}, '', nextPath)
    const timer = window.setTimeout(() => {
      syncBrowserLocation()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [isCurrentPromotionsPage, pathname, search, syncBrowserLocation])

  useEffect(() => {
    const handlePopState = () => {
      syncBrowserLocation()
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [syncBrowserLocation])

  const handleProductChange = useCallback((product: ProductMode) => {
    if (isPromotionsPage) {
      setPromotionsProduct(product)
      const nextPath = withSearch(buildProductPath(product), getGarantidaBannerSearch(search))

      if (getCurrentPathWithSearch() !== nextPath) {
        window.history.pushState({}, '', nextPath)
      }

      syncBrowserLocation()
      return
    }

    const nextPath = withSearch(buildProductPath(product), getGarantidaBannerSearch(search))

    if (getCurrentPathWithSearch() !== nextPath) {
      window.history.pushState({}, '', nextPath)
    }

    syncBrowserLocation()
  }, [isPromotionsPage, search, syncBrowserLocation])

  const handleAuthOpen = useCallback((nextPath: string) => {
    const isCurrentlyAuthPath = isAuthPath(window.location.pathname)

    if (!isCurrentlyAuthPath) {
      loginReturnPathRef.current = getCurrentPathWithSearch()
      setLoginMotionState('entering')
    } else if (!loginMotionState) {
      loginReturnPathRef.current = loginReturnPathRef.current ?? buildProductPath(defaultProduct)
      setLoginMotionState('open')
    }

    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath)
    }

    syncBrowserLocation()
  }, [loginMotionState, syncBrowserLocation])

  const handleLoginOpen = useCallback(() => {
    if (!isAuthPath(window.location.pathname)) {
      setAuthOverlayOrigin('default')
    }

    handleAuthOpen(buildLoginPath())
  }, [handleAuthOpen])

  const handleCreateAccountClick = useCallback(() => {
    if (!isAuthPath(window.location.pathname)) {
      setAuthOverlayOrigin('default')
    }

    handleAuthOpen(buildSignupPath())
  }, [handleAuthOpen])

  const handleSignupIdentityOpen = useCallback(() => {
    if (!isAuthPath(window.location.pathname)) {
      setAuthOverlayOrigin('default')
    }

    handleAuthOpen(buildSignupPath())
  }, [handleAuthOpen])

  const handleSignupLimitsOpen = useCallback(() => {
    if (!isAuthPath(window.location.pathname)) {
      setAuthOverlayOrigin('default')
    }

    handleAuthOpen(buildSignupPath())
  }, [handleAuthOpen])

  const handleBetslipLoginOpen = useCallback(() => {
    setAuthOverlayOrigin('betslip')
    handleAuthOpen(buildLoginPath())
  }, [handleAuthOpen])

  const handleBetslipCreateAccountClick = useCallback(() => {
    setAuthOverlayOrigin('betslip')
    handleAuthOpen(buildSignupPath())
  }, [handleAuthOpen])

  const handleBetslipIdentityOpen = useCallback(() => {
    setAuthOverlayOrigin('betslip')
    handleAuthOpen(buildSignupPath())
  }, [handleAuthOpen])

  const handleBetslipLimitsOpen = useCallback(() => {
    setAuthOverlayOrigin('betslip')
    handleAuthOpen(buildSignupPath())
  }, [handleAuthOpen])

  const completeLoginExit = useCallback((nextPath: string, onComplete?: () => void) => {
    if (loginMotionTimerRef.current !== null) {
      window.clearTimeout(loginMotionTimerRef.current)
      loginMotionTimerRef.current = null
    }

    setLoginMotionState('exiting')

    loginMotionTimerRef.current = window.setTimeout(() => {
      loginMotionTimerRef.current = null
      onComplete?.()
      loginReturnPathRef.current = null
      setAuthOverlayOrigin('default')
      setLoginMotionState(null)

      if (getCurrentPathWithSearch() !== nextPath) {
        window.history.pushState({}, '', nextPath)
      }

      syncBrowserLocation()
    }, loginMotionDurationMs)
  }, [syncBrowserLocation])

  const handleLoginBack = useCallback(() => {
    if (loginMotionState === 'exiting') return

    const fallbackPath = buildProductPath(defaultProduct)
    const nextPath = loginReturnPathRef.current ?? fallbackPath

    completeLoginExit(nextPath)
  }, [completeLoginExit, loginMotionState])

  const handleLoginSuccess = useCallback(() => {
    if (loginMotionState === 'exiting') return

    const fallbackPath = buildProductPath(defaultProduct)
    const nextPath = loginReturnPathRef.current ?? fallbackPath

    setAuthVariant('logged-in')
    setBalanceCents(loggedInInitialBalanceCents)
    setSignupPendingDepositAmountCents(null)
    setSignupPendingRequirement(null)
    completeLoginExit(nextPath)
  }, [completeLoginExit, loginMotionState])

  const handleSignupIdentityExit = useCallback(() => {
    if (loginMotionState === 'exiting') return

    const fallbackPath = buildProductPath(defaultProduct)
    const nextPath = loginReturnPathRef.current ?? fallbackPath

    setAuthVariant('logged-in')
    setBalanceCents(signupInitialBalanceCents)
    setSignupPendingDepositAmountCents(null)
    setSignupPendingRequirement('identity')
    completeLoginExit(nextPath)
  }, [completeLoginExit, loginMotionState])

  const handleSignupIdentityVerificationStart = useCallback(() => {
    setSignupPendingRequirement((currentRequirement) => (
      currentRequirement === 'identity' ? null : currentRequirement
    ))
  }, [])

  const handleSignupLimitsExit = useCallback(() => {
    if (loginMotionState === 'exiting') return

    const fallbackPath = buildProductPath(defaultProduct)
    const nextPath = loginReturnPathRef.current ?? fallbackPath

    setAuthVariant('logged-in')
    setBalanceCents(signupInitialBalanceCents)
    setSignupPendingDepositAmountCents(null)
    setSignupPendingRequirement('limits')
    completeLoginExit(nextPath)
  }, [completeLoginExit, loginMotionState])

  const handleSignupDepositOpen = useCallback(() => {
    if (loginMotionState === 'exiting') return

    const fallbackPath = buildProductPath(defaultProduct)
    const nextPath = loginReturnPathRef.current ?? fallbackPath

    setAuthVariant('logged-in')
    setBalanceCents(signupInitialBalanceCents)
    setSignupPendingDepositAmountCents(null)
    setSignupPendingRequirement(null)
    setDepositPanelOrigin('signup')
    signupDepositExitPathRef.current = nextPath
    setIsDepositPanelOpen(true)
  }, [loginMotionState])

  const handleDepositPanelEnterComplete = useCallback(() => {
    const nextPath = signupDepositExitPathRef.current
    if (!nextPath) return

    signupDepositExitPathRef.current = null
    completeLoginExit(nextPath)
  }, [completeLoginExit])

  const handleLoginEnterComplete = useCallback(() => {
    setLoginMotionState((currentState) => (
      currentState === 'entering' ? 'open' : currentState
    ))
  }, [])

  useEffect(() => {
    if (!isAuthPage) return
    if (loginReturnPathRef.current) return

    loginReturnPathRef.current = buildProductPath(defaultProduct)
  }, [isAuthPage])

  useEffect(() => {
    if (isAuthPage || loginMotionState === 'exiting') return
    if (!loginMotionState) return

    setLoginMotionState(null)
  }, [isAuthPage, loginMotionState])

  useEffect(() => {
    if (isAuthPage || authOverlayOrigin === 'default') return

    setAuthOverlayOrigin('default')
  }, [authOverlayOrigin, isAuthPage])

  useEffect(() => () => {
    if (loginMotionTimerRef.current !== null) {
      window.clearTimeout(loginMotionTimerRef.current)
    }
  }, [])

  const handleNavbarItemSelect = useCallback((itemId: string) => {
    if (itemId === promotionsRouteSegment) {
      if (!ENABLE_APP_PROMOTIONS_NAV_LINK) return

      const nextPath = withSearch(buildPromotionsPath(), getGarantidaBannerSearch(search))
      setPromotionsProduct(activeProduct)

      if (getCurrentPathWithSearch() !== nextPath) {
        window.history.pushState({}, '', nextPath)
      }

      syncBrowserLocation()
      return
    }

    if (isPromotionsPage && itemId === 'home') {
      const nextPath = withSearch(buildProductPath(activeProduct), getGarantidaBannerSearch(search))

      if (getCurrentPathWithSearch() !== nextPath) {
        window.history.pushState({}, '', nextPath)
      }

      syncBrowserLocation()
    }
  }, [activeProduct, isPromotionsPage, search, syncBrowserLocation])

  const handleBetslipClose = useCallback(() => {
    setIsFullBetslipOpen(false)
  }, [])

  const handleBetSuccess = useCallback((receipt: BetSuccessReceipt) => {
    setBetSuccessReceipt(receipt)
  }, [])

  const handleBetSuccessShare = useCallback(() => {
    // Placeholder until the prototype gets a real share integration.
  }, [])

  const handleBetSuccessNewBet = useCallback(() => {
    setBetSuccessReceipt(null)
    setIsCompactBetslipSuppressed(false)

    const nextPath = withSearch(buildProductPath(defaultProduct), getGarantidaBannerSearch(search))

    if (getCurrentPathWithSearch() !== nextPath) {
      window.history.pushState({}, '', nextPath)
    }

    syncBrowserLocation()
  }, [search, syncBrowserLocation])

  const handleBetslipOpen = useCallback(() => {
    setIsCompactBetslipSuppressed(false)
    setIsFullBetslipOpen(true)
    setLiveEventUi((current) => (
      current.isOpen
        ? {
            ...current,
            isOpen: false,
            isEventBetslipVisible: false,
          }
        : current
    ))
  }, [])

  const handleCompactBetslipSuppress = useCallback(() => {
    setIsCompactBetslipSuppressed(true)
  }, [])

  const handleDepositPanelOpen = useCallback(() => {
    setDepositPanelOrigin(signupPendingDepositAmountCents !== null ? 'signup' : 'standard')
    setIsDepositPanelOpen(true)
  }, [signupPendingDepositAmountCents])

  const handleDepositPanelClose = useCallback(() => {
    setIsDepositPanelOpen(false)
  }, [])

  const handleDepositConfirmed = useCallback((depositAmountCents: number) => {
    setBalanceCents((currentBalanceCents) => currentBalanceCents + depositAmountCents)
    setSignupPendingDepositAmountCents(null)
  }, [])

  const handleSignupDepositPending = useCallback((pendingAmountCents: number) => {
    setSignupPendingDepositAmountCents(pendingAmountCents)
  }, [])

  const handleFeatureFlagsPanelClose = useCallback(() => {
    setIsFeatureFlagsPanelOpen(false)
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

  useEffect(() => {
    const handleBetslipLiveEventOpen = (event: Event) => {
      const payload = (event as CustomEvent<LiveEventOpenPayload>).detail
      if (!payload?.matches?.length) return

      setIsFullBetslipOpen(true)
      setBetslipOriginLiveEvent({ isOpen: true, payload })
      handleLiveEventOpenChange(true)
    }

    window.addEventListener(BETSLIP_LIVE_EVENT_OPEN_EVENT, handleBetslipLiveEventOpen)
    return () => window.removeEventListener(BETSLIP_LIVE_EVENT_OPEN_EVENT, handleBetslipLiveEventOpen)
  }, [handleLiveEventOpenChange])

  const handleBetslipOriginLiveEventClose = useCallback(() => {
    setBetslipOriginLiveEvent(null)
    handleLiveEventOpenChange(false)
  }, [handleLiveEventOpenChange])

  const handleEventBetslipOpen = useCallback(() => {
    if (!betslipOriginLiveEvent) {
      handleBetslipOpen()
      return
    }

    setIsFullBetslipOpen(true)
    handleLiveEventCloseStart()
    setBetslipOriginLiveEvent((current) => (
      current ? { ...current, isOpen: false } : current
    ))
  }, [betslipOriginLiveEvent, handleBetslipOpen, handleLiveEventCloseStart])

  useEffect(() => {
    if (!isCompactBetslipSuppressed || betslipSummary.hasSelections) return

    setIsCompactBetslipSuppressed(false)
  }, [betslipSummary.hasSelections, isCompactBetslipSuppressed])

  useEffect(() => {
    if (!betslipSummary.hasSelections) return

    void import('./pages/BetslipPageV2')
  }, [betslipSummary.hasSelections])

  const showCompactBetslip = activeProduct === 'apostas'
    && !isPromotionsPage
    && !isHandoffPage
    && !isAuthPage
    && betslipSummary.hasSelections
    && !isCompactBetslipSuppressed
  const shouldShowEventBetslip = showCompactBetslip && liveEventUi.isOpen && liveEventUi.isEventBetslipVisible
  const showFreeBetTag = isFeatureEnabled('freeBetsAvailable') && hasOnlyBrasileiraoSelections
  const isAuthOverlayOpen = !isHandoffPage && (isAuthPage || loginMotionState !== null)
  const shouldRenderFullBetslip = !isHandoffPage
    && isFullBetslipOpen
    && (!isAuthPage || authOverlayOrigin === 'betslip')

  useEffect(() => {
    document.documentElement.toggleAttribute('data-betslip-compact-visible', showCompactBetslip)
    document.documentElement.toggleAttribute('data-live-event-betslip-visible', shouldShowEventBetslip)
  }, [showCompactBetslip, shouldShowEventBetslip])

  useEffect(() => {
    const restoreAuthScrollLock = () => {
      const lockState = authScrollLockRef.current

      if (!lockState) return

      document.documentElement.style.overflow = lockState.rootOverflow
      document.body.style.overflow = lockState.bodyOverflow
      authScrollLockRef.current = null
      window.scrollTo(0, lockState.scrollY)
    }

    document.documentElement.toggleAttribute('data-auth-page-open', isAuthOverlayOpen)

    if (isAuthOverlayOpen && authScrollLockRef.current === null) {
      authScrollLockRef.current = {
        scrollY: window.scrollY,
        bodyOverflow: document.body.style.overflow,
        rootOverflow: document.documentElement.style.overflow,
      }

      document.documentElement.style.overflow = 'hidden'
      document.body.style.overflow = 'hidden'
    } else if (!isAuthOverlayOpen) {
      restoreAuthScrollLock()
    }

    return () => {
      restoreAuthScrollLock()
      document.documentElement.removeAttribute('data-auth-page-open')
    }
  }, [isAuthOverlayOpen])

  useEffect(() => {
    return () => {
      document.documentElement.removeAttribute('data-betslip-compact-visible')
      document.documentElement.removeAttribute('data-live-event-betslip-visible')
      document.documentElement.removeAttribute('data-auth-page-open')
    }
  }, [])

  return (
    <div className="app-shell">
      <BrandLocalizationEffect brandMode={brandMode} />
      <LocationPermissionGate isEnabled={!isHandoffPage} />
      {!isHandoffPage ? <MobileOnly /> : null}
      <Suspense fallback={<RouteFallback />}>
        {isHandoffPage ? (
          <HandoffPage />
        ) : isPromotionsPage ? (
          <PromotionsPage
            activeProduct={activeProduct}
            authVariant={authVariant}
            balanceCents={balanceCents}
            depositStatus={headerDepositStatus}
            HeaderComponent={HeaderV2}
            onLoginClick={handleLoginOpen}
            onCreateAccountClick={handleCreateAccountClick}
            onDepositOpen={handleDepositPanelOpen}
            onIdentityOpen={handleSignupIdentityOpen}
            onLimitsOpen={handleSignupLimitsOpen}
            onProductChange={handleProductChange}
          />
        ) : (
          <Home
            activeProduct={activeProduct}
            authVariant={authVariant}
            balanceCents={balanceCents}
            depositStatus={headerDepositStatus}
            HeaderComponent={HeaderV2}
            isLiveEventSuppressed={isFullBetslipOpen}
            onLoginClick={handleLoginOpen}
            onCreateAccountClick={handleCreateAccountClick}
            onDepositOpen={handleDepositPanelOpen}
            onIdentityOpen={handleSignupIdentityOpen}
            onLimitsOpen={handleSignupLimitsOpen}
            onProductChange={handleProductChange}
            onLiveEventOpenChange={handleLiveEventOpenChange}
            onLiveEventOpenSettled={handleLiveEventOpenSettled}
            onLiveEventCloseStart={handleLiveEventCloseStart}
          />
        )}
      </Suspense>
      {!isHandoffPage && isAuthPage ? (
        <LoginPage
          mode={isSignupPage ? 'signup' : 'login'}
          motionState={loginMotionState ?? 'open'}
          overlayVariant={authOverlayOrigin === 'betslip' ? 'over-betslip' : 'default'}
          onBack={handleLoginBack}
          onCreateAccountClick={handleCreateAccountClick}
          onDepositOpen={handleSignupDepositOpen}
          onEnterComplete={handleLoginEnterComplete}
          onIdentityExit={handleSignupIdentityExit}
          onIdentityVerificationStart={handleSignupIdentityVerificationStart}
          onLoginClick={handleLoginOpen}
          onLoginSuccess={handleLoginSuccess}
          onLimitsExit={handleSignupLimitsExit}
          resumeSignupIdentity={hasSignupIdentityPending}
          resumeSignupLimits={hasSignupLimitsPending}
          showSignupGarantidaBanner={showSignupGarantidaBanner}
        />
      ) : null}
      {shouldRenderFullBetslip ? (
        <Suspense fallback={null}>
          <BetslipPageV2
            authVariant={authVariant}
            isCoveredByEvent={!!betslipOriginLiveEvent}
            onCreateAccountClick={handleBetslipCreateAccountClick}
            onDepositClick={handleDepositPanelOpen}
            onIdentityClick={handleBetslipIdentityOpen}
            onLimitsClick={handleBetslipLimitsOpen}
            onLoginClick={handleBetslipLoginOpen}
            onClose={handleBetslipClose}
            onBetSuccess={handleBetSuccess}
            onSelectionsEmptyExitStart={handleCompactBetslipSuppress}
            requiresIdentity={hasSignupIdentityPending}
            requiresDeposit={isDepositRequiredForBetting}
            requiresLimits={hasSignupLimitsPending}
          />
        </Suspense>
      ) : null}
      {!isHandoffPage && betSuccessReceipt ? (
        <Suspense fallback={null}>
          <BetSuccessPage
            receipt={betSuccessReceipt}
            onShare={handleBetSuccessShare}
            onNewBet={handleBetSuccessNewBet}
          />
        </Suspense>
      ) : null}
      {!isHandoffPage && !isAuthPage && betslipOriginLiveEvent ? (
        <Suspense fallback={null}>
          <LiveEventPage
            isOpen={betslipOriginLiveEvent.isOpen}
            onClose={handleBetslipOriginLiveEventClose}
            onOpenSettled={handleLiveEventOpenSettled}
            onCloseStart={handleLiveEventCloseStart}
            matches={betslipOriginLiveEvent.payload.matches}
            railEvents={betslipOriginLiveEvent.payload.railEvents}
            selectedIndex={betslipOriginLiveEvent.payload.selectedIndex}
            currentTimes={betslipOriginLiveEvent.payload.currentTimes}
            leagueName={betslipOriginLiveEvent.payload.leagueName}
            leagueFlag={betslipOriginLiveEvent.payload.leagueFlag}
            sport={betslipOriginLiveEvent.payload.sport}
          />
        </Suspense>
      ) : null}
      {!isHandoffPage && (!isAuthPage || isDepositPanelOpen) ? (
        <DepositPanel
          isOpen={isDepositPanelOpen}
          onClose={handleDepositPanelClose}
          confirmationMode={depositConfirmationMode}
          initialAmountCents={depositPanelInitialAmountCents}
          initialView={depositPanelInitialView}
          onEnterComplete={handleDepositPanelEnterComplete}
          onDepositConfirmed={handleDepositConfirmed}
          onDepositPending={depositPanelOrigin === 'signup' ? handleSignupDepositPending : undefined}
        />
      ) : null}
      {!isHandoffPage && !isAuthPage ? (
        <FeatureFlagsPanel isOpen={isFeatureFlagsPanelOpen} onClose={handleFeatureFlagsPanelClose} />
      ) : null}
      {!isHandoffPage && !isAuthPage ? (
        <>
          <Betslip
            visible={showCompactBetslip}
            summary={betslipSummary}
            turboEligibleSelectionCount={betslipTurboEligibleSelectionCount}
            showFreeBetTag={showFreeBetTag && !shouldShowEventBetslip}
            presentationKey="base"
            onOpen={handleBetslipOpen}
          />
          <Betslip
            visible={shouldShowEventBetslip}
            summary={betslipSummary}
            turboEligibleSelectionCount={betslipTurboEligibleSelectionCount}
            compactOnly={true}
            showFreeBetTag={showFreeBetTag && shouldShowEventBetslip}
            presentationKey={`live-event-${liveEventUi.betslipMotionKey}`}
            onOpen={handleEventBetslipOpen}
          />
        </>
      ) : null}
      {!isHandoffPage ? (
        <Navbar
          activeProduct={activeProduct}
          activeItemId={isPromotionsPage ? promotionsRouteSegment : undefined}
          onItemSelect={handleNavbarItemSelect}
        />
      ) : null}
    </div>
  )
}

function App() {
  return (
    <FeatureFlagsProvider>
      <BetslipProvider>
        <AppContent />
      </BetslipProvider>
    </FeatureFlagsProvider>
  )
}

export default App
