import { css as b, LitElement as v, html as l } from "lit";
import { customElement as y } from "./node_modules/@lit/reactive-element/decorators/custom-element.js";
import { property as m } from "./node_modules/@lit/reactive-element/decorators/property.js";
import { state as c } from "./node_modules/@lit/reactive-element/decorators/state.js";
import { query as w } from "./node_modules/@lit/reactive-element/decorators/query.js";
import { SVGuitarChord as x } from "svguitar";
import { instruments as g, chordToNotes as F, chordOnInstrument as k } from "./music-utils.js";
import { chordDataService as f } from "./chord-data-service.js";
var M = Object.defineProperty, C = Object.getOwnPropertyDescriptor, d = (t, i, e, r) => {
  for (var s = r > 1 ? void 0 : r ? C(i, e) : i, o = t.length - 1, n; o >= 0; o--)
    (n = t[o]) && (s = (r ? n(i, e, s) : n(s)) || s);
  return r && s && M(i, e, s), s;
};
let a = class extends v {
  constructor() {
    super(...arguments), this.instrument = "Standard Ukulele", this.chord = "", this.fingers = [], this.barres = [], this.viewPosition = 1, this.isLoading = !1, this.isModified = !1, this.editMode = "finger";
  }
  get numStrings() {
    const t = g.find(({ name: i }) => i === this.instrument);
    return (t == null ? void 0 : t.strings.length) || 4;
  }
  get calculatedPosition() {
    const t = [
      ...this.fingers.map(([, r]) => typeof r == "number" ? r : 0),
      ...this.barres.map((r) => typeof r.fret == "number" ? r.fret : 0)
    ];
    if (t.length === 0) return 1;
    const i = Math.min(...t.filter((r) => r > 0));
    return Math.max(...t, 0) <= 4 ? 1 : Math.max(1, i);
  }
  get maxFrets() {
    const t = [
      ...this.fingers.map(([, s]) => typeof s == "number" ? s : 0),
      ...this.barres.map((s) => typeof s.fret == "number" ? s.fret : 0)
    ], i = Math.max(...t, 0), e = 5, r = Math.max(i - this.viewPosition + 1, 4);
    return Math.max(e, r);
  }
  async connectedCallback() {
    super.connectedCallback(), await this.loadChordData();
  }
  async updated(t) {
    super.updated(t), (t.has("instrument") || t.has("chord")) && await this.loadChordData(), (t.has("fingers") || t.has("barres") || t.has("viewPosition")) && this.renderDiagram();
  }
  async loadChordData() {
    if (this.chord) {
      this.isLoading = !0;
      try {
        const t = await f.getChord(this.instrument, this.chord, !0);
        if (t)
          this.fingers = [...t.fingers], this.barres = [...t.barres], this.viewPosition = this.calculatedPosition, this.isModified = !1;
        else {
          const i = await f.getChord(this.instrument, this.chord, !1);
          i ? (this.fingers = [...i.fingers], this.barres = [...i.barres], this.viewPosition = this.calculatedPosition, this.isModified = !1) : this.generateDefaultChord();
        }
      } catch (t) {
        console.error("Failed to load chord data:", t), this.fingers = [], this.barres = [];
      } finally {
        this.isLoading = !1;
      }
    }
  }
  generateDefaultChord() {
    const t = g.find(({ name: r }) => r === this.instrument);
    if (!t) return;
    const i = k(t), e = F(this.chord);
    e && e.notes && e.notes.length > 0 && (this.fingers = i(e) || [], this.barres = [], this.viewPosition = this.calculatedPosition, this.isModified = !1);
  }
  renderDiagram() {
    if (!this.diagramContainer) return;
    const t = g.find(({ name: e }) => e === this.instrument);
    if (!t) return;
    this.diagramContainer.innerHTML = "";
    const i = document.createElement("div");
    try {
      const e = this.fingers.map(([o, n]) => {
        if (typeof n == "number") {
          const h = n - this.viewPosition + 1;
          if (h >= 0 && h <= this.maxFrets)
            return [o, h];
        } else
          return [o, n];
        return null;
      }).filter((o) => o !== null), r = this.barres.map((o) => {
        if (typeof o.fret == "number") {
          const n = o.fret - this.viewPosition + 1;
          if (n >= 0 && n <= this.maxFrets)
            return {
              ...o,
              fret: n
            };
        }
        return null;
      }).filter((o) => o !== null);
      new x(i).configure({
        strings: t.strings.length,
        frets: this.maxFrets,
        position: this.viewPosition,
        tuning: [...t.strings]
      }).chord({
        fingers: e,
        barres: r
      }).draw(), i.firstChild && (this.diagramContainer.appendChild(i.firstChild), this.setupInteraction());
    } catch (e) {
      console.error("Error rendering diagram:", e);
    }
  }
  setupInteraction() {
    var i;
    const t = (i = this.diagramContainer) == null ? void 0 : i.querySelector("svg");
    t && t.addEventListener("click", (e) => this.handleDiagramClick(e));
  }
  handleDiagramClick(t) {
    const e = t.currentTarget.getBoundingClientRect(), r = t.clientX - e.left, s = t.clientY - e.top, o = e.width / (this.numStrings + 1), n = e.height / (this.maxFrets + 2), h = Math.round((e.width - r) / o);
    let u = Math.round((s - n) / n);
    u = u + this.viewPosition - 1;
    const p = this.viewPosition + this.maxFrets - 1;
    h >= 1 && h <= this.numStrings && u >= 0 && u <= p && this.handlePositionClick(h, u);
  }
  handlePositionClick(t, i) {
    this.editMode === "finger" ? this.addOrUpdateFinger(t, i) : this.editMode === "remove" && this.removeFinger(t);
  }
  addOrUpdateFinger(t, i) {
    const e = this.fingers.findIndex(([r]) => r === t);
    e >= 0 ? this.fingers[e] = [t, i] : this.fingers.push([t, i]), this.fingers = [...this.fingers], this.isModified = !0, this.requestUpdate();
  }
  removeFinger(t) {
    this.fingers = this.fingers.filter(([i]) => i !== t), this.isModified = !0, this.requestUpdate();
  }
  removeFingerByIndex(t) {
    this.fingers.splice(t, 1), this.fingers = [...this.fingers], this.isModified = !0, this.requestUpdate();
  }
  async saveChord() {
    if (this.chord)
      try {
        await f.saveUserChord(
          this.instrument,
          this.chord,
          {
            fingers: this.fingers,
            barres: this.barres
            // position is NOT saved - it's auto-calculated
          }
        ), this.isModified = !1, this.dispatchEvent(new CustomEvent("chord-saved", {
          detail: {
            instrument: this.instrument,
            chord: this.chord,
            data: { fingers: this.fingers, barres: this.barres }
          },
          bubbles: !0,
          composed: !0
        })), this.requestUpdate();
      } catch (t) {
        console.error("Failed to save chord:", t), alert("Failed to save chord. Please try again.");
      }
  }
  async resetToDefault() {
    if (confirm("Reset to default chord? This will discard your changes."))
      try {
        await f.deleteUserChord(this.instrument, this.chord), await this.loadChordData(), this.dispatchEvent(new CustomEvent("chord-reset", {
          detail: {
            instrument: this.instrument,
            chord: this.chord
          },
          bubbles: !0,
          composed: !0
        }));
      } catch (t) {
        console.error("Failed to reset chord:", t);
      }
  }
  clearAll() {
    this.fingers = [], this.barres = [], this.isModified = !0, this.requestUpdate();
  }
  shiftViewPosition(t) {
    const i = Math.max(1, this.viewPosition + t);
    i !== this.viewPosition && (this.viewPosition = i, this.requestUpdate());
  }
  resetViewPosition() {
    this.viewPosition = this.calculatedPosition, this.requestUpdate();
  }
  updateFingerString(t, i) {
    const e = parseInt(i);
    !isNaN(e) && e >= 1 && e <= this.numStrings && (this.fingers[t] = [e, this.fingers[t][1]], this.fingers = [...this.fingers], this.isModified = !0, this.requestUpdate());
  }
  updateFingerFret(t, i) {
    const e = parseInt(i);
    !isNaN(e) && e >= 0 && (this.fingers[t] = [this.fingers[t][0], e], this.fingers = [...this.fingers], this.isModified = !0, this.requestUpdate());
  }
  addNewFinger() {
    this.fingers.push([1, 0]), this.fingers = [...this.fingers], this.isModified = !0, this.requestUpdate();
  }
  addBarre() {
    this.barres.push({
      fromString: this.numStrings,
      toString: 1,
      fret: this.viewPosition,
      text: "1"
    }), this.barres = [...this.barres], this.isModified = !0, this.requestUpdate();
  }
  updateBarreFromString(t, i) {
    const e = parseInt(i);
    !isNaN(e) && e >= 1 && e <= this.numStrings && (this.barres[t].fromString = e, this.barres = [...this.barres], this.isModified = !0, this.requestUpdate());
  }
  updateBarreToString(t, i) {
    const e = parseInt(i);
    !isNaN(e) && e >= 1 && e <= this.numStrings && (this.barres[t].toString = e, this.barres = [...this.barres], this.isModified = !0, this.requestUpdate());
  }
  updateBarreFret(t, i) {
    const e = parseInt(i);
    !isNaN(e) && e >= 0 && (this.barres[t].fret = e, this.barres = [...this.barres], this.isModified = !0, this.requestUpdate());
  }
  removeBarreByIndex(t) {
    this.barres.splice(t, 1), this.barres = [...this.barres], this.isModified = !0, this.requestUpdate();
  }
  render() {
    return this.isLoading ? l`
				<div class='editor'>
					<div class='info'>Loading...</div>
				</div>
			` : this.chord ? l`
			<div class='editor'>
				<div class='header'>
					<h3>${this.chord} - ${this.instrument}</h3>
					${this.isModified ? l`<span class='badge modified'>Modified</span>` : l`<span class='badge'>Saved</span>`}
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
								class='mode-button ${this.editMode === "finger" ? "active" : ""}'
								@click=${() => this.editMode = "finger"}
							>
								Add/Edit
							</button>
							<button
								class='mode-button ${this.editMode === "remove" ? "active" : ""}'
								@click=${() => this.editMode = "remove"}
							>
								Remove
							</button>
						</div>
					</div>

					<div class='control-group'>
						<label>Finger Positions (${this.fingers.length})</label>
						<div class='finger-list'>
							${this.fingers.length === 0 ? l`
								<div class='info'>No finger positions. Click the diagram or use "Add Finger" below.</div>
							` : this.fingers.map((t, i) => l`
								<div class='finger-item'>
									<div class='finger-inputs'>
										<label style="color: #a0aec0; font-size: 0.75rem;">String:</label>
										<input
											type="number"
											min="1"
											max="${this.numStrings}"
											.value="${t[0]}"
											@input=${(e) => this.updateFingerString(i, e.target.value)}
										/>
										<label style="color: #a0aec0; font-size: 0.75rem;">Fret:</label>
										<input
											type="number"
											min="0"
											.value="${t[1]}"
											@input=${(e) => this.updateFingerFret(i, e.target.value)}
										/>
									</div>
									<button
										class='danger'
										@click=${() => this.removeFingerByIndex(i)}
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
							${this.barres.length === 0 ? l`
								<div class='info'>No barres. Use "Add Barre" below to create one.</div>
							` : this.barres.map((t, i) => l`
								<div class='finger-item'>
									<div class='finger-inputs'>
										<label style="color: #a0aec0; font-size: 0.75rem;">From:</label>
										<input
											type="number"
											min="1"
											max="${this.numStrings}"
											.value="${t.fromString}"
											@input=${(e) => this.updateBarreFromString(i, e.target.value)}
										/>
										<label style="color: #a0aec0; font-size: 0.75rem;">To:</label>
										<input
											type="number"
											min="1"
											max="${this.numStrings}"
											.value="${t.toString}"
											@input=${(e) => this.updateBarreToString(i, e.target.value)}
										/>
										<label style="color: #a0aec0; font-size: 0.75rem;">Fret:</label>
										<input
											type="number"
											min="0"
											.value="${t.fret}"
											@input=${(e) => this.updateBarreFret(i, e.target.value)}
										/>
									</div>
									<button
										class='danger'
										@click=${() => this.removeBarreByIndex(i)}
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
					${this.editMode === "finger" ? "Click on the diagram to add or update finger positions." : "Click on a finger position to remove it."}
				</div>
			</div>
		` : l`
				<div class='editor'>
					<div class='error'>No chord specified</div>
				</div>
			`;
  }
};
a.styles = b`
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
	`;
d([
  m({ type: String })
], a.prototype, "instrument", 2);
d([
  m({ type: String })
], a.prototype, "chord", 2);
d([
  c()
], a.prototype, "fingers", 2);
d([
  c()
], a.prototype, "barres", 2);
d([
  c()
], a.prototype, "viewPosition", 2);
d([
  c()
], a.prototype, "isLoading", 2);
d([
  c()
], a.prototype, "isModified", 2);
d([
  c()
], a.prototype, "editMode", 2);
d([
  w(".diagram-container")
], a.prototype, "diagramContainer", 2);
a = d([
  y("chord-editor")
], a);
export {
  a as ChordEditor
};
