import { useState, useEffect, useRef } from 'react'
import { CaretRightIcon, CaretUpIcon } from '@phosphor-icons/react'
import './PreMatchSection.css'
import { getTeamLogo } from '../../data/teamLogos'
import { useHomeMarketStickyState } from '../../hooks/useHomeMarketStickyVisible'
import { useSportsDbTeamLogo } from '../../hooks/useSportsDbTeamLogo'
import { useSlidingActiveIndicator } from '../../hooks/useSlidingActiveIndicator'
import {
  getCompetitionLinkTarget,
  type CompetitionLinkTarget,
} from '../../utils/competitionNavigation'
import type { LiveEventMatch, LiveEventOpenPayload } from '../../pages/LiveEventPage'

import iconBasquete from '../../assets/iconSports/basketball.png'
import iconEsoccer from '../../assets/iconSports/e-soccer.png'
import iconFutebol from '../../assets/iconSports/soccer.png'
import iconTenis from '../../assets/iconSports/tennis.png'
import iconVolei from '../../assets/iconSports/volleyball.png'
import flagAlemanha from '../../assets/iconPaises/alemanha.png'
import flagArgentina from '../../assets/iconPaises/argentina.png'
import flagBrasil from '../../assets/iconPaises/brasil.png'
import flagEspanha from '../../assets/iconPaises/espanha.png'
import flagEstadosUnidos from '../../assets/iconPaises/estados-unidos.png'
import flagInglaterra from '../../assets/iconPaises/inglaterra.png'
import flagMundo from '../../assets/iconPaises/mundo.png'
// NBA Teams
import escudoBulls from '../../assets/escudoBullsGde.png'
import escudoPistons from '../../assets/escudoPistonsGde.png'
import escudoWarriors from '../../assets/escudoWarriors.png'
import escudoLakers from '../../assets/escudoLakers.png'
import escudoCavaliers from '../../assets/escudoCavaliers.png'
import escudoMiami from '../../assets/escudoMiami.png'
// NCAAB Teams
import escudoLafayette from '../../assets/escudoLafayette.png'
import escudoPennsylvania from '../../assets/escudoPennsylvania.png'
import escudoSouthCarolina from '../../assets/escudoSouthCarolina.png'
import escudoSouthern from '../../assets/escudoSouthern.png'
import escudoTexas from '../../assets/escudoTexas.png'
import escudoCaxias from '../../assets/escudoCaxias.png'
// Escudos Brasil
import escudoBotafogo from '../../assets/escudoBotafogo.png'
import escudoBahia from '../../assets/escudoBahia.png'
import escudoPalmeiras from '../../assets/escudoPalmeiras.png'
import escudoFluminense from '../../assets/escudoFluminense.png'
import escudoAtlMineiro from '../../assets/escudoAtlMineiro.png'
import escudoSantos from '../../assets/escudoSantos.png'
// Escudos Internacionais
import escudoReal from '../../assets/escudoReal.png'
import escudoBarca from '../../assets/escudoBarca.png'
import escudoArsenal from '../../assets/escudoArsenal.png'
import escudoChelsea from '../../assets/escudoChelsea.png'
import escudoBayerMunique from '../../assets/escudoBayerMunique.png'
import escudoBayerLeverkusen from '../../assets/escudoBayerLeverkusen.png'
import escudoLiverpool from '../../assets/escudoLiverpool.png'
import escudoManchesterCity from '../../assets/escudomanchesterCity.png'
import escudoBenfica from '../../assets/escudoBenfica.png'
import escudoAjax from '../../assets/escudoAjax.png'
import escudoBrighton from '../../assets/escudoBrighton.png'
import escudoWestHam from '../../assets/escudoWestHam.png'
import escudoLeeds from '../../assets/escudoLeeds.png'
import escudoBurnley from '../../assets/escudoBurnley.png'
import escudoGetafe from '../../assets/escudoGetafe.png'
import escudoElche from '../../assets/escudoElche.png'
import escudoAlaves from '../../assets/escudoAlaves.png'
import escudoEspanyol from '../../assets/escudoEspanyol.png'
import escudoMallorca from '../../assets/escudoMallorca.png'
import escudoLevante from '../../assets/escudoLevante.png'
import escudoWolfsburg from '../../assets/escudoWolfsburg.png'
import escudoEintracht from '../../assets/escudoEintracht.png'
import escudoAugsburg from '../../assets/escudoAugsburg.png'
import escudoHamburger from '../../assets/escudoHamburger.png'
// Rei Antecipa badges
import reiAntecipaFutebol from '../../assets/reiAntecipaFutebol.png'
import reiAntecipaBasquete from '../../assets/reiAntecipaBasquete.png'
// Bottom Sheet
import { ReiAntecipaBottomSheet } from '../BottomSheet/ReiAntecipaBottomSheet'

interface SportChip {
  id: string
  icon: string
  label: string
  disabled?: boolean
}

interface MarketChip {
  id: string
  label: string
}

interface Team {
  name: string
  icon: string
}

interface Match {
  id: string
  dateTime: string
  homeTeam: Team
  awayTeam: Team
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
  // Basketball specific
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
  extraBets?: number // Número de apostas extras (+2, +20, etc)
}

interface League {
  id: string
  name: string
  flag: string
  isOpen: boolean
  matches: Match[]
  sport: string
}

interface PreMatchSectionProps {
  onOpenCompetition?: (target: CompetitionLinkTarget) => void
  onMatchClick?: (payload: LiveEventOpenPayload) => void
}

const sportChips: SportChip[] = [
  { id: 'futebol', icon: iconFutebol, label: 'Futebol' },
  { id: 'basquete', icon: iconBasquete, label: 'Basquete' },
  { id: 'tenis', icon: iconTenis, label: 'Tênis', disabled: true },
  { id: 'volei', icon: iconVolei, label: 'Vôlei', disabled: true },
  { id: 'esoccer', icon: iconEsoccer, label: 'Esoccer', disabled: true },
]

function getPreMatchSportFallbackIcon(sport: string): string {
  if (sport === 'basquete') return iconBasquete
  if (sport === 'futebol') return iconFutebol
  return ''
}

function isPreMatchSportFallbackIcon(icon: string | undefined, sport: string): boolean {
  if (!icon) return true
  return icon === getPreMatchSportFallbackIcon(sport)
}

