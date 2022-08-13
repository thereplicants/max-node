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
let humanize = 0; // dynamic swing
let wave1 = 0; // for Duo Mode: First wave
let wave2 = 0; // for Duo Mode: Second wave

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

function setTuplet(number) {
  tuplet = number;
  console.log('`tuplet` set to ' + tuplet);

  const pulseTicks = Math.round(480/tuplet);

  this.outlet('pulse', pulseTicks);

  callBuildSequence();
};

const setMode = (index) => {
  mode = ["touch","asc","desc","sine","duo"][index];
  console.log('`mode` set to ' + mode);
  callBuildSequence();
};

const setHumanize = (number) => {
  humanize = number;
  console.log('`humanize` set to ' + number);
  callBuildSequence();
};

const setWave1 = (number) => {
  wave1 = number;
  console.log('`wave1` set to ' + number);
  callBuildSequence();
};

const setWave2 = (number) => {
  wave2 = number;
  console.log('`wave1` set to ' + number);
  callBuildSequence();
};


/* Max event handlers: */
const noteIn = (note, velocity) => {
  console.log("note in: ", note, velocity)
  if (velocity <= 0) {
    try {
      const index = heldNotes.indexOf(note);
      if (index !== -1) {
        heldNotes.splice(index, 1);
        heldVelos.splice(index, 1);
      }
      if (heldNotes.length === 0) {
        sequence = [];
        console.log("clearing sequence: ", sequence);
        return;
      }
    } catch(e) {
      console.log(e);
    }
  } else {
    heldNotes.push(note); // Most recent note is at end of array 
    heldVelos.push(velocity);   
  }

  callBuildSequence();
  console.log("sequence", sequence);
};

function mod(n, m) {
  return n % m;
}

function callBuildSequence() {
  sequence = buildSequence(heldNotes, meter, range, mode, wave1, wave2)
}

function _getHumanizedOffset() {
  const tempoInMs = 1 / TEMPO / tuplet * 60000;

  return Math.round(Math.random()*tempoInMs*(humanize / 100));
}

function bang() {
  console.log("meter:", meter, " range:", range, " notes:", heldNotes, " seq:", sequence);
  if (previousNote) this.outlet('note', ...[previousNote, 0]);
  if (sequence.length && heldVelos.length) {
    try {
      previousNote = sequence[sIndex];
      setTimeout(
        () => {
          this.outlet('note', ...[sequence[sIndex], heldVelos[sIndex % heldVelos.length]]);
        }, _getHumanizedOffset())
      sIndex = mod(++sIndex, meter); 
    } catch(e) {
      console.log(e);
    }    
  }
}

const setup = (maxApi) => {
  maxApi.addHandler('panic', panic);
  maxApi.addHandler('noteIn', (...args) => noteIn.apply(maxApi, args));
  maxApi.addHandler('setMeter', setMeter);
  maxApi.addHandler('setRange', setRange);
  maxApi.addHandler('setTuplet', (...args) => setTuplet.apply(maxApi, args));
  maxApi.addHandler('setMode', setMode);
  maxApi.addHandler('setHumanize', setHumanize);
  maxApi.addHandler('setWave1', setWave1);
  maxApi.addHandler('setWave2', setWave2);
  maxApi.addHandler('bang', () => bang.apply(maxApi));
  console.log('Successfully booted Node for Max project');
};

export { setup };
