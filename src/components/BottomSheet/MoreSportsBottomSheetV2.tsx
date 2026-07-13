import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'

import iconBaseball from '../../assets/iconSports/baseball.png'
import iconBasketball from '../../assets/iconSports/basketball.png'
import iconBoxing from '../../assets/iconSports/boxing.png'
import iconCsgo from '../../assets/iconSports/csgo.png'
import iconDarts from '../../assets/iconSports/darts.png'
import iconDota from '../../assets/iconSports/dota.png'
import iconEBasketball from '../../assets/iconSports/e-basketball.png'
import iconESoccer from '../../assets/iconSports/e-soccer.png'
import iconF1 from '../../assets/iconSports/f1.png'
import iconFootball from '../../assets/iconSports/football.png'
import iconGolf from '../../assets/iconSports/golf.png'
import iconHandball from '../../assets/iconSports/handball.png'
import iconHockey from '../../assets/iconSports/hockey.png'
import iconKingsLeague from '../../assets/iconSports/kings-league.png'
import iconLol from '../../assets/iconSports/lol.png'
import iconRainbowSix from '../../assets/iconSports/rainbow-six.png'
import iconSoccer from '../../assets/iconSports/soccer.png'
import iconTableTennis from '../../assets/iconSports/table-tennis.png'
import iconTennis from '../../assets/iconSports/tennis.png'
import iconUfc from '../../assets/iconSports/ufc.png'
import iconValorant from '../../assets/iconSports/valorant.png'
import iconVolleyball from '../../assets/iconSports/volleyball.png'
import iconVirtuais from '../../assets/iconVirtuais.png'
import chevronLeftHeader from '../../assets/iconsDraftaco/chevronLeftHeader.svg'
import chevronRight from '../../assets/iconsDraftaco/chevronRight.svg'
import chevronUp from '../../assets/iconsDraftaco/chevronUp.svg'
import iconFavorito from '../../assets/iconsDraftaco/iconFavorito.svg'
import iconFavoritoAtivo from '../../assets/iconsDraftaco/iconFavoritoAtivo.svg'
import iconCloseEvents from '../../assets/iconsDraftaco/iconCloseEvents.svg'
import iconOrdenacao from '../../assets/iconsDraftaco/iconOrdenacao.svg'
import marcacao from '../../assets/iconsDraftaco/marcacao.svg'
import type { CompetitionLinkTarget } from '../../utils/competitionNavigation'
import {
  competicaoConfigBySport,
  isCompetitionEnabled,
  isCompetitionRailClickable,
  type CompeticaoConfig,
} from '../SportFilterBar/competicaoData'
import type { Competition, CompetitionCountry } from './CompeticaoBottomSheet'
import { BottomSheet } from './BottomSheet'
import './MoreSportsBottomSheetV2.css'

interface MoreSportsBottomSheetV2Props {
  isOpen: boolean
  onClose: () => void
  activeSport?: string | null
  favoriteCompetitions: CompetitionLinkTarget[]
  onMoveFavorite: (fromIndex: number, toIndex: number) => void
  onSelectSport?: (sportId: string) => void
  onSelectCompetition?: (target: CompetitionLinkTarget) => void
  onToggleFavorite: (competition: CompetitionLinkTarget) => void
}

interface SportItem {
  id: string
  label: string
  icon: string
}

type SheetView = 'sports' | 'competitions'

interface SheetTransition {
  to: SheetView
  direction: 'forward' | 'backward'
  key: number
  phase: 'idle' | 'active'
}

interface AccordionCollapseProps {
  isOpen: boolean
  children: ReactNode
}

interface FavoriteDragState {
  key: string
  pointerId: number
  startIndex: number
  targetIndex: number
  clientY: number
  grabOffsetY: number
  left: number
  width: number
  height: number
}

interface KeyboardSortState {
  key: string
  startIndex: number
  targetIndex: number
}

interface FavoriteAnimation {
  key: string
  action: 'adding' | 'removing'
}

const selectableSports = new Set(['futebol', 'basquete'])
const configuredCompetitionSports = new Set(Object.keys(competicaoConfigBySport))
const favoriteOrderRowHeight = 61

const sports: SportItem[] = [
  { id: 'futebol', label: 'Futebol', icon: iconSoccer },
  { id: 'basquete', label: 'Basquete', icon: iconBasketball },
  { id: 'tenis', label: 'Tênis', icon: iconTennis },
  { id: 'f1', label: 'Fórmula 1', icon: iconF1 },
  { id: 'esoccer', label: 'Esoccer', icon: iconESoccer },
  { id: 'futebol-americano', label: 'Fut. Americano', icon: iconFootball },
  { id: 'volei', label: 'Vôlei', icon: iconVolleyball },
  { id: 'tenis-mesa', label: 'Tênis de Mesa', icon: iconTableTennis },
  { id: 'valorant', label: 'Valorant', icon: iconValorant },
  { id: 'virtuais', label: 'Virtuais', icon: iconVirtuais },
  { id: 'ebasketball', label: 'Ebasketball', icon: iconEBasketball },
  { id: 'handebol', label: 'Handebol', icon: iconHandball },
  { id: 'beisebol', label: 'Beisebol', icon: iconBaseball },
  { id: 'cs', label: 'CS', icon: iconCsgo },
  { id: 'ufc', label: 'UFC', icon: iconUfc },
  { id: 'dota', label: 'Dota 2', icon: iconDota },
  { id: 'kings-of-league', label: 'Kings of League', icon: iconKingsLeague },
  { id: 'lol', label: 'LoL', icon: iconLol },
  { id: 'hoquei', label: 'Hoquei', icon: iconHockey },
  { id: 'dados', label: 'Dados', icon: iconDarts },
  { id: 'rainbow-six', label: 'Rainbow Six', icon: iconRainbowSix },
  { id: 'boxe', label: 'Boxe', icon: iconBoxing },
  { id: 'golfe', label: 'Golfe', icon: iconGolf },
]

