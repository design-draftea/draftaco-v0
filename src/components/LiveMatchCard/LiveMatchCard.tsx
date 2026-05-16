import { CaretRightIcon, MonitorPlayIcon } from '@phosphor-icons/react'
import iconAoVivo from '../../assets/iconAoVivo.png'
import escudoDefaultBasquete from '../../assets/escudoDefaultBasquete.png'
import iconBasquete from '../../assets/iconSports/basketball.png'
import iconFutebol from '../../assets/iconSports/soccer.png'
import iconTenis from '../../assets/iconSports/tennis.png'
import { getTennisPlayerCountryIcon } from '../../data/tennisCountryIcons'
import { useSportsDbTeamLogo } from '../../hooks/useSportsDbTeamLogo'
import playerAvatarFutebol from '../../assets/playerAvatarFutebol.svg'
import {
  PreMatchPlayerPropCard,
  type MatchPlayerProp,
  type PlayerPropOption,
  type TeamPlayerProfile,
} from '../PreMatchSection/PreMatchSection'
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

const LIVE_PLAYER_PROPS_PER_MATCH = 3
const LIVE_FOOTBALL_FINISHING_MARKET_ID = 'finalizacao-gol'
const LIVE_FOOTBALL_ASSISTS_MARKET_ID = 'assistencias'

const livePlayerPropOptions = (values: Array<[string, string]>): PlayerPropOption[] =>
  values.map(([label, odd], index) => ({ label, odd, active: index === 1 }))

const liveFootballFinishingOptionSets = [
  livePlayerPropOptions([['3.0+', '1.78x'], ['4.0+', '1.78x'], ['5.0+', '1.78x']]),
  livePlayerPropOptions([['2.0+', '1.55x'], ['3.0+', '1.92x'], ['4.0+', '2.70x']]),
  livePlayerPropOptions([['1.0+', '1.48x'], ['2.0+', '2.05x'], ['3.0+', '3.60x']]),
]

const liveFootballAssistOptionSets = [
  livePlayerPropOptions([['1.0+', '1.68x'], ['2.0+', '2.35x'], ['3.0+', '4.20x']]),
  livePlayerPropOptions([['1.0+', '1.74x'], ['2.0+', '2.50x'], ['3.0+', '4.60x']]),
  livePlayerPropOptions([['1.0+', '1.82x'], ['2.0+', '2.70x'], ['3.0+', '5.10x']]),
]

