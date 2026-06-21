import { useEffect, useRef } from 'react'
import type { BrandMode } from '../hooks/featureFlagsContext'
import type { ProductMode } from '../types/home'

const productLabelsByBrand: Record<BrandMode, Record<ProductMode, string>> = {
  pitaco: {
    apostas: 'APOSTAS',
    cassino: 'CASSINO',
  },
  draftea: {
    apostas: 'BETS',
    cassino: 'GAMING',
  },
}

const exactDrafteaTranslations: Record<string, string> = {
  'Abrir depósito. Saldo disponível: R$ 3.400,00': 'Abrir depósito. Saldo disponible: R$ 3.400,00',
  'Abrir feature flags': 'Abrir feature flags',
  'Abrir menu': 'Abrir menú',
  'Acessar Club': 'Acceder al Club',
  'AMANHÃ 12:30': 'MAÑANA 12:30',
  'Amanhã': 'Mañana',
  'AO VIVO': 'Live',
  'Ao Vivo': 'Live',
  'Ao vivo': 'Live',
  'APOSTAS': 'BETS',
  'Apostas': 'Bets',
  'Apostas Ao Vivo': 'Live Bets',
  'Apostas Gratis disponivel': 'Free Bets available',
  'Aposte e ganhe R$10': 'Bet and win R$10',
  'Aposte nas seleções da copa e ganhe R$10.': 'Bet on the copa selections and win R$10.',
  'APOSTE': 'BET',
  'Ativa a experiencia em prototipo de Apostas Gratis.': 'Enable the Free Bets prototype experience.',
  'Ativar': 'Enable',
  'BASQUETE': 'BASQUETBOL',
  'Basquete': 'Basquetbol',
  'Buscar': 'Buscar',
  'CASSINO': 'GAMING',
  'Cassino': 'Gaming',
  'Cassino Ao Vivo': 'Live Gaming',
  'Cassino ao vivo': 'Live Gaming',
  'Cashback 30% de volta': 'Cashback 30% de vuelta',
  'Chutes Totais': 'Tiros totales',
  'Club': 'Club',
  'Complete tarefas da NBA no Pitaco e ganhe.': 'Completa misiones de la NBA en Draftea y gana.',
  'Complete tarefas e ganhe': 'Completa misiones y gana',
  'COMPLETE': 'COMPLETA',
  'Conteúdo': 'Contenido',
  'Destaques': 'Destacados',
  'Desativar Apostas Gratis disponivel': 'Disable Free Bets available',
  'Desativar': 'Disable',
  'Dribles Completos': 'Regates completos',
  'E GANHE': 'Y GANA',
  'EM BREVE': 'PRONTO',
  'EMPATE': 'EMPATE',
  'Entrada max. R$350': 'Entrada máx. R$350',
  'Entradas': 'Entradas',
  'Escolha a experiência carregada no protótipo.': 'Elige la experiencia cargada en el prototipo.',
  'Esportes': 'Deportes',
  'Fechar': 'Cerrar',
  'Finalizações no Gol': 'Tiros al arco',
  'Finalizações ao gol': 'Tiros al arco',
  'Futebol': 'Fútbol',
  'FUTEBOL': 'FÚTBOL',
  'Filtros de conteúdo': 'Filtros de contenido',
  'Flamengo na liberta é aqui': 'Flamengo en la Liberta está aquí',
  'FLAMENGO NA LIBERTA É AQUI': 'FLAMENGO EN LA LIBERTA ESTÁ AQUÍ',
  'Ganhe R$20': 'Gana R$20',
  'GANHE R$20': 'GANA R$20',
  'Ganhando Agora': 'Ganando Ahora',
  'Ganhando agora no nosso Cassino': 'Ganando ahora en nuestro Gaming',
  'Handcap': 'Spread',
  'Handicap': 'Spread',
  'Hoje': 'Hoy',
  'HOJE 15:00': 'HOY 15:00',
  'HOJE 17:30': 'HOY 17:30',
  'HOJE 20:00': 'HOY 20:00',
  'JOGADORES': 'JUGADORES',
  'Mais': 'Más',
  'Min. 3+ seleções de 1.40+': 'Mín. 3+ selecciones de 1.40+',
  'Minhas Apostas': 'My Bets',
  'Minhas apostas': 'My Bets',
  'Missões': 'Misiones',
  'Novidades': 'Novedades',
  'Ofertas': 'Ofertas',
  'Partidas': 'Partidos',
  'PARTIDAS AO VIVO': 'LIVE MATCHES',
  'PARTIDAS EM BREVE': 'PARTIDOS PRÓXIMOS',
  'Pitaco Club': 'Rewards',
  'Pitaco Recomenda': 'Draftea Recomienda',
  'POPULARES': 'POPULARES',
  'Principais': 'Principales',
  'Produto': 'Producto',
  'Promoções': 'Promociones',
  'Promocoes': 'Promociones',
  'Regras de Jogos e Apostas': 'Game and Bets Rules',
  'RESULTADO FINAL': 'Moneyline',
  'Saldo': 'Saldo',
  'SALDO': 'SALDO',
  'Seleções da copa': 'Selecciones de la copa',
  'TAREFAS': 'MISIONES',
  'Tênis': 'Tenis',
  'Tesouro do Pitaco': 'Tesoro de Draftea',
  'Todas as Promoções': 'Todas las Promociones',
  'Total de Gols': 'Total de Goles',
  'Vencer': 'Gana',
  'Ver mais': 'Ver más',
  'Ver regras': 'Ver reglas',
}

