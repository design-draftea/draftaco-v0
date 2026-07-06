import placeholderBasquete from '../../assets/iconsDraftaco/placeholderBasquete.svg'
import placeholderShield from '../../assets/iconsDraftaco/placeholderShield.svg'
import placeholderSoccer from '../../assets/iconsDraftaco/placeholderSoccer.svg'
import placeholderTenis from '../../assets/iconsDraftaco/placeholderTenis.svg'
import playerAvatarBasquete from '../../assets/playerAvatarBasquete.svg'
import playerAvatarFutebol from '../../assets/playerAvatarFutebol.svg'
import { getTeamLogo } from '../../data/teamLogos'
import {
  normalizeBetslipIdPart,
  type BetslipSelection,
} from '../../hooks/betslipUtils'
import { getTeamAbbreviation } from '../../utils/teamAbbreviations'
import { TEAM_LOGO_FALLBACK } from '../../utils/teamLogoFallback'

export interface BetslipSelectionGroup {
  eventId: string
  selections: BetslipSelection[]
}

export interface SelectionAvatarTeamContext {
  teamName: string
  currentLogo?: string
  fallbackLogo: string
}

export interface SelectionAvatarDrawContext {
  awayLogo?: string
  awayTeam: string
  homeLogo?: string
  homeTeam: string
}

const marketTranslations: Record<string, string> = {
  'ambos-marcam': 'AMBOS ANOTAN',
  'assistencias-do-jogador': 'ASISTENCIAS',
  'assistencias-jogador': 'ASISTENCIAS',
  'cartoes': 'TARJETAS',
  'dupla-chance': 'DOBLE OPORTUNIDAD',
  'escanteios': 'CORNERS',
  'handicap': 'HANDICAP',
  'rebotes-do-jogador': 'REBOTES',
  'rebotes-jogador': 'REBOTES',
  'resultado-final': 'RESULTADO FINAL',
  'resultado-final-pagamento-antecipado': 'RESULTADO FINAL',
  'total-de-cartoes': 'TOTAL DE TARJETAS',
  'total-de-escanteios': 'TOTAL DE CORNERS',
  'total-de-gols': 'TOTAL DE GOLES',
  'total-de-pontos': 'TOTAL DE PUNTOS',
  'total-gols': 'TOTAL DE GOLES',
  'total-pontos': 'TOTAL DE PUNTOS',
  'vencedor': 'GANADOR',
}

export const formatMoney = (cents: number, options?: { compactWhole?: boolean }) => {
  const value = cents / 100
  const hasCents = Math.abs(cents % 100) > 0

  return `R$${value.toLocaleString('pt-BR', {
    minimumFractionDigits: options?.compactWhole && !hasCents ? 0 : 2,
    maximumFractionDigits: 2,
  })}`
}

export const formatStakeInputValue = (cents: number) => String(Math.max(0, Math.floor(cents / 100)))

export const normalizeSelectionLineValue = (value: string) => (
  value
    .trim()
    .split(/\s*(?:→|»)\s*/)
    .pop()
    ?.trim()
    .replace(/^mais\s+de\s+(\d+(?:[,.]\d+)?)(.*)$/i, '↑ $1$2')
    .replace(/^menos\s+de\s+(\d+(?:[,.]\d+)?)(.*)$/i, '↓ $1$2')
    .replace(/^over\s+(\d+(?:[,.]\d+)?)(.*)$/i, '↑ $1$2')
    .replace(/^under\s+(\d+(?:[,.]\d+)?)(.*)$/i, '↓ $1$2')
    .replace(/\b(\d+)\.0\+/g, '$1+') ?? ''
)

export const getSelectionEventName = (selection: BetslipSelection) => {
  if (selection.homeTeam && selection.awayTeam) return `${selection.homeTeam} vs ${selection.awayTeam}`
  if (selection.eventName) return selection.eventName.replace(/\s+x\s+/i, ' vs ')
  return selection.eventId.split(':').slice(-2).map((part) => part.replace(/-/g, ' ')).join(' vs ')
}

