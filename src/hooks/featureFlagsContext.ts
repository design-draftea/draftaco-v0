import { createContext } from 'react'

export type FeatureFlagId = 'freeBetsAvailable'
export type BrandMode = 'draftea' | 'pitaco'

export interface FeatureFlagDefinition {
  id: FeatureFlagId
  title: string
  description: string
  defaultEnabled: boolean
  lockToDefault?: boolean
  visibleInPanel?: boolean
}

export interface BrandModeDefinition {
  id: BrandMode
  label: string
}

export const featureFlagDefinitions: FeatureFlagDefinition[] = [
  {
    id: 'freeBetsAvailable',
    title: 'Apostas Gratis disponivel',
    description: 'Ativa a experiencia em prototipo de Apostas Gratis.',
    defaultEnabled: false,
    lockToDefault: true,
    visibleInPanel: false,
  },
]

export const brandModeDefinitions: BrandModeDefinition[] = [
  { id: 'draftea', label: 'Draftea' },
  { id: 'pitaco', label: 'Pitaco' },
]

export type FeatureFlagsState = Record<FeatureFlagId, boolean>

export interface FeatureFlagsContextValue {
  flags: FeatureFlagsState
  definitions: FeatureFlagDefinition[]
  brandMode: BrandMode
  brandModeDefinitions: BrandModeDefinition[]
  setFeatureFlag: (flagId: FeatureFlagId, enabled: boolean) => void
  toggleFeatureFlag: (flagId: FeatureFlagId) => void
  isFeatureEnabled: (flagId: FeatureFlagId) => boolean
  setBrandMode: (brandMode: BrandMode) => void
}

export const FeatureFlagsContext = createContext<FeatureFlagsContextValue | null>(null)
