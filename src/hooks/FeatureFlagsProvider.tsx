import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type FeatureFlagId = 'freeBetsAvailable'

export interface FeatureFlagDefinition {
  id: FeatureFlagId
  title: string
  description: string
  defaultEnabled: boolean
}

export const featureFlagDefinitions: FeatureFlagDefinition[] = [
  {
    id: 'freeBetsAvailable',
    title: 'Apostas Gratis disponivel',
    description: 'Ativa a experiencia em prototipo de Apostas Gratis.',
    defaultEnabled: true,
  },
]

type FeatureFlagsState = Record<FeatureFlagId, boolean>

interface FeatureFlagsContextValue {
  flags: FeatureFlagsState
  definitions: FeatureFlagDefinition[]
  setFeatureFlag: (flagId: FeatureFlagId, enabled: boolean) => void
  toggleFeatureFlag: (flagId: FeatureFlagId) => void
  isFeatureEnabled: (flagId: FeatureFlagId) => boolean
}

interface FeatureFlagsProviderProps {
  children: ReactNode
}

const featureFlagsStorageKey = 'pitaquinho:feature-flags'

const getDefaultFeatureFlags = () => (
  featureFlagDefinitions.reduce((accumulator, definition) => {
    accumulator[definition.id] = definition.defaultEnabled
    return accumulator
  }, {} as FeatureFlagsState)
)

const readStoredFeatureFlags = () => {
  const defaultFlags = getDefaultFeatureFlags()

  try {
    const storedValue = window.localStorage.getItem(featureFlagsStorageKey)
    if (!storedValue) return defaultFlags

    const parsedValue = JSON.parse(storedValue) as Partial<Record<FeatureFlagId, unknown>>

    return featureFlagDefinitions.reduce((accumulator, definition) => {
      const storedFlagValue = parsedValue[definition.id]
      accumulator[definition.id] = typeof storedFlagValue === 'boolean'
        ? storedFlagValue
        : definition.defaultEnabled

      return accumulator
    }, {} as FeatureFlagsState)
  } catch {
    return defaultFlags
  }
}

const FeatureFlagsContext = createContext<FeatureFlagsContextValue | null>(null)

export function FeatureFlagsProvider({ children }: FeatureFlagsProviderProps) {
  const [flags, setFlags] = useState<FeatureFlagsState>(readStoredFeatureFlags)

  useEffect(() => {
    window.localStorage.setItem(featureFlagsStorageKey, JSON.stringify(flags))
  }, [flags])

  const setFeatureFlag = useCallback((flagId: FeatureFlagId, enabled: boolean) => {
    setFlags((currentFlags) => ({
      ...currentFlags,
      [flagId]: enabled,
    }))
  }, [])

  const toggleFeatureFlag = useCallback((flagId: FeatureFlagId) => {
    setFlags((currentFlags) => ({
      ...currentFlags,
      [flagId]: !currentFlags[flagId],
    }))
  }, [])

  const isFeatureEnabled = useCallback((flagId: FeatureFlagId) => flags[flagId], [flags])

  const value = useMemo<FeatureFlagsContextValue>(() => ({
    flags,
    definitions: featureFlagDefinitions,
    setFeatureFlag,
    toggleFeatureFlag,
    isFeatureEnabled,
  }), [flags, isFeatureEnabled, setFeatureFlag, toggleFeatureFlag])

  return (
    <FeatureFlagsContext.Provider value={value}>
      {children}
    </FeatureFlagsContext.Provider>
  )
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagsContext)

  if (!context) {
    throw new Error('useFeatureFlags must be used within FeatureFlagsProvider')
  }

  return context
}