const getTeamLabelKeys = (teamName: string) => {
  const normalizedTeamName = teamName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  const cleanWords = normalizedTeamName
    .split(/\s+/)
    .map((word) => word.replace(/[^a-z0-9]/gi, ''))
    .filter(Boolean)
  const compactName = cleanWords.join('')
  const acronym = cleanWords.length > 1 ? cleanWords.map((word) => word[0]).join('') : ''
  const variants = [
    teamName,
    getTeamAbbreviation(teamName),
    acronym,
    cleanWords[0] ?? '',
    compactName.slice(0, 3),
    compactName.slice(0, 4),
  ]

  return new Set(
    variants
      .filter(Boolean)
      .map((variant) => normalizeBetslipIdPart(variant))
  )
}

const getAbbreviatedEventMatchup = (selection: BetslipSelection) => {
  const { homeTeam, awayTeam } = getSelectionEventTeams(selection)

  if (homeTeam && awayTeam) {
    return `${getTeamAbbreviation(homeTeam)} vs ${getTeamAbbreviation(awayTeam)}`
  }

  const eventName = getSelectionEventName(selection)
  const eventNameParts = eventName.split(/\s+(?:x|vs|v)\s+/i).map((part) => part.trim()).filter(Boolean)

  if (eventNameParts.length === 2) {
    return `${getTeamAbbreviation(eventNameParts[0])} vs ${getTeamAbbreviation(eventNameParts[1])}`
  }

  return eventName
}

export const getSelectionTimeLabel = (selection: BetslipSelection) => {
  if (selection.eventStatus === 'live') return selection.liveClock ?? selection.eventTimeLabel ?? '18:00'
  return selection.eventTimeLabel ?? 'dd/mes (20:00)'
}

export const getSelectionEventTeams = (selection: BetslipSelection) => {
  if (selection.homeTeam && selection.awayTeam) {
    return {
      homeTeam: selection.homeTeam,
      awayTeam: selection.awayTeam,
    }
  }

  const eventNameParts = selection.eventName?.split(/\s+(?:x|vs|v)\s+/i).map((part) => part.trim()).filter(Boolean)
  if (eventNameParts?.length === 2) {
    return {
      homeTeam: eventNameParts[0],
      awayTeam: eventNameParts[1],
    }
  }

  const eventIdParts = selection.eventId
    .split(':')
  if (eventIdParts.length < 3) {
    return {
      homeTeam: '',
      awayTeam: '',
    }
  }

  const eventTeamParts = eventIdParts
    .slice(-2)
    .map((part) => part.replace(/-/g, ' '))
    .filter(Boolean)

  return {
    homeTeam: eventTeamParts[0] ?? '',
    awayTeam: eventTeamParts[1] ?? '',
  }
}

const getEventTeamGroupCode = (teamName: string, fallback: string) => (
  teamName.trim() ? normalizeBetslipIdPart(getTeamAbbreviation(teamName)) : fallback
)

const getSelectionEventGroupKey = (selection: BetslipSelection) => {
  const { homeTeam, awayTeam } = getSelectionEventTeams(selection)
  const sportKey = normalizeBetslipIdPart(selection.sport ?? selection.leagueId ?? selection.leagueName ?? 'event')

  if (homeTeam || awayTeam) {
    return [
      sportKey,
      getEventTeamGroupCode(homeTeam, 'home'),
      getEventTeamGroupCode(awayTeam, 'away'),
    ].join(':')
  }

  return [
    sportKey,
    normalizeBetslipIdPart(getSelectionEventName(selection)),
  ].join(':')
}

export const getSelectionScoreLabel = (score: BetslipSelection['homeScore']) => String(score ?? 0)

export const getSportPlaceholderSrc = (selection: BetslipSelection) => {
  const sportKey = normalizeBetslipIdPart(selection.sport ?? selection.leagueId ?? selection.leagueName ?? '')

  if (sportKey.includes('basquete') || sportKey.includes('basket') || sportKey.includes('nba')) {
    return placeholderBasquete
  }

  if (sportKey.includes('tenis') || sportKey.includes('tennis')) {
    return placeholderTenis
  }

  if (sportKey.includes('futebol') || sportKey.includes('football') || sportKey.includes('soccer')) {
    return placeholderSoccer
  }

  return ''
}

