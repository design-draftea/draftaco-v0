import { BottomSheet } from '../BottomSheet'
import { useFeatureFlags } from '../../hooks/FeatureFlagsProvider'
import './FeatureFlagsPanel.css'

interface FeatureFlagsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function FeatureFlagsPanel({ isOpen, onClose }: FeatureFlagsPanelProps) {
  const { definitions, flags, setFeatureFlag } = useFeatureFlags()

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Feature flags"
      sheetClassName="feature-flags-sheet"
      bodyClassName="feature-flags-sheet__body"
      hideScrollIndicator={true}
    >
      <div className="feature-flags-sheet__list">
        {definitions.map((definition) => {
          const isEnabled = flags[definition.id]

          return (
            <div className="feature-flags-sheet__item" key={definition.id}>
              <div className="feature-flags-sheet__content">
                <span className="feature-flags-sheet__item-title">{definition.title}</span>
                <span className="feature-flags-sheet__item-description">{definition.description}</span>
              </div>

              <button
                type="button"
                className={[
                  'betslip-page__credit-toggle',
                  isEnabled ? 'betslip-page__credit-toggle--active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                role="switch"
                aria-checked={isEnabled}
                aria-label={`${isEnabled ? 'Desativar' : 'Ativar'} ${definition.title}`}
                onClick={() => setFeatureFlag(definition.id, !isEnabled)}
              >
                <span aria-hidden="true" />
              </button>
            </div>
          )
        })}
      </div>
    </BottomSheet>
  )
}
