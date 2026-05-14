import type { CasinoCarouselGame } from '../components/CasinoContent/CasinoContent'

export interface CasinoGameMetadata {
  provider: string
  categoryLabel: string
  description: string
  rtp?: number
  last24HoursRtp?: number
  lastHourRtp?: number
  volatility?: string
  maxWin?: number
  sourceName: string
  sourceUrl: string
}

interface CasinoGameMetadataFallback extends CasinoGameMetadata {
  slotReportSlug?: string
}

type CasinoGameMetadataFallbackInput = Omit<
  CasinoGameMetadataFallback,
  'description' | 'sourceName' | 'sourceUrl'
> & Partial<Pick<CasinoGameMetadataFallback, 'description' | 'sourceName' | 'sourceUrl'>>

interface SlotReportGame {
  provider?: unknown
  rtp?: unknown
  volatility?: unknown
  max_win?: unknown
  mechanic?: unknown
  theme?: unknown
  summary?: unknown
}

const SLOT_REPORT_API_BASE_URL = 'https://slot.report/api/v1/slots'
const SLOT_REPORT_SOURCE_NAME = 'slot.report'
const SLOT_REPORT_SOURCE_URL = 'https://slot.report/'

const DEFAULT_CASINO_GAME_DESCRIPTION = 'Giros rápidos, visual marcante e recursos especiais para deixar cada rodada com clima de prêmio chegando.'

const defaultCasinoGameMetadata: CasinoGameMetadata = {
  provider: 'Cassino',
  categoryLabel: 'Slots',
  description: DEFAULT_CASINO_GAME_DESCRIPTION,
  sourceName: 'Catálogo local',
  sourceUrl: '',
}

const buildRecentCasinoGameRtp = (
  metadata: Pick<CasinoGameMetadataFallbackInput, 'provider' | 'categoryLabel' | 'maxWin' | 'rtp' | 'volatility'>,
  period: 'last24Hours' | 'lastHour'
) => {
  const seed = `${metadata.provider}:${metadata.categoryLabel}:${metadata.rtp ?? 96}:${metadata.maxWin ?? 0}:${metadata.volatility ?? ''}:${period}`
  const hash = Array.from(seed).reduce((currentHash, character) => (
    (currentHash * 31 + character.charCodeAt(0)) % 10000
  ), 17)
  const isHighVolatility = ['high', 'very-high', 'extreme'].includes(metadata.volatility?.toLowerCase() ?? '')
  const maxWin = metadata.maxWin ?? 5000
  const spread = period === 'lastHour'
    ? (isHighVolatility || maxWin >= 10000 ? 190 : 120)
    : (isHighVolatility || maxWin >= 10000 ? 130 : 88)
  const floor = period === 'lastHour'
    ? (isHighVolatility || maxWin >= 10000 ? 68 : 76)
    : (isHighVolatility || maxWin >= 10000 ? 78 : 84)

  return Math.round(floor + (hash / 9999) * spread)
}

const buildCasinoGameMetadataFallback = ({
  description = DEFAULT_CASINO_GAME_DESCRIPTION,
  sourceName = 'Catálogo local',
  sourceUrl = '',
  ...metadata
}: CasinoGameMetadataFallbackInput): CasinoGameMetadataFallback => ({
  ...metadata,
  description,
  last24HoursRtp: metadata.last24HoursRtp ?? buildRecentCasinoGameRtp(metadata, 'last24Hours'),
  lastHourRtp: metadata.lastHourRtp ?? buildRecentCasinoGameRtp(metadata, 'lastHour'),
  sourceName,
  sourceUrl,
})