const exactPitacoTranslations = Object.fromEntries(
  Object.entries(exactDrafteaTranslations).map(([pitaco, draftea]) => [draftea, pitaco])
) as Record<string, string>

const drafteaReplacements: [RegExp, string][] = [
  [/Rei do Pitaco/g, 'Draftea'],
  [/Pitaco Club/g, 'Rewards'],
  [/Tesouro do Pitaco/g, 'Tesoro de Draftea'],
  [/Pitaco Recomenda/g, 'Draftea Recomienda'],
  [/NBA no Pitaco/g, 'NBA en Draftea'],
  [/Pitacoins/g, 'Drafteacoins'],
  [/Pitaco/g, 'Draftea'],
  [/Apostas Gratis/g, 'Free Bets'],
  [/Apostas Grátis/g, 'Free Bets'],
  [/Apostas Ao Vivo/g, 'Live Bets'],
  [/Apostas/g, 'Bets'],
  [/APOSTAS/g, 'BETS'],
  [/Desativar/g, 'Disable'],
  [/Ativar/g, 'Enable'],
  [/disponivel/g, 'available'],
  [/Cassino Ao Vivo/g, 'Live Gaming'],
  [/Cassino/g, 'Gaming'],
  [/CASSINO/g, 'GAMING'],
  [/Promoções/g, 'Promociones'],
  [/PROMOÇÕES/g, 'PROMOCIONES'],
  [/Ao Vivo/g, 'Live'],
  [/Ao vivo/g, 'Live'],
  [/AO VIVO/g, 'Live'],
  [/RESULTADO FINAL/g, 'Moneyline'],
  [/Futebol/g, 'Fútbol'],
  [/FUTEBOL/g, 'FÚTBOL'],
  [/Vencer/g, 'Gana'],
  [/Handcap/g, 'Spread'],
  [/Handicap/g, 'Spread'],
  [/Basquete/g, 'Basquetbol'],
  [/BASQUETE/g, 'BASQUETBOL'],
  [/Tênis/g, 'Tenis'],
  [/Destaques/g, 'Destacados'],
  [/Principais/g, 'Principales'],
  [/Ganhando Agora/g, 'Ganando Ahora'],
  [/Novidades/g, 'Novedades'],
  [/Ver mais/g, 'Ver más'],
  [/Ver regras/g, 'Ver reglas'],
  [/Mais/g, 'Más'],
  [/Finalizações no Gol/g, 'Tiros al arco'],
  [/Finalizações ao gol/g, 'Tiros al arco'],
  [/Hoje/g, 'Hoy'],
  [/HOJE/g, 'HOY'],
  [/Amanhã/g, 'Mañana'],
  [/AMANHÃ/g, 'MAÑANA'],
  [/Entrada max\./g, 'Entrada máx.'],
  [/seleções/g, 'selecciones'],
  [/Seleções/g, 'Selecciones'],
  [/TAREFAS/g, 'MISIONES'],
  [/tarefas/g, 'misiones'],
  [/ganhe/g, 'gana'],
  [/Ganhe/g, 'Gana'],
]

const pitacoReplacements: [RegExp, string][] = [
  [/Rewards/g, 'Pitaco Club'],
  [/Tesoro de Draftea/g, 'Tesouro do Pitaco'],
  [/Draftea Recomienda/g, 'Pitaco Recomenda'],
  [/NBA en Draftea/g, 'NBA no Pitaco'],
  [/Drafteacoins/g, 'Pitacoins'],
  [/Draftea/g, 'Pitaco'],
  [/Free Bets/g, 'Apostas Gratis'],
  [/Live Bets/g, 'Apostas Ao Vivo'],
  [/Bets/g, 'Apostas'],
  [/BETS/g, 'APOSTAS'],
  [/Disable/g, 'Desativar'],
  [/Enable/g, 'Ativar'],
  [/available/g, 'disponivel'],
  [/Live Gaming/g, 'Cassino Ao Vivo'],
  [/Gaming/g, 'Cassino'],
  [/GAMING/g, 'CASSINO'],
  [/Promociones/g, 'Promoções'],
  [/PROMOCIONES/g, 'PROMOÇÕES'],
  [/Live/g, 'Ao Vivo'],
  [/Moneyline/g, 'RESULTADO FINAL'],
  [/Fútbol/g, 'Futebol'],
  [/FÚTBOL/g, 'FUTEBOL'],
  [/Spread/g, 'Handicap'],
  [/Basquetbol/g, 'Basquete'],
  [/BASQUETBOL/g, 'BASQUETE'],
  [/Tenis/g, 'Tênis'],
  [/Destacados/g, 'Destaques'],
  [/Principales/g, 'Principais'],
  [/Ganando Ahora/g, 'Ganhando Agora'],
  [/Novedades/g, 'Novidades'],
  [/Ver más/g, 'Ver mais'],
  [/Ver reglas/g, 'Ver regras'],
  [/Más/g, 'Mais'],
  [/Tiros al arco/g, 'Finalizações ao gol'],
  [/Hoy/g, 'Hoje'],
  [/HOY/g, 'HOJE'],
  [/Mañana/g, 'Amanhã'],
  [/MAÑANA/g, 'AMANHÃ'],
  [/Entrada máx\./g, 'Entrada max.'],
  [/selecciones/g, 'seleções'],
  [/Selecciones/g, 'Seleções'],
  [/MISIONES/g, 'TAREFAS'],
  [/misiones/g, 'tarefas'],
  [/gana/g, 'ganhe'],
  [/Gana/g, 'Ganhe'],
]

