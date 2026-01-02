import Chord from "@tombatossals/react-chords/lib/Chord";

interface ChordDisplayProps {
  note: string;
  form: string;
  data: any; // Ideally use the specific type from chords-db
  shape: string;
}

export default function ChordDisplay({
  note,
  form,
  data,
  shape,
}: ChordDisplayProps) {
  if (!data) return <p>Chord shape not found</p>;

  return (
    <div className="chord-container">
      <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        {note} {form}
        <span
          style={{
            display: "block",
            fontSize: "1rem",
            color: "#3b82f6",
            fontWeight: "bold",
          }}
        >
          {shape}
        </span>
      </h2>

      <div className="chord-diagram">
        <Chord
          chord={{
            name: `${note}${form}`,
            frets: data.frets,
            fingers: data.fingers,
            barres: data.barres,
            baseFret: data.baseFret,
            capo: data.capo,
          }}
          instrument={{
            strings: 6,
            fretsOnChord: 4,
            name: "Guitar",
            tunings: { standard: ["E", "A", "D", "G", "B", "E"] },
          }}
        />
      </div>
    </div>
  );
}
