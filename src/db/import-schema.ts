import { sql } from 'drizzle-orm'
import { check, integer, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

// Original files remain the archival source; JSON retains every parsed source field.
export const datasets = sqliteTable('datasets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  version: text('version').notNull(),
  url: text('url').notNull(),
  license: text('license').notNull(),
  fileSha256: text('file_sha256').notNull(),
  coverage: text('coverage', { mode: 'json' }).$type<Record<string, unknown>>().notNull(),
  importedAt: integer('imported_at').notNull(),
}, (t) => [uniqueIndex('datasets_release').on(t.name, t.version)])

export const sourceRecords = sqliteTable('source_records', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  datasetId: integer('dataset_id').notNull().references(() => datasets.id),
  recordKey: text('record_key').notNull(),
  sourceRecordId: text('source_record_id'),
  rowNumber: integer('row_number').notNull(),
  raw: text('raw', { mode: 'json' }).$type<Record<string, unknown>>().notNull(),
}, (t) => [
  uniqueIndex('source_records_key').on(t.datasetId, t.recordKey),
  check('source_records_row_check', sql`${t.rowNumber} > 0`),
])

export const incidents = sqliteTable('incidents', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sourceRecordId: integer('source_record_id').notNull().references(() => sourceRecords.id),
  category: text('category'),
  sourceCategory: text('source_category'),
  latitude: real('latitude'),
  longitude: real('longitude'),
  locationPrecision: text('location_precision'),
  locationMethod: text('location_method'),
  areaId: text('area_id'),
  areaScheme: text('area_scheme'),
  areaVersion: text('area_version'),
  occurredStart: integer('occurred_start'),
  occurredEnd: integer('occurred_end'),
  // Components and timezone stay explicit when a source cannot identify an instant.
  time: text('time', { mode: 'json' }).$type<Record<string, unknown>>(),
  publishedAt: integer('published_at'),
  sourceSeverity: text('source_severity', { mode: 'json' }).$type<unknown>(),
  qualityFlags: text('quality_flags', { mode: 'json' }).$type<string[]>().notNull(),
  isSynthetic: integer('is_synthetic', { mode: 'boolean' }).notNull(),
}, (t) => [
  uniqueIndex('incidents_source_record').on(t.sourceRecordId),
  check('incidents_coordinates_check', sql`(${t.latitude} IS NULL AND ${t.longitude} IS NULL) OR
    (${t.latitude} IS NOT NULL AND ${t.longitude} IS NOT NULL AND
    typeof(${t.latitude}) IN ('real','integer') AND ${t.latitude} BETWEEN -90 AND 90 AND
    typeof(${t.longitude}) IN ('real','integer') AND ${t.longitude} BETWEEN -180 AND 180)`),
  check('incidents_interval_check', sql`${t.occurredEnd} IS NULL OR
    (${t.occurredStart} IS NOT NULL AND ${t.occurredEnd} >= ${t.occurredStart})`),
  check('incidents_synthetic_check', sql`${t.isSynthetic} IN (0, 1)`),
])
