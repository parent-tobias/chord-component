import { LitElement, css, html } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { SVGuitarChord } from 'svguitar';

import { getInstrument, chordOnInstrument, chordToNotes } from './music-utils.js';
import { chordDataService } from './chord-data-service.js';
import { indexedDBService } from './indexed-db-service.js';
import type { InstrumentDefault } from './default-chords.js';
import type { Finger, Barre } from 'svguitar';

/**
 * Local shape of the optional @svguitar/chords-plugin module. We define this
 * ourselves rather than importing the plugin's types so consumers who skip
 * installing the plugin (optional peer dep) don't see "Cannot find module"
 * TypeScript errors from our .d.ts files.
 */
interface ChordsPlugin {
	getGuitarChord(name: string, voicing?: number): {
		fingers: Finger[];
		barres: Barre[];
		position?: number;
		title?: string;
	};
	getUkuleleChord(name: string, voicing?: number): {
		fingers: Finger[];
		barres: Barre[];
		position?: number;
		title?: string;
	};
}

/** Instruments the chords-plugin natively supports. */
const PLUGIN_INSTRUMENTS = new Set(['guitar', 'ukulele']);

/**
 * Normalize chord-name quirks that come from upstream formatters, so the
 * plugin's canonical lookup table can find them.
 *
 * chordsheetjs's HtmlDivFormatter rewrites `maj` → `ma` on display
 * (`Fmaj7` → `Fma7`, `Cmaj` → `Cma`). chordpro-renderer uses that display
 * text as the chord attribute passed down to <chord-diagram>, so by the
 * time we reach the plugin tier the "j" is already gone. The plugin only
 * accepts `maj7` / `maj` / `maj9` etc. — not `ma7` — so chords with major
 * 7ths and 9ths otherwise fall through to the unknown-chord path.
 *
 * Matches `ma` followed by a digit or end-of-string. Doesn't touch `m`
 * (minor), `min`, `madd9` (where `d` isn't a digit), or `maj{N}` that
 * already has its `j`.
 */
function normalizeChordNameForPlugin(name: string): string {
	return name.replace(/ma(\d|$)/g, 'maj$1');
}

/**
 * A web component that displays a chord diagram for various instruments.
 *
 * @element chord-diagram
 *
 * @attr {string} instrument - Instrument ID (default: 'ukulele'). See `instruments` for built-in IDs.
 * @attr {string} chord - The chord name to display (e.g., 'C', 'Am7', 'F#dim')
 *
 * @prop {Finger[]} chordFingers - Optional. Set via JS to provide finger data directly, bypassing chord lookup.
 * @prop {Barre[]} chordBarres - Optional. Set via JS to provide barre data directly, bypassing chord lookup.
 *
 * @example
 * ```html
 * <chord-diagram chord="C" instrument="ukulele"></chord-diagram>
 * <chord-diagram chord="Am7" instrument="guitar"></chord-diagram>
 * ```
 */

// @customElement('chord-diagram')
export class ChordDiagram extends LitElement {

	static styles = css`
	:host {
		display: block;
		width: 100%;
		border: 1px solid var(--chord-border, transparent);
		border-radius: 4px;
		background: var(--chord-bg, transparent);
		padding: 0.5rem;
		box-sizing: border-box;
		overflow: hidden;
		color: var(--chord-diagram-color, currentColor);
	}

	.chord {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
	}

	.chord span {
		color: var(--chord-name-color, #f8f8f8);
		font-size: 0.9rem;
		font-weight: 500;
		margin-bottom: 0.25rem;
		text-align: center;
	}

	.diagram {
		width: 100%;
		display: flex;
		justify-content: center;
		overflow: hidden;
	}

	.diagram svg {
		width: 100%;
		height: auto;
		display: block;
	}

	.error {
		color: #fc8181;
		font-size: 0.8rem;
		text-align: center;
		padding: 0.5rem;
	}
	`

	/**
	 * The instrument ID to display the chord for
	 */
	@property({
		type: String
	})
	instrument = 'ukulele';

	/**
	 * The chord name to display
	 */
	@property({
		type: String
	})
	chord = '';

	/**
	 * If true, hides the chord name label inside the diagram.
	 * Useful when the parent component provides its own label.
	 */
	@property({
		type: Boolean,
		attribute: 'hide-label'
	})
	hideLabel = false;

	/**
	 * Optional finger positions set via JS. When provided, bypasses chord name lookup.
	 */
	@property({ attribute: false })
	chordFingers?: Finger[];

	/**
	 * Optional barre positions set via JS. When provided, bypasses chord name lookup.
	 */
	@property({ attribute: false })
	chordBarres?: Barre[];

	/**
	 * Which voicing to use when the chords-plugin offers multiple for the same
	 * chord name. 0 is the first (most common) voicing. Only meaningful for
	 * instruments the plugin supports (guitar, ukulele).
	 */
	@property({ type: Number, attribute: 'voicing-index' })
	voicingIndex = 0;

	@query('.diagram')
	container?: HTMLElement;

	@state()
	private chordData: Record<string, InstrumentDefault> = {};

