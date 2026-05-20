import { CalendarSection } from '../CalendarSection'
import type { LiveEventOpenPayload } from '../../pages/LiveEventPage'
import type { CompetitionLinkTarget } from '../../utils/competitionNavigation'

interface CompetitionPageProps {
  sport: string
  competitionId: string
  liveOnly?: boolean
  onLiveMatchClick?: (payload: LiveEventOpenPayload) => void
  onOpenCompetition?: (target: CompetitionLinkTarget) => void
}

export function CompetitionPage({
  sport,
  competitionId,
  liveOnly = false,
  onLiveMatchClick,
  onOpenCompetition,
}: CompetitionPageProps) {
  return (
    <CalendarSection
      sportFilter={sport}
      competitionId={competitionId}
      liveOnly={liveOnly}
      onLiveMatchClick={onLiveMatchClick}
      onOpenCompetition={onOpenCompetition}
    />
  )
}
