import { CaretRightIcon } from '@phosphor-icons/react'
import iconAoVivo from '../../assets/iconAoVivo.png'
import popularTiger from '../../assets/jogosCassino/10maispopulares/pgsoft-fortune-tiger@poster-alternative-q80.webp'
import popularDog from '../../assets/jogosCassino/10maispopulares/pragmatic-play-cachorro-sortudo@poster-alternative-q80.webp'
import popularMonkey from '../../assets/jogosCassino/10maispopulares/pragmatic-play-lucky-monkey@poster-alternative-q80.webp'
import popularTiger1000 from '../../assets/jogosCassino/10maispopulares/pragmatic-play-tigre-sortudo-1000@poster-alternative-q80.webp'
import popularBull from '../../assets/jogosCassino/10maispopulares/pragmatic-play-touro-sortudo@poster-alternative-q80.webp'
import liveBacBo from '../../assets/jogosCassino/aoVivo/evolution-bac-bo@poster-alternative-q80.webp'
import liveCrazyTime from '../../assets/jogosCassino/aoVivo/evolution-crazy-time@poster-alternative-q80.webp'
import liveCrazyTimeA from '../../assets/jogosCassino/aoVivo/evolution-crazy-time-a@poster-alternative-q80.webp'
import liveIceFishing from '../../assets/jogosCassino/aoVivo/evolution-ice-fishing@poster-alternative-q80.webp'
import liveBrazilianOneBlackjack from '../../assets/jogosCassino/aoVivo/pragmatic-brazilian-one-blackjack@poster-alternative-q80.webp'
import cashbackOlympus from '../../assets/jogosCassino/cashback/pragmatic-gates-olympus-1000@poster-alternative-q80.webp'
import cashbackBass from '../../assets/jogosCassino/cashback/pragmatic-play-big-bass-bonanza-1000@poster-alternative-q80.webp'
import cashbackSpaceman from '../../assets/jogosCassino/cashback/pragmatic-spaceman@poster-alternative-q80.webp'
import cashbackJaguar from '../../assets/jogosCassino/cashback/tada-gaming-lucky-jaguar-500@poster-alternative-q80.webp'
import cashbackMacaw from '../../assets/jogosCassino/cashback/tadagaming-lucky-macaw@poster-alternative-q80.webp'
import winningPhoenix from '../../assets/jogosCassino/ganhandoAgora/games-global-area-link-phoenix-firestorm@poster-alternative-q80.webp'
import winningGoldenTiger from '../../assets/jogosCassino/ganhandoAgora/games-global-golden-tiger-jackpot-fortunes@poster-alternative-q80.webp'
import winningRabbit from '../../assets/jogosCassino/ganhandoAgora/pgsoft-fortune-rabbit@poster-alternative-q80.webp'
import winningTigerGold from '../../assets/jogosCassino/ganhandoAgora/pragmatic-play-tigre-sortudo-gold@poster-alternative-q80.webp'
import winningMouse from '../../assets/jogosCassino/ganhandoAgora/pragmatic-ratinho-sortudo@poster-alternative-q80.webp'
import newAmun from '../../assets/jogosCassino/novidades/games-global-mask-amun-gold-blitz-ultimate@poster-alternative-q80.webp'
import newOlympus from '../../assets/jogosCassino/novidades/games-global-raging-gods-olympus-2@poster-alternative-q80.webp'
import newBunny from '../../assets/jogosCassino/novidades/hacksaw-le-bunny@poster-alternative-q80.webp'
import newHelicopter from '../../assets/jogosCassino/novidades/smartsoft-helicopterx@poster-alternative-q80.webp'
import newPlinko from '../../assets/jogosCassino/novidades/smartsoft-plinkox@poster-alternative-q80.webp'
import recommendAviatrix from '../../assets/jogosCassino/pitacoRecomenda/aviatrix-aviatrix@poster-alternative-q80.webp'
import recommendGoldBlitz from '../../assets/jogosCassino/pitacoRecomenda/games-global-gold-blitz-ultimate@poster-alternative-q80.webp'
import recommendMines from '../../assets/jogosCassino/pitacoRecomenda/hacksaw-mines@poster-alternative-q80.webp'
import recommendBuffalo from '../../assets/jogosCassino/pitacoRecomenda/playtech-buffalo-blitz-ii@poster-alternative-q80.webp'
import recommendBoi from '../../assets/jogosCassino/pitacoRecomenda/wazdan-bumba-meu-boi-coin@poster-alternative-q80.webp'
import type { CasinoCategoryId } from '../../types/home'
import { TreasureSection } from '../TreasureSection'
import './CasinoContent.css'

export interface CasinoGameOpenPayload {
  section: CasinoCarouselSection
  selectedIndex: number
}

interface CasinoContentProps {
  activeCategory: CasinoCategoryId
  onGameOpen?: (payload: CasinoGameOpenPayload) => void
}