const liveFootballFinishingPlayersByTeam: Record<string, TeamPlayerProfile[]> = {
  Flamengo: [
    { name: 'Pedro', position: 'ATA' },
    { name: 'Bruno Henrique', position: 'ATA' },
    { name: 'Everton Cebolinha', position: 'ATA' },
  ],
  Cruzeiro: [
    { name: 'Kaio Jorge', position: 'ATA' },
    { name: 'Gabigol', position: 'ATA' },
    { name: 'Lautaro Diaz', position: 'ATA' },
  ],
  Internacional: [
    { name: 'Rafael Borre', position: 'ATA' },
    { name: 'Enner Valencia', position: 'ATA' },
    { name: 'Wesley', position: 'ATA' },
  ],
  Bragantino: [
    { name: 'Eduardo Sasha', position: 'ATA' },
    { name: 'Helinho', position: 'ATA' },
    { name: 'Thiago Borbas', position: 'ATA' },
  ],
  Mirassol: [
    { name: 'Dellatorre', position: 'ATA' },
    { name: 'Negueba', position: 'ATA' },
    { name: 'Fernandinho', position: 'ATA' },
  ],
  'São Paulo': [
    { name: 'Calleri', position: 'ATA' },
    { name: 'Luciano', position: 'ATA' },
    { name: 'Lucas Moura', position: 'MEI' },
  ],
  'Atlético Madrid': [
    { name: 'Julian Alvarez', position: 'ATA' },
    { name: 'Sorloth', position: 'ATA' },
    { name: 'Griezmann', position: 'ATA' },
  ],
  Inter: [
    { name: 'Lautaro Martinez', position: 'ATA' },
    { name: 'Thuram', position: 'ATA' },
    { name: 'Taremi', position: 'ATA' },
  ],
  PSG: [
    { name: 'Dembele', position: 'ATA' },
    { name: 'Kvaratskhelia', position: 'ATA' },
    { name: 'Goncalo Ramos', position: 'ATA' },
  ],
  Lyon: [
    { name: 'Lacazette', position: 'ATA' },
    { name: 'Mikautadze', position: 'ATA' },
    { name: 'Nuamah', position: 'ATA' },
  ],
  Newcastle: [
    { name: 'Isak', position: 'ATA' },
    { name: 'Gordon', position: 'ATA' },
    { name: 'Barnes', position: 'ATA' },
  ],
  Napoli: [
    { name: 'Osimhen', position: 'ATA' },
    { name: 'Politano', position: 'ATA' },
    { name: 'Raspadori', position: 'ATA' },
  ],
  'Boca Juniors': [
    { name: 'Cavani', position: 'ATA' },
    { name: 'Merentiel', position: 'ATA' },
    { name: 'Zenon', position: 'ATA' },
  ],
  'Argentinos Jrs': [
    { name: 'Gondou', position: 'ATA' },
    { name: 'Veron', position: 'ATA' },
    { name: 'Heredia', position: 'ATA' },
  ],
  Racing: [
    { name: 'Maravilla Martinez', position: 'ATA' },
    { name: 'Carbonero', position: 'ATA' },
    { name: 'Solari', position: 'ATA' },
  ],
  'River Plate': [
    { name: 'Borja', position: 'ATA' },
    { name: 'Colidio', position: 'ATA' },
    { name: 'Solari', position: 'ATA' },
  ],
  'San Lorenzo': [
    { name: 'Bareiro', position: 'ATA' },
    { name: 'Leguizamon', position: 'ATA' },
    { name: 'Cerutti', position: 'ATA' },
  ],
  Córdoba: [
    { name: 'Suarez', position: 'ATA' },
    { name: 'Puebla', position: 'ATA' },
    { name: 'Acevedo', position: 'ATA' },
  ],
  'Inter Miami': [
    { name: 'Messi', position: 'ATA' },
    { name: 'Suarez', position: 'ATA' },
    { name: 'Campana', position: 'ATA' },
  ],
  Whitecaps: [
    { name: 'Brian White', position: 'ATA' },
    { name: 'Ryan Gauld', position: 'ATA' },
    { name: 'Ali Ahmed', position: 'ATA' },
  ],
  Cincinnati: [
    { name: 'Acosta', position: 'ATA' },
    { name: 'Kubo', position: 'ATA' },
    { name: 'Baird', position: 'ATA' },
  ],
  'Chicago Fire': [
    { name: 'Cuypers', position: 'ATA' },
    { name: 'Gutierrez', position: 'ATA' },
    { name: 'Mueller', position: 'ATA' },
  ],
  Nashville: [
    { name: 'Surridge', position: 'ATA' },
    { name: 'Mukhtar', position: 'ATA' },
    { name: 'Shaffelburg', position: 'ATA' },
  ],
  'New York City': [
    { name: 'Martinez', position: 'ATA' },
    { name: 'Rodriguez', position: 'ATA' },
    { name: 'Wolf', position: 'ATA' },
  ],
  Dinamo: [
    { name: 'Petkovic', position: 'ATA' },
    { name: 'Kulenovic', position: 'ATA' },
    { name: 'Hoxha', position: 'ATA' },
  ],
  'Aston Villa': [
    { name: 'Watkins', position: 'ATA' },
    { name: 'Bailey', position: 'ATA' },
    { name: 'Diaby', position: 'ATA' },
  ],
  Fenerbahçe: [
    { name: 'Dzeko', position: 'ATA' },
    { name: 'En-Nesyri', position: 'ATA' },
    { name: 'Tadic', position: 'ATA' },
  ],
  Porto: [
    { name: 'Evanilson', position: 'ATA' },
    { name: 'Galeno', position: 'ATA' },
    { name: 'Pepe', position: 'ATA' },
  ],
  Panathinaikos: [
    { name: 'Ioannidis', position: 'ATA' },
    { name: 'Sporar', position: 'ATA' },
    { name: 'Mancini', position: 'ATA' },
  ],
  Nottingham: [
    { name: 'Wood', position: 'ATA' },
    { name: 'Elanga', position: 'ATA' },
    { name: 'Gibbs-White', position: 'ATA' },
  ],
}

