
import { parseChord, CHORD_INTERVALS } from './src/core/theory/index';

const testChords = ['Cmaj7', 'G7'];

console.log("Testing Chord Parsing:");
console.log("Is maj7 in CHORD_INTERVALS?", 'maj7' in CHORD_INTERVALS);
console.log("Keys starting with m:", Object.keys(CHORD_INTERVALS).filter(k => k.startsWith('m')));

testChords.forEach(chord => {
    const parsed = parseChord(chord);
    console.log(`${chord} -> Root: ${parsed.root}, Quality: ${parsed.quality}`);
});
