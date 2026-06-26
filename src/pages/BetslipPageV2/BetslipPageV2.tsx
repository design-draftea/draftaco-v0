import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from 'react'
import { CaretRightIcon, XIcon } from '@phosphor-icons/react'
import './BetslipPageV2.css'

import closeBetslipIcon from '../../assets/iconsDraftaco/closeBS.svg'
import iconLive from '../../assets/iconsDraftaco/icon-live.svg'
import iconPencil from '../../assets/iconsDraftaco/iconPencil.svg'
import trashIcon from '../../assets/iconsDraftaco/iconTrash.svg'
import placeholderBasquete from '../../assets/iconsDraftaco/placeholderBasquete.svg'
import placeholderShield from '../../assets/iconsDraftaco/placeholderShield.svg'
import placeholderShieldVersus from '../../assets/iconsDraftaco/placeholderShieldVersus.svg'
import placeholderSoccer from '../../assets/iconsDraftaco/placeholderSoccer.svg'
import placeholderTenis from '../../assets/iconsDraftaco/placeholderTenis.svg'
import { getTeamLogo } from '../../data/teamLogos'
import { useBetslip } from '../../hooks/useBetslip'
import {
  formatBetslipOdd,
  normalizeBetslipIdPart,
  type BetslipSelection,
} from '../../hooks/betslipUtils'
import { getTeamAbbreviation } from '../../utils/teamAbbreviations'

interface BetslipPageV2Props {
  isCoveredByEvent?: boolean
  onClose?: () => void
  onSelectionsEmptyExitStart?: () => void
}

interface BetslipSelectionGroup {
  eventId: string
  selections: BetslipSelection[]
}

const DEFAULT_STAKE_CENTS = 1000
const BALANCE_LABEL = 'R$250,00'
const CLOSE_ANIMATION_MS = 320
const SWIPE_COMPLETE_RATIO = 0.6
const SWIPE_COMPLETE_ANIMATION_MS = 180
const SWIPE_KNOB_SIZE_PX = 52
const SWIPE_TRACK_PADDING_PX = 4

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

const formatMoney = (cents: number, options?: { compactWhole?: boolean }) => {
  const value = cents / 100
  const hasCents = Math.abs(cents % 100) > 0

  return `R$${value.toLocaleString('pt-BR', {
    minimumFractionDigits: options?.compactWhole && !hasCents ? 0 : 2,
    maximumFractionDigits: 2,
  })}`
}

const formatStakeInputValue = (cents: number) => String(Math.max(0, Math.floor(cents / 100)))

