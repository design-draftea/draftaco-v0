import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import './BetSuccessPage.css'

import backgroundTextPitaco from '../../assets/iconsDraftaco/backgroundTextPitaco.svg'
import iconBetslipAumentada from '../../assets/iconsDraftaco/iconBetslipAumentada.svg'
import iconBetslipGarantida from '../../assets/iconsDraftaco/iconBetslipGarantida.svg'
import iconBetslipSuperAumentada from '../../assets/iconsDraftaco/iconBetslipSuperAumentada.svg'
import iconShieldVersusPlaceholder from '../../assets/iconsDraftaco/iconShieldVersusPlaceholder.svg'
import ilustraApostaCriada from '../../assets/iconsDraftaco/ilustraApostaCriada.png'
import imgAdebayoPromo from '../../assets/iconsDraftaco/imgAdebayoPromo.png'
import imgDembelePromo from '../../assets/iconsDraftaco/imgDembelePromo.png'
import lewandowskiCard from '../../assets/iconsDraftaco/LewandowskiCard.png'
import logoPitacoApostaCriada from '../../assets/iconsDraftaco/logoPitacoApostaCriada.svg'
import { getTeamLogo } from '../../data/teamLogos'
import { useSportsDbTeamLogo } from '../../hooks/useSportsDbTeamLogo'
import { getTeamAbbreviation } from '../../utils/teamAbbreviations'
import { TEAM_LOGO_FALLBACK } from '../../utils/teamLogoFallback'
import {
  normalizeBetslipIdPart,
  type BetslipPromoVariant,
  type BetslipSelection,
} from '../../hooks/betslipUtils'
import {
  formatMoney,
  getPlayerAvatarFallbackSrc,
  getPlayerSelectionValueLabel,
  getSelectionAvatarDrawContext,
  getSelectionAvatarFallback,
  getSelectionAvatarTeamContext,
  getSelectionBadges,
  getSelectionEventTeams,
  getSelectionEventMeta,
  getSelectionMarketLabel,
  getSelectionScoreLabel,
  getSelectionTeamSuffix,
  getSelectionTimeLabel,
  getSelectionTitle,
  groupSelectionsByEvent,
  isDrawSelection,
  type BetslipSelectionGroup,
} from '../BetslipPageV2/betslipDisplayUtils'

export interface BetSuccessReceipt {
  selections: BetslipSelection[]
  stakeCents: number
  totalOddsLabel: string
  potentialWinLabel: string
  createdAtMs: number
}

interface BetSuccessPageProps {
  receipt: BetSuccessReceipt
  onNewBet: () => void
  onShare?: () => void
}

const resultFinalMarketKeys = new Set([
  'resultado-final',
  'resultado-final-pagamento-antecipado',
  '1x2',
  'vencer',
  'vencedor',
  'vencedor-pagamento-antecipado',
])

const resultFinalBadgeOrder = ['90’', 'PA', 'B+']
const promoIconByVariant: Record<BetslipPromoVariant, string> = {
  garantida: iconBetslipGarantida,
  aumentada: iconBetslipAumentada,
  'super-aumentada': iconBetslipSuperAumentada,
}
const promoPlayerImageFallbackByVariant: Record<BetslipPromoVariant, string> = {
  garantida: lewandowskiCard,
  aumentada: imgDembelePromo,
  'super-aumentada': imgAdebayoPromo,
}
const promoVariantClassNameByVariant: Record<BetslipPromoVariant, string> = {
  garantida: 'bet-success__selection-title--promo-garantida',
  aumentada: 'bet-success__selection-title--promo-aumentada',
  'super-aumentada': 'bet-success__selection-title--promo-super-aumentada',
}
const pullDismissThresholdPx = 96
const pullDismissAnimationMs = 260
const pullMaxPreviewOffsetPx = 180
const ticketFrameCornerRadiusPx = 24
const ticketFrameNotchCenterYPx = 122
const ticketFrameNotchRadiusPx = 20
const ticketFrameStrokeWidthPx = 4

interface BetSuccessPullState {
  hasMoved: boolean
  pointerId: number
  startY: number
}

interface BetSuccessTicketFrameSize {
  height: number
  width: number
}