const liveFootballAssistPlayersByTeam: Record<string, TeamPlayerProfile[]> = {
  Flamengo: [
    { name: 'Arrascaeta', position: 'MEI' },
    { name: 'Gerson', position: 'MEI' },
    { name: 'De la Cruz', position: 'MEI' },
  ],
  Cruzeiro: [
    { name: 'Matheus Pereira', position: 'MEI' },
    { name: 'Lucas Silva', position: 'MEI' },
    { name: 'Ramiro', position: 'MEI' },
  ],
  Internacional: [
    { name: 'Alan Patrick', position: 'MEI' },
    { name: 'Bruno Henrique', position: 'MEI' },
    { name: 'Wanderson', position: 'MEI' },
  ],
  Bragantino: [
    { name: 'Lincoln', position: 'MEI' },
    { name: 'Jadsom', position: 'MEI' },
    { name: 'Eric Ramires', position: 'MEI' },
  ],
  Mirassol: [
    { name: 'Chico Kim', position: 'MEI' },
    { name: 'Gabriel', position: 'MEI' },
    { name: 'Danielzinho', position: 'MEI' },
  ],
  'São Paulo': [
    { name: 'Lucas Moura', position: 'MEI' },
    { name: 'Luciano', position: 'MEI' },
    { name: 'Alisson', position: 'MEI' },
  ],
  'Atlético Madrid': [
    { name: 'Griezmann', position: 'MEI' },
    { name: 'De Paul', position: 'MEI' },
    { name: 'Koke', position: 'MEI' },
  ],
  Inter: [
    { name: 'Barella', position: 'MEI' },
    { name: 'Calhanoglu', position: 'MEI' },
    { name: 'Mkhitaryan', position: 'MEI' },
  ],
  PSG: [
    { name: 'Vitinha', position: 'MEI' },
    { name: 'Zaïre-Emery', position: 'MEI' },
    { name: 'Fabian Ruiz', position: 'MEI' },
  ],
  Lyon: [
    { name: 'Cherki', position: 'MEI' },
    { name: 'Tolisso', position: 'MEI' },
    { name: 'Caqueret', position: 'MEI' },
  ],
  Newcastle: [
    { name: 'Bruno Guimaraes', position: 'MEI' },
    { name: 'Tonali', position: 'MEI' },
    { name: 'Joelinton', position: 'MEI' },
  ],
  Napoli: [
    { name: 'Anguissa', position: 'MEI' },
    { name: 'Lobotka', position: 'MEI' },
    { name: 'Zielinski', position: 'MEI' },
  ],
  'Boca Juniors': [
    { name: 'Zenon', position: 'MEI' },
    { name: 'Pol Fernandez', position: 'MEI' },
    { name: 'Medina', position: 'MEI' },
  ],
  'Argentinos Jrs': [
    { name: 'Alan Lescano', position: 'MEI' },
    { name: 'Francis Mac Allister', position: 'MEI' },
    { name: 'Heredia', position: 'MEI' },
  ],
  Racing: [
    { name: 'Juanfer Quintero', position: 'MEI' },
    { name: 'Almendra', position: 'MEI' },
    { name: 'Nardoni', position: 'MEI' },
  ],
  'River Plate': [
    { name: 'Nacho Fernandez', position: 'MEI' },
    { name: 'Echeverri', position: 'MEI' },
    { name: 'Aliendro', position: 'MEI' },
  ],
  'San Lorenzo': [
    { name: 'Barrios', position: 'MEI' },
    { name: 'Leguizamon', position: 'MEI' },
    { name: 'Remedi', position: 'MEI' },
  ],
  Córdoba: [
    { name: 'Lodico', position: 'MEI' },
    { name: 'Puebla', position: 'MEI' },
    { name: 'Acevedo', position: 'MEI' },
  ],
  'Inter Miami': [
    { name: 'Messi', position: 'MEI' },
    { name: 'Busquets', position: 'MEI' },
    { name: 'Gomez', position: 'MEI' },
  ],
  Whitecaps: [
    { name: 'Ryan Gauld', position: 'MEI' },
    { name: 'Vite', position: 'MEI' },
    { name: 'Cubas', position: 'MEI' },
  ],
  Cincinnati: [
    { name: 'Acosta', position: 'MEI' },
    { name: 'Nwobodo', position: 'MEI' },
    { name: 'Kubo', position: 'MEI' },
  ],
  'Chicago Fire': [
    { name: 'Shaqiri', position: 'MEI' },
    { name: 'Gimenez', position: 'MEI' },
    { name: 'Gutierrez', position: 'MEI' },
  ],
  Nashville: [
    { name: 'Mukhtar', position: 'MEI' },
    { name: 'Godoy', position: 'MEI' },
    { name: 'Davis', position: 'MEI' },
  ],
  'New York City': [
    { name: 'Moralez', position: 'MEI' },
    { name: 'Parks', position: 'MEI' },
    { name: 'Sands', position: 'MEI' },
  ],
  Dinamo: [
    { name: 'Baturina', position: 'MEI' },
    { name: 'Misic', position: 'MEI' },
    { name: 'Ademi', position: 'MEI' },
  ],
  'Aston Villa': [
    { name: 'McGinn', position: 'MEI' },
    { name: 'Tielemans', position: 'MEI' },
    { name: 'Douglas Luiz', position: 'MEI' },
  ],
  Fenerbahçe: [
    { name: 'Tadic', position: 'MEI' },
    { name: 'Szymanski', position: 'MEI' },
    { name: 'Fred', position: 'MEI' },
  ],
  Porto: [
    { name: 'Pepe', position: 'MEI' },
    { name: 'Nico Gonzalez', position: 'MEI' },
    { name: 'Alan Varela', position: 'MEI' },
  ],
  Panathinaikos: [
    { name: 'Bernard', position: 'MEI' },
    { name: 'Bakasetas', position: 'MEI' },
    { name: 'Zeca', position: 'MEI' },
  ],
  Nottingham: [
    { name: 'Gibbs-White', position: 'MEI' },
    { name: 'Danilo', position: 'MEI' },
    { name: 'Yates', position: 'MEI' },
  ],
}

