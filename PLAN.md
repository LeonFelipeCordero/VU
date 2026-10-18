# Vigiles Urbani

Vigiles Urbani / SafeCity collects location-based community reports and displays them on maps.

## Current rebuild direction

The initial prototype uses **Drizzle ORM and local SQLite**, replacing the originally proposed managed backend. Keep one TanStack Start application and leave the legacy Kotlin services and deployment unchanged during acceptance checks. See [development notes](docs/DEVELOPMENT.md) for setup and operational limits.

### Stack

- TanStack Start, React, and TypeScript for one server-rendered application.
- TanStack Router for routes and URL coordinate state.
- Drizzle ORM with `better-sqlite3` for persistent local storage.
- SQLite R-tree for bounded spatial queries, with exact distance filtering on the server.
- MapLibre GL JS for browser-side map rendering, markers, and clustering.
- MapTiler client for address search and MapTiler tiles for streets, buildings, and labels.

Page content and initial reports render on the server. Map rendering and browser geolocation run only in the browser. Reads and submissions use Start server functions. Do not add a separate REST API service or duplicate query cache.

## First implementation

Users select a location by address search, device location, or map click. A draggable marker allows correction. Coordinate entry and map-center selection provide keyboard-accessible alternatives. Address search selects coordinates; it does not save the address. Reverse geocoding remains optional and is not implemented.

Store named coordinates. Convert them only when rendering:

```ts
const coordinates = [report.location.longitude, report.location.latitude];
```

MapLibre is open source, but tiles, search, hosting, and storage can incur costs. MapTiler requires a public browser key restricted to the application origins. Verify current coverage, pricing, quotas, attribution, and storage terms before rollout. Do not substitute unrestricted OpenStreetMap tiles or public Nominatim autocomplete.

## Minimal model

One `locations` table stores:

| Field | Meaning |
| --- | --- |
| `id` | SQLite-generated integer primary key. |
| `latitude` | Finite decimal degrees, from -90 to 90. |
| `longitude` | Finite decimal degrees, from -180 to 180. |
| `source` | `app` or `crawler`, assigned by trusted server code. |
| `description` | Trimmed, nonblank text, maximum 2,000 characters. |
| `createdAt` | Server-set creation timestamp, milliseconds since the Unix epoch. |
| `updatedAt` | Server-set last-change timestamp in the same units. |

The app exposes coordinates as a named `location` object. SQLite columns remain flat. Database constraints supplement shared input validation. Public callers cannot set source or audit timestamps. Crawler creation is server-only and has no external endpoint.

Do not add stored addresses, categories, severity weights, accounts, moderation tables, or statistics tables in this stage. Audit timestamps do not record when an incident occurred. Reports render as text, never raw HTML.

## Spatial queries

Maintain an R-tree point index with transactional database triggers. Query a bounding box, including wraparound at the antimeridian, then apply exact spherical distance and nearest-first ordering in SQLite. Return at most 200 reports within 1 km of the search point. Show a limit warning when appropriate. Never download the complete dataset for browser-side filtering.

Test radius boundaries, dense-area limits, poles, the antimeridian, index consistency, and rollback with real SQLite databases. Benchmark representative data before production use. The local database is an interim single-host choice, not a distributed storage design.

## Package structure

```text
src/routes/             SSR pages and navigation
src/features/map/       Map, address search, markers
src/features/reports/   Form, list, Start server functions
src/lib/                Shared types and validation
src/db/                 Drizzle schema, connection, report queries
scripts/                Database migration command
drizzle/                Versioned SQL migrations
tests/                  Database, component, router checks
```

## Legacy application and migration boundaries

`SafeCity/` is the Kotlin/Spring template frontend. `SafeCityAPI/` is the MongoDB-backed REST API. Spring configuration services, CSV import tools, MongoDB query examples, and Docker configuration remain separate and unchanged.

Legacy behavior includes nearby incident markers and submission, hot-zone heatmaps, category visualization, and historical/category-weighted statistics. The minimal prototype does not claim feature parity. Legacy title, category, occurrence date, and weight fields are not silently mapped to the new model.

Do not present randomized import data as real reports. Confirm whether MongoDB data is real and must be retained before importing or deleting anything. If data migration becomes necessary, use a separate environment, compare records and query results, and keep a rollback path. Do not retire legacy services before acceptance checks pass.

Reports are unverified submissions, not proven incidents or a reliable safety score. Missing reports do not demonstrate an absence of incidents.

## Open rollout decisions

Confirm initial geography and expected volume. Choose public submission protection, moderation, sensitive-location handling, data retention, and backup/restore procedures. Keep SQLite on persistent writable local storage; do not deploy independent copies to ephemeral/serverless instances. Validate spatial query performance and live MapTiler behavior before switching traffic.

Occurrence times, categories, richer crawler provenance, external crawler authentication, and import deduplication remain later decisions. The first prototype does not migrate hosted or legacy data.
