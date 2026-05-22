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

export interface Banner {
  id: number
  type: 'missao' | '1x2' | 'torneio' | 'aumentada' | 'virtuais' | 'aoVivo' | 'aoVivoTenis' | 'longoPrazo' | 'combinada'
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
