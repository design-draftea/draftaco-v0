import flagAlemanha from '../assets/iconPaises/alemanha.png'
import flagArgentina from '../assets/iconPaises/argentina.png'
import flagBelgica from '../assets/iconPaises/belgica.png'
import flagCanada from '../assets/iconPaises/canada.png'
import flagCazaquistao from '../assets/iconPaises/cazaquistao.png'
import flagChina from '../assets/iconPaises/china.png'
import flagColombia from '../assets/iconPaises/colombia.png'
import flagEstadosUnidos from '../assets/iconPaises/estados-unidos.png'
import flagFinlandia from '../assets/iconPaises/finlandia.png'
import flagFranca from '../assets/iconPaises/franca.png'
import flagItalia from '../assets/iconPaises/italia.png'
import flagNoruega from '../assets/iconPaises/noruega.png'
import flagPolonia from '../assets/iconPaises/polonia.png'
import flagReinoUnido from '../assets/iconPaises/reino-unido.png'
import flagRepublicaTcheca from '../assets/iconPaises/republica-tcheca.png'
import flagRussia from '../assets/iconPaises/russia.png'
import flagServia from '../assets/iconPaises/servia.png'
import flagEspanha from '../assets/iconPaises/espanha.png'
import flagSuica from '../assets/iconPaises/suica.png'
import flagUcrania from '../assets/iconPaises/ucrania.png'

type CountryIconEntry = [string, string]

const normalizeTennisName = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

const createCountryIconMap = (entries: CountryIconEntry[]) =>
  entries.reduce<Record<string, string>>((map, [name, icon]) => {
    map[normalizeTennisName(name)] = icon
    return map
  }, {})

const TENNIS_PLAYER_COUNTRY_ICONS = createCountryIconMap([
  ['Andrey Rublev', flagRussia],
  ['Rublev', flagRussia],
  ['Hamad Medjedovic', flagServia],
  ['Medjedovic', flagServia],
  ['Martin Landaluce', flagEspanha],
  ['Landaluce', flagEspanha],
  ['Thiago Agustin Tirante', flagArgentina],
  ['Tirante', flagArgentina],
  ['Daniil Medvedev', flagRussia],
  ['Medvedev', flagRussia],
  ['Coco Gauff', flagEstadosUnidos],
  ['Gauff', flagEstadosUnidos],
  ['Mirra Andreeva', flagRussia],
  ['Andreeva', flagRussia],
  ['Jessica Pegula', flagEstadosUnidos],
  ['Pegula', flagEstadosUnidos],
  ['Iga Swiatek', flagPolonia],
  ['Swiatek', flagPolonia],
  ['Elina Svitolina', flagUcrania],
  ['Svitolina', flagUcrania],
  ['Elena Rybakina', flagCazaquistao],
  ['Rybakina', flagCazaquistao],
  ['Yue Yuan', flagChina],
  ['Barbora Krejcikova', flagRepublicaTcheca],
  ['Krejcikova', flagRepublicaTcheca],
  ['Anna-Lena Friedsam', flagAlemanha],
  ['Friedsam', flagAlemanha],
  ['Solana Sierra', flagArgentina],
  ['Sierra', flagArgentina],
  ['Moise Kouame', flagFranca],
  ['Kouame', flagFranca],
  ['Benjamin Bonzi', flagFranca],
  ['Bonzi', flagFranca],
  ['Alexander Shevchenko', flagCazaquistao],
  ['Shevchenko', flagCazaquistao],
  ['Hugo Gaston', flagFranca],
  ['Gaston', flagFranca],
  ['Otto Virtanen', flagFinlandia],
  ['Virtanen', flagFinlandia],
  ['Giovanni Mpetshi Perricard', flagFranca],
  ['Perricard', flagFranca],
  ['Casper Ruud', flagNoruega],
  ['Ruud', flagNoruega],
  ['Karen Khachanov', flagRussia],
  ['Khachanov', flagRussia],
  ['Rafael Jodar', flagEspanha],
  ['Jodar', flagEspanha],
  ['Luciano Darderi', flagItalia],
  ['Darderi', flagItalia],
  ['Lucia Bronzetti', flagItalia],
  ['Bronzetti', flagItalia],
  ['Maria Camila Osorio Serrano', flagColombia],
  ['Osorio Serrano', flagColombia],
  ['Hanne Vandewinkel', flagBelgica],
  ['Vandewinkel', flagBelgica],
  ['Dayana Yastremska', flagUcrania],
  ['Yastremska', flagUcrania],
  ['Alycia Parks', flagEstadosUnidos],
  ['Parks', flagEstadosUnidos],
  ['Susan Bandecchi', flagSuica],
  ['Bandecchi', flagSuica],
  ['Raphael Collignon', flagBelgica],
  ['Collignon', flagBelgica],
  ['Geoffrey Blancaneaux', flagFranca],
  ['Blancaneaux', flagFranca],
  ['Luca Van Assche', flagFranca],
  ['Van Assche', flagFranca],
  ['Juan Manuel Cerundolo', flagArgentina],
  ['Cerundolo', flagArgentina],
  ['Jack Draper', flagReinoUnido],
  ['Draper', flagReinoUnido],
  ['Felix Auger-Aliassime', flagCanada],
  ['Auger-Aliassime', flagCanada],
])

export const TENNIS_COMPETITION_COUNTRY_ICONS: Record<string, string> = {
  'ten-atp-roma': flagItalia,
  'ten-roma-masters': flagItalia,
  'ten-roma-f': flagItalia,
  'ten-parma-f': flagItalia,
  'ten-bordeaux': flagFranca,
}

export function getTennisPlayerCountryIcon(playerName: string, fallback = '') {
  return TENNIS_PLAYER_COUNTRY_ICONS[normalizeTennisName(playerName)] ?? fallback
}

export function getTennisCompetitionCountryIcon(competitionId: string, fallback = '') {
  return TENNIS_COMPETITION_COUNTRY_ICONS[competitionId] ?? fallback
}
