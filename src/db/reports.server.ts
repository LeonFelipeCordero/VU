import { validateCoordinates, validateReport } from '../lib/report'
import type { Coordinates, LocationReport, ReportInput } from '../lib/report'
import { getDatabase } from './database.server'
import type { ReportsDatabase } from './database.server'
import { locations } from './schema'
import { nearbyQuery, REPORT_LIMIT } from './spatial.server'

type ReportRow = typeof locations.$inferSelect

function toReport(row: ReportRow): LocationReport {
  return {
    id: row.id,
    location: { latitude: row.latitude, longitude: row.longitude },
    source: row.source,
    description: row.description,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export function createReportsStore(db: ReportsDatabase) {
  function create(input: ReportInput, source: 'app' | 'crawler') {
    const { location, description } = validateReport(input)
    const now = Date.now()
    return db.insert(locations).values({
      latitude: location.latitude,
      longitude: location.longitude,
      source,
      description,
      createdAt: now,
      updatedAt: now,
    }).returning({ id: locations.id }).get().id
  }

  return {
    createApp: (input: ReportInput): number => create(input, 'app'),
    // Trusted server callers only; this is not a public server function.
    createFromCrawler: (input: ReportInput): number => create(input, 'crawler'),
    nearby(location: Coordinates): { reports: LocationReport[]; limited: boolean } {
      const query = nearbyQuery(validateCoordinates(location))
      const rows = db.$client.prepare(query.sql).all(...query.parameters) as Array<{
        id: number; latitude: number; longitude: number; source: 'app' | 'crawler';
        description: string; created_at: number; updated_at: number
      }>
      const reports = rows.map((row) => toReport({
        ...row, createdAt: row.created_at, updatedAt: row.updated_at,
      }))
      return { reports, limited: reports.length === REPORT_LIMIT }
    },
  }
}

let store: ReturnType<typeof createReportsStore> | undefined

export function getReportsStore() {
  return store ??= createReportsStore(getDatabase())
}