export interface CasinoCarouselGame {
  id: string
  name: string
  image: string
  provider?: string
  categoryLabel?: string
  dealerName?: string
  minimumBet?: string
  winnerNamePrefix?: string
  winningAmount?: string
}

export interface CasinoCarouselSection {
  id: string
  title: string
  games: CasinoCarouselGame[]
}

const maskWinnerNamePrefix = (winnerNamePrefix: string) => {
  const visibleName = Array.from(winnerNamePrefix.trim()).slice(0, 3).join('')

  return visibleName ? `${visibleName}***` : '***'
}

const crashGameImages = Object.entries(
  import.meta.glob<string>('../../assets/jogosCassino/categoriaCrash/*.{avif,jpeg,jpg,png,webp}', {
    eager: true,
    import: 'default',
  })
)
  .sort(([firstPath], [secondPath]) => firstPath.localeCompare(secondPath))
  .map(([path, image]) => {
    const fileName = path.split('/').pop() ?? ''
    const id = fileName.replace(/\.[^.]+$/, '')
    const title = id
      .replace(/@poster-alternative-q80$/, '')
      .split('-')
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    return {
      id,
      image,
      name: title,
    }
  })

const casinoCarouselSections: CasinoCarouselSection[] = [
  {
    id: '10-mais-populares',
    title: '10 Mais Populares',
    games: [
      { id: 'fortune-tiger', name: 'Fortune Tiger', image: popularTiger, provider: 'PGSoft', categoryLabel: 'Slots' },
      { id: 'cachorro-sortudo', name: 'Cachorro Sortudo', image: popularDog, provider: 'Pragmatic Play', categoryLabel: 'Slots' },
      { id: 'lucky-monkey', name: 'Lucky Monkey', image: popularMonkey, provider: 'Pragmatic Play', categoryLabel: 'Slots' },
      { id: 'tigre-sortudo-1000', name: 'Tigre Sortudo 1000', image: popularTiger1000, provider: 'Pragmatic Play', categoryLabel: 'Slots' },
      { id: 'touro-sortudo', name: 'Touro Sortudo', image: popularBull, provider: 'Pragmatic Play', categoryLabel: 'Slots' },
    ],
  },
  {
    id: 'pitaco-recomenda',
    title: 'Pitaco Recomenda',
    games: [
      { id: 'aviatrix', name: 'Aviatrix', image: recommendAviatrix },
      { id: 'gold-blitz-ultimate', name: 'Gold Blitz Ultimate', image: recommendGoldBlitz },
      { id: 'mines', name: 'Mines', image: recommendMines },
      { id: 'buffalo-blitz-ii', name: 'Buffalo Blitz II', image: recommendBuffalo },
      { id: 'bumba-meu-boi-coin', name: 'Bumba Meu Boi Coin', image: recommendBoi },
    ],
  },
  {
    id: 'ganhando-agora',
    title: 'Ganhando Agora',
    games: [
      { id: 'phoenix-firestorm', name: 'Phoenix Firestorm', image: winningPhoenix, winnerNamePrefix: 'Tat', winningAmount: 'R$ 842,50' },
      { id: 'golden-tiger-jackpot-fortunes', name: 'Golden Tiger Jackpot Fortunes', image: winningGoldenTiger, winnerNamePrefix: 'Mig', winningAmount: 'R$ 1.240,00' },
      { id: 'fortune-rabbit', name: 'Fortune Rabbit', image: winningRabbit, winnerNamePrefix: 'Jul', winningAmount: 'R$ 536,20' },
      { id: 'tigre-sortudo-gold', name: 'Tigre Sortudo Gold', image: winningTigerGold, winnerNamePrefix: 'Mar', winningAmount: 'R$ 2.185,70' },
      { id: 'ratinho-sortudo', name: 'Ratinho Sortudo', image: winningMouse, winnerNamePrefix: 'Fer', winningAmount: 'R$ 319,90' },
    ],
  },
  {
    id: 'cassino-ao-vivo',
    title: 'Cassino Ao Vivo',
    games: [
      { id: 'brazilian-one-blackjack', name: 'Brazilian One Blackjack', image: liveBrazilianOneBlackjack, dealerName: 'Camila', minimumBet: 'Min. R$0,50' },
      { id: 'ice-fishing', name: 'Ice Fishing', image: liveIceFishing, dealerName: 'Roberto', minimumBet: 'Min. R$1' },
      { id: 'crazy-time-a', name: 'Crazy Time A', image: liveCrazyTimeA, dealerName: 'Tiffany', minimumBet: 'Min. R$0,50' },
      { id: 'bac-bo', name: 'Bac Bo', image: liveBacBo, dealerName: 'Katarina', minimumBet: 'Min. R$5' },
      { id: 'crazy-time', name: 'Crazy Time', image: liveCrazyTime, dealerName: 'Monica', minimumBet: 'Min. R$0,50' },
    ],
  },
  {
    id: 'novidades',
    title: 'Novidades',
    games: [
      { id: 'mask-amun-gold-blitz-ultimate', name: 'Mask of Amun Gold Blitz Ultimate', image: newAmun },
      { id: 'raging-gods-olympus-2', name: 'Raging Gods Olympus 2', image: newOlympus },
      { id: 'le-bunny', name: 'Le Bunny', image: newBunny },
      { id: 'helicopterx', name: 'HelicopterX', image: newHelicopter },
      { id: 'plinkox', name: 'PlinkoX', image: newPlinko },
    ],
  },
  {
    id: 'cashback',
    title: 'Cashback 30% de volta',
    games: [
      { id: 'gates-olympus-1000', name: 'Gates of Olympus 1000', image: cashbackOlympus },
      { id: 'big-bass-bonanza-1000', name: 'Big Bass Bonanza 1000', image: cashbackBass },
      { id: 'spaceman', name: 'Spaceman', image: cashbackSpaceman },
      { id: 'lucky-jaguar-500', name: 'Lucky Jaguar 500', image: cashbackJaguar },
      { id: 'lucky-macaw', name: 'Lucky Macaw', image: cashbackMacaw },
    ],
  },
]

