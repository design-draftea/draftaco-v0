import { useEffect } from 'react'

interface LocationPermissionGateProps {
  isEnabled: boolean
}

const locationRequestOptions: PositionOptions = {
  enableHighAccuracy: false,
  maximumAge: 5 * 60 * 1000,
  timeout: 5000,
}

let hasRequestedLocationPermission = false

const requestBrowserLocationPermission = () => {
  navigator.geolocation.getCurrentPosition(
    () => undefined,
    () => undefined,
    locationRequestOptions
  )
}

const getGeolocationPermissionStatus = async () => {
  if (!navigator.permissions?.query) return null

  try {
    return await navigator.permissions.query({ name: 'geolocation' as PermissionName })
  } catch {
    return null
  }
}

export function LocationPermissionGate({ isEnabled }: LocationPermissionGateProps) {
  useEffect(() => {
    if (!isEnabled) return
    if (hasRequestedLocationPermission) return
    if (!window.isSecureContext) return
    if (!navigator.geolocation) return

    hasRequestedLocationPermission = true

    const requestLocation = async () => {
      const permissionStatus = await getGeolocationPermissionStatus()

      if (permissionStatus && permissionStatus.state !== 'prompt') return

      requestBrowserLocationPermission()
    }

    void requestLocation()
  }, [isEnabled])

  return null
}