export const getSelectionTitle = (selection: BetslipSelection) => {
  if (selection.selectionType === 'player') {
    return selection.playerName ?? selection.selectionLabel
  }

  const rawTitle = normalizeSelectionLineValue(selection.selectionLabel)
  const titleKey = normalizeBetslipIdPart(rawTitle)
  const labelKey = normalizeBetslipIdPart(selection.label)
  const { homeTeam, awayTeam } = getSelectionEventTeams(selection)

  if (homeTeam) {
    const homeKeys = getTeamLabelKeys(homeTeam)
    if (homeKeys.has(titleKey) || homeKeys.has(labelKey)) return homeTeam
  }

  if (awayTeam) {
    const awayKeys = getTeamLabelKeys(awayTeam)
    if (awayKeys.has(titleKey) || awayKeys.has(labelKey)) return awayTeam
  }

  return rawTitle
}

export const getPlayerSelectionValueLabel = (selection: BetslipSelection) => {
  if (selection.selectionType !== 'player') return ''

  const rawValue = selection.label.trim()
  const title = getSelectionTitle(selection).trim()

  if (!rawValue || rawValue === title) return ''

  const valueWithoutTitle = rawValue.toLowerCase().startsWith(title.toLowerCase())
    ? rawValue.slice(title.length).trim()
    : rawValue

  return normalizeSelectionLineValue(valueWithoutTitle)
}

export const getSelectionMarketLabel = (selection: BetslipSelection) => {
  const normalizedMarket = normalizeBetslipIdPart(selection.marketLabel || selection.marketId || selection.label)
  return marketTranslations[normalizedMarket] ?? (selection.marketLabel || selection.marketId || 'Mercado').toUpperCase()
}

export const getSelectionTeamSuffix = (selection: BetslipSelection) => {
  if (selection.selectionType !== 'player') return ''
  if (selection.selectionTeamName) return getTeamAbbreviation(selection.selectionTeamName)

  return selection.awayTeam ?? selection.homeTeam ?? ''
}

export const getSelectionEventMeta = (selection: BetslipSelection) => {
  const eventName = getAbbreviatedEventMatchup(selection)
  const timeLabel = getSelectionTimeLabel(selection)
  return `${timeLabel} · ${eventName}`
}

const getSportsDbPreferredTeamLogo = (teamName: string, currentLogo?: string) => (
  getTeamLogo(teamName) || currentLogo
)

export const isDrawSelection = (selection: BetslipSelection) => {
  const selectionTitle = normalizeBetslipIdPart(getSelectionTitle(selection))
  const outcomeId = normalizeBetslipIdPart(selection.outcomeId)

  return selectionTitle === 'empate' || outcomeId === 'draw' || outcomeId === 'empate'
}

export const getSelectionAvatarDrawContext = (selection: BetslipSelection): SelectionAvatarDrawContext | null => {
  if (selection.selectionType === 'player' || !isDrawSelection(selection)) return null

  const { homeTeam, awayTeam } = getSelectionEventTeams(selection)
  if (!homeTeam || !awayTeam) return null

  return {
    awayLogo: getSportsDbPreferredTeamLogo(awayTeam, selection.awayTeamIcon),
    awayTeam,
    homeLogo: getSportsDbPreferredTeamLogo(homeTeam, selection.homeTeamIcon),
    homeTeam,
  }
}

export const getSelectionAvatarTeamContext = (selection: BetslipSelection): SelectionAvatarTeamContext | null => {
  if (selection.selectionType === 'player' || isDrawSelection(selection)) return null

  const selectionTitle = getSelectionTitle(selection)
  const createContext = (
    teamName: string | undefined,
    currentLogo: string | undefined,
    fallbackLogo: string
  ): SelectionAvatarTeamContext | null => {
    const normalizedTeamName = teamName?.trim()
    if (!normalizedTeamName) return null

    return {
      teamName: normalizedTeamName,
      currentLogo: getSportsDbPreferredTeamLogo(normalizedTeamName, currentLogo),
      fallbackLogo,
    }
  }

  if (selection.homeTeam && selectionTitle === selection.homeTeam) {
    return createContext(selection.homeTeam, selection.homeTeamIcon ?? selection.selectionIcon, TEAM_LOGO_FALLBACK)
  }

  if (selection.awayTeam && selectionTitle === selection.awayTeam) {
    return createContext(selection.awayTeam, selection.awayTeamIcon ?? selection.selectionIcon, TEAM_LOGO_FALLBACK)
  }

  if (selection.homeTeam) {
    return createContext(selection.homeTeam, selection.homeTeamIcon, TEAM_LOGO_FALLBACK)
  }

  if (selection.awayTeam) {
    return createContext(selection.awayTeam, selection.awayTeamIcon, TEAM_LOGO_FALLBACK)
  }

  return null
}

