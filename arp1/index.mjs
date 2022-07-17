// TODO: Trigger arp notes on beat even if transport isn't running
// 60000ms/120bpm = 500 ms per beat (quarter notes)
// y ms per beat = 60000 ms/x bpm

import { getChord } from './midi-tools.mjs';

const notes = []; // Store currently held notes
let arpNotes = []; // Arpeggiator notes to play
let previousNote;
let numberOfNotesParam = 8; // Number of notes for arpeggiator
let arpIndex = 0; // Current index in arp to play on next beat
let notesPerMeasureParam = 8;

const panic = () => {
  notes.length = 0;
};

const numberOfNotes = (number) => {
  // TODO: Allow changing number of notes while holding notes
  numberOfNotesParam = number;
  console.log('`numberOfNotes` set to ' + number);
};

const notesPerMeasure = (number) => {
  notesPerMeasureParam = number;
  console.log('`notesPerMeasure` set to ' + notesPerMeasureParam);
};

const noteIn = (note, velocity) => {
  if (velocity <= 0) {
    // For note off, remove note from notes array
    const index = notes.indexOf(note);
    if (index !== -1) notes.splice(index, 1);
    if (notes.length === 0) {
      // Clear arp notes if no notes are held
      arpNotes.length = 0;
      return;
    }
  } else {
    // For note on, add new notes to notes array
    notes.push(note); // Most recent note is at end of array
    arpIndex = 0; // Restart arp index
  }

  const mostRecentNote = notes[notes.length - 1];

  const pitchClass = 'A';
  const modeName = 'aeolian';
  const chordShapeName = 'triad';

  const extendedChord = getChord(
    mostRecentNote,
    pitchClass,
    modeName,
    chordShapeName,
    numberOfNotesParam,
  );

  arpNotes = extendedChord;
};

const mod = (n, m) => {
  return ((n % m) + m) % m;
};

function bang() {
  if (previousNote) this.outlet('note', ...[previousNote, 0]);
  previousNote = arpNotes[arpIndex];
  const note = arpNotes[arpIndex];
  if (note) this.outlet('note', ...[note, 127]);
  arpIndex = mod(++arpIndex, numberOfNotesParam);
}

const setup = (maxApi) => {
  maxApi.addHandler('panic', panic);
  maxApi.addHandler('noteIn', (...args) => noteIn.apply(maxApi, args));
  maxApi.addHandler('numberOfNotes', numberOfNotes);
  maxApi.addHandler('notesPerMeasure', notesPerMeasure);
  maxApi.addHandler('bang', () => bang.apply(maxApi));
  console.log('Successfully booted Node for Max project');
};

export { setup };
