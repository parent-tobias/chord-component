// Entry point for demo bundling
import '../src/chord-diagram.js';
import '../src/chord-list.js';

// Single chord demo controls
const instrumentSelect = document.getElementById('instrument-select') as HTMLSelectElement;
const chordSelect = document.getElementById('chord-select') as HTMLSelectElement;
const singleChord = document.getElementById('single-chord');

function updateSingleChord() {
  if (singleChord && instrumentSelect && chordSelect) {
    singleChord.setAttribute('instrument', instrumentSelect.value);
    singleChord.setAttribute('chord', chordSelect.value);
  }
}

instrumentSelect?.addEventListener('change', updateSingleChord);
chordSelect?.addEventListener('change', updateSingleChord);

// Chord list demo controls
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
    const chords = instrument === 'Standard Guitar'
      ? ["C", "D", "E", "F", "G", "A", "Em", "Am", "Dm"]
      : ["C", "F", "G", "Am", "D", "Em", "A7", "D7", "G7"];
    chordListDemo.setAttribute('chords', JSON.stringify(chords));
  }
});

jazzChordsBtn?.addEventListener('click', () => {
  if (chordListDemo) {
    const chords = ["Cmaj7", "Dm7", "Em7", "Fmaj7", "G7", "Am7", "Bm7b5"];
    chordListDemo.setAttribute('chords', JSON.stringify(chords));
  }
});

customChordsBtn?.addEventListener('click', () => {
  if (chordListDemo) {
    const chords = ["C", "C7", "Cm", "Cmaj7", "Cdim"];
    chordListDemo.setAttribute('chords', JSON.stringify(chords));
  }
});
