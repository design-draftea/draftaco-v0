import { CaretRightIcon, MonitorPlayIcon } from '@phosphor-icons/react'
import iconAoVivo from '../../assets/iconAoVivo.png'
import escudoDefaultBasquete from '../../assets/escudoDefaultBasquete.png'
import iconBasquete from '../../assets/iconSports/basketball.png'
import iconFutebol from '../../assets/iconSports/soccer.png'
import iconTenis from '../../assets/iconSports/tennis.png'
import { getTennisPlayerCountryIcon } from '../../data/tennisCountryIcons'
import { useSportsDbTeamLogo } from '../../hooks/useSportsDbTeamLogo'
import '../LiveSection/LiveSection.css'

export interface LiveMatchCardMatch {
  id: string
  time: string
  homeTeam: { name: string; icon: string; score: number }
  awayTeam: { name: string; icon: string; score: number }
  odds: {
    home: string
    draw?: string
    away: string
  }
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
  totalGamesOdds?: {
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
}

interface LiveMatchCardProps {
  match: LiveMatchCardMatch
  sport: string
  activeMarket: string
  currentTime: string
  onClick?: () => void
}

export function LiveMatchCard({ match, sport, activeMarket, currentTime, onClick }: LiveMatchCardProps) {
  const isBasketball = sport === 'basquete'
  const isTennis = sport === 'tenis'
  const sportFallbackIcon = isBasketball ? iconBasquete : isTennis ? iconTenis : iconFutebol
  const homeCurrentIcon = isTennis
    ? getTennisPlayerCountryIcon(match.homeTeam.name, match.homeTeam.icon)
    : match.homeTeam.icon
  const awayCurrentIcon = isTennis
    ? getTennisPlayerCountryIcon(match.awayTeam.name, match.awayTeam.icon)
    : match.awayTeam.icon
  const homeTeamIcon = useSportsDbTeamLogo(match.homeTeam.name, homeCurrentIcon, sport, sportFallbackIcon)
  const awayTeamIcon = useSportsDbTeamLogo(match.awayTeam.name, awayCurrentIcon, sport, sportFallbackIcon)

  const renderTeamIcon = (icon: string | undefined, side: 'home' | 'away') => {
    if ((sport === 'futebol' && icon === iconFutebol) || (isTennis && icon === iconTenis)) {
      return (
        <img
          src={icon}
          alt=""
          className={`live-section__team-icon live-section__team-icon--sport-${side}`}
        />
      )
    }

    if (icon && !(isBasketball && (icon === escudoDefaultBasquete || icon === iconBasquete))) {
      return <img src={icon} alt="" className="live-section__team-icon" />
    }

    if (isBasketball) {
      return (
        <img
          src={iconBasquete}
          alt=""
          className={`live-section__team-icon--basketball-default live-section__team-icon--basketball-${side}`}
        />
      )
    }

    return <div className="live-section__team-icon--placeholder" />
  }

  return (
    <div
      className="live-section__match"
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : undefined}
    >
      <div className="live-section__match-header">
        <div className="live-section__match-time">
          <div className="live-section__tag-aovivo">
            <div className="live-section__tag-icon-wrapper">
              <img src={iconAoVivo} alt="" className="live-section__tag-icon" />
            </div>
            <span>Ao Vivo</span>
          </div>
          <span>{currentTime}</span>
        </div>
        <div className="live-section__match-header-actions">
          <MonitorPlayIcon aria-hidden="true" className="live-section__stream-icon" weight="bold" />
          <CaretRightIcon aria-hidden="true" className="live-section__match-arrow" weight="bold" />
        </div>
      </div>

      <div className="live-section__teams">
        <div className="live-section__team">
          <div className="live-section__team-info">
            {renderTeamIcon(homeTeamIcon, 'home')}
            <span className="live-section__team-name">{match.homeTeam.name}</span>
          </div>
          {!isTennis && (
            <div className="live-section__team-score">
              <span>{match.homeTeam.score}</span>
            </div>
          )}
        </div>
        <div className="live-section__team">
          <div className="live-section__team-info">
            {renderTeamIcon(awayTeamIcon, 'away')}
            <span className="live-section__team-name">{match.awayTeam.name}</span>
          </div>
          {!isTennis && (
            <div className="live-section__team-score">
              <span>{match.awayTeam.score}</span>
            </div>
          )}
        </div>
      </div>

      <div className="live-section__odds">
        {activeMarket === 'dupla-chance' && match.doubleChanceOdds ? (
          <>
            <button className="live-section__odd-btn">
              <span className="live-section__odd-team">Casa ou Empate</span>
              <span className="live-section__odd-value">{match.doubleChanceOdds.homeOrDraw}</span>
            </button>
            <button className="live-section__odd-btn">
              <span className="live-section__odd-team">Casa ou Fora</span>
              <span className="live-section__odd-value">{match.doubleChanceOdds.homeOrAway}</span>
            </button>
            <button className="live-section__odd-btn">
              <span className="live-section__odd-team">Fora ou Empate</span>
              <span className="live-section__odd-value">{match.doubleChanceOdds.awayOrDraw}</span>
            </button>
          </>
        ) : activeMarket === 'ambos-marcam' && match.bothTeamsScoreOdds ? (
          <>
            <button className="live-section__odd-btn">
              <span className="live-section__odd-team">Sim</span>
              <span className="live-section__odd-value">{match.bothTeamsScoreOdds.yes}</span>
            </button>
            <button className="live-section__odd-btn">
              <span className="live-section__odd-team">Não</span>
              <span className="live-section__odd-value">{match.bothTeamsScoreOdds.no}</span>
            </button>
          </>
        ) : activeMarket === 'total-gols' && match.totalGoalsOdds ? (
          <>
            <button className="live-section__odd-btn">
              <span className="live-section__odd-team">Menos de {match.totalGoalsOdds.line}</span>
              <span className="live-section__odd-value">{match.totalGoalsOdds.under}</span>
            </button>
            <button className="live-section__odd-btn">
              <span className="live-section__odd-team">Mais de {match.totalGoalsOdds.line}</span>
              <span className="live-section__odd-value">{match.totalGoalsOdds.over}</span>
            </button>
          </>
        ) : activeMarket === 'escanteios' && match.totalCornersOdds ? (
          <>
            <button className="live-section__odd-btn">
              <span className="live-section__odd-team">Menos de {match.totalCornersOdds.line}</span>
              <span className="live-section__odd-value">{match.totalCornersOdds.under}</span>
            </button>
            <button className="live-section__odd-btn">
              <span className="live-section__odd-team">Mais de {match.totalCornersOdds.line}</span>
              <span className="live-section__odd-value">{match.totalCornersOdds.over}</span>
            </button>
          </>
        ) : activeMarket === 'total-pontos' && match.totalPointsOdds ? (
          <>
            <button className="live-section__odd-btn">
              <span className="live-section__odd-team">Menos de {match.totalPointsOdds.line}</span>
              <span className="live-section__odd-value">{match.totalPointsOdds.under}</span>
            </button>
            <button className="live-section__odd-btn">
              <span className="live-section__odd-team">Mais de {match.totalPointsOdds.line}</span>
              <span className="live-section__odd-value">{match.totalPointsOdds.over}</span>
            </button>
          </>
        ) : activeMarket === 'handicap' && match.handicapOdds ? (
          <>
            <button className="live-section__odd-btn">
              <span className="live-section__odd-team">
                {match.homeTeam.name} {match.handicapOdds.line > 0 ? '+' : ''}{match.handicapOdds.line}
              </span>
              <span className="live-section__odd-value">{match.handicapOdds.home}</span>
            </button>
            <button className="live-section__odd-btn">
              <span className="live-section__odd-team">
                {match.awayTeam.name} {match.handicapOdds.line > 0 ? '' : '+'}{-match.handicapOdds.line}
              </span>
              <span className="live-section__odd-value">{match.handicapOdds.away}</span>
            </button>
          </>
        ) : activeMarket === 'handicap-games' && match.handicapOdds ? (
          <>
            <button className="live-section__odd-btn">
              <span className="live-section__odd-team">
                {match.homeTeam.name} {match.handicapOdds.line > 0 ? '+' : ''}{match.handicapOdds.line}
              </span>
              <span className="live-section__odd-value">{match.handicapOdds.home}</span>
            </button>
            <button className="live-section__odd-btn">
              <span className="live-section__odd-team">
                {match.awayTeam.name} {match.handicapOdds.line > 0 ? '' : '+'}{-match.handicapOdds.line}
              </span>
              <span className="live-section__odd-value">{match.handicapOdds.away}</span>
            </button>
          </>
        ) : activeMarket === 'total-games' && match.totalGamesOdds ? (
          <>
            <button className="live-section__odd-btn">
              <span className="live-section__odd-team">Menos de {match.totalGamesOdds.line}</span>
              <span className="live-section__odd-value">{match.totalGamesOdds.under}</span>
            </button>
            <button className="live-section__odd-btn">
              <span className="live-section__odd-team">Mais de {match.totalGamesOdds.line}</span>
              <span className="live-section__odd-value">{match.totalGamesOdds.over}</span>
            </button>
          </>
        ) : activeMarket === 'q3-total' && match.q3TotalOdds ? (
          <>
            <button className="live-section__odd-btn">
              <span className="live-section__odd-team">Menos de {match.q3TotalOdds.line}</span>
              <span className="live-section__odd-value">{match.q3TotalOdds.under}</span>
            </button>
            <button className="live-section__odd-btn">
              <span className="live-section__odd-team">Mais de {match.q3TotalOdds.line}</span>
              <span className="live-section__odd-value">{match.q3TotalOdds.over}</span>
            </button>
          </>
        ) : activeMarket === 'q4-total' && match.q4TotalOdds ? (
          <>
            <button className="live-section__odd-btn">
              <span className="live-section__odd-team">Menos de {match.q4TotalOdds.line}</span>
              <span className="live-section__odd-value">{match.q4TotalOdds.under}</span>
            </button>
            <button className="live-section__odd-btn">
              <span className="live-section__odd-team">Mais de {match.q4TotalOdds.line}</span>
              <span className="live-section__odd-value">{match.q4TotalOdds.over}</span>
            </button>
          </>
        ) : isBasketball || isTennis ? (
          <>
            <button className="live-section__odd-btn">
              <span className="live-section__odd-team">{match.homeTeam.name}</span>
              <span className="live-section__odd-value">{match.odds.home}</span>
            </button>
            <button className="live-section__odd-btn">
              <span className="live-section__odd-team">{match.awayTeam.name}</span>
              <span className="live-section__odd-value">{match.odds.away}</span>
            </button>
          </>
        ) : (
          <>
            <button className="live-section__odd-btn">
              <span className="live-section__odd-team">{match.homeTeam.name}</span>
              <span className="live-section__odd-value">{match.odds.home}</span>
            </button>
            <button className="live-section__odd-btn">
              <span className="live-section__odd-team">Empate</span>
              <span className="live-section__odd-value">{match.odds.draw}</span>
            </button>
            <button className="live-section__odd-btn">
              <span className="live-section__odd-team">{match.awayTeam.name}</span>
              <span className="live-section__odd-value">{match.odds.away}</span>
            </button>
          </>
        )}
      </div>
    </div>
  )
}