const normalizeSelectionLineValue = (value: string) => (
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

const getSelectionEventName = (selection: BetslipSelection) => {
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

const getSelectionTimeLabel = (selection: BetslipSelection) => {
  if (selection.eventStatus === 'live') return selection.liveClock ?? selection.eventTimeLabel ?? '18:00'
  return selection.eventTimeLabel ?? 'dd/mes (20:00)'
}

const getSelectionEventTeams = (selection: BetslipSelection) => {
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

const getSelectionScoreLabel = (score: BetslipSelection['homeScore']) => String(score ?? 0)

const getSportPlaceholderSrc = (selection: BetslipSelection) => {
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

const getSelectionTitle = (selection: BetslipSelection) => {
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

const getPlayerSelectionValueLabel = (selection: BetslipSelection) => {
  if (selection.selectionType !== 'player') return ''

  const rawValue = selection.label.trim()
  const title = getSelectionTitle(selection).trim()

  if (!rawValue || rawValue === title) return ''

  const valueWithoutTitle = rawValue.toLowerCase().startsWith(title.toLowerCase())
    ? rawValue.slice(title.length).trim()
    : rawValue

  return normalizeSelectionLineValue(valueWithoutTitle)
}

const getSelectionMarketLabel = (selection: BetslipSelection) => {
  const normalizedMarket = normalizeBetslipIdPart(selection.marketLabel || selection.marketId || selection.label)
  return marketTranslations[normalizedMarket] ?? (selection.marketLabel || selection.marketId || 'Mercado').toUpperCase()
}

const getSelectionTeamSuffix = (selection: BetslipSelection) => {
  if (selection.selectionType !== 'player') return ''
  if (selection.selectionTeamName) return getTeamAbbreviation(selection.selectionTeamName)

  return selection.awayTeam ?? selection.homeTeam ?? ''
}

const getSelectionEventMeta = (selection: BetslipSelection) => {
  const eventName = getAbbreviatedEventMatchup(selection)
  const timeLabel = getSelectionTimeLabel(selection)
  return `${timeLabel} · ${eventName}`
}

function SelectionEventMeta({ selection }: { selection: BetslipSelection }) {
  if (selection.eventStatus !== 'live') {
    return <span className="betslip-v2__event-line">{getSelectionEventMeta(selection)}</span>
  }

  const { homeTeam, awayTeam } = getSelectionEventTeams(selection)
  const homeLabel = homeTeam ? getTeamAbbreviation(homeTeam) : 'HOME'
  const awayLabel = awayTeam ? getTeamAbbreviation(awayTeam) : 'AWAY'

  return (
    <span className="betslip-v2__event-line betslip-v2__event-line--live">
      <span className="betslip-v2__live-time">
        <img className="betslip-v2__live-dot" src={iconLive} alt="" aria-hidden="true" draggable="false" />
        {getSelectionTimeLabel(selection)}
      </span>
      <span className="betslip-v2__event-separator" aria-hidden="true">•</span>
      <span className="betslip-v2__live-matchup">
        <span>{`${homeLabel} (${getSelectionScoreLabel(selection.homeScore)}) vs `}</span>
        <span className="betslip-v2__live-matchup-away">{`${awayLabel} (${getSelectionScoreLabel(selection.awayScore)})`}</span>
      </span>
    </span>
  )
}

const getSelectionIconSrc = (selection: BetslipSelection) => {
  const selectionTitle = getSelectionTitle(selection)
  const sportPlaceholder = getSportPlaceholderSrc(selection)
  const getResolvedTeamLogo = (teamName?: string, teamIcon?: string) => {
    if (teamIcon) return teamIcon
    if (!teamName) return ''

    return getTeamLogo(teamName)
  }

  if (selection.selectionType === 'player') {
    const playerIcon = selection.playerImage
      ?? selection.selectionIcon
      ?? getResolvedTeamLogo(selection.homeTeam, selection.homeTeamIcon)

    return playerIcon || sportPlaceholder || placeholderSoccer
  }

  if (selection.selectionIcon) return selection.selectionIcon

  if (selection.homeTeam && selectionTitle === selection.homeTeam) {
    return getResolvedTeamLogo(selection.homeTeam, selection.homeTeamIcon) || placeholderShield
  }

  if (selection.awayTeam && selectionTitle === selection.awayTeam) {
    return getResolvedTeamLogo(selection.awayTeam, selection.awayTeamIcon) || placeholderShield
  }

  if (selection.homeTeam) {
    return getResolvedTeamLogo(selection.homeTeam, selection.homeTeamIcon) || placeholderShieldVersus
  }

  if (selection.awayTeam) {
    return getResolvedTeamLogo(selection.awayTeam, selection.awayTeamIcon) || placeholderShieldVersus
  }

  return sportPlaceholder || placeholderShield
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

const groupSelectionsByEvent = (selections: BetslipSelection[]) => {
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

const getSgpHeaderSelection = (selections: BetslipSelection[]) => (
  selections.find((selection) => selection.homeTeam && selection.awayTeam) ?? selections[0]
)

const getSgpHeaderParts = (selection: BetslipSelection | undefined) => {
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

function SelectionAvatar({ selection, compact = false }: { selection: BetslipSelection; compact?: boolean }) {
  const iconSrc = getSelectionIconSrc(selection)

  return (
    <span className={`betslip-v2__avatar${compact ? ' betslip-v2__avatar--compact' : ''}`} aria-hidden="true">
      <img src={iconSrc} alt="" draggable="false" />
    </span>
  )
}

function RemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="betslip-v2__row-remove" aria-label={label} onClick={onClick}>
      <XIcon aria-hidden="true" weight="regular" />
    </button>
  )
}

function Badge({ label }: { label: string }) {
  if (!label) return null

  return <span className="betslip-v2__badge">{label}</span>
}

function SelectionTitleLine({ selection }: { selection: BetslipSelection }) {
  const title = getSelectionTitle(selection)
  const teamSuffix = getSelectionTeamSuffix(selection)
  const playerChoice = getPlayerSelectionValueLabel(selection)

  return (
    <div className="betslip-v2__title-line">
      <strong>{title}</strong>
      {teamSuffix ? <span className="betslip-v2__team-suffix">{teamSuffix}</span> : null}
      {playerChoice ? (
        <>
          <span className="betslip-v2__title-separator" aria-hidden="true">|</span>
          <span className="betslip-v2__player-choice">{playerChoice}</span>
        </>
      ) : null}
    </div>
  )
}

function SimpleSelectionRow({
  selection,
  onRemove,
}: {
  selection: BetslipSelection
  onRemove: (selectionId: string) => void
}) {
  const title = getSelectionTitle(selection)

  return (
    <article className="betslip-v2__selection-row">
      <RemoveButton label={`Eliminar selección ${title}`} onClick={() => onRemove(selection.id)} />
      <span className="betslip-v2__divider" aria-hidden="true" />
      <div className="betslip-v2__selection-content">
        <SelectionAvatar selection={selection} />
        <div className="betslip-v2__selection-copy">
          <div className="betslip-v2__market-line">
            <span>{getSelectionMarketLabel(selection)}</span>
            <Badge label={getSelectionBadge(selection)} />
          </div>
          <SelectionTitleLine selection={selection} />
          <SelectionEventMeta selection={selection} />
        </div>
      </div>
      <strong className="betslip-v2__row-odd">{selection.oddLabel}</strong>
    </article>
  )
}

function SgpGroup({
  group,
  onRemoveGroup,
  onRemoveSelection,
}: {
  group: BetslipSelectionGroup
  onRemoveGroup: (selectionIds: string[]) => void
  onRemoveSelection: (selectionId: string) => void
}) {
  const headerSelection = getSgpHeaderSelection(group.selections)
  const { homeLabel, awayLabel, timeLabel, eventLabel: headerEventLabel } = getSgpHeaderParts(headerSelection)
  const eventLabel = headerEventLabel || group.eventId

  return (
    <section className="betslip-v2__sgp" aria-label={`Crear apuesta ${eventLabel}`}>
      <div className="betslip-v2__sgp-header">
        <RemoveButton
          label={`Eliminar crear apuesta ${eventLabel}`}
          onClick={() => onRemoveGroup(group.selections.map((selection) => selection.id))}
        />
        <span className="betslip-v2__divider" aria-hidden="true" />
        <div className="betslip-v2__sgp-match">
          <span className="betslip-v2__sgp-team">{homeLabel}</span>
          <span className="betslip-v2__sgp-versus">vs</span>
          <span className="betslip-v2__sgp-team">{awayLabel}</span>
          {timeLabel ? (
            <>
              <span className="betslip-v2__sgp-dot" aria-hidden="true">·</span>
              <span className="betslip-v2__sgp-time">{timeLabel}</span>
            </>
          ) : null}
        </div>
      </div>
      {group.selections.map((selection) => {
        const title = getSelectionTitle(selection)

        return (
          <article key={selection.id} className="betslip-v2__sgp-leg">
            <RemoveButton label={`Eliminar selección ${title}`} onClick={() => onRemoveSelection(selection.id)} />
            <SelectionAvatar selection={selection} compact />
            <div className="betslip-v2__sgp-copy">
              <div className="betslip-v2__market-line">
                <span>{getSelectionMarketLabel(selection)}</span>
                <Badge label={getSelectionBadge(selection)} />
              </div>
              <SelectionTitleLine selection={selection} />
            </div>
          </article>
        )
      })}
    </section>
  )
}

const clampSwipeProgress = (progress: number) => Math.max(0, Math.min(progress, 1))

const getSwipeInnerWidth = (trackWidth: number) => (
  Math.max(
    SWIPE_KNOB_SIZE_PX,
    trackWidth - SWIPE_TRACK_PADDING_PX * 2
  )
)

const getSwipeFillWidth = (trackWidth: number, progress: number) => {
  const innerWidth = getSwipeInnerWidth(trackWidth)

  return SWIPE_KNOB_SIZE_PX + (
    innerWidth - SWIPE_KNOB_SIZE_PX
  ) * clampSwipeProgress(progress)
}

const getSwipeFillRatio = (trackWidth: number, progress: number) => (
  getSwipeFillWidth(trackWidth, progress) / getSwipeInnerWidth(trackWidth)
)

function SwipeButton({
  stakeLabel,
  onComplete,
}: {
  stakeLabel: string
  onComplete: () => void
}) {
  const trackRef = useRef<HTMLButtonElement>(null)
  const dragStartXRef = useRef(0)
  const dragStartProgressRef = useRef(0)
  const dragProgressRef = useRef(0)
  const completeTimerRef = useRef<number | null>(null)
  const [trackWidth, setTrackWidth] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isCompleting, setIsCompleting] = useState(false)
  const [hasCompleted, setHasCompleted] = useState(false)
  const [isLoadingVisible, setIsLoadingVisible] = useState(false)
  const isInteractionDisabled = isCompleting || hasCompleted
  const isCompleteState = hasCompleted || isLoadingVisible
  const fillWidth = getSwipeFillWidth(trackWidth, isCompleteState ? 1 : progress)
  const swipeStyle = {
    '--betslip-v2-swipe-fill-width': `${fillWidth}px`,
  } as CSSProperties

  const setVisualProgress = useCallback((nextProgress: number) => {
    const clampedProgress = clampSwipeProgress(nextProgress)

    dragProgressRef.current = clampedProgress
    setProgress(clampedProgress)
  }, [])

  const clearCompleteTimer = useCallback(() => {
    if (completeTimerRef.current === null) return

    window.clearTimeout(completeTimerRef.current)
    completeTimerRef.current = null
  }, [])

  const getMaxDragTravel = useCallback(() => {
    const track = trackRef.current
    if (!track) return 1

    const rect = track.getBoundingClientRect()
    const innerWidth = getSwipeInnerWidth(rect.width)

    return Math.max(1, innerWidth - SWIPE_KNOB_SIZE_PX)
  }, [])

  const completeSwipe = useCallback(() => {
    if (isInteractionDisabled) return

    clearCompleteTimer()
    setIsDragging(false)
    setHasCompleted(true)
    setIsCompleting(true)
    setIsLoadingVisible(false)
    setVisualProgress(1)

    completeTimerRef.current = window.setTimeout(() => {
      completeTimerRef.current = null
      setIsCompleting(false)
      setIsLoadingVisible(true)
      onComplete()
    }, SWIPE_COMPLETE_ANIMATION_MS)
  }, [clearCompleteTimer, isInteractionDisabled, onComplete, setVisualProgress])

  useLayoutEffect(() => {
    const track = trackRef.current
    if (!track) return undefined

    const updateTrackWidth = () => {
      const nextTrackWidth = track.getBoundingClientRect().width

      setTrackWidth((currentTrackWidth) => (
        currentTrackWidth === nextTrackWidth ? currentTrackWidth : nextTrackWidth
      ))
    }

    updateTrackWidth()

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateTrackWidth)

      return () => window.removeEventListener('resize', updateTrackWidth)
    }

    const resizeObserver = new ResizeObserver(updateTrackWidth)
    resizeObserver.observe(track)

    return () => resizeObserver.disconnect()
  }, [])

  useEffect(() => () => {
    clearCompleteTimer()
  }, [clearCompleteTimer])

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (isInteractionDisabled || event.button !== 0) return

    event.preventDefault()
    clearCompleteTimer()
    setIsDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
    dragStartXRef.current = event.clientX
    dragStartProgressRef.current = dragProgressRef.current
    setIsCompleting(false)
  }

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (!isDragging || isInteractionDisabled) return

    event.preventDefault()
    const dragDelta = event.clientX - dragStartXRef.current
    const nextProgress = dragStartProgressRef.current + dragDelta / getMaxDragTravel()

    setVisualProgress(nextProgress)
  }

  const handlePointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    if (!isDragging) return

    event.preventDefault()
    setIsDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    const currentTrackWidth = event.currentTarget.getBoundingClientRect().width
    const filledRatio = getSwipeFillRatio(currentTrackWidth, dragProgressRef.current)

    if (filledRatio >= SWIPE_COMPLETE_RATIO) {
      completeSwipe()
      return
    }

    setVisualProgress(0)
  }

  const handlePointerCancel = (event: PointerEvent<HTMLButtonElement>) => {
    if (!isDragging) return

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    setIsDragging(false)
    setVisualProgress(0)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!['Enter', ' '].includes(event.key)) return

    event.preventDefault()
    completeSwipe()
  }

  return (
    <button
      type="button"
      className={[
        'betslip-v2__swipe',
        isDragging ? 'betslip-v2__swipe--dragging' : '',
        isLoadingVisible ? 'betslip-v2__swipe--loading' : '',
        hasCompleted || isCompleting ? 'betslip-v2__swipe--complete' : '',
      ].filter(Boolean).join(' ')}
      ref={trackRef}
      aria-busy={isLoadingVisible}
      aria-label={`Desliza para apostar ${stakeLabel}`}
      disabled={isInteractionDisabled}
      style={swipeStyle}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      <span className="betslip-v2__swipe-label">Desliza para apostar {stakeLabel}</span>
      <span className="betslip-v2__swipe-fill" aria-hidden="true">
        <CaretRightIcon className="betslip-v2__swipe-icon" weight="bold" />
      </span>
      <span className="betslip-v2__swipe-spinner-wrap" aria-hidden="true">
        <span className="betslip-v2__swipe-spinner" />
      </span>
    </button>
  )
}

