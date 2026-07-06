import { useMemo } from 'react'
import './BetSuccessPage.css'

import backgroundTextPitaco from '../../assets/iconsDraftaco/backgroundTextPitaco.svg'
import iconShieldVersusPlaceholder from '../../assets/iconsDraftaco/iconShieldVersusPlaceholder.svg'
import ilustraApostaCriada from '../../assets/iconsDraftaco/ilustraApostaCriada.png'
import logoPitacoApostaCriada from '../../assets/iconsDraftaco/logoPitacoApostaCriada.svg'
import { useSportsDbTeamLogo } from '../../hooks/useSportsDbTeamLogo'
import type { BetslipSelection } from '../../hooks/betslipUtils'
import {
  formatMoney,
  getPlayerAvatarFallbackSrc,
  getPlayerSelectionValueLabel,
  getSelectionAvatarDrawContext,
  getSelectionAvatarFallback,
  getSelectionAvatarTeamContext,
  getSelectionBadges,
  getSelectionEventMeta,
  getSelectionMarketLabel,
  getSelectionTeamSuffix,
  getSelectionTitle,
  groupSelectionsByEvent,
} from '../BetslipPageV2/betslipDisplayUtils'

export interface BetSuccessReceipt {
  selections: BetslipSelection[]
  stakeCents: number
  totalOddsLabel: string
  potentialWinLabel: string
  createdAtMs: number
}

interface BetSuccessPageProps {
  receipt: BetSuccessReceipt
  onNewBet: () => void
  onShare?: () => void
}

function BetSuccessSelectionAvatar({ selection }: { selection: BetslipSelection }) {
  const isPlayerSelection = selection.selectionType === 'player'
  const drawContext = isPlayerSelection ? null : getSelectionAvatarDrawContext(selection)
  const teamContext = isPlayerSelection ? null : getSelectionAvatarTeamContext(selection)
  const resolvedDrawHomeLogo = useSportsDbTeamLogo(
    drawContext?.homeTeam ?? '',
    drawContext?.homeLogo,
    selection.sport ?? '',
    undefined,
    { useCurrentLogoFallback: true }
  )
  const resolvedDrawAwayLogo = useSportsDbTeamLogo(
    drawContext?.awayTeam ?? '',
    drawContext?.awayLogo,
    selection.sport ?? '',
    undefined,
    { useCurrentLogoFallback: true }
  )
  const resolvedTeamLogo = useSportsDbTeamLogo(
    teamContext?.teamName ?? '',
    teamContext?.currentLogo,
    selection.sport ?? '',
    teamContext?.fallbackLogo,
    { useCurrentLogoFallback: true }
  )
  const iconSrc = isPlayerSelection
    ? selection.playerImage || getPlayerAvatarFallbackSrc(selection)
    : resolvedTeamLogo || teamContext?.fallbackLogo || getSelectionAvatarFallback(selection)

  if (drawContext) {
    const hasVersusTeamLogos = Boolean(resolvedDrawHomeLogo && resolvedDrawAwayLogo)

    return (
      <span className="bet-success__selection-avatar bet-success__selection-avatar--versus" aria-hidden="true">
        {hasVersusTeamLogos ? (
          <span className="bet-success__avatar-stack">
            <img
              className="bet-success__avatar-stack-logo bet-success__avatar-stack-logo--home"
              src={resolvedDrawHomeLogo}
              alt=""
              draggable="false"
            />
            <img
              className="bet-success__avatar-stack-logo bet-success__avatar-stack-logo--away"
              src={resolvedDrawAwayLogo}
              alt=""
              draggable="false"
            />
          </span>
        ) : (
          <img src={iconShieldVersusPlaceholder} alt="" draggable="false" />
        )}
      </span>
    )
  }

  return (
    <span
      className={[
        'bet-success__selection-avatar',
        isPlayerSelection ? 'bet-success__selection-avatar--player' : '',
      ].filter(Boolean).join(' ')}
      aria-hidden="true"
    >
      <img src={iconSrc} alt="" draggable="false" />
    </span>
  )
}

function BetSuccessTitleLine({ selection }: { selection: BetslipSelection }) {
  const title = getSelectionTitle(selection)
  const teamSuffix = getSelectionTeamSuffix(selection)
  const playerChoice = getPlayerSelectionValueLabel(selection)

  return (
    <div className="bet-success__selection-title">
      <strong>{title}</strong>
      {teamSuffix ? <span>{teamSuffix}</span> : null}
      {playerChoice ? (
        <>
          <span aria-hidden="true">|</span>
          <strong>{playerChoice}</strong>
        </>
      ) : null}
    </div>
  )
}

function BetSuccessSelectionRow({ selection }: { selection: BetslipSelection }) {
  const badges = getSelectionBadges(selection)

  return (
    <article className="bet-success__selection-row">
      <div className="bet-success__selection-meta">{getSelectionEventMeta(selection)}</div>
      <div className="bet-success__selection-body">
        <BetSuccessSelectionAvatar selection={selection} />
        <div className="bet-success__selection-copy">
          <div className="bet-success__market-line">
            <span>{getSelectionMarketLabel(selection)}</span>
            {badges.map((badge) => <em key={badge}>{badge}</em>)}
          </div>
          <BetSuccessTitleLine selection={selection} />
        </div>
        <strong className="bet-success__selection-odd">{selection.oddLabel}</strong>
      </div>
    </article>
  )
}

export function BetSuccessPage({ receipt, onNewBet, onShare }: BetSuccessPageProps) {
  const stakeLabel = formatMoney(receipt.stakeCents)
  const hasSgp = useMemo(() => (
    groupSelectionsByEvent(receipt.selections).some((group) => group.selections.length > 1)
  ), [receipt.selections])

  return (
    <main className="bet-success" aria-labelledby="bet-success-title">
      <div className="bet-success__top-light" aria-hidden="true" />
      <section className="bet-success__content" aria-label="Aposta criada">
        <div className="bet-success__background-text" aria-hidden="true">
          <img src={backgroundTextPitaco} alt="" draggable="false" />
        </div>

        <div className="bet-success__ticket">
          <header className="bet-success__overview">
            <div className="bet-success__overview-copy">
              <h1 id="bet-success-title">APOSTA CRIADA!</h1>
              <div className="bet-success__win-row">
                <strong>{receipt.potentialWinLabel}</strong>
                <span>Ganho potencial</span>
              </div>
              <div className="bet-success__overview-meta">
                <span>Entrada: <strong>{stakeLabel}</strong></span>
                <span>Odds: <strong>{receipt.totalOddsLabel}</strong></span>
                {hasSgp ? <em>SGP</em> : null}
              </div>
            </div>
            <img className="bet-success__success-art" src={ilustraApostaCriada} alt="" draggable="false" />
          </header>

          <div className="bet-success__separator" aria-hidden="true">
            <span />
            <img src={logoPitacoApostaCriada} alt="" draggable="false" />
            <span />
          </div>

          <section className="bet-success__selections" aria-label="Seleções da aposta">
            {receipt.selections.map((selection) => (
              <BetSuccessSelectionRow key={selection.id} selection={selection} />
            ))}
          </section>
        </div>
      </section>

      <footer className="bet-success__footer">
        <button type="button" className="bet-success__button bet-success__button--primary" onClick={onShare}>
          Compartilhar
        </button>
        <button type="button" className="bet-success__button bet-success__button--secondary" onClick={onNewBet}>
          Fazer outra aposta
        </button>
      </footer>
    </main>
  )
}
