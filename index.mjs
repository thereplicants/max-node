import { getChord } from './midi-tools.mjs';

const notes = {};

const panic = () => {
  for (const note in notes) {
    delete notes[note];
  }
  console.log(`Cleared notes`);
};

const noteIn = (note, velocity) => {
  // if (velocity <= 0) {
  //   delete notes[note];
  // } else {
  //   notes[note] = velocity;
  // }
  // const chord = Object.keys(notes);
  // console.log(`chord: ${JSON.stringify(chord)}`);

  if (velocity <= 0) return;

  const pitchClass = 'A';
  const modeName = 'aeolian';
  const chordShapeName = 'triad';
  const numberOfNotesParam = 8;
  const extendedChord = getChord(
    note,
    pitchClass,
    modeName,
    chordShapeName,
    numberOfNotesParam,
  );

  console.log(`extendedChord: ${JSON.stringify(extendedChord)}`);

  // const namedNotes = midiNotes.map(tonal.Note.fromMidi);
  // const chords = Detect.chord(namedNotes);
  // if (chords && chords.length > 0) {
  //   maxApi.outlet('chords', ...chords);
  // } else {
  //   maxApi.outlet('chords', 'unknown');
  // }
};

const setup = (maxApi) => {
  console.log('hello world');
  maxApi.addHandler('panic', (...args) => panic.apply(maxApi, args));
  maxApi.addHandler('noteIn', (...args) => noteIn.apply(maxApi, args));
};

export { setup };