const isLivePlayerPropsMarket = (marketId: string) =>
  marketId === LIVE_FOOTBALL_FINISHING_MARKET_ID || marketId === LIVE_FOOTBALL_ASSISTS_MARKET_ID

const getLiveFootballPlayerProps = (match: LiveMatchCardMatch, marketId: string): MatchPlayerProp[] => {
  const optionSets = marketId === LIVE_FOOTBALL_ASSISTS_MARKET_ID
    ? liveFootballAssistOptionSets
    : liveFootballFinishingOptionSets
  const playersByTeam = marketId === LIVE_FOOTBALL_ASSISTS_MARKET_ID
    ? liveFootballAssistPlayersByTeam
    : liveFootballFinishingPlayersByTeam
  const homePlayers = playersByTeam[match.homeTeam.name] ?? []
  const awayPlayers = playersByTeam[match.awayTeam.name] ?? []
  const orderedPlayers = [
    ...homePlayers.slice(0, 1).map((player) => ({ ...player, teamName: match.homeTeam.name, teamIcon: match.homeTeam.icon, teamSide: 'home' as const })),
    ...awayPlayers.slice(0, 1).map((player) => ({ ...player, teamName: match.awayTeam.name, teamIcon: match.awayTeam.icon, teamSide: 'away' as const })),
    ...homePlayers.slice(1, 2).map((player) => ({ ...player, teamName: match.homeTeam.name, teamIcon: match.homeTeam.icon, teamSide: 'home' as const })),
    ...awayPlayers.slice(1, 2).map((player) => ({ ...player, teamName: match.awayTeam.name, teamIcon: match.awayTeam.icon, teamSide: 'away' as const })),
    ...homePlayers.slice(2).map((player) => ({ ...player, teamName: match.homeTeam.name, teamIcon: match.homeTeam.icon, teamSide: 'home' as const })),
    ...awayPlayers.slice(2).map((player) => ({ ...player, teamName: match.awayTeam.name, teamIcon: match.awayTeam.icon, teamSide: 'away' as const })),
  ]
  const uniquePlayerNames = new Set<string>()

  return orderedPlayers.reduce<MatchPlayerProp[]>((players, player) => {
    if (players.length >= LIVE_PLAYER_PROPS_PER_MATCH || uniquePlayerNames.has(player.name)) return players

    uniquePlayerNames.add(player.name)
    players.push({
      id: `${match.id}-${marketId}-${player.teamName}-${player.name}`,
      playerName: player.name,
      teamName: player.teamName,
      teamIcon: player.teamIcon,
      teamSide: player.teamSide,
      sport: 'futebol',
      position: player.position,
      image: playerAvatarFutebol,
      options: optionSets[players.length % optionSets.length],
    })
    return players
  }, [])
}

