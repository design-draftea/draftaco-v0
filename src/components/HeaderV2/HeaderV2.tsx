import { useLayoutEffect, useRef, useState, type MouseEvent, type PointerEvent, type ReactNode } from 'react'
import './HeaderV2.css'
import logoDraftea from '../../assets/logoDraftea.svg'
import logoReidoPitaco from '../../assets/logoReidoPitaco.svg'
import logoReidoPitacoLight from '../../assets/logoReidoPitacoLight.svg'
import { NavigationMenuBottomSheet } from '../NavigationMenuBottomSheet'
import type { ProductMode } from '../../types/home'
import { useFeatureFlags } from '../../hooks/useFeatureFlags'

interface HeaderV2Props {
  activeProduct?: ProductMode
  activeSport?: string | null
  rail?: ReactNode
  authVariant?: 'logged-in' | 'logged-out'
  balanceCents?: number
  showMenuButton?: boolean
  changeProductOnPointerDown?: boolean
  disableProductToggle?: boolean
  disableMenuButton?: boolean
  onProductChange?: (product: ProductMode) => void
  onLogoClick?: () => void
  onLogoDoubleClick?: () => void
  onLoginClick?: () => void
  onCreateAccountClick?: () => void
  onDepositOpen?: () => void
  children?: ReactNode
}

