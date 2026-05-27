import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { BottomSheet } from './BottomSheet'
import {
  PagamentoAntecipadoContent,
  type PagamentoAntecipadoSport,
} from './PagamentoAntecipadoBottomSheet'
import './BeneficiosApostaBottomSheet.css'

import iconMultiplaGde from '../../assets/iconMultiplaGde.png'
import iconSubstituicaoProtegida from '../../assets/iconSubstituicaoProtegida.png'

const benefitSliderAutoAdvanceMs = 5000
const benefitSliderDragThresholdPx = 36
const benefitSliderEdgeResistancePx = 18

export type BetslipBenefitSheetItem =
  | {
      id: 'turbo'
      currentSelectionCount?: number
    }
  | {
      id: 'early-payout'
      sport?: PagamentoAntecipadoSport
    }
  | {
      id: 'substitution'
    }

interface BeneficiosApostaBottomSheetProps {
  initialItemId?: BetslipBenefitSheetItem['id']
  isOpen: boolean
  items: BetslipBenefitSheetItem[]
  onClose: () => void
}

const getBenefitItemKey = (item: BetslipBenefitSheetItem) => {
  if (item.id === 'early-payout') return `${item.id}:${item.sport ?? 'futebol'}`
  return item.id
}

const getBenefitItemLabel = (item: BetslipBenefitSheetItem) => {
  if (item.id === 'turbo') return 'Múltipla Turbinada'
  if (item.id === 'early-payout') return 'Pagamento Antecipado'
  return 'Substituição Garantida'
}

const dedupeBenefitItems = (items: BetslipBenefitSheetItem[]) => {
  const seenItems = new Set<string>()

  return items.filter((item) => {
    const key = getBenefitItemKey(item)
    if (seenItems.has(key)) return false

    seenItems.add(key)
    return true
  })
}

function MultiplaTurbinadaCompactContent() {
  return (
    <div className="beneficios-aposta-bs__hero">
      <img
        src={iconMultiplaGde}
        alt=""
        className="beneficios-aposta-bs__icon"
      />
      <div className="beneficios-aposta-bs__copy">
        <h3 className="beneficios-aposta-bs__headline">Múltipla Turbinada</h3>
        <p className="beneficios-aposta-bs__description">
          A partir de 3 seleções elegíveis, sua múltipla recebe um bônus sobre o lucro se for
          vencedora. Quanto mais seleções, maior o percentual aplicado ao valor final.
        </p>
      </div>
    </div>
  )
}

function SubstituicaoGarantidaContent() {
  return (
    <div className="beneficios-aposta-bs__hero">
      <img
        src={iconSubstituicaoProtegida}
        alt=""
        className="beneficios-aposta-bs__icon"
      />
      <div className="beneficios-aposta-bs__copy">
        <h3 className="beneficios-aposta-bs__headline">Substituição Garantida</h3>
        <p className="beneficios-aposta-bs__description">
          Caso o jogador que você apostou seja substituído, sua aposta passa a contar com o
          jogador que entrou no lugar dele.
        </p>
      </div>
    </div>
  )
}

