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

import { BottomSheet } from '../../components/BottomSheet'
import closeBetslipIcon from '../../assets/iconsDraftaco/closeBS.svg'
import iconPencil from '../../assets/iconsDraftaco/iconPencil.svg'
import trashIcon from '../../assets/iconsDraftaco/iconTrash.svg'
import iconShieldVersusPlaceholder from '../../assets/iconsDraftaco/iconShieldVersusPlaceholder.svg'
import { useBetslip } from '../../hooks/useBetslip'
import { useSportsDbTeamLogo } from '../../hooks/useSportsDbTeamLogo'
import {
  formatBetslipOdd,
  type BetslipSelection,
} from '../../hooks/betslipUtils'
import { getTeamAbbreviation } from '../../utils/teamAbbreviations'
import type { BetSuccessReceipt } from '../BetSuccessPage'
import {
  type BetslipSelectionGroup,
  formatMoney,
  formatStakeInputValue,
  getPlayerAvatarFallbackSrc,
  getPlayerSelectionValueLabel,
  getSelectionAvatarDrawContext,
  getSelectionAvatarFallback,
  getSelectionAvatarTeamContext,
  getSelectionBadges,
  getSelectionEventMeta,
  getSelectionEventTeams,
  getSelectionMarketLabel,
  getSelectionScoreLabel,
  getSelectionTeamSuffix,
  getSelectionTimeLabel,
  getSelectionTitle,
  getSgpHeaderParts,
  getSgpHeaderSelection,
  groupSelectionsByEvent,
} from './betslipDisplayUtils'

type BetslipAuthVariant = 'logged-in' | 'logged-out'

interface BetslipPageV2Props {
  authVariant?: BetslipAuthVariant
  isCoveredByEvent?: boolean
  onCreateAccountClick?: () => void
  onDepositClick?: () => void
  onLoginClick?: () => void
  onClose?: () => void
  onBetSuccess?: (receipt: BetSuccessReceipt) => void
  onSelectionsEmptyExitStart?: () => void
  requiresDeposit?: boolean
}

const DEFAULT_STAKE_CENTS = 1000
const BALANCE_LABEL = 'R$250,00'
const CLOSE_ANIMATION_MS = 320
const SWIPE_COMPLETE_RATIO = 0.6
const SWIPE_COMPLETE_ANIMATION_MS = 180
const SWIPE_KNOB_SIZE_PX = 52
const SWIPE_TRACK_PADDING_PX = 4
const SELECTION_REMOVE_ANIMATION_MS = 280
const SGP_LEG_REMOVE_ANIMATION_MS = 220
const BETSLIP_INFO_BADGES = new Set(['PA', '90’'])

const betslipInfoItems = [
  {
    label: 'PA',
    text: 'Pagamento antecipado: se sua seleção abrir 2 gols de vantagem no futebol, 20 pontos no basquete, ou vencer o 1º set por 6-0 ou 6-1 no tênis, essa seleção será marcada como vencedora.',
  },
  {
    label: '90’',
    text: 'Tempo regulamentar: os mercados consideram apenas os 90 minutos + acréscimos da partida. Não inclui prorrogação ou pênaltis.',
  },
]

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
        <span className="betslip-v2__live-dot-wrap" aria-hidden="true">
          <span className="betslip-v2__live-dot" />
        </span>
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

