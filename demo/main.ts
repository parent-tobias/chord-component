// Entry point for demo bundling
import '../src/chord-diagram.js';
import '../src/chord-list.js';
import { searchChords, chordVoicings } from '../src/plugin-helpers.js';

// Instruments the chords-plugin natively supports (same set the component uses internally)
const PLUGIN_INSTRUMENTS: ReadonlySet<string> = new Set(['guitar', 'ukulele']);

// -------- Single chord demo --------

const instrumentSelect = document.getElementById('instrument-select') as HTMLSelectElement;
const chordInput = document.getElementById('chord-input') as HTMLInputElement;
const chordSuggestions = document.getElementById('chord-suggestions') as HTMLDataListElement;
const singleChord = document.getElementById('single-chord');
const voicingPrev = document.getElementById('voicing-prev') as HTMLButtonElement;
const voicingNext = document.getElementById('voicing-next') as HTMLButtonElement;
const voicingIndicator = document.getElementById('voicing-indicator');
const coverageIndicator = document.getElementById('coverage-indicator');

let currentVoicing = 0;
let currentVoicingCount = 0;

/**
 * Update the chord diagram's attributes and the voicing cycler state based
 * on the current instrument + chord + voicing index.
 */
async function updateSingleChord() {
	if (!singleChord) return;

	const instrument = instrumentSelect.value;
	const chord = chordInput.value.trim();

	singleChord.setAttribute('instrument', instrument);
	singleChord.setAttribute('chord', chord);
	singleChord.setAttribute('voicing-index', String(currentVoicing));

	await updateVoicingState(instrument, chord);
	updateCoverageBadge(instrument);
}

async function updateVoicingState(instrument: string, chord: string) {
	if (!PLUGIN_INSTRUMENTS.has(instrument) || !chord) {
		currentVoicingCount = 0;
		currentVoicing = 0;
		renderVoicingUI();
		return;
	}

	// chordVoicings takes 'guitar' | 'ukulele' — safe narrow since we gate on PLUGIN_INSTRUMENTS
	currentVoicingCount = await chordVoicings(chord, instrument as 'guitar' | 'ukulele');
	if (currentVoicing >= currentVoicingCount) {
		currentVoicing = Math.max(0, currentVoicingCount - 1);
		singleChord?.setAttribute('voicing-index', String(currentVoicing));
	}
	renderVoicingUI();
}

function renderVoicingUI() {
	if (!voicingIndicator) return;
	if (currentVoicingCount === 0) {
		voicingIndicator.textContent = '—';
		voicingPrev.disabled = true;
		voicingNext.disabled = true;
	} else {
		voicingIndicator.textContent = `${currentVoicing + 1} / ${currentVoicingCount}`;
		voicingPrev.disabled = currentVoicing === 0;
		voicingNext.disabled = currentVoicing >= currentVoicingCount - 1;
	}
}

function updateCoverageBadge(instrument: string) {
	if (!coverageIndicator) return;
	if (PLUGIN_INSTRUMENTS.has(instrument)) {
		coverageIndicator.innerHTML = `
			<span class="coverage-badge plugin">
				✓ Using @svguitar/chords-plugin — ${currentVoicingCount || 0} voicing${currentVoicingCount === 1 ? '' : 's'} available
			</span>
		`;
	} else {
		coverageIndicator.innerHTML = `
			<span class="coverage-badge dynamic">
				⚙ Using system defaults + dynamic generation (plugin doesn't cover this instrument)
			</span>
		`;
	}
}

/**
 * Populate the chord-name autocomplete datalist as the user types.
 * Debounced lightly to avoid thrashing on fast typing.
 */
let searchTimer: number | undefined;
async function updateSuggestions() {
	if (!chordSuggestions) return;
	const instrument = instrumentSelect.value;
	if (!PLUGIN_INSTRUMENTS.has(instrument)) {
		// Clear suggestions for non-plugin instruments
		chordSuggestions.innerHTML = '';
		return;
	}
	const prefix = chordInput.value.trim();
	if (!prefix) {
		chordSuggestions.innerHTML = '';
		return;
	}
	const matches = await searchChords(prefix, instrument as 'guitar' | 'ukulele', 20);
	chordSuggestions.innerHTML = matches
		.map((name) => `<option value="${name}"></option>`)
		.join('');
}

function debouncedSuggestions() {
	window.clearTimeout(searchTimer);
	searchTimer = window.setTimeout(updateSuggestions, 150);
}

// -------- Event wiring --------

instrumentSelect?.addEventListener('change', () => {
	currentVoicing = 0; // reset voicing when switching instrument
	updateSingleChord();
	updateSuggestions();
});

chordInput?.addEventListener('input', () => {
	currentVoicing = 0; // reset voicing when chord changes
	updateSingleChord();
	debouncedSuggestions();
});

voicingPrev?.addEventListener('click', () => {
	if (currentVoicing > 0) {
		currentVoicing -= 1;
		updateSingleChord();
	}
});

voicingNext?.addEventListener('click', () => {
	if (currentVoicing < currentVoicingCount - 1) {
		currentVoicing += 1;
		updateSingleChord();
	}
});

// Initial render
updateSingleChord();
updateSuggestions();

// -------- Chord list demo (unchanged from 2.x) --------

const listInstrumentSelect = document.getElementById('list-instrument-select') as HTMLSelectElement;
const chordListDemo = document.getElementById('chord-list-demo');
const commonChordsBtn = document.getElementById('common-chords-btn');
const jazzChordsBtn = document.getElementById('jazz-chords-btn');
const customChordsBtn = document.getElementById('custom-chords-btn');

listInstrumentSelect?.addEventListener('change', () => {
	if (chordListDemo) {
		chordListDemo.setAttribute('instrument', listInstrumentSelect.value);
	}
});

commonChordsBtn?.addEventListener('click', () => {
	if (chordListDemo && listInstrumentSelect) {
		const instrument = listInstrumentSelect.value;
		const chords = instrument === 'guitar'
			? ['C', 'D', 'E', 'F', 'G', 'A', 'Em', 'Am', 'Dm']
			: ['C', 'F', 'G', 'Am', 'D', 'Em', 'A7', 'D7', 'G7'];
		chordListDemo.setAttribute('chords', JSON.stringify(chords));
	}
});

jazzChordsBtn?.addEventListener('click', () => {
	if (chordListDemo) {
		const chords = ['Cmaj7', 'Dm7', 'Em7', 'Fmaj7', 'G7', 'Am7', 'Bm7b5'];
		chordListDemo.setAttribute('chords', JSON.stringify(chords));
	}
});

customChordsBtn?.addEventListener('click', () => {
	if (chordListDemo) {
		const chords = ['C', 'C7', 'Cm', 'Cmaj7', 'Cdim'];
		chordListDemo.setAttribute('chords', JSON.stringify(chords));
	}
});
