import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { openDatabase } from '../src/db/database.server'
import type { ReportsDatabase } from '../src/db/database.server'
import { createReportsStore } from '../src/db/reports.server'
import { nearbyQuery, distanceMeters } from '../src/db/spatial.server'
import { MAX_DESCRIPTION_LENGTH, validateReport } from '../src/lib/report'
import type { Coordinates } from '../src/lib/report'

const center = { latitude: 28.64, longitude: -106.0738 }
const input = { location: center, description: '  Test report  ' }
const migrationsFolder = fileURLToPath(new URL('../drizzle', import.meta.url))
const databases: ReportsDatabase[] = []
const directories: string[] = []

function setup() {
  const directory = mkdtempSync(join(tmpdir(), 'vu-sqlite-'))
  directories.push(directory)
  const path = join(directory, 'nested', 'reports.sqlite')
  const db = openDatabase(path)
  databases.push(db)
  migrate(db, { migrationsFolder })
  return { db, path, store: createReportsStore(db) }
}

// Independent spherical fixture, not the implementation's distance function.
function north(meters: number): Coordinates {
  return { ...center, latitude: center.latitude + meters / 6371008.8 * 180 / Math.PI }
}

function reportIds(store: ReturnType<typeof createReportsStore>, location = center) {
  return store.nearby(location).reports.map((report) => report.id)
}

const invalidLocations = [
  { latitude: NaN, longitude: 0 },
  { latitude: Infinity, longitude: 0 },
  { latitude: -Infinity, longitude: 0 },
  { latitude: 90.001, longitude: 0 },
  { latitude: -90.001, longitude: 0 },
  { latitude: 0, longitude: NaN },
  { latitude: 0, longitude: Infinity },
  { latitude: 0, longitude: -Infinity },
  { latitude: 0, longitude: 180.001 },
  { latitude: 0, longitude: -180.001 },
]
const invalidDescriptions = ['', ' \t\n ', '\uFEFF\u2000', 'x'.repeat(MAX_DESCRIPTION_LENGTH + 1)]

afterEach(() => {
  vi.restoreAllMocks()
  for (const db of databases.splice(0)) if (db.$client.open) db.$client.close()
  for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true })
})

describe('shared validation', () => {
  it('trims descriptions and accepts coordinate boundaries and maximum length', () => {
    expect(validateReport(input)).toEqual({ location: center, description: 'Test report' })
    for (const location of [{ latitude: -90, longitude: -180 }, { latitude: 90, longitude: 180 }]) {
      expect(validateReport({ location, description: 'x'.repeat(MAX_DESCRIPTION_LENGTH) }).location).toEqual(location)
    }
  })

  it.each(invalidLocations)('rejects invalid coordinates %j', (location) => {
    expect(() => validateReport({ ...input, location })).toThrow(/finite number/)
  })

  it.each(invalidDescriptions)('rejects invalid descriptions', (description) => {
    expect(() => validateReport({ ...input, description })).toThrow(/Description/)
  })
})

