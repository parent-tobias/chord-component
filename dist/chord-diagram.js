import { css as l, LitElement as g, html as c } from "lit";
import { customElement as f } from "./node_modules/@lit/reactive-element/decorators/custom-element.js";
import { property as p } from "./node_modules/@lit/reactive-element/decorators/property.js";
import { query as u } from "./node_modules/@lit/reactive-element/decorators/query.js";
import { SVGuitarChord as v } from "svguitar";
import { instruments as x, chordToNotes as y, chordOnInstrument as b } from "./music-utils.js";
import { systemDefaultChords as m } from "./default-chords.js";
var w = Object.defineProperty, $ = Object.getOwnPropertyDescriptor, h = (i, o, t, s) => {
  for (var r = s > 1 ? void 0 : s ? $(o, t) : o, e = i.length - 1, d; e >= 0; e--)
    (d = i[e]) && (r = (s ? d(o, t, r) : d(r)) || r);
  return s && r && w(o, t, r), r;
};
let a = class extends g {
  constructor() {
    super(...arguments), this.instrument = "Standard Ukulele", this.chord = "";
  }
  render() {
    if (!this.chord)
      return c`
				<div class='chord'>
					<div class='error'>No chord specified</div>
				</div>
			`;
    const i = x.find(({ name: n }) => n === this.instrument);
    if (!i)
      return c`
				<div class='chord'>
					<span>${this.chord.replace(/(maj)$/, "")}</span>
					<div class='error'>Unknown instrument: ${this.instrument}</div>
				</div>
			`;
    const o = b(i), t = y(this.chord);
    if (!t || !t.notes || t.notes.length === 0)
      return c`
				<div class='chord'>
					<span>${this.chord.replace(/(maj)$/, "")}</span>
					<div class='error'>Unknown chord: ${this.chord}</div>
				</div>
			`;
    const s = m[this.instrument] && m[this.instrument][this.chord] ? m[this.instrument][this.chord] : {
      barres: [],
      fingers: o(t) || []
    }, r = s.fingers.map(
      ([, n]) => typeof n == "number" ? n : 1 / 0
    );
    let e = Math.max(...r);
    e = e >= 4 ? e : 4;
    const d = document.createElement("div");
    try {
      return new v(d).configure({
        strings: i.strings.length,
        frets: e,
        position: 1,
        tuning: [...i.strings]
      }).chord(s).draw(), c`
				<div class='chord'>
					<span>${this.chord.replace(/(maj)$/, "")}</span>
					<div class='diagram'>${d.firstChild}</div>
				</div>
			`;
    } catch (n) {
      return console.error("Error generating chord diagram:", n), c`
				<div class='chord'>
					<span>${this.chord.replace(/(maj)$/, "")}</span>
					<div class='error'>Error generating diagram</div>
				</div>
			`;
    }
  }
};
a.styles = l`
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
h([
  p({
    type: String
  })
], a.prototype, "instrument", 2);
h([
  p({
    type: String
  })
], a.prototype, "chord", 2);
h([
  u(".diagram")
], a.prototype, "container", 2);
a = h([
  f("chord-diagram")
], a);
export {
  a as ChordDiagram
};
