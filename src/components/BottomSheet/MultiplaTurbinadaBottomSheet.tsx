import { BottomSheet } from './BottomSheet'
import './MultiplaTurbinadaBottomSheet.css'

import iconMultiplaGde from '../../assets/iconMultiplaGde.png'
import {
  getBetslipTurboBonusPercent,
  getBetslipTurboMaxSelectionCount,
} from '../../hooks/betslipTurboBonus'

interface MultiplaTurbinadaBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  currentSelectionCount?: number
}

const maxTurboSelectionCount = getBetslipTurboMaxSelectionCount()

const formatSelectionCountLabel = (selectionCount: number) => (
  `${selectionCount} ${selectionCount === 1 ? 'seleção' : 'seleções'}`
)

const getVisibleTurboTiers = (currentSelectionCount = 3) => {
  const activeSelectionCount = Math.min(
    Math.max(Math.round(currentSelectionCount), 3),
    maxTurboSelectionCount
  )

  if (activeSelectionCount <= 3) return [3, 4, 5, maxTurboSelectionCount]
  if (activeSelectionCount >= maxTurboSelectionCount) return [18, 19, maxTurboSelectionCount]

  const tierCounts = [
    activeSelectionCount - 1,
    activeSelectionCount,
    Math.min(activeSelectionCount + 1, maxTurboSelectionCount),
    maxTurboSelectionCount,
  ]

  return [...new Set(tierCounts)]
}

export function MultiplaTurbinadaBottomSheet({
  isOpen,
  onClose,
  currentSelectionCount,
}: MultiplaTurbinadaBottomSheetProps) {
  const activeSelectionCount = Math.min(
    Math.max(Math.round(currentSelectionCount ?? 3), 3),
    maxTurboSelectionCount
  )
  const turboTiers = getVisibleTurboTiers(currentSelectionCount)

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Múltipla Turbinada"
      sheetClassName="multipla-turbinada-bs"
      bodyClassName="multipla-turbinada-bs__body"
      hideScrollIndicator
      blurBackdrop
    >
      <div className="multipla-turbinada-bs__hero">
        <img src={iconMultiplaGde} alt="" className="multipla-turbinada-bs__icon" />
        <div className="multipla-turbinada-bs__copy">
          <h3 className="multipla-turbinada-bs__headline">Odds turbinadas na sua múltipla</h3>
          <p className="multipla-turbinada-bs__description">
            A partir de 3 seleções, sua múltipla recebe um bônus nas odds. Quanto mais seleções,
            maior o bônus aplicado ao valor para ganhar.
          </p>
          <p className="multipla-turbinada-bs__restriction">
            Válido para odd mínima de 1.25x
          </p>
        </div>
      </div>

      <div className="multipla-turbinada-bs__tiers" aria-label="Bônus por quantidade de seleções">
        {turboTiers.map((selectionCount) => {
          const bonusPercent = getBetslipTurboBonusPercent(selectionCount)
          const isActive = activeSelectionCount === selectionCount

          return (
            <div
              key={selectionCount}
              className={[
                'multipla-turbinada-bs__tier',
                isActive ? 'multipla-turbinada-bs__tier--active' : '',
              ].filter(Boolean).join(' ')}
            >
              <span className="multipla-turbinada-bs__tier-selection">
                {formatSelectionCountLabel(selectionCount)}
              </span>
              <span className="multipla-turbinada-bs__tier-right">
                {isActive ? <span className="multipla-turbinada-bs__tier-current">Atual</span> : null}
                <strong className="multipla-turbinada-bs__tier-bonus">{bonusPercent ?? 0}%</strong>
              </span>
            </div>
          )
        })}
      </div>
    </BottomSheet>
  )
}
