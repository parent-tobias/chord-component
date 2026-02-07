# chord-component

Lit-based web components for displaying musical chord diagrams and chord lists across various string instruments.

## Features

- Support for multiple instruments (Ukulele, Guitar, Mandolin) plus custom instrument registration
- Comprehensive chord library with major, minor, 7th, and extended chords
- Interactive chord editor for creating custom fingerings
- Persistent storage with IndexedDB for user-defined chords
- High-position chord support with automatic position markers
- JS-only properties for passing chord data directly (no JSON-in-attributes)
- Responsive design with container queries
- Dark theme optimized
- Built with Lit for fast, efficient rendering
- TypeScript support with full type definitions

## Installation

```bash
npm install @parent-tobias/chord-component
```

## Quick Start

### Import and use in HTML

```html
<!DOCTYPE html>
<html>
<head>
    <script type="module">
        import '@parent-tobias/chord-component';
    </script>
</head>
<body>
    <!-- Single chord diagram -->
    <chord-diagram chord="C" instrument="ukulele"></chord-diagram>

    <!-- Chord list -->
    <chord-list
        instrument="ukulele"
        chords='["C", "F", "G", "Am"]'>
    </chord-list>
</body>
</html>
```

### Import specific components

```javascript
import '@parent-tobias/chord-component/chord-diagram';
import '@parent-tobias/chord-component/chord-list';
import '@parent-tobias/chord-component/chord-editor';
```

### Import utilities and services

```javascript
import {
    instruments,
    getInstrument,       // Look up instrument by ID
    registerInstrument,  // Register custom instruments
    chordToNotes,
    systemDefaultChords,
    chordDataService,
    indexedDBService
} from '@parent-tobias/chord-component';
```

## Components

### `<chord-diagram>`

Displays a single chord diagram with fretboard visualization.

#### Attributes

- **`chord`** (string): The chord name (e.g., "C", "Am7", "F#dim")
- **`instrument`** (string): Instrument ID (default: `"ukulele"`)

#### JS Properties

- **`chordFingers`** (Finger[]): Set via JS to provide finger data directly, bypassing chord name lookup.
- **`chordBarres`** (Barre[]): Set via JS to provide barre data directly, bypassing chord name lookup.

These properties are not available as HTML attributes &mdash; they are set via JavaScript only, avoiding the JSON-in-attributes anti-pattern.

#### Examples

```html
<!-- Basic usage -->
<chord-diagram chord="C"></chord-diagram>

<!-- Guitar chord -->
<chord-diagram chord="Em" instrument="guitar"></chord-diagram>

<!-- Complex chord -->
<chord-diagram chord="Cmaj7" instrument="ukulele"></chord-diagram>
```

```javascript
// Direct data via JS properties (e.g., displaying a chord variation)
const el = document.querySelector('chord-diagram');
el.chordFingers = [[1, 2], [2, 1]];
el.chordBarres = [];
```

### `<chord-list>`

Displays multiple chord diagrams in a responsive grid layout.

#### Attributes

- **`instrument`** (string): Instrument ID (default: `"ukulele"`)
- **`chords`** (string|array): JSON string or array of chord names

#### Examples

```html
<chord-list
    instrument="ukulele"
    chords='["C", "F", "G", "Am"]'>
</chord-list>

<chord-list
    instrument="guitar"
    chords='["Cmaj7", "Dm7", "G7", "Em7", "Am7"]'>
</chord-list>
```

### `<chord-editor>`

Interactive editor for creating and customizing chord diagrams. Custom chords are automatically saved to IndexedDB and persist across sessions.

#### Attributes

- **`chord`** (string): The chord name to edit
- **`instrument`** (string): Instrument ID (default: `"ukulele"`)

#### Events

- **`chord-changed`**: Fired on every edit (finger/barre add, remove, or update). Detail: `{ fingers, barres }`
- **`chord-saved`**: Fired when user saves a custom chord. Detail: `{ instrument, chord, data }`
- **`chord-reset`**: Fired when user resets to default. Detail: `{ instrument, chord }`

#### Examples

```html
<chord-editor chord="C" instrument="ukulele"></chord-editor>

<script type="module">
    const editor = document.querySelector('chord-editor');

    // Live preview on every edit
    editor.addEventListener('chord-changed', (e) => {
        console.log('Editing:', e.detail.fingers, e.detail.barres);
    });

    editor.addEventListener('chord-saved', (e) => {
        console.log('Saved:', e.detail.chord, e.detail.data);
    });
</script>
```

#### Features

- **Visual editing**: Click on diagram to add/remove finger positions
- **Text-based editing**: Edit finger and barre positions with input fields
- **Add buttons**: Quickly add new fingers or barres
- **View position control**: Adjust display window for high-position chords
- **Auto-save to IndexedDB**: Custom chords persist across sessions
- **Reset to default**: Revert to system defaults anytime

See [CHORD_EDITOR.md](./CHORD_EDITOR.md) for complete documentation.

## Built-in Instrument IDs

| ID | Name | Tuning |
|----|------|--------|
| `ukulele` | Standard Ukulele | G-C-E-A |
| `baritone-ukulele` | Baritone Ukulele | D-G-B-E |
| `ukulele-5ths` | 5ths tuned Ukulele | C-G-D-A |
| `guitar` | Standard Guitar | E-A-D-G-B-E |
| `guitar-drop-d` | Drop-D Guitar | D-A-D-G-B-E |
| `mandolin` | Standard Mandolin | G-D-A-E |

### Custom Instruments

Register custom instruments at runtime with `registerInstrument`:

```javascript
import { registerInstrument } from '@parent-tobias/chord-component';

registerInstrument('dulcimer', {
    name: 'Mountain Dulcimer',
    strings: ['D', 'A', 'D'],
    frets: 13
});
```

