import type { ReportsDatabase } from './database.server'
import { validateCoordinates, type Coordinates } from '../lib/report'
import type { HistoricalIncident } from '../lib/historical-incident'
import { NEARBY_RADIUS_METERS, REPORT_LIMIT } from './spatial.server'

function publicTime(value: string | null): HistoricalIncident['time'] {
  if (!value) return null
  const time = JSON.parse(value) as Record<string, unknown>
  return { year: typeof time.year === 'number' ? time.year : undefined, month: typeof time.month === 'number' ? time.month : undefined }
}

export function nearbyHistoricalIncidents(db: ReportsDatabase, location: Coordinates) {
  const point = validateCoordinates(location)
  const rows = db.$client.prepare(`
    SELECT incident.id, incident.latitude, incident.longitude, incident.category, incident.time,
      dataset.name AS datasetName, dataset.version AS datasetVersion, dataset.url AS sourceUrl, dataset.license,
      spherical_distance(?, ?, incident.latitude, incident.longitude) AS distance
    FROM incidents AS incident
    JOIN source_records AS source ON source.id = incident.source_record_id
    JOIN datasets AS dataset ON dataset.id = source.dataset_id
    WHERE incident.latitude IS NOT NULL AND incident.longitude IS NOT NULL
      AND incident.is_synthetic = 0 AND distance <= ?
    ORDER BY distance, incident.id LIMIT ?
  `).all(point.latitude, point.longitude, NEARBY_RADIUS_METERS, REPORT_LIMIT + 1) as Array<Omit<HistoricalIncident, 'time'> & { time: string | null }>
  return {
    incidents: rows.slice(0, REPORT_LIMIT).map((row) => ({ ...row, time: publicTime(row.time) })),
    limited: rows.length > REPORT_LIMIT,
  }
}