	/**
	 * User-saved chord override for the current chord+instrument, loaded via
	 * indexedDBService. When present, takes priority over the plugin and
	 * system defaults (host-set chordFingers still wins over this).
	 */
	@state()
	private userChord: InstrumentDefault | null = null;

	/**
	 * Lazily-loaded chords-plugin module. Null when the optional peer dep
	 * isn't installed — in that case the plugin tier is simply skipped.
	 */
	@state()
	private plugin: ChordsPlugin | null = null;

	@state()
	private isLoading = false;

	@state()
	private loadError: string | null = null;

	async connectedCallback() {
		super.connectedCallback();
		await this.loadPlugin();
		await Promise.all([this.loadUserChord(), this.loadChordData()]);
	}

	async updated(changedProperties: Map<string, any>) {
		super.updated(changedProperties);

		// Reload per changed property.
		// - instrument change: both user chord and system data need refresh
		// - chord change: only user chord lookup is per-chord
		if (changedProperties.has('instrument')) {
			await Promise.all([this.loadUserChord(), this.loadChordData()]);
		} else if (changedProperties.has('chord')) {
			await this.loadUserChord();
		}
	}

	private async loadChordData() {
		this.isLoading = true;
		this.loadError = null;

		try {
			const result = await chordDataService.getChordData(this.instrument);
			this.chordData = result.data;
		} catch (error) {
			console.error('Failed to load chord data:', error);
			this.loadError = 'Failed to load chord data';
			this.chordData = {};
		} finally {
			this.isLoading = false;
		}
	}

	/**
	 * Fetch the user-saved override (if any) for the current chord+instrument.
	 * Sets this.userChord to null when the user hasn't customized this chord.
	 */
	private async loadUserChord() {
		if (!this.chord || !this.instrument) {
			this.userChord = null;
			return;
		}
		try {
			const saved = await indexedDBService.getUserChord(this.instrument, this.chord);
			this.userChord = saved
				? { fingers: saved.fingers, barres: saved.barres, position: saved.position }
				: null;
		} catch (error) {
			console.warn('[chord-diagram] Failed to load user chord:', error);
			this.userChord = null;
		}
	}

	/**
	 * Attempt to load the optional @svguitar/chords-plugin. Silently sets
	 * plugin to null if the peer dep isn't installed — consumers who don't
	 * use guitar/ukulele don't need to pay the install cost.
	 */
	private async loadPlugin() {
		if (this.plugin) return;
		try {
			// Dynamic import so the plugin is treated as an optional peer dep:
			// bundlers (vite, rollup, webpack) that see this call will route it
			// to the plugin's installed location, but if the plugin isn't
			// installed at runtime the promise rejects and we fall through to
			// null. See CHANGELOG for 3.0.0-alpha.1 — previously used
			// /* @vite-ignore */ which inadvertently broke bundler resolution.
			this.plugin = (await import('@svguitar/chords-plugin')) as unknown as ChordsPlugin;
		} catch {
			this.plugin = null;
		}
	}

	render() {
		if (this.isLoading) {
			return html`
				<div class='chord'>
					<div style="color: #90cdf4; font-size: 0.8rem; text-align: center; padding: 0.5rem;">
						Loading...
					</div>
				</div>
			`;
		}

		if (this.loadError) {
			return html`
				<div class='chord'>
					<div class='error'>${this.loadError}</div>
				</div>
			`;
		}

		const instrumentObject = getInstrument(this.instrument);

		if (!instrumentObject) {
			return html`
				<div class='chord'>
					<span>${this.chord.replace(/(maj)$/, '')}</span>
					<div class='error'>Unknown instrument: ${this.instrument}</div>
				</div>
			`;
		}

		// --- Chord resolution tiers (highest-priority first) ---

		// A. Host-provided chordFingers prop — explicit override, skip everything else.
		if (this.chordFingers) {
			return this.renderChart(instrumentObject, {
				fingers: this.chordFingers,
				barres: this.chordBarres ?? []
			});
		}

		if (!this.chord) {
			return html`
				<div class='chord'>
					<div class='error'>No chord specified</div>
				</div>
			`;
		}

		// B. User-saved override (from indexedDBService). A performer who
		//    customized this chord's fingering through chord-editor wins over
		//    both the plugin and system defaults.
		if (this.userChord) {
			return this.renderChart(instrumentObject, this.userChord);
		}

		// C. @svguitar/chords-plugin — for guitar + standard ukulele only.
		//    The plugin ships ~9k guitar and ~7k ukulele chords; falling
		//    through here when the chord name is unknown lets system defaults
		//    and dynamic generation take over for exotic chords.
		if (this.plugin && PLUGIN_INSTRUMENTS.has(this.instrument)) {
			const pluginChordName = normalizeChordNameForPlugin(this.chord);
			try {
				const chord = this.instrument === 'guitar'
					? this.plugin.getGuitarChord(pluginChordName, this.voicingIndex)
					: this.plugin.getUkuleleChord(pluginChordName, this.voicingIndex);
				// The plugin returns position-relative fingers for barre /
				// high-fret chords. Pass position through so renderChart lays
				// them out at the right place on the fretboard.
				return this.renderChart(instrumentObject, {
					fingers: chord.fingers,
					barres: chord.barres ?? [],
					position: chord.position
				});
			} catch {
				// Unknown chord name or voicing out of range — fall through.
			}
		}

		// Parse the chord name to notes for the system-defaults / dynamic tiers.
		const chordObject = chordToNotes(this.chord);
		if (!chordObject || !chordObject.notes || chordObject.notes.length === 0) {
			return html`
				<div class='chord'>
					<span>${this.chord.replace(/(maj)$/, '')}</span>
					<div class='error'>Unknown chord: ${this.chord}</div>
				</div>
			`;
		}

		// D. systemDefaultChords (loaded via chordDataService) — hand-curated
		//    fingerings, still authoritative for instruments the plugin doesn't
		//    cover (baritone-ukulele, ukulele-5ths, guitar-drop-d, mandolin,
		//    custom instruments).
		if (this.chordData[this.chord]) {
			return this.renderChart(instrumentObject, this.chordData[this.chord]);
		}

		// E. Dynamic generation — compute fingerings on the fly from the
		//    chord's notes and the instrument's tuning. Last resort.
		const chordFinder = chordOnInstrument(instrumentObject);
		return this.renderChart(instrumentObject, {
			barres: [],
			fingers: chordFinder(chordObject) || []
		});
	}

