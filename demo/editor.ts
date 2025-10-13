// Entry point for editor page bundling
import '../src/chord-editor.js';
import '../src/chord-diagram.js';
import { chordDataService } from '../src/chord-data-service.js';

const instrumentSelect = document.getElementById('instrument-select') as HTMLSelectElement;
const chordInput = document.getElementById('chord-input') as HTMLInputElement;
const loadBtn = document.getElementById('load-btn');
const chordEditor = document.getElementById('chord-editor');
const previewDiagram = document.getElementById('preview-diagram');
const refreshListBtn = document.getElementById('refresh-list-btn');
const clearAllBtn = document.getElementById('clear-all-btn');
const userChordsContainer = document.getElementById('user-chords-container');

// Load chord in editor
function loadChord() {
  const instrument = instrumentSelect.value;
  const chord = chordInput.value.trim();

  if (!chord) {
    alert('Please enter a chord name');
    return;
  }

  chordEditor?.setAttribute('instrument', instrument);
  chordEditor?.setAttribute('chord', chord);
  previewDiagram?.setAttribute('instrument', instrument);
  previewDiagram?.setAttribute('chord', chord);
}

loadBtn?.addEventListener('click', loadChord);
chordInput?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    loadChord();
  }
});

// Listen for chord saved event
chordEditor?.addEventListener('chord-saved', async (e: any) => {
  console.log('Chord saved:', e.detail);

  // Show success message
  const alert = document.createElement('div');
  alert.className = 'alert success';
  alert.innerHTML = `<strong>Saved!</strong> ${e.detail.chord} on ${e.detail.instrument} has been saved.`;
  document.querySelector('.container')?.insertBefore(alert, document.querySelector('h2'));

  setTimeout(() => alert.remove(), 3000);

  // Refresh the list
  await loadUserChords();

  // Update preview
  (previewDiagram as any)?.requestUpdate();
});

// Listen for chord reset event
chordEditor?.addEventListener('chord-reset', async (e: any) => {
  console.log('Chord reset:', e.detail);
  await loadUserChords();
  (previewDiagram as any)?.requestUpdate();
});

// Load and display user chords
async function loadUserChords() {
  if (!userChordsContainer) return;

  try {
    const userChords = await chordDataService.getAllUserChords();

    if (userChords.length === 0) {
      userChordsContainer.innerHTML = '<div class="empty-state">No custom chords saved yet. Create one using the editor above!</div>';
      return;
    }

    userChordsContainer.innerHTML = userChords.map(({ instrument, chordName, data }) => `
      <div class="user-chord-item">
        <div class="user-chord-info">
          <span class="user-chord-name">${chordName}</span>
          <span class="user-chord-instrument">${instrument}</span>
        </div>
        <div>
          <button class="load-user-chord" data-instrument="${instrument}" data-chord="${chordName}">
            Load
          </button>
        </div>
      </div>
    `).join('');

    // Add event listeners to load buttons
    document.querySelectorAll('.load-user-chord').forEach(btn => {
      btn.addEventListener('click', () => {
        const instrument = (btn as HTMLElement).dataset.instrument!;
        const chord = (btn as HTMLElement).dataset.chord!;
        instrumentSelect.value = instrument;
        chordInput.value = chord;
        loadChord();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  } catch (error) {
    console.error('Failed to load user chords:', error);
    userChordsContainer.innerHTML = '<div class="empty-state">Error loading custom chords</div>';
  }
}

// Refresh list button
refreshListBtn?.addEventListener('click', loadUserChords);

// Clear all button
clearAllBtn?.addEventListener('click', async () => {
  if (!confirm('Are you sure you want to delete ALL custom chords? This cannot be undone.')) {
    return;
  }

  try {
    await chordDataService.clearUserChords();
    await loadUserChords();
    alert('All custom chords have been cleared.');
  } catch (error) {
    console.error('Failed to clear chords:', error);
    alert('Error clearing custom chords. Please try again.');
  }
});

// Initial load
loadUserChords();
