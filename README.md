# Vigiles Urbani

Vigiles Urbani / SafeCity collects location-based incident reports and displays them on maps.

## Rebuild plan

This document records the planned rebuild. It does not describe an implemented TypeScript application. The existing Kotlin applications remain unchanged.

### Agreed stack

- **TanStack Start, React, and TypeScript:** One application with server-side rendering (SSR). No separate REST API service.
- **Convex:** Proposed persistence and backend functions. Convex remains a separate managed backend, even though application code lives in one repository.
- **MapLibre GL JS:** Browser-side map rendering, markers, clustering, and heatmaps.
- **MapTiler client:** Address search and reverse geocoding. Use the client, not the full map SDK, to avoid duplicating the map renderer.
- **MapTiler tiles:** Planned source of streets, buildings, and map labels.

TanStack Start renders page content and initial data on the server. The map initializes in the browser because it requires browser APIs. Browser geolocation also runs client-side and requires permission.

Use TanStack Router for routes and URL state. Add TanStack Query only where the selected integration requires it; do not create two independent caches for the same data.

### Map selection

Users can select a location in three ways:

1. Search for an address and choose a result.
2. Use their current device location.
3. Click the map.

Show the selected point as a draggable marker so the user can correct its position. Address search helps select coordinates; **do not save the address**. Reverse geocoding is optional display functionality, not part of the stored model.

MapLibre uses coordinate arrays in **longitude, latitude** order:

```ts
const coordinates = [-106.0738, 28.6400];
```

Store named coordinate fields to avoid order mistakes. Convert them when rendering:

```ts
const coordinates = [record.location.longitude, record.location.latitude];
```

MapLibre GL JS is free and open source, without per-map-load fees. Tile hosting, address search, application hosting, and database usage can incur costs. MapTiler requires an API key. Verify current prices, quotas, regional coverage, and storage terms before implementation. OpenStreetMap public tile servers are not an unlimited production tile service, and public Nominatim is not suitable for autocomplete.

## Starting data model

Start with one `locations` table. Each record stores coordinates, its ingestion source, a description, and audit timestamps.

Do not add addresses, categories, severity weights, users, moderation tables, or statistics tables in the first implementation. These were discussed as possible future features, not accepted requirements.

### Convex schema

Planned contents of `convex/schema.ts`:

```ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  locations: defineTable({
    location: v.object({
      latitude: v.number(),
      longitude: v.number(),
    }),
    source: v.union(v.literal("app"), v.literal("crawler")),
    description: v.string(),
    updatedAt: v.number(),
  }),
});
```

Convex automatically supplies `_id` and `_creationTime`. Do not duplicate these as `id` and `createdAt`.

The resulting document type is conceptually:

```ts
import type { Id } from "./_generated/dataModel";

type LocationRecord = {
  _id: Id<"locations">;
  _creationTime: number;
  location: {
    latitude: number;
    longitude: number;
  };
  source: "app" | "crawler";
  description: string;
  updatedAt: number;
};
```

The import above applies to code inside `convex/` after Convex generates its types.

### Field meaning

| Field | Meaning |
| --- | --- |
| `location.latitude` | Latitude in decimal degrees, from -90 to 90. |
| `location.longitude` | Longitude in decimal degrees, from -180 to 180. |
| `source` | How the record entered the system: `app` or `crawler`. Not the method used to select coordinates. |
| `description` | Text describing the report. |
| `_creationTime` | Convex-generated creation timestamp in milliseconds since the Unix epoch. |
| `updatedAt` | Server-set last-change timestamp in milliseconds since the Unix epoch. |

Audit timestamps record database activity. They do **not** record when an incident occurred. The minimal model has no occurrence-time field, so it cannot reproduce historical incident-date statistics yet.

### Validation and trust boundaries

The schema validates field types. Backend mutations must also enforce domain rules:

- Coordinates must be finite and within the stated ranges.
- Description must be nonblank and have a defined maximum length. Choose the limit before implementation.
- Set `updatedAt` using server time on creation and every edit.
- Public app submissions must receive `source: "app"` from the backend. Do not trust a caller-supplied source.
- Only an authenticated or otherwise trusted crawler path may create `source: "crawler"` records.
- Render descriptions as text, not raw HTML.