export function LiveMatchCard({ match, sport, activeMarket, currentTime, onClick }: LiveMatchCardProps) {
  const isBasketball = sport === 'basquete'
  const isTennis = sport === 'tenis'
  const isPlayerProps = sport === 'futebol' && isLivePlayerPropsMarket(activeMarket)
  const matchPlayerProps = isPlayerProps ? getLiveFootballPlayerProps(match, activeMarket) : []
  const sportFallbackIcon = isBasketball ? iconBasquete : isTennis ? iconTenis : iconFutebol
  const homeCurrentIcon = isTennis
    ? getTennisPlayerCountryIcon(match.homeTeam.name, match.homeTeam.icon)
    : match.homeTeam.icon
  const awayCurrentIcon = isTennis
    ? getTennisPlayerCountryIcon(match.awayTeam.name, match.awayTeam.icon)
    : match.awayTeam.icon
  const homeTeamIcon = useSportsDbTeamLogo(match.homeTeam.name, homeCurrentIcon, sport, sportFallbackIcon, {
    useCurrentLogoFallback: isTennis,
  })
  const awayTeamIcon = useSportsDbTeamLogo(match.awayTeam.name, awayCurrentIcon, sport, sportFallbackIcon, {
    useCurrentLogoFallback: isTennis,
  })

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
      className={`live-section__match${isPlayerProps ? ' live-section__match--player-props' : ''}`}
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

      {isPlayerProps ? (
        <div
          key={`${match.id}-${activeMarket}-player-props`}
          className="prematch-section__player-props live-section__player-props"
          aria-label={`Jogadores de ${match.homeTeam.name} x ${match.awayTeam.name}`}
          onClick={(event) => event.stopPropagation()}
        >
          {matchPlayerProps.map((player) => (
            <PreMatchPlayerPropCard key={player.id} player={player} />
          ))}
        </div>
      ) : (
      <div key={`${match.id}-${activeMarket}-odds`} className="live-section__odds">
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
      )}
    </div>
  )
}