function SelectionAvatar({ selection, compact = false }: { selection: BetslipSelection; compact?: boolean }) {
  const isPlayerSelection = selection.selectionType === 'player'
  const drawContext = isPlayerSelection ? null : getSelectionAvatarDrawContext(selection)
  const teamContext = isPlayerSelection ? null : getSelectionAvatarTeamContext(selection)
  const resolvedDrawHomeLogo = useSportsDbTeamLogo(
    drawContext?.homeTeam ?? '',
    drawContext?.homeLogo,
    selection.sport ?? '',
    undefined,
    { useCurrentLogoFallback: true }
  )
  const resolvedDrawAwayLogo = useSportsDbTeamLogo(
    drawContext?.awayTeam ?? '',
    drawContext?.awayLogo,
    selection.sport ?? '',
    undefined,
    { useCurrentLogoFallback: true }
  )
  const resolvedTeamLogo = useSportsDbTeamLogo(
    teamContext?.teamName ?? '',
    teamContext?.currentLogo,
    selection.sport ?? '',
    teamContext?.fallbackLogo,
    { useCurrentLogoFallback: true }
  )
  const iconSrc = isPlayerSelection
    ? selection.playerImage || getPlayerAvatarFallbackSrc(selection)
    : resolvedTeamLogo || teamContext?.fallbackLogo || getSelectionAvatarFallback(selection)

  if (drawContext) {
    const hasVersusTeamLogos = Boolean(resolvedDrawHomeLogo && resolvedDrawAwayLogo)

    return (
      <span
        className={[
          'betslip-v2__avatar',
          'betslip-v2__avatar--versus',
          compact ? 'betslip-v2__avatar--compact' : '',
        ].filter(Boolean).join(' ')}
        aria-hidden="true"
      >
        {hasVersusTeamLogos ? (
          <span className="betslip-v2__avatar-versus-stack">
            <img
              className="betslip-v2__avatar-versus-logo betslip-v2__avatar-versus-logo--home"
              src={resolvedDrawHomeLogo}
              alt=""
              draggable="false"
            />
            <img
              className="betslip-v2__avatar-versus-logo betslip-v2__avatar-versus-logo--away"
              src={resolvedDrawAwayLogo}
              alt=""
              draggable="false"
            />
          </span>
        ) : (
          <img src={iconShieldVersusPlaceholder} alt="" draggable="false" />
        )}
      </span>
    )
  }

  return (
    <span
      className={[
        'betslip-v2__avatar',
        compact ? 'betslip-v2__avatar--compact' : '',
        isPlayerSelection ? 'betslip-v2__avatar--player' : '',
      ].filter(Boolean).join(' ')}
      aria-hidden="true"
    >
      <img src={iconSrc} alt="" draggable="false" />
    </span>
  )
}

function RemoveButton({
  disabled = false,
  label,
  onClick,
}: {
  disabled?: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className="betslip-v2__row-remove"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
    >
      <XIcon aria-hidden="true" weight="regular" />
    </button>
  )
}

function Badges({
  labels,
  onInfoClick,
}: {
  labels: string[]
  onInfoClick: () => void
}) {
  if (labels.length === 0) return null

  return (
    <>
      {labels.map((label) => {
        if (BETSLIP_INFO_BADGES.has(label)) {
          return (
            <button
              type="button"
              className="betslip-v2__badge betslip-v2__badge--button"
              key={label}
              aria-label={`Abrir informações sobre ${label}`}
              onClick={(event) => {
                event.stopPropagation()
                onInfoClick()
              }}
            >
              {label}
            </button>
          )
        }

        return <span className="betslip-v2__badge" key={label}>{label}</span>
      })}
    </>
  )
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
  isRemoveDisabled = false,
  isRemoving = false,
  selection,
  onRemove,
  onTagInfoOpen,
  showOdd = true,
}: {
  isRemoveDisabled?: boolean
  isRemoving?: boolean
  selection: BetslipSelection
  onRemove: (selectionId: string) => void
  onTagInfoOpen: () => void
  showOdd?: boolean
}) {
  const title = getSelectionTitle(selection)

  return (
    <article
      className={[
        'betslip-v2__selection-row',
        showOdd ? '' : 'betslip-v2__selection-row--without-odd',
        isRemoving ? 'betslip-v2__selection-row--removing' : '',
      ].filter(Boolean).join(' ')}
    >
      <RemoveButton
        disabled={isRemoveDisabled}
        label={`Eliminar selección ${title}`}
        onClick={() => onRemove(selection.id)}
      />
      <span className="betslip-v2__divider" aria-hidden="true" />
      <div className="betslip-v2__selection-content">
        <SelectionAvatar selection={selection} />
        <div className="betslip-v2__selection-copy">
          <div className="betslip-v2__market-line">
            <span>{getSelectionMarketLabel(selection)}</span>
            <Badges labels={getSelectionBadges(selection)} onInfoClick={onTagInfoOpen} />
          </div>
          <SelectionTitleLine selection={selection} />
          <SelectionEventMeta selection={selection} />
        </div>
      </div>
      {showOdd ? <strong className="betslip-v2__row-odd">{selection.oddLabel}</strong> : null}
    </article>
  )
}

