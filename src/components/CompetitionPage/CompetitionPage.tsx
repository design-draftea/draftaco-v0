import { useCallback, useMemo, useState } from 'react'
import {
  CalendarSection,
  getCalendarDisplayedEventGroups,
  getCalendarMarketChipsForSport,
  getCalendarPlayerPropsForEvent,
  getCompetitionLiveEventMatch,
  getCompetitionLiveEventOpenPayload,
  isCalendarPlayerPropsMarketForSport,
  type CompetitionEvent,
  type DisplayedCompetitionEventGroup,
} from '../CalendarSection'
import { HomeCompetitionSection, type HomeCompetitionMatchGroup } from '../HomeCompetitionSection'
import { ContentFilterChips } from '../ContentFilterChips'
import type { LiveEventOpenPayload } from '../../pages/LiveEventPage'
import type {
  HomeCompetitionHighlight,
  HomeCompetitionMarketChip,
  HomeCompetitionMatch,
  HomeCompetitionOdd,
  HomeCompetitionPlayerProp,
} from '../../types/home'
import type { CompetitionLinkTarget } from '../../utils/competitionNavigation'

interface CompetitionPageProps {
  sport: string
  competitionId: string
  liveOnly?: boolean
  onLiveMatchClick?: (payload: LiveEventOpenPayload) => void
  onOpenCompetition?: (target: CompetitionLinkTarget) => void
}

type SupportedCompetitionSport = HomeCompetitionMatch['sport']

interface CompetitionHighlightView {
  competition: HomeCompetitionHighlight
  matchGroups: HomeCompetitionMatchGroup[]
}

const supportedCompetitionSports = new Set<string>(['futebol', 'basquete'])

const isSupportedCompetitionSport = (sport?: string | null): sport is SupportedCompetitionSport => (
  !!sport && supportedCompetitionSports.has(sport)
)

const getSportLabel = (sport: SupportedCompetitionSport) => (
  sport === 'basquete' ? 'Basquete' : 'Futebol'
)

const getTeamOddLabel = (teamName: string) => {
  const words = teamName.split(/\s+/).filter(Boolean)
  const baseLabel = words.length > 1
    ? words.map((word) => word[0]).join('')
    : teamName

  return baseLabel.replace(/[^a-z0-9]/gi, '').slice(0, 3).toUpperCase() ||
    teamName.slice(0, 3).toUpperCase()
}

const basketballCompetitionMarketChips: HomeCompetitionMarketChip[] = [
  { id: 'principais', label: 'Principais' },
  { id: 'pontos-jogador', label: 'Pontos de jogador' },
  { id: 'q1', label: '1º Quarto' },
  { id: 'q2', label: '2º Quarto' },
  { id: 'assistencias', label: 'Assistências' },
]

const getCompetitionMarketChips = (
  sport: SupportedCompetitionSport,
  liveOnly: boolean
): HomeCompetitionMarketChip[] => {
  const sourceChips = sport === 'basquete'
    ? basketballCompetitionMarketChips
    : getCalendarMarketChipsForSport(sport)

  return sourceChips
    .filter((chip) => !liveOnly || !isCalendarPlayerPropsMarketForSport(sport, chip.id))
    .map((chip) => (
      sport === 'basquete' && chip.id === 'vencedor'
        ? { id: 'principais', label: 'Principais' }
        : chip
    ))
}

const getCompetitionPlayerPropOdds = (
  options: ReturnType<typeof getCalendarPlayerPropsForEvent>[number]['options']
): HomeCompetitionPlayerProp['odds'] => {
  const fallbackOption = options[0] ?? { label: '-', odd: '-' }
  const odds = options.slice(0, 3).map((option) => ({
    label: option.label,
    value: option.odd,
  }))

  while (odds.length < 3) {
    odds.push({ label: fallbackOption.label, value: fallbackOption.odd })
  }

  return odds as HomeCompetitionPlayerProp['odds']
}

const getInitialMatchTimes = (groups: DisplayedCompetitionEventGroup[]) =>
  groups.reduce<Record<string, string>>((times, { events }) => {
    events.forEach((event) => {
      if (event.isLive) times[event.id] = event.dateTime
    })

    return times
  }, {})

const getBasketballMarketColumns = (
  event: CompetitionEvent,
  match: ReturnType<typeof getCompetitionLiveEventMatch>
): HomeCompetitionMatch['marketColumns'] => {
  const homeLabel = getTeamOddLabel(event.homeName)
  const awayLabel = getTeamOddLabel(event.awayName)
  const totalPointsLine = match.totalPointsOdds?.line ?? 212.5
  const fallbackHandicapLine = Math.max(1.5, Math.abs((event.homeScore ?? 0) - (event.awayScore ?? 0)) + 1.5)
  const handicapLine = Math.abs(match.handicapOdds?.line ?? fallbackHandicapLine)

  return [
    {
      label: 'Vencer',
      homeOdd: { label: homeLabel, value: event.odds.home },
      awayOdd: { label: awayLabel, value: event.odds.away },
    },
    {
      label: 'Handicap',
      homeOdd: { label: `${homeLabel} +${handicapLine}`, value: match.handicapOdds?.home ?? '1.87x' },
      awayOdd: { label: `${awayLabel} -${handicapLine}`, value: match.handicapOdds?.away ?? '1.94x' },
    },
    {
      label: 'Total',
      homeOdd: { label: `↑ ${totalPointsLine}`, value: match.totalPointsOdds?.over ?? '1.89x' },
      awayOdd: { label: `↓ ${totalPointsLine}`, value: match.totalPointsOdds?.under ?? '1.92x' },
    },
  ]
}

