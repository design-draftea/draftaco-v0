import { useEffect, useState, type CSSProperties } from 'react'
import { GarantidaPromoBottomSheet } from '../BottomSheet/GarantidaPromoBottomSheet'
import './PromoDraftaco.css'

import bgAumentada from '../../assets/iconsDraftaco/bgAumentada.png'
import bgGarantida from '../../assets/iconsDraftaco/bgGarantida.png'
import bgPromo from '../../assets/iconsDraftaco/bgPromo.png'
import bgSuperAumentada from '../../assets/iconsDraftaco/bgSuperAumentada.png'
import iconClock from '../../assets/iconsDraftaco/iconClock.svg'
import imgAdebayoPromo from '../../assets/iconsDraftaco/imgAdebayoPromo.png'
import imgDembelePromo from '../../assets/iconsDraftaco/imgDembelePromo.png'
import imgLewandowski from '../../assets/iconsDraftaco/imgLewandowskiPromo.png'
import imgMissaoPromo from '../../assets/iconsDraftaco/imgMissaoPromo.png'
import imgTorneioPromo from '../../assets/iconsDraftaco/imgTorneioPromo.png'
import {
  PROMO_COUNTDOWN_TICK_MS,
  PROMO_MINUTE_MS,
  formatPromoCountdownSegment,
  getGarantidaPromoDeadline,
  getPromoCountdownParts,
  type PromoCountdownParts,
} from '../../utils/garantidaPromoCountdown'

type MarketPromoVariant = 'garantida' | 'aumentada' | 'super-aumentada'
type MatchHighlightedSide = 'home' | 'away'

interface MarketPromoItem {
  type: 'market'
  id: string
  variant: MarketPromoVariant
  background: string
  tag: string
  title: string
  market: string
  value: string
  previousValue?: string
  matchHome: string
  matchAway: string
  matchHighlightedSide?: MatchHighlightedSide
  image: string
  countdownMinutes: number
}

interface SimplePromoItem {
  type: 'simple'
  id: string
  background: string
  title: string
  description: string
  image: string
  countdownMinutes: number
}

type PromoDraftacoItem = MarketPromoItem | SimplePromoItem

const GARANTIDA_PROMO_ID = 'garantida-lewandowski'

const promoDraftacoItems: PromoDraftacoItem[] = [
  {
    type: 'market',
    id: 'garantida-lewandowski',
    variant: 'garantida',
    background: bgGarantida,
    tag: 'GARANTIDA',
    title: 'R. LEWANDOWSKI',
    market: 'Finalizações ao gol',
    value: '0.5+',
    previousValue: '3.5',
    matchHome: 'BAR',
    matchAway: 'INT',
    image: imgLewandowski,
    countdownMinutes: 137,
  },
  {
    type: 'market',
    id: 'aumentada-dembele',
    variant: 'aumentada',
    background: bgAumentada,
    tag: 'AUMENTADA',
    title: 'O. DEMBÉLÉ',
    market: 'Finalizações ao gol',
    value: '1.5+',
    matchHome: 'PSG',
    matchAway: 'MCI',
    image: imgDembelePromo,
    countdownMinutes: 143,
  },
  {
    type: 'market',
    id: 'super-aumentada-adebayo',
    variant: 'super-aumentada',
    background: bgSuperAumentada,
    tag: 'SUPER AUMENTADA',
    title: 'B. ADEBAYO',
    market: 'Pontos',
    value: '11.5+',
    matchHome: 'CHI',
    matchAway: 'MIA',
    matchHighlightedSide: 'away',
    image: imgAdebayoPromo,
    countdownMinutes: 76,
  },
  {
    type: 'simple',
    id: 'missao-boas-vindas',
    background: bgPromo,
    title: 'MISSÃO DE BOAS VINDAS!',
    description: 'Sequência Premiada de Boas Vindas!',
    image: imgMissaoPromo,
    countdownMinutes: 359,
  },
  {
    type: 'simple',
    id: 'torneio-ranking-vip-copa',
    background: bgPromo,
    title: 'TORNEIO RANKING VIP COPA',
    description: 'R$56MIL em Pitacoins em jogo!',
    image: imgTorneioPromo,
    countdownMinutes: 229,
  },
]

const getPromoBackgroundStyle = (background: string): CSSProperties => ({
  '--promo-draftaco-bg': `url(${background})`,
} as CSSProperties)

const getCountdownDeadline = (
  promo: PromoDraftacoItem,
  deadlines: Record<string, number>,
  now: number
) => deadlines[promo.id] ?? now + promo.countdownMinutes * PROMO_MINUTE_MS

const getMatchTeamClassName = (promo: MarketPromoItem, side: MatchHighlightedSide) => {
  const highlightedSide = promo.matchHighlightedSide ?? 'home'
  const colorTone = side === highlightedSide ? 'secondary' : 'tertiary'

  return `promo-draftaco__match-team promo-draftaco__match-team--${colorTone}`
}

const getCountdownLabel = ({ hours, minutes }: PromoCountdownParts) => (
  `${hours} ${hours === 1 ? 'hora' : 'horas'} e ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`
)

