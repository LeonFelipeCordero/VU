import { fileURLToPath } from 'node:url'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { afterEach, describe, expect, it } from 'vitest'
import { openDatabase, type ReportsDatabase } from '../src/db/database.server'
import { importDataset } from '../src/db/imports.server'
import { createReportsStore } from '../src/db/reports.server'
import { MAP_BATCH_SIZE, viewportPoints } from '../src/db/viewport.server'
import { validateViewport } from '../src/lib/map-viewport'

const databases: ReportsDatabase[] = []
const bounds = { south: 52.5, north: 52.6, west: 13.3, east: 13.5, afterReport: 0, afterIncident: 0 }
function setup() {
  const db = openDatabase(':memory:')
  databases.push(db)
  migrate(db, { migrationsFolder: fileURLToPath(new URL('../drizzle', import.meta.url)) })
  return db
}
afterEach(() => { for (const db of databases.splice(0)) db.$client.close() })

describe('viewport points', () => {
  it('streams every page without duplicates and excludes unknown, synthetic and out-of-view incidents', () => {
    const db = setup()
    const store = createReportsStore(db)
    for (let i = 0; i < MAP_BATCH_SIZE + 2; i++) store.createApp({ location: { latitude: 52.55, longitude: 13.4 }, description: String(i) })
    store.createApp({ location: { latitude: 40, longitude: -74 }, description: 'Outside viewport' })
    importDataset(db, { dataset: { name: 'Fixture', version: '2024', url: 'https://example.org', license: 'Test', fileSha256: 'a'.repeat(64), coverage: {} },
      records: Array.from({ length: MAP_BATCH_SIZE + 5 }, (_, i) => ({ raw: { i }, incident: {
        latitude: i === 0 ? null : i === 1 ? 40 : 52.55, longitude: i === 0 ? null : 13.4,
        isSynthetic: i === 2, qualityFlags: [], time: { year: 2024 }, locationMethod: 'source', locationPrecision: 'unspecified',
      } })) })
    const first = viewportPoints(db, bounds)
    expect(first.reports).toHaveLength(MAP_BATCH_SIZE)
    expect(first.incidents).toHaveLength(MAP_BATCH_SIZE)
    expect(first.hasMore).toBe(true)
    expect(first.incidents[0]).toMatchObject({ datasetName: 'Fixture', time: { year: 2024 } })
    const second = viewportPoints(db, { ...bounds, afterReport: first.reports.at(-1)!.id, afterIncident: first.incidents.at(-1)!.id })
    expect(second.reports).toHaveLength(2)
    expect(second.incidents).toHaveLength(2)
    expect(second.hasMore).toBe(false)
    expect(new Set([...first.incidents, ...second.incidents].map((point) => point.id)).size).toBe(MAP_BATCH_SIZE + 2)
    const plan = db.$client.prepare('EXPLAIN QUERY PLAN SELECT id FROM incidents_rtree WHERE min_latitude <= ? AND max_latitude >= ? AND min_longitude <= ? AND max_longitude >= ?').all(52.6, 52.5, 13.5, 13.3)
    expect(JSON.stringify(plan)).toContain('VIRTUAL TABLE INDEX')
  })

  it('handles the date line and keeps the incident index in sync with edits and deletions', () => {
    const db = setup()
    const store = createReportsStore(db)
    for (const longitude of [-179.9, 179.9, 0]) store.createApp({ location: { latitude: 0, longitude }, description: 'Date line' })
    const result = viewportPoints(db, { ...bounds, south: -1, north: 1, west: 179, east: -179 })
    expect(result.reports.map((point) => point.location.longitude)).toEqual([-179.9, 179.9])
    importDataset(db, { dataset: { name: 'Fixture', version: '1', url: 'https://example.org', license: 'Test', fileSha256: 'a'.repeat(64), coverage: {} },
      records: [{ raw: {}, incident: { latitude: 52.55, longitude: 13.4, isSynthetic: false, qualityFlags: [], locationMethod: 'source', locationPrecision: 'unspecified' } }] })
    expect(viewportPoints(db, bounds).incidents).toHaveLength(1)
    db.$client.exec('UPDATE incidents SET is_synthetic = 1')
    expect(viewportPoints(db, bounds).incidents).toHaveLength(0)
    db.$client.exec('UPDATE incidents SET is_synthetic = 0; UPDATE incidents SET latitude = 40')
    expect(viewportPoints(db, bounds).incidents).toHaveLength(0)
    db.$client.exec('UPDATE incidents SET latitude = 52.55; DELETE FROM incidents')
    expect(db.$client.prepare('SELECT count(*) AS count FROM incidents_rtree').get()).toEqual({ count: 0 })
  })

  it.each([{ north: NaN }, { south: -91 }, { east: 181 }, { west: -181 }, { south: 60 }, { afterIncident: -1 }, { afterReport: 1.5 }])('rejects invalid viewport input %j', (invalid) => {
    expect(() => validateViewport({ ...bounds, ...invalid })).toThrow('Invalid map viewport')
  })
})
