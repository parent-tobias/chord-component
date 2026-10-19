/**
 * Lazy wrappers around @svguitar/chords-plugin's data helpers.
 *
 * The plugin is an optional peer dependency. When it's installed, these
 * helpers forward to its real implementations; when it isn't, they return
 * safe empty results so consumer code doesn't need to feature-detect.
 *
 * We DO NOT import the plugin's TypeScript types directly — doing so would
 * cause "Cannot find module" errors for consumers who skip installing the
 * plugin. The shapes are declared locally and runtime calls are cast.
 */

/** The two instruments the plugin currently supports. */
export type PluginInstrument = 'guitar' | 'ukulele';

interface ChordsPluginData {
	searchChords(prefix: string, instrument: PluginInstrument, limit: number): string[];
	chordNames(instrument: PluginInstrument): string[];
	chordVoicings(chord: string, instrument: PluginInstrument): number;
}

let pluginPromise: Promise<ChordsPluginData | null> | null = null;

function loadPlugin(): Promise<ChordsPluginData | null> {
	if (!pluginPromise) {
		// Dynamic string import so TypeScript doesn't try to resolve the
		// optional peer dep at type-check time.
		const specifier = '@svguitar/chords-plugin';
		pluginPromise = import(/* @vite-ignore */ specifier)
			.then((mod) => mod as ChordsPluginData)
			.catch(() => null);
	}
	return pluginPromise;
}

/**
 * Suggest chord names that start with the given prefix. Returns up to `limit`
 * matches (default 10). The instrument argument accepts 'guitar' or 'ukulele'
 * (only instruments the plugin covers). Returns `[]` when the plugin isn't
 * installed.
 *
 * @example
 *   await searchChords('Am', 'guitar', 4)  // ['Am', 'Am6', 'Am7', 'Am9']
 */
export async function searchChords(
	prefix: string,
	instrument: PluginInstrument = 'guitar',
	limit = 10
): Promise<string[]> {
	const plugin = await loadPlugin();
	if (!plugin) return [];
	try {
		return plugin.searchChords(prefix, instrument, limit);
	} catch {
		return [];
	}
}

/**
 * List all chord names the plugin can play on a given instrument. Returns
 * `[]` when the plugin isn't installed.
 */
export async function chordNames(
	instrument: PluginInstrument = 'guitar'
): Promise<string[]> {
	const plugin = await loadPlugin();
	if (!plugin) return [];
	try {
		return plugin.chordNames(instrument);
	} catch {
		return [];
	}
}

/**
 * How many distinct voicings the plugin has for a given chord name. Returns
 * `0` when the chord isn't recognized or the plugin isn't installed.
 */
export async function chordVoicings(
	chord: string,
	instrument: PluginInstrument = 'guitar'
): Promise<number> {
	const plugin = await loadPlugin();
	if (!plugin) return 0;
	try {
		return plugin.chordVoicings(chord, instrument);
	} catch {
		return 0;
	}
}