const getTicketFramePath = ({ height, width }: BetSuccessTicketFrameSize) => {
  if (height <= 0 || width <= 0) return ''

  const inset = ticketFrameStrokeWidthPx / 2
  const left = inset
  const top = inset
  const right = width - inset
  const bottom = height - inset
  const cornerRadius = Math.min(
    ticketFrameCornerRadiusPx,
    (right - left) / 2,
    (bottom - top) / 2
  )
  const notchRadius = Math.min(
    ticketFrameNotchRadiusPx,
    Math.max(0, (bottom - top - (cornerRadius * 2)) / 2)
  )
  const notchCenterY = Math.min(
    Math.max(ticketFrameNotchCenterYPx, top + cornerRadius + notchRadius),
    bottom - cornerRadius - notchRadius
  )
  const notchTop = notchCenterY - notchRadius
  const notchBottom = notchCenterY + notchRadius

  return [
    `M ${left + cornerRadius} ${top}`,
    `H ${right - cornerRadius}`,
    `Q ${right} ${top} ${right} ${top + cornerRadius}`,
    `V ${notchTop}`,
    `A ${notchRadius} ${notchRadius} 0 0 0 ${right} ${notchBottom}`,
    `V ${bottom - cornerRadius}`,
    `Q ${right} ${bottom} ${right - cornerRadius} ${bottom}`,
    `H ${left + cornerRadius}`,
    `Q ${left} ${bottom} ${left} ${bottom - cornerRadius}`,
    `V ${notchBottom}`,
    `A ${notchRadius} ${notchRadius} 0 0 0 ${left} ${notchTop}`,
    `V ${top + cornerRadius}`,
    `Q ${left} ${top} ${left + cornerRadius} ${top}`,
    'Z',
  ].join(' ')
}

const isResultFinalSelection = (selection: BetslipSelection) => {
  const marketKey = normalizeBetslipIdPart(selection.marketLabel || selection.marketId)
  const marketIdKey = normalizeBetslipIdPart(selection.marketId)

  return resultFinalMarketKeys.has(marketKey) || resultFinalMarketKeys.has(marketIdKey)
}

const getOrderedResultFinalBadges = (selection: BetslipSelection) => {
  const badges = getSelectionBadges(selection)
  const orderedBadges = resultFinalBadgeOrder.filter((badge) => badges.includes(badge))
  const remainingBadges = badges.filter((badge) => !resultFinalBadgeOrder.includes(badge))

  return [...orderedBadges, ...remainingBadges]
}

const isSelectedResultFinalTeam = (selection: BetslipSelection, teamName: string) => (
  normalizeBetslipIdPart(getSelectionTitle(selection)) === normalizeBetslipIdPart(teamName)
)

const parseResultFinalScore = (score: BetslipSelection['homeScore']) => {
  if (score === undefined || score === null) return null
  if (typeof score === 'string' && !score.trim()) return null

  const numericScore = Number(score)
  return Number.isFinite(numericScore) ? numericScore : null
}

const isPlayerAvatarLogo = (logo?: string) => Boolean(logo?.includes('playerAvatar'))

const getResultFinalTeamLogo = (teamName: string, logo?: string) => (
  getTeamLogo(teamName) ?? (isPlayerAvatarLogo(logo) ? undefined : logo)
)

const getSelectionPromoVariant = (selection: BetslipSelection): BetslipPromoVariant | null => {
  if (selection.promoVariant) return selection.promoVariant

  const normalizedValues = [
    selection.marketId,
    selection.comboTypeLabel,
    selection.comboTitle,
    selection.marketLabel,
    selection.id,
  ].map((value) => normalizeBetslipIdPart(value ?? ''))

  if (normalizedValues.some((value) => value.includes('super-aumentada'))) return 'super-aumentada'
  if (normalizedValues.some((value) => value.includes('aumentada'))) return 'aumentada'
  if (normalizedValues.some((value) => value.includes('garantida'))) return 'garantida'

  return null
}

const getPullPreviewOffset = (deltaY: number) => {
  if (deltaY <= 0) return 0
  if (deltaY <= pullDismissThresholdPx) return deltaY

  return Math.min(
    pullMaxPreviewOffsetPx,
    pullDismissThresholdPx + ((deltaY - pullDismissThresholdPx) * 0.38)
  )
}

