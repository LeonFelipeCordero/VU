# Atlas checks

Install the pinned Atlas CLI with the stable Rust toolchain and Cargo available:

```sh
npm run atlas:install
export PATH="$HOME/.cargo/bin:$PATH"
npm run atlas:report
npm run atlas:check
```

The installer builds Atlas from commit `7247134a20536f1f6bfc73293c38a38b2bb263d7`.
It installs `atlas` in Cargo's binary directory, not `node_modules`.
`npm ci` does not install Rust tools. Updating Atlas requires changing the revision in `package.json` and rerunning the installer.

`atlas.json` enforces file size, function size, parameter count, complexity, decision depth, nested loops, and circular import limits. The parameter maximum is four because SQLite's `spherical_distance` callback receives two latitude/longitude pairs. The other limits match Atlas defaults. Change-impact and instability limits remain disabled by default.

Run both Atlas commands from the repository root after changes. Review findings, fix them, and rerun the checks across the entire project. Atlas honors `.gitignore`; no extra analysis exclusions apply. These commands analyze current sources without a database, migrations, or saved index.

The `atlas` job in `.github/workflows/verify.yml` installs the same pinned revision and runs both commands on pull requests and pushes to `main`. Its binary cache follows the revision through `package.json`. A failed check fails the job. Normal type checks, tests, and builds remain required; Atlas does not replace them.
