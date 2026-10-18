import { and, eq, gt } from 'drizzle-orm'
import type { ReportsDatabase } from './database.server'
import { datasets, incidents, sourceRecords } from './import-schema'
import { validateCoordinates } from '../lib/report'

export type IncidentInput = Omit<typeof incidents.$inferInsert, 'id' | 'sourceRecordId'>
export type DatasetImport = {
  dataset: Omit<typeof datasets.$inferInsert, 'id' | 'importedAt'>
  records: { sourceRecordId?: string; raw: Record<string, unknown>; incident?: IncidentInput }[]
}

function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function validateIncident(input: IncidentInput) {
  if (!object(input)) throw new Error('Incident must be an object.')
  if (input.latitude != null || input.longitude != null) {
    validateCoordinates({ latitude: input.latitude!, longitude: input.longitude! })
    if (!input.locationMethod || !input.locationPrecision) throw new Error('Location method and precision are required.')
  }
  for (const field of ['occurredStart', 'occurredEnd', 'publishedAt'] as const) {
    const value = input[field]
    if (value != null && !Number.isSafeInteger(value)) throw new Error(`${field} must be epoch milliseconds.`)
  }
  if (input.occurredEnd != null && (input.occurredStart == null || input.occurredEnd < input.occurredStart)) {
    throw new Error('Occurrence interval is invalid.')
  }
  if (input.time != null && !object(input.time)) throw new Error('Time metadata must be an object.')
  if (!Array.isArray(input.qualityFlags) || input.qualityFlags.some((flag) => typeof flag !== 'string')) {
    throw new Error('Quality flags must be strings.')
  }
  if (typeof input.isSynthetic !== 'boolean') throw new Error('Synthetic status must be explicit.')
}

// Trusted, server-only imports. A release is immutable; a corrected file needs a new version.
export function importDataset(db: ReportsDatabase, input: DatasetImport) {
  if (!input || !object(input.dataset) || !Array.isArray(input.records)) throw new Error('Invalid import document.')
  const metadata = input.dataset
  for (const field of ['name', 'version', 'url', 'license'] as const) {
    if (typeof metadata[field] !== 'string' || !metadata[field].trim()) throw new Error(`Dataset ${field} is required.`)
  }
  if (!/^[a-f0-9]{64}$/.test(metadata.fileSha256)) throw new Error('Original file SHA-256 is required.')
  if (!object(metadata.coverage)) throw new Error('Document dataset coverage, including unknown coverage.')
  return db.transaction((tx) => {
    const existing = tx.select().from(datasets)
      .where(and(eq(datasets.name, metadata.name), eq(datasets.version, metadata.version))).get()
    if (existing) throw new Error('Dataset release already exists; use a new version for corrections.')
    const datasetId = tx.insert(datasets).values({ ...metadata, importedAt: Date.now() }).returning().get().id
    for (const [index, record] of input.records.entries()) {
      if (!object(record) || !object(record.raw)) throw new Error(`Row ${index + 1} needs an original record object.`)
      if (record.sourceRecordId !== undefined && (typeof record.sourceRecordId !== 'string' || !record.sourceRecordId.trim())) {
        throw new Error('Source record identifier must be nonblank text.')
      }
      const sourceRecordId = tx.insert(sourceRecords).values({
        datasetId, rowNumber: index + 1,
        recordKey: record.sourceRecordId === undefined ? `row:${index + 1}` : `id:${record.sourceRecordId}`,
        sourceRecordId: record.sourceRecordId, raw: record.raw,
      }).returning().get().id
      if (record.incident !== undefined) {
        validateIncident(record.incident)
        tx.insert(incidents).values({ ...record.incident, sourceRecordId }).run()
      }
    }
    return { datasetId, records: input.records.length }
  })
}

// No nearby radius, UI cap, or implicit exclusion of incomplete records.
export function* exportIncidents(db: ReportsDatabase) {
  let afterId = 0
  while (true) {
    const rows = db.select({ incident: incidents, source: sourceRecords, dataset: datasets })
      .from(incidents).innerJoin(sourceRecords, eq(incidents.sourceRecordId, sourceRecords.id))
      .innerJoin(datasets, eq(sourceRecords.datasetId, datasets.id))
      .where(gt(incidents.id, afterId)).orderBy(incidents.id).limit(1000).all()
    if (!rows.length) return
    yield* rows
    afterId = rows[rows.length - 1].incident.id
  }
}