const renderCountdown = (countdown: PromoCountdownParts) => (
  <span className="promo-draftaco__countdown" aria-label={getCountdownLabel(countdown)}>
    <img className="promo-draftaco__countdown-icon" src={iconClock} alt="" aria-hidden="true" />
    <span className="promo-draftaco__countdown-text">
      <span>{formatPromoCountdownSegment(countdown.hours)} h</span>
      <span className="promo-draftaco__countdown-separator">:</span>
      <span>{formatPromoCountdownSegment(countdown.minutes)} m</span>
    </span>
  </span>
)

const renderMarketPromoContent = (promo: MarketPromoItem, countdown: PromoCountdownParts) => (
  <>
    <div className="promo-draftaco__image-shell" aria-hidden="true">
      <img className="promo-draftaco__image" src={promo.image} alt="" />
    </div>

    <div className="promo-draftaco__market-content">
      <div className="promo-draftaco__market-main">
        <h2 className="promo-draftaco__title">{promo.title}</h2>

        <div className="promo-draftaco__market-row">
          <span className="promo-draftaco__market-name">{promo.market}</span>
          <span className="promo-draftaco__odds">
            {promo.previousValue && (
              <span className="promo-draftaco__odds-previous">{promo.previousValue}</span>
            )}
            <span className="promo-draftaco__odds-value">{promo.value}</span>
          </span>
        </div>

        <div className="promo-draftaco__time-row">
          <span className="promo-draftaco__match">
            <span className={getMatchTeamClassName(promo, 'home')}>{promo.matchHome}</span>
            <span className="promo-draftaco__match-vs">vs</span>
            <span className={getMatchTeamClassName(promo, 'away')}>{promo.matchAway}</span>
          </span>
          {renderCountdown(countdown)}
        </div>
      </div>

      <p className="promo-draftaco__rules">
        *Mult. mín: 3x
        <br />
        Mult. máx: 5x
        <br />
        Mín. seleções: 3
      </p>
    </div>

    <div className="promo-draftaco__tag">
      <span>{promo.tag}</span>
    </div>
  </>
)

const renderMarketPromo = (
  promo: MarketPromoItem,
  countdown: PromoCountdownParts,
  onOpenDetails?: () => void
) => {
  const cardClassName = [
    'promo-draftaco__card',
    'promo-draftaco__card--market',
    `promo-draftaco__card--${promo.variant}`,
    onOpenDetails ? 'promo-draftaco__card--button' : '',
  ].filter(Boolean).join(' ')
  const cardStyle = getPromoBackgroundStyle(promo.background)

  if (onOpenDetails) {
    return (
      <button
        type="button"
        className={cardClassName}
        style={cardStyle}
        onClick={onOpenDetails}
        aria-label={`Abrir detalhes da promoção ${promo.tag}`}
      >
        {renderMarketPromoContent(promo, countdown)}
      </button>
    )
  }

  return (
    <article className={cardClassName} style={cardStyle}>
      {renderMarketPromoContent(promo, countdown)}
    </article>
  )
}

const renderSimplePromo = (promo: SimplePromoItem, countdown: PromoCountdownParts) => (
  <article
    className="promo-draftaco__card promo-draftaco__card--simple"
    style={getPromoBackgroundStyle(promo.background)}
  >
    <div className="promo-draftaco__image-shell" aria-hidden="true">
      <img className="promo-draftaco__image" src={promo.image} alt="" />
    </div>

    <div className="promo-draftaco__simple-content">
      <h2 className="promo-draftaco__title promo-draftaco__title--accent">{promo.title}</h2>
      <p className="promo-draftaco__description">{promo.description}</p>
      {renderCountdown(countdown)}
    </div>
  </article>
)

export function PromoDraftaco() {
  const [isGarantidaBottomSheetOpen, setIsGarantidaBottomSheetOpen] = useState(false)
  const [countdownDeadlines] = useState(() => {
    const createdAt = Date.now()

    return promoDraftacoItems.reduce<Record<string, number>>((deadlines, promo) => {
      deadlines[promo.id] = promo.id === GARANTIDA_PROMO_ID
        ? getGarantidaPromoDeadline()
        : createdAt + promo.countdownMinutes * PROMO_MINUTE_MS
      return deadlines
    }, {})
  })
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now())
    }, PROMO_COUNTDOWN_TICK_MS)

    return () => window.clearInterval(intervalId)
  }, [])

  return (
    <>
      <section className="promo-draftaco" aria-label="Promoções">
        <div className="promo-draftaco__track">
          {promoDraftacoItems.map((promo) => {
            const countdown = getPromoCountdownParts(getCountdownDeadline(promo, countdownDeadlines, now) - now)
            const shouldOpenGarantidaDetails = promo.id === GARANTIDA_PROMO_ID

            return (
              <div className="promo-draftaco__item" key={promo.id}>
                {promo.type === 'market'
                  ? renderMarketPromo(
                    promo,
                    countdown,
                    shouldOpenGarantidaDetails ? () => setIsGarantidaBottomSheetOpen(true) : undefined
                  )
                  : renderSimplePromo(promo, countdown)}
              </div>
            )
          })}
        </div>
      </section>

      <GarantidaPromoBottomSheet
        countdown={getPromoCountdownParts(countdownDeadlines[GARANTIDA_PROMO_ID] - now)}
        isOpen={isGarantidaBottomSheetOpen}
        onClose={() => setIsGarantidaBottomSheetOpen(false)}
      />
    </>
  )
}
