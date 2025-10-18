# Chord Position Support

The chord components now support chords that extend beyond the "root position" (starting from the nut/first fret). This is essential for chords higher up the neck, like barre chords and alternative voicings.

## What is Position?

The **position** is the starting fret that the chord diagram displays. For example:
- `position: 1` (default) - Shows frets 1-4 (standard "open" chord position)
- `position: 3` - Shows frets 3-6 (useful for barre chords starting at the 3rd fret)
- `position: 5` - Shows frets 5-8 (higher voicings)

When position is > 1, SVGuitar automatically displays a position marker showing which fret the diagram starts from.

## Example: C Chord with Barre on 3rd Fret

Your preferred C voicing on ukulele:
- Barre on 3rd fret across all strings
- String 3, Fret 4
- String 4, Fret 5

This requires:
```javascript
{
  position: 3,  // Start diagram at 3rd fret
  barres: [{
    fromString: 4,
    toString: 1,
    fret: 3,
    text: "1"
  }],
  fingers: [
    [3, 4],  // String 3, Fret 4
    [4, 5]   // String 4, Fret 5
  ]
}
```

## Using Position in Components

### In chord-diagram

The position is automatically read from the chord data:

```html
<!-- Will display with position marker if chord data has position > 1 -->
<chord-diagram chord="C" instrument="Standard Ukulele"></chord-diagram>
```

If you save a custom C chord with `position: 3`, the diagram will automatically show frets 3+ with a position marker.

### In chord-editor

The editor now includes position controls:

1. **View current position**: Shown in the label "Starting Fret Position (3)"
2. **Move Up/Down**: Shift the position higher or lower on the neck
3. **Reset to 1**: Return to root position

```html
<chord-editor chord="C" instrument="Standard Ukulele"></chord-editor>
```

The editor workflow:
1. Load a chord (default shows position 1)
2. Use "Move Up" to shift to position 3 (or higher)
3. Click on the diagram to add finger positions (fret numbers are absolute)
4. Save your custom chord - the position is saved along with the fingering

## Data Structure

The `InstrumentDefault` type now includes an optional `position` field:

```typescript
type InstrumentDefault = {
  barres: Barre[];
  fingers: Finger[];  // [stringNumber, fretNumber]
  position?: number;  // Starting fret (default: 1)
}
```

## Automatic Position Detection

When displaying a chord, the component automatically:
1. Checks the `position` field if present
2. If position > 1 OR any finger is on fret > 4:
   - Displays from the specified position
   - Shows position marker on the diagram
3. Otherwise:
   - Displays standard 1-4 fret range
   - No position marker

## Creating High-Position Chords

### Method 1: Using the Editor

1. Open `demo/editor.html`
2. Select instrument and chord
3. Click "Move Up →" to shift to desired position (e.g., 3)
4. Click on diagram to place fingers
5. Save - position is automatically stored

### Method 2: Programmatically

```javascript
import { chordDataService } from 'chord-component';

// Save a C chord starting at position 3
await chordDataService.saveUserChord('Standard Ukulele', 'C', {
  position: 3,
  barres: [{
    fromString: 4,
    toString: 1,
    fret: 3,
    text: "1"
  }],
  fingers: [
    [3, 4],  // String 3, Fret 4
    [4, 5]   // String 4, Fret 5
  ]
});
```

### Method 3: In default-chords.ts

Add to the system defaults:

```typescript
"C": {
  position: 3,
  barres: [{
    fromString: 4,
    toString: 1,
    fret: 3,
    text: "1"
  }],
  fingers: [
    [3, 4],
    [4, 5]
  ]
}
```

## Important Notes

### Absolute Fret Numbers

Finger positions use **absolute fret numbers**, not relative to position:
- ✅ `[3, 4]` means "String 3, Fret 4" (absolute)
- ❌ NOT "String 3, 4th fret from position start"

### Position Determines Display Range

The position tells the component *where to start displaying*:
- `position: 1` + `fingers: [[1, 5]]` → Shows fret 5 (may extend beyond 4 frets)
- `position: 3` + `fingers: [[1, 5]]` → Shows frets 3-6, with finger on fret 5

### Automatic Range Calculation

The component calculates the fret range automatically:
- Looks at all finger positions
- Determines min/max frets needed
- Shows at least 4 frets
- Positions diagram optimally

## Migration

Existing chords without a `position` field default to `position: 1`, so all existing chords continue to work without changes.

## Examples

### Standard Open C (Position 1)
```javascript
{
  position: 1,  // or omit - defaults to 1
  fingers: [[4, 0], [3, 0], [2, 0], [1, 3]]
}
```

### Barre C at 3rd Fret
```javascript
{
  position: 3,
  barres: [{ fromString: 4, toString: 1, fret: 3, text: "1" }],
  fingers: [[3, 4], [4, 5]]
}
```

### High Voicing at 7th Fret
```javascript
{
  position: 7,
  fingers: [[4, 7], [3, 9], [2, 9], [1, 9]]
}
```

## Browser Storage

The position is automatically saved when you save a custom chord:
- Stored in IndexedDB's `userChords` store
- Persists across sessions
- Retrieved along with fingers and barres

## API

All chord data service methods now support position:

```javascript
// Get chord (includes position if set)
const chord = await chordDataService.getChord('Standard Ukulele', 'C');
console.log(chord.position); // 3

// Save chord with position
await chordDataService.saveUserChord('Standard Ukulele', 'C', {
  position: 3,
  fingers: [...],
  barres: [...]
});

// Get all user chords (includes position)
const userChords = await chordDataService.getAllUserChords();
```

## Troubleshooting

**Q: My chord looks cut off**
- Check if the highest fret number exceeds the display range
- Increase position to show higher frets
- The component auto-calculates, but you can manually adjust

**Q: Position marker not showing**
- Position markers only show when position > 1
- Check that `position` field is set in chord data
- Verify SVGuitar is rendering correctly

**Q: Clicking in editor adds wrong fret**
- Remember fret numbers are absolute
- If at position 3, clicking first fret = fret 3
- Use the position controls to adjust

## Benefits

1. **Full neck access**: Create chords anywhere on the fretboard
2. **Better readability**: Show only relevant frets for high-position chords
3. **Barre chord support**: Essential for barre chords that don't start at fret 1
4. **Alternative voicings**: Store multiple fingerings of the same chord
5. **Automatic handling**: Components detect and display optimally
