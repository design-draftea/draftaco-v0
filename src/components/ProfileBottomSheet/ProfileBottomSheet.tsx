import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import backHeaderIcon from '../../assets/iconsDraftaco/backHeader.svg'
import closeIcon from '../../assets/iconsDraftaco/closeBS.svg'
import chevronRightIcon from '../../assets/iconsDraftaco/chevronRight.svg'
import freeBetIcon from '../../assets/iconsDraftaco/iconMenuApostaGratis.png'
import settingsIcon from '../../assets/iconsDraftaco/iconMenuConfiguracoes.svg'
import depositIcon from '../../assets/iconsDraftaco/iconMenuDepositar.svg'
import faqIcon from '../../assets/iconsDraftaco/iconMenuDuvidasFrequentes.svg'
import earningsIcon from '../../assets/iconsDraftaco/iconMenuGanhosPerdas.svg'
import incomeReportIcon from '../../assets/iconsDraftaco/iconMenuInformeRendimentos.svg'
import responsibleGamingIcon from '../../assets/iconsDraftaco/iconMenuJogoResponsavel.svg'
import personalDataIcon from '../../assets/iconsDraftaco/iconMenuMeusDados.svg'
import activitiesIcon from '../../assets/iconsDraftaco/iconMenuMinhasAtividades.svg'
import privacyIcon from '../../assets/iconsDraftaco/iconMenuPoliticaPrivacidade.svg'
import responsibleGamingPolicyIcon from '../../assets/iconsDraftaco/iconMenuPoliticaJogoResp.svg'
import rulesIcon from '../../assets/iconsDraftaco/iconMenuRegrasApostas.svg'
import freeSpinIcon from '../../assets/iconsDraftaco/iconMenuRodadaGratis.png'
import withdrawIcon from '../../assets/iconsDraftaco/iconMenuSacar.svg'
import logoutIcon from '../../assets/iconsDraftaco/iconMenuSair.svg'
import suggestionsIcon from '../../assets/iconsDraftaco/iconMenuSugestoes.svg'
import supportIcon from '../../assets/iconsDraftaco/iconMenuSuporte.svg'
import termsIcon from '../../assets/iconsDraftaco/iconMenuTermos.svg'
import balanceChevronDownIcon from '../../assets/iconsDraftaco/profileBalanceChevronDown.svg'
import profileCardLight from '../../assets/iconsDraftaco/profileCardLight.svg'
import { useTouchScrollFence } from '../../hooks/useTouchScrollFence'
import {
  DepositPanel,
  type DepositAccount,
  type DepositAccountId,
} from '../DepositPanel'
import '../DepositPanel/DepositPanel.css'
import './ProfileBottomSheet.css'

export interface ProfileDepositFlowProps {
  savedAccounts?: DepositAccount[]
  activeAccountId?: DepositAccountId | null
  newBankAccountId?: DepositAccountId | null
  onRemoveAccount?: (accountId: DepositAccountId) => void
  onSelectAccount?: (accountId: DepositAccountId) => void
  onDepositConfirmed?: (amountCents: number, accountId: DepositAccountId) => void
}

interface ProfileBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  balanceCents?: number
  depositFlow?: ProfileDepositFlowProps
}

type ProfileSheetMotionState = 'entering' | 'open' | 'closing'
type ProfileRoute = 'profile' | 'deposit'
type EmbeddedDepositView = 'form' | 'pix'

const profileSheetMotionDurationMs = 300
const defaultBalanceCents = 25000

const profileMenuSections = [
  {
    id: 'account',
    title: 'MINHA CONTA',
    options: [
      { label: 'Minhas atividades', icon: activitiesIcon },
      { label: 'Jogo Responsável', icon: responsibleGamingIcon },
      { label: 'Meus dados', icon: personalDataIcon },
      { label: 'Configurações de aposta', icon: settingsIcon },
    ],
  },
  {
    id: 'support',
    title: 'SUPORTE',
    options: [
      { label: 'Dúvidas Frequentes', icon: faqIcon },
      { label: 'Regras de Jogos e Apostas', icon: rulesIcon },
    ],
  },
  {
    id: 'legal',
    title: 'LEGAL',
    options: [
      { label: 'Ganhos e Perdas', icon: earningsIcon },
      { label: 'Termos e Condições', icon: termsIcon },
      { label: 'Política de Privacidade', icon: privacyIcon },
      { label: 'Política de Jogo Responsável', icon: responsibleGamingPolicyIcon },
      { label: 'Informe de Rendimentos', icon: incomeReportIcon },
    ],
  },
]

