/** Note: Octave designations are in scientific pitch notation. The MIDI
 * standard and equal temperament apply throughout. For example, c4 denotes
 * middle C, which is MIDI note 60 at 261.63 hertz. Applications like Ableton
 * may refer to the same note as c3 instead of c4.
 */

/** An array of the 12 note names from C through B (using uppercase letters and
 * sharps, e.g. "C#") */
export const noteNames = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
];

/** An object with note names as keys and the lowest available MIDI note numbers
 * as values
 */
export const lowestNotes = noteNames.reduce(
  (accumulator, currentValue, currentIndex) => {
    accumulator[currentValue] = currentIndex;
    return accumulator;
  },
  {},
);

/** Given a `noteName`, e.g. "C#", return the lowest available MIDI note, or -1
 * if `noteName` is invalid. */
function getLowestMidiNote(noteName) {
  return lowestNotes[noteName] ?? -1;
}

/** Given a `noteName`, e.g. "C#", and an octave, e.g. `4`, return the MIDI note
 * number. Defaults to the middle octave (4). */
export function getMidiNote(noteName = 'C', octave = 4) {
  const LOWEST_VALID_MIDI_NOTE = 0; // C-1
  const HIGHEST_VALID_MIDI_NOTE = 127; // G9

  return Math.min(
    Math.max(
      getLowestMidiNote(noteName) + (octave + 1) * 12,
      LOWEST_VALID_MIDI_NOTE,
    ),
    HIGHEST_VALID_MIDI_NOTE,
  );
}

/** Map of mode names to scale, represented as an array of 7 semitone
 * differences from the root note of the scale */
export const modes = {
  //// Diatonic heptatonic scales ////
  // Major (Ionian)
  ionian: [0, 2, 4, 5, 7, 9, 11], // W–W–H–W–W–W–H
  dorian: [0, 2, 3, 5, 7, 9, 10], // W–H–W–W–W–H–W
  phrygian: [0, 1, 3, 5, 7, 8, 10], // H–W–W–W–H–W–W
  lydian: [0, 2, 4, 6, 7, 9, 11], // W–W–W–H–W–W–H
  mixolydian: [0, 2, 4, 5, 7, 9, 10], // W–W–H–W–W–H–W
  // Natural minor (Aeolian)
  aeolian: [0, 2, 3, 5, 7, 8, 10], // W–H–W–W–H–W–W
  locrian: [0, 1, 3, 5, 6, 8, 10], // H–W–W–H–W–W–W

  //// Non-diatonic heptatonic cales ////
  // Harmonic minor (Aeolian ♯7)
  harmonic: [0, 2, 3, 5, 7, 8, 11], // W–H–W–W–H–Aug2nd–H
  // Ascending melodic minor aka Jazz minor (Ionian ♭3)
  melodic: [0, 2, 3, 5, 7, 9, 11], // W–H–W–W–W–W–H
};

/** Given the tonic note name and mode, return a scale, represented as an array
 * of 7 MIDI note numbers (the lowest consecutive sequence ) */
export function getScale(pitchClass = 'A', modeName = 'aeolian') {
  const tonic = getMidiNote(pitchClass, -1);

  return modes[modeName].map((interval) => tonic + interval);
}

/** Given a root note MIDI number, scale tonic note name, scale mode, and number of notes, return a chord, represented as an array of MIDI note numbers */
export function getChord(
  rootNote = 69,
  pitchClass = 'A',
  modeName = 'aeolian',
  chordShapeName = 'triad',
  /* `numberOfNotes` defaults to the number of notes in the chord shape, but can be decreased or increased to get more notes in higher octaves */
  numberOfNotesParam,
) {
  const scale = getScale(pitchClass, modeName);
  // `chordTemplates` are represented as in-scale intervals, not semitones, and
  // are 0-indexed, so a third is 2 and a fifth is 4 for example.
  const chordTemplates = {
    triad: [0, 2, 4],
    power: [0, 4, 7],
    seventh: [0, 2, 4, 6],
    ninth: [0, 2, 4, 6, 8],
  };
  const chordTemplate = chordTemplates[chordShapeName];
  const numberOfNotes = numberOfNotesParam
    ? numberOfNotesParam
    : chordTemplate.length;
  let chordShape = [];

  if (numberOfNotes === chordTemplate.length) {
    chordShape = chordTemplate;
  } else {
    // `numberOfNotes` can be less than or greater than number of notes in `chordTemplate`, in which case extra notes in higher octave are used
    for (let i = 0; i < numberOfNotes; i++) {
      // Offset is 0 when `numberOfNotes` <= number of notes in `chordTemplate`
      const octaveOffset = Math.floor(i / chordTemplate.length);
      const note = chordTemplate[i % chordTemplate.length] + 7 * octaveOffset;
      chordShape.push(note);
    }
  }

  const scaleOctaveOffset = Math.floor((rootNote - scale[0]) / 12);
  const shiftedScale = scale.map((note) => note + 12 * scaleOctaveOffset);
  const rootNoteIndexInShiftedScale = shiftedScale.indexOf(rootNote);
  const isRootNoteInKey = rootNoteIndexInShiftedScale !== -1;
  if (!isRootNoteInKey) return [];

  const chord = chordShape.map((chordShapeNote) => {
    const octaveOffset = Math.floor(
      (chordShapeNote + rootNoteIndexInShiftedScale) / 7,
    );
    const index =
      (((chordShapeNote + rootNoteIndexInShiftedScale) % 7) + 7) % 7;
    return shiftedScale[index] + 12 * octaveOffset;
  });

  return chord;
}
