import { sql } from 'drizzle-orm'
import { check, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const locations = sqliteTable('locations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  source: text('source', { enum: ['app', 'crawler'] }).notNull(),
  description: text('description').notNull(),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
}, (table) => [
  check('locations_latitude_check', sql`typeof(${table.latitude}) IN ('real', 'integer') AND ${table.latitude} BETWEEN -90 AND 90`),
  check('locations_longitude_check', sql`typeof(${table.longitude}) IN ('real', 'integer') AND ${table.longitude} BETWEEN -180 AND 180`),
  check('locations_source_check', sql`${table.source} IN ('app', 'crawler')`),
  // SQLite trim needs the full ECMAScript whitespace set to reject blank descriptions.
  check('locations_description_check', sql`length(${table.description}) <= 2000 AND length(trim(${table.description}, char(9,10,11,12,13,32,160,5760,8192,8193,8194,8195,8196,8197,8198,8199,8200,8201,8202,8232,8233,8239,8287,12288,65279))) > 0 AND instr(${table.description}, char(0)) = 0`),
  check('locations_created_at_check', sql`typeof(${table.createdAt}) = 'integer' AND ${table.createdAt} >= 0`),
  check('locations_updated_at_check', sql`typeof(${table.updatedAt}) = 'integer' AND ${table.updatedAt} >= ${table.createdAt}`),
])
