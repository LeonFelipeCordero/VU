import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'
import { distanceMeters } from './spatial.server'

export function openDatabase(path = process.env.DATABASE_PATH || '.data/vigiles-urbani.sqlite') {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true })
  const sqlite = new Database(path)
  try {
    sqlite.pragma('busy_timeout = 5000')
    sqlite.pragma('journal_mode = WAL')
    sqlite.pragma('foreign_keys = ON')
    sqlite.function('spherical_distance', { deterministic: true }, distanceMeters)
    return drizzle(sqlite, { schema })
  } catch (error) {
    sqlite.close()
    throw error
  }
}

export type ReportsDatabase = ReturnType<typeof openDatabase>
let database: ReportsDatabase | undefined

// Deployment must run migrations before starting the application.
export function getDatabase() {
  return database ??= openDatabase()
}