interface PreMatchTeamIconProps {
  teamName: string
  currentIcon: string | undefined
  sport: string
  side: 'home' | 'away'
}

function PreMatchTeamIcon({ teamName, currentIcon, sport, side }: PreMatchTeamIconProps) {
  const fallbackIcon = getPreMatchSportFallbackIcon(sport)
  const resolvedIcon = useSportsDbTeamLogo(teamName, currentIcon, sport, fallbackIcon || undefined)

  if (!resolvedIcon) return <div className="prematch-section__team-icon--placeholder" />

  if (isPreMatchSportFallbackIcon(resolvedIcon, sport)) {
    const fallbackModifier = sport === 'basquete' ? 'basketball' : 'sport'

    return (
      <img
        src={resolvedIcon}
        alt=""
        className={`prematch-section__team-icon prematch-section__team-icon--${fallbackModifier}-${side}`}
      />
    )
  }

  return <img src={resolvedIcon} alt="" className="prematch-section__team-icon" />
}

const footballMarketChips: MarketChip[] = [
  { id: 'resultado-final', label: 'Resultado Final' },
  { id: 'dupla-chance', label: 'Dupla Chance' },
  { id: 'ambos-marcam', label: 'Ambos Marcam' },
  { id: 'total-gols', label: 'Total de Gols' },
  { id: 'escanteios', label: 'Total de Escanteios' },
]

const basketballMarketChips: MarketChip[] = [
  { id: 'vencedor', label: 'Vencedor' },
  { id: 'total-pontos', label: 'Total de Pontos' },
  { id: 'handicap', label: 'Handicap' },
  { id: 'q3-total', label: '3° Quarto - Total de Pontos' },
  { id: 'q4-total', label: '4° Quarto - Total de Pontos' },
]

