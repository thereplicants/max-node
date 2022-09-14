// TODO: Trigger arp notes on beat even if transport isn't running
// 60000ms/120bpm = 500 ms per beat (quarter notes)
// y ms per beat = 60000 ms/x bpm

import { getChord } from './tools/midi-tools.mjs';
import { buildSequence } from './tools/sequencer.mjs';

// GLOBALS
const TEMPO = 93;

/* Input: */
let meter = 1; // number of beats in a cycle
let range = 1; // the number of notes above the root that a sequence can ascend
let tuplet = 1; // length of a note, or how quickly the cycle moves
let mode = "touch" // shape of sequence. enum: touch, asc, desc, sine, duo
let wave1 = 0; // for Duo Mode: First wave
let wave2 = 0; // for Duo Mode: Second wave
let phase = 0; // either sine mode: horizontal displacement

/* State: */
let heldNotes = []; // what the user is pressing down now
let heldVelos = []; // save the velocities and loop through them
let sequence = []; // this is what will play, in order
let sIndex = 0; // the currently playing note in the sequence
let previousNote; // value of the note

const panic = () => {
  notes.length = 0;
};

/* onInput: */
const setMeter = (number) => {
  meter = number;
  // console.log('`meter` set to ' + number);
  callBuildSequence();
};

const setRange = (number) => {
  range = number;
  // console.log('`range` set to ' + number);
  callBuildSequence();
};

function setTuplet(number) {
  tuplet = number;
  // console.log('`tuplet` set to ' + tuplet);

  callBuildSequence();
  setPulse(this);
};

const setMode = (index) => {
  mode = ["touch","asc","desc","sine","duo"][index];
  callBuildSequence();
};

const setWave1 = (number) => {
  wave1 = number
  callBuildSequence();
};

const setWave2 = (number) => {
  wave2 = number;
  callBuildSequence();
};

const setPhase = (number) => {
  phase = number;
  callBuildSequence();
};

/* Max event handlers: */
const noteIn = (note, velocity) => {
  // console.log("note in: ", note, velocity)
  if (velocity <= 0) {
    try {
      const index = heldNotes.indexOf(note);
      if (index !== -1) {
        heldNotes.splice(index, 1);
        heldVelos.splice(index, 1);
      }
      if (heldNotes.length === 0) {
        sequence = [];
        // console.log("clearing sequence: ", sequence);
        return;
      }
    } catch(e) {
      console.log(e);
    }
  } else {
    heldNotes.push(note); // Most recent note is at end of array 
    heldVelos.push(Math.max(velocity, 70));   
  }

  callBuildSequence();
  // console.log("sequence", sequence);
};

function mod(n, m) {
  return n % m;
}

function callBuildSequence() {
  console.log("call build sequence", heldNotes.length);
  if (heldNotes.length) {
    sequence = buildSequence(heldNotes, meter, range, mode, wave1, wave2, phase)
  }
}

function setPulse(maxApi) {
  const pulseTicks = Math.round(480/tuplet);
  console.log("PULSE SET", pulseTicks);
  maxApi.outlet('pulse', pulseTicks);
}

function bang() {
  let plotSequence = JSON.parse(JSON.stringify(sequence));
  try {
    this.getDict("parameters")
        .then((dict) => {
          meter = dict.setMeter;
          range = dict.setRange;
          tuplet = dict.setTuplet;
          mode = dict.setMode;
          wave1 = dict.setWave1;
          wave2 = dict.setWave2;
          phase = dict.setPhase; 
          console.log("from dict: ", meter, range, tuplet, mode, wave1, wave2, phase);
        })
        .catch(() => {});
  } catch (e) {
    console.log(e);
  }
  callBuildSequence();
  
  this.outlet('plot', ...plotSequence);
  if (previousNote) this.outlet('note', ...[previousNote, 0]);
  if (sequence.length && heldVelos.length) {
    try {
      previousNote = sequence[sIndex];
      this.outlet('note', ...[sequence[sIndex], heldVelos[sIndex % heldVelos.length]]);
      sIndex = mod(++sIndex, meter); 
    } catch(e) {
      console.log(e);
    }    
  }
}

const setup = (maxApi) => {
  maxApi.addHandler('panic', (...args) => panic.apply(maxApi, args));
  maxApi.addHandler('noteIn', (...args) => noteIn.apply(maxApi, args));
  maxApi.addHandler('setMeter', (...args) => setMeter.apply(maxApi, args));
  maxApi.addHandler('setRange', (...args) => setRange.apply(maxApi, args));
  maxApi.addHandler('setTempo', (...args) => setTempo.apply(maxApi, args));
  maxApi.addHandler('setTuplet', (...args) => setTuplet.apply(maxApi, args));
  maxApi.addHandler('setMode', (...args) => setMode.apply(maxApi, args));
  maxApi.addHandler('setWave1', (...args) => setWave1.apply(maxApi, args));
  maxApi.addHandler('setWave2', (...args) => setWave2.apply(maxApi, args));
  maxApi.addHandler('setPhase', (...args) => setPhase.apply(maxApi, args));
  maxApi.addHandler('bang', () => bang.apply(maxApi));
  console.log('Successfully booted Node for Max project');
};

export { setup };
