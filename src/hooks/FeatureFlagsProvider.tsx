import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import {
  FeatureFlagsContext,
  brandModeDefinitions,
  featureFlagDefinitions,
  type BrandMode,
  type FeatureFlagId,
  type FeatureFlagsContextValue,
  type FeatureFlagsState,
} from './featureFlagsContext'

interface FeatureFlagsProviderProps {
  children: ReactNode
}

const featureFlagsStorageKey = 'pitaquinho:feature-flags'
const brandModeStorageKey = 'pitaquinho:brand-mode'
const defaultBrandMode: BrandMode = 'pitaco'

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
      accumulator[definition.id] = typeof storedFlagValue === 'boolean' && !definition.lockToDefault
        ? storedFlagValue
        : definition.defaultEnabled

      return accumulator
    }, {} as FeatureFlagsState)
  } catch {
    return defaultFlags
  }
}

const isBrandMode = (value: unknown): value is BrandMode => (
  typeof value === 'string' && brandModeDefinitions.some((definition) => definition.id === value)
)

const readStoredBrandMode = () => {
  try {
    const storedValue = window.localStorage.getItem(brandModeStorageKey)
    return isBrandMode(storedValue) ? storedValue : defaultBrandMode
  } catch {
    return defaultBrandMode
  }
}

const getFeatureFlagDefinition = (flagId: FeatureFlagId) => (
  featureFlagDefinitions.find((definition) => definition.id === flagId)
)

export function FeatureFlagsProvider({ children }: FeatureFlagsProviderProps) {
  const [flags, setFlags] = useState<FeatureFlagsState>(readStoredFeatureFlags)
  const [brandMode, setBrandMode] = useState<BrandMode>(readStoredBrandMode)

  useEffect(() => {
    window.localStorage.setItem(featureFlagsStorageKey, JSON.stringify(flags))
  }, [flags])

  useEffect(() => {
    window.localStorage.setItem(brandModeStorageKey, brandMode)
  }, [brandMode])

  const setFeatureFlag = useCallback((flagId: FeatureFlagId, enabled: boolean) => {
    if (getFeatureFlagDefinition(flagId)?.lockToDefault) return

    setFlags((currentFlags) => ({
      ...currentFlags,
      [flagId]: enabled,
    }))
  }, [])

  const toggleFeatureFlag = useCallback((flagId: FeatureFlagId) => {
    if (getFeatureFlagDefinition(flagId)?.lockToDefault) return

    setFlags((currentFlags) => ({
      ...currentFlags,
      [flagId]: !currentFlags[flagId],
    }))
  }, [])

  const isFeatureEnabled = useCallback((flagId: FeatureFlagId) => {
    const definition = getFeatureFlagDefinition(flagId)
    return definition?.lockToDefault ? definition.defaultEnabled : flags[flagId]
  }, [flags])

  const value = useMemo<FeatureFlagsContextValue>(() => ({
    flags,
    definitions: featureFlagDefinitions,
    brandMode,
    brandModeDefinitions,
    setFeatureFlag,
    toggleFeatureFlag,
    isFeatureEnabled,
    setBrandMode,
  }), [brandMode, flags, isFeatureEnabled, setFeatureFlag, toggleFeatureFlag])

  return (
    <FeatureFlagsContext.Provider value={value}>
      {children}
    </FeatureFlagsContext.Provider>
  )
}