function SgpGroup({
  group,
  isRemoveDisabled = false,
  isRemoving = false,
  onRemoveGroup,
  onRemoveSelection,
  onTagInfoOpen,
  removingSelectionId,
}: {
  group: BetslipSelectionGroup
  isRemoveDisabled?: boolean
  isRemoving?: boolean
  onRemoveGroup: (groupId: string, selectionIds: string[]) => void
  onRemoveSelection: (selectionId: string) => void
  onTagInfoOpen: () => void
  removingSelectionId?: string | null
}) {
  const headerSelection = getSgpHeaderSelection(group.selections)
  const { homeLabel, awayLabel, timeLabel, eventLabel: headerEventLabel } = getSgpHeaderParts(headerSelection)
  const eventLabel = headerEventLabel || group.eventId

  return (
    <section
      className={[
        'betslip-v2__sgp',
        isRemoving ? 'betslip-v2__sgp--removing' : '',
      ].filter(Boolean).join(' ')}
      aria-label={`Crear apuesta ${eventLabel}`}
    >
      <div className="betslip-v2__sgp-header">
        <RemoveButton
          disabled={isRemoveDisabled}
          label={`Eliminar crear apuesta ${eventLabel}`}
          onClick={() => onRemoveGroup(group.eventId, group.selections.map((selection) => selection.id))}
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
          <article
            key={selection.id}
            className={[
              'betslip-v2__sgp-leg',
              removingSelectionId === selection.id ? 'betslip-v2__sgp-leg--removing' : '',
            ].filter(Boolean).join(' ')}
          >
            <RemoveButton
              disabled={isRemoveDisabled}
              label={`Eliminar selección ${title}`}
              onClick={() => onRemoveSelection(selection.id)}
            />
            <SelectionAvatar selection={selection} compact />
            <div className="betslip-v2__sgp-copy">
              <div className="betslip-v2__market-line">
                <span>{getSelectionMarketLabel(selection)}</span>
                <Badges labels={getSelectionBadges(selection)} onInfoClick={onTagInfoOpen} />
              </div>
              <SelectionTitleLine selection={selection} />
            </div>
          </article>
        )
      })}
    </section>
  )
}

