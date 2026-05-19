import type { ReactNode } from 'react'

export type BetslipEventStatus = 'prematch' | 'live'
export type BetslipSelectionType = 'team' | 'player' | 'market'
export type BetslipBadgeType = 'boost' | 'substitution'

export const BETSLIP_ODD_INTERACTION_EVENT = 'betslip:odd-interaction'

export interface BetslipSelection {
  id: string
  eventId: string
  marketId: string
  outcomeId: string
  label: string
  selectionLabel: string
  oddLabel: string
  oddValue: number
  marketLabel: string
  eventStatus: BetslipEventStatus
  selectionType: BetslipSelectionType
  sport?: string
  homeTeam?: string
  awayTeam?: string
  eventName?: string
  eventTimeLabel?: string
  liveClock?: string
  createdAtMs: number
  homeScore?: string | number
  awayScore?: string | number
  playerName?: string
  homeTeamIcon?: string
  awayTeamIcon?: string
  selectionIcon?: string
  playerImage?: string
  badgeType?: BetslipBadgeType
  comboId?: string
  comboTitle?: string
  comboTypeLabel?: string
  comboTotalOddLabel?: string
  comboTotalOddValue?: number
  comboLegIndex?: number
  comboLegCount?: number
}

export interface BetslipSelectionInput {
  eventId: string
  marketId: string
  outcomeId: string
  label: ReactNode
  selectionLabel?: string
  odd: ReactNode
  marketLabel?: string
  eventStatus?: BetslipEventStatus
  selectionType?: BetslipSelectionType
  sport?: string
  homeTeam?: string
  awayTeam?: string
  eventName?: string
  eventTimeLabel?: string
  liveClock?: string
  createdAtMs?: number
  homeScore?: string | number
  awayScore?: string | number
  playerName?: string
  homeTeamIcon?: string
  awayTeamIcon?: string
  selectionIcon?: string
  playerImage?: string
  badgeType?: BetslipBadgeType
  comboId?: string
  comboTitle?: string
  comboTypeLabel?: string
  comboTotalOddLabel?: string
  comboLegIndex?: number
  comboLegCount?: number
}

export interface BetslipSummary {
  hasSelections: boolean
  selectedOddsCount: number
  selectionCount: number
  totalOdds: number
  totalOddsLabel: string
  stake: number
  stakeLabel: string
  potentialWin: number
  potentialWinLabel: string
}

export const BETSLIP_STAKE = 10

const betslipDecimalFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
})

export const formatBetslipOdd = (odd: number) => `${betslipDecimalFormatter.format(odd)}x`

export const formatBetslipCurrency = (value: number) => `R$${betslipDecimalFormatter.format(value)}`

export const EMPTY_BETSLIP_SUMMARY: BetslipSummary = {
  hasSelections: false,
  selectedOddsCount: 0,
  selectionCount: 0,
  totalOdds: 0,
  totalOddsLabel: formatBetslipOdd(0),
  stake: BETSLIP_STAKE,
  stakeLabel: formatBetslipCurrency(BETSLIP_STAKE),
  potentialWin: 0,
  potentialWinLabel: formatBetslipCurrency(0),
}

const getNodeText = (node: ReactNode): string => {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(getNodeText).join('')

  return ''
}

export const normalizeBetslipIdPart = (value: string) => (
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'item'
)

export const getBetslipMarketGroupId = ({
  eventId,
  marketId,
}: {
  eventId: string
  marketId: string
}) => `${eventId}:${normalizeBetslipIdPart(marketId)}`

export const getBetslipEventId = ({
  sport,
  homeTeam,
  awayTeam,
  fallbackId,
}: {
  sport: string
  homeTeam?: string
  awayTeam?: string
  fallbackId?: string
}) => {
  const homePart = homeTeam ? normalizeBetslipIdPart(homeTeam) : ''
  const awayPart = awayTeam ? normalizeBetslipIdPart(awayTeam) : ''

  if (homePart || awayPart) {
    return [
      normalizeBetslipIdPart(sport),
      homePart || 'home',
      awayPart || 'away',
    ].join(':')
  }

  return [
    normalizeBetslipIdPart(sport),
    normalizeBetslipIdPart(fallbackId ?? 'event'),
  ].join(':')
}