const leagues: League[] = [
  {
    id: 'brasil-serie-a',
    name: 'Brasil - Série A',
    flag: flagBrasil,
    isOpen: true,
    sport: 'futebol',
    matches: [
      {
        id: '1',
        dateTime: 'Hoje, 21:30',
        homeTeam: { name: 'Palmeiras', icon: getTeamLogo("Palmeiras", escudoPalmeiras) },
        awayTeam: { name: 'Fluminense', icon: getTeamLogo("Fluminense", escudoFluminense) },
        odds: { home: '1.65x', draw: '3.80x', away: '5.00x' },
        doubleChanceOdds: { homeOrDraw: '1.20x', homeOrAway: '1.35x', awayOrDraw: '2.10x' },
        bothTeamsScoreOdds: { yes: '1.85x', no: '1.90x' },
        totalGoalsOdds: { line: 2.5, under: '1.85x', over: '1.90x' },
        totalCornersOdds: { line: 9.5, under: '1.80x', over: '1.95x' },
        extraBets: 2,
      },
      {
        id: '2',
        dateTime: 'Hoje, 21:30',
        homeTeam: { name: 'Botafogo', icon: getTeamLogo("Botafogo", escudoBotafogo) },
        awayTeam: { name: 'Bahia', icon: getTeamLogo("Bahia", escudoBahia) },
        odds: { home: '1.85x', draw: '3.40x', away: '4.20x' },
        doubleChanceOdds: { homeOrDraw: '1.25x', homeOrAway: '1.40x', awayOrDraw: '1.95x' },
        bothTeamsScoreOdds: { yes: '1.75x', no: '2.00x' },
        totalGoalsOdds: { line: 2.5, under: '1.80x', over: '1.95x' },
        totalCornersOdds: { line: 9.5, under: '1.85x', over: '1.90x' },
        extraBets: 2,
      },
      {
        id: '3',
        dateTime: 'Amanhã, 20:00',
        homeTeam: { name: 'Atl. Mineiro', icon: getTeamLogo("Atl. Mineiro", escudoAtlMineiro) },
        awayTeam: { name: 'Santos', icon: getTeamLogo("Santos", escudoSantos) },
        odds: { home: '2.10x', draw: '3.25x', away: '3.50x' },
        doubleChanceOdds: { homeOrDraw: '1.30x', homeOrAway: '1.35x', awayOrDraw: '1.70x' },
        bothTeamsScoreOdds: { yes: '1.70x', no: '2.05x' },
        totalGoalsOdds: { line: 2.5, under: '1.90x', over: '1.85x' },
        totalCornersOdds: { line: 10.5, under: '1.88x', over: '1.88x' },
      },
    ],
  },
  {
    id: 'champions-league',
    name: 'Champions League',
    flag: flagMundo,
    isOpen: true,
    sport: 'futebol',
    matches: [
      {
        id: '4',
        dateTime: 'Hoje, 16:00',
        homeTeam: { name: 'Real Madrid', icon: getTeamLogo("Real Madrid", escudoReal) },
        awayTeam: { name: 'Barcelona', icon: getTeamLogo("Barcelona", escudoBarca) },
        odds: { home: '2.20x', draw: '3.40x', away: '3.10x' },
        doubleChanceOdds: { homeOrDraw: '1.35x', homeOrAway: '1.30x', awayOrDraw: '1.60x' },
        bothTeamsScoreOdds: { yes: '1.55x', no: '2.30x' },
        totalGoalsOdds: { line: 2.5, under: '2.10x', over: '1.70x' },
        totalCornersOdds: { line: 10.5, under: '1.75x', over: '2.00x' },
        extraBets: 2,
      },
      {
        id: '5',
        dateTime: 'Hoje, 16:00',
        homeTeam: { name: 'Liverpool', icon: getTeamLogo("Liverpool", escudoLiverpool) },
        awayTeam: { name: 'Man. City', icon: getTeamLogo("Man. City", escudoManchesterCity) },
        odds: { home: '2.40x', draw: '3.50x', away: '2.80x' },
        doubleChanceOdds: { homeOrDraw: '1.45x', homeOrAway: '1.30x', awayOrDraw: '1.55x' },
        bothTeamsScoreOdds: { yes: '1.50x', no: '2.40x' },
        totalGoalsOdds: { line: 2.5, under: '2.05x', over: '1.75x' },
        totalCornersOdds: { line: 10.5, under: '1.82x', over: '1.92x' },
        extraBets: 2,
      },
      {
        id: '6',
        dateTime: 'Amanhã, 16:00',
        homeTeam: { name: 'Benfica', icon: getTeamLogo("Benfica", escudoBenfica) },
        awayTeam: { name: 'Ajax', icon: getTeamLogo("Ajax", escudoAjax) },
        odds: { home: '2.10x', draw: '3.40x', away: '3.30x' },
        doubleChanceOdds: { homeOrDraw: '1.30x', homeOrAway: '1.32x', awayOrDraw: '1.68x' },
        bothTeamsScoreOdds: { yes: '1.65x', no: '2.15x' },
        totalGoalsOdds: { line: 2.5, under: '1.95x', over: '1.80x' },
        totalCornersOdds: { line: 9.5, under: '1.90x', over: '1.85x' },
      },
    ],
  },
  {
    id: 'premier-league',
    name: 'Inglaterra - Premier League',
    flag: flagInglaterra,
    isOpen: false,
    sport: 'futebol',
    matches: [
      {
        id: '6',
        dateTime: 'Hoje, 12:30',
        homeTeam: { name: 'Arsenal', icon: getTeamLogo("Arsenal", escudoArsenal) },
        awayTeam: { name: 'Chelsea', icon: getTeamLogo("Chelsea", escudoChelsea) },
        odds: { home: '1.90x', draw: '3.60x', away: '3.80x' },
        doubleChanceOdds: { homeOrDraw: '1.25x', homeOrAway: '1.28x', awayOrDraw: '1.85x' },
        bothTeamsScoreOdds: { yes: '1.60x', no: '2.20x' },
        totalGoalsOdds: { line: 2.5, under: '2.00x', over: '1.78x' },
        totalCornersOdds: { line: 10.5, under: '1.78x', over: '1.98x' },
        extraBets: 2,
      },
      {
        id: '7',
        dateTime: 'Amanhã, 15:00',
        homeTeam: { name: 'Brighton', icon: getTeamLogo("Brighton", escudoBrighton) },
        awayTeam: { name: 'West Ham', icon: getTeamLogo("West Ham", escudoWestHam) },
        odds: { home: '2.00x', draw: '3.50x', away: '3.60x' },
        doubleChanceOdds: { homeOrDraw: '1.28x', homeOrAway: '1.30x', awayOrDraw: '1.78x' },
        bothTeamsScoreOdds: { yes: '1.72x', no: '2.02x' },
        totalGoalsOdds: { line: 2.5, under: '1.88x', over: '1.88x' },
        totalCornersOdds: { line: 9.5, under: '1.85x', over: '1.90x' },
      },
      {
        id: '8',
        dateTime: 'Amanhã, 17:00',
        homeTeam: { name: 'Leeds', icon: getTeamLogo("Leeds", escudoLeeds) },
        awayTeam: { name: 'Burnley', icon: getTeamLogo("Burnley", escudoBurnley) },
        odds: { home: '2.20x', draw: '3.30x', away: '3.20x' },
        doubleChanceOdds: { homeOrDraw: '1.32x', homeOrAway: '1.32x', awayOrDraw: '1.62x' },
        bothTeamsScoreOdds: { yes: '1.80x', no: '1.95x' },
        totalGoalsOdds: { line: 2.5, under: '1.92x', over: '1.85x' },
        totalCornersOdds: { line: 9.5, under: '1.88x', over: '1.88x' },
      },
    ],
  },
  {
    id: 'la-liga',
    name: 'Espanha - La Liga',
    flag: flagEspanha,
    isOpen: false,
    sport: 'futebol',
    matches: [
      {
        id: '9',
        dateTime: 'Hoje, 14:00',
        homeTeam: { name: 'Getafe', icon: getTeamLogo("Getafe", escudoGetafe) },
        awayTeam: { name: 'Elche', icon: getTeamLogo("Elche", escudoElche) },
        odds: { home: '2.10x', draw: '3.20x', away: '3.50x' },
        doubleChanceOdds: { homeOrDraw: '1.28x', homeOrAway: '1.32x', awayOrDraw: '1.68x' },
        bothTeamsScoreOdds: { yes: '2.10x', no: '1.68x' },
        totalGoalsOdds: { line: 2.5, under: '1.70x', over: '2.10x' },
        totalCornersOdds: { line: 8.5, under: '1.82x', over: '1.92x' },
      },
      {
        id: '10',
        dateTime: 'Hoje, 16:00',
        homeTeam: { name: 'Alavés', icon: getTeamLogo("Alavés", escudoAlaves) },
        awayTeam: { name: 'Espanyol', icon: getTeamLogo("Espanyol", escudoEspanyol) },
        odds: { home: '2.40x', draw: '3.10x', away: '2.95x' },
        doubleChanceOdds: { homeOrDraw: '1.35x', homeOrAway: '1.33x', awayOrDraw: '1.52x' },
        bothTeamsScoreOdds: { yes: '1.90x', no: '1.85x' },
        totalGoalsOdds: { line: 2.5, under: '1.75x', over: '2.02x' },
        totalCornersOdds: { line: 9.5, under: '1.80x', over: '1.95x' },
      },
      {
        id: '11',
        dateTime: 'Amanhã, 18:30',
        homeTeam: { name: 'Mallorca', icon: getTeamLogo("Mallorca", escudoMallorca) },
        awayTeam: { name: 'Levante', icon: getTeamLogo("Levante", escudoLevante) },
        odds: { home: '2.25x', draw: '3.30x', away: '3.15x' },
        doubleChanceOdds: { homeOrDraw: '1.32x', homeOrAway: '1.32x', awayOrDraw: '1.60x' },
        bothTeamsScoreOdds: { yes: '1.75x', no: '2.00x' },
        totalGoalsOdds: { line: 2.5, under: '1.82x', over: '1.95x' },
        totalCornersOdds: { line: 9.5, under: '1.85x', over: '1.90x' },
      },
    ],
  },
  {
    id: 'bundesliga',
    name: 'Alemanha - Bundesliga',
    flag: flagAlemanha,
    isOpen: false,
    sport: 'futebol',
    matches: [
      {
        id: '12',
        dateTime: 'Hoje, 16:30',
        homeTeam: { name: 'B. Leverkusen', icon: getTeamLogo("B. Leverkusen", escudoBayerLeverkusen) },
        awayTeam: { name: 'Bayern', icon: getTeamLogo("Bayern", escudoBayerMunique) },
        odds: { home: '2.40x', draw: '3.40x', away: '2.80x' },
        doubleChanceOdds: { homeOrDraw: '1.42x', homeOrAway: '1.30x', awayOrDraw: '1.55x' },
        bothTeamsScoreOdds: { yes: '1.45x', no: '2.60x' },
        totalGoalsOdds: { line: 2.5, under: '2.15x', over: '1.68x' },
        totalCornersOdds: { line: 10.5, under: '1.75x', over: '2.00x' },
        extraBets: 2,
      },
      {
        id: '13',
        dateTime: 'Amanhã, 13:30',
        homeTeam: { name: 'Wolfsburg', icon: getTeamLogo("Wolfsburg", escudoWolfsburg) },
        awayTeam: { name: 'Eintracht', icon: getTeamLogo("Eintracht", escudoEintracht) },
        odds: { home: '2.70x', draw: '3.30x', away: '2.55x' },
        doubleChanceOdds: { homeOrDraw: '1.48x', homeOrAway: '1.32x', awayOrDraw: '1.45x' },
        bothTeamsScoreOdds: { yes: '1.68x', no: '2.10x' },
        totalGoalsOdds: { line: 2.5, under: '1.90x', over: '1.85x' },
        totalCornersOdds: { line: 9.5, under: '1.88x', over: '1.88x' },
      },
      {
        id: '14',
        dateTime: 'Amanhã, 15:30',
        homeTeam: { name: 'Augsburg', icon: getTeamLogo("Augsburg", escudoAugsburg) },
        awayTeam: { name: 'Hamburger', icon: getTeamLogo("Hamburger", escudoHamburger) },
        odds: { home: '2.50x', draw: '3.20x', away: '2.85x' },
        doubleChanceOdds: { homeOrDraw: '1.40x', homeOrAway: '1.33x', awayOrDraw: '1.50x' },
        bothTeamsScoreOdds: { yes: '1.72x', no: '2.02x' },
        totalGoalsOdds: { line: 2.5, under: '1.85x', over: '1.92x' },
        totalCornersOdds: { line: 9.5, under: '1.82x', over: '1.92x' },
      },
    ],
  },
  // Basketball
  {
    id: 'nba',
    name: 'NBA',
    flag: flagEstadosUnidos,
    isOpen: true,
    sport: 'basquete',
    matches: [
      {
        id: 'nba-pre-1',
        dateTime: 'Hoje, 22:00',
        homeTeam: { name: 'Bulls', icon: getTeamLogo("Bulls", escudoBulls) },
        awayTeam: { name: 'Heat', icon: getTeamLogo("Heat", escudoMiami) },
        odds: { home: '2.45x', away: '1.55x' },
        totalPointsOdds: { line: 218.5, under: '1.90x', over: '1.90x' },
        handicapOdds: { line: 6.5, home: '1.88x', away: '1.92x' },
        q3TotalOdds: { line: 54.5, under: '1.85x', over: '1.95x' },
        q4TotalOdds: { line: 56.5, under: '1.90x', over: '1.90x' },
        extraBets: 20,
      },
      {
        id: 'nba-pre-2',
        dateTime: 'Amanhã, 21:30',
        homeTeam: { name: 'Warriors', icon: getTeamLogo("Warriors", escudoWarriors) },
        awayTeam: { name: 'Lakers', icon: getTeamLogo("Lakers", escudoLakers) },
        odds: { home: '1.72x', away: '2.15x' },
        totalPointsOdds: { line: 228.5, under: '1.85x', over: '1.95x' },
        handicapOdds: { line: -4.5, home: '1.90x', away: '1.90x' },
        q3TotalOdds: { line: 57.5, under: '1.88x', over: '1.92x' },
        q4TotalOdds: { line: 58.5, under: '1.85x', over: '1.95x' },
        extraBets: 20,
      },
      {
        id: 'nba-pre-3',
        dateTime: 'Amanhã, 23:00',
        homeTeam: { name: 'Pistons', icon: getTeamLogo("Pistons", escudoPistons) },
        awayTeam: { name: 'Cavaliers', icon: getTeamLogo("Cavaliers", escudoCavaliers) },
        odds: { home: '3.20x', away: '1.35x' },
        totalPointsOdds: { line: 212.5, under: '1.92x', over: '1.88x' },
        handicapOdds: { line: 8.5, home: '1.85x', away: '1.95x' },
        q3TotalOdds: { line: 52.5, under: '1.90x', over: '1.90x' },
        q4TotalOdds: { line: 54.5, under: '1.88x', over: '1.92x' },
      },
    ],
  },
  {
    id: 'ncaab',
    name: 'NCAAB',
    flag: flagEstadosUnidos,
    isOpen: true,
    sport: 'basquete',
    matches: [
      {
        id: 'ncaab-pre-1',
        dateTime: 'Hoje, 20:00',
        homeTeam: { name: 'Lafayette', icon: escudoLafayette },
        awayTeam: { name: 'Pennsylvania', icon: escudoPennsylvania },
        odds: { home: '2.85x', away: '1.42x' },
        totalPointsOdds: { line: 142.5, under: '1.90x', over: '1.90x' },
        handicapOdds: { line: 7.5, home: '1.88x', away: '1.92x' },
        q3TotalOdds: { line: 35.5, under: '1.85x', over: '1.95x' },
        q4TotalOdds: { line: 36.5, under: '1.90x', over: '1.90x' },
        extraBets: 20,
      },
      {
        id: 'ncaab-pre-2',
        dateTime: 'Hoje, 21:00',
        homeTeam: { name: 'South Carolina State', icon: escudoSouthCarolina },
        awayTeam: { name: 'Charleston Southern', icon: '' },
        odds: { home: '1.95x', away: '1.85x' },
        totalPointsOdds: { line: 138.5, under: '1.88x', over: '1.92x' },
        handicapOdds: { line: -2.5, home: '1.90x', away: '1.90x' },
        q3TotalOdds: { line: 34.5, under: '1.90x', over: '1.90x' },
        q4TotalOdds: { line: 35.5, under: '1.85x', over: '1.95x' },
      },
      {
        id: 'ncaab-pre-3',
        dateTime: 'Hoje, 22:00',
        homeTeam: { name: 'Southern', icon: escudoSouthern },
        awayTeam: { name: 'Texas', icon: escudoTexas },
        odds: { home: '5.50x', away: '1.15x' },
        totalPointsOdds: { line: 148.5, under: '1.85x', over: '1.95x' },
        handicapOdds: { line: 14.5, home: '1.92x', away: '1.88x' },
        q3TotalOdds: { line: 37.5, under: '1.88x', over: '1.92x' },
        q4TotalOdds: { line: 38.5, under: '1.90x', over: '1.90x' },
      },
    ],
  },
  {
    id: 'euro-cup',
    name: 'Euro Cup',
    flag: flagMundo,
    isOpen: false,
    sport: 'basquete',
    matches: [
      {
        id: 'euro-pre-1',
        dateTime: 'Amanhã, 14:00',
        homeTeam: { name: 'Besiktas', icon: '' },
        awayTeam: { name: 'Lietkabelis', icon: '' },
        odds: { home: '1.72x', away: '2.10x' },
        totalPointsOdds: { line: 158.5, under: '1.90x', over: '1.90x' },
        handicapOdds: { line: -3.5, home: '1.88x', away: '1.92x' },
        q3TotalOdds: { line: 39.5, under: '1.85x', over: '1.95x' },
        q4TotalOdds: { line: 40.5, under: '1.90x', over: '1.90x' },
        extraBets: 20,
      },
      {
        id: 'euro-pre-2',
        dateTime: 'Amanhã, 15:00',
        homeTeam: { name: 'Chemnitz 99', icon: '' },
        awayTeam: { name: 'Panionios', icon: '' },
        odds: { home: '1.55x', away: '2.45x' },
        totalPointsOdds: { line: 162.5, under: '1.88x', over: '1.92x' },
        handicapOdds: { line: -5.5, home: '1.90x', away: '1.90x' },
        q3TotalOdds: { line: 40.5, under: '1.90x', over: '1.90x' },
        q4TotalOdds: { line: 41.5, under: '1.85x', over: '1.95x' },
      },
      {
        id: 'euro-pre-3',
        dateTime: 'Amanhã, 15:00',
        homeTeam: { name: 'Hapoel Jerusalem', icon: '' },
        awayTeam: { name: 'Hamburg Towers', icon: '' },
        odds: { home: '1.65x', away: '2.25x' },
        totalPointsOdds: { line: 165.5, under: '1.90x', over: '1.90x' },
        handicapOdds: { line: -4.5, home: '1.88x', away: '1.92x' },
        q3TotalOdds: { line: 41.5, under: '1.88x', over: '1.92x' },
        q4TotalOdds: { line: 42.5, under: '1.90x', over: '1.90x' },
      },
    ],
  },
  {
    id: 'argentina-liga',
    name: 'Argentina - La Liga',
    flag: flagArgentina,
    isOpen: false,
    sport: 'basquete',
    matches: [
      {
        id: 'arg-pre-1',
        dateTime: 'Hoje, 20:00',
        homeTeam: { name: 'Independiente Santiago del Estero', icon: '' },
        awayTeam: { name: 'Sportivo Suardi', icon: '' },
        odds: { home: '1.45x', away: '2.70x' },
        totalPointsOdds: { line: 168.5, under: '1.90x', over: '1.90x' },
        handicapOdds: { line: -6.5, home: '1.88x', away: '1.92x' },
        q3TotalOdds: { line: 42.5, under: '1.85x', over: '1.95x' },
        q4TotalOdds: { line: 43.5, under: '1.90x', over: '1.90x' },
        extraBets: 20,
      },
      {
        id: 'arg-pre-2',
        dateTime: 'Hoje, 20:30',
        homeTeam: { name: 'Santa Paula de Galvez', icon: '' },
        awayTeam: { name: 'San Isidro', icon: '' },
        odds: { home: '2.15x', away: '1.70x' },
        totalPointsOdds: { line: 162.5, under: '1.88x', over: '1.92x' },
        handicapOdds: { line: 4.5, home: '1.90x', away: '1.90x' },
        q3TotalOdds: { line: 40.5, under: '1.90x', over: '1.90x' },
        q4TotalOdds: { line: 41.5, under: '1.85x', over: '1.95x' },
      },
      {
        id: 'arg-pre-3',
        dateTime: 'Hoje, 21:00',
        homeTeam: { name: 'Ciclista', icon: '' },
        awayTeam: { name: 'Racing Avellaneda', icon: '' },
        odds: { home: '1.85x', away: '1.95x' },
        totalPointsOdds: { line: 158.5, under: '1.90x', over: '1.90x' },
        handicapOdds: { line: -1.5, home: '1.88x', away: '1.92x' },
        q3TotalOdds: { line: 39.5, under: '1.88x', over: '1.92x' },
        q4TotalOdds: { line: 40.5, under: '1.90x', over: '1.90x' },
      },
    ],
  },
  {
    id: 'brasil-nbb',
    name: 'Brasil - NBB',
    flag: flagBrasil,
    isOpen: false,
    sport: 'basquete',
    matches: [
      {
        id: 'nbb-pre-1',
        dateTime: 'Hoje, 20:00',
        homeTeam: { name: 'Botafogo', icon: getTeamLogo("Botafogo", escudoBotafogo) },
        awayTeam: { name: 'Caxias do Sul', icon: getTeamLogo("Caxias do Sul", escudoCaxias) },
        odds: { home: '1.55x', away: '2.45x' },
        totalPointsOdds: { line: 172.5, under: '1.90x', over: '1.90x' },
        handicapOdds: { line: -5.5, home: '1.88x', away: '1.92x' },
        q3TotalOdds: { line: 43.5, under: '1.85x', over: '1.95x' },
        q4TotalOdds: { line: 44.5, under: '1.90x', over: '1.90x' },
        extraBets: 20,
      },
    ],
  },
  ]

