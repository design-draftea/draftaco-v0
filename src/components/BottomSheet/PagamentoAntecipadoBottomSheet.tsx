import { BottomSheet } from './BottomSheet'
import './PagamentoAntecipadoBottomSheet.css'

import iconPA from '../../assets/iconPA.png'

export type PagamentoAntecipadoSport = 'futebol' | 'basquete'

interface PagamentoAntecipadoBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  sport?: PagamentoAntecipadoSport
}

const contentBySport = {
  futebol: {
    headline: 'Futebol',
    description:
      'Caso o time selecionado abra uma vantagem de 2 gols em qualquer momento do tempo regulamentar, a seleção será considerada vencedora, mesmo que o time não vença a partida ao final.',
  },
  basquete: {
    headline: 'Basquete',
    description:
      'Caso o time selecionado abra uma vantagem de 20 pontos ou mais em qualquer momento da partida, a seleção será considerada vencedora, mesmo que o time não vença o jogo ao final.',
  },
} satisfies Record<PagamentoAntecipadoSport, {
  headline: string
  description: string
}>

export function PagamentoAntecipadoContent({
  sport = 'futebol',
}: {
  sport?: PagamentoAntecipadoSport
}) {
  const content = contentBySport[sport]

  return (
    <div className="pagamento-antecipado-bs__hero">
      <img src={iconPA} alt="" className="pagamento-antecipado-bs__icon" />
      <div className="pagamento-antecipado-bs__copy">
        <h3 className="pagamento-antecipado-bs__headline">{content.headline}</h3>
        <p className="pagamento-antecipado-bs__description">{content.description}</p>
      </div>
    </div>
  )
}

export function PagamentoAntecipadoBottomSheet({
  isOpen,
  onClose,
  sport = 'futebol',
}: PagamentoAntecipadoBottomSheetProps) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Pagamento Antecipado"
      sheetClassName="pagamento-antecipado-bs"
      bodyClassName="pagamento-antecipado-bs__body"
      hideScrollIndicator
      blurBackdrop
    >
      <PagamentoAntecipadoContent sport={sport} />
    </BottomSheet>
  )
}
