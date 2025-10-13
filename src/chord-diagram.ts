import { LitElement, css, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { SVGuitarChord } from 'svguitar';

import { instruments, chordOnInstrument, chordToNotes } from './music-utils.js';
import { systemDefaultChords } from './default-chords.js';

/**
 * A web component that displays a chord diagram for various instruments.
 * 
 * @element chord-diagram
 * 
 * @attr {string} instrument - The instrument to display the chord for (default: 'Standard Ukulele')
 * @attr {string} chord - The chord name to display (e.g., 'C', 'Am7', 'F#dim')
 * 
 * @example
 * ```html
 * <chord-diagram chord="C" instrument="Standard Ukulele"></chord-diagram>
 * <chord-diagram chord="Am7" instrument="Standard Guitar"></chord-diagram>
 * ```
 */
@customElement('chord-diagram')
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
	 * The instrument to display the chord for
	 */
	@property({
		type: String
	})
	instrument = 'Standard Ukulele';

	/**
	 * The chord name to display
	 */
	@property({
		type: String
	})
	chord = '';

	@query('.diagram')
	container?: HTMLElement;

	render() {
		if (!this.chord) {
			return html`
				<div class='chord'>
					<div class='error'>No chord specified</div>
				</div>
			`;
		}

		const instrumentObject = instruments.find(({name}) => name === this.instrument);
		
		if (!instrumentObject) {
			return html`
				<div class='chord'>
					<span>${this.chord.replace(/(maj)$/, '')}</span>
					<div class='error'>Unknown instrument: ${this.instrument}</div>
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

		// Check if we have a system default for this chord/instrument combination
		const chartSettings = systemDefaultChords[this.instrument] && systemDefaultChords[this.instrument][this.chord] ?
			systemDefaultChords[this.instrument][this.chord] : 
			{
				barres: [],
				fingers: chordFinder(chordObject) || []
			};

		// Calculate the number of frets needed
		const arrayOfFrets: number[] = chartSettings.fingers.map(([, fret]): number => 
			typeof fret === 'number' ? fret : Infinity
		);

		let maxFrets = Math.max(...arrayOfFrets);
		maxFrets = maxFrets >= 4 ? maxFrets : 4;

		// Create a container div for SVGuitar
		const divEl = document.createElement("div");

		try {
			const chart = new SVGuitarChord(divEl);
			chart
				.configure({
					strings: instrumentObject.strings.length,
					frets: maxFrets,
					position: 1,
					tuning: [...instrumentObject.strings]
				})
				.chord(chartSettings)
				.draw();

			return html`
				<div class='chord'>
					<span>${this.chord.replace(/(maj)$/, '')}</span>
					<div class='diagram'>${divEl.firstChild}</div>
				</div>
			`;
		} catch (error) {
			console.error('Error generating chord diagram:', error);
			return html`
				<div class='chord'>
					<span>${this.chord.replace(/(maj)$/, '')}</span>
					<div class='error'>Error generating diagram</div>
				</div>
			`;
		}
	}
}