const sportsById = new Map(sports.map((sport) => [sport.id, sport]))

const getCompetitionConfig = (sportId: string): CompeticaoConfig | null => (
  configuredCompetitionSports.has(sportId) ? competicaoConfigBySport[sportId] : null
)

const getCompetitionTarget = (
  competition: Competition,
  sportId: string
): CompetitionLinkTarget => {
  const config = getCompetitionConfig(sportId)
  const canonicalCompetition = [
    ...(config?.featuredCompetitions ?? []),
    ...(config?.topCompetitions ?? []),
  ].find((candidate) => candidate.name === competition.name)

  return {
    id: canonicalCompetition?.id ?? competition.id,
    name: competition.name,
    sport: sportId,
  }
}

const getCompetitionKey = (competition: CompetitionLinkTarget) => (
  `${competition.sport}:${competition.id}`
)

const moveArrayItem = <T,>(items: T[], fromIndex: number, toIndex: number) => {
  if (fromIndex === toIndex) return items
  const nextItems = [...items]
  const [movedItem] = nextItems.splice(fromIndex, 1)
  nextItems.splice(toIndex, 0, movedItem)
  return nextItems
}

function AccordionCollapse({ isOpen, children }: AccordionCollapseProps) {
  const collapseRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const readyFrameRef = useRef<number | null>(null)

  useLayoutEffect(() => {
    const collapseEl = collapseRef.current
    const innerEl = innerRef.current
    if (!collapseEl || !innerEl) return

    const updateHeight = () => {
      collapseEl.style.setProperty(
        '--more-sports-v2-accordion-height',
        `${innerEl.scrollHeight}px`
      )
    }

    updateHeight()
    if (typeof ResizeObserver === 'undefined') return

    const resizeObserver = new ResizeObserver(updateHeight)
    resizeObserver.observe(innerEl)
    return () => resizeObserver.disconnect()
  }, [children])

  useEffect(() => {
    const collapseEl = collapseRef.current
    if (!collapseEl) return

    readyFrameRef.current = window.requestAnimationFrame(() => {
      readyFrameRef.current = window.requestAnimationFrame(() => {
        readyFrameRef.current = null
        collapseEl.dataset.ready = 'true'
      })
    })

    return () => {
      if (readyFrameRef.current !== null) window.cancelAnimationFrame(readyFrameRef.current)
      delete collapseEl.dataset.ready
    }
  }, [])

  return (
    <div
      ref={collapseRef}
      className={`more-sports-v2__collapse${isOpen ? ' more-sports-v2__collapse--open' : ''}`}
      aria-hidden={!isOpen}
    >
      <div ref={innerRef} className="more-sports-v2__collapse-inner">
        {children}
      </div>
    </div>
  )
}

