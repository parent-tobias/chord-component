import { LitElement, css, html } from 'lit';
import { property, state, query } from 'lit/decorators.js';
import { SVGuitarChord } from 'svguitar';
import type { Finger, Barre } from 'svguitar';

import { instruments, chordOnInstrument, chordToNotes } from './music-utils.js';
import { chordDataService } from './chord-data-service.js';

/**
 * An interactive web component that allows users to edit chord diagrams.
 * Users can click to add/remove finger positions and create barres.
 *
 * @element chord-editor
 *
 * @attr {string} instrument - The instrument to edit the chord for (default: 'Standard Ukulele')
 * @attr {string} chord - The chord name to edit (e.g., 'C', 'Am7', 'F#dim')
 *
 * @fires chord-saved - Fired when user saves the edited chord
 * @fires chord-reset - Fired when user resets to default
 *
 * @example
 * ```html
 * <chord-editor chord="C" instrument="Standard Ukulele"></chord-editor>
 * ```
 */

// @customElement('chord-editor')
export class ChordEditor extends LitElement {

	static styles = css`
	:host {
		display: block;
		width: 100%;
		max-width: 400px;
		border: 1px solid #4a5568;
		border-radius: 8px;
		background: #2d3748;
		padding: 1rem;
		box-sizing: border-box;
	}

	.editor {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 2px solid #4a5568;
		padding-bottom: 0.5rem;
	}

	.header h3 {
		color: #90cdf4;
		margin: 0;
		font-size: 1.1rem;
	}

	.badge {
		background: #3182ce;
		color: white;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.badge.modified {
		background: #f6ad55;
	}

	.diagram-container {
		position: relative;
		width: 100%;
		display: flex;
		justify-content: center;
		background: #1a202c;
		border-radius: 4px;
		padding: 1rem;
		cursor: crosshair;
	}

	.diagram-container :global(svg) {
		max-width: 100%;
		height: auto;
	}

	.controls {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.control-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.control-group label {
		color: #e2e8f0;
		font-size: 0.9rem;
		font-weight: 500;
	}

	.button-group {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	button {
		padding: 0.5rem 1rem;
		border-radius: 4px;
		border: 1px solid #4a5568;
		background: #1a202c;
		color: #f8f8f8;
		font-size: 0.9rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	button:hover {
		background: #2d3748;
		border-color: #63b3ed;
	}

	button.primary {
		background: #3182ce;
		border-color: #3182ce;
		font-weight: 600;
	}

	button.primary:hover {
		background: #2c5282;
	}

	button.secondary {
		background: #718096;
		border-color: #718096;
	}

	button.secondary:hover {
		background: #4a5568;
	}

	button.danger {
		background: #e53e3e;
		border-color: #e53e3e;
	}

	button.danger:hover {
		background: #c53030;
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.mode-selector {
		display: flex;
		gap: 0.5rem;
		background: #1a202c;
		padding: 0.25rem;
		border-radius: 4px;
	}

	.mode-button {
		flex: 1;
		padding: 0.5rem;
		background: transparent;
		border: none;
		color: #a0aec0;
		font-size: 0.85rem;
		font-weight: 500;
		cursor: pointer;
		border-radius: 4px;
		transition: all 0.2s;
	}

	.mode-button:hover {
		color: #e2e8f0;
		background: #2d3748;
	}

	.mode-button.active {
		background: #3182ce;
		color: white;
	}

	.finger-list {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		max-height: 150px;
		overflow-y: auto;
		background: #1a202c;
		padding: 0.5rem;
		border-radius: 4px;
		font-family: monospace;
		font-size: 0.85rem;
		color: #e2e8f0;
	}

	.finger-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
		padding: 0.25rem 0.5rem;
		background: #2d3748;
		border-radius: 4px;
	}

	.finger-item button {
		padding: 0.25rem 0.5rem;
		font-size: 0.75rem;
		min-width: 60px;
	}

	.finger-inputs {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		flex: 1;
	}

	.finger-inputs input {
		width: 50px;
		padding: 0.25rem 0.5rem;
		background: #1a202c;
		border: 1px solid #4a5568;
		border-radius: 4px;
		color: #f8f8f8;
		font-size: 0.85rem;
		font-family: monospace;
	}

	.finger-inputs input:focus {
		outline: none;
		border-color: #63b3ed;
	}

	.add-button {
		width: 100%;
		background: #2d5282 !important;
		border-color: #2d5282 !important;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}

	.add-button:hover {
		background: #3182ce !important;
	}

	.shift-toggle {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem;
		background: #1a202c;
		border-radius: 4px;
		cursor: pointer;
		user-select: none;
	}

	.shift-toggle:hover {
		background: #2d3748;
	}

	.shift-toggle input[type="checkbox"] {
		cursor: pointer;
		width: auto;
		padding: 0;
	}

	.shift-toggle label {
		cursor: pointer;
		margin: 0;
		color: #e2e8f0;
		font-size: 0.85rem;
	}

	.error {
		color: #fc8181;
		font-size: 0.8rem;
		text-align: center;
		padding: 0.5rem;
	}

	.info {
		color: #90cdf4;
		font-size: 0.8rem;
		text-align: center;
		padding: 0.5rem;
		font-style: italic;
	}
	`

