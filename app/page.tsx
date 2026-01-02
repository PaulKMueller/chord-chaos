"use client";

import guitarData from "@tombatossals/chords-db/lib/guitar.json";
import Chord from "@tombatossals/react-chords/lib/Chord";
import { randomInt } from "crypto";

interface ChordState {
  note: Note;
  form: Form;
  version: number; // New field
}

const NOTES = [
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
// const FORMS = ["Major", "Minor", "7", "Major 7", "Minor 7", "Power"] as const;
const FORMS = ["major", "minor", "7", "maj7", "m7"] as const;
const SHAPES = ["C", "A", "G", "E", "D"] as const;

const getShapeName = (frets: number[]): string => {
  // Find the lowest played string (from index 0 to 5)
  const lowestString = frets.findIndex((fret) => fret !== -1);

  switch (lowestString) {
    case 0: // Root on Low E string
      // E shape usually has a finger on the A string 2 frets up
      // G shape usually has the A string muted or a very high reach
      return frets[1] !== -1 && frets[1] - frets[0] >= 0
        ? "E shape"
        : "G shape";
    case 1: // Root on A string
      // A shape is usually a bar or tight cluster
      // C shape usually has a fret spread (e.g., x-3-2-0-1-0)
      return frets[3] === frets[2] ? "A shape" : "C shape";
    case 2: // Root on D string
      return "D shape";
    default:
      return "Unknown shape";
  }
};

const getChordData = (note: string, form: string, version: number) => {
  const variations = guitarData.chords[note as keyof typeof guitarData.chords];
  const chordQuality = variations.find((v) => v.suffix === form);

  // Return the specific position based on the stored version
  return chordQuality?.positions[version] || null;
};

// Create types based on the arrays above
type Note = (typeof NOTES)[number];
type Form = (typeof FORMS)[number];

interface Chord {
  version: number;
  note: Note;
  form: Form;
}

import { useState, useEffect, useRef, ChangeEvent } from "react";

export default function ChordTrainer() {
  const [currentChord, setCurrentChord] = useState<Chord>({
    note: "C",
    form: "major",
    version: 0,
  });
  const [bpm, setBpm] = useState<number>(20);
  const [isActive, setIsActive] = useState<boolean>(false);

  // Progress state (0 to 100)
  const [progress, setProgress] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const requestRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(Date.now());

  const generateRandomChord = (): void => {
    const note = NOTES[Math.floor(Math.random() * NOTES.length)];
    const form = FORMS[Math.floor(Math.random() * FORMS.length)];

    // 3. Calculate the version count based on the new random note/form
    const variations =
      guitarData.chords[note as keyof typeof guitarData.chords];
    const chordQuality = variations.find((v) => v.suffix === form);
    const maxVersions = chordQuality?.positions.length || 1;
    const version = Math.floor(Math.random() * maxVersions);

    lastTickRef.current = Date.now();
    setCurrentChord({ note, form, version });
  };

  const chordInfo = getChordData(
    currentChord.note,
    currentChord.form,
    currentChord.version
  );

  // The Animation Loop
  const animate = () => {
    const msPerBeat = (60 / bpm) * 1000;
    const elapsed = Date.now() - lastTickRef.current;
    const newProgress = Math.min((elapsed / msPerBeat) * 100, 100);

    setProgress(newProgress);
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isActive) {
      const ms = (60 / bpm) * 1000;
      lastTickRef.current = Date.now();

      // Start the chord switcher
      timerRef.current = setInterval(generateRandomChord, ms);
      // Start the visual progress bar
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      setProgress(0);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isActive, bpm]);

  console.log("Current Chord:", currentChord);

  return (
    <div>
      <main style={{ textAlign: "center", padding: "20px" }}>
        <h1>Chord Trainer</h1>

        {/* --- Progress Bar --- */}
        <div
          style={{
            width: "300px",
            height: "10px",
            background: "#eee",
            margin: "20px auto",
            borderRadius: "5px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "#0070f3",
              transition: progress === 0 ? "none" : "width 0.1s linear", // Smooth out the jumps
            }}
          />
        </div>

        <section>
          <button
            onClick={() => setIsActive(!isActive)}
            style={{ padding: "10px 20px", fontSize: "1.2rem" }}
          >
            {isActive ? "Stop" : "Start"}
          </button>
          <div style={{ marginTop: "10px" }}>
            <label>BPM: {bpm}</label>
            <input
              type="number"
              min="1"
              max="60"
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
            />
          </div>
        </section>
        <h2>
          {currentChord.note} {currentChord.form}
          {chordInfo && (
            <span
              style={{
                fontSize: "1.1rem",
                color: "#0070f3",
                marginLeft: "15px",
                fontWeight: "bold",
              }}
            >
              ({getShapeName(chordInfo.frets)})
            </span>
          )}
        </h2>
        {chordInfo ? (
          <Chord
            chord={{
              name: `${currentChord.note}${currentChord.form}`,
              frets: chordInfo.frets,
              fingers: chordInfo.fingers,
              barres: chordInfo.barres,
              baseFret: chordInfo.baseFret,
              capo: chordInfo.baseFret > 1,
            }}
            instrument={{
              strings: 6,
              fretsOnChord: 6,
              name: "Guitar",
              tunings: { standard: ["E", "A", "D", "G", "B", "E"] },
            }}
          />
        ) : (
          <p>Chord shape not found</p>
        )}
      </main>
    </div>
  );
}
