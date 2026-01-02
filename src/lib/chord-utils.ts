import guitarData from "@tombatossals/chords-db/lib/guitar.json";

export const NOTES = [
  "C",
  "Csharp",
  "D",
  "Eb",
  "E",
  "F",
  "Fsharp",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
] as const;
export const FORMS = ["major", "minor", "7", "maj7", "m7"] as const;

export type Note = (typeof NOTES)[number];
export type Form = (typeof FORMS)[number];

export interface ChordSelection {
  note: Note;
  form: Form;
  version: number;
}

export const getChordData = (note: string, form: string, version: number) => {
  const variations = guitarData.chords[note as keyof typeof guitarData.chords];
  const chordQuality = variations?.find((v) => v.suffix === form);
  return chordQuality?.positions[version] || null;
};

export const getRandomChord = (): ChordSelection => {
  const note = NOTES[Math.floor(Math.random() * NOTES.length)];
  const form = FORMS[Math.floor(Math.random() * FORMS.length)];

  const variations = guitarData.chords[note as keyof typeof guitarData.chords];
  const chordQuality = variations.find((v) => v.suffix === form);
  const maxVersions = chordQuality?.positions.length || 1;
  const version = Math.floor(Math.random() * maxVersions);

  return { note, form, version };
};

export const getShapeName = (frets: number[]): string => {
  const lowestString = frets.findIndex((fret) => fret !== -1);
  switch (lowestString) {
    case 0:
      return frets[1] !== -1 && frets[1] - frets[0] >= 0
        ? "E shape"
        : "G shape";
    case 1:
      return frets[3] === frets[2] ? "A shape" : "C shape";
    case 2:
      return "D shape";
    default:
      return "Unknown";
  }
};
