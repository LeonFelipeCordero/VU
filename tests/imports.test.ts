import { fileURLToPath } from 'node:url'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { afterEach, describe, expect, it } from 'vitest'
import { openDatabase, type ReportsDatabase } from '../src/db/database.server'
import { importDataset, exportIncidents, type DatasetImport } from '../src/db/imports.server'
import { datasets, incidents, sourceRecords } from '../src/db/import-schema'

const databases: ReportsDatabase[] = []
function setup() {
  const db = openDatabase(':memory:')
  databases.push(db)
  migrate(db, { migrationsFolder: fileURLToPath(new URL('../drizzle', import.meta.url)) })
  return db
}
function manifest(): DatasetImport {
  return {
    dataset: {
      name: 'Fixture', version: '2025-v1', url: 'https://example.com/data', license: 'Test only',
      fileSha256: 'a'.repeat(64), coverage: { geography: 'Berlin', period: '2025', completeness: 'unknown' },
    },
    records: [{
      sourceRecordId: '0001', raw: { unusualColumn: 'keep me', description: 'x'.repeat(4000), missing: null },
      incident: {
        latitude: 52.52, longitude: 13.405, locationMethod: 'source', locationPrecision: 'street segment',
        category: 'traffic_collision', sourceCategory: 'original code',
        time: { year: 2025, month: 2, weekday: 3, hour: 14, precision: 'partial', timezone: 'Europe/Berlin' },
        qualityFlags: ['partial_time'], isSynthetic: false, sourceSeverity: { code: 2 },
      },
    }],
  }
}
afterEach(() => { for (const db of databases.splice(0)) db.$client.close() })

describe('dataset imports', () => {
  it('preserves source fields, partial time, and unknown positions without inventing values', () => {
    const db = setup()
    const input = manifest()
    input.records.push({ raw: { aggregate: 42 } })
    input.records.push({ raw: { noPoint: true }, incident: { qualityFlags: ['no_location'], isSynthetic: true } })
    expect(importDataset(db, input).records).toBe(3)
    expect(db.select().from(sourceRecords).all()[0].raw).toEqual(input.records[0].raw)
    const rows = [...exportIncidents(db)]
    expect(rows).toHaveLength(2)
    expect(rows[0].incident.time).toEqual(input.records[0].incident!.time)
    expect(rows[0].incident.occurredStart).toBeNull()
    expect(rows[1].incident).toMatchObject({ latitude: null, longitude: null, isSynthetic: true })
    expect(db.$client.prepare('SELECT count(*) AS count FROM locations').get()).toEqual({ count: 0 })
  })

  it('rejects reimported releases and allows corrected releases', () => {
    const db = setup()
    const input = manifest()
    importDataset(db, input)
    expect(() => importDataset(db, input)).toThrow(/already exists/)
    input.dataset.version = '2025-v2'
    importDataset(db, input)
    expect(db.select().from(datasets).all()).toHaveLength(2)
  })

  it('rolls back the whole release on duplicate source identifiers', () => {
    const db = setup()
    const input = manifest()
    input.records.push(input.records[0])
    expect(() => importDataset(db, input)).toThrow()
    expect(db.select().from(datasets).all()).toHaveLength(0)
    expect(db.select().from(sourceRecords).all()).toHaveLength(0)
    expect(db.select().from(incidents).all()).toHaveLength(0)
  })

  it('retains different records with identical coordinates and time', () => {
    const db = setup()
    const input = manifest()
    input.records.push({ ...input.records[0], sourceRecordId: '0002' })
    importDataset(db, input)
    expect([...exportIncidents(db)]).toHaveLength(2)
  })

  it.each([
    { latitude: 91, longitude: 13 },
    { latitude: 52, longitude: null },
    { occurredStart: 10, occurredEnd: 9 },
    { occurredEnd: 10 },
    { occurredStart: 1.5 },
    { occurredEnd: Infinity },
    { publishedAt: '2024' },
    { locationMethod: '' },
    { locationPrecision: null },
    { time: [] },
    { qualityFlags: [1] },
    { qualityFlags: null },
    { isSynthetic: undefined },
  ])('rejects invalid normalized data %j atomically', (invalid) => {
    const db = setup()
    const input = manifest()
    Object.assign(input.records[0].incident!, invalid)
    expect(() => importDataset(db, input)).toThrow()
    expect(db.select().from(datasets).all()).toHaveLength(0)
  })

})

describe('dataset validation and export', () => {
  it.each([
    { name: '' }, { version: ' ' }, { url: null }, { license: 1 },
    { fileSha256: 'invalid' }, { coverage: [] },
  ])('rejects invalid dataset metadata %j without writing data', (invalid) => {
    const db = setup()
    const input = manifest()
    Object.assign(input.dataset, invalid)
    expect(() => importDataset(db, input)).toThrow()
    expect(db.select().from(datasets).all()).toHaveLength(0)
  })

  it.each([
    { raw: null }, { raw: [] }, { sourceRecordId: '' }, { sourceRecordId: 1 }, { incident: null },
  ])('rolls back earlier rows when a later source record is invalid: %j', (invalid) => {
    const db = setup()
    const input = manifest()
    input.records.push(Object.assign({ raw: {} }, invalid) as unknown as DatasetImport['records'][number])
    expect(() => importDataset(db, input)).toThrow()
    expect(db.select().from(datasets).all()).toHaveLength(0)
    expect(db.select().from(sourceRecords).all()).toHaveLength(0)
    expect(db.select().from(incidents).all()).toHaveLength(0)
  })

  it('exports beyond both the map limit and export batch size without losing source details', () => {
    const db = setup()
    const input = manifest()
    input.records = Array.from({ length: 1005 }, (_, i) => ({
      sourceRecordId: String(i), raw: { i },
      incident: { qualityFlags: [], isSynthetic: false },
    }))
    importDataset(db, input)
    const rows = [...exportIncidents(db)]
    expect(rows).toHaveLength(1005)
    expect(rows[1004].source.raw).toEqual({ i: 1004 })
    expect(rows[1004].dataset.coverage).toEqual(input.dataset.coverage)
  })

  it('enforces coordinate and interval constraints on direct SQL writes', () => {
    const db = setup()
    importDataset(db, manifest())
    expect(() => db.$client.prepare('UPDATE incidents SET latitude = 95').run()).toThrow()
    expect(() => db.$client.prepare('UPDATE incidents SET occurred_start = 20, occurred_end = 10').run()).toThrow()
    expect(() => db.$client.prepare('DELETE FROM source_records').run()).toThrow()
  })
})