	@property({ type: String })
	instrument = 'Standard Ukulele';

	@property({ type: String })
	chord = '';

	@state()
	private fingers: Finger[] = [];

	@state()
	private barres: Barre[] = [];

	@state()
	private viewPosition: number = 1; // Display position only, not saved with chord

	@state()
	private isLoading = false;

	@state()
	private isModified = false;

	@state()
	private editMode: 'finger' | 'barre' | 'remove' = 'finger';

	// Store original data for future use (e.g., undo functionality)
	// private originalData: InstrumentDefault | null = null;

	@query('.diagram-container')
	diagramContainer?: HTMLElement;

	private get numStrings(): number {
		const inst = instruments.find(({ name }) => name === this.instrument);
		return inst?.strings.length || 4;
	}

	private get calculatedPosition(): number {
		// Auto-calculate the best starting position based on chord data
		const allFrets = [...this.fingers.map(([, fret]) => typeof fret === 'number' ? fret : 0),
						   ...this.barres.map(b => typeof b.fret === 'number' ? b.fret : 0)];

		if (allFrets.length === 0) return 1;

		const minFret = Math.min(...allFrets.filter(f => f > 0));
		const maxFret = Math.max(...allFrets, 0);

		// If all notes are in first 4 frets, start at 1
		if (maxFret <= 4) return 1;

		// Otherwise, start from the lowest fret (or close to it)
		return Math.max(1, minFret);
	}

	private get maxFrets(): number {
		const allFrets = [...this.fingers.map(([, fret]) => typeof fret === 'number' ? fret : 0),
						   ...this.barres.map(b => typeof b.fret === 'number' ? b.fret : 0)];
		const maxFret = Math.max(...allFrets, 0);

		// Default to 5 frets for a consistent view range
		const defaultRange = 5;

		// Calculate the minimum range needed to show all notes from the current view position
		const minRange = Math.max(maxFret - this.viewPosition + 1, 4);

		// Use the default range, but expand if needed to show all notes
		return Math.max(defaultRange, minRange);
	}

	async connectedCallback() {
		super.connectedCallback();
		await this.loadChordData();
	}

	async updated(changedProperties: Map<string, any>) {
		super.updated(changedProperties);

		if (changedProperties.has('instrument') || changedProperties.has('chord')) {
			await this.loadChordData();
		}

		if (changedProperties.has('fingers') || changedProperties.has('barres') || changedProperties.has('viewPosition')) {
			this.renderDiagram();
		}
	}

	private async loadChordData() {
		if (!this.chord) return;

		this.isLoading = true;

		try {
			// Try to get user's custom version first
			const userChord = await chordDataService.getChord(this.instrument, this.chord, true);

			if (userChord) {
				this.fingers = [...userChord.fingers];
				this.barres = [...userChord.barres];
				// Auto-calculate view position based on chord data
				this.viewPosition = this.calculatedPosition;
				// this.originalData = userChord;
				this.isModified = false;
			} else {
				// Fall back to system default or generate
				const systemChord = await chordDataService.getChord(this.instrument, this.chord, false);

				if (systemChord) {
					this.fingers = [...systemChord.fingers];
					this.barres = [...systemChord.barres];
					// Auto-calculate view position based on chord data
					this.viewPosition = this.calculatedPosition;
					// this.originalData = systemChord;
					this.isModified = false;
				} else {
					// Generate from music theory
					this.generateDefaultChord();
				}
			}
		} catch (error) {
			console.error('Failed to load chord data:', error);
			this.fingers = [];
			this.barres = [];
		} finally {
			this.isLoading = false;
		}
	}

	private generateDefaultChord() {
		const instrumentObject = instruments.find(({ name }) => name === this.instrument);
		if (!instrumentObject) return;

		const chordFinder = chordOnInstrument(instrumentObject);
		const chordObject = chordToNotes(this.chord);

		if (chordObject && chordObject.notes && chordObject.notes.length > 0) {
			this.fingers = chordFinder(chordObject) || [];
			this.barres = [];
			this.viewPosition = this.calculatedPosition;
			// this.originalData = { fingers: [...this.fingers], barres: [] };
			this.isModified = false;
		}
	}

