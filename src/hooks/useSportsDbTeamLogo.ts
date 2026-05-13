import { useEffect, useState } from 'react'
import { getSportsDbTeamLogo, isSportsDbTeamLogoUrl } from '../services/theSportsDbTeamLogos'

interface ResolvedTeamLogo {
  teamName: string
  sport: string
  logoUrl: string
}

export function useSportsDbTeamLogo(
  teamName: string,
  currentLogo: string | undefined,
  sport: string,
  fallbackLogo?: string
) {
  const [resolvedLogo, setResolvedLogo] = useState<ResolvedTeamLogo | null>(null)

  useEffect(() => {
    let cancelled = false

    if (!teamName || sport === 'tenis' || isSportsDbTeamLogoUrl(currentLogo)) return

    getSportsDbTeamLogo(teamName, sport).then((logoUrl) => {
      if (!cancelled && logoUrl) setResolvedLogo({ teamName, sport, logoUrl })
    })

    return () => {
      cancelled = true
    }
  }, [currentLogo, sport, teamName])

  if (isSportsDbTeamLogoUrl(currentLogo)) return currentLogo
  if (resolvedLogo?.teamName === teamName && resolvedLogo.sport === sport) return resolvedLogo.logoUrl

  return currentLogo || fallbackLogo
}
