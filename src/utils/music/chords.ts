import type { PitchName } from "./pitch";

export type ChordName =
  | "dominantSeventh"
  | "majorSeventh"
  | "minorSeventh"
  | "halfDiminishedSeventh"
  | "diminishedSeventh"
  | "none";

export type ChordRoot = PitchName;

const chordRootNotationMap: { [key in ChordRoot]: number[] } = {
  C: [38],
  "C#": [38, 6],
  Db: [39, 4],
  D: [39],
  "D#": [39, 6],
  Eb: [40, 4],
  E: [40],
  F: [41],
  "F#": [41, 6],
  Gb: [42, 4],
  G: [42],
  "G#": [42, 6],
  Ab: [36, 4],
  A: [36],
  "A#": [36, 6],
  Bb: [37, 4],
  B: [37],
};

const chordNameNotationMap: {
  [key in Exclude<ChordName, "none">]: number[][];
} = {
  dominantSeventh: [[26]],
  majorSeventh: [[183, 26], [45], [186]],
  minorSeventh: [[199, 26], [80, 26], [203]],
  halfDiminishedSeventh: [
    [199, 26, 149, 24],
    [158],
    [157],
    [207],
    [106],
    [80, 123],
  ],
  diminishedSeventh: [[150], [152]],
};
export function getChordNotations(chordRoot: ChordRoot, chordName: ChordName) {
  const chordRootNotation = String.fromCharCode(
    ...chordRootNotationMap[chordRoot].map((code) => code + 29)
  );
  console.log(chordRootNotationMap[chordRoot], chordRootNotation);
  const chordNameNotations =
    chordName === "none"
      ? [""]
      : chordNameNotationMap[chordName].map((chordInCodes) =>
          String.fromCharCode(...chordInCodes.map((code) => code + 29))
        );
  const chordNotations = chordNameNotations.map(
    (chordNameNotation) => `${chordRootNotation}${chordNameNotation}`
  );
  return {
    chordNotations,
    default: {
      short: chordNotations[1] ?? chordNotations[0],
      long: chordNotations[0],
    },
  };
}
