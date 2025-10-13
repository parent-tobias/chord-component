# Interactive Chord Editing

The chord editor now provides multiple ways to create and edit chord diagrams, giving you full control over every aspect of the fingering.

## Editing Methods

### 1. Visual Editing (Click on Diagram)
Click directly on the chord diagram to add or update finger positions:
- **Add/Edit Mode**: Click on any string/fret intersection to place a finger
- **Remove Mode**: Click on existing fingers to remove them
- Click coordinates are automatically adjusted based on the current position

### 2. Text-Based Editing (Inline Input Fields)
Each finger position and barre has editable input fields:

#### Finger Positions
Each finger row shows:
- **String**: Number input (1-4 for ukulele, 1-6 for guitar)
- **Fret**: Number input (0 for open, 1+ for fretted notes)
- **× Button**: Remove this finger position

Example:
```
String: [3]  Fret: [5]  [×]
```
Type directly into the fields - the diagram updates in real-time!

#### Barre Positions
Each barre row shows:
- **From**: Starting string number (usually the highest/lowest string)
- **To**: Ending string number (span of the barre)
- **Fret**: Which fret the barre is on
- **× Button**: Remove this barre

Example:
```
From: [4]  To: [1]  Fret: [3]  [×]
```
This creates a barre from string 4 to string 1 on the 3rd fret.

### 3. Add Buttons
Quickly add new elements:
- **"+ Add Finger Position"**: Adds a new finger at String 1, Fret 0
- **"+ Add Barre"**: Adds a new barre spanning all strings at the current position

## Complete Workflow Examples

### Example 1: Creating Your Preferred C Chord (Ukulele)

**Goal**: Barre on 3rd fret, String 3 at Fret 4, String 4 at Fret 5

**Steps**:
1. Load "C" chord for "Standard Ukulele"
2. Click "Move Up →" twice to set position to 3
3. Click "+ Add Barre" to create a barre
4. Edit the barre: From: 4, To: 1, Fret: 3
5. Click "+ Add Finger Position" twice to add two more fingers
6. Edit first new finger: String: 3, Fret: 4
7. Edit second new finger: String: 4, Fret: 5
8. Remove any unwanted default fingers using the × button
9. Click "Save Custom Chord"

**Result**: Perfect barre chord at position 3!

### Example 2: Guitar F Barre Chord

**Goal**: Classic F barre chord (barre on 1st fret + fingers on 2nd and 3rd frets)

**Steps**:
1. Load "F" chord for "Standard Guitar"
2. Position should already be 1 (default)
3. Click "+ Add Barre"
4. Edit barre: From: 6, To: 1, Fret: 1
5. Click "+ Add Finger Position" three times
6. Edit fingers:
   - String: 3, Fret: 2
   - String: 4, Fret: 3
   - String: 5, Fret: 3
7. Remove any default fingers not needed
8. Save!

### Example 3: Quick Edit from Click

**Goal**: Adjust a single finger on an existing chord

**Steps**:
1. Load the chord
2. Switch to "Remove" mode
3. Click on the finger position you want to remove
4. Switch back to "Add/Edit" mode
5. Click where you want the new finger
6. OR edit the finger position fields directly with your keyboard
7. Save changes

## Tips & Tricks

### Precision Editing
- Use the text inputs for exact control
- Much easier than clicking tiny diagram positions
- Great for chords with many fingers

### Building from Scratch
1. Click "Clear All" to start fresh
2. Set your desired position
3. Use "+ Add Finger" and "+ Add Barre" buttons
4. Fill in the exact numbers you want
5. See the diagram update in real-time

### Copying/Modifying Chords
1. Load an existing chord
2. Adjust position if needed
3. Edit individual finger/barre values
4. Add or remove elements as needed
5. Save as a new variation

### Barre Chord Creation
- Barres span multiple strings at one fret
- **From** is typically the highest string number (closest to you)
- **To** is typically 1 (thinnest string)
- For partial barres, adjust From/To accordingly
- Example: From: 4, To: 2 (only covers middle strings)

### High-Position Chords
1. Use "Move Up →" to shift position
2. Position marker appears on diagram automatically
3. Finger fret numbers are absolute (not relative to position)
4. Example: Position 5, Finger at Fret 7 = 2 frets up from position start

## Input Validation

The editor validates your input:
- **String numbers**: Must be between 1 and the number of strings on the instrument
- **Fret numbers**: Must be 0 or greater (0 = open string)
- Invalid values are ignored (diagram won't update)
- Use browser number input spinners (up/down arrows) or type directly

## Keyboard Shortcuts

When editing input fields:
- **Tab**: Move to next field
- **Shift+Tab**: Move to previous field
- **Arrow Up/Down**: Increment/decrement value (in number inputs)
- **Enter**: Moves focus (no special action)

## Real-Time Updates

All changes update the diagram instantly:
- Type in an input field → diagram updates
- Click a button → diagram updates
- Click the diagram → inputs update
- Changes are bidirectional!

## Comparison: Visual vs Text Editing

| Feature | Visual (Click) | Text (Input Fields) |
|---------|----------------|---------------------|
| Speed | Fast for simple chords | Fast for complex chords |
| Precision | Limited by click accuracy | Exact control |
| Ease of use | Intuitive | Requires knowing numbers |
| Best for | Quick adjustments | Building from scratch |
| Mistakes | Easy to misclick | Harder to make errors |

**Recommendation**: Use both methods together! Click to roughly place fingers, then fine-tune with text inputs.

## Advanced: JSON Export (Future)

Coming soon: Export your chord as JSON for sharing or importing:

```json
{
  "position": 3,
  "barres": [{
    "fromString": 4,
    "toString": 1,
    "fret": 3,
    "text": "1"
  }],
  "fingers": [
    [3, 4],
    [4, 5]
  ]
}
```

## Troubleshooting

**Q: My input changes don't show up**
- Check that values are within valid ranges
- String number must be ≤ number of strings
- Fret number must be ≥ 0

**Q: Diagram looks wrong after editing**
- Verify finger positions are at correct absolute frets
- Check that barres span the intended strings (From → To)
- Use position controls to adjust diagram range

**Q: Can't create partial barre**
- Partial barres are supported!
- Set "From" and "To" to span only the strings you want
- Example: From: 4, To: 2 (skips string 1)

**Q: How do I indicate "don't play this string"?**
- Simply don't add a finger position for that string
- The diagram will show it as muted/not played
- No special marker needed

## Best Practices

1. **Start with position**: Set fret position first, then add fingers
2. **Use text for precision**: Exact fret numbers are easier to type
3. **Verify visually**: Always check the diagram matches your intent
4. **Test before saving**: Make sure the chord is playable
5. **Document alternatives**: Save multiple voicings with descriptive names

## Accessibility

- All inputs have proper labels
- Tab navigation works throughout
- Number inputs have min/max constraints
- Buttons have descriptive text
- Keyboard and mouse both fully supported