const defaultBalanceCents = 25000
const headerLogoDoubleTapDelay = 650
const headerLogoActivationCooldown = 300
const headerLogoLongPressDelay = 550
const formatBalanceDisplayValue = (amountCents: number) => {
  const safeAmountCents = Number.isFinite(amountCents) ? Math.max(0, amountCents) : 0

  return `R$${(safeAmountCents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function HeaderV2({
  activeSport,
  rail,
  authVariant = 'logged-out',
  balanceCents = defaultBalanceCents,
  showMenuButton = true,
  disableMenuButton = false,
  onLogoClick,
  onLogoDoubleClick,
  onLoginClick,
  onCreateAccountClick,
  onDepositOpen,
  children,
}: HeaderV2Props = {}) {
  const { brandMode } = useFeatureFlags()
  const isSportPage = !!activeSport && activeSport !== 'destaques'
  const isLoggedOut = authVariant === 'logged-out'
  const isDrafteaBrand = brandMode === 'draftea'
  const balanceDisplayValue = formatBalanceDisplayValue(balanceCents)
  const logoAlt = isDrafteaBrand ? 'Draftea' : 'Rei do Pitaco'
  const logoDark = isDrafteaBrand ? logoDraftea : logoReidoPitaco
  const logoLight = isDrafteaBrand ? logoDraftea : logoReidoPitacoLight
  const [isNavigationMenuOpen, setIsNavigationMenuOpen] = useState(false)
  const lastLogoTapTimeRef = useRef(0)
  const lastLogoActivationTimeRef = useRef(0)
  const logoLongPressTimerRef = useRef<number | null>(null)

  const clearLogoLongPressTimer = () => {
    if (logoLongPressTimerRef.current === null) return

    window.clearTimeout(logoLongPressTimerRef.current)
    logoLongPressTimerRef.current = null
  }

  const openFeatureFlagsFromLogo = () => {
    if (!onLogoDoubleClick) return

    const currentTime = Date.now()
    if (currentTime - lastLogoActivationTimeRef.current <= headerLogoActivationCooldown) return

    clearLogoLongPressTimer()
    lastLogoActivationTimeRef.current = currentTime
    lastLogoTapTimeRef.current = 0
    onLogoDoubleClick()
  }

  const handleLogoPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (!onLogoDoubleClick) return
    if (event.pointerType === 'mouse' && event.button !== 0) return

    clearLogoLongPressTimer()
    event.currentTarget.setPointerCapture?.(event.pointerId)
    logoLongPressTimerRef.current = window.setTimeout(() => {
      openFeatureFlagsFromLogo()
    }, headerLogoLongPressDelay)
  }

  const handleLogoPointerEnd = () => {
    clearLogoLongPressTimer()
  }

  const handleLogoClick = (event: MouseEvent<HTMLButtonElement>) => {
    const currentTime = Date.now()

    if (currentTime - lastLogoActivationTimeRef.current <= headerLogoActivationCooldown) return

    if (event.detail >= 2 && onLogoDoubleClick) {
      openFeatureFlagsFromLogo()
      return
    }

    if (onLogoClick) {
      lastLogoTapTimeRef.current = currentTime
      onLogoClick()
      return
    }

    if (!onLogoDoubleClick) return

    const elapsedTime = currentTime - lastLogoTapTimeRef.current

    if (elapsedTime > 0 && elapsedTime <= headerLogoDoubleTapDelay) {
      openFeatureFlagsFromLogo()
      return
    }

    lastLogoTapTimeRef.current = currentTime
  }

  useLayoutEffect(() => () => {
    clearLogoLongPressTimer()
  }, [])

  return (
    <header
      className={[
        'header',
        'header--v2',
        'header--gradient-v3',
        isSportPage ? 'header--sport-active' : 'header--competition-rail',
        'header--liquid-glass',
        'header--liquid-glass-new',
        !showMenuButton ? 'header--balance-only' : '',
        isLoggedOut ? 'header--logged-out' : 'header--logged-in',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="header__top">
        {onLogoDoubleClick || onLogoClick ? (
          <button
            type="button"
            className="header__logo header__logo-button"
            aria-label={onLogoClick ? 'Voltar para destaques' : 'Abrir feature flags'}
            aria-haspopup={onLogoDoubleClick ? 'dialog' : undefined}
            onPointerDown={handleLogoPointerDown}
            onPointerUp={handleLogoPointerEnd}
            onPointerCancel={handleLogoPointerEnd}
            onPointerLeave={handleLogoPointerEnd}
            onClick={handleLogoClick}
            onDoubleClick={openFeatureFlagsFromLogo}
            onContextMenu={(event) => event.preventDefault()}
          >
            <img
              src={logoDark}
              alt={logoAlt}
              className={[
                'header__logo-img',
                'header__logo-img--dark',
                isDrafteaBrand ? 'header__logo-img--draftea' : '',
              ].filter(Boolean).join(' ')}
            />
            <img
              src={logoLight}
              alt={logoAlt}
              className={[
                'header__logo-img',
                'header__logo-img--light',
                isDrafteaBrand ? 'header__logo-img--draftea' : '',
              ].filter(Boolean).join(' ')}
            />
          </button>
        ) : (
          <div className="header__logo">
            <img
              src={logoDark}
              alt={logoAlt}
              className={[
                'header__logo-img',
                'header__logo-img--dark',
                isDrafteaBrand ? 'header__logo-img--draftea' : '',
              ].filter(Boolean).join(' ')}
            />
            <img
              src={logoLight}
              alt={logoAlt}
              className={[
                'header__logo-img',
                'header__logo-img--light',
                isDrafteaBrand ? 'header__logo-img--draftea' : '',
              ].filter(Boolean).join(' ')}
            />
          </div>
        )}

        <div className="header__account-actions">
          {isLoggedOut ? (
            <>
              <button
                type="button"
                className="header__auth-btn header__auth-btn--primary"
                onClick={onCreateAccountClick}
              >
                Criar conta
              </button>
              <button
                type="button"
                className="header__auth-btn header__auth-btn--secondary"
                onClick={onLoginClick}
              >
                Entrar
              </button>
            </>
          ) : (
            <>
              <div
                className="header__balance"
                aria-label={`Saldo disponível: ${balanceDisplayValue}`}
              >
                <span className="header__balance-content">
                  <span className="header__balance-value">{balanceDisplayValue}</span>
                  <span className="header__balance-label">SALDO</span>
                </span>
                <button
                  type="button"
                  className="header__deposit-icon-shell"
                  aria-label="Depositar"
                  onClick={onDepositOpen}
                >
                  <span className="header__deposit-icon" />
                </button>
              </div>
              {showMenuButton && (
                <button
                  type="button"
                  className="header__menu-btn"
                  aria-label="Abrir menu"
                  aria-expanded={isNavigationMenuOpen}
                  aria-disabled={disableMenuButton}
                  disabled={disableMenuButton}
                  onClick={disableMenuButton ? undefined : () => setIsNavigationMenuOpen(true)}
                >
                  <span aria-hidden="true" className="header__menu-icon" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {rail}
      {children}
      {!isLoggedOut && showMenuButton && (
        <NavigationMenuBottomSheet
          isOpen={isNavigationMenuOpen}
          balanceCents={balanceCents}
          onDepositOpen={onDepositOpen}
          onClose={() => setIsNavigationMenuOpen(false)}
        />
      )}
    </header>
  )
}