Then use the ID in any component:

```html
<chord-diagram chord="Gm7" instrument="dulcimer"></chord-diagram>
```

## Supported Chord Types

- **Major**: C, D, E, F, G, A, B
- **Minor**: Cm, Dm, Em, etc.
- **Dominant 7th**: C7, D7, G7, etc.
- **Major 7th**: Cmaj7, Fmaj7, etc.
- **Minor 7th**: Cm7, Am7, etc.
- **Diminished**: Cdim, F#dim, etc.
- **Augmented**: Caug, etc.
- **Suspended**: Csus2, Csus4, etc.
- **Extended**: C9, C11, C13, etc.
- **Add chords**: Cadd9, etc.

## Customization

### Using the Chord Editor (Recommended)

```html
<chord-editor chord="Csus2" instrument="ukulele"></chord-editor>
```

Custom chords are automatically saved to IndexedDB and will be used by all `<chord-diagram>` components.

### Programmatic API

```javascript
import { chordDataService } from '@parent-tobias/chord-component';

// Save a custom chord
await chordDataService.saveUserChord('ukulele', 'Csus2', {
    barres: [],
    fingers: [[4, 0], [3, 2], [2, 3], [1, 0]]
});

// Get chord data (user override if exists, otherwise system default)
const chord = await chordDataService.getChord('ukulele', 'C');

// Get all user-defined chords
const userChords = await chordDataService.getAllUserChords();

// Delete a custom chord (revert to default)
await chordDataService.deleteUserChord('ukulele', 'C');
```

### Styling

The components use Shadow DOM. You can style the host element:

```css
chord-diagram {
    --chord-bg-color: #ffffff;
    --chord-text-color: #000000;
    --chord-border-color: #cccccc;
}
```

## API Reference

### Music Utilities

```javascript
import {
    instruments,        // Array of all registered instruments
    getInstrument,     // Look up instrument by ID
    registerInstrument,// Register a custom instrument
    chordToNotes,      // Convert chord name to note array
    parseChords,       // Parse chords from ChordPro notation
    scaleTones,        // Get notes in a scale
    findBase           // Find note index in chromatic scale
} from '@parent-tobias/chord-component';

const chordData = chordToNotes("Cmaj7");
// { name: "Cmaj7", notes: ["C", "E", "G", "B"] }

const uke = getInstrument("ukulele");
// { id: "ukulele", name: "Standard Ukulele", strings: ["G","C","E","A"], frets: 19 }
```

### Data Management Services

```javascript
import { chordDataService, indexedDBService } from '@parent-tobias/chord-component';

// Chord Data Service
await chordDataService.getChordData('ukulele');
await chordDataService.saveUserChord('ukulele', 'C', data);
await chordDataService.getAllUserChords();
await chordDataService.clearCache();

// IndexedDB Service (low-level)
await indexedDBService.saveUserChord('ukulele', 'C', data);
await indexedDBService.getUserChord('ukulele', 'C');
```

See [DATA_SERVICE.md](./DATA_SERVICE.md) for complete API documentation.

## Upgrading from v1.x to v2.0

v2.0 is a **breaking change**. The main changes:

### 1. Instrument attributes use short IDs instead of display names

```html
<!-- v1.x -->
<chord-diagram chord="C" instrument="Standard Ukulele"></chord-diagram>

<!-- v2.0 -->
<chord-diagram chord="C" instrument="ukulele"></chord-diagram>
```

**ID mapping:**

| v1.x (display name) | v2.0 (ID) |
|---|---|
| `Standard Ukulele` | `ukulele` |
| `Baritone Ukulele` | `baritone-ukulele` |
| `5ths tuned Ukulele` | `ukulele-5ths` |
| `Standard Guitar` | `guitar` |
| `Drop-D Guitar` | `guitar-drop-d` |
| `Standard Mandolin` | `mandolin` |

### 2. Service calls use IDs

```javascript
// v1.x
await chordDataService.saveUserChord('Standard Ukulele', 'C', data);

// v2.0
await chordDataService.saveUserChord('ukulele', 'C', data);
```

### 3. IndexedDB data is not migrated

User-saved chords from v1.x were stored under display-name keys and will not be found by v2.0. Users will need to re-enter any custom chord fingerings.

### 4. New features (non-breaking)

- **`registerInstrument(id, config)`** &mdash; register custom instruments at runtime
- **`getInstrument(id)`** &mdash; look up instrument by ID
- **`chord-changed` event** on `<chord-editor>` &mdash; fires on every edit
- **`chordFingers` / `chordBarres` JS properties** on `<chord-diagram>` &mdash; pass chord data directly without JSON attributes

## Development

### Setup

```bash
git clone https://github.com/parent-tobias/chord-component.git
cd chord-components
npm install
```

### Development Server

```bash
npm run dev
```

Starts a dev server at `http://localhost:5173/demo/`

### Build

```bash
npm run build
```

## Documentation

- **[CHORD_EDITOR.md](./CHORD_EDITOR.md)** - Complete chord editor documentation
- **[INTERACTIVE_EDITING.md](./INTERACTIVE_EDITING.md)** - Visual and text-based editing workflows
- **[VIEW_POSITION.md](./VIEW_POSITION.md)** - Understanding the display window system
- **[DATA_SERVICE.md](./DATA_SERVICE.md)** - Data caching and API integration
- **[POSITION_SUPPORT.md](./POSITION_SUPPORT.md)** - High-position chords and neck positions

## Demo

```bash
npm run dev
```

- `http://localhost:5173/demo/` - Chord diagram and list examples
- `http://localhost:5173/demo/editor.html` - Interactive chord editor

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## Support

For questions and support, please open an issue on the [GitHub repository](https://github.com/parent-tobias/chord-component/issues).