export const parseBetslipOdd = (odd: ReactNode) => {
  const oddLabel = getNodeText(odd).trim()
  const normalizedOddLabel = oddLabel.includes(',')
    ? oddLabel.replace(/\./g, '').replace(',', '.')
    : oddLabel
  const oddValue = Number.parseFloat(normalizedOddLabel.replace(/[^0-9.]/g, ''))

  return Number.isFinite(oddValue) && oddValue > 0 ? oddValue : null
}

const formatBetslipMarketLabel = (marketId: string) => (
  marketId
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ') || 'Mercado'
)

const getBetslipEventName = ({
  eventName,
  homeTeam,
  awayTeam,
  fallbackId,
}: {
  eventName?: string
  homeTeam?: string
  awayTeam?: string
  fallbackId: string
}) => {
  if (eventName) return eventName
  if (homeTeam && awayTeam) return `${homeTeam} x ${awayTeam}`
  if (homeTeam) return homeTeam
  if (awayTeam) return awayTeam

  return fallbackId
    .split(':')
    .slice(-2)
    .map((part) => part.replace(/-/g, ' '))
    .join(' x ')
}

const getBetslipSelectionType = ({
  selectionType,
  playerName,
  label,
  homeTeam,
  awayTeam,
}: {
  selectionType?: BetslipSelectionType
  playerName?: string
  label: string
  homeTeam?: string
  awayTeam?: string
}): BetslipSelectionType => {
  if (selectionType) return selectionType
  if (playerName) return 'player'
  if (label === homeTeam || label === awayTeam) return 'team'

  return 'market'
}

export const createBetslipSelection = ({
  eventId,
  marketId,
  outcomeId,
  label,
  selectionLabel,
  odd,
  marketLabel,
  eventStatus = 'prematch',
  selectionType,
  sport,
  homeTeam,
  awayTeam,
  eventName,
  eventTimeLabel,
  liveClock,
  createdAtMs,
  homeScore,
  awayScore,
  playerName,
  homeTeamIcon,
  awayTeamIcon,
  selectionIcon,
  playerImage,
  badgeType,
  comboId,
  comboTitle,
  comboTypeLabel,
  comboTotalOddLabel,
  comboLegIndex,
  comboLegCount,
}: BetslipSelectionInput): BetslipSelection | undefined => {
  const oddValue = parseBetslipOdd(odd)
  if (!oddValue) return undefined

  const comboTotalOddValue = comboTotalOddLabel ? parseBetslipOdd(comboTotalOddLabel) : null
  const normalizedEventId = eventId || getBetslipEventId({ sport: 'unknown' })
  const normalizedMarketId = normalizeBetslipIdPart(marketId)
  const normalizedOutcomeId = normalizeBetslipIdPart(outcomeId)
  const normalizedComboId = comboId ? normalizeBetslipIdPart(comboId) : undefined
  const labelText = getNodeText(label)

  return {
    id: `${normalizedEventId}:${normalizedMarketId}:${normalizedOutcomeId}`,
    eventId: normalizedEventId,
    marketId: normalizedMarketId,
    outcomeId: normalizedOutcomeId,
    label: labelText,
    selectionLabel: selectionLabel ?? playerName ?? labelText,
    oddLabel: formatBetslipOdd(oddValue),
    oddValue,
    marketLabel: marketLabel ?? formatBetslipMarketLabel(marketId),
    eventStatus,
    selectionType: getBetslipSelectionType({
      selectionType,
      playerName,
      label: labelText,
      homeTeam,
      awayTeam,
    }),
    sport,
    homeTeam,
    awayTeam,
    eventName: getBetslipEventName({
      eventName,
      homeTeam,
      awayTeam,
      fallbackId: normalizedEventId,
    }),
    eventTimeLabel,
    liveClock,
    createdAtMs: createdAtMs ?? Date.now(),
    homeScore,
    awayScore,
    playerName,
    homeTeamIcon,
    awayTeamIcon,
    selectionIcon,
    playerImage,
    badgeType,
    comboId: normalizedComboId,
    comboTitle,
    comboTypeLabel,
    comboTotalOddLabel,
    comboTotalOddValue: comboTotalOddValue ?? undefined,
    comboLegIndex,
    comboLegCount,
  }
}