export const getSelectionAvatarFallback = (selection: BetslipSelection) => (
  getSportPlaceholderSrc(selection) || placeholderShield
)

export const getPlayerAvatarFallbackSrc = (selection: BetslipSelection) => {
  const sportKey = normalizeBetslipIdPart(selection.sport ?? '')

  if (sportKey.includes('basquete') || sportKey.includes('basketball') || sportKey === 'nba') {
    return playerAvatarBasquete
  }

  if (sportKey.includes('futebol') || sportKey.includes('football') || sportKey.includes('soccer')) {
    return playerAvatarFutebol
  }

  return getSportPlaceholderSrc(selection) || playerAvatarFutebol
}

const getSelectionBadge = (selection: BetslipSelection) => {
  const marketKey = normalizeBetslipIdPart(selection.marketLabel || selection.marketId)
  const marketIdKey = normalizeBetslipIdPart(selection.marketId)
  const isResultMarket = [
    'resultado-final',
    'resultado-final-pagamento-antecipado',
    '1x2',
    'vencedor',
    'vencedor-pagamento-antecipado',
  ].includes(marketKey) || [
    'resultado-final',
    'resultado-final-pagamento-antecipado',
    '1x2',
    'vencedor',
    'vencedor-pagamento-antecipado',
  ].includes(marketIdKey)

  if (
    marketKey.includes('pagamento-antecipado')
    || marketIdKey.includes('pagamento-antecipado')
    || (selection.badgeType === 'boost' && isResultMarket)
  ) return 'PA'
  if (selection.badgeType === 'boost' || selection.badgeType === 'substitution') return 'B+'

  return ''
}

const normalizeSelectionBadgeLabel = (label: string) => (
  label.trim().replace(/90['’]?/g, '90’')
)

export const getSelectionBadges = (selection: BetslipSelection) => {
  const sportKey = normalizeBetslipIdPart(selection.sport ?? '')
  const marketKey = normalizeBetslipIdPart(selection.marketLabel || selection.marketId)
  const marketIdKey = normalizeBetslipIdPart(selection.marketId)
  const isFootballSelection = ['futebol', 'football', 'soccer'].some((key) => sportKey.includes(key))
  const isResultMarket = ['resultado-final', '1x2', 'vencedor'].includes(marketKey)
    || ['resultado-final', '1x2', 'vencedor'].includes(marketIdKey)
  const badgeLabels = [
    ...(selection.marketTags ?? []),
    isFootballSelection && isResultMarket ? '90’' : '',
    getSelectionBadge(selection),
  ]
  const normalizedLabels = badgeLabels
    .map(normalizeSelectionBadgeLabel)
    .filter(Boolean)
  const uniqueLabels = new Set(normalizedLabels)

  return ['PA', '90’', 'B+'].filter((label) => uniqueLabels.has(label))
}

export const groupSelectionsByEvent = (selections: BetslipSelection[]) => {
  const groups = new Map<string, BetslipSelection[]>()

  selections.forEach((selection) => {
    const eventGroupKey = getSelectionEventGroupKey(selection)
    groups.set(eventGroupKey, [...(groups.get(eventGroupKey) ?? []), selection])
  })

  return Array.from(groups.entries()).map(([eventId, groupSelections]): BetslipSelectionGroup => ({
    eventId,
    selections: groupSelections,
  }))
}

export const getSgpHeaderSelection = (selections: BetslipSelection[]) => (
  selections.find((selection) => selection.homeTeam && selection.awayTeam) ?? selections[0]
)

export const getSgpHeaderParts = (selection: BetslipSelection | undefined) => {
  if (!selection) {
    return {
      homeLabel: 'ABC',
      awayLabel: 'XYZ',
      timeLabel: '',
      eventLabel: '',
    }
  }

  const { homeTeam, awayTeam } = getSelectionEventTeams(selection)

  return {
    homeLabel: homeTeam ? getTeamAbbreviation(homeTeam) : 'ABC',
    awayLabel: awayTeam ? getTeamAbbreviation(awayTeam) : 'XYZ',
    timeLabel: getSelectionTimeLabel(selection),
    eventLabel: getSelectionEventName(selection),
  }
}