const getCompetitionHomeMatch = (
  eventGroup: DisplayedCompetitionEventGroup,
  event: CompetitionEvent,
  matchTimes: Record<string, string>
): HomeCompetitionMatch | null => {
  if (!isSupportedCompetitionSport(eventGroup.league.sport)) return null

  const sport = eventGroup.league.sport
  const match = getCompetitionLiveEventMatch(event, sport, matchTimes, eventGroup.league)
  const homeOdd: HomeCompetitionOdd = {
    label: getTeamOddLabel(event.homeName),
    value: event.odds.home,
  }
  const awayOdd: HomeCompetitionOdd = {
    label: getTeamOddLabel(event.awayName),
    value: event.odds.away,
  }
  const middleOdd: HomeCompetitionOdd = sport === 'basquete'
    ? {
        label: 'TOTAL',
        value: match.totalPointsOdds?.over ?? '-',
      }
    : {
        label: 'EMPATE',
        value: event.odds.draw ?? '-',
      }

  return {
    id: event.id,
    homeTeam: event.homeName,
    awayTeam: event.awayName,
    sport,
    marketLabel: sport === 'basquete' ? eventGroup.league.name : 'RESULTADO FINAL',
    tags: sport === 'futebol'
      ? event.isLive
        ? ["90'"]
        : event.earlyPayout !== false
          ? ['PA', "90'"]
          : ["90'"]
      : [],
    footerLabel: event.dateTime,
    ...(event.isLive ? {
      homeScore: String(event.homeScore ?? 0),
      awayScore: String(event.awayScore ?? 0),
      live: true,
      liveClock: matchTimes[event.id] ?? event.dateTime,
    } : {}),
    marketColumns: sport === 'basquete' ? getBasketballMarketColumns(event, match) : undefined,
    doubleChanceOdds: match.doubleChanceOdds,
    bothTeamsScoreOdds: match.bothTeamsScoreOdds,
    totalGoalsOdds: match.totalGoalsOdds,
    totalCornersOdds: match.totalCornersOdds,
    totalPointsOdds: match.totalPointsOdds,
    handicapOdds: match.handicapOdds,
    q3TotalOdds: match.q3TotalOdds,
    q4TotalOdds: match.q4TotalOdds,
    odds: sport === 'basquete'
      ? [homeOdd, awayOdd, middleOdd]
      : [homeOdd, middleOdd, awayOdd],
  }
}

const getCompetitionPlayerProps = (
  groups: DisplayedCompetitionEventGroup[],
  marketChips: HomeCompetitionMarketChip[]
): HomeCompetitionPlayerProp[] => (
  marketChips.flatMap((marketChip) => (
    groups.flatMap((eventGroup) => {
      if (!isSupportedCompetitionSport(eventGroup.league.sport)) return []
      const sport = eventGroup.league.sport
      if (!isCalendarPlayerPropsMarketForSport(sport, marketChip.id)) return []

      return eventGroup.events.flatMap((event) => (
        getCalendarPlayerPropsForEvent(event, sport, marketChip.id).map((player) => ({
          id: `competition:${marketChip.id}:${player.id}`,
          marketId: marketChip.id,
          playerName: player.playerName,
          position: player.position,
          marketLabel: marketChip.label,
          matchLabel: `${getTeamOddLabel(event.homeName)} vs ${getTeamOddLabel(event.awayName)}`,
          timeLabel: event.isLive ? 'AO VIVO' : event.dateTime.replace(',', '').toUpperCase(),
          teamName: player.teamName,
          teamAbbreviation: getTeamOddLabel(player.teamName),
          sport,
          odds: getCompetitionPlayerPropOdds(player.options),
        }))
      ))
    })
  ))
)

const getMatchDateGroupTitle = (match: HomeCompetitionMatch) => {
  if (match.live) return 'Ao vivo'

  const [dateLabel = ''] = match.footerLabel.split(',').map((part) => part.trim())
  const compactDateMatch = dateLabel.match(/^\d{1,2}\/[a-zç]{3}/i)

  return (compactDateMatch?.[0] ?? dateLabel) || 'Próximos'
}

const getMatchGroupId = (title: string) => (
  title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'proximos'
)

