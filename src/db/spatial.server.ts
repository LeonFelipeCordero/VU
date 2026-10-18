import type { Coordinates } from '../lib/report'

export const EARTH_RADIUS_METERS = 6371008.8
export const NEARBY_RADIUS_METERS = 1000
export const REPORT_LIMIT = 200
const radians = Math.PI / 180

export function distanceMeters(latitude: number, longitude: number, otherLatitude: number, otherLongitude: number) {
  const a = Math.sin((otherLatitude - latitude) * radians / 2) ** 2
    + Math.cos(latitude * radians) * Math.cos(otherLatitude * radians)
    * Math.sin((otherLongitude - longitude) * radians / 2) ** 2
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(Math.max(0, Math.min(1, a))))
}

function boundingBoxes({ latitude, longitude }: Coordinates) {
  const angularRadius = NEARBY_RADIUS_METERS / EARTH_RADIUS_METERS
  const latitudeDelta = angularRadius / radians
  const south = Math.max(-90, latitude - latitudeDelta - 1e-10)
  const north = Math.min(90, latitude + latitudeDelta + 1e-10)
  if (south === -90 || north === 90) return [[south, north, -180, 180]]
  const longitudeDelta = Math.asin(Math.sin(angularRadius) / Math.cos(latitude * radians)) / radians + 1e-10
  const west = longitude - longitudeDelta
  const east = longitude + longitudeDelta
  if (west < -180) return [[south, north, west + 360, 180], [south, north, -180, east]]
  if (east > 180) return [[south, north, west, 180], [south, north, -180, east - 360]]
  return [[south, north, west, east]]
}

export function nearbyQuery(location: Coordinates) {
  const boxes = boundingBoxes(location)
  const candidates = boxes.map(() => `SELECT id FROM locations_rtree
    WHERE min_latitude <= ? AND max_latitude >= ? AND min_longitude <= ? AND max_longitude >= ?`).join(' UNION ALL ')
  return {
    // CROSS JOIN keeps indexed spatial candidates ahead of primary-key report lookups.
    sql: `SELECT report.*, spherical_distance(?, ?, report.latitude, report.longitude) AS distance
      FROM (${candidates}) AS candidate CROSS JOIN locations AS report ON report.id = candidate.id
      WHERE distance <= ? ORDER BY distance, report.id LIMIT ${REPORT_LIMIT}`,
    parameters: [location.latitude, location.longitude,
      ...boxes.flatMap(([south, north, west, east]) => [north, south, east, west]),
      NEARBY_RADIUS_METERS + 1e-7],
  }
}
