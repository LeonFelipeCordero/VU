"""Prepare the official Unfallatlas 2024 CSV ZIP for the existing dataset importer.

Usage: python3 scripts/prepare-berlin-unfallatlas.py source.zip manifest.json
Source: https://unfallatlas.statistikportal.de/ (Open Data, 2024 CSV)
"""
import csv
import hashlib
import io
import json
import sys
import zipfile
from pathlib import Path

SOURCE_URL = "https://www.opengeodata.nrw.de/produkte/transport_verkehr/unfallatlas/Unfallorte2024_EPSG25832_CSV.zip"


def prepare(source):
    with zipfile.ZipFile(source) as archive:
        with archive.open("csv/Unfallorte2024_LinRef.csv") as stream:
            rows = csv.DictReader(io.TextIOWrapper(stream, encoding="utf-8-sig"), delimiter=";")
            records = [normalize(row) for row in rows if row["ULAND"].lstrip("0") == "11"]
    if not records:
        raise ValueError("The source contains no Berlin records.")
    return {
        "dataset": {
            "name": "Unfallatlas Berlin · Statistische Ämter des Bundes und der Länder",
            "version": "2024",
            "url": SOURCE_URL,
            "license": "Datenlizenz Deutschland – Namensnennung – Version 2.0; https://www.govdata.de/dl-de/by-2-0",
            "fileSha256": hashlib.sha256(source.read_bytes()).hexdigest(),
            "coverage": {
                "geography": "Berlin", "year": 2024, "filter": "ULAND = 11",
                "scope": "Police-recorded road collisions involving personal injury, not all crime or all road collisions.",
                "completeness": "Unknown beyond the published source coverage.",
                "timePrecision": "Year, month, weekday code and hour; exact occurrence date is not provided.",
                "locationPrecision": "Published WGS84 coordinates; positional accuracy is not specified.",
            },
        },
        "records": records,
    }


def normalize(row):
    latitude = float(row["YGCSWGS84"].replace(",", "."))
    longitude = float(row["XGCSWGS84"].replace(",", "."))
    if row["UJAHR"] != "2024" or not (52 <= latitude <= 53 and 12 <= longitude <= 14):
        raise ValueError("Unexpected year or coordinates in the Berlin source.")
    return {
        "sourceRecordId": row["UIDENTSTLAE"], "raw": row,
        "incident": {
            "category": "traffic_collision", "sourceCategory": row["UART"],
            "latitude": latitude, "longitude": longitude,
            "locationMethod": "source", "locationPrecision": "source point; accuracy unspecified",
            "time": {"year": int(row["UJAHR"]), "month": int(row["UMONAT"]),
                     "hour": int(row["USTUNDE"]), "weekdaySourceCode": row["UWOCHENTAG"],
                     "timezone": "Europe/Berlin", "precision": "partial"},
            "sourceSeverity": {"categoryCode": row["UKATEGORIE"]},
            "qualityFlags": ["partial_time", "location_precision_unspecified"], "isSynthetic": False,
        },
    }


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    manifest = prepare(Path(sys.argv[1]))
    Path(sys.argv[2]).write_text(json.dumps(manifest, ensure_ascii=False), encoding="utf-8")
    print(f"Prepared {len(manifest['records'])} Berlin source records.")
