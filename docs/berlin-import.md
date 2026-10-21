# Berlin historical road-collision data

Source: [Unfallatlas 2024](https://unfallatlas.statistikportal.de/), Statistische Ämter des Bundes und der Länder.
License: [Datenlizenz Deutschland – Namensnennung – Version 2.0](https://www.govdata.de/dl-de/by-2-0).

The national CSV ZIP contains 12,428 records with `ULAND = 11` (Berlin). These are police-recorded road collisions involving personal injury, not general crime reports or a complete record of all collisions. The local preview uses the source's WGS84 coordinates. It does not generate locations or exact occurrence dates.

## Import

Run from the project root after `npm ci`. Python 3 uses only its standard library.

```sh
mkdir -p .data/sources
curl -fL https://www.opengeodata.nrw.de/produkte/transport_verkehr/unfallatlas/Unfallorte2024_EPSG25832_CSV.zip \
  -o .data/sources/Unfallorte2024_EPSG25832_CSV.zip
python3 scripts/prepare-berlin-unfallatlas.py \
  .data/sources/Unfallorte2024_EPSG25832_CSV.zip .data/sources/berlin-manifest.json
DATABASE_PATH=.data/berlin.sqlite npm run db:migrate
DATABASE_PATH=.data/berlin.sqlite npm run data:import -- \
  .data/sources/berlin-manifest.json .data/sources/Unfallorte2024_EPSG25832_CSV.zip
```

Import each dataset release once. The existing importer rejects duplicate releases. The manifest retains each original record, source identifier, ZIP checksum, coverage, license, and partial time metadata. The imported records remain separate from community reports. ZIP files, manifests, and databases under `.data/` are not committed.

The archive used for the screenshots has SHA-256 `4a321fbde7cac6344a6ee1f8926ceb2a585b2adb3bcf301ad4fb85bb9abb4813`.

## View

```sh
npm run build
HOST=127.0.0.1 PORT=18180 DATABASE_PATH=.data/berlin.sqlite npm start
```

Open `http://127.0.0.1:18180/?lat=52.52&lng=13.405` for Berlin Mitte. Blue markers show the nearest 200 real historical records within 1 km; a notice states when more records exist. Imported records with unknown locations or synthetic status are not drawn. This map is not an exhaustive dataset export or a measure of current danger.

Without a MapTiler key, the app uses OpenStreetMap raster tiles and explicit Photon address search. These public services have usage limits and no production availability guarantee. `VITE_PHOTON_URL` can select a compatible self-hosted address service.

## Screenshots and checks

`docs/screenshots/berlin-mitte.png`, `berlin-source.png`, and `berlin-kreuzberg.png` are actual desktop Brave captures of the imported data, not mockups. The browser checked marker details and a real Photon search for Kottbusser Tor. It did not submit generated community reports.

Checks: `npm run check`, `npm test`, `python3 -m unittest discover -s tests -p 'test_berlin_manifest.py'`, and `npm run build`.
