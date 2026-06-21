import { Fragment, useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react'
import { homeOfferCarouselItems } from '../../data/homeProducts'
import arrowDuplo from '../../assets/iconsDraftaco/arrowDuplo.svg'
import chevronDown from '../../assets/iconsDraftaco/chevronDown.svg'
import iconTotalGols from '../../assets/iconsDraftaco/iconTotalGols.png'
import type { HomeOfferCarouselItem, HomeOfferLeg } from '../../types/home'
import './HomeOfferCarousel.css'

const MINUTE_IN_MS = 60_000
const DEFAULT_COUNTDOWN_MINUTES = 2 * 60 + 44

const formatCountdown = (totalMinutes: number) => {
  const safeMinutes = Math.max(0, totalMinutes)
  const hours = Math.floor(safeMinutes / 60)
  const minutes = safeMinutes % 60

  return `${hours}h:${minutes.toString().padStart(2, '0')}m`
}

function OfferLeg({ leg, isLast }: { leg: HomeOfferLeg; isLast: boolean }) {
  const iconClassName = [
    'home-offer-carousel__leg-icon',
    leg.icon === 'total-goals' ? 'home-offer-carousel__leg-icon--total-goals' : '',
    leg.image ? 'home-offer-carousel__leg-icon--image' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={`home-offer-carousel__leg${isLast ? ' home-offer-carousel__leg--last' : ''}`}>
      <span className={iconClassName} aria-hidden="true">
        {leg.image ? <img src={leg.image} alt="" /> : leg.icon === 'total-goals' ? <img src={iconTotalGols} alt="" /> : <span />}
      </span>
      <span className="home-offer-carousel__leg-text">
        <strong>{leg.label}</strong>
        {leg.detail && (
          <>
            <i aria-hidden="true" />
            <small>{leg.detail}</small>
          </>
        )}
      </span>
    </div>
  )
}

function HomeOfferCard({ offer }: { offer: HomeOfferCarouselItem }) {
  const cardStyle = {
    '--home-offer-card-bg': `url(${offer.background})`,
  } as CSSProperties

  return (
    <article className="home-offer-carousel__card" style={cardStyle}>
      <div className="home-offer-carousel__header">
        <div className="home-offer-carousel__headline">
          <strong>{offer.title}</strong>
          <span className={`home-offer-carousel__badge home-offer-carousel__badge--${offer.badgeTone}`}>
            {offer.badge}
          </span>
        </div>
        <p className="home-offer-carousel__match">
          <strong>{offer.matchup}</strong>
          <span aria-hidden="true">·</span>
          <span>{offer.dateLabel}</span>
        </p>
      </div>

      {offer.player && offer.boost ? (
        <div className="home-offer-carousel__player-market">
          <span className="home-offer-carousel__player-photo">
            <img src={offer.player.image} alt="" />
          </span>
          <span className="home-offer-carousel__player-text">
            <strong>{offer.player.name}</strong>
            <small>{offer.player.teamName}</small>
          </span>
          <span className="home-offer-carousel__boost">
            <span>
              <s>{offer.boost.from}</s>
              <img src={arrowDuplo} alt="" />
              <strong>{offer.boost.to}</strong>
            </span>
            <small>{offer.boost.marketLabel}</small>
          </span>
        </div>
      ) : (
        <div className="home-offer-carousel__legs" aria-label="Seleções da oferta">
          {offer.legs?.map((leg, index) => (
            <Fragment key={leg.id}>
              <OfferLeg leg={leg} isLast={index === (offer.legs?.length ?? 0) - 1} />
              {index < (offer.legs?.length ?? 0) - 1 && (
                <span className="home-offer-carousel__leg-connector" aria-hidden="true" />
              )}
            </Fragment>
          ))}
        </div>
      )}

      <div className="home-offer-carousel__footer">
        {offer.footerAction ? (
          <span className="home-offer-carousel__footer-action">
            <img src={chevronDown} alt="" />
            {offer.footerAction.label}
          </span>
        ) : (
          <ul className="home-offer-carousel__restrictions" aria-label="Restrições">
            {offer.restrictions?.map((restriction) => (
              <li key={`${offer.id}-${restriction}`}>{restriction}</li>
            ))}
          </ul>
        )}
        <button className="home-offer-carousel__odd" type="button" disabled aria-disabled="true">
          {offer.oldOdd && <s>{offer.oldOdd}</s>}
          <strong>{offer.odd}</strong>
        </button>
      </div>
    </article>
  )
}

interface HomeOfferCarouselProps {
  offers?: HomeOfferCarouselItem[]
  countdownMinutes?: number
}

export function HomeOfferCarousel({
  offers = homeOfferCarouselItems,
  countdownMinutes = DEFAULT_COUNTDOWN_MINUTES,
}: HomeOfferCarouselProps = {}) {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const dragRef = useRef<{ startX: number; scrollLeft: number } | null>(null)
  const [countdownStartedAt] = useState(() => Date.now())
  const [currentTime, setCurrentTime] = useState(countdownStartedAt)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [])

  const countdownEndsAt = countdownStartedAt + countdownMinutes * MINUTE_IN_MS
  const remainingMinutes = Math.ceil(Math.max(0, countdownEndsAt - currentTime) / MINUTE_IN_MS)

  const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !scrollRef.current) return

    setIsDragging(true)
    dragRef.current = {
      startX: event.pageX - scrollRef.current.offsetLeft,
      scrollLeft: scrollRef.current.scrollLeft,
    }
  }

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    const container = scrollRef.current
    if (!drag || !container) return

    event.preventDefault()
    const x = event.pageX - container.offsetLeft
    const walk = (x - drag.startX) * 1.5
    container.scrollLeft = drag.scrollLeft - walk
  }

  const finishDrag = () => {
    dragRef.current = null
    setIsDragging(false)
  }

  return (
    <section className="home-offer-carousel" aria-label="Ofertas">
      <div className="home-offer-carousel__title">
        <h2>Ofertas</h2>
        <span>Termina {formatCountdown(remainingMinutes)}</span>
      </div>
      <div
        className={`home-offer-carousel__list${isDragging ? ' home-offer-carousel__list--dragging' : ''}`}
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={finishDrag}
        onMouseLeave={finishDrag}
      >
        {offers.map((offer) => (
          <HomeOfferCard offer={offer} key={offer.id} />
        ))}
      </div>
    </section>
  )
}