const getCompetitionMatchGroups = (matches: HomeCompetitionMatch[]): HomeCompetitionMatchGroup[] => {
  const groups: HomeCompetitionMatchGroup[] = []
  const groupsByTitle = new Map<string, HomeCompetitionMatchGroup>()

  matches.forEach((match) => {
    const title = getMatchDateGroupTitle(match)
    const existingGroup = groupsByTitle.get(title)

    if (existingGroup) {
      existingGroup.matches.push(match)
      return
    }

    const group = {
      id: getMatchGroupId(title),
      title,
      matches: [match],
    }

    groupsByTitle.set(title, group)
    groups.push(group)
  })

  return groups.sort((first, second) => {
    if (first.title === 'Ao vivo') return -1
    if (second.title === 'Ao vivo') return 1
    return 0
  })
}

const getCompetitionHighlight = (
  groups: DisplayedCompetitionEventGroup[],
  liveOnly: boolean
): CompetitionHighlightView | null => {
  const league = groups[0]?.league
  if (!isSupportedCompetitionSport(league?.sport)) return null

  const marketChips = getCompetitionMarketChips(league.sport, liveOnly)
  const matchTimes = getInitialMatchTimes(groups)
  const matches = groups
    .flatMap((eventGroup) => (
      eventGroup.events.map((event) => getCompetitionHomeMatch(eventGroup, event, matchTimes))
    ))
    .filter((match): match is HomeCompetitionMatch => !!match)

  if (matches.length === 0) return null

  return {
    competition: {
      title: league.name,
      sportLabel: getSportLabel(league.sport),
      marketChips,
      matches,
      playerProps: getCompetitionPlayerProps(groups, marketChips),
    },
    matchGroups: getCompetitionMatchGroups(matches),
  }
}

export function CompetitionPage({
  sport,
  competitionId,
  liveOnly = false,
  onLiveMatchClick,
  onOpenCompetition,
}: CompetitionPageProps) {
  const marketScopeKey = `${sport}:${competitionId}:${liveOnly ? 'live' : 'all'}`
  const [activeMarketState, setActiveMarketState] = useState<{ scopeKey: string; marketId?: string }>()
  const { groups } = useMemo(() => (
    getCalendarDisplayedEventGroups({
      sportFilter: sport,
      competitionId,
      liveOnly,
    })
  ), [competitionId, liveOnly, sport])
  const competitionView = useMemo(() => (
    getCompetitionHighlight(groups, liveOnly)
  ), [groups, liveOnly])
  const marketFilters = useMemo(() => (
    competitionView?.competition.marketChips?.map((chip) => ({
      id: chip.id,
      label: chip.label,
    })) ?? []
  ), [competitionView])
  const defaultMarketId = marketFilters[0]?.id
  const activeMarketId = activeMarketState?.scopeKey === marketScopeKey
    ? activeMarketState.marketId
    : undefined
  const selectedMarketId = activeMarketId && marketFilters.some((filter) => filter.id === activeMarketId)
    ? activeMarketId
    : defaultMarketId
  const handleMarketChange = useCallback((marketId: string) => {
    setActiveMarketState({ scopeKey: marketScopeKey, marketId })
  }, [marketScopeKey])
  const handleMatchClick = useCallback((
    match: HomeCompetitionMatch,
    _competition: HomeCompetitionHighlight,
    liveTimes: Record<string, string>
  ) => {
    const eventGroup = groups.find(({ events }) => events.some((event) => event.id === match.id))
    if (!eventGroup) return

    const matchTimes = eventGroup.league.events.reduce<Record<string, string>>((times, event) => {
      times[event.id] = liveTimes[event.id] ?? event.dateTime
      return times
    }, {})
    const payload = getCompetitionLiveEventOpenPayload({
      league: eventGroup.league,
      selectedEventId: match.id,
      matchTimes,
    })

    if (payload) onLiveMatchClick?.(payload)
  }, [groups, onLiveMatchClick])

  if (competitionView) {
    return (
      <>
        {marketFilters.length > 0 && (
          <>
            <div className="home__content-filter-anchor home__competition-market-anchor" aria-hidden="true" />
            <ContentFilterChips
              filters={marketFilters}
              activeFilter={selectedMarketId}
              ariaLabel={`Mercados de ${competitionView.competition.title}`}
              className="content-filter-chips--competition-markets"
              onFilterChange={handleMarketChange}
            />
          </>
        )}
        <HomeCompetitionSection
          activeMarketId={selectedMarketId}
          competition={competitionView.competition}
          hideMarketChips
          hideTitleRow
          matchGroups={competitionView.matchGroups}
          playerPropsLayout="grid"
          onMatchClick={onLiveMatchClick ? handleMatchClick : undefined}
        />
      </>
    )
  }

  return (
    <CalendarSection
      sportFilter={sport}
      competitionId={competitionId}
      liveOnly={liveOnly}
      onLiveMatchClick={onLiveMatchClick}
      onOpenCompetition={onOpenCompetition}
    />
  )
}