function BetslipTagInfoBottomSheet({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Informações"
      containerClassName="betslip-v2-info-sheet-container"
      sheetClassName="betslip-v2-info-sheet"
      bodyClassName="betslip-v2-info-sheet__body"
      hideScrollIndicator
      blurBackdrop
    >
      <div className="betslip-v2-info-sheet__content">
        {betslipInfoItems.map((item) => (
          <div className="betslip-v2-info-sheet__row" key={item.label}>
            <span className="betslip-v2__badge betslip-v2-info-sheet__badge">{item.label}</span>
            <p>{item.text}</p>
          </div>
        ))}
      </div>
    </BottomSheet>
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
  authVariant = 'logged-in',
  isCoveredByEvent = false,
  onCreateAccountClick,
  onDepositClick,
  onLoginClick,
  onClose,
  onBetSuccess,
  onSelectionsEmptyExitStart,
  requiresDeposit = false,
}: BetslipPageV2Props) {
  const { selections, summary, removeSelection, clearSelections } = useBetslip()
  const [isLeaving, setIsLeaving] = useState(false)
  const [stakeCents, setStakeCents] = useState(DEFAULT_STAKE_CENTS)
  const [stakeInputValue, setStakeInputValue] = useState(() => formatStakeInputValue(DEFAULT_STAKE_CENTS))
  const [acceptsOddsChanges, setAcceptsOddsChanges] = useState(false)
  const [isTagInfoOpen, setIsTagInfoOpen] = useState(false)
  const [removingRowId, setRemovingRowId] = useState<string | null>(null)
  const [removingLegId, setRemovingLegId] = useState<string | null>(null)
  const closeTimerRef = useRef<number | null>(null)
  const rowRemoveTimerRef = useRef<number | null>(null)
  const legRemoveTimerRef = useRef<number | null>(null)
  const hadSelectionsRef = useRef(selections.length > 0)

  const selectionGroups = useMemo(() => groupSelectionsByEvent(selections), [selections])
  const totalOddsValue = summary.hasSelections ? summary.totalOdds : 0
  const totalOddsLabel = summary.hasSelections ? summary.totalOddsLabel : formatBetslipOdd(0)
  const potentialWinCents = Math.round(stakeCents * totalOddsValue)
  const stakeLabel = formatMoney(stakeCents, { compactWhole: true })
  const potentialWinLabel = formatMoney(potentialWinCents)
  const hasSgp = selectionGroups.some((group) => group.selections.length > 1)
  const isLoggedOut = authVariant === 'logged-out'
  const shouldShowDepositPrompt = !isLoggedOut && requiresDeposit
  const isRemoveLocked = removingRowId !== null || removingLegId !== null

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

  const handleRemoveGroup = useCallback((groupId: string, selectionIds: string[]) => {
    if (
      removingRowId
      || removingLegId
      || rowRemoveTimerRef.current !== null
      || legRemoveTimerRef.current !== null
      || selectionIds.length === 0
    ) return

    setRemovingRowId(groupId)
    rowRemoveTimerRef.current = window.setTimeout(() => {
      selectionIds.forEach(removeSelection)
      setRemovingRowId(null)
      rowRemoveTimerRef.current = null
    }, SELECTION_REMOVE_ANIMATION_MS)
  }, [removeSelection, removingLegId, removingRowId])

  const handleRemoveSelection = useCallback((selectionId: string) => {
    if (
      removingRowId
      || removingLegId
      || rowRemoveTimerRef.current !== null
      || legRemoveTimerRef.current !== null
    ) return

    setRemovingRowId(selectionId)
    rowRemoveTimerRef.current = window.setTimeout(() => {
      removeSelection(selectionId)
      setRemovingRowId(null)
      rowRemoveTimerRef.current = null
    }, SELECTION_REMOVE_ANIMATION_MS)
  }, [removeSelection, removingLegId, removingRowId])

  const handleRemoveSgpLeg = useCallback((selectionId: string) => {
    if (
      removingRowId
      || removingLegId
      || rowRemoveTimerRef.current !== null
      || legRemoveTimerRef.current !== null
    ) return

    setRemovingLegId(selectionId)
    legRemoveTimerRef.current = window.setTimeout(() => {
      removeSelection(selectionId)
      setRemovingLegId(null)
      legRemoveTimerRef.current = null
    }, SGP_LEG_REMOVE_ANIMATION_MS)
  }, [removeSelection, removingLegId, removingRowId])

  const handleConfirm = useCallback(() => {
    if (!summary.hasSelections || selections.length === 0) {
      requestClose(clearSelections)
      return
    }

    const receipt: BetSuccessReceipt = {
      selections: selections.map((selection) => ({ ...selection })),
      stakeCents,
      totalOddsLabel,
      potentialWinLabel,
      createdAtMs: Date.now(),
    }

    requestClose(() => {
      clearSelections()
      onBetSuccess?.(receipt)
    })
  }, [
    clearSelections,
    onBetSuccess,
    potentialWinLabel,
    requestClose,
    selections,
    stakeCents,
    summary.hasSelections,
    totalOddsLabel,
  ])

  const handleTagInfoOpen = useCallback(() => {
    setIsTagInfoOpen(true)
  }, [])

  const handleTagInfoClose = useCallback(() => {
    setIsTagInfoOpen(false)
  }, [])

  useEffect(() => () => {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current)
    if (rowRemoveTimerRef.current !== null) window.clearTimeout(rowRemoveTimerRef.current)
    if (legRemoveTimerRef.current !== null) window.clearTimeout(legRemoveTimerRef.current)
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
    <>
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
                isRemoveDisabled={isRemoveLocked}
                isRemoving={removingRowId === group.eventId}
                onRemoveGroup={handleRemoveGroup}
                onRemoveSelection={handleRemoveSgpLeg}
                onTagInfoOpen={handleTagInfoOpen}
                removingSelectionId={removingLegId}
              />
            ) : (
              <SimpleSelectionRow
                key={group.selections[0].id}
                isRemoveDisabled={isRemoveLocked}
                isRemoving={removingRowId === group.selections[0].id}
                selection={group.selections[0]}
                onRemove={handleRemoveSelection}
                onTagInfoOpen={handleTagInfoOpen}
                showOdd={!hasSgp}
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

          <div className="betslip-v2__summary-item betslip-v2__summary-item--win" aria-label={`Para ganar ${potentialWinLabel}`}>
            <span className="betslip-v2__win-label">Para ganar</span>
            <div className="betslip-v2__win-field">
              <strong>{potentialWinLabel}</strong>
            </div>
          </div>
        </div>

        <button
          type="button"
          className={[
            'betslip-v2__odds-accept',
            acceptsOddsChanges ? 'betslip-v2__odds-accept--checked' : '',
          ].filter(Boolean).join(' ')}
          role="checkbox"
          aria-checked={acceptsOddsChanges}
          onClick={() => setAcceptsOddsChanges((current) => !current)}
        >
          <span className="betslip-v2__odds-accept-box" aria-hidden="true">
            {acceptsOddsChanges ? <span className="betslip-v2__odds-accept-check" /> : null}
          </span>
          <span className="betslip-v2__odds-accept-label">
            Aceitar sempre alterações nas odds para agilizar a criação do seu bilhete. <span>Saiba mais.</span>
          </span>
        </button>

        {isLoggedOut ? (
          <div className="betslip-v2__auth-prompt" aria-label="Acesse sua conta para apostar">
            <p>Quase lá! Entre ou crie uma conta para começar a jogar.</p>
            <div className="betslip-v2__auth-actions">
              <button
                type="button"
                className="betslip-v2__auth-action betslip-v2__auth-action--primary"
                onClick={onCreateAccountClick}
              >
                Criar conta
              </button>
              <button
                type="button"
                className="betslip-v2__auth-action betslip-v2__auth-action--secondary"
                onClick={onLoginClick}
              >
                Entrar
              </button>
            </div>
          </div>
        ) : shouldShowDepositPrompt ? (
          <div className="betslip-v2__deposit-prompt" aria-label="Adicione saldo para apostar">
            <p>Quase lá! Adicione saldo para começar a jogar.</p>
            <button
              type="button"
              className="betslip-v2__deposit-action"
              onClick={onDepositClick}
            >
              Depositar
            </button>
          </div>
        ) : (
          <SwipeButton stakeLabel={stakeLabel} onComplete={handleConfirm} />
        )}
        </footer>
      </main>
      <BetslipTagInfoBottomSheet isOpen={isTagInfoOpen} onClose={handleTagInfoClose} />
    </>
  )
}
