import type { Finger, Barre } from 'svguitar';

interface Dictionary<T> {
  [key: string]: T
}

export type InstrumentDefault = {
  barres: Barre[]
  fingers: Finger[]
  position?: number  // Starting fret position (1 = first fret, etc.)
}

type Instrument = Dictionary<InstrumentDefault>

export const systemDefaultChords: Dictionary<Instrument> = {
  "Standard Ukulele": {
    "Cm": {
      "barres": [],
      "fingers": [
        [3,3],
        [2,3],
        [1,3]
      ]
    },
    "Cm7": {
      "barres": [{
        "fromString": 4,
        "toString": 1,
        "fret": 3,
        "text": "1"
      }],
      "fingers": []
    },
    "Cdim": {
      "barres": [],
      "fingers": [
        [4,2],
        [3,3],
        [2,2],
        [1,3]
      ]
    },
    "C": {
      "barres": [],
      "fingers": [
        [4,0],
        [3,0],
        [2,0],
        [1,3]
      ]
    },
    "C7": {
      "barres": [],
      "fingers": [
        [4,0],
        [3,0],
        [2,0],
        [1,1]
      ]
    },
    "Cmaj7": {
      "barres": [],
      "fingers": [
        [4,0],
        [3,0],
        [2,0],
        [1,2]
      ]
    },
    "Dm": {
      "barres": [],
      "fingers": [
        [4,2],
        [3,2],
        [2,1],
        [1,0]
      ]
    },
    "Dm7": {
      "barres": [],
      "fingers": [
        [4,2],
        [3,2],
        [2,1],
        [1,3]
      ]
    },
    "D": {
      "barres": [],
      "fingers": [
        [4,2],
        [3,2],
        [2,2],
        [1,0]
      ]
    },
    "D7": {
      "barres": [],
      "fingers": [
        [4,2],
        [3,2],
        [2,2],
        [1,3]
      ]
    },
    "Em": {
      "barres": [],
      "fingers": [
        [4,0],
        [3,4],
        [2,3],
        [1,2]
      ]
    },
    "E": {
      "barres": [],
      "fingers": [
        [4,4],
        [3,4],
        [2,4],
        [1,2]
      ]
    },
    "E7": {
      "barres": [],
      "fingers": [
        [4,2],
        [3,4],
        [2,4],
        [1,2]
      ]
    },
    "F": {
      "barres": [],
      "fingers": [
        [4,2],
        [3,0],
        [2,1],
        [1,0]
      ]
    },
    "F7": {
      "barres": [],
      "fingers": [
        [4,2],
        [3,3],
        [2,1],
        [1,3]
      ]
    },
    "Fm": {
      "barres": [],
      "fingers": [
        [4,1],
        [3,0],
        [2,1],
        [1,3]
      ]
    },
    "G": {
      "barres": [],
      "fingers": [
        [4,0],
        [3,2],
        [2,3],
        [1,2]
      ]
    },
    "G7": {
      "barres": [],
      "fingers": [
        [4,0],
        [3,2],
        [2,1],
        [1,2]
      ]
    },
    "Gm": {
      "barres": [],
      "fingers": [
        [4,0],
        [3,2],
        [2,3],
        [1,1]
      ]
    },
    "Am": {
      "barres": [],
      "fingers": [
        [4,2],
        [3,0],
        [2,0],
        [1,0]
      ]
    },
    "A": {
      "barres": [],
      "fingers": [
        [4,2],
        [3,1],
        [2,0],
        [1,0]
      ]
    },
    "A7": {
      "barres": [],
      "fingers": [
        [4,0],
        [3,1],
        [2,0],
        [1,0]
      ]
    },
    "Bm": {
      "barres": [],
      "fingers": [
        [4,4],
        [3,2],
        [2,2],
        [1,2]
      ]
    },
    "B": {
      "barres": [],
      "fingers": [
        [4,4],
        [3,3],
        [2,2],
        [1,2]
      ]
    },
    "B7": {
      "barres": [],
      "fingers": [
        [4,2],
        [3,3],
        [2,2],
        [1,2]
      ]
    }
  },
  "Standard Guitar": {
    "C": {
      "barres": [],
      "fingers": [
        [5,3],
        [4,2],
        [2,1]
      ]
    },
    "Cm": {
      "barres": [{
        "fromString": 5,
        "toString": 1,
        "fret": 3,
        "text": "1"
      }],
      "fingers": [
        [4,5],
        [3,5],
        [2,4]
      ]
    },
    "D": {
      "barres": [],
      "fingers": [
        [4,2],
        [3,3],
        [1,2]
      ]
    },
    "Dm": {
      "barres": [],
      "fingers": [
        [4,2],
        [3,3],
        [1,1]
      ]
    },
    "E": {
      "barres": [],
      "fingers": [
        [5,2],
        [4,2],
        [3,1]
      ]
    },
    "Em": {
      "barres": [],
      "fingers": [
        [5,2],
        [4,2]
      ]
    },
    "F": {
      "barres": [{
        "fromString": 6,
        "toString": 1,
        "fret": 1,
        "text": "1"
      }],
      "fingers": [
        [5,3],
        [4,3],
        [3,2]
      ]
    },
    "G": {
      "barres": [],
      "fingers": [
        [6,3],
        [1,3],
        [5,2]
      ]
    },
    "A": {
      "barres": [],
      "fingers": [
        [4,2],
        [3,2],
        [2,2]
      ]
    },
    "Am": {
      "barres": [],
      "fingers": [
        [4,2],
        [3,2],
        [2,1]
      ]
    }
  }
};