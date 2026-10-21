# Changelog

All notable changes to `@parent-tobias/chord-component` will be documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0-alpha.2] — 2026-10-20

### Fixed

- **`<chord-diagram>` crashed for any chord with muted strings.** `renderChart`'s
  fret-math mapped `'x'` muted-string markers to `Infinity`, which contaminated
  the `maxChordFret` calculation (`Math.max(..., Infinity) = Infinity`) and
  produced an invalid `fretCount` passed into SVGuitar's `.configure()`.
  SVGuitar then threw, the try/catch around `.draw()` caught it, and the
  diagram rendered as "Error generating diagram".

  Hit hardest on **guitar chords**, where muted strings are routine (C, D, Am,
  Bb, F, F#m, C#m7, D/F#, Bb7/F, Cmaj7#11 — every one of those has `'x'` entries
  in the plugin's chord data). Ukulele chords rarely mute strings, which is why
  the bug was less visible on uke.

  Fix: `renderChart` now filters non-numeric markers out of the fret list
  before computing `min`/`max`.

- **High-position chords from the plugin rendered at the wrong fretboard
  position.** The plugin returns fingers *relative to position* for barre /
  high-fret chords (e.g., `C#m7` at `position: 4` with fingers at relative
  frets 1-3). `<chord-diagram>` was ignoring the `position` field and
  treating fingers as absolute, so a C#m7 barre at the 4th fret rendered as
  a C-major-shaped chord at the 1st fret — same shape, wrong name.

  Fix: `renderChart` now accepts an optional `position`. When provided,
  fingers are treated as position-relative (SVGuitar convention); when
  absent, position is auto-inferred from absolute finger positions as before.
  The plugin tier in the resolution pipeline passes `chord.position` through.

## [3.0.0-alpha.1] — 2026-10-19

### Fixed

- **Plugin tier now actually works.** `3.0.0-alpha.0` used a `/* @vite-ignore */`
  dynamic-import pattern that was intended to let the plugin be optional at
  type-check time but inadvertently prevented bundlers (vite, rollup, webpack)
  from routing the import to the plugin's installed location. In the deployed
  demo and in consumer apps, the runtime `import('@svguitar/chords-plugin')`
  tried to resolve a bare specifier the browser couldn't handle, silently
  rejected, and the plugin tier was skipped. Non-slash chords quietly fell
  back to system defaults (looked fine); slash chords like `D/F#` hit the
  parse fallback and rendered as "Unknown chord" errors.
- Removed the `/* @vite-ignore */` comment from both the `chord-diagram`
  plugin loader and `plugin-helpers`. Local TypeScript type definitions
  (introduced in alpha.0) already keep consumers who skip the plugin install
  safe at compile time, so the vite-ignore workaround was unnecessary.

### How to tell this fix is working

- Type `D/F#` into the demo's chord input — you should see a chord diagram
  (not "Unknown chord"), and the voicing cycler should show `1 / 18`.
- The chord-diagram bundle in `docs/assets/` should contain many thousands of
  chord-data entries (previously only a handful, confirming the plugin wasn't
  being bundled).

## [3.0.0-alpha.0] — 2026-08-18

**Alpha release.** Builds on the brand-new `@svguitar/chords-plugin` (0.0.4), which is itself
alpha software. Published under the `alpha` npm dist-tag — install explicitly with
`npm install @parent-tobias/chord-component@alpha` to opt in. Default `latest` installs still
resolve to 2.1.3.

### Added

- **`@svguitar/chords-plugin` as a tier in `<chord-diagram>`'s chord resolution.** For guitar
  and standard ukulele (not baritone, 5ths, or other tunings), the plugin's ~9,000-chord
  database (~72,000 voicings for guitar) now backs chord lookup. Chords unknown to the plugin
  gracefully fall through to the existing system defaults and dynamic generation tiers.
- **New `voicing-index` attribute on `<chord-diagram>`.** When the plugin offers multiple
  voicings for a chord name, pick which one by index (0-based). Defaults to `0` (first voicing).
  Only meaningful for plugin-supported instruments.
- **New library-level re-exports: `searchChords`, `chordNames`, `chordVoicings`.** Consumers
  can now add chord-name autocomplete or chord-library enumeration without taking a direct
  dependency on `@svguitar/chords-plugin`. All three are async and return safe empty results
  when the plugin isn't installed.
- **User-saved chord overrides now actually render.** `<chord-diagram>` previously loaded
  system defaults from `chordDataService` but didn't consult `indexedDBService.getUserChord()`;
  this release fixes that regression. Chords customized through `<chord-editor>` now take
  priority over plugin and system defaults in rendering.

### Changed

- **Chord resolution order** (highest priority first):
  1. Host-provided `chordFingers` prop
  2. User-saved override from `indexedDBService` ← **new behavior; see note above**
  3. `@svguitar/chords-plugin` lookup (guitar/ukulele only) ← **new tier**
  4. `systemDefaultChords` via `chordDataService` (unchanged)
  5. Dynamic generation via `chordOnInstrument` + `chordToNotes` (unchanged)

### Breaking changes

- **Visible voicings may change for guitar and ukulele chords.** A `<chord-diagram chord="C"
  instrument="guitar">` will now source the fingering from the plugin's database when
  available, rather than from `systemDefaultChords`. The chord *name* is unchanged; the
  *fingering shown* may differ. Users who want the old voicings back can either save them as
  user overrides via `<chord-editor>` or set them explicitly via the `chordFingers` property.
- **New optional peer dependency** on `@svguitar/chords-plugin` at exact version `0.0.4`.
  Consumers who use only non-plugin instruments (baritone ukulele, mandolin, custom) can skip
  installing it — the plugin tier is silently skipped when the module isn't present.

### Installation

```bash
# Default install still gets stable 2.1.3
npm install @parent-tobias/chord-component

# Opt into the alpha
npm install @parent-tobias/chord-component@alpha

# For plugin features on guitar/ukulele, also install the peer dep
npm install @svguitar/chords-plugin@0.0.4
```

### Why alpha

`@svguitar/chords-plugin` is at `0.0.4` — the plugin's API shape may still shift before it
reaches `1.0`. This chord-component release pins the plugin at an exact version rather than a
range for that reason. When the plugin stabilizes, chord-component will graduate from alpha to
a stable `3.0.0` release.

## [2.1.3] — 2026-08-17

### Fixed

- **Build now emits `.d.ts` declaration files.** Previous 2.1.x publishes shipped only `.js`
  files despite declaring `"types": "./dist/index.d.ts"` in `package.json`. TypeScript consumers
  were getting implicit-any errors. Added `vite-plugin-dts` to the build pipeline; per-file
  declarations are now generated alongside the per-file JS output.
- **Recovered 2.1.x source into git.** 2.1.0–2.1.2 were published to npm without corresponding
  git commits. The chord-diagram.ts changes (CSS variable theming, `hideLabel` prop, Firefox
  SVG `aspect-ratio` fix) have been restored from the npm-shipped `src/` so the git history
  now matches the published code.

## [2.0.0] and earlier

See [git history](https://github.com/parent-tobias/chord-component/commits/main) for pre-2.1.3
releases. v2.0.0 introduced instrument IDs (replacing display-name lookups), `registerInstrument`,
and the `chord-changed` event.
