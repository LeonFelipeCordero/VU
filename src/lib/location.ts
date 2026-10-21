import type { Coordinates } from './report'

// Show the world until device location or an explicit location is available.
export const DEFAULT_LOCATION: Coordinates = { latitude: 0, longitude: 0 }

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