### Spatial queries

This schema alone does not provide efficient nearby searches. Before committing to Convex, prove a spatial-query approach using representative data.

Check radius accuracy, dense-area performance, result limits, cost, and spatial-index consistency. Query the visible area or a bounded radius; do not download the full dataset and filter it in the browser. Add the required spatial index only after selecting the implementation.

If Convex cannot meet these needs, evaluate keeping MongoDB behind TanStack Start server-side operations without introducing a separate REST API service.

## Existing application

The current repository contains:

- `SafeCity/`: Kotlin/Spring server-rendered frontend with templates and jQuery.
- `SafeCityAPI/`: Kotlin/Spring REST API backed by MongoDB.
- `config-server/` and `config-server-properties/`: Spring configuration services and settings.
- `import_test_data/`: CSV importer that randomizes locations and dates.
- `mongo-queris/`: MongoDB query examples.
- `docker-compose.yml`: Legacy service configuration, including MongoDB and a Data Flow service whose purpose still needs confirmation.

Current behavior includes:

- `/`: Map with device location, Google Places search, nearby incident markers, and report submission.
- `/hot-zones`: Heatmap based on nearby incident coordinates.
- `/dashboard`: Location search and incident-category visualization.
- `/about`: Project information.
- Nearby incident lookup within approximately 1 km.
- API statistics within 10 km for cumulative 6-, 12-, and 24-month windows, plus a category-weighted total. Not all API results are displayed in the current dashboard.

Reports currently store a GeoJSON location, title, description, incident category, category-based weight, and occurrence date. No user-account, report-editing, or moderation flow was found in the inspected application code.

### Legacy issues to handle deliberately

- Forms use “Thievery” while weight mapping expects “Theft.”
- Invalid occurrence dates can fall back to the current date.
- Date input has no explicit timezone.
- Category weights are not a validated measure of personal danger.
- Randomized imported data must not be presented as real public reports.
- The proposed minimal model does not preserve every legacy field. Decide whether real data must be retained before importing or deleting anything.

Report counts describe submitted reports, not proven incidents or a reliable safety score. Missing reports do not demonstrate an absence of incidents.

## Implementation sequence

1. Confirm initial geographic coverage and whether real legacy data must be preserved.
2. Prove Convex spatial queries and verify MapTiler coverage, pricing, and terms.
3. Create the TanStack Start application and the minimal Convex schema with backend validation.
4. Implement location selection, description submission, and map display.
5. Add focused tests for coordinate validation, trusted source assignment, timestamps, and the submission flow. Check the map in a browser, including denied geolocation and failed search.
6. Decide how later features such as hot zones and statistics fit the minimal model. Do not silently claim feature parity.
7. If migration is required, import into a separate environment and compare records and query results before switching traffic.
8. Retire legacy services only after acceptance checks pass. Update deployment configuration at that point and keep a rollback path.

Proposed package structure:

```text
src/routes/             SSR pages and navigation
src/features/map/       Map, search, and markers
src/features/reports/   Description form and report details
convex/                 Schema, queries, mutations, and spatial logic
scripts/                Legacy import, if required
tests/                  Validation and user-flow tests
```

Keep the legacy application and deployment configuration unchanged during the initial prototype. The first implementation is deliberately smaller than the existing feature set.

## Open decisions

- Initial country or city and expected record volume.
- Whether existing MongoDB data is real and must be preserved.
- Convex spatial-query implementation and operational limits.
- Public submission protection, sensitive-location handling, and whether reports require review before publication.
- Description length limit and crawler authentication.
- Whether occurrence times, categories, provenance details, or import deduplication become necessary in a later model.

The legacy app has not been run as part of this planning work. Current provider pricing and integration limits have not been verified.

## Legacy map-key configuration

The existing application reads map keys from MongoDB. The original configuration notes refer to the `safe_city` database and `keys` collection, with documents shaped as follows:

```json
{
  "name": "google.api",
  "value": "<google-api-key>",
  "provider": "<key-provider>",
  "description": "<key-description>"
}
```

This is legacy configuration, not the proposed MapTiler configuration. Never commit actual API keys.
