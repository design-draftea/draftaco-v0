import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  ArrowsClockwiseIcon,
  BellIcon,
  CaretRightIcon,
  CaretUpIcon,
  CircleHalfIcon,
  CurrencyCircleDollarIcon,
  DoorOpenIcon,
  EyeIcon,
  EyeSlashIcon,
  GiftIcon,
  GearIcon,
  HeadsetIcon,
  MoneyIcon,
  MoonIcon,
  PokerChipIcon,
  ScrollIcon,
  ShieldCheckeredIcon,
  ShieldStarIcon,
  SunIcon,
  TicketIcon,
  XIcon,
  type Icon,
} from '@phosphor-icons/react'
import iconBronze2 from '../../assets/pitacoClub/iconBronze2.png'
import './NavigationMenuBottomSheet.css'

interface NavigationMenuBottomSheetProps {
  isOpen: boolean
  onClose: () => void
}

interface MenuItem {
  label: string
}

interface MenuSection {
  title: string
  Icon: Icon
  items: MenuItem[]
}

type SheetMotionState = 'entering' | 'open' | 'closing'
type ThemePreference = 'light' | 'dark' | 'system'

const menuSections: MenuSection[] = [
  {
    title: 'Geral',
    Icon: GearIcon,
    items: [
      { label: 'Verificação da conta' },
      { label: 'Carteira' },
      { label: 'Promoções' },
    ],
  },
  {
    title: 'Apostas',
    Icon: TicketIcon,
    items: [
      { label: 'Apostas Ao Vivo' },
      { label: 'Todos os Esportes' },
      { label: 'Minhas Apostas' },
    ],
  },
  {
    title: 'Cassino',
    Icon: PokerChipIcon,
    items: [
      { label: 'Jogos de Cassino' },
      { label: 'Buscar' },
      { label: 'Jogos Frequentes' },
      { label: 'Meu Histórico' },
      { label: 'Provedores' },
    ],
  },
  {
    title: 'Programas',
    Icon: ShieldStarIcon,
    items: [
      { label: 'Pitaco Club' },
      { label: 'Cashback' },
    ],
  },
  {
    title: 'Bônus',
    Icon: GiftIcon,
    items: [
      { label: 'Pitacoins' },
      { label: 'Créditos de Aposta' },
      { label: 'Rodada Grátis' },
    ],
  },
  {
    title: 'Atendimento',
    Icon: HeadsetIcon,
    items: [
      { label: 'Dúvidas Frequentes' },
      { label: 'Falar com o suporte' },
    ],
  },
  {
    title: 'Jogo Responsável',
    Icon: ShieldCheckeredIcon,
    items: [
      { label: 'Proteção ao Jogador' },
      { label: 'Política de Jogo Responsável' },
    ],
  },
  {
    title: 'Legal',
    Icon: ScrollIcon,
    items: [
      { label: 'Ganhos e Perdas' },
      { label: 'Regras de Jogos e Apostas' },
      { label: 'Termos de Uso' },
      { label: 'Política de Privacidade' },
      { label: 'Informe de Rendimentos' },
    ],
  },
]

const getSectionItemsId = (title: string) =>
  `navigation-menu-bs-${title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')}-items`

const themePreferenceOptions: { label: string; value: ThemePreference; Icon: Icon }[] = [
  { label: 'Claro', value: 'light', Icon: SunIcon },
  { label: 'Escuro', value: 'dark', Icon: MoonIcon },
  { label: 'Sistema', value: 'system', Icon: CircleHalfIcon },
]

const getStoredThemePreference = (): ThemePreference => {
  const storedPreference = window.localStorage.getItem('pitaco-theme-preference')

  if (storedPreference === 'light' || storedPreference === 'dark' || storedPreference === 'system') {
    return storedPreference
  }

  return 'dark'
}