const casinoGameMetadataFallbacks: Record<string, CasinoGameMetadataFallback> = {
  'fortune-tiger': buildCasinoGameMetadataFallback({
    provider: 'PG Soft',
    categoryLabel: 'Slots',
    description: 'O clássico Tigrinho em uma experiência rápida e dourada, com respins surpresa e multiplicadores para deixar cada giro mais emocionante.',
    rtp: 96.81,
    volatility: 'medium',
    maxWin: 2500,
    sourceName: 'PG Soft',
    sourceUrl: 'https://www.pgsoft.com/uploads/Games/Pdf/Fortune_Tiger_Gameinformation_EN.pdf',
  }),
  'cachorro-sortudo': buildCasinoGameMetadataFallback({
    provider: 'Pragmatic Play',
    categoryLabel: 'Slots',
    description: 'Entre no clima do Cachorro Sortudo, com giros leves, símbolos divertidos e chances especiais para transformar a rodada em pura emoção.',
    rtp: 96.5,
    volatility: 'medium',
    maxWin: 1000,
    sourceName: SLOT_REPORT_SOURCE_NAME,
    sourceUrl: SLOT_REPORT_SOURCE_URL,
    slotReportSlug: 'cachorro-sortudo',
  }),
  'lucky-monkey': buildCasinoGameMetadataFallback({
    provider: 'Pragmatic Play',
    categoryLabel: 'Slots',
    description: 'O Macaco Sortudo traz uma aventura vibrante, cheia de energia, bônus surpresa e giros que podem mudar o ritmo da partida.',
    rtp: 96.5,
    volatility: 'medium',
    maxWin: 5000,
    sourceName: SLOT_REPORT_SOURCE_NAME,
    sourceUrl: SLOT_REPORT_SOURCE_URL,
    slotReportSlug: 'lucky-monkey',
  }),
  'tigre-sortudo-1000': buildCasinoGameMetadataFallback({
    provider: 'Pragmatic Play',
    categoryLabel: 'Slots',
    description: 'O Tigre Sortudo 1000 chega com força máxima, multiplicadores poderosos e uma experiência intensa para quem busca grandes emoções.',
    rtp: 96.5,
    volatility: 'high',
    maxWin: 25000,
    sourceName: SLOT_REPORT_SOURCE_NAME,
    sourceUrl: SLOT_REPORT_SOURCE_URL,
    slotReportSlug: 'lucky-tiger-1000',
  }),
  'touro-sortudo': buildCasinoGameMetadataFallback({
    provider: 'Pragmatic Play',
    categoryLabel: 'Slots',
    description: 'Sinta a força do Touro Sortudo em giros cheios de impacto, bônus especiais e uma experiência feita para acelerar a emoção.',
    rtp: 97.55,
    volatility: 'medium',
    maxWin: 5000,
    sourceName: SLOT_REPORT_SOURCE_NAME,
    sourceUrl: SLOT_REPORT_SOURCE_URL,
    slotReportSlug: 'touro-sortudo',
  }),
  aviatrix: buildCasinoGameMetadataFallback({
    provider: 'Aviatrix',
    categoryLabel: 'Crash',
    description: 'Decole no Aviatrix e entre em uma experiência rápida, com decisões no momento certo e muita adrenalina a cada rodada.',
    rtp: 97,
    volatility: 'high',
    maxWin: 10000,
  }),
  'gold-blitz-ultimate': buildCasinoGameMetadataFallback({
    provider: 'Fortune Factory Studios',
    categoryLabel: 'Slots',
    description: 'Entre no brilho de Gold Blitz Ultimate, com giros intensos, clima dourado e bônus que deixam cada rodada mais empolgante.',
    rtp: 96,
    volatility: 'high',
    maxWin: 5000,
    sourceName: SLOT_REPORT_SOURCE_NAME,
    sourceUrl: SLOT_REPORT_SOURCE_URL,
    slotReportSlug: 'gold-blitz-ultimate',
  }),
  mines: buildCasinoGameMetadataFallback({
    provider: 'Hacksaw Gaming',
    categoryLabel: 'Crash',
    description: 'Teste sua coragem em Mines Dare 2 Win, revelando escolhas no tempo certo em uma experiência rápida, tensa e cheia de emoção.',
    rtp: 96,
    volatility: 'high',
    maxWin: 10000,
  }),
  'buffalo-blitz-ii': buildCasinoGameMetadataFallback({
    provider: 'Playtech',
    categoryLabel: 'Slots',
    description: 'Buffalo Blitz II traz giros selvagens, ritmo intenso e uma jornada cheia de energia para quem gosta de grandes emoções.',
    rtp: 95.96,
    volatility: 'high',
    maxWin: 10000,
  }),
  'bumba-meu-boi-coin': buildCasinoGameMetadataFallback({
    provider: 'Wazdan',
    categoryLabel: 'Slots',
    description: 'Bumba Meu Boi Coin mistura clima brasileiro, visual festivo e giros leves para uma experiência divertida e cheia de cor.',
    rtp: 96.14,
    volatility: 'medium-high',
    maxWin: 500,
  }),
  'phoenix-firestorm': buildCasinoGameMetadataFallback({
    provider: 'Games Global',
    categoryLabel: 'Slots',
    description: 'Phoenix Firestorm acende a rodada com uma experiência intensa, cheia de fogo, energia e giros que mantêm a emoção no alto.',
    rtp: 96.46,
    volatility: 'medium-high',
    maxWin: 5000,
  }),
  'golden-tiger-jackpot-fortunes': buildCasinoGameMetadataFallback({
    provider: 'Games Global',
    categoryLabel: 'Bingo',
    description: 'Golden Tiger Videobingo une a força do tigre ao ritmo do videobingo, com rodadas rápidas e clima de pura sorte.',
    rtp: 95.09,
    volatility: 'high',
    maxWin: 5000,
  }),
  'fortune-rabbit': buildCasinoGameMetadataFallback({
    provider: 'PG Soft',
    categoryLabel: 'Slots',
    description: 'Fortune Rabbit traz sorte, brilho e giros leves em uma experiência rápida, colorida e cheia de momentos especiais.',
    rtp: 96.75,
    volatility: 'medium',
    maxWin: 5000,
    sourceName: SLOT_REPORT_SOURCE_NAME,
    sourceUrl: SLOT_REPORT_SOURCE_URL,
    slotReportSlug: 'fortune-rabbit',
  }),
  'tigre-sortudo-gold': buildCasinoGameMetadataFallback({
    provider: 'Pragmatic Play',
    categoryLabel: 'Slots',
    description: 'O Tigre Sortudo Dourado chega com brilho extra, giros rápidos e uma experiência intensa para deixar a rodada mais emocionante.',
    rtp: 96.5,
    volatility: 'very-high',
    maxWin: 25000,
    sourceName: SLOT_REPORT_SOURCE_NAME,
    sourceUrl: SLOT_REPORT_SOURCE_URL,
    slotReportSlug: 'lucky-tiger-gold',
  }),
  'ratinho-sortudo': buildCasinoGameMetadataFallback({
    provider: 'Pragmatic Play',
    categoryLabel: 'Slots',
    description: 'Ratinho Sortudo traz uma experiência leve e divertida, com giros rápidos, visual carismático e muita emoção em cada rodada.',
    rtp: 96.5,
    volatility: 'medium',
    maxWin: 5000,
  }),
  'brazilian-one-blackjack': buildCasinoGameMetadataFallback({
    provider: 'Pragmatic Play',
    categoryLabel: 'Ao Vivo',
    description: 'Sinta o clima da mesa em Brazilian One BlackJack, com decisões rápidas, tensão na medida certa e emoção a cada carta.',
    rtp: 99.41,
    volatility: 'low',
    maxWin: 2000,
  }),
  'ice-fishing': buildCasinoGameMetadataFallback({
    provider: 'Evolution',
    categoryLabel: 'Ao Vivo',
    description: 'Ice Fishing leva você para uma disputa gelada e divertida, com escolhas rápidas, ritmo leve e emoção a cada rodada.',
    rtp: 97.1,
    volatility: 'high',
    maxWin: 5000,
  }),
  'crazy-time-a': buildCasinoGameMetadataFallback({
    provider: 'Evolution',
    categoryLabel: 'Ao Vivo',
    description: 'Crazy Time Brasil traz o clima do game show ao vivo em português, com bônus, ritmo alto e muita energia na rodada.',
    rtp: 96.08,
    volatility: 'high',
    maxWin: 20000,
  }),
  'bac-bo': buildCasinoGameMetadataFallback({
    provider: 'Evolution',
    categoryLabel: 'Ao Vivo',
    description: 'BacBo combina simplicidade e ritmo rápido em uma experiência ao vivo fácil de acompanhar e cheia de tensão a cada resultado.',
    rtp: 98.87,
    volatility: 'low',
    maxWin: 88,
  }),
  'crazy-time': buildCasinoGameMetadataFallback({
    provider: 'Evolution',
    categoryLabel: 'Ao Vivo',
    description: 'Crazy Time transforma cada rodada em um show, com bônus, multiplicadores e uma experiência ao vivo cheia de energia.',
    rtp: 96.08,
    volatility: 'high',
    maxWin: 20000,
  }),
  'mask-amun-gold-blitz-ultimate': buildCasinoGameMetadataFallback({
    provider: 'Fortune Factory Studios',
    categoryLabel: 'Slots',
    description: 'Mask of Amun Gold revela uma aventura dourada, com mistério, giros intensos e uma experiência cheia de emoção.',
    rtp: 96,
    volatility: 'high',
    maxWin: 5000,
  }),
  'raging-gods-olympus-2': buildCasinoGameMetadataFallback({
    provider: 'Games Global',
    categoryLabel: 'Slots',
    description: 'Raging Gods Olympus 2 traz a força dos deuses em giros épicos, com clima poderoso e emoção do começo ao fim.',
    rtp: 96.09,
    volatility: 'high',
    maxWin: 5000,
  }),
  'le-bunny': buildCasinoGameMetadataFallback({
    provider: 'Hacksaw Gaming',
    categoryLabel: 'Slots',
    description: 'Le Bunny combina charme, ritmo rápido e giros divertidos em uma experiência leve, estilosa e cheia de surpresas.',
    rtp: 96.14,
    volatility: 'medium',
    maxWin: 20000,
    sourceName: SLOT_REPORT_SOURCE_NAME,
    sourceUrl: SLOT_REPORT_SOURCE_URL,
    slotReportSlug: 'le-bunny',
  }),
  helicopterx: buildCasinoGameMetadataFallback({
    provider: 'SmartSoft',
    categoryLabel: 'Crash',
    description: 'Suba alto em Helicopterx, uma experiência rápida e cheia de adrenalina, onde cada decisão aumenta a emoção da rodada.',
    rtp: 96,
    volatility: 'high',
    maxWin: 100100,
  }),
  plinkox: buildCasinoGameMetadataFallback({
    provider: 'SmartSoft',
    categoryLabel: 'Crash',
    description: 'Plinko X traz uma experiência simples e viciante, com quedas imprevisíveis, ritmo rápido e emoção a cada jogada.',
    rtp: 97,
    volatility: 'medium',
    maxWin: 10000,
  }),
  'gates-olympus-1000': buildCasinoGameMetadataFallback({
    provider: 'Pragmatic Play',
    categoryLabel: 'Slots',
    description: 'Gates of Olympus 1000 libera a força dos deuses, com multiplicadores poderosos e giros cheios de energia.',
    rtp: 96.5,
    volatility: 'very-high',
    maxWin: 15000,
    sourceName: SLOT_REPORT_SOURCE_NAME,
    sourceUrl: SLOT_REPORT_SOURCE_URL,
    slotReportSlug: 'gates-of-olympus-1000',
  }),
  'big-bass-bonanza-1000': buildCasinoGameMetadataFallback({
    provider: 'Pragmatic Play',
    categoryLabel: 'Slots',
    description: 'Big Bass Bonanza 1000 traz pescarias animadas, bônus especiais e giros cheios de diversão para fisgar grandes emoções.',
    rtp: 96.51,
    volatility: 'very-high',
    maxWin: 20000,
    sourceName: SLOT_REPORT_SOURCE_NAME,
    sourceUrl: SLOT_REPORT_SOURCE_URL,
    slotReportSlug: 'big-bass-bonanza-1000',
  }),
  spaceman: buildCasinoGameMetadataFallback({
    provider: 'Pragmatic Play',
    categoryLabel: 'Crash',
    description: 'SpaceMan leva a rodada para o espaço, com decisões rápidas, ritmo acelerado e adrenalina a cada decolagem.',
    rtp: 95,
    volatility: 'medium',
    maxWin: 5000,
  }),
  'lucky-jaguar-500': buildCasinoGameMetadataFallback({
    provider: 'TaDa Gaming',
    categoryLabel: 'Slots',
    description: 'Lucky Jaguar 500 traz a força da selva em giros rápidos, visual vibrante e uma experiência cheia de energia.',
    rtp: 97,
    volatility: 'medium',
    maxWin: 20000,
    sourceName: SLOT_REPORT_SOURCE_NAME,
    sourceUrl: SLOT_REPORT_SOURCE_URL,
    slotReportSlug: 'lucky-jaguar-500',
  }),
  'lucky-macaw': buildCasinoGameMetadataFallback({
    provider: 'TaDa Gaming',
    categoryLabel: 'Slots',
    description: 'Arara da Sorte traz cores brasileiras, giros leves e uma experiência divertida para deixar cada rodada mais animada.',
    rtp: 97.09,
    volatility: 'low',
    maxWin: 5000,
    sourceName: SLOT_REPORT_SOURCE_NAME,
    sourceUrl: SLOT_REPORT_SOURCE_URL,
    slotReportSlug: 'lucky-macaw',
  }),
}