export function PreMatchSection({ onOpenCompetition, onMatchClick }: PreMatchSectionProps = {}) {
  const [activeSport, setActiveSport] = useState('futebol')
  const [activeMarket, setActiveMarket] = useState('resultado-final')
  const [openLeagues, setOpenLeagues] = useState<string[]>(
    leagues.filter((l) => l.isOpen).map((l) => l.id)
  )
  const [showBottomSheet, setShowBottomSheet] = useState(false)
  const [bottomSheetSport, setBottomSheetSport] = useState<'futebol' | 'basquete'>('futebol')
  
  // Refs for auto-scroll chips
  const sectionRef = useRef<HTMLElement>(null)
  const sportChipsRef = useRef<HTMLDivElement>(null)
  const marketChipsRef = useRef<HTMLDivElement>(null)
  const sportChipRefs = useRef<(HTMLButtonElement | null)[]>([])
  const marketChipRefs = useRef<(HTMLButtonElement | null)[]>([])
  const marketStickyState = useHomeMarketStickyState(sectionRef, marketChipsRef)

  // Reset market chips scroll position when sport changes
  useEffect(() => {
    if (marketChipsRef.current) {
      marketChipsRef.current.scrollTo({ left: 0, behavior: 'smooth' })
    }
  }, [activeSport])

  const openReiAntecipaSheet = (sport: 'futebol' | 'basquete') => {
    setBottomSheetSport(sport)
    setShowBottomSheet(true)
  }

  // Get current market chips and filtered leagues based on sport
  const currentMarketChips = activeSport === 'basquete' ? basketballMarketChips : footballMarketChips
  const filteredLeagues = leagues.filter((l) => l.sport === activeSport)
  const activeSportChipIndex = sportChips.findIndex((chip) => chip.id === activeSport)
  const activeMarketChipIndex = currentMarketChips.findIndex((chip) => chip.id === activeMarket)
  const marketIndicatorKey = `${activeSport}:${activeMarket}:${currentMarketChips.map((chip) => chip.id).join('|')}`

  useSlidingActiveIndicator({
    activeKey: activeSport,
    containerRef: sportChipsRef,
    getActiveElement: () => sportChipRefs.current[activeSportChipIndex],
  })

  useSlidingActiveIndicator({
    activeKey: marketIndicatorKey,
    containerRef: marketChipsRef,
    getActiveElement: () => marketChipRefs.current[activeMarketChipIndex],
  })

  const openCompetitionFromLeague = (leagueId: string) => {
    const target = getCompetitionLinkTarget(leagueId)
    if (!target) return
    onOpenCompetition?.(target)
  }

  const toLiveEventMatch = (league: League, match: Match): LiveEventMatch => ({
    id: match.id,
    leagueId: league.id,
    leagueName: league.name,
    leagueFlag: league.flag,
    sport: league.sport,
    isLive: false,
    time: match.dateTime,
    dateTime: match.dateTime,
    currentTime: match.dateTime,
    homeTeam: {
      ...match.homeTeam,
      score: 0,
    },
    awayTeam: {
      ...match.awayTeam,
      score: 0,
    },
    odds: match.odds,
    doubleChanceOdds: match.doubleChanceOdds,
    bothTeamsScoreOdds: match.bothTeamsScoreOdds,
    totalGoalsOdds: match.totalGoalsOdds,
    totalCornersOdds: match.totalCornersOdds,
    totalPointsOdds: match.totalPointsOdds,
    handicapOdds: match.handicapOdds,
    q3TotalOdds: match.q3TotalOdds,
    q4TotalOdds: match.q4TotalOdds,
    extraBets: match.extraBets,
  })

  const openPreMatchEvent = (league: League, selectedIndex: number) => {
    const selectedMatch = league.matches[selectedIndex]
    if (!selectedMatch) return

    const eventEntries = filteredLeagues.flatMap((eventLeague) => (
      eventLeague.matches.map((match) => ({ league: eventLeague, match }))
    ))
    const selectedEventIndex = eventEntries.findIndex(({ league: eventLeague, match }) => (
      eventLeague.id === league.id && match.id === selectedMatch.id
    ))

    const currentTimes = eventEntries.reduce<Record<string, string>>((times, { match }) => {
      times[match.id] = match.dateTime
      return times
    }, {})

    onMatchClick?.({
      matches: eventEntries.map(({ league: eventLeague, match }) => toLiveEventMatch(eventLeague, match)),
      selectedIndex: Math.max(0, selectedEventIndex),
      leagueName: league.name,
      leagueFlag: league.flag,
      sport: league.sport,
      currentTimes,
    })
  }

  const toggleLeague = (leagueId: string) => {
    setOpenLeagues((prev) =>
      prev.includes(leagueId)
        ? prev.filter((id) => id !== leagueId)
        : [...prev, leagueId]
    )
  }

  return (
    <section id="section-breve" className="prematch-section" ref={sectionRef}>
      {/* Header */}
      <div className="prematch-section__header">
        <div className="prematch-section__title">
          <span>Começa em Breve</span>
          <CaretRightIcon aria-hidden="true" className="prematch-section__arrow" weight="bold" />
        </div>
      </div>

      {/* Sport Chips */}
      <div className="prematch-section__chips sliding-chip-group" ref={sportChipsRef}>
        <span className="sliding-chip-indicator" aria-hidden="true" />
        {sportChips.map((chip, index) => (
          <button
            key={chip.id}
            ref={(el) => { sportChipRefs.current[index] = el }}
            className={`prematch-section__chip sliding-chip ${activeSport === chip.id ? 'prematch-section__chip--active' : ''} ${chip.disabled ? 'prematch-section__chip--disabled' : ''}`}
            onClick={() => {
              if (chip.disabled) return
              setActiveSport(chip.id)
              setActiveMarket(chip.id === 'basquete' ? 'vencedor' : 'resultado-final')
              // Scroll to make chip visible
              const chipEl = sportChipRefs.current[index]
              const containerEl = sportChipsRef.current
              if (chipEl && containerEl) {
                const chipLeft = chipEl.offsetLeft
                const chipWidth = chipEl.offsetWidth
                const containerWidth = containerEl.offsetWidth
                const containerScroll = containerEl.scrollLeft
                const padding = 12
                if (chipLeft + chipWidth > containerScroll + containerWidth - padding) {
                  containerEl.scrollTo({ left: chipLeft - padding, behavior: 'smooth' })
                } else if (chipLeft < containerScroll + padding) {
                  containerEl.scrollTo({ left: chipLeft - padding, behavior: 'smooth' })
                }
              }
            }}
            disabled={chip.disabled}
          >
            <img src={chip.icon} alt="" className="prematch-section__chip-icon" />
            <span data-text={chip.label}>{chip.label}</span>
          </button>
        ))}
      </div>

      {/* Market Chips */}
      <div className={`prematch-section__chips prematch-section__chips--sticky sliding-chip-group sliding-chip-group--indicator-ready${marketStickyState.isStuck ? ' prematch-section__chips--sticky-stuck' : ''}${marketStickyState.isVisible ? '' : ' prematch-section__chips--sticky-hidden'}`} ref={marketChipsRef}>
        <span className="sliding-chip-indicator" aria-hidden="true" />
        {currentMarketChips.map((chip, index) => (
          <button
            key={chip.id}
            ref={(el) => { marketChipRefs.current[index] = el }}
            className={`prematch-section__chip prematch-section__chip--market sliding-chip ${activeMarket === chip.id ? 'prematch-section__chip--active' : ''}`}
            onClick={() => {
              setActiveMarket(chip.id)
              // Scroll to make chip visible
              const chipEl = marketChipRefs.current[index]
              const containerEl = marketChipsRef.current
              if (chipEl && containerEl) {
                const chipLeft = chipEl.offsetLeft
                const chipWidth = chipEl.offsetWidth
                const containerWidth = containerEl.offsetWidth
                const containerScroll = containerEl.scrollLeft
                const padding = 12
                if (chipLeft + chipWidth > containerScroll + containerWidth - padding) {
                  containerEl.scrollTo({ left: chipLeft - padding, behavior: 'smooth' })
                } else if (chipLeft < containerScroll + padding) {
                  containerEl.scrollTo({ left: chipLeft - padding, behavior: 'smooth' })
                }
              }
            }}
          >
            <span data-text={chip.label}>{chip.label}</span>
          </button>
        ))}
      </div>

      {/* Leagues */}
      <div className="prematch-section__leagues">
        {filteredLeagues.map((league) => (
          <div key={league.id} className={`prematch-section__league ${openLeagues.includes(league.id) ? 'prematch-section__league--open' : ''}`}>
            {/* League Header */}
            <button
              className="prematch-section__league-header"
              onClick={() => toggleLeague(league.id)}
            >
              <div className="prematch-section__league-title">
                <img src={league.flag} alt="" className="prematch-section__league-flag" />
                <span>{league.name}</span>
              </div>
              <CaretUpIcon
                aria-hidden="true"
                className={`prematch-section__accordion-icon ${openLeagues.includes(league.id) ? 'prematch-section__accordion-icon--open' : ''}`}
                weight="bold"
              />
            </button>

            {/* League Matches with Animation */}
            {league.matches.length > 0 && (
              <div className={`prematch-section__matches-wrapper ${openLeagues.includes(league.id) ? 'prematch-section__matches-wrapper--open' : ''}`}>
                <div className="prematch-section__matches-inner">
                  <div className="prematch-section__matches">
                    {league.matches.map((match, matchIndex) => (
                      <div
                        key={match.id}
                        className={`prematch-section__match${onMatchClick ? ' prematch-section__match--clickable' : ''}`}
                        onClick={onMatchClick ? () => openPreMatchEvent(league, matchIndex) : undefined}
                      >
                        {/* Match Header */}
                        <div className="prematch-section__match-header">
                          <div className="prematch-section__teams-compact">
                            <div className="prematch-section__team-row">
                              <PreMatchTeamIcon
                                teamName={match.homeTeam.name}
                                currentIcon={match.homeTeam.icon}
                                sport={league.sport}
                                side="home"
                              />
                              <span className="prematch-section__team-name">{match.homeTeam.name}</span>
                            </div>
                            <div className="prematch-section__team-row">
                              <PreMatchTeamIcon
                                teamName={match.awayTeam.name}
                                currentIcon={match.awayTeam.icon}
                                sport={league.sport}
                                side="away"
                              />
                              <span className="prematch-section__team-name">{match.awayTeam.name}</span>
                            </div>
                          </div>
                          <div className="prematch-section__match-info">
                            {match.extraBets && (activeMarket === 'resultado-final' || activeMarket === 'vencedor') ? (
                              <button 
                                type="button"
                                className="prematch-section__match-info-content prematch-section__match-info-content--clickable"
                                onClick={(e) => { e.stopPropagation(); openReiAntecipaSheet(league.sport as 'futebol' | 'basquete'); }}
                              >
                                <div className="prematch-section__pag-antecipado">
                                  <span className="prematch-section__pag-antecipado-label">Pag. Antecipado</span>
                                  <img 
                                    src={league.sport === 'basquete' ? reiAntecipaBasquete : reiAntecipaFutebol} 
                                    alt="" 
                                    className="prematch-section__rei-antecipa" 
                                  />
                                </div>
                            <span className="prematch-section__match-datetime">{match.dateTime}</span>
                              </button>
                            ) : (
                              <div className="prematch-section__match-info-content">
                                <span className="prematch-section__match-datetime">{match.dateTime}</span>
                              </div>
                            )}
                            <CaretRightIcon aria-hidden="true" className="prematch-section__match-arrow" weight="bold" />
                          </div>
                        </div>

                        {/* Odds */}
                        <div className="prematch-section__odds">
                          {/* Football Markets */}
                          {activeMarket === 'dupla-chance' && match.doubleChanceOdds ? (
                            <>
                              <button className="prematch-section__odd-btn">
                                <span className="prematch-section__odd-team">Casa ou Empate</span>
                                <span className="prematch-section__odd-value">{match.doubleChanceOdds.homeOrDraw}</span>
                              </button>
                              <button className="prematch-section__odd-btn">
                                <span className="prematch-section__odd-team">Casa ou Fora</span>
                                <span className="prematch-section__odd-value">{match.doubleChanceOdds.homeOrAway}</span>
                              </button>
                              <button className="prematch-section__odd-btn">
                                <span className="prematch-section__odd-team">Fora ou Empate</span>
                                <span className="prematch-section__odd-value">{match.doubleChanceOdds.awayOrDraw}</span>
                              </button>
                            </>
                          ) : activeMarket === 'ambos-marcam' && match.bothTeamsScoreOdds ? (
                            <>
                              <button className="prematch-section__odd-btn">
                                <span className="prematch-section__odd-team">Sim</span>
                                <span className="prematch-section__odd-value">{match.bothTeamsScoreOdds.yes}</span>
                              </button>
                              <button className="prematch-section__odd-btn">
                                <span className="prematch-section__odd-team">Não</span>
                                <span className="prematch-section__odd-value">{match.bothTeamsScoreOdds.no}</span>
                              </button>
                            </>
                          ) : activeMarket === 'total-gols' && match.totalGoalsOdds ? (
                            <>
                              <button className="prematch-section__odd-btn">
                                <span className="prematch-section__odd-team">Menos de {match.totalGoalsOdds.line}</span>
                                <span className="prematch-section__odd-value">{match.totalGoalsOdds.under}</span>
                              </button>
                              <button className="prematch-section__odd-btn">
                                <span className="prematch-section__odd-team">Mais de {match.totalGoalsOdds.line}</span>
                                <span className="prematch-section__odd-value">{match.totalGoalsOdds.over}</span>
                              </button>
                            </>
                          ) : activeMarket === 'escanteios' && match.totalCornersOdds ? (
                            <>
                              <button className="prematch-section__odd-btn">
                                <span className="prematch-section__odd-team">Menos de {match.totalCornersOdds.line}</span>
                                <span className="prematch-section__odd-value">{match.totalCornersOdds.under}</span>
                              </button>
                              <button className="prematch-section__odd-btn">
                                <span className="prematch-section__odd-team">Mais de {match.totalCornersOdds.line}</span>
                                <span className="prematch-section__odd-value">{match.totalCornersOdds.over}</span>
                              </button>
                            </>
                          ) : activeMarket === 'total-pontos' && match.totalPointsOdds ? (
                            /* Basketball: Total de Pontos */
                            <>
                              <button className="prematch-section__odd-btn">
                                <span className="prematch-section__odd-team">Menos de {match.totalPointsOdds.line}</span>
                                <span className="prematch-section__odd-value">{match.totalPointsOdds.under}</span>
                              </button>
                              <button className="prematch-section__odd-btn">
                                <span className="prematch-section__odd-team">Mais de {match.totalPointsOdds.line}</span>
                                <span className="prematch-section__odd-value">{match.totalPointsOdds.over}</span>
                              </button>
                            </>
                          ) : activeMarket === 'handicap' && match.handicapOdds ? (
                            /* Basketball: Handicap */
                            <>
                              <button className="prematch-section__odd-btn">
                                <span className="prematch-section__odd-team">{match.homeTeam.name} {match.handicapOdds.line > 0 ? '+' : ''}{match.handicapOdds.line}</span>
                                <span className="prematch-section__odd-value">{match.handicapOdds.home}</span>
                              </button>
                              <button className="prematch-section__odd-btn">
                                <span className="prematch-section__odd-team">{match.awayTeam.name} {match.handicapOdds.line > 0 ? '' : '+'}{-match.handicapOdds.line}</span>
                                <span className="prematch-section__odd-value">{match.handicapOdds.away}</span>
                              </button>
                            </>
                          ) : activeMarket === 'q3-total' && match.q3TotalOdds ? (
                            /* Basketball: 3° Quarto - Total de Pontos */
                            <>
                              <button className="prematch-section__odd-btn">
                                <span className="prematch-section__odd-team">Menos de {match.q3TotalOdds.line}</span>
                                <span className="prematch-section__odd-value">{match.q3TotalOdds.under}</span>
                              </button>
                              <button className="prematch-section__odd-btn">
                                <span className="prematch-section__odd-team">Mais de {match.q3TotalOdds.line}</span>
                                <span className="prematch-section__odd-value">{match.q3TotalOdds.over}</span>
                              </button>
                            </>
                          ) : activeMarket === 'q4-total' && match.q4TotalOdds ? (
                            /* Basketball: 4° Quarto - Total de Pontos */
                            <>
                              <button className="prematch-section__odd-btn">
                                <span className="prematch-section__odd-team">Menos de {match.q4TotalOdds.line}</span>
                                <span className="prematch-section__odd-value">{match.q4TotalOdds.under}</span>
                              </button>
                              <button className="prematch-section__odd-btn">
                                <span className="prematch-section__odd-team">Mais de {match.q4TotalOdds.line}</span>
                                <span className="prematch-section__odd-value">{match.q4TotalOdds.over}</span>
                              </button>
                            </>
                          ) : activeMarket === 'vencedor' || activeSport === 'basquete' ? (
                            /* Basketball: Vencedor (no draw) */
                            <>
                              <button className="prematch-section__odd-btn">
                                <span className="prematch-section__odd-team">{match.homeTeam.name}</span>
                                <span className="prematch-section__odd-value">{match.odds.home}</span>
                              </button>
                              <button className="prematch-section__odd-btn">
                                <span className="prematch-section__odd-team">{match.awayTeam.name}</span>
                                <span className="prematch-section__odd-value">{match.odds.away}</span>
                              </button>
                            </>
                          ) : (
                            /* Football: Resultado Final (default) */
                            <>
                              <button className="prematch-section__odd-btn">
                                <span className="prematch-section__odd-team">{match.homeTeam.name}</span>
                                <span className="prematch-section__odd-value">{match.odds.home}</span>
                              </button>
                              <button className="prematch-section__odd-btn">
                                <span className="prematch-section__odd-team">Empate</span>
                                <span className="prematch-section__odd-value">{match.odds.draw}</span>
                              </button>
                              <button className="prematch-section__odd-btn">
                                <span className="prematch-section__odd-team">{match.awayTeam.name}</span>
                                <span className="prematch-section__odd-value">{match.odds.away}</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="prematch-section__league-more"
                    onClick={() => openCompetitionFromLeague(league.id)}
                  >
                    <span>Veja mais {league.name}</span>
                    <CaretRightIcon aria-hidden="true" className="prematch-section__league-more-icon" weight="bold" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* More Button */}
      <div className="prematch-section__more">
        <button className="prematch-section__more-btn">
          <span>Mais {activeSport === 'basquete' ? 'Basquete' : 'Futebol'}</span>
          <CaretRightIcon aria-hidden="true" className="prematch-section__more-icon" weight="bold" />
        </button>
      </div>

      {/* Bottom Sheet - Rei Antecipa */}
      <ReiAntecipaBottomSheet
        isOpen={showBottomSheet}
        onClose={() => setShowBottomSheet(false)}
        sport={bottomSheetSport}
      />
    </section>
  )
}