export function BetslipPageV2({
  isCoveredByEvent = false,
  onClose,
  onSelectionsEmptyExitStart,
}: BetslipPageV2Props) {
  const { selections, summary, removeSelection, clearSelections } = useBetslip()
  const [isLeaving, setIsLeaving] = useState(false)
  const [stakeCents, setStakeCents] = useState(DEFAULT_STAKE_CENTS)
  const [stakeInputValue, setStakeInputValue] = useState(() => formatStakeInputValue(DEFAULT_STAKE_CENTS))
  const closeTimerRef = useRef<number | null>(null)
  const hadSelectionsRef = useRef(selections.length > 0)

  const selectionGroups = useMemo(() => groupSelectionsByEvent(selections), [selections])
  const totalOddsValue = summary.hasSelections ? summary.totalOdds : 0
  const totalOddsLabel = summary.hasSelections ? summary.totalOddsLabel : formatBetslipOdd(0)
  const potentialWinCents = Math.round(stakeCents * totalOddsValue)
  const stakeLabel = formatMoney(stakeCents, { compactWhole: true })
  const potentialWinLabel = formatMoney(potentialWinCents)
  const hasSgp = selectionGroups.some((group) => group.selections.length > 1)

  const handleStakeChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const digits = event.target.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '')
    const nextStakeReais = digits ? Number(digits) : 0

    setStakeInputValue(digits)
    setStakeCents(Number.isFinite(nextStakeReais) ? nextStakeReais * 100 : 0)
  }, [])

  const requestClose = useCallback((afterClose?: () => void) => {
    if (isLeaving) return

    setIsLeaving(true)
    closeTimerRef.current = window.setTimeout(() => {
      afterClose?.()
      onClose?.()
    }, CLOSE_ANIMATION_MS)
  }, [isLeaving, onClose])

  const handleClearAll = useCallback(() => {
    onSelectionsEmptyExitStart?.()
    requestClose(clearSelections)
  }, [clearSelections, onSelectionsEmptyExitStart, requestClose])

  const handleRemoveGroup = useCallback((selectionIds: string[]) => {
    selectionIds.forEach(removeSelection)
  }, [removeSelection])

  const handleConfirm = useCallback(() => {
    requestClose(clearSelections)
  }, [clearSelections, requestClose])

  useEffect(() => () => {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current)
  }, [])

  useEffect(() => {
    if (selections.length > 0) {
      hadSelectionsRef.current = true
      return
    }

    if (!hadSelectionsRef.current || isLeaving) return

    onSelectionsEmptyExitStart?.()
    requestClose()
  }, [isLeaving, onSelectionsEmptyExitStart, requestClose, selections.length])

  return (
    <main
      className={[
        'betslip-v2',
        isLeaving ? 'betslip-v2--leaving' : 'betslip-v2--entering',
        isCoveredByEvent ? 'betslip-v2--covered-by-event' : '',
      ].filter(Boolean).join(' ')}
      aria-hidden={isCoveredByEvent ? true : undefined}
      aria-labelledby="betslip-v2-title"
    >
      <div className="betslip-v2__light" aria-hidden="true" />
      <header className="betslip-v2__header">
        <button type="button" className="betslip-v2__icon-button" aria-label="Eliminar todas las selecciones" onClick={handleClearAll}>
          <img className="betslip-v2__header-icon" src={trashIcon} alt="" aria-hidden="true" draggable="false" />
        </button>

        <div className="betslip-v2__header-title">
          <div className="betslip-v2__title-row">
            <h1 id="betslip-v2-title">Resumo da sua entrada</h1>
            <span>{Math.max(summary.selectionCount, selections.length)}</span>
          </div>
          <p>Saldo disponível: {BALANCE_LABEL}</p>
        </div>

        <button type="button" className="betslip-v2__icon-button" aria-label="Cerrar betslip" onClick={() => requestClose()}>
          <img className="betslip-v2__header-icon" src={closeBetslipIcon} alt="" aria-hidden="true" draggable="false" />
        </button>
      </header>

      <section className="betslip-v2__content" aria-label="Selecciones">
        <div className="betslip-v2__list">
          {selectionGroups.length === 0 ? (
            <div className="betslip-v2__empty">
              <strong>No hay selecciones</strong>
              <span>Elige una odd para crear tu entrada.</span>
            </div>
          ) : selectionGroups.map((group) => (
            group.selections.length > 1 ? (
              <SgpGroup
                key={group.eventId}
                group={group}
                onRemoveGroup={handleRemoveGroup}
                onRemoveSelection={removeSelection}
              />
            ) : (
              <SimpleSelectionRow
                key={group.selections[0].id}
                selection={group.selections[0]}
                onRemove={removeSelection}
              />
            )
          ))}
        </div>
      </section>

      <footer className="betslip-v2__footer">
        <div className="betslip-v2__summary" aria-label="Resumen de valores">
          <label className="betslip-v2__stake">
            <span className="betslip-v2__stake-field">
              <img className="betslip-v2__stake-icon" src={iconPencil} alt="" aria-hidden="true" draggable="false" />
              <span className="betslip-v2__stake-value">
                <span className="betslip-v2__stake-currency" aria-hidden="true">R$</span>
                <input
                  className="betslip-v2__stake-input"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  enterKeyHint="done"
                  autoComplete="off"
                  aria-label="Entrada"
                  value={stakeInputValue}
                  onChange={handleStakeChange}
                  onFocus={(event) => event.currentTarget.select()}
                />
              </span>
            </span>
            <span className="betslip-v2__stake-label">Entrada</span>
          </label>

          <div className="betslip-v2__summary-item">
            <span>Odds</span>
            <strong>{totalOddsLabel}</strong>
            {hasSgp ? <em>SGP</em> : null}
          </div>

          <div className="betslip-v2__summary-item betslip-v2__summary-item--win">
            <span>Para ganar</span>
            <strong>{potentialWinLabel}</strong>
          </div>
        </div>

        <label className="betslip-v2__odds-accept">
          <input type="checkbox" />
          <span>
            Aceptar siempre cambios en las odds para agilizar la creación de tu boleto. <a href="#betslip-odds-info">Saber más.</a>
          </span>
        </label>

        <SwipeButton stakeLabel={stakeLabel} onComplete={handleConfirm} />
      </footer>
    </main>
  )
}
