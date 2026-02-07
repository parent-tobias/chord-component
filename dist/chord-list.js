import { LitElement as l, css as u, html as a } from "lit";
import { property as c } from "./node_modules/@lit/reactive-element/decorators/property.js";
import { state as f } from "./node_modules/@lit/reactive-element/decorators/state.js";
import { getInstrument as p } from "./music-utils.js";
import "./chord-diagram.js";
var g = Object.defineProperty, o = (h, e, i, n) => {
  for (var t = void 0, r = h.length - 1, d; r >= 0; r--)
    (d = h[r]) && (t = d(e, i, t) || t);
  return t && g(e, i, t), t;
};
const m = class m extends l {
  constructor() {
    super(...arguments), this.instrument = "ukulele", this.chords = "[]", this.numChords = 0;
  }
  /**
   * Parsed chord names from the chords property
   */
  get parsedChords() {
    try {
      return Array.isArray(this.chords) ? this.chords : typeof this.chords == "string" ? JSON.parse(this.chords) : [];
    } catch {
      return [];
    }
  }
  updated(e) {
    e.has("chords") && (this.numChords = this.parsedChords.length);
  }
  render() {
    var n, t;
    const e = this.parsedChords;
    if (e.length === 0) {
      const r = ((n = p(this.instrument)) == null ? void 0 : n.name) ?? this.instrument;
      return a`
				<header>
					<h3>${r}</h3>
				</header>
				<div class='empty-state'>
					No chords to display
				</div>
			`;
    }
    const i = ((t = p(this.instrument)) == null ? void 0 : t.name) ?? this.instrument;
    return a`
			<header>
				<h3>${i} (${this.numChords} chord${this.numChords !== 1 ? "s" : ""})</h3>
			</header>
			<div class='list'>
				${e.map(
      (r) => a`<chord-diagram chord=${r} instrument='${this.instrument}'></chord-diagram>`
    )}
			</div>
		`;
  }
};
m.styles = u`
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
	`;
let s = m;
o([
  c({
    type: String
  })
], s.prototype, "instrument");
o([
  c()
], s.prototype, "chords");
o([
  f()
], s.prototype, "numChords");
customElements.get("chord-list") || customElements.define("chord-list", s);
export {
  s as ChordList
};