export function MoreSportsBottomSheetV2({
  isOpen,
  onClose,
  activeSport,
  favoriteCompetitions,
  onMoveFavorite,
  onSelectSport,
  onSelectCompetition,
  onToggleFavorite,
}: MoreSportsBottomSheetV2Props) {
  const [currentView, setCurrentView] = useState<SheetView>('sports')
  const [transition, setTransition] = useState<SheetTransition | null>(null)
  const [selectedSportId, setSelectedSportId] = useState<string | null>(null)
  const [topOpen, setTopOpen] = useState(true)
  const [openCountries, setOpenCountries] = useState<string[]>([])
  const [isOrderingFavorites, setIsOrderingFavorites] = useState(false)
  const [favoriteDrag, setFavoriteDrag] = useState<FavoriteDragState | null>(null)
  const [favoriteDrop, setFavoriteDrop] = useState<FavoriteDragState | null>(null)
  const [isCommittingFavoriteDrag, setIsCommittingFavoriteDrag] = useState(false)
  const [keyboardSort, setKeyboardSort] = useState<KeyboardSortState | null>(null)
  const [sortAnnouncement, setSortAnnouncement] = useState('')
  const [favoriteAnimation, setFavoriteAnimation] = useState<FavoriteAnimation | null>(null)
  const [removingFavoriteKey, setRemovingFavoriteKey] = useState<string | null>(null)
  const transitionTimerRef = useRef<number | null>(null)
  const transitionFrameRef = useRef<number | null>(null)
  const resetTimerRef = useRef<number | null>(null)
  const favoriteRemovalTimerRef = useRef<number | null>(null)
  const favoriteDropTimerRef = useRef<number | null>(null)
  const favoriteCommitTimerRef = useRef<number | null>(null)
  const favoriteDragFrameRef = useRef<number | null>(null)
  const favoriteDragRef = useRef<FavoriteDragState | null>(null)
  const favoriteDragOverlayRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const favoriteOrderListRef = useRef<HTMLUListElement>(null)
  const favoriteOrderItemRefs = useRef(new Map<string, HTMLLIElement>())

  const selectedSport = selectedSportId ? sportsById.get(selectedSportId) ?? null : null
  const selectedConfig = selectedSportId ? getCompetitionConfig(selectedSportId) : null
  const selectedTopCompetitions = selectedConfig?.unifiedTopCompetitions ?? selectedConfig?.topCompetitions ?? []
  const displayView = transition?.to ?? currentView
  const favoriteKeys = useMemo(
    () => new Set(favoriteCompetitions.map(getCompetitionKey)),
    [favoriteCompetitions]
  )
  const canConfigureFavorites = favoriteCompetitions.length > 0
  const orderingFavorites = useMemo(() => (
    keyboardSort
      ? moveArrayItem(favoriteCompetitions, keyboardSort.startIndex, keyboardSort.targetIndex)
      : favoriteCompetitions
  ), [keyboardSort, favoriteCompetitions])
  const activeDragOverlay = favoriteDrag ?? favoriteDrop
  const draggedCompetition = activeDragOverlay
    ? favoriteCompetitions.find((competition) => getCompetitionKey(competition) === activeDragOverlay.key) ?? null
    : null

  const resetSheetState = () => {
    if (transitionTimerRef.current !== null) window.clearTimeout(transitionTimerRef.current)
    if (transitionFrameRef.current !== null) window.cancelAnimationFrame(transitionFrameRef.current)
    if (resetTimerRef.current !== null) window.clearTimeout(resetTimerRef.current)
    if (favoriteRemovalTimerRef.current !== null) window.clearTimeout(favoriteRemovalTimerRef.current)
    if (favoriteDropTimerRef.current !== null) window.clearTimeout(favoriteDropTimerRef.current)
    if (favoriteCommitTimerRef.current !== null) window.clearTimeout(favoriteCommitTimerRef.current)
    if (favoriteDragFrameRef.current !== null) window.cancelAnimationFrame(favoriteDragFrameRef.current)

    transitionTimerRef.current = null
    transitionFrameRef.current = null
    resetTimerRef.current = null
    favoriteRemovalTimerRef.current = null
    favoriteDropTimerRef.current = null
    favoriteCommitTimerRef.current = null
    favoriteDragFrameRef.current = null
    favoriteDragRef.current = null
    setCurrentView('sports')
    setTransition(null)
    setSelectedSportId(null)
    setTopOpen(true)
    setOpenCountries([])
    setIsOrderingFavorites(false)
    setFavoriteDrag(null)
    setFavoriteDrop(null)
    setIsCommittingFavoriteDrag(false)
    setKeyboardSort(null)
    setSortAnnouncement('')
    setFavoriteAnimation(null)
    setRemovingFavoriteKey(null)
  }

  const handleCloseSheet = () => {
    resetSheetState()
    onClose()
  }

  const closeAndResetAfterAnimation = () => {
    onClose()
    if (resetTimerRef.current !== null) window.clearTimeout(resetTimerRef.current)

    resetTimerRef.current = window.setTimeout(() => {
      resetTimerRef.current = null
      resetSheetState()
    }, 320)
  }

  useEffect(() => () => {
    if (transitionTimerRef.current !== null) window.clearTimeout(transitionTimerRef.current)
    if (transitionFrameRef.current !== null) window.cancelAnimationFrame(transitionFrameRef.current)
    if (resetTimerRef.current !== null) window.clearTimeout(resetTimerRef.current)
    if (favoriteRemovalTimerRef.current !== null) window.clearTimeout(favoriteRemovalTimerRef.current)
    if (favoriteDropTimerRef.current !== null) window.clearTimeout(favoriteDropTimerRef.current)
    if (favoriteCommitTimerRef.current !== null) window.clearTimeout(favoriteCommitTimerRef.current)
    if (favoriteDragFrameRef.current !== null) window.cancelAnimationFrame(favoriteDragFrameRef.current)
  }, [])

  useEffect(() => {
    const scrollableBody = contentRef.current?.closest<HTMLElement>('.bottom-sheet__body')
    scrollableBody?.scrollTo({ top: 0, behavior: 'auto' })
  }, [displayView, selectedSportId])

  const completeTransition = (nextView: SheetView) => {
    if (transitionTimerRef.current !== null) window.clearTimeout(transitionTimerRef.current)
    if (transitionFrameRef.current !== null) window.cancelAnimationFrame(transitionFrameRef.current)
    transitionTimerRef.current = null
    transitionFrameRef.current = null
    setCurrentView(nextView)
    setTransition(null)
  }

  const navigateTo = (nextView: SheetView) => {
    if (nextView === displayView || transition) return

    if (transitionTimerRef.current !== null) window.clearTimeout(transitionTimerRef.current)
    if (transitionFrameRef.current !== null) window.cancelAnimationFrame(transitionFrameRef.current)

    const nextTransition: SheetTransition = {
      to: nextView,
      direction: nextView === 'competitions' ? 'forward' : 'backward',
      key: Date.now(),
      phase: 'idle',
    }
    setTransition(nextTransition)

    transitionFrameRef.current = window.requestAnimationFrame(() => {
      transitionFrameRef.current = window.requestAnimationFrame(() => {
        transitionFrameRef.current = null
        setTransition((current) => (
          current?.key === nextTransition.key ? { ...current, phase: 'active' } : current
        ))
      })
    })

    transitionTimerRef.current = window.setTimeout(() => completeTransition(nextView), 560)
  }

  const handleSelectSport = (sportId: string, enabled: boolean) => {
    if (!enabled) return
    onSelectSport?.(sportId)
    closeAndResetAfterAnimation()
  }

  const handleOpenCompetitions = (sportId: string) => {
    if (!getCompetitionConfig(sportId)) return

    setSelectedSportId(sportId)
    setTopOpen(true)
    setOpenCountries([])
    setIsOrderingFavorites(false)
    setFavoriteDrag(null)
    setKeyboardSort(null)
    navigateTo('competitions')
  }

  const handleSelectCompetition = (target: CompetitionLinkTarget) => {
    if (
      !onSelectCompetition
      || !isCompetitionEnabled(target.id)
      || !isCompetitionRailClickable(target.sport)
    ) return
    onSelectCompetition(target)
    closeAndResetAfterAnimation()
  }

  const handleToggleFavorite = (target: CompetitionLinkTarget) => {
    const isAlreadyFavorite = favoriteKeys.has(getCompetitionKey(target))
    if (!isAlreadyFavorite && (!onSelectCompetition || !isCompetitionEnabled(target.id))) return

    setFavoriteAnimation({
      key: getCompetitionKey(target),
      action: isAlreadyFavorite ? 'removing' : 'adding',
    })
    onToggleFavorite(target)
  }

  const renderStarButton = (target: CompetitionLinkTarget, className: string) => {
    const key = getCompetitionKey(target)
    const isFavorite = favoriteKeys.has(key)
    const canToggle = isFavorite || (!!onSelectCompetition && isCompetitionEnabled(target.id))
    const animationClass = favoriteAnimation?.key === key
      ? ` more-sports-v2__favorite-star--${favoriteAnimation.action}`
      : ''

    return (
      <button
        type="button"
        className={`${className}${isFavorite ? ` ${className}--active` : ''}${animationClass}`}
        aria-label={`${isFavorite ? 'Remover' : 'Adicionar'} ${target.name} ${isFavorite ? 'dos' : 'aos'} favoritos`}
        aria-pressed={isFavorite}
        disabled={!canToggle}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation()
          handleToggleFavorite(target)
        }}
        onAnimationEnd={() => {
          if (favoriteAnimation?.key === key) setFavoriteAnimation(null)
        }}
      >
        <img src={isFavorite ? iconFavoritoAtivo : iconFavorito} alt="" aria-hidden="true" />
      </button>
    )
  }

  const getSportLabel = (sportId: string) => (
    sportsById.get(sportId)?.label ?? competicaoConfigBySport[sportId]?.sportLabel ?? sportId
  )

  const setDropTargetFromClientY = (clientY: number) => {
    const drag = favoriteDragRef.current
    if (!drag) return
    const listRect = favoriteOrderListRef.current?.getBoundingClientRect()
    if (!listRect) return

    const draggedCenter = clientY - drag.grabOffsetY + drag.height / 2
    const firstRowCenter = listRect.top + drag.height / 2
    const targetIndex = Math.max(
      0,
      Math.min(
        favoriteCompetitions.length - 1,
        Math.round((draggedCenter - firstRowCenter) / favoriteOrderRowHeight)
      )
    )

    const nextDrag = { ...drag, clientY, targetIndex }
    favoriteDragRef.current = nextDrag

    if (targetIndex !== drag.targetIndex) setFavoriteDrag(nextDrag)
  }

  const paintFavoriteDragPosition = (clientY: number) => {
    const drag = favoriteDragRef.current
    if (!drag) return
    favoriteDragRef.current = { ...drag, clientY }

    if (favoriteDragFrameRef.current !== null) return
    favoriteDragFrameRef.current = window.requestAnimationFrame(() => {
      favoriteDragFrameRef.current = null
      const currentDrag = favoriteDragRef.current
      if (!currentDrag || !favoriteDragOverlayRef.current) return
      favoriteDragOverlayRef.current.style.top = `${currentDrag.clientY - currentDrag.grabOffsetY}px`
    })
  }

  const handleFavoritePointerDown = (
    event: PointerEvent<HTMLButtonElement>,
    competition: CompetitionLinkTarget,
    index: number
  ) => {
    if (event.button !== 0 && event.pointerType === 'mouse') return
    const itemEl = favoriteOrderItemRefs.current.get(getCompetitionKey(competition))
    if (!itemEl) return

    event.preventDefault()
    if (favoriteDropTimerRef.current !== null) window.clearTimeout(favoriteDropTimerRef.current)
    if (favoriteCommitTimerRef.current !== null) window.clearTimeout(favoriteCommitTimerRef.current)
    favoriteDropTimerRef.current = null
    favoriteCommitTimerRef.current = null
    setFavoriteDrop(null)
    setIsCommittingFavoriteDrag(false)
    event.currentTarget.setPointerCapture(event.pointerId)
    const itemRect = itemEl.getBoundingClientRect()
    setKeyboardSort(null)
    const nextDrag: FavoriteDragState = {
      key: getCompetitionKey(competition),
      pointerId: event.pointerId,
      startIndex: index,
      targetIndex: index,
      clientY: event.clientY,
      grabOffsetY: event.clientY - itemRect.top,
      left: itemRect.left,
      width: itemRect.width,
      height: itemRect.height,
    }
    favoriteDragRef.current = nextDrag
    setFavoriteDrag(nextDrag)
    setSortAnnouncement(`${competition.name} selecionada para ordenar.`)
  }

  const animateFavoriteDrop = (drag: FavoriteDragState, targetIndex: number) => {
    if (favoriteDropTimerRef.current !== null) window.clearTimeout(favoriteDropTimerRef.current)
    if (favoriteDragFrameRef.current !== null) window.cancelAnimationFrame(favoriteDragFrameRef.current)
    favoriteDragFrameRef.current = null
    favoriteDragRef.current = null
    const listRect = favoriteOrderListRef.current?.getBoundingClientRect()
    const settledTop = listRect
      ? listRect.top + targetIndex * favoriteOrderRowHeight
      : drag.clientY - drag.grabOffsetY
    setFavoriteDrag(null)
    setFavoriteDrop({
      ...drag,
      targetIndex,
      clientY: settledTop + drag.grabOffsetY,
    })
    favoriteDropTimerRef.current = window.setTimeout(() => {
      favoriteDropTimerRef.current = null
      setFavoriteDrop(null)
    }, 180)
  }

  const handleFavoritePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = favoriteDragRef.current
    if (!drag || event.pointerId !== drag.pointerId) return
    event.preventDefault()

    const scrollableBody = contentRef.current?.closest<HTMLElement>('.bottom-sheet__body')
    if (scrollableBody) {
      const bodyRect = scrollableBody.getBoundingClientRect()
      const edgeSize = 56
      const topDistance = event.clientY - bodyRect.top
      const bottomDistance = bodyRect.bottom - event.clientY
      if (topDistance < edgeSize) {
        scrollableBody.scrollTop -= Math.ceil((1 - Math.max(0, topDistance) / edgeSize) * 14)
      } else if (bottomDistance < edgeSize) {
        scrollableBody.scrollTop += Math.ceil((1 - Math.max(0, bottomDistance) / edgeSize) * 14)
      }
    }

    paintFavoriteDragPosition(event.clientY)
    setDropTargetFromClientY(event.clientY)
  }

  const finishFavoritePointerSort = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = favoriteDragRef.current
    if (!drag || event.pointerId !== drag.pointerId) return
    const { startIndex, targetIndex, key } = drag
    const competition = favoriteCompetitions.find((favorite) => getCompetitionKey(favorite) === key)

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    if (startIndex !== targetIndex) {
      setIsCommittingFavoriteDrag(true)
      onMoveFavorite(startIndex, targetIndex)
      if (favoriteCommitTimerRef.current !== null) window.clearTimeout(favoriteCommitTimerRef.current)
      favoriteCommitTimerRef.current = window.setTimeout(() => {
        favoriteCommitTimerRef.current = null
        setIsCommittingFavoriteDrag(false)
      }, 48)
    }
    animateFavoriteDrop(drag, targetIndex)
    if (competition) setSortAnnouncement(`${competition.name} movida para a posição ${targetIndex + 1}.`)
  }

  const cancelFavoritePointerSort = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = favoriteDragRef.current
    if (!drag || event.pointerId !== drag.pointerId) return
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    animateFavoriteDrop(drag, drag.startIndex)
    setSortAnnouncement('Ordenação cancelada.')
  }

  const handleFavoriteSortKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    competition: CompetitionLinkTarget,
    index: number
  ) => {
    const key = getCompetitionKey(competition)
    const isPickedUp = keyboardSort?.key === key

    if (!isPickedUp && (event.key === ' ' || event.key === 'Enter')) {
      event.preventDefault()
      setFavoriteDrag(null)
      setKeyboardSort({ key, startIndex: index, targetIndex: index })
      setSortAnnouncement(`${competition.name} selecionada. Use as setas para mover.`)
      return
    }

    if (!isPickedUp || !keyboardSort) return

    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault()
      const delta = event.key === 'ArrowUp' ? -1 : 1
      const targetIndex = Math.max(
        0,
        Math.min(favoriteCompetitions.length - 1, keyboardSort.targetIndex + delta)
      )
      setKeyboardSort({ ...keyboardSort, targetIndex })
      setSortAnnouncement(`${competition.name}, posição ${targetIndex + 1} de ${favoriteCompetitions.length}.`)
      return
    }

    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      if (keyboardSort.startIndex !== keyboardSort.targetIndex) {
        onMoveFavorite(keyboardSort.startIndex, keyboardSort.targetIndex)
      }
      setKeyboardSort(null)
      setSortAnnouncement(`${competition.name} movida para a posição ${keyboardSort.targetIndex + 1}.`)
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      setKeyboardSort(null)
      setSortAnnouncement('Ordenação cancelada.')
    }
  }

  const toggleOrderingMode = () => {
    if (isOrderingFavorites && keyboardSort) {
      if (keyboardSort.startIndex !== keyboardSort.targetIndex) {
        onMoveFavorite(keyboardSort.startIndex, keyboardSort.targetIndex)
      }
    }
    setFavoriteDrag(null)
    setKeyboardSort(null)
    setIsOrderingFavorites((current) => !current)
  }

  const requestFavoriteRemoval = (competition: CompetitionLinkTarget) => {
    const key = getCompetitionKey(competition)
    if (removingFavoriteKey || favoriteRemovalTimerRef.current !== null) return

    setRemovingFavoriteKey(key)
    if (favoriteDrag?.key === key) setFavoriteDrag(null)
    if (keyboardSort?.key === key) setKeyboardSort(null)
    setSortAnnouncement(`Removendo ${competition.name} dos favoritos.`)

    favoriteRemovalTimerRef.current = window.setTimeout(() => {
      favoriteRemovalTimerRef.current = null
      onToggleFavorite(competition)
      if (favoriteCompetitions.length === 1) setIsOrderingFavorites(false)
      setRemovingFavoriteKey(null)
      setSortAnnouncement(`${competition.name} foi removida dos favoritos.`)
    }, 240)
  }

  const renderSportsList = (items: SportItem[] = sports) => (
    <div className="more-sports-v2__sport-list" aria-label="Esportes">
      {items.map((sport) => {
        const enabled = !!onSelectSport && selectableSports.has(sport.id)
        const isActive = activeSport === sport.id
        const hasCompetitionConfig = !!getCompetitionConfig(sport.id)

        return (
          <div
            key={sport.id}
            className={`more-sports-v2__sport-row${isActive ? ' more-sports-v2__sport-row--active' : ''}`}
          >
            <button
              type="button"
              className="more-sports-v2__sport-main"
              onClick={() => handleSelectSport(sport.id, enabled)}
              disabled={!enabled}
              aria-current={isActive ? 'true' : undefined}
            >
              <img src={sport.icon} alt="" className="more-sports-v2__sport-icon" />
              <span className="more-sports-v2__sport-label">{sport.label}</span>
            </button>

            {hasCompetitionConfig ? (
              <button
                type="button"
                className="more-sports-v2__sport-link"
                onClick={() => handleOpenCompetitions(sport.id)}
                aria-label={`Ver todas as competições de ${sport.label}`}
              >
                <span>Ver todas competições</span>
                <img src={chevronRight} alt="" />
              </button>
            ) : null}
          </div>
        )
      })}
    </div>
  )

  const renderFavoriteCard = (competition: CompetitionLinkTarget) => {
    const canOpen = (
      !!onSelectCompetition
      && isCompetitionEnabled(competition.id)
      && isCompetitionRailClickable(competition.sport)
    )
    return (
      <li className="more-sports-v2__favorite-card" key={getCompetitionKey(competition)}>
        <button
          type="button"
          className="more-sports-v2__favorite-card-main"
          disabled={!canOpen}
          onClick={() => handleSelectCompetition(competition)}
          aria-label={`Abrir ${competition.name}`}
        >
          <span className="more-sports-v2__favorite-card-star" aria-hidden="true">
            <img src={iconFavoritoAtivo} alt="" />
          </span>
          <span className="more-sports-v2__favorite-card-copy">
            <span className="more-sports-v2__favorite-card-name">{competition.name}</span>
            <span className="more-sports-v2__favorite-card-sport">{getSportLabel(competition.sport)}</span>
          </span>
        </button>
      </li>
    )
  }

  const getFavoriteDragOffset = (index: number, key: string) => {
    if (!favoriteDrag) return 0
    const { startIndex, targetIndex } = favoriteDrag

    if (key === favoriteDrag.key) {
      return (targetIndex - startIndex) * favoriteOrderRowHeight
    }
    if (startIndex < targetIndex && index > startIndex && index <= targetIndex) {
      return -favoriteOrderRowHeight
    }
    if (startIndex > targetIndex && index >= targetIndex && index < startIndex) {
      return favoriteOrderRowHeight
    }
    return 0
  }

  const renderFavoriteOrdering = () => (
    <ul
      ref={favoriteOrderListRef}
      className={`more-sports-v2__favorite-order-list${isCommittingFavoriteDrag ? ' more-sports-v2__favorite-order-list--committing' : ''}`}
    >
      {orderingFavorites.map((competition, index) => {
        const key = getCompetitionKey(competition)
        const isDragging = favoriteDrag?.key === key
        const isKeyboardPicked = keyboardSort?.key === key
        const isRemoving = removingFavoriteKey === key
        const isDropTarget = isDragging && favoriteDrag
          ? favoriteDrag.targetIndex !== favoriteDrag.startIndex
          : false
        const dragOffset = getFavoriteDragOffset(index, key)
        return (
          <li
            key={key}
            ref={(element) => {
              if (element) favoriteOrderItemRefs.current.set(key, element)
              else favoriteOrderItemRefs.current.delete(key)
            }}
            className={`more-sports-v2__favorite-order-item${isDragging ? ' more-sports-v2__favorite-order-item--dragging' : ''}${isKeyboardPicked ? ' more-sports-v2__favorite-order-item--keyboard' : ''}${isDropTarget ? ' more-sports-v2__favorite-order-item--drop-target' : ''}${isRemoving ? ' more-sports-v2__favorite-order-item--removing' : ''}`}
            style={favoriteDrag ? { transform: `translate3d(0, ${dragOffset}px, 0)` } : undefined}
          >
            <button
              type="button"
              className="more-sports-v2__favorite-remove-button"
              aria-label={`Remover ${competition.name} dos favoritos`}
              disabled={isRemoving}
              onClick={() => requestFavoriteRemoval(competition)}
            >
              <img src={iconCloseEvents} alt="" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="more-sports-v2__favorite-drag-area"
              aria-label={`Reordenar ${competition.name}. Posição ${index + 1} de ${favoriteCompetitions.length}`}
              aria-pressed={isDragging || isKeyboardPicked}
              disabled={isRemoving}
              onPointerDown={(event) => handleFavoritePointerDown(event, competition, favoriteCompetitions.findIndex((favorite) => getCompetitionKey(favorite) === key))}
              onPointerMove={handleFavoritePointerMove}
              onPointerUp={finishFavoritePointerSort}
              onPointerCancel={cancelFavoritePointerSort}
              onKeyDown={(event) => handleFavoriteSortKeyDown(
                event,
                competition,
                favoriteCompetitions.findIndex((favorite) => getCompetitionKey(favorite) === key)
              )}
            >
              <span className="more-sports-v2__favorite-order-copy">
                <span>{competition.name}</span>
                <small>{getSportLabel(competition.sport)}</small>
              </span>
              <img src={iconOrdenacao} alt="" />
            </button>
          </li>
        )
      })}
    </ul>
  )

  const renderFavorites = () => {
    if (favoriteCompetitions.length === 0) {
      return (
        <div className="more-sports-v2__favorites-empty">
          <p>Toque na estrela de uma competição para adicioná-la aos favoritos.</p>
          <span className="more-sports-v2__favorites-empty-illustration" aria-hidden="true">
            <img src={marcacao} alt="" className="more-sports-v2__favorites-empty-mark" />
            <img src={iconFavorito} alt="" className="more-sports-v2__favorites-empty-star" />
          </span>
        </div>
      )
    }

    if (isOrderingFavorites) return renderFavoriteOrdering()

    return (
      <ul className="more-sports-v2__favorite-cards">
        {favoriteCompetitions.map(renderFavoriteCard)}
      </ul>
    )
  }

  const renderCompetitionRows = (
    competitions: Competition[],
    sportId: string,
    nested = false
  ) => {
    if (competitions.length === 0) return null

    return (
      <ul className={`more-sports-v2__competition-list${nested ? ' more-sports-v2__competition-list--nested' : ''}`}>
        {competitions.map((competition) => {
          const target = getCompetitionTarget(competition, sportId)
          const enabled = (
            !!onSelectCompetition
            && isCompetitionEnabled(competition.id)
            && isCompetitionRailClickable(sportId)
          )

          return (
            <li key={competition.id} className="more-sports-v2__competition-item">
              {renderStarButton(target, 'more-sports-v2__competition-star')}
              <button
                type="button"
                className={`more-sports-v2__competition-main${enabled ? '' : ' more-sports-v2__competition-main--disabled'}`}
                disabled={!enabled}
                onClick={() => handleSelectCompetition(target)}
              >
                <span className="more-sports-v2__competition-name">{competition.name}</span>
                {enabled ? (
                  <img src={chevronRight} alt="" className="more-sports-v2__competition-chevron-right" />
                ) : null}
              </button>
            </li>
          )
        })}
      </ul>
    )
  }

  const renderCountry = (country: CompetitionCountry) => {
    if (!selectedSportId) return null
    const isOpenCountry = openCountries.includes(country.id)

    return (
      <li
        key={country.id}
        className={`more-sports-v2__country${isOpenCountry ? ' more-sports-v2__country--open' : ''}`}
      >
        <button
          type="button"
          className="more-sports-v2__country-header"
          aria-expanded={isOpenCountry}
          onClick={() => setOpenCountries((current) => (
            current.includes(country.id)
              ? current.filter((id) => id !== country.id)
              : [...current, country.id]
          ))}
        >
          <img src={country.flag} alt="" className="more-sports-v2__country-flag" />
          <span>{country.name}</span>
          <img
            src={chevronUp}
            alt=""
            className={`more-sports-v2__section-chevron${isOpenCountry ? ' more-sports-v2__section-chevron--open' : ''}`}
          />
        </button>

        {country.competitions.length > 0 ? (
          <AccordionCollapse isOpen={isOpenCountry}>
            {renderCompetitionRows(country.competitions, selectedSportId, true)}
          </AccordionCollapse>
        ) : null}
      </li>
    )
  }

  const renderSportsView = () => (
    <div className="more-sports-v2__root">
      <section className="more-sports-v2__favorites">
        <div className="more-sports-v2__section-heading">
          <h2>Favoritos</h2>
          {canConfigureFavorites ? (
            <button type="button" onClick={toggleOrderingMode}>
              {isOrderingFavorites ? 'Concluir' : 'Configurar'}
            </button>
          ) : null}
        </div>
        {renderFavorites()}
      </section>

      <section className="more-sports-v2__all-sports">
        <div className="more-sports-v2__section-heading">
          <h2>Todos os esportes</h2>
        </div>
        {renderSportsList()}
      </section>
      <span className="more-sports-v2__sr-only" aria-live="polite">{sortAnnouncement}</span>
    </div>
  )

  const renderCompetitionView = () => {
    if (!selectedConfig || !selectedSportId) {
      return <p className="more-sports-v2__empty">Nenhuma competição disponível.</p>
    }

    return (
      <div className="more-sports-v2__competitions" aria-label={`Competições de ${selectedConfig.sportLabel}`}>
        <section className={`more-sports-v2__competition-group${topOpen ? ' more-sports-v2__competition-group--open' : ''}`}>
          <button
            type="button"
            className="more-sports-v2__competition-header"
            aria-expanded={topOpen}
            onClick={() => setTopOpen((open) => !open)}
          >
            <img src={selectedConfig.sportIcon} alt="" />
            <span>Principais escolhas</span>
            <img
              src={chevronUp}
              alt=""
              className={`more-sports-v2__section-chevron${topOpen ? ' more-sports-v2__section-chevron--open' : ''}`}
            />
          </button>
          <AccordionCollapse isOpen={topOpen}>
            {renderCompetitionRows(selectedTopCompetitions, selectedSportId)}
          </AccordionCollapse>
        </section>

        {selectedConfig.countries.length > 0 ? (
          <ul className="more-sports-v2__countries">
            {selectedConfig.countries.map(renderCountry)}
          </ul>
        ) : null}
      </div>
    )
  }

  const renderContent = (view: SheetView) => (
    view === 'sports' ? renderSportsView() : renderCompetitionView()
  )

  const sheetTitle = displayView === 'competitions'
    ? selectedConfig?.sportLabel ?? selectedSport?.label ?? 'Competições'
    : 'Esportes e competições'

  return (
    <>
      <BottomSheet
        isOpen={isOpen}
        onClose={handleCloseSheet}
        title={sheetTitle}
        leadingContent={displayView === 'competitions' ? (
          <button
            type="button"
            className="more-sports-v2__back"
            onClick={() => navigateTo('sports')}
            aria-label="Voltar para esportes"
          >
            <img src={chevronLeftHeader} alt="" />
          </button>
        ) : undefined}
        sheetClassName="more-sports-v2"
        bodyClassName="more-sports-v2__body"
        blurBackdrop
      >
        <div ref={contentRef} className="more-sports-v2__transition-shell">
          {transition ? (
            <div
              key={transition.key}
              className={`more-sports-v2__transition-track more-sports-v2__transition-track--${transition.direction} more-sports-v2__transition-track--${transition.phase}`}
              onTransitionEnd={(event) => {
                if (event.target !== event.currentTarget || event.propertyName !== 'transform') return
                completeTransition(transition.to)
              }}
            >
              <div className="more-sports-v2__content" aria-hidden={displayView !== 'sports'}>
                {renderSportsView()}
              </div>
              <div className="more-sports-v2__content" aria-hidden={displayView !== 'competitions'}>
                {renderCompetitionView()}
              </div>
            </div>
          ) : (
            <div className="more-sports-v2__content more-sports-v2__content--single">
              {renderContent(currentView)}
            </div>
          )}
        </div>
      </BottomSheet>

      {activeDragOverlay && draggedCompetition ? createPortal(
        <div
          ref={favoriteDragOverlayRef}
          className={`more-sports-v2__favorite-drag-overlay${favoriteDrop ? ' more-sports-v2__favorite-drag-overlay--dropping' : ''}`}
          style={{
            top: activeDragOverlay!.clientY - activeDragOverlay!.grabOffsetY,
            left: activeDragOverlay!.left,
            width: activeDragOverlay!.width,
            height: activeDragOverlay!.height,
          }}
          aria-hidden="true"
        >
          <img src={iconCloseEvents} alt="" />
          <span>
            <strong>{draggedCompetition.name}</strong>
            <small>{getSportLabel(draggedCompetition.sport)}</small>
          </span>
          <img src={iconOrdenacao} alt="" />
        </div>,
        document.body
      ) : null}
    </>
  )
}
