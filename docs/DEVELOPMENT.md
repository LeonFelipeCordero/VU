# SSR prototype

The app uses TanStack Start, Drizzle ORM, and a local SQLite database. There is no hosted backend or separate REST service. The Kotlin services and Docker configuration remain unchanged.

## Run locally

Use Node.js 22.12+ and npm. `better-sqlite3` is a native Node module; use a supported Node version and install build tools if a prebuilt binary is unavailable. Build with the Node version, OS, and architecture used in production.

```sh
npm ci
cp .env.example .env.local
npm run db:migrate
npm run dev -- --host 127.0.0.1 --port 3000
```

Reports persist in `.data/vigiles-urbani.sqlite` by default. `DATABASE_PATH` changes the server-only file path. Relative paths resolve from the working directory, so run these commands from the project root. Migration and start scripts load `.env.local`; Vite loads the same database setting for development. Explicit environment variables take precedence. The database file and its WAL/SHM files are ignored by Git.

Migrations must run before the app starts. Repeating `npm run db:migrate` is safe. It creates the parent directory, applies pending migrations, and closes its connection. Do not use schema push: the committed migrations also create the spatial index and its maintenance triggers.

Set `VITE_MAPTILER_KEY` in `.env.local` to a browser key restricted to your application origins. `VITE_` settings are public and included at build time. Never prefix `DATABASE_PATH` or server secrets with `VITE_`. Restart Vite after changing settings. Without a map key, coordinate entry, device location, report submission, and nearby reports still work.

```sh
npm run check
npm test
npm run build
PORT=3000 npm start
```

To change the database schema, edit `src/db/schema.ts`, run `npm run db:generate`, inspect the generated SQL, and run `npm run db:migrate`. Keep custom spatial SQL and tests consistent with schema changes. Commit migrations, migration metadata, and `package-lock.json`.

## Structure and data flow

```text
src/routes/                 SSR pages, loaders, URL coordinate state
src/features/map/           Search, geolocation, MapLibre, selected pin
src/features/reports/       Submission form, list, Start server functions
src/lib/                    Shared report types and validation
src/db/                     Drizzle schema, SQLite connection, spatial queries
scripts/migrate.ts          Apply database migrations
drizzle/                    Committed SQL migrations and metadata
tests/                      Database, component, and router tests
```

```text
URL coordinates -> Start GET server function -> SQLite nearby query -> SSR list
Browser selection -> report form -> Start POST server function -> Drizzle insert
                                                             -> R-tree trigger
                                                             -> loader refresh
```

SQLite and its native driver stay on the server. Both reads and writes use Start server functions. No database connection, file path, or database driver is sent to the browser. No duplicate query cache or live subscription is used. Refresh and navigation fetch current reports.

## Report behavior

The URL stores the report search point as `lat` and `lng`. Chihuahua is only the initial navigation default, not a coverage claim. Opening a URL does not select a submission location. Users explicitly select one with search, device location, a map click, a draggable pin, map-center selection, or coordinate entry. Panning alone does not change the 1 km report search. Map navigation clears an old selection without discarding the draft. Late device results cannot replace a newer selection.

MapLibre starts only in the browser. Reports use clustered GeoJSON points; the selected point uses a draggable marker. Addresses help select coordinates and are never stored. Search runs on explicit submission. Reverse geocoding is omitted because it is optional. Near the poles, map display is limited but stored coordinates and report queries remain intact.

Descriptions are trimmed, nonblank, and limited to 2,000 characters. Coordinates must be finite, with latitude from -90 to 90 and longitude from -180 to 180. The database also enforces domain constraints. Public submissions cannot choose their source or timestamps. The server sets `source: "app"`, `createdAt`, and `updatedAt`. Trusted crawler insertion exists only as a server-side function, not a public endpoint. Descriptions render as text, including in map popups.

The R-tree index supplies bounding-box candidates. SQLite applies exact spherical distance, sorts by distance, and returns at most 200 reports within 1,000 meters. The query handles the antimeridian and poles. Triggers keep the spatial index consistent with inserts, updates, and deletes in the same transaction. The browser never downloads and filters the full dataset.

## Storage and rollout limits

Keep the SQLite file on persistent, writable local storage. This setup is for one application host, not independent serverless instances or shared network filesystems. WAL permits concurrent readers; writes remain serialized. Back up the database with SQLite's backup facilities or stop writes and close connections before copying it. Copying only the main file while WAL is active can lose committed data.

Tests use real temporary SQLite databases and the committed migrations. They cover validation, trusted fields, persistence, radius accuracy, poles, antimeridian behavior, result limits, index consistency, and rollback. Component and router tests cover submission failures, retained drafts, duplicate-submit blocking, search failures, denied geolocation, and selection races. These checks are not a production load benchmark.

No prior hosted records or legacy MongoDB records were imported or deleted. Decide whether existing data must be retained before any migration or traffic switch.

Before public rollout, confirm geography and expected volume, benchmark dense-area queries, verify MapTiler coverage/pricing/terms, choose abuse protection and sensitive-location handling, and test the live map. The prototype allows anonymous submissions and publishes exact coordinates. It is not ready for an unprotected public deployment.

Hot zones, historical statistics, occurrence dates, categories, user accounts, moderation, report editing, and data migration remain deferred. Audit timestamps describe database activity, not incident occurrence. Report counts are not safety scores.
