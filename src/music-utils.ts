import type { Finger } from 'svguitar';

export type MuKey = {
	key: string
	accidental: string
	relativeMinor: string
}

export type MuChord = {
	variant: string
	tones: number[]
}

export type MuScale = {
	variant: string
	tones: number[]
}

export type MuChordsByScale = {
	variant: string
	chords: string[]
}

export type MuInstrument = {
	name: string
	strings: string[]
	frets: number
}

export type MuChordDescriptor = {
	key: string
	chord: string
	alt: string 
}

export const keys: MuKey[] = [
  {key: "A", accidental: "#", relativeMinor: 'F#'},
  {key: "A#", accidental: "#", relativeMinor: 'G'},
  {key: "Bb", accidental: 'b', relativeMinor: 'G'},
  {key: "B", accidental: "#", relativeMinor: 'G#'},
  {key: "C", accidental: "b", relativeMinor: 'A'},
  {key: "C#", accidental: "#", relativeMinor: 'A#'},
  {key: "Db", accidental: "b", relativeMinor: 'Bb'},
  {key: "D", accidental: "#", relativeMinor: 'B'},
  {key: "D#", accidental: "#", relativeMinor: 'C'},
  {key: "Eb", accidental: "b", relativeMinor: 'C'},
  {key: "E", accidental: "#", relativeMinor: 'C#'},
  {key: "F", accidental: "b", relativeMinor: 'D'},
  {key: "F#", accidental: "#", relativeMinor: 'D#'},
  {key: "Gb", accidental: "b", relativeMinor: 'Eb'},
  {key: "G", accidental: "#", relativeMinor: 'E'},
  {key: "G#", accidental: "#", relativeMinor: 'F'},
  {key: "Ab", accidental: "b", relativeMinor: 'F'}
];

export const notes: string[][] = [
  ["A"],
  ["A#", "Bb"],
  ["B"],
  ["C"],
  ["C#", "Db"],
  ["D"],
  ["D#", "Eb"],
  ["E"],
  ["F"],
  ["F#", "Gb"],
  ["G"],
  ["G#", "Ab"]
];

export const chords: MuChord[] = [
  { variant: "maj",  tones: [0, 4, 7] },
  { variant: "m",    tones: [0, 3, 7]},
  { variant: "min",  tones: [0, 3, 7] },
  { variant: "dim",  tones: [0, 3, 6] },
  { variant: "aug",  tones: [0, 4, 8] },
  { variant: "7",    tones: [0, 4, 7, 10]},
  { variant: "m7",   tones: [0, 3, 7, 10]},
  { variant: "maj7", tones: [0, 4, 7, 11]},
  { variant: "aug7", tones: [0, 4, 8, 10]},
  { variant: "dim7", tones: [0, 3, 6, 9]},
  { variant: "m7b5", tones: [0, 3, 6, 10]},
  { variant: "mMaj7",tones: [0, 3, 7, 11]},
  { variant: "sus2", tones: [0, 2, 7]},
  { variant: "sus4", tones: [0, 5, 7]},
  { variant: "7sus2",tones: [0, 2, 7, 10]},
  { variant: "7sus4",tones: [0, 5, 7, 10]},
  { variant: "9",    tones: [0, 4, 7, 10, 14]},
  { variant: "m9",   tones: [0, 3, 7, 10, 14]},
  { variant: "maj9", tones: [0, 4, 7, 11, 14]},
  { variant: "11",   tones: [0, 4, 7, 10, 14, 17]},
  { variant: "m11",  tones: [0, 3, 7, 10, 14, 17]},
  { variant: "13",   tones: [0, 4, 7, 10, 14, 17, 21]},
  { variant: "m13",  tones: [0, 3, 7, 10, 14, 17, 21]},
  { variant: "5",    tones: [0, 7]},
  { variant: "6",    tones: [0, 4, 7, 9]},
  { variant: "m6",   tones: [0, 3, 7, 9]},
  { variant: "add9", tones: [0, 4, 7, 14]},
  { variant: "mAdd9", tones: [0, 3, 7, 14]}
];

export const scales: MuScale[] = [
  { variant: "major", tones: [0, 2, 4, 5, 7, 9, 11] },
  { variant: "minor", tones: [0, 2, 3, 5, 7, 8, 10] },
  { variant: "major pentatonic", tones: [0, 2, 4, 7, 9] },
  { variant: "minor pentatonic", tones: [0, 3, 5, 7, 10] },
  { variant: "blues", tones: [0, 3, 5, 6, 7, 10] }
];

export const chordsPerScale: MuChordsByScale[] = [
  {variant: 'major', chords: ['maj','min','min','maj','maj','min','dim']},
  {variant: 'minor', chords: ['min','dim','maj','min','min','maj','maj']}
]

