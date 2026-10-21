import { fileURLToPath } from 'node:url'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { afterEach, describe, expect, it } from 'vitest'
import { openDatabase, type ReportsDatabase } from '../src/db/database.server'
import { importDataset, type DatasetImport } from '../src/db/imports.server'
import { nearbyHistoricalIncidents } from '../src/db/historical.server'
import { historicalFeatures } from '../src/features/map/historical-layers'
import { historicalLabel } from '../src/lib/historical-incident'

const databases: ReportsDatabase[] = []
function setup(records: DatasetImport['records']) {
  const db = openDatabase(':memory:')
  databases.push(db)
  migrate(db, { migrationsFolder: fileURLToPath(new URL('../drizzle', import.meta.url)) })
  importDataset(db, { dataset: { name: 'Unfallatlas Berlin', version: '2024', url: 'https://example.org/original.zip',
    license: 'dl-de/by-2-0', fileSha256: 'a'.repeat(64), coverage: { geography: 'Berlin' } }, records })
  return db
}
function record(id: string, latitude: number | null, longitude: number | null, isSynthetic = false) {
  return { sourceRecordId: id, raw: { original: id }, incident: { latitude, longitude, category: 'traffic_collision',
    locationMethod: 'source', locationPrecision: 'unspecified', time: { year: 2024, month: 3 }, qualityFlags: ['partial_time'], isSynthetic } }
}
afterEach(() => { for (const db of databases.splice(0)) db.$client.close() })

describe('historical map data', () => {
  it('queries real nearby source coordinates without turning records into community reports', () => {
    const db = setup([record('near', 52.52, 13.405), record('far', 52.56, 13.5), record('synthetic', 52.52, 13.405, true), record('unknown', null, null)])
    const result = nearbyHistoricalIncidents(db, { latitude: 52.52, longitude: 13.405 })
    expect(result.incidents).toHaveLength(1)
    expect(result.incidents[0]).toMatchObject({ latitude: 52.52, longitude: 13.405, datasetName: 'Unfallatlas Berlin',
      datasetVersion: '2024', license: 'dl-de/by-2-0', time: { year: 2024, month: 3 } })
    expect(result.limited).toBe(false)
    expect(db.$client.prepare('SELECT count(*) AS count FROM locations').get()).toEqual({ count: 0 })
    expect(historicalFeatures(result.incidents).features[0].geometry.coordinates).toEqual([13.405, 52.52])
    expect(historicalLabel(result.incidents[0])).toContain('2024-03')
    const correctedRelease = historicalLabel({ ...result.incidents[0], datasetVersion: '2024-v2' })
    expect(correctedRelease).toContain('2024-03')
    expect(correctedRelease).not.toContain('2024-v2-03')
    expect(historicalLabel({ ...result.incidents[0], time: null })).toContain('Occurrence date unspecified')
    expect(historicalLabel(result.incidents[0])).toContain('Exact occurrence date is unavailable')
  })

  it.each([
    [{ year: 2024, month: 1 }, '2024-01'],
    [{ year: 2024, month: 12 }, '2024-12'],
    [{ year: 2024 }, '2024'],
    [{ year: 2024, month: 0 }, '2024'],
    [{ year: 2024, month: 13 }, '2024'],
    [{ year: 2024, month: 1.5 }, '2024'],
    [{ year: 0 }, 'Occurrence date unspecified'],
    [{ year: 10000 }, 'Occurrence date unspecified'],
    [{ year: 2024.5 }, 'Occurrence date unspecified'],
    [null, 'Occurrence date unspecified'],
  ] as const)('formats partial occurrence time %j without inventing a date', (time, expected) => {
    const label = historicalLabel({ id: 1, latitude: 52.52, longitude: 13.405,
      category: 'traffic_collision', datasetName: 'Fixture', datasetVersion: '2024-v2',
      sourceUrl: 'https://example.org', license: 'Test only', time })
    expect(label.split('\n')[0]).toBe(`Road collision involving personal injury · ${expected}`)
  })

  it('marks truncation explicitly rather than implying complete local coverage', () => {
    const db = setup(Array.from({ length: 201 }, (_, index) => record(String(index), 52.52, 13.405)))
    const result = nearbyHistoricalIncidents(db, { latitude: 52.52, longitude: 13.405 })
    expect(result.incidents).toHaveLength(200)
    expect(result.limited).toBe(true)
    expect(db.$client.prepare('SELECT count(*) AS count FROM incidents').get()).toEqual({ count: 201 })
  })
})
