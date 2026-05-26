const turboBonusMinSelectionCount = 3
const turboBonusLinearStartSelectionCount = 6
const turboBonusMaxSelectionCount = 20
const turboBonusLinearStartPercent = 20
const turboBonusMaxPercent = 200

const roundToNearestFive = (value: number) => Math.round(value / 5) * 5

export const getBetslipTurboBonusPercent = (selectionCount: number) => {
  const normalizedSelectionCount = Math.floor(selectionCount)

  if (normalizedSelectionCount < turboBonusMinSelectionCount) return null
  if (normalizedSelectionCount <= turboBonusLinearStartSelectionCount) {
    return (normalizedSelectionCount - 2) * 5
  }

  const cappedSelectionCount = Math.min(normalizedSelectionCount, turboBonusMaxSelectionCount)
  const progress = (
    (cappedSelectionCount - turboBonusLinearStartSelectionCount)
    / (turboBonusMaxSelectionCount - turboBonusLinearStartSelectionCount)
  )

  return roundToNearestFive(
    turboBonusLinearStartPercent
    + progress * (turboBonusMaxPercent - turboBonusLinearStartPercent)
  )
}

export const getBetslipTurboMaxSelectionCount = () => turboBonusMaxSelectionCount
