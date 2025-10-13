import { css as b, LitElement as x, html as n } from "lit";
import { customElement as w } from "./node_modules/@lit/reactive-element/decorators/custom-element.js";
import { property as v } from "./node_modules/@lit/reactive-element/decorators/property.js";
import { state as g } from "./node_modules/@lit/reactive-element/decorators/state.js";
import { query as C } from "./node_modules/@lit/reactive-element/decorators/query.js";
import { SVGuitarChord as D } from "svguitar";
import { instruments as E, chordToNotes as $, chordOnInstrument as j } from "./music-utils.js";
import { chordDataService as F } from "./chord-data-service.js";
var O = Object.defineProperty, L = Object.getOwnPropertyDescriptor, d = (r, c, a, o) => {
  for (var i = o > 1 ? void 0 : o ? L(c, a) : c, h = r.length - 1, s; h >= 0; h--)
    (s = r[h]) && (i = (o ? s(c, a, i) : s(i)) || i);
  return o && i && O(c, a, i), i;
};
let e = class extends x {
  constructor() {
    super(...arguments), this.instrument = "Standard Ukulele", this.chord = "", this.chordData = {}, this.isLoading = !1, this.loadError = null;
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
      const r = await F.getChordData(this.instrument);
      this.chordData = r.data;
    } catch (r) {
      console.error("Failed to load chord data:", r), this.loadError = "Failed to load chord data", this.chordData = {};
    } finally {
      this.isLoading = !1;
    }
  }
  render() {
    if (this.isLoading)
      return n`
				<div class='chord'>
					<div style="color: #90cdf4; font-size: 0.8rem; text-align: center; padding: 0.5rem;">
						Loading...
					</div>
				</div>
			`;
    if (this.loadError)
      return n`
				<div class='chord'>
					<div class='error'>${this.loadError}</div>
				</div>
			`;
    if (!this.chord)
      return n`
				<div class='chord'>
					<div class='error'>No chord specified</div>
				</div>
			`;
    const r = E.find(({ name: t }) => t === this.instrument);
    if (!r)
      return n`
				<div class='chord'>
					<span>${this.chord.replace(/(maj)$/, "")}</span>
					<div class='error'>Unknown instrument: ${this.instrument}</div>
				</div>
			`;
    const c = j(r), a = $(this.chord);
    if (!a || !a.notes || a.notes.length === 0)
      return n`
				<div class='chord'>
					<span>${this.chord.replace(/(maj)$/, "")}</span>
					<div class='error'>Unknown chord: ${this.chord}</div>
				</div>
			`;
    const o = this.chordData[this.chord] ? this.chordData[this.chord] : {
      barres: [],
      fingers: c(a) || []
    }, i = o.fingers.map(
      ([, t]) => typeof t == "number" ? t : 1 / 0
    ), h = o.barres.map((t) => typeof t.fret == "number" ? t.fret : 0), s = [...i, ...h], y = s.length > 0 ? Math.min(...s.filter((t) => t > 0)) : 1, l = s.length > 0 ? Math.max(...s, 0) : 4;
    let m = 1;
    l > 4 && (m = Math.max(1, y));
    let p, f;
    m > 1 || l > 4 ? (p = Math.max(l - m + 1, 4), f = m) : (p = Math.max(l, 4), f = 1);
    const u = document.createElement("div");
    try {
      return new D(u).configure({
        strings: r.strings.length,
        frets: p,
        position: f,
        tuning: [...r.strings]
      }).chord({
        fingers: o.fingers,
        barres: o.barres
      }).draw(), n`
				<div class='chord'>
					<span>${this.chord.replace(/(maj)$/, "")}</span>
					<div class='diagram'>${u.firstChild}</div>
				</div>
			`;
    } catch (t) {
      return console.error("Error generating chord diagram:", t), n`
				<div class='chord'>
					<span>${this.chord.replace(/(maj)$/, "")}</span>
					<div class='error'>Error generating diagram</div>
				</div>
			`;
    }
  }
};
e.styles = b`
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
d([
  v({
    type: String
  })
], e.prototype, "instrument", 2);
d([
  v({
    type: String
  })
], e.prototype, "chord", 2);
d([
  C(".diagram")
], e.prototype, "container", 2);
d([
  g()
], e.prototype, "chordData", 2);
d([
  g()
], e.prototype, "isLoading", 2);
d([
  g()
], e.prototype, "loadError", 2);
e = d([
  w("chord-diagram")
], e);
export {
  e as ChordDiagram
};