const translatableAttributes = ['aria-label', 'alt', 'placeholder', 'title']
const skippedAncestorSelector = [
  'script',
  'style',
  'noscript',
  'svg',
  '[data-brand-localization-skip="true"]',
].join(',')

export const getProductLabelForBrand = (product: ProductMode, brandMode: BrandMode) => (
  productLabelsByBrand[brandMode][product]
)

export const localizeCopy = (value: string, brandMode: BrandMode) => {
  const exactTranslations = brandMode === 'draftea' ? exactDrafteaTranslations : exactPitacoTranslations
  const exactTranslation = exactTranslations[value]
  if (exactTranslation) return exactTranslation

  const replacements = brandMode === 'draftea' ? drafteaReplacements : pitacoReplacements
  return replacements.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), value)
}

const localizeNodeValue = (value: string, brandMode: BrandMode) => {
  const leadingWhitespace = value.match(/^\s*/)?.[0] ?? ''
  const trailingWhitespace = value.match(/\s*$/)?.[0] ?? ''
  const text = value.slice(leadingWhitespace.length, value.length - trailingWhitespace.length)
  if (!text) return value

  const localizedText = localizeCopy(text, brandMode)
  return localizedText === text ? value : `${leadingWhitespace}${localizedText}${trailingWhitespace}`
}

const translateAttributes = (root: ParentNode, brandMode: BrandMode) => {
  const elements = root instanceof Element
    ? [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))]
    : Array.from(root.querySelectorAll<HTMLElement>('*'))

  elements.forEach((element) => {
    if (element.closest(skippedAncestorSelector)) return

    translatableAttributes.forEach((attribute) => {
      const value = element.getAttribute(attribute)
      if (!value) return

      const localizedValue = localizeCopy(value, brandMode)
      if (localizedValue !== value) {
        element.setAttribute(attribute, localizedValue)
      }
    })
  })
}

const translateTextNodes = (root: Node, brandMode: BrandMode) => {
  const ownerDocument = root.ownerDocument ?? document
  const walker = ownerDocument.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parentElement = node.parentElement
      if (!parentElement) return NodeFilter.FILTER_REJECT
      if (parentElement.closest(skippedAncestorSelector)) return NodeFilter.FILTER_REJECT
      if (!node.nodeValue?.trim()) return NodeFilter.FILTER_REJECT

      return NodeFilter.FILTER_ACCEPT
    },
  })

  const textNodes: Text[] = []
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode as Text)
  }

  textNodes.forEach((node) => {
    const nodeValue = node.nodeValue
    if (!nodeValue) return

    const localizedValue = localizeNodeValue(nodeValue, brandMode)
    if (localizedValue !== nodeValue) {
      node.nodeValue = localizedValue
    }
  })
}

const applyBrandLocalization = (brandMode: BrandMode) => {
  if (!document.body) return

  translateTextNodes(document.body, brandMode)
  translateAttributes(document.body, brandMode)
}

interface BrandLocalizationEffectProps {
  brandMode: BrandMode
}

export function BrandLocalizationEffect({ brandMode }: BrandLocalizationEffectProps) {
  const isApplyingRef = useRef(false)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    document.documentElement.lang = brandMode === 'draftea' ? 'es' : 'pt-BR'
    document.documentElement.dataset.brandMode = brandMode

    const applyLocalization = () => {
      if (isApplyingRef.current) return

      isApplyingRef.current = true
      applyBrandLocalization(brandMode)
      isApplyingRef.current = false
    }

    const scheduleLocalization = () => {
      if (isApplyingRef.current || frameRef.current !== null) return

      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null
        applyLocalization()
      })
    }

    applyLocalization()

    const observer = new MutationObserver(scheduleLocalization)
    observer.observe(document.body, {
      attributeFilter: translatableAttributes,
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true,
    })

    return () => {
      observer.disconnect()
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }
    }
  }, [brandMode])

  return null
}
