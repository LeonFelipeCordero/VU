import type { ReportsDatabase } from './database.server'
import { validateViewport, type ViewportRequest } from '../lib/map-viewport'
import type { LocationReport } from '../lib/report'
import type { HistoricalIncident } from '../lib/historical-incident'
import { publicTime } from './historical.server'

export const MAP_BATCH_SIZE = 250

export function viewportPoints(db: ReportsDatabase, input: ViewportRequest) {
  const { south, north, west, east, afterReport, afterIncident } = validateViewport(input)
  const boxes = west <= east ? [[west, east]] : [[west, 180], [-180, east]]
  const candidates = (table: string) => boxes.map(() => `SELECT id FROM ${table}_rtree
    WHERE min_latitude <= ? AND max_latitude >= ? AND min_longitude <= ? AND max_longitude >= ?`).join(' UNION ')
  const bounds = boxes.flatMap(([left, right]) => [north, south, right, left])
  const reports = db.$client.prepare(`SELECT report.id, report.latitude, report.longitude, report.source,
      report.description, report.created_at AS createdAt, report.updated_at AS updatedAt
    FROM (${candidates('locations')}) AS candidate CROSS JOIN locations AS report ON report.id = candidate.id
    WHERE report.id > ? ORDER BY report.id LIMIT ?`).all(...bounds, afterReport, MAP_BATCH_SIZE) as Array<Omit<LocationReport, 'location'> & { latitude: number; longitude: number }>
  const incidents = db.$client.prepare(`SELECT incident.id, incident.latitude, incident.longitude, incident.category, incident.time,
      dataset.name AS datasetName, dataset.version AS datasetVersion, dataset.url AS sourceUrl, dataset.license
    FROM (${candidates('incidents')}) AS candidate CROSS JOIN incidents AS incident ON incident.id = candidate.id
    JOIN source_records AS source ON source.id = incident.source_record_id
    JOIN datasets AS dataset ON dataset.id = source.dataset_id
    WHERE incident.id > ? ORDER BY incident.id LIMIT ?`).all(...bounds, afterIncident, MAP_BATCH_SIZE) as Array<Omit<HistoricalIncident, 'time'> & { time: string | null }>
  return {
    reports: reports.map(({ latitude, longitude, ...report }) => ({ ...report, location: { latitude, longitude } })),
    incidents: incidents.map((incident) => ({ ...incident, time: publicTime(incident.time) })),
    hasMore: reports.length === MAP_BATCH_SIZE || incidents.length === MAP_BATCH_SIZE,
  }
}
