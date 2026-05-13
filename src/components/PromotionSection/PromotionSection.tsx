import { useState, useRef } from 'react'
import { CaretRightIcon } from '@phosphor-icons/react'
import './PromotionSection.css'
import { sportsPromotions } from '../../data/homeProducts'
import type { Promotion } from '../../types/home'

interface PromotionSectionProps {
  promotions?: Promotion[]
  title?: string
}

export function PromotionSection({
  promotions = sportsPromotions,
  title = 'Promoções',
}: PromotionSectionProps = {}) {
  const [isDragging, setIsDragging] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const scrollLeft = useRef(0)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    startX.current = e.pageX - scrollRef.current.offsetLeft
    scrollLeft.current = scrollRef.current.scrollLeft
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX.current) * 1.5
    scrollRef.current.scrollLeft = scrollLeft.current - walk
  }

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false)
    }
  }

  return (
    <section id="section-promocoes" className="promotion-section">
      <div className="promotion-section__header">
        <div className="promotion-section__title">
          <span>{title}</span>
          <CaretRightIcon aria-hidden="true" className="promotion-section__arrow" weight="bold" />
        </div>
      </div>

      <div 
        className={`promotion-section__list ${isDragging ? 'promotion-section__list--dragging' : ''}`}
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {promotions.map((promo) => (
          <div key={promo.id} className="promo-card">
            <div className="promo-card__image-wrapper">
              <img src={promo.image} alt="" className="promo-card__image" />
              <div className="promo-card__label">
                {promo.label.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
            <div className="promo-card__content">
              <p className="promo-card__description">{promo.description}</p>
            </div>
          </div>
        ))}
      </div>

    </section>
  )
}
