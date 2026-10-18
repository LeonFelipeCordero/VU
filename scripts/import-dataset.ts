import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { openDatabase } from '../src/db/database.server'
import { importDataset, type DatasetImport } from '../src/db/imports.server'

const [manifestPath, originalPath] = process.argv.slice(2)
if (!manifestPath || !originalPath) throw new Error('Usage: npm run data:import -- manifest.json original-source-file')
const input = JSON.parse(readFileSync(manifestPath, 'utf8')) as DatasetImport
const fileSha256 = createHash('sha256').update(readFileSync(originalPath)).digest('hex')
if (input.dataset?.fileSha256 && input.dataset.fileSha256 !== fileSha256) throw new Error('Original file checksum does not match manifest.')
input.dataset = { ...input.dataset, fileSha256 }
const db = openDatabase()
try {
  console.log(JSON.stringify(importDataset(db, input)))
} finally {
  db.$client.close()
}