const metadataCache = new Map<string, Promise<CasinoGameMetadata>>()

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null
)

const isFiniteNumber = (value: unknown): value is number => (
  typeof value === 'number' && Number.isFinite(value)
)

const toStringValue = (value: unknown) => (
  typeof value === 'string' && value.trim() ? value.trim() : undefined
)

const toNumberValue = (value: unknown) => {
  if (isFiniteNumber(value)) return value
  if (typeof value !== 'string') return undefined

  const parsedValue = Number(value.replace(',', '.'))
  return Number.isFinite(parsedValue) ? parsedValue : undefined
}

const titleCase = (value: string) => (
  value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
)

const normalizeSlotReportGame = (value: unknown): SlotReportGame | undefined => (
  isRecord(value) ? value : undefined
)

const buildCategoryLabelFromSlotReport = (game: SlotReportGame, fallback: CasinoGameMetadata) => {
  const mechanic = toStringValue(game.mechanic)
  if (mechanic === 'crash') return 'Crash'

  return fallback.categoryLabel
}

async function fetchSlotReportGame(slug: string) {
  const response = await fetch(`${SLOT_REPORT_API_BASE_URL}/${slug}.json`)
  if (!response.ok) throw new Error(`Slot metadata request failed: ${response.status}`)

  return normalizeSlotReportGame(await response.json())
}

