# Chord Shift Mode

The chord editor now includes a "shift mode" that allows you to move the entire chord shape up or down the neck together with position changes.

## The Problem

By default, fret numbers are **absolute**:
- Barre at fret 3 = always fret 3
- Finger at fret 5 = always fret 5
- Changing position only affects the *display range*, not the chord itself

This is correct for most editing scenarios, but makes it difficult to:
1. Transpose a chord shape to a different position
2. Move a complete fingering up/down the neck
3. Create variations of the same shape at different frets

## The Solution: Shift Mode

Enable **"Move chord with position changes"** to shift all fingers and barres together when you change position.

### How It Works

**Without Shift Mode (Default)**:
- Position: 3
- Barre: Fret 3
- Fingers: Fret 4, Fret 5
- Click "Move Up →" to Position 4
- Result: Chord stays at frets 3, 4, 5 (just changes display range)

**With Shift Mode Enabled**:
- Position: 3
- Barre: Fret 3
- Fingers: Fret 4, Fret 5
- Click "Move Up →" to Position 4
- Result: **Chord moves to frets 4, 5, 6** (entire shape shifts +1)

## Use Cases

### 1. Transposing a Chord Shape

You have a nice voicing at position 3 and want the same shape at position 5:

1. Load your chord at position 3
2. ✅ **Enable "Move chord with position changes"**
3. Click "Move Up →" twice
4. Chord shifts to position 5 with the same relative shape
5. Save as a new variation

### 2. Finding the Right Position

You've built a chord but the position isn't quite right:

1. Build your chord (e.g., fingers relative to position 1)
2. ✅ **Enable shift mode**
3. Use "Move Up/Down" to slide the chord up the neck
4. Find the position that sounds best
5. Save when you're happy

### 3. Creating Movable Shapes

Create a barre chord shape that works at any position:

1. Start at position 3
2. Create the chord shape (barre + fingers)
3. ✅ **Enable shift mode**
4. Test at different positions by moving up/down
5. Save the version you like best

## Example: Your C Chord

Let's say you've created your C chord:
- Position: 3
- Barre: String 4→1, Fret 3
- Finger: String 3, Fret 4
- Finger: String 4, Fret 5

**Scenario: You want to try it at position 5**

Without shift mode:
- Move to position 5
- Chord stays at frets 3, 4, 5
- You'd need to manually edit each fret number

With shift mode:
- ✅ Enable "Move chord with position changes"
- Click "Move Up →" twice
- Chord automatically moves to:
  - Barre: Fret 5
  - Finger: Fret 6
  - Finger: Fret 7
- Save as "C (Position 5)"

## UI Controls

The checkbox appears in the "Starting Fret Position" section:

```
Starting Fret Position (3)
☑ Move chord with position changes

[← Move Down]  [Move Up →]  [Reset to 1]
```

- **Unchecked (Default)**: Position change only affects display
- **Checked**: Position change shifts all fret numbers

## Important Notes

### When Shift Mode is Active

- ALL finger positions shift by the delta
- ALL barre fret numbers shift by the delta
- Minimum fret is 0 (won't go negative)
- String numbers don't change (only frets)

### When to Use Each Mode

| Task | Use Shift Mode? |
|------|----------------|
| Adjust display range only | ❌ Off |
| Transpose entire chord | ✅ On |
| Fine-tune individual notes | ❌ Off |
| Slide shape up/down neck | ✅ On |
| Build from scratch | ❌ Off (usually) |
| Test different positions | ✅ On |

### Delta Calculation

The shift amount is the difference between old and new position:
- Position 3 → 5: +2 (all frets +2)
- Position 5 → 3: -2 (all frets -2)
- Position 7 → 1: -6 (all frets -6, min 0)

### Fret 0 Protection

If shifting would create negative frets, they become 0 (open):
- Finger at fret 2, shift -3 → becomes fret 0 (open)
- This prevents invalid fret numbers

## Workflow Examples

### Example 1: Quick Transpose

```
1. Load chord at position 3
2. ✅ Enable shift mode
3. Click "Move Up →" 2 times (position now 5)
4. All frets shifted +2
5. Save as new variation
```

### Example 2: Find Best Position

```
1. Build chord at position 1
2. ✅ Enable shift mode
3. Click "Move Up →" multiple times
4. Listen/test each position
5. ❌ Disable shift mode when happy
6. Fine-tune individual notes if needed
7. Save
```

### Example 3: Create Shape Family

```
1. Create master shape at position 3
2. Save as "C (Pos 3)"
3. ✅ Enable shift mode
4. Move to position 5, save as "C (Pos 5)"
5. Move to position 7, save as "C (Pos 7)"
6. Now you have the same shape at 3 positions!
```

## Technical Details

When shift mode is enabled and you change position:

```javascript
const delta = newPosition - oldPosition;

// Each finger
finger[1] = Math.max(0, finger[1] + delta);

// Each barre
barre.fret = Math.max(0, barre.fret + delta);
```

The position itself is updated normally, and the shift happens automatically.

## Tips

1. **Toggle freely**: You can enable/disable shift mode at any time
2. **Experiment**: Try shifting, then disable to fine-tune
3. **Undo by reversing**: If you shift too far, just shift back
4. **Save incrementally**: Save before big shifts in case you want to revert
5. **Use with "Reset to 1"**: Shift to position 1 to see the chord in root position

## Troubleshooting

**Q: My chord disappeared when I shifted down**
- Check if frets went to 0 (open strings)
- Some notes may have become open/muted
- Try shifting back up

**Q: Shift mode isn't working**
- Verify the checkbox is checked
- Make sure you're using "Move Up/Down" buttons (not "Reset to 1")
- Check that you have fingers/barres defined

**Q: I want to move only some fingers**
- Disable shift mode
- Manually edit the specific finger fret numbers
- Or use a mix: shift with mode on, then adjust individual frets

**Q: Can I shift just the barres, not the fingers?**
- Not automatically - shift mode moves everything
- Workaround: Remove fingers, shift barres, add fingers back manually

## Future Enhancements

Potential additions:
- Selective shift (choose which fingers to move)
- Shift preview before applying
- Undo/redo for shifts
- Shift history
- Relative mode (always show as relative to position)