export function BeneficiosApostaBottomSheet({
  initialItemId,
  isOpen,
  items,
  onClose,
}: BeneficiosApostaBottomSheetProps) {
  const visibleItems = useMemo(() => dedupeBenefitItems(items), [items])
  const visibleItemKeys = visibleItems.map(getBenefitItemKey).join('|')
  const [activeIndex, setActiveIndex] = useState(0)
  const [progressCycle, setProgressCycle] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragDeltaX, setDragDeltaX] = useState(0)
  const autoAdvanceTimerRef = useRef<number | null>(null)
  const isDraggingRef = useRef(false)
  const pointerStartXRef = useRef(0)
  const dragDeltaXRef = useRef(0)
  const safeActiveIndex = Math.min(activeIndex, Math.max(visibleItems.length - 1, 0))

  useEffect(() => {
    if (!isOpen) {
      isDraggingRef.current = false
      setIsDragging(false)
      setDragDeltaX(0)
      return
    }

    const initialIndex = Math.max(
      0,
      visibleItemKeys
        .split('|')
        .filter(Boolean)
        .findIndex((key) => key === initialItemId || key.startsWith(`${initialItemId}:`))
    )

    setActiveIndex(initialIndex)
    setProgressCycle((cycle) => cycle + 1)
    dragDeltaXRef.current = 0
    setDragDeltaX(0)
  }, [initialItemId, isOpen, visibleItemKeys])

  useEffect(() => () => {
    if (autoAdvanceTimerRef.current !== null) {
      window.clearTimeout(autoAdvanceTimerRef.current)
      autoAdvanceTimerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!isOpen || isDragging || visibleItems.length <= 1) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    autoAdvanceTimerRef.current = window.setTimeout(() => {
      const nextIndex = (safeActiveIndex + 1) % visibleItems.length

      setActiveIndex(nextIndex)
      setProgressCycle((cycle) => cycle + 1)
    }, benefitSliderAutoAdvanceMs)

    return () => {
      if (autoAdvanceTimerRef.current !== null) {
        window.clearTimeout(autoAdvanceTimerRef.current)
        autoAdvanceTimerRef.current = null
      }
    }
  }, [isDragging, isOpen, progressCycle, safeActiveIndex, visibleItems.length])

  const setSliderIndex = (index: number) => {
    const maxIndex = Math.max(visibleItems.length - 1, 0)
    const nextIndex = Math.max(0, Math.min(index, maxIndex))

    setActiveIndex(nextIndex)
    setProgressCycle((cycle) => cycle + 1)
  }

  const getBoundedDragDelta = (rawDeltaX: number) => {
    if (visibleItems.length <= 1) return 0

    const isDraggingBeforeFirst = safeActiveIndex === 0 && rawDeltaX > 0
    const isDraggingAfterLast = safeActiveIndex === visibleItems.length - 1 && rawDeltaX < 0

    if (!isDraggingBeforeFirst && !isDraggingAfterLast) return rawDeltaX

    return Math.sign(rawDeltaX) * Math.min(Math.abs(rawDeltaX) * 0.24, benefitSliderEdgeResistancePx)
  }

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (visibleItems.length <= 1) return

    isDraggingRef.current = true
    pointerStartXRef.current = event.clientX
    dragDeltaXRef.current = 0
    setIsDragging(true)
    setDragDeltaX(0)

    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // Pointer capture is optional here; dragging still works from bubbled events.
    }
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return

    const nextDeltaX = getBoundedDragDelta(event.clientX - pointerStartXRef.current)
    dragDeltaXRef.current = nextDeltaX
    setDragDeltaX(nextDeltaX)
  }

  const finishDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return

    isDraggingRef.current = false
    setIsDragging(false)
    setDragDeltaX(0)

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    const finalDeltaX = dragDeltaXRef.current
    dragDeltaXRef.current = 0

    if (Math.abs(finalDeltaX) < benefitSliderDragThresholdPx) {
      setProgressCycle((cycle) => cycle + 1)
      return
    }

    if (finalDeltaX < 0) {
      setSliderIndex(safeActiveIndex + 1)
      return
    }

    setSliderIndex(safeActiveIndex - 1)
  }

  const sliderStyle = {
    '--beneficios-slider-offset': `${safeActiveIndex * -100}%`,
    '--beneficios-slider-drag-x': `${dragDeltaX}px`,
  } as CSSProperties

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Vantagens do Pitaco"
      sheetClassName="beneficios-aposta-bs"
      bodyClassName="beneficios-aposta-bs__body"
      hideScrollIndicator
      blurBackdrop
    >
      <div
        className={[
          'beneficios-aposta-bs__slider',
          isDragging ? 'beneficios-aposta-bs__slider--dragging' : '',
        ].filter(Boolean).join(' ')}
        style={sliderStyle}
        aria-label="Benefícios disponíveis nesta seleção"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
      >
        <div className="beneficios-aposta-bs__track">
          {visibleItems.map((item) => (
            <section
              key={getBenefitItemKey(item)}
              className="beneficios-aposta-bs__slide"
              aria-label={getBenefitItemLabel(item)}
            >
              {item.id === 'turbo' ? <MultiplaTurbinadaCompactContent /> : null}
              {item.id === 'early-payout' ? (
                <PagamentoAntecipadoContent sport={item.sport} />
              ) : null}
              {item.id === 'substitution' ? <SubstituicaoGarantidaContent /> : null}
            </section>
          ))}
        </div>
      </div>

      {visibleItems.length > 1 ? (
        <div
          className={[
            'beneficios-aposta-bs__pagination',
            isDragging ? 'beneficios-aposta-bs__pagination--paused' : '',
          ].filter(Boolean).join(' ')}
          aria-label="Navegar entre benefícios"
        >
          {visibleItems.map((item, index) => (
            <button
              key={getBenefitItemKey(item)}
              type="button"
              className={[
                'beneficios-aposta-bs__dot',
                index === safeActiveIndex ? 'beneficios-aposta-bs__dot--active' : '',
              ].filter(Boolean).join(' ')}
              aria-label={`Ver ${getBenefitItemLabel(item)}`}
              aria-current={index === safeActiveIndex ? 'true' : undefined}
              onClick={() => setSliderIndex(index)}
            >
              {index === safeActiveIndex ? (
                <span
                  key={`${safeActiveIndex}-${progressCycle}`}
                  className="beneficios-aposta-bs__dot-progress"
                />
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </BottomSheet>
  )
}
