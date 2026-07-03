import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal, flushSync } from 'react-dom'
import { PixLogoIcon } from '@phosphor-icons/react'
import backHeaderIcon from '../../assets/iconsDraftaco/backHeader.svg'
import closePixIcon from '../../assets/iconsDraftaco/closeBS.svg'
import iconClock from '../../assets/iconsDraftaco/iconClock.svg'
import iconIdeia from '../../assets/iconsDraftaco/iconIdeia.svg'
import iconInfo from '../../assets/iconsDraftaco/iconInfo.svg'
import iconPix from '../../assets/iconsDraftaco/iconPix.svg'
import qrCodeImage from '../../assets/iconsDraftaco/qrCode.png'
import { useTouchScrollFence } from '../../hooks/useTouchScrollFence'
import './DepositPanel.css'

interface DepositPanelProps {
  isOpen: boolean
  onClose: () => void
  onEnterComplete?: () => void
  onDepositConfirmed?: (amountCents: number) => void
}

type PanelMotionState = 'entering' | 'open' | 'closing'
type DepositView = 'form' | 'pix'
type DepositOptionId = '50' | '100' | '250' | '1000' | 'custom'

interface QuickDepositOption {
  id: DepositOptionId
  label: string
  amountCents: number | null
  recommended?: boolean
}

const contentTransitionDurationMs = 180
const panelMotionDurationMs = 320
const pixGenerationDelayMs = 3000
const pixCountdownInitialSeconds = 30 * 60 - 1
const maxDepositCents = 99999999
const animatedDepositAmountDurationMs = 520
const defaultDepositAmountCents = 10000
const pixCode = '00020101021226850014br.gov.bcb.pix0123deposito-teste-sem-link'
const quickDepositOptions: QuickDepositOption[] = [
  { id: '50', label: 'R$ 50', amountCents: 5000 },
  { id: '100', label: 'R$ 100', amountCents: 10000, recommended: true },
  { id: '250', label: 'R$ 250', amountCents: 25000 },
  { id: '1000', label: 'R$ 1.000', amountCents: 100000 },
  { id: 'custom', label: 'Outro', amountCents: null },
]

const formatDepositAmount = (amountCents: number) => (
  (amountCents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
)

const formatDepositDisplayAmount = (amountCents: number) => (
  Math.floor(amountCents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
)

const getDepositInputDigits = (value: string) => value.replace(/\D/g, '')

const parseManualDepositAmountCents = (value: string) => {
  const digits = getDepositInputDigits(value)
  if (!digits) return 0

  const amountCents = Math.min(Number(digits), maxDepositCents)
  return Number.isFinite(amountCents) ? amountCents : 0
}

const formatManualDepositAmountInput = (value: string) => {
  const amountCents = parseManualDepositAmountCents(value)
  return amountCents > 0 ? formatDepositAmount(amountCents) : ''
}

const getPresetOptionIdForAmount = (amountCents: number): DepositOptionId | null => (
  quickDepositOptions.find((option) => option.amountCents === amountCents)?.id ?? null
)

const easeOutCubic = (progress: number) => 1 - (1 - progress) ** 3

function AnimatedDepositAmount({
  animationKey,
  targetValue,
}: {
  animationKey: number
  targetValue: number
}) {
  const valueRef = useRef<HTMLSpanElement>(null)
  const [initialValue] = useState(targetValue)
  const displayedValue = useRef(targetValue)
  const previousAnimationKey = useRef(animationKey)

  useEffect(() => {
    let frameId: number | null = null
    const startValue = displayedValue.current
    const difference = targetValue - startValue
    const shouldAnimate = animationKey !== previousAnimationKey.current
    previousAnimationKey.current = animationKey

    const setValue = (value: number) => {
      displayedValue.current = value

      if (valueRef.current) {
        valueRef.current.textContent = formatDepositDisplayAmount(Math.round(value))
      }
    }

    if (!shouldAnimate || Math.abs(difference) < 0.005) {
      setValue(targetValue)
      return undefined
    }

    const startedAt = performance.now()

    const tick = (timestamp: number) => {
      const progress = Math.min(1, (timestamp - startedAt) / animatedDepositAmountDurationMs)
      const easedProgress = easeOutCubic(progress)
      const jitter = progress < 0.72
        ? Math.sin(progress * Math.PI * 18) * difference * 0.012
        : 0
      const nextValue = startValue + difference * easedProgress + jitter

      setValue(progress >= 1 ? targetValue : nextValue)

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick)
      }
    }

    frameId = window.requestAnimationFrame(tick)

    return () => {
      if (frameId !== null) window.cancelAnimationFrame(frameId)
    }
  }, [animationKey, targetValue])

  return (
    <span ref={valueRef} className="deposit-panel__amount deposit-panel__amount--filled">
      {formatDepositDisplayAmount(initialValue)}
    </span>
  )
}

