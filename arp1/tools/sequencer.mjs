/*
Build Sequence
 - will take an array of midi note integers NOTES
 - and return an array of midi note integers
 - of length METER
 - and maximum intervalic range RANGE
*/
// import { Note } from "@tonaljs/tonal";

let allPossibleNotes = [];
let sequence = [];


function _assembleTouch() {
    return allPossibleNotes;
};

function _assembleAsc() {
    let newList = {...allPossibleNotes};
    return newList.sort();
};

function _assembleDesc() {
    let newList = {...allPossibleNotes};
    return newList.sort((a,b) => b - a);
};

function _assembleSine() {

};

function _assembleDuosine(wave1, wave2) {
    console.log(wave1, wave2);
};

function _createAllPossibleList(notes, meter, range) {
    console.log(notes, meter, range);
    allPossibleNotes = new Array(meter);
    for (let i = 0; i < meter; i++) {
        allPossibleNotes[i] = notes[i % notes.length] + 12*(Math.floor(i / notes.length));
    }
    return allPossibleNotes;
}

function _createSequence(mode, wave1, wave2) {
    console.log(mode, wave1, wave2);
    switch(mode) {
        case "touch": 
            _assembleTouch();
            break;
        case "asc":
            _assembleAsc();
            break;
        case "desc":
            _assembleDesc();
            break;
        case "sine":
            _assembleSine();
            break;
        case "duo":
            _assembleDuosine(wave1, wave2);
            break;    
    }
}

export function buildSequence(notes, meter, range, mode, wave1, wave2) {
    try {
        console.log(notes, meter, range, mode, wave1, wave2);
        sequence = new Array(meter);
        _createAllPossibleList(notes, meter, range);
        return _createSequence(mode, wave1, wave2);
    } catch (e) {
        return notes;
    }
}
