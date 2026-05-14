import { getTeamLogo } from '../../data/teamLogos'
import { useSportsDbTeamLogo } from '../../hooks/useSportsDbTeamLogo'
import iconBasquete from '../../assets/iconSports/basketball.png'
import iconFutebol from '../../assets/iconSports/soccer.png'
import iconTenis from '../../assets/iconSports/tennis.png'
import { getTennisPlayerCountryIcon } from '../../data/tennisCountryIcons'

function getSportFallbackLogo(sport: string) {
  if (sport === 'basquete') return iconBasquete
  if (sport === 'futebol') return iconFutebol
  if (sport === 'tenis') return iconTenis
  return ''
}

interface TeamLogoProps {
  teamName: string
  sport: string
  currentLogo?: string
  className: string
  fallbackClassName?: string
  placeholderClassName?: string
  alt?: string
  useCurrentLogoFallback?: boolean
}

export function TeamLogo({
  teamName,
  sport,
  currentLogo,
  className,
  fallbackClassName = '',
  placeholderClassName = '',
  alt = '',
  useCurrentLogoFallback = true,
}: TeamLogoProps) {
  const mappedLogo = getTeamLogo(teamName)
  const currentTeamLogo = mappedLogo || currentLogo
  const fallbackLogo = getSportFallbackLogo(sport)
  const sportsDbResolvedLogo = useSportsDbTeamLogo(teamName, currentTeamLogo, sport, fallbackLogo || undefined, {
    useCurrentLogoFallback,
  })
  const tennisCountryIcon = sport === 'tenis' ? getTennisPlayerCountryIcon(teamName) : ''
  const resolvedLogo = tennisCountryIcon || sportsDbResolvedLogo

  if (!resolvedLogo) {
    return placeholderClassName ? <span className={placeholderClassName} /> : null
  }

  const isFallback = fallbackLogo && resolvedLogo === fallbackLogo
  const logoClassName = [
    className,
    isFallback ? fallbackClassName : '',
  ].filter(Boolean).join(' ')

  return <img src={resolvedLogo} alt={alt} className={logoClassName} />
}
