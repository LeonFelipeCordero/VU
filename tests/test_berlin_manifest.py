import csv
import hashlib
import importlib.util
import io
from pathlib import Path
import tempfile
import unittest
import zipfile

spec = importlib.util.spec_from_file_location("berlin_manifest", Path(__file__).parents[1] / "scripts/prepare-berlin-unfallatlas.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class BerlinManifestTest(unittest.TestCase):
    def row(self, **overrides):
        return dict(ULAND="11", UJAHR="2024", UMONAT="03", USTUNDE="21", UWOCHENTAG="3", UART="0",
                    UKATEGORIE="3", UIDENTSTLAE="original-id", XGCSWGS84="13,463568648000035",
                    YGCSWGS84="52,497776871000042", unknownField="retain this", **overrides)

    def test_filters_berlin_and_preserves_source_coordinates_fields_and_partial_time(self):
        berlin = self.row()
        other = {**berlin, "ULAND": "12", "UIDENTSTLAE": "other-state"}
        stream = io.StringIO()
        writer = csv.DictWriter(stream, fieldnames=list(berlin), delimiter=";")
        writer.writeheader()
        writer.writerows([berlin, other])
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / "source.zip"
            with zipfile.ZipFile(source, "w") as archive:
                archive.writestr("csv/Unfallorte2024_LinRef.csv", stream.getvalue())
            manifest = module.prepare(source)
            self.assertEqual(manifest["dataset"]["fileSha256"], hashlib.sha256(source.read_bytes()).hexdigest())
        self.assertEqual(len(manifest["records"]), 1)
        record = manifest["records"][0]
        self.assertEqual(record["raw"], berlin)
        self.assertEqual(record["sourceRecordId"], "original-id")
        incident = record["incident"]
        self.assertEqual(incident["longitude"], 13.463568648000035)
        self.assertEqual(incident["latitude"], 52.497776871000042)
        self.assertFalse(incident["isSynthetic"])
        self.assertNotIn("occurredStart", incident)
        self.assertEqual(incident["time"]["timezone"], "Europe/Berlin")

    def test_rejects_wrong_year_instead_of_fabricating_a_2024_record(self):
        with self.assertRaises(ValueError):
            module.normalize({**self.row(), "UJAHR": "2023"})


if __name__ == "__main__":
    unittest.main()