	private renderDiagram() {
		if (!this.diagramContainer) return;

		const instrumentObject = instruments.find(({ name }) => name === this.instrument);
		if (!instrumentObject) return;

		// Clear existing diagram
		this.diagramContainer.innerHTML = '';

		const divEl = document.createElement('div');

		try {
			// Convert absolute fret positions to relative positions based on viewPosition
			// SVGuitar expects positions relative to the position parameter
			const relativeFingers = this.fingers
				.map(([string, fret]): Finger | null => {
					if (typeof fret === 'number') {
						const relativeFret = fret - this.viewPosition + 1;
						// Only include fingers that are within the visible range
						if (relativeFret >= 0 && relativeFret <= this.maxFrets) {
							return [string, relativeFret];
						}
					} else {
						// Handle 'x' or other non-numeric fret values
						return [string, fret];
					}
					return null;
				})
				.filter((f): f is Finger => f !== null);

			const relativeBarres = this.barres
				.map((barre): Barre | null => {
					if (typeof barre.fret === 'number') {
						const relativeFret = barre.fret - this.viewPosition + 1;
						// Only include barres that are within the visible range
						if (relativeFret >= 0 && relativeFret <= this.maxFrets) {
							return {
								...barre,
								fret: relativeFret
							};
						}
					}
					return null;
				})
				.filter((b): b is Barre => b !== null);

			const chart = new SVGuitarChord(divEl);
			chart
				.configure({
					strings: instrumentObject.strings.length,
					frets: this.maxFrets,
					position: this.viewPosition,
					tuning: [...instrumentObject.strings]
				})
				.chord({
					fingers: relativeFingers,
					barres: relativeBarres
				})
				.draw();

			if (divEl.firstChild) {
				this.diagramContainer.appendChild(divEl.firstChild);
				this.setupInteraction();
			}
		} catch (error) {
			console.error('Error rendering diagram:', error);
		}
	}

	private setupInteraction() {
		const svg = this.diagramContainer?.querySelector('svg');
		if (!svg) return;

		svg.addEventListener('click', (e) => this.handleDiagramClick(e));
	}

	private handleDiagramClick(e: MouseEvent) {
		const svg = e.currentTarget as SVGSVGElement;
		const rect = svg.getBoundingClientRect();

		// Get click position relative to SVG
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		// Convert to string and fret coordinates
		// This is a simplified calculation - you may need to adjust based on SVGuitar's rendering
		const stringWidth = rect.width / (this.numStrings + 1);
		const fretHeight = rect.height / (this.maxFrets + 2);

		const stringNum = Math.round((rect.width - x) / stringWidth);
		let fretNum = Math.round((y - fretHeight) / fretHeight);

		// Adjust fret number based on view position
		fretNum = fretNum + this.viewPosition - 1;

		const maxAbsoluteFret = this.viewPosition + this.maxFrets - 1;
		if (stringNum >= 1 && stringNum <= this.numStrings && fretNum >= 0 && fretNum <= maxAbsoluteFret) {
			this.handlePositionClick(stringNum, fretNum);
		}
	}

	private handlePositionClick(stringNum: number, fretNum: number) {
		if (this.editMode === 'finger') {
			this.addOrUpdateFinger(stringNum, fretNum);
		} else if (this.editMode === 'remove') {
			this.removeFinger(stringNum);
		}
		// Barre mode would need more complex UI (select range)
	}

	private addOrUpdateFinger(stringNum: number, fretNum: number) {
		const existingIndex = this.fingers.findIndex(([s]) => s === stringNum);

		if (existingIndex >= 0) {
			// Update existing finger
			this.fingers[existingIndex] = [stringNum, fretNum];
		} else {
			// Add new finger
			this.fingers.push([stringNum, fretNum]);
		}

		this.fingers = [...this.fingers]; // Trigger update
		this.isModified = true;
		this.requestUpdate();
	}

	private removeFinger(stringNum: number) {
		this.fingers = this.fingers.filter(([s]) => s !== stringNum);
		this.isModified = true;
		this.requestUpdate();
	}

	private removeFingerByIndex(index: number) {
		this.fingers.splice(index, 1);
		this.fingers = [...this.fingers];
		this.isModified = true;
		this.requestUpdate();
	}

