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

const defaultCasinoGameMetadata: CasinoGameMetadata = {
  provider: 'Cassino',
  categoryLabel: 'Slots',
  description: 'Giros rápidos, visual marcante e recursos especiais para deixar cada rodada com clima de prêmio chegando.',
  sourceName: 'Catálogo local',
  sourceUrl: '',
}

const casinoGameMetadataFallbacks: Record<string, CasinoGameMetadataFallback> = {
  'fortune-tiger': {
    provider: 'PG Soft',
    categoryLabel: 'Slots',
    description: 'O clássico Tigrinho em uma experiência rápida e dourada, com respins surpresa e multiplicadores para deixar cada giro mais emocionante.',
    rtp: 96.81,
    last24HoursRtp: 258,
    lastHourRtp: 158,
    volatility: 'medium',
    maxWin: 2500,
    sourceName: 'PG Soft',
    sourceUrl: 'https://www.pgsoft.com/uploads/Games/Pdf/Fortune_Tiger_Gameinformation_EN.pdf',
  },
  'cachorro-sortudo': {
    provider: 'Pragmatic Play',
    categoryLabel: 'Slots',
    description: 'Entre no clima do Cachorro Sortudo, com giros leves, símbolos divertidos e chances especiais para transformar a rodada em pura emoção.',
    rtp: 96.5,
    last24HoursRtp: 118,
    lastHourRtp: 92,
    volatility: 'medium',
    maxWin: 1000,
    sourceName: SLOT_REPORT_SOURCE_NAME,
    sourceUrl: SLOT_REPORT_SOURCE_URL,
    slotReportSlug: 'cachorro-sortudo',
  },
  'lucky-monkey': {
    provider: 'Pragmatic Play',
    categoryLabel: 'Slots',
    description: 'O Macaco Sortudo traz uma aventura vibrante, cheia de energia, bônus surpresa e giros que podem mudar o ritmo da partida.',
    rtp: 96.5,
    last24HoursRtp: 134,
    lastHourRtp: 104,
    volatility: 'medium',
    maxWin: 5000,
    sourceName: SLOT_REPORT_SOURCE_NAME,
    sourceUrl: SLOT_REPORT_SOURCE_URL,
    slotReportSlug: 'lucky-monkey',
  },
  'tigre-sortudo-1000': {
    provider: 'Pragmatic Play',
    categoryLabel: 'Slots',
    description: 'O Tigre Sortudo 1000 chega com força máxima, multiplicadores poderosos e uma experiência intensa para quem busca grandes emoções.',
    rtp: 96.5,
    last24HoursRtp: 89,
    lastHourRtp: 126,
    volatility: 'medium',
    maxWin: 25000,
    sourceName: SLOT_REPORT_SOURCE_NAME,
    sourceUrl: SLOT_REPORT_SOURCE_URL,
    slotReportSlug: 'lucky-tiger-1000',
  },
  'touro-sortudo': {
    provider: 'Pragmatic Play',
    categoryLabel: 'Slots',
    description: 'Sinta a força do Touro Sortudo em giros cheios de impacto, bônus especiais e uma experiência feita para acelerar a emoção.',
    rtp: 97.55,
    last24HoursRtp: 147,
    lastHourRtp: 83,
    volatility: 'medium',
    maxWin: 5000,
    sourceName: SLOT_REPORT_SOURCE_NAME,
    sourceUrl: SLOT_REPORT_SOURCE_URL,
    slotReportSlug: 'touro-sortudo',
  },
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
    description: `${game.name} combina giros rápidos, visual de impacto e recursos especiais para manter a rodada sempre em movimento.`,
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
