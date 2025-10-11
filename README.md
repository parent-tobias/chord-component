# @tobias-music/chord-components

Lit-based web components for displaying musical chord diagrams and chord lists across various string instruments.

## Features

- 🎸 Support for multiple instruments (Ukulele, Guitar, Mandolin)
- 🎵 Comprehensive chord library with major, minor, 7th, and extended chords
- 📱 Responsive design with container queries
- 🎨 Dark theme optimized
- ⚡ Built with Lit for fast, efficient rendering
- 🔧 TypeScript support with full type definitions

## Installation

```bash
npm install @tobias-music/chord-components
```

## Quick Start

### Import and use in HTML

```html
<!DOCTYPE html>
<html>
<head>
    <script type="module">
        import '@tobias-music/chord-components';
    </script>
</head>
<body>
    <!-- Single chord diagram -->
    <chord-diagram chord="C" instrument="Standard Ukulele"></chord-diagram>
    
    <!-- Chord list -->
    <chord-list 
        instrument="Standard Ukulele" 
        chords='["C", "F", "G", "Am"]'>
    </chord-list>
</body>
</html>
```

### Import specific components

```javascript
import '@tobias-music/chord-components/chord-diagram';
import '@tobias-music/chord-components/chord-list';
```

### Import utilities

```javascript
import { instruments, chordToNotes, systemDefaultChords } from '@tobias-music/chord-components';
```

## Components

### `<chord-diagram>`

Displays a single chord diagram with fretboard visualization.

#### Attributes

- **`chord`** (string, required): The chord name (e.g., "C", "Am7", "F#dim")
- **`instrument`** (string, optional): The instrument type (default: "Standard Ukulele")

#### Examples

```html
<!-- Basic usage -->
<chord-diagram chord="C"></chord-diagram>

<!-- Guitar chord -->
<chord-diagram chord="Em" instrument="Standard Guitar"></chord-diagram>

<!-- Complex chord -->
<chord-diagram chord="Cmaj7" instrument="Standard Ukulele"></chord-diagram>
```

### `<chord-list>`

Displays multiple chord diagrams in a responsive grid layout.

#### Attributes

- **`instrument`** (string, optional): The instrument type (default: "Standard Ukulele")
- **`chords`** (string|array, required): JSON string or array of chord names

#### Examples

```html
<!-- Array of chords -->
<chord-list 
    instrument="Standard Ukulele" 
    chords='["C", "F", "G", "Am"]'>
</chord-list>

<!-- More complex chord progression -->
<chord-list 
    instrument="Standard Guitar" 
    chords='["Cmaj7", "Dm7", "G7", "Em7", "Am7"]'>
</chord-list>
```

## Supported Instruments

- **Standard Ukulele** (G-C-E-A tuning)
- **Baritone Ukulele** (D-G-B-E tuning)
- **5ths tuned Ukulele** (C-G-D-A tuning)
- **Standard Guitar** (E-A-D-G-B-E tuning)
- **Drop-D Guitar** (D-A-D-G-B-E tuning)
- **Standard Mandolin** (G-D-A-E tuning)

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

## Development

### Setup

```bash
git clone <repository-url>
cd chord-components
npm install
```

### Development Server

```bash
npm run dev
```

This starts a development server with the demo page at `http://localhost:5173/demo/`

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## Customization

### Custom Chord Definitions

You can extend the chord library by importing and modifying the default chords:

```javascript
import { systemDefaultChords } from '@tobias-music/chord-components';

// Add custom chord definition
systemDefaultChords["Standard Ukulele"]["Csus2"] = {
    barres: [],
    fingers: [[4, 0], [3, 2], [2, 3], [1, 0]]
};
```

### Styling

The components use CSS custom properties for theming. You can override the default dark theme:

```css
chord-diagram {
    --chord-bg-color: #ffffff;
    --chord-text-color: #000000;
    --chord-border-color: #cccccc;
}
```

## API Reference

### Music Utilities

The package exports several utility functions for working with music theory:

```javascript
import { 
    instruments,        // Array of supported instruments
    chordToNotes,      // Convert chord name to note array
    parseChords,       // Parse chords from ChordPro notation
    scaleTones,        // Get notes in a scale
    findBase           // Find note index in chromatic scale
} from '@tobias-music/chord-components';

// Example usage
const chordData = chordToNotes("Cmaj7");
console.log(chordData); // { name: "Cmaj7", notes: ["C", "E", "G", "B"] }
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## Support

For questions and support, please open an issue on the GitHub repository.# chord-component