export function NavigationMenuBottomSheet({ isOpen, onClose }: NavigationMenuBottomSheetProps) {
  const [shouldRender, setShouldRender] = useState(false)
  const [motionState, setMotionState] = useState<SheetMotionState>('entering')
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    Geral: true,
    Apostas: true,
    Cassino: true,
  })
  const [areValuesVisible, setAreValuesVisible] = useState(true)
  const [themePreference, setThemePreference] = useState<ThemePreference>(() => getStoredThemePreference())
  const closeTimerRef = useRef<number | null>(null)
  const openFrameRef = useRef<number | null>(null)

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current === null) return

    window.clearTimeout(closeTimerRef.current)
    closeTimerRef.current = null
  }, [])

  const clearOpenFrame = useCallback(() => {
    if (openFrameRef.current === null) return

    window.cancelAnimationFrame(openFrameRef.current)
    openFrameRef.current = null
  }, [])

  const requestClose = useCallback(() => {
    if (motionState === 'closing') return
    onClose()
  }, [motionState, onClose])

  const toggleSection = useCallback((title: string) => {
    setExpandedSections((current) => ({
      ...current,
      [title]: !(current[title] ?? false),
    }))
  }, [])

  const toggleValuesVisibility = useCallback(() => {
    setAreValuesVisible((current) => !current)
  }, [])

  useEffect(() => {
    clearCloseTimer()
    clearOpenFrame()

    const renderTimer = window.setTimeout(() => {
      if (isOpen) {
        setShouldRender(true)
        setMotionState('entering')
        openFrameRef.current = window.requestAnimationFrame(() => {
          openFrameRef.current = null
          setMotionState('open')
        })
        return
      }

      if (!shouldRender) return

      setMotionState('closing')
      closeTimerRef.current = window.setTimeout(() => {
        setShouldRender(false)
        setMotionState('entering')
        closeTimerRef.current = null
      }, 300)
    }, 0)

    return () => {
      window.clearTimeout(renderTimer)
      clearCloseTimer()
      clearOpenFrame()
    }
  }, [clearCloseTimer, clearOpenFrame, isOpen, shouldRender])

  useEffect(() => () => {
    clearCloseTimer()
    clearOpenFrame()
  }, [clearCloseTimer, clearOpenFrame])

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
      if (event.key === 'Escape') {
        requestClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [requestClose, shouldRender])

  useEffect(() => {
    window.localStorage.setItem('pitaco-theme-preference', themePreference)
    document.documentElement.dataset.themePreference = themePreference
  }, [themePreference])

  if (!shouldRender) return null

  const ValuesVisibilityIcon = areValuesVisible ? EyeSlashIcon : EyeIcon
  const maskedValue = '****'

  return createPortal(
    <div className="navigation-menu-bs__container">
      <div
        className={`navigation-menu-bs__overlay navigation-menu-bs__overlay--${motionState}`}
        onClick={requestClose}
      />
      <aside
        className={`navigation-menu-bs navigation-menu-bs--${motionState}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="navigation-menu-bs__header">
          <div className="navigation-menu-bs__notification" aria-hidden="true">
            <BellIcon className="navigation-menu-bs__notification-icon" weight="regular" />
            <span className="navigation-menu-bs__notification-badge">8</span>
          </div>
          <strong className="navigation-menu-bs__user">Olá, José da Silva</strong>
          <button type="button" className="navigation-menu-bs__close" aria-label="Fechar menu" onClick={requestClose}>
            <XIcon aria-hidden="true" className="navigation-menu-bs__close-icon" weight="regular" />
          </button>
        </header>

        <div className="navigation-menu-bs__content">
          <section className="navigation-menu-bs__account-card" aria-label="Resumo da conta">
            <div className="navigation-menu-bs__club-row">
              <span className="navigation-menu-bs__club-medal-wrap" aria-hidden="true">
                <img src={iconBronze2} alt="" className="navigation-menu-bs__club-medal" />
              </span>
              <div className="navigation-menu-bs__club-level">
                <span className="navigation-menu-bs__club-tier">Bronze II</span>
                <span className="navigation-menu-bs__club-xp">500 XP</span>
              </div>
              <button type="button" className="navigation-menu-bs__club-link">
                <span>
                  <span className="navigation-menu-bs__club-name">Pitaco Club</span>
                  <span className="navigation-menu-bs__club-action">Regate agora</span>
                </span>
                <CaretRightIcon aria-hidden="true" className="navigation-menu-bs__club-arrow" weight="bold" />
              </button>
            </div>

            <div className="navigation-menu-bs__balance-panel">
              <div className="navigation-menu-bs__balance-header">
                <div className="navigation-menu-bs__balance-copy">
                  <span className="navigation-menu-bs__balance-label">Seu saldo</span>
                  <strong className="navigation-menu-bs__balance-value">{areValuesVisible ? 'R$ 3.400,00' : maskedValue}</strong>
                </div>
                <div className="navigation-menu-bs__balance-tools" aria-label="Ações do saldo">
                  <button type="button" className="navigation-menu-bs__icon-button" aria-label="Atualizar saldo">
                    <ArrowsClockwiseIcon aria-hidden="true" weight="bold" />
                  </button>
                  <button
                    type="button"
                    className="navigation-menu-bs__icon-button"
                    aria-label={areValuesVisible ? 'Ocultar valores' : 'Mostrar valores'}
                    aria-pressed={!areValuesVisible}
                    onClick={toggleValuesVisibility}
                  >
                    <ValuesVisibilityIcon aria-hidden="true" weight="bold" />
                  </button>
                </div>
              </div>

              <div className="navigation-menu-bs__balance-actions">
                <button type="button" className="navigation-menu-bs__cash-button navigation-menu-bs__cash-button--withdraw">
                  <MoneyIcon aria-hidden="true" className="navigation-menu-bs__cash-icon" weight="bold" />
                  Sacar
                </button>
                <button type="button" className="navigation-menu-bs__cash-button navigation-menu-bs__cash-button--deposit">
                  <CurrencyCircleDollarIcon aria-hidden="true" className="navigation-menu-bs__cash-icon" weight="bold" />
                  Depositar
                </button>
              </div>

              <dl className="navigation-menu-bs__rewards">
                <div className="navigation-menu-bs__reward">
                  <dt>
                    <span>Coroas</span>
                    <span>do Rei</span>
                  </dt>
                  <dd>
                    <span
                      className={`navigation-menu-bs__reward-value${
                        areValuesVisible ? '' : ' navigation-menu-bs__reward-value--masked'
                      }`}
                    >
                      {areValuesVisible ? '240,90' : maskedValue}
                    </span>
                    <CaretRightIcon aria-hidden="true" weight="bold" />
                  </dd>
                </div>
                <div className="navigation-menu-bs__reward">
                  <dt>
                    <span>Crédito</span>
                    <span>de Aposta</span>
                  </dt>
                  <dd>
                    <span
                      className={`navigation-menu-bs__reward-value${
                        areValuesVisible ? '' : ' navigation-menu-bs__reward-value--masked'
                      }`}
                    >
                      {areValuesVisible ? '40,00' : maskedValue}
                    </span>
                    <CaretRightIcon aria-hidden="true" weight="bold" />
                  </dd>
                </div>
                <div className="navigation-menu-bs__reward">
                  <dt>
                    <span>Rodada</span>
                    <span>Grátis</span>
                  </dt>
                  <dd>
                    <span
                      className={`navigation-menu-bs__reward-value${
                        areValuesVisible ? '' : ' navigation-menu-bs__reward-value--masked'
                      }`}
                    >
                      {areValuesVisible ? 'Disponível' : maskedValue}
                    </span>
                    <CaretRightIcon aria-hidden="true" weight="bold" />
                  </dd>
                </div>
              </dl>
            </div>
          </section>

          {menuSections.map((section) => {
            const isExpanded = expandedSections[section.title] ?? false
            const sectionItemsId = getSectionItemsId(section.title)
            const SectionIcon = section.Icon

            return (
              <section
                className={`navigation-menu-bs__section${isExpanded ? '' : ' navigation-menu-bs__section--collapsed'}`}
                key={section.title}
                aria-label={section.title}
              >
                <button
                  type="button"
                  className="navigation-menu-bs__section-header"
                  aria-expanded={isExpanded}
                  aria-controls={sectionItemsId}
                  onClick={() => toggleSection(section.title)}
                >
                  <span className="navigation-menu-bs__section-title">
                    <SectionIcon aria-hidden="true" className="navigation-menu-bs__section-title-icon" weight="fill" />
                    <h2>{section.title}</h2>
                  </span>
                  <CaretUpIcon aria-hidden="true" className="navigation-menu-bs__section-caret" weight="bold" />
                </button>
                <div className="navigation-menu-bs__items" id={sectionItemsId} aria-hidden={!isExpanded}>
                  <div className="navigation-menu-bs__items-inner">
                    {section.items.map(({ label }) => (
                      <button type="button" className="navigation-menu-bs__item" key={label} tabIndex={isExpanded ? undefined : -1}>
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            )
          })}

          <section className="navigation-menu-bs__theme-section" aria-labelledby="navigation-menu-bs-theme-title">
            <h2 className="navigation-menu-bs__theme-title" id="navigation-menu-bs-theme-title">
              <CircleHalfIcon aria-hidden="true" className="navigation-menu-bs__theme-title-icon" weight="fill" />
              <span>Tema</span>
            </h2>
            <div
              className="navigation-menu-bs__theme-toggle"
              role="group"
              aria-label="Selecionar tema"
              data-theme-preference={themePreference}
            >
              {themePreferenceOptions.map(({ label, value, Icon: ThemeIcon }) => {
                const isSelected = themePreference === value

                return (
                  <button
                    type="button"
                    className={`navigation-menu-bs__theme-option${
                      isSelected ? ' navigation-menu-bs__theme-option--selected' : ''
                    }`}
                    aria-pressed={isSelected}
                    key={value}
                    onClick={() => setThemePreference(value)}
                  >
                    <ThemeIcon aria-hidden="true" className="navigation-menu-bs__theme-icon" weight="regular" />
                    <span>{label}</span>
                  </button>
                )
              })}
            </div>
          </section>

          <div className="navigation-menu-bs__logout-row">
            <button type="button" className="navigation-menu-bs__item navigation-menu-bs__logout">
              <DoorOpenIcon aria-hidden="true" className="navigation-menu-bs__item-icon" weight="fill" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </aside>
    </div>,
    document.body
  )
}