	private async saveChord() {
		if (!this.chord) return;

		try {
			await chordDataService.saveUserChord(
				this.instrument,
				this.chord,
				{
					fingers: this.fingers,
					barres: this.barres
					// position is NOT saved - it's auto-calculated
				}
			);

			this.isModified = false;
			// this.originalData = { fingers: [...this.fingers], barres: [...this.barres] };

			// Dispatch event
			this.dispatchEvent(new CustomEvent('chord-saved', {
				detail: {
					instrument: this.instrument,
					chord: this.chord,
					data: { fingers: this.fingers, barres: this.barres }
				},
				bubbles: true,
				composed: true
			}));

			this.requestUpdate();
		} catch (error) {
			console.error('Failed to save chord:', error);
			alert('Failed to save chord. Please try again.');
		}
	}

	private async resetToDefault() {
		if (!confirm('Reset to default chord? This will discard your changes.')) {
			return;
		}

		try {
			await chordDataService.deleteUserChord(this.instrument, this.chord);
			await this.loadChordData();

			this.dispatchEvent(new CustomEvent('chord-reset', {
				detail: {
					instrument: this.instrument,
					chord: this.chord
				},
				bubbles: true,
				composed: true
			}));
		} catch (error) {
			console.error('Failed to reset chord:', error);
		}
	}

	private clearAll() {
		this.fingers = [];
		this.barres = [];
		this.isModified = true;
		this.requestUpdate();
	}

	private shiftViewPosition(delta: number) {
		// Shift the view position (display window) only
		const newViewPosition = Math.max(1, this.viewPosition + delta);
		if (newViewPosition !== this.viewPosition) {
			this.viewPosition = newViewPosition;
			// Don't mark as modified - this is just a view change
			this.requestUpdate();
		}
	}

	private resetViewPosition() {
		// Reset view to auto-calculated position
		this.viewPosition = this.calculatedPosition;
		this.requestUpdate();
	}

	private updateFingerString(index: number, value: string) {
		const num = parseInt(value);
		if (!isNaN(num) && num >= 1 && num <= this.numStrings) {
			this.fingers[index] = [num, this.fingers[index][1]];
			this.fingers = [...this.fingers];
			this.isModified = true;
			this.requestUpdate();
		}
	}

	private updateFingerFret(index: number, value: string) {
		const num = parseInt(value);
		if (!isNaN(num) && num >= 0) {
			this.fingers[index] = [this.fingers[index][0], num];
			this.fingers = [...this.fingers];
			this.isModified = true;
			this.requestUpdate();
		}
	}

	private addNewFinger() {
		// Add a new finger at string 1, fret 0 (open)
		this.fingers.push([1, 0]);
		this.fingers = [...this.fingers];
		this.isModified = true;
		this.requestUpdate();
	}

	private addBarre() {
		// Add a new barre from string 4 to 1, at the current view position
		this.barres.push({
			fromString: this.numStrings,
			toString: 1,
			fret: this.viewPosition,
			text: "1"
		});
		this.barres = [...this.barres];
		this.isModified = true;
		this.requestUpdate();
	}

	private updateBarreFromString(index: number, value: string) {
		const num = parseInt(value);
		if (!isNaN(num) && num >= 1 && num <= this.numStrings) {
			this.barres[index].fromString = num;
			this.barres = [...this.barres];
			this.isModified = true;
			this.requestUpdate();
		}
	}

	private updateBarreToString(index: number, value: string) {
		const num = parseInt(value);
		if (!isNaN(num) && num >= 1 && num <= this.numStrings) {
			this.barres[index].toString = num;
			this.barres = [...this.barres];
			this.isModified = true;
			this.requestUpdate();
		}
	}

	private updateBarreFret(index: number, value: string) {
		const num = parseInt(value);
		if (!isNaN(num) && num >= 0) {
			this.barres[index].fret = num;
			this.barres = [...this.barres];
			this.isModified = true;
			this.requestUpdate();
		}
	}

	private removeBarreByIndex(index: number) {
		this.barres.splice(index, 1);
		this.barres = [...this.barres];
		this.isModified = true;
		this.requestUpdate();
	}

