export type ProductMode = 'apostas' | 'cassino'

export interface ProductRailBaseItem {
  id: string
  label: string
  icon?: string
  lightIcon?: string
  clickable?: boolean
  isMore?: boolean
}

export interface ProductRailSection<T extends ProductRailBaseItem = ProductRailBaseItem> {
  id: string
  className?: string
  items: T[]
}

export interface NavItem {
  id: string
  icon: string
  label: string
}

export interface NavbarConfig {
  activeItemId: string
  mainItems: NavItem[]
  searchItem: NavItem
}

export interface LiveTeam {
  name: string
  shortName: string
  badge: string
  score: number
}

export interface LiveMatch {
  homeTeam: LiveTeam
  awayTeam: LiveTeam
  matchTime: string
  odds: { home: string; draw: string; away: string }
}

export interface TennisPlayer {
  name: string
  sets: number
  games: number
  points: string
  isServing: boolean
  flag?: string
}

export interface TennisMatch {
  player1: TennisPlayer
  player2: TennisPlayer
  currentSet: string
  setScore: string
  odds: { player1: string; player2: string }
}

export interface ComboStat {
  value: string
  label: string
}

export interface MarketBannerTeam {
  name: string
  image?: string
  imageSourceName?: string
  score?: string
  sets?: string[]
  currentScore?: string
  isServing?: boolean
}

export interface MarketBannerOdd {
  label: string
  value: string
  outcomeId: string
}

export interface MarketBanner {
  variant: 'football-live' | 'tennis-live' | 'football-pre' | 'basketball-pre'
  sport: 'futebol' | 'tenis' | 'basquete'
  league: string
  teams: [MarketBannerTeam, MarketBannerTeam]
  odds: MarketBannerOdd[]
  footerLabel: string
  live?: boolean
  liveClock?: string
}

export interface Banner {
  id: number
  type: 'missao' | '1x2' | 'torneio' | 'aumentada' | 'virtuais' | 'aoVivo' | 'aoVivoTenis' | 'longoPrazo' | 'combinada' | 'market'
  headerLeft: string
  headerRight: string
  showTimer?: boolean
  background: string
  title: string
  description: string
  hideContent?: boolean
  casinoGameId?: string
  noWrapTitle?: boolean
  buttonText?: string
  showInfoBtn?: boolean
  odds?: { team: string; value: string; badge?: string }[]
  oddBoosted?: { old: string; new: string }
  liveMatch?: LiveMatch
  tennisMatch?: TennisMatch
  comboStats?: ComboStat[]
  marketBanner?: MarketBanner
}

export interface Promotion {
  id: string
  type: 'missao' | 'vantagem'
  timeLabel: string
  hasTimer: boolean
  label: string[]
  title: string
  description: string
  image: string
  headline?: string
  titleLines?: string[]
  countdownLabel?: string
  countdownMinutes?: number
  rulesLabel?: string
  glowImage?: string
  accent?: 'mint' | 'gold' | 'cyan'
}

export interface HomeCompetitionOdd {
  label: string
  value: string
}

export interface HomeCompetitionMarketColumn {
  label: string
  tag?: string
  homeOdd: HomeCompetitionOdd
  awayOdd: HomeCompetitionOdd
}

export interface HomeCompetitionMarketChip {
  id: string
  label: string
}

export interface HomeCompetitionMatch {
  id: string
  homeTeam: string
  awayTeam: string
  sport: 'futebol' | 'basquete'
  homeScore?: string
  awayScore?: string
  marketLabel: string
  tags: string[]
  footerLabel: string
  live?: boolean
  liveClock?: string
  marketColumns?: HomeCompetitionMarketColumn[]
  doubleChanceOdds?: {
    homeOrDraw: string
    homeOrAway: string
    awayOrDraw: string
  }
  bothTeamsScoreOdds?: {
    yes: string
    no: string
  }
  totalGoalsOdds?: {
    line: number
    under: string
    over: string
  }
  totalCornersOdds?: {
    line: number
    under: string
    over: string
  }
  totalPointsOdds?: {
    line: number
    under: string
    over: string
  }
  handicapOdds?: {
    line: number
    home: string
    away: string
  }
  q3TotalOdds?: {
    line: number
    under: string
    over: string
  }
  q4TotalOdds?: {
    line: number
    under: string
    over: string
  }
  q3ResultOdds?: {
    home: string
    away: string
  }
  odds: [HomeCompetitionOdd, HomeCompetitionOdd, HomeCompetitionOdd]
}

export interface HomeCompetitionPlayerProp {
  id: string
  marketId?: string
  playerName: string
  position: string
  marketLabel: string
  matchLabel: string
  timeLabel: string
  teamName: string
  teamAbbreviation: string
  sport: 'futebol' | 'basquete'
  odds: [HomeCompetitionOdd, HomeCompetitionOdd, HomeCompetitionOdd]
}

export interface HomeCompetitionHighlight {
  title: string
  sportLabel: string
  marketChips?: HomeCompetitionMarketChip[]
  matches: HomeCompetitionMatch[]
  playerProps: HomeCompetitionPlayerProp[]
}

export interface HomeOfferLeg {
  id: string
  icon?: 'total-goals'
  image?: string
  label: string
  detail?: string
}

export interface HomeOfferCarouselItem {
  id: string
  title: string
  badge: string
  badgeTone: 'combinada' | 'super-combinada' | 'super-aumentada' | 'aumentada' | 'garantida'
  matchup: string
  dateLabel: string
  background: string
  odd: string
  oldOdd?: string
  restrictions?: string[]
  footerAction?: {
    label: string
  }
  player?: {
    name: string
    teamName: string
    image: string
  }
  boost?: {
    from: string
    to: string
    marketLabel: string
  }
  legs?: HomeOfferLeg[]
}

export type CasinoCategoryId =
  | 'destaques'
  | 'slots'
  | 'roletas'
  | 'blackjack'
  | 'crash'
  | 'ao-vivo'
  | 'provedores'
  | 'promocoes'

export interface CasinoRailItem extends ProductRailBaseItem {
  categoryId: CasinoCategoryId
}

export interface CasinoGame {
  id: string
  name: string
  provider: string
  image: string
  categoryIds: CasinoCategoryId[]
  isLive?: boolean
}

export interface CasinoGameSection {
  id: string
  title: string
  categoryIds: CasinoCategoryId[]
  games: CasinoGame[]
}
