declare module "@tombatossals/react-chords/lib/Chord" {
  import React from "react";

  interface ChordProps {
    chord: {
      name: string;
      frets: number[];
      fingers: number[];
      barres: number[];
      baseFret: number;
      capo: boolean;
    };
    instrument: {
      strings: number;
      fretsOnChord: number;
      name: string;
      tunings: { [key: string]: string[] };
    };
  }

  const Chord: React.ComponentType<ChordProps>;
  export default Chord;
}
