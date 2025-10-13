import { css as p, LitElement as c, html as m } from "lit";
import { customElement as l } from "./node_modules/@lit/reactive-element/decorators/custom-element.js";
import { property as d } from "./node_modules/@lit/reactive-element/decorators/property.js";
import { state as u } from "./node_modules/@lit/reactive-element/decorators/state.js";
import "./chord-diagram.js";
var f = Object.defineProperty, g = Object.getOwnPropertyDescriptor, o = (t, e, n, i) => {
  for (var r = i > 1 ? void 0 : i ? g(e, n) : e, a = t.length - 1, h; a >= 0; a--)
    (h = t[a]) && (r = (i ? h(e, n, r) : h(r)) || r);
  return i && r && f(e, n, r), r;
};
let s = class extends c {
  constructor() {
    super(...arguments), this.instrument = "Standard Ukulele", this.chords = "[]", this.numChords = 0;
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
  updated(t) {
    t.has("chords") && (this.numChords = this.parsedChords.length);
  }
  render() {
    const t = this.parsedChords;
    return t.length === 0 ? m`
				<header>
					<h3>${this.instrument}</h3>
				</header>
				<div class='empty-state'>
					No chords to display
				</div>
			` : m`
			<header>
				<h3>${this.instrument} (${this.numChords} chord${this.numChords !== 1 ? "s" : ""})</h3>
			</header>
			<div class='list'>
				${t.map(
      (e) => m`<chord-diagram chord=${e} instrument='${this.instrument}'></chord-diagram>`
    )}
			</div>
		`;
  }
};
s.styles = p`
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
o([
  d({
    type: String
  })
], s.prototype, "instrument", 2);
o([
  d()
], s.prototype, "chords", 2);
o([
  u()
], s.prototype, "numChords", 2);
s = o([
  l("chord-list")
], s);
export {
  s as ChordList
};
