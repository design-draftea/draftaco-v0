import { useEffect } from 'react'
import { BottomSheet } from './BottomSheet'
import './MoreSportsBottomSheet.css'

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

interface MoreSportsBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  activeSport?: string | null
  onSelectSport?: (sportId: string) => void
}

const selectableSports = new Set(['futebol', 'basquete'])

const sports = [
  { id: 'futebol', label: 'Futebol', icon: iconSoccer },
  { id: 'basquete', label: 'Basquete', icon: iconBasketball },
  { id: 'tenis', label: 'Tênis', icon: iconTennis },
  { id: 'virtuais', label: 'Virtuais', icon: iconVirtuais },
  { id: 'f1', label: 'F1', icon: iconF1 },
  { id: 'esoccer', label: 'Esoccer', icon: iconESoccer },
  { id: 'futebol-americano', label: 'Fut. Americano', icon: iconFootball },
  { id: 'volei', label: 'Vôlei', icon: iconVolleyball },
  { id: 'tenis-mesa', label: 'Tênis Mesa', icon: iconTableTennis },
  { id: 'valorant', label: 'Valorant', icon: iconValorant },
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

export function MoreSportsBottomSheet({
  isOpen,
  onClose,
  activeSport,
  onSelectSport,
}: MoreSportsBottomSheetProps) {
  useEffect(() => {
    if (!isOpen) return

    const scrollTimer = window.setTimeout(() => {
      const bodyEl = document.querySelector<HTMLDivElement>(
        '.bottom-sheet.more-sports-bs .bottom-sheet__body.more-sports-bs__body'
      )
      if (!bodyEl) return

      bodyEl.scrollTo({
        top: bodyEl.scrollHeight - bodyEl.clientHeight,
        behavior: 'smooth',
      })
    }, 360)

    return () => window.clearTimeout(scrollTimer)
  }, [isOpen])

  const handleSelectSport = (sportId: string, enabled: boolean) => {
    if (!enabled) return
    onSelectSport?.(sportId)
    onClose()
  }

  const footer = (
    <button type="button" className="more-sports-bs__footer-btn" onClick={onClose}>
      Fechar
    </button>
  )

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Selecione um esporte"
      sheetClassName="more-sports-bs"
      bodyClassName="more-sports-bs__body"
      footerContent={footer}
      blurBackdrop
    >
      <div className="more-sports-bs__grid">
        {sports.map((sport) => {
          const enabled = selectableSports.has(sport.id)
          const isActive = activeSport === sport.id

          return (
            <button
              key={sport.id}
              type="button"
              className={`more-sports-bs__card${isActive ? ' more-sports-bs__card--active' : ''}`}
              onClick={() => handleSelectSport(sport.id, enabled)}
              disabled={!enabled}
              aria-current={isActive ? 'true' : undefined}
            >
              <img src={sport.icon} alt="" className="more-sports-bs__icon" />
              <span className="more-sports-bs__label">{sport.label}</span>
            </button>
          )
        })}
      </div>
    </BottomSheet>
  )
}
