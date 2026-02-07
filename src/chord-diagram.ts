import { LitElement, css, html } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { SVGuitarChord } from 'svguitar';

import { getInstrument, chordOnInstrument, chordToNotes } from './music-utils.js';
import { chordDataService } from './chord-data-service.js';
import type { InstrumentDefault } from './default-chords.js';
import type { Finger, Barre } from 'svguitar';

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
		min-width: 100px;
		max-width: 150px;
		border: 1px solid #4a5568;
		border-radius: 4px;
		background: #2d3748;
		padding: 0.5rem;
		box-sizing: border-box;
	}

	.chord {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
	}

	.chord span {
		color: #f8f8f8;
		font-size: 0.9rem;
		font-weight: 500;
		margin-bottom: 0.25rem;
		text-align: center;
	}

	.diagram {
		width: 100%;
		display: flex;
		justify-content: center;
	}

	.diagram :global(svg) {
		max-width: 100%;
		height: auto;
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
	 * Optional finger positions set via JS. When provided, bypasses chord name lookup.
	 */
	@property({ attribute: false })
	chordFingers?: Finger[];

	/**
	 * Optional barre positions set via JS. When provided, bypasses chord name lookup.
	 */
	@property({ attribute: false })
	chordBarres?: Barre[];

	@query('.diagram')
	container?: HTMLElement;

	@state()
	private chordData: Record<string, InstrumentDefault> = {};

	@state()
	private isLoading = false;

	@state()
	private loadError: string | null = null;

	async connectedCallback() {
		super.connectedCallback();
		await this.loadChordData();
	}

	async updated(changedProperties: Map<string, any>) {
		super.updated(changedProperties);

		// Reload chord data if instrument changes
		if (changedProperties.has('instrument')) {
			await this.loadChordData();
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

		// If JS properties are set, use them directly (skip chord lookup entirely)
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

		const chordFinder = chordOnInstrument(instrumentObject);

		// Given the chord name (G7, Bbmin), we need the notes in the chord
		const chordObject = chordToNotes(this.chord);

		if (!chordObject || !chordObject.notes || chordObject.notes.length === 0) {
			return html`
				<div class='chord'>
					<span>${this.chord.replace(/(maj)$/, '')}</span>
					<div class='error'>Unknown chord: ${this.chord}</div>
				</div>
			`;
		}

		// Check if we have a default for this chord/instrument combination
		const chartSettings = this.chordData[this.chord] ?
			this.chordData[this.chord] :
			{
				barres: [],
				fingers: chordFinder(chordObject) || []
			};

		return this.renderChart(instrumentObject, chartSettings);
	}

	private renderChart(
		instrumentObject: import('./music-utils.js').MuInstrument,
		chartSettings: { fingers: Finger[]; barres: Barre[] }
	) {
		// Auto-calculate position based on chord data (not stored with chord)
		const arrayOfFrets: number[] = chartSettings.fingers.map(([, fret]): number =>
			typeof fret === 'number' ? fret : Infinity
		);
		const barreFrets = chartSettings.barres.map((b: any) => typeof b.fret === 'number' ? b.fret : 0);
		const allChordFrets = [...arrayOfFrets, ...barreFrets];

		const minChordFret = allChordFrets.length > 0 ? Math.min(...allChordFrets.filter(f => f > 0)) : 1;
		const maxChordFret = allChordFrets.length > 0 ? Math.max(...allChordFrets, 0) : 4;

		let position = 1;
		if (maxChordFret > 4) {
			// For high chords, start from the lowest fret
			position = Math.max(1, minChordFret);
		}

		// Determine fret range to display
		let fretCount: number;
		let displayPosition: number;

		if (position > 1 || maxChordFret > 4) {
			// High position chord - show from position
			fretCount = Math.max(maxChordFret - position + 1, 4);
			displayPosition = position;
		} else {
			// Low position chord - show from fret 1
			fretCount = Math.max(maxChordFret, 4);
			displayPosition = 1;
		}

		// Create a container div for SVGuitar
		const divEl = document.createElement("div");
		const label = this.chord ? this.chord.replace(/(maj)$/, '') : '';

		try {
			const chart = new SVGuitarChord(divEl);
			chart
				.configure({
					strings: instrumentObject.strings.length,
					frets: fretCount,
					position: displayPosition,
					tuning: [...instrumentObject.strings]
				})
				.chord({
					fingers: chartSettings.fingers,
					barres: chartSettings.barres
				})
				.draw();

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