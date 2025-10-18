# Chord Editor Component

A powerful interactive web component that allows users to visually edit and customize chord diagrams for any supported instrument.

## Features

- **Visual Editing**: Click on the chord diagram to add, edit, or remove finger positions
- **Multiple Edit Modes**:
  - Add/Edit mode: Click to place or update finger positions
  - Remove mode: Click to remove finger positions
- **User Overrides**: Save custom chord fingerings that override system defaults
- **Persistent Storage**: All custom chords are saved to IndexedDB and persist across sessions
- **Real-time Preview**: See changes instantly as you edit
- **Reset to Default**: Easily revert to system default fingerings
- **Event System**: Listen for `chord-saved` and `chord-reset` events

## Basic Usage

```html
<!-- Add the chord editor to your page -->
<chord-editor chord="C" instrument="Standard Ukulele"></chord-editor>
```

## Attributes

- **`chord`** (string, required): The chord name to edit (e.g., 'C', 'Am7', 'F#dim')
- **`instrument`** (string, default: 'Standard Ukulele'): The instrument for the chord

## Events

The component dispatches two custom events:

### `chord-saved`
Fired when the user saves a custom chord fingering.

```javascript
editor.addEventListener('chord-saved', (e) => {
  console.log('Chord saved:', e.detail);
  // {
  //   instrument: 'Standard Ukulele',
  //   chord: 'C',
  //   data: { fingers: [...], barres: [...] }
  // }
});
```

### `chord-reset`
Fired when the user resets to the default fingering.

```javascript
editor.addEventListener('chord-reset', (e) => {
  console.log('Chord reset:', e.detail);
  // {
  //   instrument: 'Standard Ukulele',
  //   chord: 'C'
  // }
});
```

## How to Use

1. **Select a chord**: Set the `chord` and `instrument` attributes
2. **Edit finger positions**:
   - Switch to "Add/Edit" mode (default)
   - Click on the diagram to place or update a finger position
   - The format is: String number (1-4 for ukulele, 1-6 for guitar) and Fret number (0-20)
3. **Remove finger positions**:
   - Switch to "Remove" mode
   - Click on a finger position in the diagram, or use the list below
4. **Save your changes**: Click "Save Custom Chord" to persist your changes
5. **Reset if needed**: Click "Reset to Default" to revert to system default

## Advanced Usage

### Managing User Chords Programmatically

```javascript
import { chordDataService } from 'chord-components';

// Get all user-defined chords
const allUserChords = await chordDataService.getAllUserChords();
console.log(allUserChords);
// [
//   { instrument: 'Standard Ukulele', chordName: 'C', data: { fingers: [...], barres: [...] } },
//   ...
// ]

// Get user chords for a specific instrument
const ukeChords = await chordDataService.getUserChordsByInstrument('Standard Ukulele');

// Save a custom chord programmatically
await chordDataService.saveUserChord('Standard Ukulele', 'Cmaj7', {
  fingers: [[4, 0], [3, 0], [2, 0], [1, 2]],
  barres: []
});

// Delete a custom chord (revert to default)
await chordDataService.deleteUserChord('Standard Ukulele', 'C');

// Clear all user chords
await chordDataService.clearUserChords();
```

### Getting Chord Data

When retrieving chord data, you can specify whether to prefer user overrides:

```javascript
import { chordDataService } from 'chord-components';

// Get chord with user override (if exists)
const chord = await chordDataService.getChord('Standard Ukulele', 'C', true);

// Get only the system default (ignore user override)
const defaultChord = await chordDataService.getChord('Standard Ukulele', 'C', false);
```

## Data Structure

Chord fingering data follows this structure:

```typescript
interface ChordData {
  fingers: Array<[stringNumber: number, fretNumber: number]>;
  barres: Array<{
    fromString: number;
    toString: number;
    fret: number;
    text?: string;
  }>;
}
```

Example:
```javascript
{
  fingers: [
    [4, 0],  // String 4, Fret 0 (open)
    [3, 0],  // String 3, Fret 0 (open)
    [2, 0],  // String 2, Fret 0 (open)
    [1, 3]   // String 1, Fret 3
  ],
  barres: [] // No barre chords in this example
}
```

## User Override System

The chord editor uses a two-tier system:

1. **System Defaults**: Built-in chord fingerings from `default-chords.ts`
2. **User Overrides**: Custom fingerings saved by users in IndexedDB

When displaying a chord:
- First checks for a user override in IndexedDB
- If not found, falls back to system default
- If no system default exists, generates one from music theory

This allows users to customize any chord while keeping defaults intact.

## Demo Page

Check out the interactive demo at `demo/editor.html` which includes:
- Live chord editor
- Chord selection controls
- List of all saved custom chords
- Load and delete functionality
- Example usage code

## Styling

The component comes with built-in styles matching the dark theme of the chord components library. The component uses Shadow DOM, so styles are encapsulated.

## Browser Support

- Requires a browser that supports:
  - Web Components (Custom Elements v1)
  - IndexedDB
  - ES6 Modules
- Tested in modern Chrome, Firefox, Safari, and Edge

## Future Enhancements

Planned features for future versions:
- **Barre Chord Editor**: Visual interface for creating barre chords
- **Undo/Redo**: Step back through editing history
- **Copy/Paste**: Duplicate fingerings between chords
- **Import/Export**: Share custom chord sets as JSON
- **Finger Numbers**: Assign finger numbers (1-4) to positions
- **Alternative Fingerings**: Store multiple variations per chord

## Notes

- Clicking on the diagram to add finger positions is a simplified interaction model. The exact mapping of click coordinates to string/fret positions may need adjustment based on SVGuitar's rendering
- For production use, consider adding more sophisticated click detection based on the actual SVG element positions
- The component automatically handles instrument changes and chord updates