export function CasinoContent({ activeCategory, onGameOpen }: CasinoContentProps) {
  if (activeCategory === 'crash') {
    return (
      <div className="casino-content casino-content--crash">
        <section className="casino-crash-page" aria-labelledby="casino-crash-title">
          <h2 id="casino-crash-title" className="casino-crash-page__title">Crash</h2>
          <div className="casino-crash-page__grid">
            {crashGameImages.map((game) => (
              <button
                key={game.id}
                type="button"
                className="casino-crash-card"
                aria-label={game.name}
              >
                <span className="casino-game-card__image-wrap casino-crash-card__image-wrap">
                  <img src={game.image} alt="" className="casino-game-card__image" />
                  <span className="casino-game-card__info" aria-hidden="true">
                    i
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="casino-content">
      {casinoCarouselSections.map((section) => (
        <section key={section.id} className="casino-games-section">
          <div className="casino-games-section__header">
            <div className="casino-games-section__title">
              <span>{section.title}</span>
              <CaretRightIcon aria-hidden="true" className="casino-games-section__arrow" weight="bold" />
            </div>
          </div>

          <div className="casino-games-section__list">
            {section.games.map((game, gameIndex) => {
              const maskedWinnerName = game.winnerNamePrefix ? maskWinnerNamePrefix(game.winnerNamePrefix) : ''
              const isOpenableGame = section.id === '10-mais-populares' && !!onGameOpen

              return (
                <button
                  key={game.id}
                  type="button"
                  className={[
                    'casino-game-card',
                    isOpenableGame ? 'casino-game-card--openable' : '',
                    section.id === 'cassino-ao-vivo' ? 'casino-game-card--live' : '',
                    section.id === 'ganhando-agora' ? 'casino-game-card--winning' : '',
                  ].filter(Boolean).join(' ')}
                  aria-label={[
                    game.name,
                    game.dealerName ? `Dealer ${game.dealerName}` : '',
                    game.minimumBet ?? '',
                    maskedWinnerName && game.winningAmount ? `${maskedWinnerName} ganhou ${game.winningAmount}` : '',
                  ].filter(Boolean).join(', ')}
                  onClick={isOpenableGame ? () => onGameOpen?.({ section, selectedIndex: gameIndex }) : undefined}
                >
                  <span className="casino-game-card__image-wrap">
                    <img src={game.image} alt="" className="casino-game-card__image" />
                    <span className="casino-game-card__info" aria-hidden="true">
                      i
                    </span>
                    {section.id === 'cashback' && (
                      <span className="casino-game-card__tag">Cashback</span>
                    )}
                    {section.id === 'cassino-ao-vivo' && (
                      <span className="casino-game-card__live-tag">
                        <span className="casino-game-card__live-icon-wrap" aria-hidden="true">
                          <img src={iconAoVivo} alt="" className="casino-game-card__live-icon" />
                        </span>
                        <span>Ao Vivo</span>
                      </span>
                    )}
                  </span>
                  {section.id === 'ganhando-agora' && maskedWinnerName && game.winningAmount && (
                    <span className="casino-game-card__winning-meta">
                      <span className="casino-game-card__winner-name">{maskedWinnerName} ganhou</span>
                      <span className="casino-game-card__winning-amount">{game.winningAmount}</span>
                    </span>
                  )}
                  {section.id === 'cassino-ao-vivo' && game.dealerName && game.minimumBet && (
                    <span className="casino-game-card__live-meta">
                      <span className="casino-game-card__live-meta-text">
                        {game.dealerName} - {game.minimumBet}
                      </span>
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </section>
      ))}

      <TreasureSection />
    </div>
  )
}
