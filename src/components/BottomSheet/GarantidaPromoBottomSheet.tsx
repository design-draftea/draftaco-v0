import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { BottomSheet } from './BottomSheet'
import { getBetslipMarketGroupId } from '../../hooks/betslipUtils'
import { useOddSelection } from '../../hooks/useOddSelection'
import {
  createGarantidaLewandowskiSelection,
  GARANTIDA_LEWANDOWSKI_GROUP_ID,
} from '../../data/garantidaLewandowskiSelection'
import './GarantidaPromoBottomSheet.css'

import closeIcon from '../../assets/iconsDraftaco/garantidaBsClose.svg'
import glowImage from '../../assets/iconsDraftaco/garantidaBsGlow.svg'
import infoIcon from '../../assets/iconsDraftaco/garantidaBsInfoIcon.svg'
import playerImage from '../../assets/iconsDraftaco/garantidaBsPlayer.png'
import tagIcon from '../../assets/iconsDraftaco/garantidaBsTagIcon.svg'

interface PromoCountdownParts {
  hours: number
  minutes: number
}

interface GarantidaPromoBottomSheetProps {
  countdown: PromoCountdownParts
  isOpen: boolean
  onClose: () => void
}

const promotionRules = [
  'Mínimo 3 seleções.',
  'Permitido usar apenas 1 Pechincha por bilhete.',
  'Odd mínima do bilhete: 4x.',
  'Odd máxima do bilhete: 8x.',
  'Valor de entrada: mínimo de R$10 e máximo de R$500.',
  'Não é combinável com outras promoções',
  'Se alguma seleção for cancelada e o bilhete deixar de atingir a odd mínima de 4x, a Pechincha será removida da aposta.',
]

const formatSheetCountdown = ({ hours, minutes }: PromoCountdownParts) => (
  `${hours}h : ${String(minutes).padStart(2, '0')}m`
)

function MatchInfo() {
  return (
    <div className="garantida-promo-bs__match">
      <span className="garantida-promo-bs__teams">
        <strong>BAR</strong>
        <span> vs INT</span>
      </span>
      <span className="garantida-promo-bs__dot">•</span>
      <span className="garantida-promo-bs__market">Finalizações ao gol</span>
    </div>
  )
}

function OddsInfo() {
  return (
    <div className="garantida-promo-bs__odds" aria-label="Odd anterior 3.5, nova odd 0.5 mais">
      <span className="garantida-promo-bs__previous-odd">3.5</span>
      <span className="garantida-promo-bs__boosted-odd">
        <strong>0.5+</strong>
      </span>
    </div>
  )
}

function PromoTag({ children }: { children: ReactNode }) {
  return (
    <div className="garantida-promo-bs__tag">
      <img src={tagIcon} alt="" aria-hidden="true" />
      <strong>GARANTIDA</strong>
      <span className="garantida-promo-bs__tag-separator">-</span>
      <strong>{children}</strong>
    </div>
  )
}

export function GarantidaPromoBottomSheet({
  countdown,
  isOpen,
  onClose,
}: GarantidaPromoBottomSheetProps) {
  const getOddButtonProps = useOddSelection('garantida-promo-bs__odd-button')
  const closeTimerRef = useRef<number | null>(null)

  useEffect(() => () => {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current)
  }, [])

  // The boosted promo odd, added to / removed from the real betslip on tap.
  const [oddSelection] = useState(() => createGarantidaLewandowskiSelection())
  const oddGroupId = oddSelection
    ? getBetslipMarketGroupId({ eventId: oddSelection.eventId, marketId: oddSelection.marketId })
    : GARANTIDA_LEWANDOWSKI_GROUP_ID
  const oddButtonProps = getOddButtonProps(
    oddSelection?.id ?? 'garantida-promo-odd',
    oddGroupId,
    'garantida-promo-bs__odd-button',
    oddSelection,
  )
  const isSelected = oddButtonProps['aria-pressed'] === true

  const handleToggleOdd = (event: MouseEvent<HTMLButtonElement>) => {
    // Add/remove the boosted odd in the betslip, then let the sheet slide down.
    oddButtonProps.onClick?.(event)
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current)
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null
      onClose()
    }, 220)
  }

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      sheetClassName="garantida-promo-bs"
      bodyClassName="garantida-promo-bs__body"
      hideScrollIndicator
      blurBackdrop
    >
      <div className="garantida-promo-bs__content">
        <img className="garantida-promo-bs__glow" src={glowImage} alt="" aria-hidden="true" />

        <section className="garantida-promo-bs__main" aria-labelledby="garantida-promo-bs-title">
          <div className="garantida-promo-bs__options">
            <div className="garantida-promo-bs__profile">
              <span className="garantida-promo-bs__info-icon" aria-hidden="true">
                <img src={infoIcon} alt="" />
              </span>

              <div className="garantida-promo-bs__player-shell" aria-hidden="true">
                <div className="garantida-promo-bs__player-mask">
                  <img src={playerImage} alt="" />
                </div>
              </div>

              <div className="garantida-promo-bs__headline">
                <h2 id="garantida-promo-bs-title">R. Lewandowski</h2>
                <MatchInfo />
                <OddsInfo />
              </div>
            </div>

            <button
              type="button"
              className={[
                'garantida-promo-bs__odd-button',
                isSelected ? 'garantida-promo-bs__odd-button--selected' : '',
              ].filter(Boolean).join(' ')}
              aria-pressed={isSelected}
              aria-label="Selecionar odd 1.85x"
              onClick={handleToggleOdd}
            >
              1.85x
            </button>

            <ol className="garantida-promo-bs__rules">
              {promotionRules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ol>
          </div>

          <PromoTag>{formatSheetCountdown(countdown)}</PromoTag>

          <button
            type="button"
            className="garantida-promo-bs__close"
            onClick={onClose}
            aria-label="Fechar"
          >
            <img src={closeIcon} alt="" aria-hidden="true" />
          </button>
        </section>

      </div>
    </BottomSheet>
  )
}
