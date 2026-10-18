import type { Coordinates } from './report'

// Chihuahua is a navigation default, not a coverage or data-availability claim.
export const DEFAULT_LOCATION: Coordinates = { latitude: 28.64, longitude: -106.0738 }

function coordinate(value: unknown, min: number, max: number, fallback: number) {
  if (typeof value !== 'number' && typeof value !== 'string') return fallback
  if (typeof value === 'string' && !value.trim()) return fallback
  const number = Number(value)
  return Number.isFinite(number) && number >= min && number <= max ? number : fallback
}

export function parseLocationSearch(search: { lat?: unknown; lng?: unknown }) {
  return {
    lat: coordinate(search.lat, -90, 90, DEFAULT_LOCATION.latitude),
    lng: coordinate(search.lng, -180, 180, DEFAULT_LOCATION.longitude),
  }
}

export function formatCoordinates(location: Coordinates) {
  return `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
}
