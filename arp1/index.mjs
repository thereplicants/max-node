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
let tuplet = 0.5; // length of a note, or how quickly the cycle moves
let mode = "touch" // shape of sequence. enum: touch, asc, desc, sine, duo
let wave1 = 100; // for Duo Mode: First wave
let wave2 = 100; // for Duo Mode: Second wave
let phase1 = 1; // either sine mode: horizontal displacement
let phase2 = 1; // either sine mode: horizontal displacement

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
  console.log('`meter` set to ' + number);
  callBuildSequence();
};

const setRange = (number) => {
  range = number;
  console.log('`range` set to ' + number);
  callBuildSequence();
};

function setTuplet(float) {
  console.log(float);
  if (float === 0) {
    tuplet = 0.5;
  }
  else {
    tuplet = float;
  }
  console.log('`tuplet` set to ' + tuplet);

  callBuildSequence();
  setPulse(this);
};

const setMode = (index) => {
  mode = ["duo","asc","desc","sine"][index];
  console.log('`mode` set to ' + mode);
  callBuildSequence();
};

const setWave1 = (number) => {
  console.log('`wave1` set to ' + number);
  wave1 = number
  callBuildSequence();
};

const setWave2 = (number) => {
  console.log('`wave2` set to ' + number);
  wave2 = number;
  callBuildSequence();
};

const setPhase1 = (number) => {
  console.log('`phase1` set to ' + number);
  phase1 = number;
  callBuildSequence();
};

const setPhase2 = (number) => {
  console.log('`phase2` set to ' + number);
  phase2 = number;
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
  // console.log("call build sequence", heldNotes.length);
  if (heldNotes.length) {
    sequence = buildSequence(heldNotes, meter, range, mode, wave1, wave2, phase1, phase2)
  }
}

function setPulse(maxApi) {
  const pulseTicks = Math.round(480/tuplet);
  console.log("PULSE SET", pulseTicks);
  maxApi.outlet('pulse', pulseTicks);
}

function bang() {
  let plotSequence = JSON.parse(JSON.stringify(sequence));
  
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

function resetArp() {
  heldNotes = []; // what the user is pressing down now
  heldVelos = []; // save the velocities and loop through them
  sequence = []; // this is what will play, in order
  sIndex = 0; // the currently playing note in the sequence
  previousNote = null; // value of the note
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
  maxApi.addHandler('setPhase1', (...args) => setPhase1.apply(maxApi, args));
  maxApi.addHandler('setPhase2', (...args) => setPhase2.apply(maxApi, args));
  maxApi.addHandler('bang', () => bang.apply(maxApi));
  maxApi.addHandler('loadbang', () => {console.log("LOADBUNGGG")})
  maxApi.addHandler('resetArp', () => resetArp.apply(maxApi, args));
  console.log('Successfully booted Node for Max project, init values:', meter, range, tuplet, phase1, wave1);
};

export { setup };