describe('SQLite report writes', () => {
  it('chooses source and timestamps on the server, ignoring untrusted extra fields', () => {
    const { store, db } = setup()
    vi.spyOn(Date, 'now').mockReturnValue(1700000000000)
    const untrusted = { ...input, source: 'crawler', id: 900, createdAt: 1, updatedAt: 2 }
    const id = store.createApp(untrusted)
    expect(store.nearby(center)).toEqual({ reports: [{
      id, location: center, source: 'app', description: 'Test report',
      createdAt: 1700000000000, updatedAt: 1700000000000,
    }], limited: false })
    expect(id).not.toBe(900)
    const crawlerInput = { ...untrusted, source: 'app' }
    const crawlerId = store.createFromCrawler(crawlerInput)
    expect(store.nearby(center).reports[1]).toMatchObject({ id: crawlerId, source: 'crawler' })
    expect(db.$client.prepare('SELECT * FROM locations WHERE id = ?').get(id)).toEqual({
      id, latitude: center.latitude, longitude: center.longitude, source: 'app',
      description: 'Test report', created_at: 1700000000000, updated_at: 1700000000000,
    })
  })

  it.each(invalidLocations)('validates both writes and queries: %j', (location) => {
    const { store } = setup()
    expect(() => store.createApp({ ...input, location })).toThrow(/finite number/)
    expect(() => store.createFromCrawler({ ...input, location })).toThrow(/finite number/)
    expect(() => store.nearby(location)).toThrow(/finite number/)
    expect(store.nearby(center)).toEqual({ reports: [], limited: false })
  })

  it.each(invalidDescriptions)('validates descriptions for both sources', (description) => {
    const { store } = setup()
    expect(() => store.createApp({ ...input, description })).toThrow(/Description/)
    expect(() => store.createFromCrawler({ ...input, description })).toThrow(/Description/)
    expect(reportIds(store)).toEqual([])
  })

  it('accepts in-memory databases when explicitly migrated', () => {
    const db = openDatabase(':memory:')
    databases.push(db)
    migrate(db, { migrationsFolder })
    const store = createReportsStore(db)
    expect(reportIds(store)).toEqual([])
    store.createApp(input)
    expect(reportIds(store)).toHaveLength(1)
  })

  it('persists data and the spatial index across close/reopen and repeated migrations', () => {
    const { db, store, path } = setup()
    const id = store.createApp(input)
    const original = store.nearby(center)
    expect(db.$client.pragma('journal_mode', { simple: true })).toBe('wal')
    expect(db.$client.pragma('busy_timeout', { simple: true })).toBe(5000)
    db.$client.close()
    const reopened = openDatabase(path)
    databases.push(reopened)
    migrate(reopened, { migrationsFolder })
    const persisted = createReportsStore(reopened)
    expect(persisted.nearby(center)).toEqual(original)
    expect(persisted.createApp(input)).toBeGreaterThan(id)
  })

  it('does not migrate implicitly at runtime', () => {
    const db = openDatabase(':memory:')
    databases.push(db)
    expect(() => createReportsStore(db).createApp(input)).toThrow(/no such table/)
  })
})

describe('indexed spherical nearby search', () => {
  it('includes the radius boundary, excludes a diagonal corner, and sorts by distance then ID', () => {
    const { store } = setup()
    const boundary = store.createApp({ ...input, location: north(1000) })
    const nearest = store.createApp(input)
    const middle = store.createApp({ ...input, location: north(500) })
    const tied = store.createApp({ ...input, location: north(500) })
    const justInside = store.createApp({ ...input, location: north(999.999) })
    store.createApp({ ...input, location: north(1000.001) })
    store.createApp({ ...input, location: north(5000) })
    const diagonal = {
      latitude: north(800).latitude,
      longitude: center.longitude + 800 / (6371008.8 * Math.cos(center.latitude * Math.PI / 180)) * 180 / Math.PI,
    }
    store.createApp({ ...input, location: diagonal })
    expect(reportIds(store)).toEqual([nearest, middle, tied, justInside, boundary])
    expect(store.nearby(center).limited).toBe(false)
  })

  it.each([179.999, -179.999, 180, -180])('crosses the antimeridian from longitude %s', (longitude) => {
    const { store } = setup()
    const across = store.createApp({ ...input, location: { latitude: 0, longitude: longitude > 0 ? -179.999 : 179.999 } })
    expect(reportIds(store, { latitude: 0, longitude })).toEqual([across])
  })

  it.each([90, -90])('searches all longitudes at pole %s', (latitude) => {
    const { store } = setup()
    const pole = store.createApp({ ...input, location: { latitude, longitude: 180 } })
    const nearPole = store.createApp({ ...input, location: { latitude: latitude * 0.99999, longitude: -120 } })
    store.createApp({ ...input, location: { latitude: latitude * 0.999, longitude: 0 } })
    expect(reportIds(store, { latitude, longitude: 0 })).toEqual([pole, nearPole])
    expect(reportIds(store, { latitude: latitude * 0.99999, longitude: 90 })).toEqual([pole, nearPole])
  })

  it('caps 201 matches at 200 and conservatively flags exactly 200', () => {
    const { store, db } = setup()
    const ids = db.$client.transaction(() => Array.from({ length: 199 }, (_, i) =>
      store.createApp({ ...input, location: north(i) })))()
    expect(store.nearby(center).limited).toBe(false)
    ids.push(store.createApp({ ...input, location: north(199) }))
    expect(store.nearby(center)).toMatchObject({ reports: { length: 200 }, limited: true })
    const extra = store.createApp({ ...input, location: north(900) })
    expect(reportIds(store)).toEqual(ids)
    expect(reportIds(store)).not.toContain(extra)
    expect(store.nearby(center).limited).toBe(true)
  })

  it('uses constrained RTREE scans and primary-key lookups, not full report scans', () => {
    const { db, store } = setup()
    store.createApp(input)
    for (let i = 0; i < 50; i++) store.createApp({ ...input, location: { latitude: -40, longitude: i } })
    const distance = vi.fn(distanceMeters)
    db.$client.function('spherical_distance', { deterministic: true }, distance)
    expect(reportIds(store)).toHaveLength(1)
    expect(distance.mock.calls.length).toBeLessThanOrEqual(2)
    for (const location of [center, { latitude: 0, longitude: 179.999 }, { latitude: 90, longitude: 0 }]) {
      const query = nearbyQuery(location)
      const plan = db.$client.prepare(`EXPLAIN QUERY PLAN ${query.sql}`).all(...query.parameters) as { detail: string }[]
      expect(plan.some(({ detail }) => /VIRTUAL TABLE INDEX \d+:[A-Z0-9]+/.test(detail))).toBe(true)
      expect(plan.some(({ detail }) => /SEARCH report USING INTEGER PRIMARY KEY/.test(detail))).toBe(true)
      expect(plan.some(({ detail }) => /SCAN report/.test(detail))).toBe(false)
    }
  })
})

