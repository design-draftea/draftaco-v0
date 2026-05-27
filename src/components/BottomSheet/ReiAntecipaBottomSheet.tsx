import { PagamentoAntecipadoBottomSheet } from './PagamentoAntecipadoBottomSheet'

interface ReiAntecipaBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  sport: 'futebol' | 'basquete'
}

export function ReiAntecipaBottomSheet({ isOpen, onClose, sport }: ReiAntecipaBottomSheetProps) {
  return (
    <PagamentoAntecipadoBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      sport={sport}
    />
  )
}