export const instruments: MuInstrument[] = [
  { name: 'Standard Ukulele', strings: ["G","C","E","A"], frets: 19},
  { name: 'Baritone Ukulele', strings: ["D","G","B","E"], frets: 19},
  { name: '5ths tuned Ukulele', strings: ["C","G","D","A"], frets: 19},
  { name: 'Standard Guitar', strings: ["E","A","D","G","B","E"], frets: 15},
  { name: 'Drop-D Guitar', strings: ["D","A","D","G","B","E"], frets: 15},
  { name: 'Standard Mandolin', strings: ["G","D","A","E"], frets: 20}
];

const keyChordRegex = /\[([A-Ga-g](?:#|b)?)(m|min|maj|aug|dim|7|m7|maj7|aug7|dim7|m7b5|mMaj7|sus2|sus4|7sus2|7sus4|9|m9|maj9|11|m11|13|m13|5|6|m6|add9|mAdd9)?(-[a-zA-Z0-9]*)?\]/gm;

/**
 * parseChords()
 * - Given a chordpro song file, we will have any number of [chordName] symbols
 *   inline.This function will give us a Map containing each of the unique
 *   instances of those chords.
 */
export const parseChords = (string:string):Map<string,MuChordDescriptor>=>{
  const chordMap = new Map();
  // turn the `matchAll` set into an actual array
  [...string.matchAll(keyChordRegex)]
  // the result of each match, I want the three capture groups:
  // key = the A-G with b or # (or none for a natural)
  // chord = the variant chord in that key
  // alt = some notation, might be '-alt', might be '-v2'
  .forEach(([, key, chord, alt])=>{
    // add an entry to the Map - the key being the original "Am7-alt" or "Gbadd9" 
    chordMap.set(`${key}${chord ? chord : ''}${alt ? alt: ''}`, {key, chord, alt})
  })
  return chordMap;
}

/**
 * chordOnInstrument()()
 * - Given an instrument object (defined in the instruments array above), and a keychord
 *   (in this case, the actual notes in the chord as in `['A','C#','E']), we find the first
 *   instance of a chord note on each string. 
 * - to be done: At this point, there is no "weighting". We are getting the first note in
 *   in the chord on a given string, which may or may not define the complete chord. How to
 *   weight for completeness?
 */
export const chordOnInstrument = (instrument:MuInstrument | undefined) =>
  (chord: {notes:string[]|undefined }|undefined):Finger[]|undefined => {
    if(!instrument || !chord ) return;
    
    const {strings} = instrument;
    return [...strings].reverse().map((note, index)=>{
      let fret = 0;
      let baseIndex = findBase(note);
      let noteNames = notes[baseIndex];
      while(noteNames.every(noteName=>!chord?.notes?.includes(noteName))){
        ++fret;
        noteNames = notes[(fret+baseIndex)%notes.length];
      }
      return [index+1, fret]
    })
}

/**
 * Quick way of indexing a given note to a scale index. Thus `C` returns 3, while
 * both `C#` and `Db` return 4. 
 */
export const findBase = (note:string):number=>notes.findIndex((tone)=> tone.includes(note) )

export const chordToNotes = (chordName:string):{name: string, notes: string[]|undefined} => {  
  const chordData = Array.from(parseChords(`[${chordName}]`));

  if(!chordData || !chordData.length) return {name:'', notes: []};

  const [,{key, chord, alt}] = chordData[0];
  const {accidental} = keys.find(
    (keySignature)=>keySignature.key===key
  ) ?? {accidental:''};
  const baseIndex = findBase(key);
  return ({
    name: `${key}${chord?chord: ''}${alt?alt:''}`,
    notes: chords.find(chordName=>chord ? chordName.variant===chord : chordName.variant==='maj')?.tones.map(tone =>
        notes[(tone + baseIndex) % notes.length]
        .find((note, _, arr) => arr.length > 1 && accidental ?
          note.endsWith(accidental) :
          arr[0])!
        )
  })
}

export const scaleTones = (base:string, variant:string) =>{
  // given a base note, and a variant (major/minor/?), we can return the tones
  //  in a given scale.
  const baseIndex = findBase(base);
  const {accidental} = keys.find(
    (keySignature)=>keySignature.key===base
  ) ?? {accidental: ''};
  const noteNames = scales.find(({variant: variantName}: {variant: string})=>variantName===variant)
    ?.tones.map(
      (interval)=>notes[(interval+baseIndex)%notes.length]
      .find((note, _, arr) => arr.length > 1 && accidental ?
          note.endsWith(accidental) :
          arr[0])
    );

  return noteNames;
}