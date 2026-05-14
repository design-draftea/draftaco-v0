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
import type { CasinoCarouselSection } from './CasinoContent'

export const casinoCarouselSections: CasinoCarouselSection[] = [
  {
    id: '10-mais-populares',
    title: '10 Mais Populares',
    games: [
      { id: 'fortune-tiger', name: 'Fortune Tiger', image: popularTiger, provider: 'PGSoft', categoryLabel: 'Slots' },
      { id: 'cachorro-sortudo', name: 'Cachorro Sortudo', image: popularDog, provider: 'Pragmatic Play', categoryLabel: 'Slots' },
      { id: 'lucky-monkey', name: 'Macaco Sortudo', image: popularMonkey, provider: 'Pragmatic Play', categoryLabel: 'Slots' },
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