	private renderChart(
		instrumentObject: import('./music-utils.js').MuInstrument,
		chartSettings: { fingers: Finger[]; barres: Barre[]; position?: number }
	) {
		// Pull just the numeric frets out of the fingers. 'x' (muted) and 'o'
		// (open) markers are strings, not numbers — they must not contaminate
		// the min/max calculation (an unfiltered 'x' → Infinity → broken fret
		// count that would throw inside SVGuitar).
		const numericFrets: number[] = chartSettings.fingers
			.map(([, fret]) => fret)
			.filter((f): f is number => typeof f === 'number');
		const barreFrets = chartSettings.barres.map((b: any) => typeof b.fret === 'number' ? b.fret : 0);
		const allChordFrets = [...numericFrets, ...barreFrets];

		const positiveFrets = allChordFrets.filter(f => f > 0);
		const minChordFret = positiveFrets.length > 0 ? Math.min(...positiveFrets) : 1;
		const maxChordFret = allChordFrets.length > 0 ? Math.max(...allChordFrets, 0) : 4;

		// Position + fret count depend on whether the chord source gave us an
		// explicit position:
		//
		//   - plugin / curated chords with `position` set: fingers are *relative*
		//     to that position (SVGuitar convention), so fretCount is just the
		//     max relative fret.
		//
		//   - chords without `position`: fingers are *absolute*. Auto-infer the
		//     starting position from the lowest fret and compute the span.
		let position: number;
		let fretCount: number;

		if (chartSettings.position && chartSettings.position > 1) {
			position = chartSettings.position;
			fretCount = Math.max(maxChordFret, 4);
		} else if (maxChordFret > 4) {
			// High-fret chord with no explicit position — infer and span
			position = Math.max(1, minChordFret);
			fretCount = Math.max(maxChordFret - position + 1, 4);
		} else {
			// Low chord — show from fret 1
			position = 1;
			fretCount = Math.max(maxChordFret, 4);
		}
		const displayPosition = position;

		// Create a container div for SVGuitar
		const divEl = document.createElement("div");
		const label = (!this.hideLabel && this.chord) ? this.chord.replace(/(maj)$/, '') : '';

		try {
			const chart = new SVGuitarChord(divEl);
			chart
				.configure({
					strings: instrumentObject.strings.length,
					frets: fretCount,
					position: displayPosition,
					tuning: [...instrumentObject.strings],
					color: 'currentColor',
					fingerTextColor: '#ffffff',
				})
				.chord({
					fingers: chartSettings.fingers,
					barres: chartSettings.barres
				})
				.draw();

			// Firefox treats SVGs with only a viewBox (no height attr) as replaced
			// elements and falls back to 150px. Explicit aspect-ratio fixes this.
			const svg = divEl.querySelector('svg');
			if (svg) {
				const vb = svg.getAttribute('viewBox')?.split(/\s+/).map(Number) ?? [];
				if (vb.length === 4 && vb[2] > 0 && vb[3] > 0) {
					svg.style.aspectRatio = `${vb[2]} / ${vb[3]}`;
				}
			}

			return html`
				<div class='chord'>
					${label ? html`<span>${label}</span>` : ''}
					<div class='diagram'>${divEl.firstChild}</div>
				</div>
			`;
		} catch (error) {
			console.error('Error generating chord diagram:', error);
			return html`
				<div class='chord'>
					${label ? html`<span>${label}</span>` : ''}
					<div class='error'>Error generating diagram</div>
				</div>
			`;
		}
	}
}

if(!customElements.get('chord-diagram')) {
	customElements.define('chord-diagram', ChordDiagram);
}