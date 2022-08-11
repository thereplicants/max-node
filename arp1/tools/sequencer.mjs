/*
Build Sequence
 - will take an array of midi note integers NOTES
 - and return an array of midi note integers
 - of length METER
 - and maximum intervalic range RANGE
*/

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

function _assembleSine() {
    console.log("sine")
};

function _assembleDuosine(wave1, wave2) {
    console.log(wave1, wave2);
};

function _createAllPossibleList(notes, meter, range) {
    console.log("createPossibleList: ", notes, meter, range);
    let newNotes = new Array(meter);
    for (let i = 0; i < meter; i++) {
        newNotes[i] = notes[i % notes.length] + 12*(Math.floor(i / notes.length));
        newNotes[i] = newNotes[i] - 12*(Math.floor(i / range));
    }
    return newNotes;
}

function _createSequence(notes, mode, wave1, wave2) {
    console.log("creating sequence with", notes, mode, wave1, wave2);
    switch(mode) {
        case "touch": return _assembleTouch(notes);
        case "asc": return _assembleAsc(notes);
        case "desc": return _assembleDesc(notes);
        case "sine": return _assembleSine(notes);
        case "duo": return _assembleDuosine(notes, wave1, wave2);  
    }
}

export function buildSequence(notes, meter, range, mode, wave1, wave2) {
    try {
        console.log("buildSequence with ", notes, meter, range, mode, wave1, wave2);
        const toReturn =  _createSequence(_createAllPossibleList(notes, meter, range),
                                          mode, wave1, wave2);
        console.log("buildSequence returns: ", toReturn);
        return toReturn;
    } catch (e) {
        return notes;
    }
}
