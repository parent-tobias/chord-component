# View Position (Display Window)

Position is now **purely a display setting** - it's the "window" you're looking through to see the chord, not part of the chord data itself.

## Key Concept

**The chord data (fingers and barres) uses absolute fret numbers. Position only controls what frets are visible.**

### Example

You have a chord with:
- Barre at fret 3
- Finger at fret 4
- Finger at fret 5

**View Position 1** (shows frets 1-4):
```
┌─────┐
│ 1   │
│ 2   │
│ 3 ═ │ ← Barre visible
│ 4 • │ ← Finger visible
└─────┘
      ↑ Fret 5 finger is off-screen below
```

**View Position 3** (shows frets 3-6):
```
┌─────┐  "3fr" marker
│ 3 ═ │ ← Barre at top
│ 4 • │ ← Finger
│ 5 • │ ← Finger
│ 6   │
└─────┘
```

**View Position 5** (shows frets 5-8):
```
┌─────┐  "5fr" marker
│ 5 • │ ← Only this finger visible
│ 6   │
│ 7   │
│ 8   │
└─────┘
      ↑ Barre and fret 4 finger are off-screen above
```

**The chord itself never changes - only what part of the neck you're viewing.**

## How It Works

### Automatic Position Calculation

When you load or create a chord, the view position is automatically calculated to optimally show the chord:

- **All frets ≤ 4**: Position = 1 (standard view)
- **Any fret > 4**: Position = lowest fret in the chord

This ensures the chord is immediately visible in the optimal window.

### Manual View Adjustment

Use the view controls to adjust what you see:

- **← View Lower**: Shift the window down the neck (show lower frets)
- **View Higher →**: Shift the window up the neck (show higher frets)
- **Auto Position**: Reset to the automatically calculated optimal view

### Example Scenario

You create your C chord:
```
Barre: Fret 3
Finger: String 3, Fret 4
Finger: String 4, Fret 5
```

1. **Auto-calculated view position**: 3 (lowest fret in chord)
2. Diagram shows frets 3-6 with "3fr" marker
3. All fingers visible in optimal window

Now you click "← View Lower":
- View position becomes 2
- Diagram shows frets 2-5
- Chord still at frets 3, 4, 5 (unchanged!)
- Chord appears lower in the window

Click "View Higher →" twice:
- View position becomes 4
- Diagram shows frets 4-7
- Chord still at frets 3, 4, 5 (unchanged!)
- Only fingers at frets 4-5 are visible; barre at fret 3 is above the window

Click "Auto Position":
- View position resets to 3 (calculated from chord data)
- Chord fully visible again

## What Gets Saved vs What Doesn't

### Saved with Chord (Permanent)
✅ Finger positions (absolute fret numbers)
✅ Barre positions (absolute fret numbers)
✅ String numbers

### NOT Saved (Transient View State)
❌ View position (display window)
❌ Position is recalculated each time based on chord data

## Benefits of This Approach

1. **Chord data is pure**: Only the actual fingering is stored
2. **Optimal viewing**: Position auto-calculates to best show the chord
3. **Flexibility**: Adjust view anytime without changing the chord
4. **Consistency**: Same chord always has same fingering, regardless of view
5. **Simplicity**: No need to think about "position" when defining chords

## User Workflow

### Creating a Chord at Fret 3

1. Start with view position 1 (default)
2. Click "View Higher →" twice (view position = 3)
3. Now you can see frets 3-6
4. Click "+ Add Barre", set fret to 3
5. Add fingers at frets 4 and 5
6. Save

**What's stored**: Barre fret 3, fingers frets 4 & 5
**What's NOT stored**: View position 3

When you load this chord later:
- Fingers and barres load at frets 3, 4, 5
- View position auto-calculates to 3 (optimal)
- Chord appears exactly as you left it

### Editing Existing Chord

1. Load the chord
2. View auto-positions optimally
3. Adjust view if needed to see better
4. Edit finger/barre fret numbers
5. Save

View adjustments are temporary - only finger/barre changes are saved.

## "Move with View" Feature Removed

The previous "Move chord with position changes" checkbox has been removed. Why?

- It was confusing (what's "position"?)
- Conflated view and data
- Made it unclear what gets saved

The new model is simpler:
- **Chord data = absolute fret numbers** (what you save)
- **View position = which frets to display** (how you view it)

## UI Changes

### Old (Confusing)
```
Starting Fret Position (3)
☑ Move chord with position changes
[← Move Down] [Move Up →] [Reset to 1]
```

### New (Clear)
```
View Position (Display Window: Fret 3)
Adjust which frets are shown. The chord itself stays the same.
[← View Lower] [View Higher →] [Auto Position]
```

The new labels make it clear:
- This is about **viewing**, not editing
- The chord **stays the same**
- You're just changing the **window**

## Technical Details

### Auto-Calculation Logic

```javascript
// Get all frets from chord
const allFrets = [...fingers, ...barres].map(f => f.fret);

// Find min and max
const minFret = Math.min(...allFrets.filter(f => f > 0));
const maxFret = Math.max(...allFrets);

// Calculate position
if (maxFret <= 4) {
  position = 1; // Standard view
} else {
  position = Math.max(1, minFret); // Start from lowest fret
}
```

### View Position Changes

When you adjust view position:
```javascript
// View position changes
viewPosition = 3;  // Changed

// Chord data UNCHANGED
fingers = [[3, 4], [4, 5]];  // Same absolute frets
barres = [{fret: 3, ...}];   // Same absolute frets
```

## Comparison: Before vs After

### Before (Position was part of chord data)
```json
{
  "position": 3,  // Saved with chord
  "fingers": [[3, 4], [4, 5]],
  "barres": [{...}]
}
```
Problem: Changing "position" changed the chord data!

### After (Position is view-only)
```json
{
  "fingers": [[3, 4], [4, 5]],  // Only this saved
  "barres": [{...}]
}
```
View position = 3 (calculated from min fret, not saved)

## Migration

Existing chords with saved `position` fields:
- Position value is ignored when loading
- Position is recalculated from chord data
- Chord appears in optimal view automatically
- No data loss - fingers and barres unchanged

## FAQ

**Q: If I move the view up, do my fret numbers change?**
A: No. Fret numbers are absolute. View position only changes what you see.

**Q: What if I want to transpose the chord to a different position?**
A: Adjust the actual fret numbers (in the finger/barre input fields). The view will auto-adjust.

**Q: Why can't I see my chord?**
A: Click "Auto Position" to reset view to optimal. Or manually adjust view position until visible.

**Q: How do I know what frets are currently visible?**
A: The label shows "Display Window: Fret X" - this is the first fret shown. The diagram typically shows 4-5 frets.

**Q: Can I save a preferred view position?**
A: No, view position is always auto-calculated. This ensures the chord is optimally displayed.

## Summary

**Old mental model (wrong):**
> "Position 3" = chord starts at position 3 = fingers are relative to position 3

**New mental model (correct):**
> Fingers are at absolute frets 3, 4, 5 = View position 3 shows those frets = Position is just the display window

The chord is defined by absolute fret numbers. Position is just where you're looking.
