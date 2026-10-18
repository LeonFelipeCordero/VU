import { writeSync } from 'node:fs'
import { openDatabase } from '../src/db/database.server'
import { exportIncidents } from '../src/db/imports.server'

const db = openDatabase()
try {
  for (const record of exportIncidents(db)) writeSync(process.stdout.fd, `${JSON.stringify(record)}\n`)
} finally {
  db.$client.close()
}