const getResultFinalLiveStatus = (
  selection: BetslipSelection,
  homeTeam: string,
  awayTeam: string
) => {
  const homeScore = parseResultFinalScore(selection.homeScore)
  const awayScore = parseResultFinalScore(selection.awayScore)

  if (homeScore === null || awayScore === null) return null

  const isDraw = isDrawSelection(selection)
  const isHomeSelected = !isDraw && isSelectedResultFinalTeam(selection, homeTeam)
  const isAwaySelected = !isDraw && isSelectedResultFinalTeam(selection, awayTeam)
  const isHit = (
    (homeScore > awayScore && isHomeSelected)
    || (awayScore > homeScore && isAwaySelected)
    || (homeScore === awayScore && isDraw)
  )

  return {
    state: isHit ? 'hit' : 'miss',
    isDraw,
    isHomeSelected,
    isAwaySelected,
  } as const
}

function BetSuccessSelectionAvatar({
  promoVariant = null,
  selection,
}: {
  promoVariant?: BetslipPromoVariant | null
  selection: BetslipSelection
}) {
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
    ? selection.playerImage || (promoVariant ? promoPlayerImageFallbackByVariant[promoVariant] : undefined) || getPlayerAvatarFallbackSrc(selection)
    : resolvedTeamLogo || teamContext?.fallbackLogo || getSelectionAvatarFallback(selection)

  if (drawContext) {
    const hasVersusTeamLogos = Boolean(resolvedDrawHomeLogo && resolvedDrawAwayLogo)

    return (
      <span className="bet-success__selection-avatar bet-success__selection-avatar--versus" aria-hidden="true">
        {hasVersusTeamLogos ? (
          <span className="bet-success__avatar-stack">
            <img
              className="bet-success__avatar-stack-logo bet-success__avatar-stack-logo--home"
              src={resolvedDrawHomeLogo}
              alt=""
              draggable="false"
            />
            <img
              className="bet-success__avatar-stack-logo bet-success__avatar-stack-logo--away"
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
        'bet-success__selection-avatar',
        isPlayerSelection ? 'bet-success__selection-avatar--player' : '',
        promoVariant ? 'bet-success__selection-avatar--promo' : '',
      ].filter(Boolean).join(' ')}
      aria-hidden="true"
    >
      <img src={iconSrc} alt="" draggable="false" />
    </span>
  )
}

function BetSuccessTicketFrame() {
  const frameRef = useRef<SVGSVGElement | null>(null)
  const [frameSize, setFrameSize] = useState<BetSuccessTicketFrameSize>({ height: 0, width: 0 })
  const path = getTicketFramePath(frameSize)

  useEffect(() => {
    const node = frameRef.current
    if (!node) return undefined

    const updateFrameSize = () => {
      const rect = node.getBoundingClientRect()
      const nextSize = {
        height: Math.round(rect.height),
        width: Math.round(rect.width),
      }

      setFrameSize((currentSize) => (
        currentSize.height === nextSize.height && currentSize.width === nextSize.width
          ? currentSize
          : nextSize
      ))
    }

    updateFrameSize()

    if (!window.ResizeObserver) {
      window.addEventListener('resize', updateFrameSize)
      return () => window.removeEventListener('resize', updateFrameSize)
    }

    const observer = new ResizeObserver(updateFrameSize)
    observer.observe(node)

    return () => observer.disconnect()
  }, [])

  return (
    <svg
      ref={frameRef}
      className="bet-success__ticket-frame"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="none"
      viewBox={`0 0 ${Math.max(frameSize.width, 1)} ${Math.max(frameSize.height, 1)}`}
    >
      {path ? <path d={path} /> : null}
    </svg>
  )
}

function BetSuccessResultFinalLiveTeamRow({
  isSelected,
  logo,
  score,
  selection,
  teamName,
}: {
  isSelected: boolean
  logo?: string
  score: string
  selection: BetslipSelection
  teamName: string
}) {
  const currentLogo = getResultFinalTeamLogo(teamName, logo)
  const resolvedLogo = useSportsDbTeamLogo(
    teamName,
    currentLogo,
    selection.sport ?? '',
    TEAM_LOGO_FALLBACK,
    { useCurrentLogoFallback: true }
  )

  return (
    <div className="bet-success__result-live-team">
      <span className="bet-success__result-team-icon" aria-hidden="true">
        <img src={resolvedLogo || currentLogo || TEAM_LOGO_FALLBACK} alt="" draggable="false" />
      </span>
      <span
        className={[
          'bet-success__result-live-team-copy',
          isSelected ? 'bet-success__result-live-team-copy--selected' : '',
        ].filter(Boolean).join(' ')}
      >
        <span className="bet-success__result-team-name">{teamName}</span>
        <strong className="bet-success__result-live-score">{score}</strong>
      </span>
    </div>
  )
}

function BetSuccessResultFinalTeamRow({
  isSelected,
  logo,
  selection,
  teamName,
}: {
  isSelected: boolean
  logo?: string
  selection: BetslipSelection
  teamName: string
}) {
  const currentLogo = getResultFinalTeamLogo(teamName, logo)
  const resolvedLogo = useSportsDbTeamLogo(
    teamName,
    currentLogo,
    selection.sport ?? '',
    TEAM_LOGO_FALLBACK,
    { useCurrentLogoFallback: true }
  )

  return (
    <div className="bet-success__result-team">
      <span className="bet-success__result-team-icon" aria-hidden="true">
        <img src={resolvedLogo || currentLogo || TEAM_LOGO_FALLBACK} alt="" draggable="false" />
      </span>
      <span
        className={[
          'bet-success__result-team-name',
          isSelected ? 'bet-success__result-team-name--selected' : '',
        ].filter(Boolean).join(' ')}
      >
        {teamName}
      </span>
    </div>
  )
}

function BetSuccessResultFinalLiveSelectionRow({
  awayTeam,
  homeTeam,
  selection,
}: {
  awayTeam: string
  homeTeam: string
  selection: BetslipSelection
}) {
  const liveStatus = getResultFinalLiveStatus(selection, homeTeam, awayTeam)
  const badges = getOrderedResultFinalBadges(selection)
  const title = getSelectionTitle(selection)

  if (!liveStatus) return <BetSuccessResultFinalPrematchSelectionRow selection={selection} />

  const isDrawHit = liveStatus.isDraw && liveStatus.state === 'hit'
  const visibleBadges = isDrawHit
    ? badges.filter((badge) => badge === '90’')
    : badges

  return (
    <article
      className={[
        'bet-success__selection-row',
        'bet-success__selection-row--result-final',
        'bet-success__selection-row--result-final-live',
        `bet-success__selection-row--result-final-live-${liveStatus.state}`,
      ].join(' ')}
    >
      <div className="bet-success__result-live-meta">
        <span className="bet-success__result-live-label">
          <span className="bet-success__result-live-dot-wrap" aria-hidden="true">
            <span className="bet-success__result-live-dot" />
          </span>
          <span>AO VIVO</span>
        </span>
        <span className="bet-success__result-live-clock">{getSelectionTimeLabel(selection)}</span>
      </div>
      <div className="bet-success__result-selection-line">
        <div className="bet-success__result-selection-main">
          <span className="bet-success__result-market">
            {isDrawHit ? 'EMPATE' : getSelectionMarketLabel(selection)}
          </span>
          {visibleBadges.map((badge) => (
            <em className="bet-success__selection-badge" key={badge}>{badge}</em>
          ))}
          {isDrawHit ? null : (
            <strong
              className={[
                'bet-success__result-choice',
                `bet-success__result-choice--${liveStatus.state}`,
              ].join(' ')}
            >
              {title}
            </strong>
          )}
        </div>
        <strong className="bet-success__result-odd">{selection.oddLabel}</strong>
      </div>
      <div
        className="bet-success__result-live-match"
        aria-label={`Placar ${getSelectionScoreLabel(selection.homeScore)} a ${getSelectionScoreLabel(selection.awayScore)}`}
      >
        <div className="bet-success__result-live-teams">
          <BetSuccessResultFinalLiveTeamRow
            isSelected={liveStatus.isHomeSelected}
            logo={selection.homeTeamIcon}
            score={getSelectionScoreLabel(selection.homeScore)}
            selection={selection}
            teamName={homeTeam}
          />
          <BetSuccessResultFinalLiveTeamRow
            isSelected={liveStatus.isAwaySelected}
            logo={selection.awayTeamIcon}
            score={getSelectionScoreLabel(selection.awayScore)}
            selection={selection}
            teamName={awayTeam}
          />
        </div>
        <div className="bet-success__result-live-status-bars" aria-hidden="true">
          {isDrawHit ? (
            <>
              <span className="bet-success__result-live-status-bar bet-success__result-live-status-bar--active bet-success__result-live-status-bar--hit" />
              <span className="bet-success__result-live-status-bar bet-success__result-live-status-bar--active bet-success__result-live-status-bar--hit" />
            </>
          ) : liveStatus.isDraw ? (
            <span
              className={[
                'bet-success__result-live-status-bar',
                'bet-success__result-live-status-bar--active',
                `bet-success__result-live-status-bar--${liveStatus.state}`,
                'bet-success__result-live-status-bar--draw',
              ].join(' ')}
            />
          ) : (
            <>
              <span
                className={[
                  'bet-success__result-live-status-bar',
                  liveStatus.isHomeSelected ? 'bet-success__result-live-status-bar--active' : '',
                  liveStatus.isHomeSelected ? `bet-success__result-live-status-bar--${liveStatus.state}` : '',
                ].filter(Boolean).join(' ')}
              />
              <span
                className={[
                  'bet-success__result-live-status-bar',
                  liveStatus.isAwaySelected ? 'bet-success__result-live-status-bar--active' : '',
                  liveStatus.isAwaySelected ? `bet-success__result-live-status-bar--${liveStatus.state}` : '',
                ].filter(Boolean).join(' ')}
              />
            </>
          )}
        </div>
      </div>
    </article>
  )
}

function BetSuccessResultFinalPrematchSelectionRow({ selection }: { selection: BetslipSelection }) {
  const badges = getOrderedResultFinalBadges(selection)
  const title = getSelectionTitle(selection)
  const { homeTeam, awayTeam } = getSelectionEventTeams(selection)
  const isDraw = isDrawSelection(selection)
  const visibleBadges = isDraw ? badges.filter((badge) => badge === '90’') : badges

  if (!homeTeam || !awayTeam) return <BetSuccessDefaultSelectionRow selection={selection} />

  if (isDraw) {
    return (
      <article className="bet-success__selection-row bet-success__selection-row--result-final">
        <div className="bet-success__selection-meta">{getSelectionTimeLabel(selection)}</div>
        <div className="bet-success__result-selection-line">
          <div className="bet-success__result-selection-main">
            <span className="bet-success__result-market">EMPATE</span>
            {visibleBadges.map((badge) => (
              <em className="bet-success__selection-badge" key={badge}>{badge}</em>
            ))}
          </div>
        </div>
        <div className="bet-success__result-match">
          <BetSuccessResultFinalTeamRow
            isSelected={false}
            logo={selection.homeTeamIcon}
            selection={selection}
            teamName={homeTeam}
          />
          <BetSuccessResultFinalTeamRow
            isSelected={false}
            logo={selection.awayTeamIcon}
            selection={selection}
            teamName={awayTeam}
          />
        </div>
      </article>
    )
  }

  return (
    <article className="bet-success__selection-row bet-success__selection-row--result-final">
      <div className="bet-success__selection-meta">{getSelectionTimeLabel(selection)}</div>
      <div className="bet-success__result-selection-line">
        <div className="bet-success__result-selection-main">
          <span className="bet-success__result-market">{getSelectionMarketLabel(selection)}</span>
          {visibleBadges.map((badge) => (
            <em className="bet-success__selection-badge" key={badge}>{badge}</em>
          ))}
          <strong className="bet-success__result-choice">{title}</strong>
        </div>
        <strong className="bet-success__result-odd">{selection.oddLabel}</strong>
      </div>
      <div className="bet-success__result-match">
        <BetSuccessResultFinalTeamRow
          isSelected={isSelectedResultFinalTeam(selection, homeTeam)}
          logo={selection.homeTeamIcon}
          selection={selection}
          teamName={homeTeam}
        />
        <BetSuccessResultFinalTeamRow
          isSelected={isSelectedResultFinalTeam(selection, awayTeam)}
          logo={selection.awayTeamIcon}
          selection={selection}
          teamName={awayTeam}
        />
      </div>
    </article>
  )
}

function BetSuccessResultFinalSelectionRow({ selection }: { selection: BetslipSelection }) {
  const { homeTeam, awayTeam } = getSelectionEventTeams(selection)

  if (!homeTeam || !awayTeam) return <BetSuccessDefaultSelectionRow selection={selection} />

  if (selection.eventStatus === 'live') {
    return (
      <BetSuccessResultFinalLiveSelectionRow
        awayTeam={awayTeam}
        homeTeam={homeTeam}
        selection={selection}
      />
    )
  }

  return <BetSuccessResultFinalPrematchSelectionRow selection={selection} />
}

function BetSuccessTitleLine({
  promoVariant = null,
  selection,
}: {
  promoVariant?: BetslipPromoVariant | null
  selection: BetslipSelection
}) {
  const title = getSelectionTitle(selection)
  const teamSuffix = getSelectionTeamSuffix(selection)
  const playerChoice = getPlayerSelectionValueLabel(selection)
  const promoIcon = promoVariant ? promoIconByVariant[promoVariant] : null

  return (
    <div
      className={[
        'bet-success__selection-title',
        promoVariant ? 'bet-success__selection-title--promo' : '',
        promoVariant ? promoVariantClassNameByVariant[promoVariant] : '',
      ].filter(Boolean).join(' ')}
    >
      <strong className={promoVariant ? 'bet-success__promo-gradient-text' : undefined}>{title}</strong>
      {teamSuffix ? <span>{teamSuffix}</span> : null}
      {playerChoice ? (
        <>
          <span aria-hidden="true">|</span>
          <strong className={promoVariant ? 'bet-success__promo-gradient-text' : undefined}>{playerChoice}</strong>
          {promoIcon ? (
            <img className="bet-success__promo-value-icon" src={promoIcon} alt="" aria-hidden="true" />
          ) : null}
        </>
      ) : null}
    </div>
  )
}

function BetSuccessSelectionMeta({
  prematchLabel,
  selection,
}: {
  prematchLabel?: string
  selection: BetslipSelection
}) {
  if (selection.eventStatus !== 'live') {
    return <div className="bet-success__selection-meta">{prematchLabel ?? getSelectionEventMeta(selection)}</div>
  }

  const { homeTeam, awayTeam } = getSelectionEventTeams(selection)
  if (!homeTeam || !awayTeam) {
    return <div className="bet-success__selection-meta">{getSelectionEventMeta(selection)}</div>
  }

  return (
    <div className="bet-success__result-live-meta bet-success__selection-live-meta">
      <span className="bet-success__result-live-label">
        <span className="bet-success__result-live-dot-wrap" aria-hidden="true">
          <span className="bet-success__result-live-dot" />
        </span>
        <span>AO VIVO</span>
      </span>
      <span className="bet-success__selection-live-clock">{getSelectionTimeLabel(selection)}</span>
      <span className="bet-success__selection-live-separator" aria-hidden="true">•</span>
      <span className="bet-success__selection-live-matchup">
        {`${getTeamAbbreviation(homeTeam)} (${getSelectionScoreLabel(selection.homeScore)}) vs (${getSelectionScoreLabel(selection.awayScore)}) ${getTeamAbbreviation(awayTeam)}`}
      </span>
    </div>
  )
}

function BetSuccessDefaultSelectionRow({ selection }: { selection: BetslipSelection }) {
  const badges = getSelectionBadges(selection)
  const promoVariant = getSelectionPromoVariant(selection)

  return (
    <article className="bet-success__selection-row">
      <BetSuccessSelectionMeta selection={selection} />
      <div className="bet-success__selection-body">
        <BetSuccessSelectionAvatar promoVariant={promoVariant} selection={selection} />
        <div className="bet-success__selection-copy">
          <div className="bet-success__market-line">
            <span>{getSelectionMarketLabel(selection)}</span>
            {badges.map((badge) => <em key={badge}>{badge}</em>)}
          </div>
          <BetSuccessTitleLine promoVariant={promoVariant} selection={selection} />
        </div>
        <strong className="bet-success__selection-odd">{selection.oddLabel}</strong>
      </div>
    </article>
  )
}

function BetSuccessSelectionRow({ selection }: { selection: BetslipSelection }) {
  if (isResultFinalSelection(selection)) {
    return <BetSuccessResultFinalSelectionRow selection={selection} />
  }

  return <BetSuccessDefaultSelectionRow selection={selection} />
}

const getGroupedHeaderSelection = (selections: BetslipSelection[]) => (
  selections.find(isResultFinalSelection) ?? selections[0]
)

const isGroupedTeamSelected = (selections: BetslipSelection[], teamName: string) => (
  selections.some((selection) => isResultFinalSelection(selection) && isSelectedResultFinalTeam(selection, teamName))
)

function BetSuccessGroupedSelectionLeg({ selection }: { selection: BetslipSelection }) {
  const badges = getSelectionBadges(selection)
  const promoVariant = getSelectionPromoVariant(selection)

  return (
    <article className="bet-success__group-leg">
      <BetSuccessSelectionAvatar promoVariant={promoVariant} selection={selection} />
      <div className="bet-success__group-leg-copy">
        <div className="bet-success__market-line">
          <span>{getSelectionMarketLabel(selection)}</span>
          {badges.map((badge) => <em className="bet-success__selection-badge" key={badge}>{badge}</em>)}
        </div>
        <BetSuccessTitleLine promoVariant={promoVariant} selection={selection} />
      </div>
    </article>
  )
}

function BetSuccessGroupedSelectionRow({ group }: { group: BetslipSelectionGroup }) {
  const headerSelection = getGroupedHeaderSelection(group.selections)
  const { homeTeam, awayTeam } = getSelectionEventTeams(headerSelection)

  if (!homeTeam || !awayTeam) {
    return (
      <>
        {group.selections.map((selection) => (
          <BetSuccessSelectionRow key={selection.id} selection={selection} />
        ))}
      </>
    )
  }

  return (
    <article className="bet-success__selection-row bet-success__selection-row--grouped">
      <BetSuccessSelectionMeta
        prematchLabel={getSelectionTimeLabel(headerSelection)}
        selection={headerSelection}
      />
      <div className="bet-success__group-match">
        <BetSuccessResultFinalTeamRow
          isSelected={isGroupedTeamSelected(group.selections, homeTeam)}
          logo={headerSelection.homeTeamIcon}
          selection={headerSelection}
          teamName={homeTeam}
        />
        <BetSuccessResultFinalTeamRow
          isSelected={isGroupedTeamSelected(group.selections, awayTeam)}
          logo={headerSelection.awayTeamIcon}
          selection={headerSelection}
          teamName={awayTeam}
        />
      </div>
      <div className="bet-success__group-legs">
        <span className="bet-success__group-rail" aria-hidden="true" />
        <div className="bet-success__group-leg-list">
          {group.selections.map((selection) => (
            <BetSuccessGroupedSelectionLeg key={selection.id} selection={selection} />
          ))}
        </div>
      </div>
    </article>
  )
}

function BetSuccessSelectionGroupRow({ group }: { group: BetslipSelectionGroup }) {
  if (group.selections.length > 1) {
    return <BetSuccessGroupedSelectionRow group={group} />
  }

  return <BetSuccessSelectionRow selection={group.selections[0]} />
}

export function BetSuccessPage({ receipt, onNewBet, onShare }: BetSuccessPageProps) {
  const stakeLabel = formatMoney(receipt.stakeCents)
  const selectionGroups = useMemo(() => groupSelectionsByEvent(receipt.selections), [receipt.selections])
  const [pullOffset, setPullOffset] = useState(0)
  const [isPulling, setIsPulling] = useState(false)
  const [isDismissing, setIsDismissing] = useState(false)
  const pullRef = useRef<BetSuccessPullState | null>(null)
  const dismissTimerRef = useRef<number | null>(null)
  const dragFrameStyle = {
    '--bet-success-pull-offset': `${pullOffset}px`,
  } as CSSProperties

  const clearDismissTimer = useCallback(() => {
    if (dismissTimerRef.current === null) return

    window.clearTimeout(dismissTimerRef.current)
    dismissTimerRef.current = null
  }, [])

  const dismissWithPullAnimation = useCallback(() => {
    if (isDismissing) return

    clearDismissTimer()
    pullRef.current = null
    setIsPulling(false)
    setIsDismissing(true)
    setPullOffset(window.innerHeight + 120)
    dismissTimerRef.current = window.setTimeout(() => {
      dismissTimerRef.current = null
      onNewBet()
    }, pullDismissAnimationMs)
  }, [clearDismissTimer, isDismissing, onNewBet])

  const resetPullPosition = useCallback(() => {
    pullRef.current = null
    setIsPulling(false)
    setPullOffset(0)
  }, [])

  const handlePullPointerDown = useCallback((event: PointerEvent<HTMLButtonElement>) => {
    if (isDismissing) return
    if (event.pointerType === 'mouse' && event.button !== 0) return

    pullRef.current = {
      hasMoved: false,
      pointerId: event.pointerId,
      startY: event.clientY,
    }
    setIsPulling(true)
    setPullOffset(0)
    event.currentTarget.setPointerCapture(event.pointerId)
  }, [isDismissing])

  const handlePullPointerMove = useCallback((event: PointerEvent<HTMLButtonElement>) => {
    const pullState = pullRef.current

    if (!pullState || pullState.pointerId !== event.pointerId || isDismissing) return

    const offset = getPullPreviewOffset(event.clientY - pullState.startY)
    pullState.hasMoved = pullState.hasMoved || offset > 4
    setPullOffset(offset)

    if (offset > 0) event.preventDefault()
  }, [isDismissing])

  const finishPullGesture = useCallback((event: PointerEvent<HTMLButtonElement>) => {
    const pullState = pullRef.current

    if (!pullState || pullState.pointerId !== event.pointerId) return

    const deltaY = event.clientY - pullState.startY
    const shouldDismiss = deltaY >= pullDismissThresholdPx

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    if (shouldDismiss) {
      dismissWithPullAnimation()
      return
    }

    resetPullPosition()
  }, [dismissWithPullAnimation, resetPullPosition])

  const cancelPullGesture = useCallback((event: PointerEvent<HTMLButtonElement>) => {
    const pullState = pullRef.current

    if (pullState && event.currentTarget.hasPointerCapture(pullState.pointerId)) {
      event.currentTarget.releasePointerCapture(pullState.pointerId)
    }

    resetPullPosition()
  }, [resetPullPosition])

  const handleNewBetClick = useCallback(() => {
    dismissWithPullAnimation()
  }, [dismissWithPullAnimation])

  useEffect(() => () => {
    clearDismissTimer()
  }, [clearDismissTimer])

  return (
    <main
      className={[
        'bet-success',
        isPulling ? 'bet-success--pulling' : '',
        isDismissing ? 'bet-success--dismissing' : '',
      ].filter(Boolean).join(' ')}
      aria-labelledby="bet-success-title"
    >
      <div className="bet-success__backdrop" aria-hidden="true" />
      <div className="bet-success__drag-frame" style={dragFrameStyle}>
        <div className="bet-success__top-light" aria-hidden="true" />
        <div className="bet-success__background-text" aria-hidden="true">
          <img src={backgroundTextPitaco} alt="" draggable="false" />
        </div>
        <button
          type="button"
          className="bet-success__pull-handle"
          aria-label="Puxar para fechar"
          onPointerCancel={cancelPullGesture}
          onPointerDown={handlePullPointerDown}
          onPointerMove={handlePullPointerMove}
          onPointerUp={finishPullGesture}
        >
          <span aria-hidden="true" />
        </button>

        <div className="bet-success__scroll">
          <section className="bet-success__surface" aria-label="Aposta criada">
            <div className="bet-success__ticket">
              <BetSuccessTicketFrame />
              <header className="bet-success__overview">
                <div className="bet-success__overview-copy">
                  <h1 id="bet-success-title">APOSTA CRIADA!</h1>
                  <div className="bet-success__win-row">
                    <strong>{receipt.potentialWinLabel}</strong>
                    <span>Ganho potencial</span>
                  </div>
                  <div className="bet-success__overview-meta">
                    <span>Entrada: <strong>{stakeLabel}</strong></span>
                    <span>Odds: <strong>{receipt.totalOddsLabel}</strong></span>
                  </div>
                </div>
                <img className="bet-success__success-art" src={ilustraApostaCriada} alt="" draggable="false" />
              </header>

              <div className="bet-success__separator" aria-hidden="true">
                <span />
                <img src={logoPitacoApostaCriada} alt="" draggable="false" />
                <span />
              </div>

              <section className="bet-success__selections" aria-label="Seleções da aposta">
                {selectionGroups.map((group) => (
                  <BetSuccessSelectionGroupRow key={group.eventId} group={group} />
                ))}
              </section>
            </div>
          </section>
        </div>

        <footer className="bet-success__footer">
          <button
            type="button"
            className="bet-success__button bet-success__button--primary"
            disabled={isDismissing}
            onClick={onShare}
          >
            Compartilhar
          </button>
          <button
            type="button"
            className="bet-success__button bet-success__button--secondary"
            disabled={isDismissing}
            onClick={handleNewBetClick}
          >
            Fazer outra aposta
          </button>
        </footer>
      </div>
    </main>
  )
}
