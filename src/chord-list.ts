import { LitElement, css, html, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import './chord-diagram.js';

/**
 * A web component that displays a list of chord diagrams for a specific instrument.
 * 
 * @element chord-list
 * 
 * @attr {string} instrument - The instrument to display chords for (default: 'Standard Ukulele')
 * @attr {string|string[]} chords - JSON string or array of chord names to display
 * 
 * @example
 * ```html
 * <chord-list instrument="Standard Ukulele" chords='["C", "F", "G", "Am"]'></chord-list>
 * <chord-list instrument="Standard Guitar" chords='["E", "A", "D"]'></chord-list>
 * ```
 */
@customElement('chord-list')
export class ChordList extends LitElement {
	
	/**
	 * The instrument to display chords for
	 */
	@property({
		type: String
	})
	instrument = 'Standard Ukulele';

	/**
	 * The chord names to display - can be a JSON string or array
	 */
	@property()
	chords: string | string[] = '[]';
	
	/**
	 * Parsed chord names from the chords property
	 */
	private get parsedChords(): string[] {
		try {
			if (Array.isArray(this.chords)) {
				return this.chords;
			}
			if (typeof this.chords === 'string') {
				return JSON.parse(this.chords);
			}
			return [];
		} catch {
			return [];
		}
	}

	/**
	 * Number of chords in the list (reactive state)
	 */
	@state()
	numChords = 0;
	
	static styles = css`
	:host {
		display: block;
		width: 100%;
		height: fit-content;
		container-type: inline-size;
	}

	header {
		margin-bottom: 0.5rem;
	}

	header h3 {
		margin: 0;
		font-size: 1rem;
		color: #f8f8f8;
		font-weight: 600;
	}

	.list {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
		gap: 0.5rem;
		align-items: start;
	}

	.empty-state {
		color: #a0aec0;
		font-size: 0.9rem;
		text-align: center;
		padding: 1rem;
		font-style: italic;
	}

	/* Responsive adjustments for different container widths */
	@container (max-width: 400px) {
		.list {
			grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
			gap: 0.3rem;
		}
	}

	@container (min-width: 600px) {
		.list {
			grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		}
	}

	@container (min-width: 800px) {
		.list {
			grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		}
	}
	`

	updated(changedProperties: PropertyValues<this>) {
		if (changedProperties.has("chords")) {
			this.numChords = this.parsedChords.length;
		}
	}

	render() {
		const chordNames = this.parsedChords;
		
		if (chordNames.length === 0) {
			return html`
				<header>
					<h3>${this.instrument}</h3>
				</header>
				<div class='empty-state'>
					No chords to display
				</div>
			`;
		}

		return html`
			<header>
				<h3>${this.instrument} (${this.numChords} chord${this.numChords !== 1 ? 's' : ''})</h3>
			</header>
			<div class='list'>
				${chordNames.map((chord) =>
					html`<chord-diagram chord=${chord} instrument='${this.instrument}'></chord-diagram>`
				)}
			</div>
		`;
	}
}