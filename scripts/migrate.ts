import { fileURLToPath } from 'node:url'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { openDatabase } from '../src/db/database.server.ts'

const db = openDatabase()
try {
  migrate(db, { migrationsFolder: fileURLToPath(new URL('../drizzle', import.meta.url)) })
} finally {
  db.$client.close()
}
