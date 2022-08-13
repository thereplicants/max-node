/*
Build Sequence
 - will take an array of midi note integers NOTES
 - and return an array of midi note integers
 - of length METER
 - and maximum intervalic range RANGE
*/

// CONSTANTS:
const MAX_PIANO_RANGE = 127;

function _assembleTouch(notes) {
    return notes;
};

function _assembleAsc(notes) {
    let newList = JSON.parse(JSON.stringify(notes));
    return newList.sort();
};

function _assembleDesc(notes) {
    console.log("creating desc from ", notes);
    let newList = JSON.parse(JSON.stringify(notes));
    return newList.sort((a,b) => b - a);
};

function __getSineIndex(x, width, period) {
    const P = period;
    const A = (width - 1) / 2;
    const phase = 0; 
    const vert = A;
    const factor = Math.PI / (0.5 * P);

    console.log("assmble Sine: ", P, A, factor);
    return Math.floor(A * Math.sin(factor * x - phase) + vert)
}

function _assembleSine(notes, meter) {
    let toReturn = Array(meter);
    for (let i = 0; i < meter; i++) {
        let j = __getSineNotes(i, notes.length, meter); 
        toReturn[i] = notes[j];
    };
    console.log("Sine Sequece: ", toReturn);
    return toReturn;
};

function __getDuosineIndex(x, width, period, waveL, waveS) {
    const P = period;
    const A = (width - 1) / 2;
    const phase = 0; 
    const vert = A;
    const factorBase = Math.PI / (0.5 * P);
    const waveRatio = waveL / waveS;
    const factorApplied = (Math.PI * waveRatio) / (0.5 * P);

    console.log("Duosine: ", factorBase, factorApplied);

    const toReturn = Math.floor(Math.floor(A / 2) * ( Math.sin(factorBase * x - phase) + Math.sin(factorApplied * x - phase) ) + vert)
    console.log(toReturn);
    return toReturn;
}

function _assembleDuosine(notes, meter, wave1, wave2) {
    let toReturn = Array(meter);
    for (let i = 0; i < meter; i++) {
        let j = __getDuosineIndex(i, notes.length, meter, wave1, wave2); 
        toReturn[i] = notes[j];
    };
    console.log("Duosine Sequece: ", toReturn);
    return toReturn;
};

// takes the held notes and lists out all possible notes the sequencer can choose from. 
function _createAllPossibleList(notes, mode, range) {
    console.log("createPossibleList: ", notes, mode, range);
    let newNotes = new Array(range);
    if (mode !== "touch") {
        notes = notes.sort(function(a,b) { return parseInt(a) - parseInt(b) });
    }
    for (let i = 0; i < range; i++) {
        const octaveOffset = 12*(Math.floor(i / notes.length)); 
        newNotes[i] = notes[i % notes.length] + octaveOffset;
        while (newNotes[i] > MAX_PIANO_RANGE) {
            newNotes[i] = newNotes[i] - 127;
        }
    }
    if (mode !== "touch") {
        newNotes = newNotes.sort(function(a,b) { return parseInt(a) - parseInt(b) });
    }
    return newNotes;
}

function _createSequence(allPossibleNotes, meter, mode, wave1, wave2) {
    console.log("creating sequence with", allPossibleNotes, meter, mode, wave1, wave2);
    switch(mode) {
        case "touch": return _assembleTouch(allPossibleNotes, meter);
        case "asc": return _assembleAsc(allPossibleNotes, meter);
        case "desc": return _assembleDesc(allPossibleNotes, meter);
        case "sine": return _assembleSine(allPossibleNotes, meter);
        case "duo": return _assembleDuosine(allPossibleNotes, meter, wave1, wave2);  
    }
}

export function buildSequence(notes, meter, range, mode, wave1, wave2) {
    try {
        console.log("buildSequence with ", notes, meter, range, mode, wave1, wave2);
        const toReturn =  _createSequence(_createAllPossibleList(notes, mode, range), meter, mode, wave1, wave2);
        console.log("buildSequence returns: ", toReturn);
        return toReturn;
    } catch (e) {
        return notes;
    }
}
