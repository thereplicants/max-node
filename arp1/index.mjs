// TODO: Trigger arp notes on beat even if transport isn't running
// 60000ms/120bpm = 500 ms per beat (quarter notes)
// y ms per beat = 60000 ms/x bpm

import { getChord } from './midi-tools.mjs';

/* CONFIG: */
let meter = 8; // number of beats in a cycle
let duration = 4; // length of a note, or how quickly the cycle moves

const heldNotes = []; // what the user is pressing down now
const heldVelos = []; // save the velocities and loop through them
const sequence = []; // this is what will play, in order
let sIndex = 0; // the currently playing note in the sequence
let previousNote; // value of the note

const panic = () => {
  notes.length = 0;
};

const setMeter = (number) => {
  // TODO: Allow changing number of notes while holding notes
  meter = number;
  console.log('`meter` set to ' + number);
};

const setDuration = (number) => {
  duration = number;
  console.log('`duration` set to ' + durationParam);
};

const noteIn = (note, velocity) => {
  console.log("note in: ", note, velocity)
  if (velocity <= 0) {
    // For note off, remove note from heldNotes array
    try {
      const index = heldNotes.indexOf(note);
      if (index !== -1) {
        heldNotes.splice(index, 1);
        heldVelos.splice(index, 1);
      }
      if (heldNotes.length === 0) {
        // Clear arp notes if no notes are held
        sequence = [];
        console.log("clearing sequence: ", sequence);
        return;
      }
    } catch(e) {
      console.log(e);
    }
  } else {
    // For note on, add new notes to notes array
    heldNotes.push(note); // Most recent note is at end of array 
    heldVelos.push(velocity);   
  }

  // Build sequence array
  for (let i = 0; i < meter; i++) {
    sequence[i] = heldNotes[i % heldNotes.length]
  }
  console.log("sequence",sequence);
};

const mod = (n, m) => {
  return ((n % m) + m) % m;
};

function bang() {
  if (previousNote) this.outlet('note', ...[previousNote, 0]);
  try {
    previousNote = sequence[sIndex];
    console.log("HeldNotes", heldNotes)
    console.log("Held Velos", heldVelos)
    this.outlet('note', ...[sequence[sIndex], heldVelos[sIndex % heldVelos.length]]);
    sIndex = mod(++sIndex, meter);
  } catch(e) {
    console.log(e);
  }

}

const setup = (maxApi) => {
  maxApi.addHandler('panic', panic);
  maxApi.addHandler('noteIn', (...args) => noteIn.apply(maxApi, args));
  maxApi.addHandler('setMeter', setMeter);
  maxApi.addHandler('setDuration', setDuration);
  maxApi.addHandler('bang', () => bang.apply(maxApi));
  console.log('Successfully booted Node for Max project');
};

export { setup };