export function DepositPanel({ isOpen, onClose, onEnterComplete, onDepositConfirmed }: DepositPanelProps) {
  const [shouldRender, setShouldRender] = useState(false)
  const [motionState, setMotionState] = useState<PanelMotionState>('entering')
  const [view, setView] = useState<DepositView>('form')
  const [amountCents, setAmountCents] = useState(defaultDepositAmountCents)
  const [amountAnimationKey, setAmountAnimationKey] = useState(0)
  const [selectedDepositOptionId, setSelectedDepositOptionId] = useState<DepositOptionId>('100')
  const [isGeneratingPix, setIsGeneratingPix] = useState(false)
  const [isContentTransitioning, setIsContentTransitioning] = useState(false)
  const [pixCountdownSeconds, setPixCountdownSeconds] = useState(pixCountdownInitialSeconds)
  const closeTimerRef = useRef<number | null>(null)
  const generateTimerRef = useRef<number | null>(null)
  const openTimerRef = useRef<number | null>(null)
  const openFrameRef = useRef<number | null>(null)
  const onEnterCompleteRef = useRef(onEnterComplete)
  const onDepositConfirmedRef = useRef(onDepositConfirmed)
  const shouldRenderRef = useRef(false)
  const swapTimerRef = useRef<number | null>(null)
  const panelRef = useRef<HTMLElement | null>(null)
  const panelContainerRef = useRef<HTMLDivElement | null>(null)
  const manualAmountInputRef = useRef<HTMLInputElement | null>(null)
  const [isAmountEditingInline, setIsAmountEditingInline] = useState(false)
  const [manualAmountInput, setManualAmountInput] = useState(formatDepositAmount(defaultDepositAmountCents))

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

  const clearOpenTimer = useCallback(() => {
    if (openTimerRef.current === null) return

    window.clearTimeout(openTimerRef.current)
    openTimerRef.current = null
  }, [])

  const clearGenerateTimer = useCallback(() => {
    if (generateTimerRef.current === null) return

    window.clearTimeout(generateTimerRef.current)
    generateTimerRef.current = null
  }, [])

  const clearSwapTimer = useCallback(() => {
    if (swapTimerRef.current === null) return

    window.clearTimeout(swapTimerRef.current)
    swapTimerRef.current = null
  }, [])

  const requestClose = useCallback(() => {
    if (motionState === 'closing') return
    onClose()
  }, [motionState, onClose])

  const focusManualAmountInput = useCallback(() => {
    const input = manualAmountInputRef.current
    if (!input) return

    input.focus({ preventScroll: true })
    input.select()
  }, [])

  const startInlineAmountEditing = useCallback((selectedOptionId?: DepositOptionId) => {
    flushSync(() => {
      setManualAmountInput(amountCents > 0 ? formatDepositAmount(amountCents) : '')
      if (selectedOptionId) setSelectedDepositOptionId(selectedOptionId)
      setIsAmountEditingInline(true)
    })

    focusManualAmountInput()
  }, [amountCents, focusManualAmountInput])

  const handleQuickOption = (option: QuickDepositOption) => {
    if (option.amountCents === null) {
      startInlineAmountEditing('custom')
      return
    }

    setIsAmountEditingInline(false)
    setAmountCents(option.amountCents)
    setAmountAnimationKey((currentAnimationKey) => currentAnimationKey + 1)
    setManualAmountInput(formatDepositAmount(option.amountCents))
    setSelectedDepositOptionId(option.id)
  }

  const handleManualAmountChange = (value: string) => {
    const nextInput = formatManualDepositAmountInput(value)
    const nextAmountCents = parseManualDepositAmountCents(nextInput)
    const matchingPreset = getPresetOptionIdForAmount(nextAmountCents)

    setManualAmountInput(nextInput)
    setAmountCents(nextAmountCents)
    setSelectedDepositOptionId(matchingPreset ?? 'custom')
  }

  const handleAmountDisplayClick = () => {
    startInlineAmountEditing()
  }

  const handleCopyPixCode = () => {
    navigator.clipboard?.writeText(pixCode).catch(() => undefined)
  }

  const handleGeneratePix = () => {
    if (!amountCents || isGeneratingPix) return

    const confirmedDepositAmountCents = amountCents

    clearGenerateTimer()
    clearSwapTimer()
    setIsGeneratingPix(true)

    generateTimerRef.current = window.setTimeout(() => {
      generateTimerRef.current = null
      setIsContentTransitioning(true)

      swapTimerRef.current = window.setTimeout(() => {
        swapTimerRef.current = null
        setView('pix')
        setIsGeneratingPix(false)
        setPixCountdownSeconds(pixCountdownInitialSeconds)
        onDepositConfirmedRef.current?.(confirmedDepositAmountCents)

        window.requestAnimationFrame(() => {
          setIsContentTransitioning(false)
        })
      }, contentTransitionDurationMs)
    }, pixGenerationDelayMs)
  }

  useEffect(() => {
    shouldRenderRef.current = shouldRender
  }, [shouldRender])

  useEffect(() => {
    onEnterCompleteRef.current = onEnterComplete
  }, [onEnterComplete])

  useEffect(() => {
    onDepositConfirmedRef.current = onDepositConfirmed
  }, [onDepositConfirmed])

  useEffect(() => {
    clearCloseTimer()
    clearGenerateTimer()
    clearOpenFrame()
    clearOpenTimer()
    clearSwapTimer()

    if (isOpen) {
      openTimerRef.current = window.setTimeout(() => {
        openTimerRef.current = null
        setShouldRender(true)
        setMotionState('entering')

        openTimerRef.current = window.setTimeout(() => {
          openTimerRef.current = null
          setMotionState('open')
          onEnterCompleteRef.current?.()
        }, panelMotionDurationMs)
      }, 0)
      return () => {
        clearCloseTimer()
        clearGenerateTimer()
        clearOpenFrame()
        clearOpenTimer()
        clearSwapTimer()
      }
    }

    if (!shouldRenderRef.current) return undefined

    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null
      setMotionState('closing')
      closeTimerRef.current = window.setTimeout(() => {
        setShouldRender(false)
        setMotionState('entering')
        setView('form')
        setAmountCents(defaultDepositAmountCents)
        setAmountAnimationKey(0)
        setIsAmountEditingInline(false)
        setManualAmountInput(formatDepositAmount(defaultDepositAmountCents))
        setSelectedDepositOptionId('100')
        setIsGeneratingPix(false)
        setIsContentTransitioning(false)
        setPixCountdownSeconds(pixCountdownInitialSeconds)
        closeTimerRef.current = null
      }, panelMotionDurationMs)
    }, 0)

    return () => {
      clearCloseTimer()
      clearGenerateTimer()
      clearOpenFrame()
      clearOpenTimer()
      clearSwapTimer()
    }
  }, [clearCloseTimer, clearGenerateTimer, clearOpenFrame, clearOpenTimer, clearSwapTimer, isOpen])

  useEffect(() => () => {
    clearCloseTimer()
    clearGenerateTimer()
    clearOpenFrame()
    clearOpenTimer()
    clearSwapTimer()
  }, [clearCloseTimer, clearGenerateTimer, clearOpenFrame, clearOpenTimer, clearSwapTimer])

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

  useLayoutEffect(() => {
    if (!shouldRender) return undefined

    const panel = panelRef.current
    if (!panel) return undefined

    let lastKeyboardOffset = -1

    const updateKeyboardOffset = () => {
      const visualViewport = window.visualViewport
      const panelBottom = panel.getBoundingClientRect().bottom
      const viewportBottom = visualViewport
        ? visualViewport.offsetTop + visualViewport.height
        : window.innerHeight
      const keyboardOffset = Math.max(0, Math.round(panelBottom - viewportBottom))

      // Ignora variações mínimas (ex.: barra de autofill do iOS oscilando).
      if (Math.abs(keyboardOffset - lastKeyboardOffset) < 2) return

      lastKeyboardOffset = keyboardOffset
      panel.style.setProperty('--deposit-keyboard-offset', `${keyboardOffset}px`)
    }

    updateKeyboardOffset()

    window.addEventListener('resize', updateKeyboardOffset)
    window.addEventListener('orientationchange', updateKeyboardOffset)
    window.visualViewport?.addEventListener('resize', updateKeyboardOffset)
    window.visualViewport?.addEventListener('scroll', updateKeyboardOffset)

    return () => {
      panel.style.removeProperty('--deposit-keyboard-offset')
      window.removeEventListener('resize', updateKeyboardOffset)
      window.removeEventListener('orientationchange', updateKeyboardOffset)
      window.visualViewport?.removeEventListener('resize', updateKeyboardOffset)
      window.visualViewport?.removeEventListener('scroll', updateKeyboardOffset)
    }
  }, [shouldRender])

  useEffect(() => {
    if (!shouldRender || view !== 'pix') return undefined

    const countdownInterval = window.setInterval(() => {
      setPixCountdownSeconds((currentSeconds) => Math.max(0, currentSeconds - 1))
    }, 1000)

    return () => window.clearInterval(countdownInterval)
  }, [shouldRender, view])

  useTouchScrollFence(panelContainerRef, shouldRender)

  if (!shouldRender) return null

  const amount = formatDepositAmount(amountCents)
  const hasAmount = amountCents > 0
  const pixCountdownMinutes = Math.floor(pixCountdownSeconds / 60)
  const pixCountdownSecondsRemainder = pixCountdownSeconds % 60
  const pixCountdownSecondsLabel = pixCountdownSecondsRemainder.toString().padStart(2, '0')

  return createPortal(
    <div className="deposit-panel__container" ref={panelContainerRef}>
      <div
        className={`deposit-panel__overlay deposit-panel__overlay--${motionState}`}
        onClick={requestClose}
      />
      <aside
        ref={panelRef}
        className={[
          'deposit-panel',
          `deposit-panel--${motionState}`,
        ]
          .filter(Boolean)
          .join(' ')}
        role="dialog"
        aria-modal="true"
        aria-label="Depositar"
        onClick={(event) => event.stopPropagation()}
      >
        <header
          className={[
            'deposit-panel__header',
            view === 'pix' ? 'deposit-panel__header--pix' : '',
          ].filter(Boolean).join(' ')}
        >
          {view === 'pix' ? (
            <button
              type="button"
              className="deposit-panel__close"
              aria-label="Fechar depósito"
              onClick={requestClose}
            >
              <img src={closePixIcon} alt="" aria-hidden="true" />
            </button>
          ) : (
            <>
              <button type="button" className="deposit-panel__back" aria-label="Voltar" onClick={requestClose}>
                <img src={backHeaderIcon} alt="" aria-hidden="true" />
              </button>
              <h2 className="deposit-panel__title">Deposite para jogar</h2>
              <button type="button" className="deposit-panel__info" aria-label="Informações sobre depósito">
                <img src={iconInfo} alt="" aria-hidden="true" />
              </button>
            </>
          )}
        </header>

        <div className="deposit-panel__content">
          <div
            className={[
              'deposit-panel__view',
              view === 'pix' ? 'deposit-panel__view--pix' : 'deposit-panel__view--form',
              isContentTransitioning ? 'deposit-panel__view--transitioning' : '',
            ].filter(Boolean).join(' ')}
          >
            {view === 'form' ? (
              <>
                <main className="deposit-panel__form-main">
                  <section className="deposit-panel__amount-section" aria-label="Valor do depósito">
                    {isAmountEditingInline ? (
                      <label className="deposit-panel__amount-display deposit-panel__amount-display--editing">
                        <span className="deposit-panel__currency">R$</span>
                        <input
                          ref={manualAmountInputRef}
                          className="deposit-panel__amount-input"
                          type="tel"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={manualAmountInput}
                          size={Math.max(1, manualAmountInput.length)}
                          style={{ width: `${Math.max(1, manualAmountInput.length)}ch` }}
                          aria-label="Valor do depósito"
                          onChange={(event) => handleManualAmountChange(event.target.value)}
                          onBlur={() => {
                            setIsAmountEditingInline(false)
                            setManualAmountInput(amountCents > 0 ? formatDepositAmount(amountCents) : '')
                          }}
                        />
                      </label>
                    ) : (
                      <button
                        type="button"
                        className="deposit-panel__amount-display"
                        aria-label={`Editar valor do depósito: R$ ${amount}`}
                        onClick={handleAmountDisplayClick}
                      >
                        <span className="deposit-panel__currency">R$</span>
                        <AnimatedDepositAmount
                          animationKey={amountAnimationKey}
                          targetValue={amountCents}
                        />
                        <span className="deposit-panel__amount-caret" aria-hidden="true" />
                      </button>
                    )}

                    <div className="deposit-panel__quick-options" aria-label="Valores rápidos">
                      {quickDepositOptions.map((option) => {
                        const isSelected = selectedDepositOptionId === option.id

                        return (
                          <div className="deposit-panel__quick-option-wrap" key={option.id}>
                            <button
                              type="button"
                              className={[
                                'deposit-panel__quick-option',
                                isSelected ? 'deposit-panel__quick-option--selected' : '',
                              ].filter(Boolean).join(' ')}
                              aria-pressed={isSelected}
                              onClick={() => handleQuickOption(option)}
                            >
                              {option.label}
                            </button>
                            {option.recommended ? (
                              <span className="deposit-panel__quick-option-badge">
                                RECOMENDADO
                              </span>
                            ) : null}
                          </div>
                        )
                      })}
                    </div>
                  </section>

                  <section className="deposit-panel__method-section" aria-labelledby="deposit-payment-method-title">
                    <h3 id="deposit-payment-method-title">Método de depósito</h3>
                    <button type="button" className="deposit-panel__payment-card deposit-panel__payment-card--selected">
                      <span className="deposit-panel__pix-badge">
                        <PixLogoIcon aria-hidden="true" weight="fill" />
                        pix
                      </span>
                      <span className="deposit-panel__payment-description">Saldo na hora</span>
                      <span className="deposit-panel__payment-radio" aria-hidden="true" />
                    </button>
                  </section>
                </main>

                <footer className="deposit-panel__footer">
                  <button
                    type="button"
                    className={[
                      'deposit-panel__confirm',
                      isGeneratingPix ? 'deposit-panel__confirm--loading' : '',
                    ].filter(Boolean).join(' ')}
                    disabled={!hasAmount || isGeneratingPix}
                    aria-busy={isGeneratingPix}
                    onClick={handleGeneratePix}
                  >
                    <span className="deposit-panel__confirm-label">Continuar</span>
                    <span className="deposit-panel__confirm-spinner-wrap" aria-hidden="true">
                      <span className="deposit-panel__confirm-spinner" />
                    </span>
                  </button>
                </footer>
              </>
            ) : (
              <main className="deposit-panel__pix-main" aria-label="Pagamento Pix gerado">
                <div className="deposit-panel__pix-layout">
                  <img className="deposit-panel__pix-logo" src={iconPix} alt="Pix" />
                  <p className="deposit-panel__pix-instruction">
                    Escaneie o QR code ou copie o código para pagar com Pix
                  </p>

                  <div className="deposit-panel__pix-qr-frame">
                    <div className="deposit-panel__pix-qr-card">
                      <img className="deposit-panel__pix-qr" src={qrCodeImage} alt="QR code Pix" />
                    </div>
                  </div>

                  <section className="deposit-panel__pix-payment" aria-label={`Valor do Pix: R$ ${amount}`}>
                    <div className="deposit-panel__pix-amount">
                      <span>R$</span>
                      <strong>{amount}</strong>
                    </div>
                    <div
                      className="deposit-panel__pix-countdown"
                      aria-label={`Código expira em ${pixCountdownMinutes} minutos e ${pixCountdownSecondsLabel} segundos`}
                    >
                      <img src={iconClock} alt="" aria-hidden="true" />
                      <span className="deposit-panel__pix-countdown-time">
                        <span>{pixCountdownMinutes} m</span>
                        <span className="deposit-panel__pix-countdown-separator">:</span>
                        <span>{pixCountdownSecondsLabel} s</span>
                      </span>
                      <span>restantes</span>
                    </div>
                    <p>
                      Lembre-se de que você deve depositar de uma conta vinculada ao seu CPF.
                    </p>
                  </section>

                  <button type="button" className="deposit-panel__pix-copy-button" onClick={handleCopyPixCode}>
                    Copiar código Pix
                  </button>

                  <div className="deposit-panel__pix-divider" />

                  <section className="deposit-panel__pix-info-list" aria-label="Informações sobre o Pix">
                    <div className="deposit-panel__pix-info-item">
                      <span className="deposit-panel__pix-info-icon" aria-hidden="true">
                        <img src={iconClock} alt="" />
                      </span>
                      <p>
                        O código expira em 30 minutos. Se ele expirar, gere um novo na tela de depósito.
                      </p>
                    </div>
                    <div className="deposit-panel__pix-info-item">
                      <span
                        className="deposit-panel__pix-info-icon deposit-panel__pix-info-icon--idea"
                        aria-hidden="true"
                      >
                        <img src={iconIdeia} alt="" />
                      </span>
                      <p>
                        Você pode ver todos as suas transações em "Minha conta" &gt; "Minhas transações."
                      </p>
                    </div>
                  </section>
                </div>
              </main>
            )}
          </div>
        </div>
      </aside>
    </div>,
    document.body
  )
}
