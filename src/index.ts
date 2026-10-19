export { ChordDiagram } from './chord-diagram.js';
export { ChordList } from './chord-list.js';
export { ChordEditor } from './chord-editor.js';
export * from './music-utils.js';
export * from './default-chords.js';
export { chordDataService } from './chord-data-service.js';
export { indexedDBService } from './indexed-db-service.js';

/**
 * Optional helpers from @svguitar/chords-plugin, re-exported for consumers
 * that want chord-name autocomplete or chord-library enumeration. These are
 * loaded lazily and silently return empty results when the optional peer
 * dep isn't installed.
 */
export { searchChords, chordNames, chordVoicings } from './plugin-helpers.js';