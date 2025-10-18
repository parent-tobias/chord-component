# Chord Data Service

The Chord Components library now uses a smart data caching system with IndexedDB to improve performance and support future remote API integration.

## How It Works

The data service implements a three-tier fallback system:

1. **IndexedDB Cache** (fastest) - Checks local browser database first
2. **Remote API** (configurable) - Fetches from your API endpoint if configured
3. **Local Defaults** (fallback) - Uses bundled chord data from `default-chords.ts`

On first load, the service:
- Checks IndexedDB for cached chord data
- If not found, loads from local defaults (or API if configured)
- Caches the data in IndexedDB for future use
- Subsequent loads are instant from IndexedDB

## Current Usage (Default)

By default, the components work exactly as before, but with automatic caching:

```html
<chord-diagram chord="C" instrument="Standard Ukulele"></chord-diagram>
<chord-list instrument="Standard Guitar" chords='["C", "D", "E", "G"]'></chord-list>
```

## Configuring Remote API (Future)

When you're ready to use a remote API endpoint, configure the service:

```javascript
import { chordDataService } from 'chord-components';

// Configure the API endpoint
chordDataService.configureAPI('https://api.example.com/chords');

// Now all chord requests will try the API first, then fall back to local data
```

### Expected API Response Format

Your API endpoint should accept a query parameter `instrument` and return JSON in this format:

```json
{
  "chords": {
    "C": {
      "barres": [],
      "fingers": [[4,0], [3,0], [2,0], [1,3]]
    },
    "Cm": {
      "barres": [],
      "fingers": [[3,3], [2,3], [1,3]]
    }
    // ... more chords
  }
}
```

Or simplified format (just the chord data object):

```json
{
  "C": {
    "barres": [],
    "fingers": [[4,0], [3,0], [2,0], [1,3]]
  },
  "Cm": {
    "barres": [],
    "fingers": [[3,3], [2,3], [1,3]]
  }
}
```

### API URL Format

The service will make requests like:
```
GET https://api.example.com/chords?instrument=Standard%20Ukulele
GET https://api.example.com/chords?instrument=Standard%20Guitar
```

## Advanced Usage

### Clear Cache

If you need to clear the cached data:

```javascript
import { chordDataService } from 'chord-components';

// Clear all cached chord data
await chordDataService.clearCache();
```

### Force Refresh

Force a refresh from the source (API or local):

```javascript
import { chordDataService } from 'chord-components';

// Force refresh data for a specific instrument
const result = await chordDataService.refreshData('Standard Ukulele');
console.log('Data source:', result.source.type); // 'api', 'local', or 'indexeddb'
```

### Check Available Instruments

```javascript
import { chordDataService } from 'chord-components';

const instruments = chordDataService.getAvailableInstruments();
console.log(instruments);
// ['Standard Ukulele', 'Baritone Ukulele', 'Standard Guitar', ...]
```

### Get Specific Chord Data

```javascript
import { chordDataService } from 'chord-components';

// Get data for a specific chord
const chord = await chordDataService.getChord('Standard Ukulele', 'C');
console.log(chord);
// { barres: [], fingers: [[4,0], [3,0], [2,0], [1,3]] }

// Check if a chord exists
const exists = await chordDataService.hasChord('Standard Guitar', 'F#m');
console.log(exists); // true or false
```

### Disable API

To switch back to local-only mode:

```javascript
import { chordDataService } from 'chord-components';

chordDataService.disableAPI();
```

## Benefits

1. **Performance**: First load caches data, subsequent loads are instant
2. **Offline Support**: Works offline after first load
3. **Scalability**: Easy to migrate to remote API without changing component code
4. **Flexibility**: Can switch between local and API sources dynamically
5. **Backward Compatible**: Works exactly like before if you don't configure API

## Architecture

```
┌─────────────────┐
│  Component      │
│  (chord-diagram)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ ChordDataService│
└────────┬────────┘
         │
    ┌────┴──────────┬──────────────┐
    ▼               ▼              ▼
┌─────────┐   ┌─────────┐   ┌──────────┐
│IndexedDB│   │ API     │   │Local     │
│(cache)  │   │(future) │   │Defaults  │
└─────────┘   └─────────┘   └──────────┘
```

## Migration Path

1. **Now**: Use local defaults with IndexedDB caching (current implementation)
2. **Next**: Set up your API endpoint
3. **Configure**: Call `chordDataService.configureAPI(endpoint)`
4. **Done**: Components automatically use API with cache fallback

No component code changes needed!