describe('database constraints and transactional RTREE triggers', () => {
  it.each([
    { latitude: 90.001 }, { longitude: -180.001 }, { latitude: Infinity },
    { source: 'other' }, { description: '' }, { description: '\t\n\u2000' },
    { description: 'x'.repeat(2001) }, { created_at: -1 }, { updated_at: 0 },
  ])('enforces schema CHECK constraints even for direct SQL: %j', (changes) => {
    const { db } = setup()
    const row = { latitude: 0, longitude: 0, source: 'app', description: 'x', created_at: 1, updated_at: 1, ...changes }
    expect(() => db.$client.prepare(`INSERT INTO locations
      (latitude, longitude, source, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`)
      .run(row.latitude, row.longitude, row.source, row.description, row.created_at, row.updated_at)).toThrow(/CHECK/)
    expect(db.$client.prepare('SELECT * FROM locations_rtree').all()).toEqual([])
  })

  it('keeps RTREE consistent after coordinate updates, ID changes, and deletions', () => {
    const { db, store } = setup()
    const id = store.createApp(input)
    expect(reportIds(store)).toEqual([id])
    db.$client.prepare('UPDATE locations SET latitude = 0, longitude = 0 WHERE id = ?').run(id)
    expect(reportIds(store)).toEqual([])
    expect(reportIds(store, { latitude: 0, longitude: 0 })).toEqual([id])
    db.$client.prepare('UPDATE locations SET id = 500 WHERE id = ?').run(id)
    expect(reportIds(store, { latitude: 0, longitude: 0 })).toEqual([500])
    expect(db.$client.prepare('SELECT id FROM locations_rtree').all()).toEqual([{ id: 500 }])
    db.$client.prepare('DELETE FROM locations WHERE id = 500').run()
    expect(db.$client.prepare('SELECT * FROM locations_rtree').all()).toEqual([])
  })

  it('rolls back both report and RTREE insertion when a transaction fails', () => {
    const { db, store } = setup()
    expect(() => db.$client.transaction(() => {
      store.createApp(input)
      expect(reportIds(store)).toHaveLength(1)
      throw new Error('Forced failure after index insertion')
    })()).toThrow(/Forced failure/)
    expect(db.$client.prepare('SELECT * FROM locations').all()).toEqual([])
    expect(db.$client.prepare('SELECT * FROM locations_rtree').all()).toEqual([])
    expect(reportIds(store)).toEqual([])
  })

  it('rolls back both coordinate updates and deletes with the report row', () => {
    const { db, store } = setup()
    const id = store.createApp(input)
    expect(() => db.$client.transaction(() => {
      db.$client.prepare('UPDATE locations SET latitude = 0 WHERE id = ?').run(id)
      db.$client.prepare('DELETE FROM locations WHERE id = ?').run(id)
      throw new Error('rollback')
    })()).toThrow('rollback')
    expect(reportIds(store)).toEqual([id])
    expect(db.$client.prepare('SELECT id FROM locations_rtree').all()).toEqual([{ id }])
  })
})