const formatBalance = (amountCents: number) => {
  const safeAmountCents = Number.isFinite(amountCents) ? Math.max(0, amountCents) : 0

  return `R$ ${(safeAmountCents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function ProfileBottomSheet({
  isOpen,
  onClose,
  balanceCents = defaultBalanceCents,
  depositFlow,
}: ProfileBottomSheetProps) {
  const [shouldRender, setShouldRender] = useState(false)
  const [motionState, setMotionState] = useState<ProfileSheetMotionState>('entering')
  const shouldRenderRef = useRef(false)
  const openTimerRef = useRef<number | null>(null)
  const closeTimerRef = useRef<number | null>(null)
  const routeTimerRef = useRef<number | null>(null)
  const routeFrameRef = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [route, setRoute] = useState<ProfileRoute>('profile')
  const [isRouteTransitioning, setIsRouteTransitioning] = useState(false)
  const [isDepositMounted, setIsDepositMounted] = useState(false)
  const [depositView, setDepositView] = useState<EmbeddedDepositView>('form')
  const [depositHost, setDepositHost] = useState<HTMLDivElement | null>(null)

  const clearOpenTimer = useCallback(() => {
    if (openTimerRef.current === null) return

    window.clearTimeout(openTimerRef.current)
    openTimerRef.current = null
  }, [])

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current === null) return

    window.clearTimeout(closeTimerRef.current)
    closeTimerRef.current = null
  }, [])

  const clearRouteMotion = useCallback(() => {
    if (routeTimerRef.current !== null) {
      window.clearTimeout(routeTimerRef.current)
      routeTimerRef.current = null
    }

    if (routeFrameRef.current !== null) {
      window.cancelAnimationFrame(routeFrameRef.current)
      routeFrameRef.current = null
    }
  }, [])

  const requestClose = useCallback(() => {
    if (motionState === 'closing') return
    onClose()
  }, [motionState, onClose])

  const handleDepositOpen = useCallback(() => {
    if (!depositFlow || !depositHost || motionState === 'closing' || isRouteTransitioning) return

    clearRouteMotion()
    setDepositView('form')
    setIsDepositMounted(true)
    setIsRouteTransitioning(true)

    routeFrameRef.current = window.requestAnimationFrame(() => {
      routeFrameRef.current = null
      setRoute('deposit')
      routeTimerRef.current = window.setTimeout(() => {
        routeTimerRef.current = null
        setIsRouteTransitioning(false)
      }, profileSheetMotionDurationMs)
    })
  }, [clearRouteMotion, depositFlow, depositHost, isRouteTransitioning, motionState])

  const handleDepositBack = useCallback(() => {
    if (route !== 'deposit' || depositView !== 'form' || isRouteTransitioning) return

    clearRouteMotion()
    setIsRouteTransitioning(true)
    setRoute('profile')
    routeTimerRef.current = window.setTimeout(() => {
      routeTimerRef.current = null
      setIsDepositMounted(false)
      setDepositView('form')
      setIsRouteTransitioning(false)
    }, profileSheetMotionDurationMs)
  }, [clearRouteMotion, depositView, isRouteTransitioning, route])

  useEffect(() => {
    shouldRenderRef.current = shouldRender
  }, [shouldRender])

  useEffect(() => {
    clearOpenTimer()
    clearCloseTimer()

    if (isOpen) {
      openTimerRef.current = window.setTimeout(() => {
        openTimerRef.current = null
        setShouldRender(true)
        setMotionState('entering')

        openTimerRef.current = window.setTimeout(() => {
          openTimerRef.current = null
          setMotionState('open')
        }, profileSheetMotionDurationMs)
      }, 0)

      return () => {
        clearOpenTimer()
        clearCloseTimer()
      }
    }

    if (!shouldRenderRef.current) return undefined

    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null
      setMotionState('closing')

      closeTimerRef.current = window.setTimeout(() => {
        closeTimerRef.current = null
        setShouldRender(false)
        setMotionState('entering')
      }, profileSheetMotionDurationMs)
    }, 0)

    return () => {
      clearOpenTimer()
      clearCloseTimer()
    }
  }, [clearCloseTimer, clearOpenTimer, isOpen])

  useEffect(() => () => {
    clearOpenTimer()
    clearCloseTimer()
    clearRouteMotion()
  }, [clearCloseTimer, clearOpenTimer, clearRouteMotion])

  useEffect(() => {
    if (isOpen) return undefined

    const resetTimer = window.setTimeout(() => {
      clearRouteMotion()
      setRoute('profile')
      setIsDepositMounted(false)
      setDepositView('form')
      setIsRouteTransitioning(false)
    }, profileSheetMotionDurationMs)

    return () => window.clearTimeout(resetTimer)
  }, [clearRouteMotion, isOpen])

  useEffect(() => {
    if (!shouldRender) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [shouldRender])

  useEffect(() => {
    if (!shouldRender) return undefined

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') requestClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [requestClose, shouldRender])

  useTouchScrollFence(containerRef, shouldRender)

  if (!shouldRender) return null

  return createPortal(
    <div
      className="deposit-panel__container deposit-panel__container--bottom-sheet"
      ref={containerRef}
    >
      <div
        className={`deposit-panel__overlay deposit-panel__overlay--${motionState}`}
        onClick={requestClose}
      />
      <aside
        className={`deposit-panel deposit-panel--bottom-sheet deposit-panel--${motionState}`}
        role="dialog"
        aria-modal="true"
        aria-label={route === 'profile' ? 'Meu perfil' : 'Depositar'}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="deposit-panel__header">
          <button
            type="button"
            className={[
              'deposit-panel__back',
              'profile-bottom-sheet__back',
              route === 'deposit' && depositView === 'form'
                ? 'profile-bottom-sheet__back--visible'
                : '',
            ].filter(Boolean).join(' ')}
            aria-label="Voltar para meu perfil"
            aria-hidden={route !== 'deposit' || depositView !== 'form'}
            tabIndex={route === 'deposit' && depositView === 'form' ? 0 : -1}
            disabled={isRouteTransitioning || route !== 'deposit' || depositView !== 'form'}
            onClick={handleDepositBack}
          >
            <img src={backHeaderIcon} alt="" aria-hidden="true" />
          </button>
          <div className="profile-bottom-sheet__titles" aria-live="polite">
            <h2
              className={[
                'deposit-panel__title',
                'profile-bottom-sheet__title',
                route === 'profile' ? 'profile-bottom-sheet__title--visible' : '',
              ].filter(Boolean).join(' ')}
              aria-hidden={route !== 'profile'}
            >
              Meu perfil
            </h2>
            <h2
              className={[
                'deposit-panel__title',
                'profile-bottom-sheet__title',
                route === 'deposit' && depositView === 'form'
                  ? 'profile-bottom-sheet__title--visible'
                  : '',
              ].filter(Boolean).join(' ')}
              aria-hidden={route !== 'deposit' || depositView !== 'form'}
            >
              Deposite para jogar
            </h2>
          </div>
          <button
            type="button"
            className="deposit-panel__close"
            aria-label={route === 'profile' ? 'Fechar meu perfil' : 'Fechar depósito'}
            onClick={requestClose}
          >
            <img src={closeIcon} alt="" aria-hidden="true" />
          </button>
        </header>

        <div
          className={[
            'deposit-panel__content',
            'profile-bottom-sheet__stage',
            `profile-bottom-sheet__stage--${route}`,
          ].join(' ')}
        >
          <div
            className="profile-bottom-sheet__route profile-bottom-sheet__route--profile"
            aria-hidden={route !== 'profile'}
            inert={route !== 'profile' ? true : undefined}
          >
            <div className="deposit-panel__view profile-bottom-sheet__content">
            <section className="profile-balance" aria-label="Resumo do saldo">
              <div className="profile-balance__header">
                <div className="profile-balance__heading">
                  <p className="profile-balance__amount">{formatBalance(balanceCents)}</p>
                  <p className="profile-balance__subtitle">Disponível para jogar</p>
                </div>
                <span className="profile-balance__expand" aria-hidden="true">
                  <img src={balanceChevronDownIcon} alt="" />
                </span>
              </div>

              <div className="profile-balance__actions">
                <div className="profile-balance__action profile-balance__action--secondary">
                  <img src={withdrawIcon} alt="" aria-hidden="true" />
                  <span>Sacar</span>
                </div>
                <button
                  type="button"
                  className="profile-balance__action profile-balance__action--primary"
                  onClick={handleDepositOpen}
                  disabled={!depositFlow || isRouteTransitioning}
                >
                  <img src={depositIcon} alt="" aria-hidden="true" />
                  <span>Depositar</span>
                </button>
              </div>

              <div className="profile-balance__rewards">
                <div className="profile-balance__reward">
                  <p className="profile-balance__reward-label">Apostas Grátis</p>
                  <div className="profile-balance__reward-value">
                    <img className="profile-balance__reward-icon" src={freeBetIcon} alt="" aria-hidden="true" />
                    <span>R$ 200,00</span>
                    <img className="profile-balance__reward-chevron" src={chevronRightIcon} alt="" aria-hidden="true" />
                  </div>
                </div>
                <div className="profile-balance__reward">
                  <p className="profile-balance__reward-label">Rodadas Grátis</p>
                  <div className="profile-balance__reward-value">
                    <img className="profile-balance__reward-icon" src={freeSpinIcon} alt="" aria-hidden="true" />
                    <span>10</span>
                    <img className="profile-balance__reward-chevron" src={chevronRightIcon} alt="" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </section>

            <div className="profile-shortcuts" aria-label="Atalhos do perfil">
              <button type="button" className="profile-shortcut-card">
                <img className="profile-shortcut-card__light" src={profileCardLight} alt="" aria-hidden="true" />
                <img className="profile-shortcut-card__icon" src={supportIcon} alt="" aria-hidden="true" />
                <span>Suporte</span>
              </button>
              <button type="button" className="profile-shortcut-card">
                <img className="profile-shortcut-card__light" src={profileCardLight} alt="" aria-hidden="true" />
                <img className="profile-shortcut-card__icon" src={suggestionsIcon} alt="" aria-hidden="true" />
                <span>Sugestões</span>
              </button>
            </div>

            <div className="profile-menu-groups">
              {profileMenuSections.map((section) => (
                <section className="profile-menu-section" key={section.id} aria-labelledby={`profile-menu-${section.id}`}>
                  <h3 className="profile-menu-section__title" id={`profile-menu-${section.id}`}>
                    {section.title}
                  </h3>
                  <div className="profile-menu-section__options">
                    {section.options.map((option) => (
                      <button type="button" className="profile-menu-option" key={option.label}>
                        <span className="profile-menu-option__icon-shell" aria-hidden="true">
                          <img src={option.icon} alt="" />
                        </span>
                        <span className="profile-menu-option__body">
                          <span>{option.label}</span>
                          <img className="profile-menu-option__chevron" src={chevronRightIcon} alt="" aria-hidden="true" />
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              ))}

              <section className="profile-menu-footer" aria-label="Sessão e versão">
                <button type="button" className="profile-menu-option profile-menu-option--logout">
                  <span className="profile-menu-option__icon-shell" aria-hidden="true">
                    <img src={logoutIcon} alt="" />
                  </span>
                  <span className="profile-menu-option__body">
                    <span>Sair</span>
                    <img className="profile-menu-option__chevron" src={chevronRightIcon} alt="" aria-hidden="true" />
                  </span>
                </button>
                <p>Versão 1.0.0</p>
              </section>
            </div>
          </div>
          </div>
          <div
            className="profile-bottom-sheet__route profile-bottom-sheet__route--deposit"
            ref={setDepositHost}
            aria-hidden={route !== 'deposit'}
            inert={route !== 'deposit' ? true : undefined}
          />
        </div>
      </aside>
      {depositHost && isDepositMounted ? (
        <DepositPanel
          isOpen
          onClose={requestClose}
          presentation="embedded"
          savedAccounts={depositFlow?.savedAccounts}
          activeAccountId={depositFlow?.activeAccountId}
          newBankAccountId={depositFlow?.newBankAccountId}
          onRemoveAccount={depositFlow?.onRemoveAccount}
          onSelectAccount={depositFlow?.onSelectAccount}
          onDepositConfirmed={depositFlow?.onDepositConfirmed}
          onViewChange={setDepositView}
          portalTarget={depositHost}
        />
      ) : null}
    </div>,
    document.body,
  )
}
