/*
Build Sequence
 - will take an array of midi note integers NOTES
 - and return an array of midi note integers
 - of length METER
 - and maximum intervalic range RANGE
*/

// CONSTANTS:
const MAX_PIANO_RANGE = 127;

function _assembleTouch(notes, meter) {
    // being repurposed to Glass 
    return _assembleAsc(notes, meter);
};

function _assembleAsc(notes, meter) {
    let newList = [];
    for (let i = 0; i < meter; i++) {
        newList[i] = notes[ i % notes.length ]
    }
    return newList;
};

function _assembleDesc(notes, meter) {
    console.log("creating desc from ", notes);
    let newList = [];
    notes = notes.sort((a,b) => b - a)
    for (let i = 0; i < meter; i++) {
        newList[i] = notes[ i % notes.length ]
    }
    return newList;
};

function __getSineIndex(x, width, period, phase1) {
    const P = period;
    const A = (width - 1) / 2;
    const vert = A;
    const factor = Math.PI / (0.5 * P);

    console.log("assmble Sine: ", P, A, factor);
    return Math.floor(A * Math.sin(factor * x - (phase1*0.5)) + vert) 
}

function _assembleSine(notes, meter, phase1) {
    let toReturn = Array(meter);
    for (let i = 0; i < meter; i++) {
        let j = __getSineIndex(i, notes.length, meter, phase1); 
        if (j < 0) {
            j = notes.length - j;
            toReturn[i] = notes[j];
        }
        toReturn[i] = notes[j];
    };
    console.log("Sine Sequece: ", toReturn);
    return toReturn;
};

function __getDuosineIndex(x, width, period, wave1, wave2, phase1, phase2) {
    // phases are 0 to 255, scale it 0 to period
    const phaseShift1 = Math.round(period * phase1 * 25 / 255);
    const phaseShift2 = Math.round(period * phase2 * 25 / 255);

    const waveA = width/4 * Math.sin((2 * Math.PI * 500/wave1 * x - phaseShift1)/period) + width/4;
    const waveB = width/4 * Math.sin((2 * Math.PI * 500/wave2 * x - phaseShift2)/period) + width/4;

    return Math.floor(waveA + waveB); 
}

function _assembleDuosine(notes, meter, wave1, wave2, phase1, phase2) {
    let toReturn = Array(meter);
    for (let i = 0; i < meter; i++) {
        let j = __getDuosineIndex(i, notes.length, meter, wave1, wave2, phase1, phase2); 
        if (j < 0) j = 0;
        if (j >= notes.length) j = notes.length - 1
        toReturn[i] = notes[j];
    };
    return toReturn;
};

function __expandNotes(notes, range) {
    let newNotes = JSON.parse(JSON.stringify(notes));
    // let i = newNotes.length;
    // console.log("expand notes ", notes, range)
    while (newNotes.length < range) {
        let i = newNotes.length;
        let candidate = 0;
        while (candidate <= newNotes[newNotes.length - 1]) {
            let octaveShift = 12*(Math.floor(i / notes.length));
            candidate = notes[i % notes.length] + octaveShift;
            i++;
        }
        while (candidate > 120) {
            candidate = candidate - notes[0];
        }
        newNotes.push(candidate);
    }
    return newNotes.sort(function(a,b) { return a - b });
}

// takes the held notes and lists out all possible notes the sequencer can choose from. 
function _createAllPossibleList(notes, mode, range) {
    let newNotes = new Array(range);
    if (mode !== "touch") {
        notes = notes.sort(function(a,b) { return parseInt(a) - parseInt(b) });
    }
    newNotes = __expandNotes(notes, range);
    // console.log("expanded", newNotes);
    if (mode !== "touch") {
        newNotes = newNotes.sort(function(a,b) { return parseInt(a) - parseInt(b) });
    }
    return newNotes;
}

function _createSequence(allPossibleNotes, meter, mode, wave1, wave2, phase1, phase2) {
    switch(mode) {
        case "touch": return _assembleTouch(allPossibleNotes, meter);
        case "asc": return _assembleAsc(allPossibleNotes, meter);
        case "desc": return _assembleDesc(allPossibleNotes, meter);
        case "sine": return _assembleSine(allPossibleNotes, meter, phase1);
        case "duo": return _assembleDuosine(allPossibleNotes, meter, wave1, wave2, phase1, phase2);  
    }
}

export function buildSequence(notes, meter, range, mode, wave1, wave2, phase1, phase2) {
    try {
        // console.log("buildSequence with ", notes, meter, range, mode, wave1, wave2, phase);
        const toReturn =  _createSequence(_createAllPossibleList(notes, mode, range), meter, mode, wave1, wave2, phase1, phase2);
        // console.log("buildSequence returns: ", toReturn);
        return toReturn;
    } catch (e) {
        return notes;
    }
}