async function loadCasinoGameMetadataFromSource(game: CasinoCarouselGame) {
  const fallback = getFallbackCasinoGameMetadata(game)
  const slotReportSlug = casinoGameMetadataFallbacks[game.id]?.slotReportSlug

  if (!slotReportSlug) return fallback

  try {
    const slotReportGame = await fetchSlotReportGame(slotReportSlug)
    if (!slotReportGame) return fallback

    return {
      ...fallback,
      provider: toStringValue(slotReportGame.provider) ?? fallback.provider,
      categoryLabel: buildCategoryLabelFromSlotReport(slotReportGame, fallback),
      description: fallback.description,
      rtp: toNumberValue(slotReportGame.rtp) ?? fallback.rtp,
      volatility: toStringValue(slotReportGame.volatility) ?? fallback.volatility,
      maxWin: toNumberValue(slotReportGame.max_win) ?? fallback.maxWin,
      sourceName: SLOT_REPORT_SOURCE_NAME,
      sourceUrl: SLOT_REPORT_SOURCE_URL,
    }
  } catch {
    return fallback
  }
}

export function getFallbackCasinoGameMetadata(game: CasinoCarouselGame): CasinoGameMetadata {
  const fallback = casinoGameMetadataFallbacks[game.id]
  if (fallback) return fallback

  return {
    ...defaultCasinoGameMetadata,
    provider: game.provider ?? defaultCasinoGameMetadata.provider,
    categoryLabel: game.categoryLabel ?? defaultCasinoGameMetadata.categoryLabel,
    description: DEFAULT_CASINO_GAME_DESCRIPTION,
  }
}

export function loadCasinoGameMetadata(game: CasinoCarouselGame) {
  const cacheKey = game.id
  const cachedMetadata = metadataCache.get(cacheKey)
  if (cachedMetadata) return cachedMetadata

  const metadataRequest = loadCasinoGameMetadataFromSource(game)
  metadataCache.set(cacheKey, metadataRequest)

  return metadataRequest
}

export function formatCasinoGamePercent(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatCasinoGameMaxWin(value: number) {
  return `${new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 0,
  }).format(value)}x`
}

export function formatCasinoGameVolatility(value: string) {
  const normalizedValue = value.trim().toLowerCase()
  const volatilityLabels: Record<string, string> = {
    low: 'Baixa',
    medium: 'Média',
    high: 'Alta',
    'very-high': 'Muito alta',
    extreme: 'Extrema',
  }

  return volatilityLabels[normalizedValue] ?? titleCase(value)
}