	render() {
		if (this.isLoading) {
			return html`
				<div class='editor'>
					<div class='info'>Loading...</div>
				</div>
			`;
		}

		if (!this.chord) {
			return html`
				<div class='editor'>
					<div class='error'>No chord specified</div>
				</div>
			`;
		}

		return html`
			<div class='editor'>
				<div class='header'>
					<h3>${this.chord} - ${this.instrument}</h3>
					${this.isModified ? html`<span class='badge modified'>Modified</span>` : html`<span class='badge'>Saved</span>`}
				</div>

				<div class='diagram-container'></div>

				<div class='controls'>
					<div class='control-group'>
						<label>View Position (Display Window: Fret ${this.viewPosition})</label>
						<div class='info' style="margin-bottom: 0.5rem;">
							Adjust which frets are shown. The chord itself stays the same.
						</div>
						<div class='button-group'>
							<button @click=${() => this.shiftViewPosition(-1)}>
								← View Lower
							</button>
							<button @click=${() => this.shiftViewPosition(1)}>
								View Higher →
							</button>
							<button @click=${this.resetViewPosition}>
								Auto Position
							</button>
						</div>
					</div>

					<div class='control-group'>
						<label>Edit Mode</label>
						<div class='mode-selector'>
							<button
								class='mode-button ${this.editMode === 'finger' ? 'active' : ''}'
								@click=${() => this.editMode = 'finger'}
							>
								Add/Edit
							</button>
							<button
								class='mode-button ${this.editMode === 'remove' ? 'active' : ''}'
								@click=${() => this.editMode = 'remove'}
							>
								Remove
							</button>
						</div>
					</div>

					<div class='control-group'>
						<label>Finger Positions (${this.fingers.length})</label>
						<div class='finger-list'>
							${this.fingers.length === 0 ? html`
								<div class='info'>No finger positions. Click the diagram or use "Add Finger" below.</div>
							` : this.fingers.map((finger, index) => html`
								<div class='finger-item'>
									<div class='finger-inputs'>
										<label style="color: #a0aec0; font-size: 0.75rem;">String:</label>
										<input
											type="number"
											min="1"
											max="${this.numStrings}"
											.value="${finger[0].toString()}"
											@input=${(e: Event) => this.updateFingerString(index, (e.target as HTMLInputElement).value)}
										/>
										<label style="color: #a0aec0; font-size: 0.75rem;">Fret:</label>
										<input
											type="number"
											min="0"
											.value="${finger[1].toString()}"
											@input=${(e: Event) => this.updateFingerFret(index, (e.target as HTMLInputElement).value)}
										/>
									</div>
									<button
										class='danger'
										@click=${() => this.removeFingerByIndex(index)}
									>
										×
									</button>
								</div>
							`)}
							<button class='add-button' @click=${this.addNewFinger}>
								+ Add Finger Position
							</button>
						</div>
					</div>

					<div class='control-group'>
						<label>Barre Positions (${this.barres.length})</label>
						<div class='finger-list'>
							${this.barres.length === 0 ? html`
								<div class='info'>No barres. Use "Add Barre" below to create one.</div>
							` : this.barres.map((barre, index) => html`
								<div class='finger-item'>
									<div class='finger-inputs'>
										<label style="color: #a0aec0; font-size: 0.75rem;">From:</label>
										<input
											type="number"
											min="1"
											max="${this.numStrings}"
											.value="${barre.fromString.toString()}"
											@input=${(e: Event) => this.updateBarreFromString(index, (e.target as HTMLInputElement).value)}
										/>
										<label style="color: #a0aec0; font-size: 0.75rem;">To:</label>
										<input
											type="number"
											min="1"
											max="${this.numStrings}"
											.value="${barre.toString.toString()}"
											@input=${(e: Event) => this.updateBarreToString(index, (e.target as HTMLInputElement).value)}
										/>
										<label style="color: #a0aec0; font-size: 0.75rem;">Fret:</label>
										<input
											type="number"
											min="0"
											.value="${barre.fret.toString()}"
											@input=${(e: Event) => this.updateBarreFret(index, (e.target as HTMLInputElement).value)}
										/>
									</div>
									<button
										class='danger'
										@click=${() => this.removeBarreByIndex(index)}
									>
										×
									</button>
								</div>
							`)}
							<button class='add-button' @click=${this.addBarre}>
								+ Add Barre
							</button>
						</div>
					</div>

					<div class='button-group'>
						<button
							class='primary'
							@click=${this.saveChord}
							?disabled=${!this.isModified}
						>
							Save Custom Chord
						</button>
						<button
							class='secondary'
							@click=${this.resetToDefault}
						>
							Reset to Default
						</button>
						<button
							class='danger'
							@click=${this.clearAll}
						>
							Clear All
						</button>
					</div>
				</div>

				<div class='info'>
					${this.editMode === 'finger' ? 'Click on the diagram to add or update finger positions.' : 'Click on a finger position to remove it.'}
				</div>
			</div>
		`;
	}
}

if(!customElements.get('chord-editor')) {
	customElements.define('chord-editor', ChordEditor);
}