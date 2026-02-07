import { LitElement as x, css as w, html as s } from "lit";
import { property as p } from "./node_modules/@lit/reactive-element/decorators/property.js";
import { state as u } from "./node_modules/@lit/reactive-element/decorators/state.js";
import { query as C } from "./node_modules/@lit/reactive-element/decorators/query.js";
import { SVGuitarChord as E } from "svguitar";
import { getInstrument as $, chordToNotes as F, chordOnInstrument as D } from "./music-utils.js";
import { chordDataService as k } from "./chord-data-service.js";
var L = Object.defineProperty, d = (y, r, i, n) => {
  for (var e = void 0, a = y.length - 1, c; a >= 0; a--)
    (c = y[a]) && (e = c(r, i, e) || e);
  return e && L(r, i, e), e;
};
const v = class v extends x {
  constructor() {
    super(...arguments), this.instrument = "ukulele", this.chord = "", this.chordData = {}, this.isLoading = !1, this.loadError = null;
  }
  async connectedCallback() {
    super.connectedCallback(), await this.loadChordData();
  }
  async updated(r) {
    super.updated(r), r.has("instrument") && await this.loadChordData();
  }
  async loadChordData() {
    this.isLoading = !0, this.loadError = null;
    try {
      const r = await k.getChordData(this.instrument);
      this.chordData = r.data;
    } catch (r) {
      console.error("Failed to load chord data:", r), this.loadError = "Failed to load chord data", this.chordData = {};
    } finally {
      this.isLoading = !1;
    }
  }
  render() {
    if (this.isLoading)
      return s`
				<div class='chord'>
					<div style="color: #90cdf4; font-size: 0.8rem; text-align: center; padding: 0.5rem;">
						Loading...
					</div>
				</div>
			`;
    if (this.loadError)
      return s`
				<div class='chord'>
					<div class='error'>${this.loadError}</div>
				</div>
			`;
    const r = $(this.instrument);
    if (!r)
      return s`
				<div class='chord'>
					<span>${this.chord.replace(/(maj)$/, "")}</span>
					<div class='error'>Unknown instrument: ${this.instrument}</div>
				</div>
			`;
    if (this.chordFingers)
      return this.renderChart(r, {
        fingers: this.chordFingers,
        barres: this.chordBarres ?? []
      });
    if (!this.chord)
      return s`
				<div class='chord'>
					<div class='error'>No chord specified</div>
				</div>
			`;
    const i = D(r), n = F(this.chord);
    if (!n || !n.notes || n.notes.length === 0)
      return s`
				<div class='chord'>
					<span>${this.chord.replace(/(maj)$/, "")}</span>
					<div class='error'>Unknown chord: ${this.chord}</div>
				</div>
			`;
    const e = this.chordData[this.chord] ? this.chordData[this.chord] : {
      barres: [],
      fingers: i(n) || []
    };
    return this.renderChart(r, e);
  }
  renderChart(r, i) {
    const n = i.fingers.map(
      ([, o]) => typeof o == "number" ? o : 1 / 0
    ), e = i.barres.map((o) => typeof o.fret == "number" ? o.fret : 0), a = [...n, ...e], c = a.length > 0 ? Math.min(...a.filter((o) => o > 0)) : 1, h = a.length > 0 ? Math.max(...a, 0) : 4;
    let l = 1;
    h > 4 && (l = Math.max(1, c));
    let f, g;
    l > 1 || h > 4 ? (f = Math.max(h - l + 1, 4), g = l) : (f = Math.max(h, 4), g = 1);
    const b = document.createElement("div"), m = this.chord ? this.chord.replace(/(maj)$/, "") : "";
    try {
      return new E(b).configure({
        strings: r.strings.length,
        frets: f,
        position: g,
        tuning: [...r.strings]
      }).chord({
        fingers: i.fingers,
        barres: i.barres
      }).draw(), s`
				<div class='chord'>
					${m ? s`<span>${m}</span>` : ""}
					<div class='diagram'>${b.firstChild}</div>
				</div>
			`;
    } catch (o) {
      return console.error("Error generating chord diagram:", o), s`
				<div class='chord'>
					${m ? s`<span>${m}</span>` : ""}
					<div class='error'>Error generating diagram</div>
				</div>
			`;
    }
  }
};
v.styles = w`
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
	`;
let t = v;
d([
  p({
    type: String
  })
], t.prototype, "instrument");
d([
  p({
    type: String
  })
], t.prototype, "chord");
d([
  p({ attribute: !1 })
], t.prototype, "chordFingers");
d([
  p({ attribute: !1 })
], t.prototype, "chordBarres");
d([
  C(".diagram")
], t.prototype, "container");
d([
  u()
], t.prototype, "chordData");
d([
  u()
], t.prototype, "isLoading");
d([
  u()
], t.prototype, "loadError");
customElements.get("chord-diagram") || customElements.define("chord-diagram", t);
export {
  t as ChordDiagram
};
