# Project checks

After changes, run `npm run atlas:report` and `npm run atlas:check` from the repository root. Review findings, fix them, and rerun across the entire project. See `docs/atlas.md` for the pinned CLI installation.

Also run `npm run check`, `npm test`, `python3 -m unittest discover -s tests -p 'test_berlin_manifest.py'`, and `npm run build`. Atlas checks do not replace tests.
