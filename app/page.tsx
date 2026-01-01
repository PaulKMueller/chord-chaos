"use client";

import guitarData from "@tombatossals/chords-db/lib/guitar.json";
import Chord from "@tombatossals/react-chords/lib/Chord";

const NOTES = [
  "C",
  "C#",
  "D",
  "Eb",
  "E",
  "F",
  "F#",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
] as const;
// const FORMS = ["Major", "Minor", "7", "Major 7", "Minor 7", "Power"] as const;
const FORMS = ["Major", "Minor", "7", "Major 7", "Minor 7"] as const;
const SHAPES = ["C", "A", "G", "E", "D"] as const;

const getChordData = (note: string, form: string, shape: string) => {
  // Normalize names (e.g., 'Major' in your state vs 'major' in DB)
  const suffix = form.toLowerCase();

  // 1. Get all variations for that root note (e.g., all C chords)
  const variations = guitarData.chords[note as keyof typeof guitarData.chords];
  console.log(variations);

  // 2. Find the specific quality (e.g., C Major)
  const chordQuality = variations.find((v) => v.suffix === suffix);

  // 3. Filter by CAGED shape
  // Note: chords-db doesn't label "C-shape", so we usually map by baseFret
  // or string root. For now, let's grab the first available position:
  return chordQuality?.positions[0];
};

// Create types based on the arrays above
type Note = (typeof NOTES)[number];
type Form = (typeof FORMS)[number];
type Shape = (typeof SHAPES)[number];

interface Chord {
  note: Note;
  form: Form;
  shape: Shape;
}

import { useState, useEffect, useRef, ChangeEvent } from "react";

export default function ChordTrainer() {
  const [currentChord, setCurrentChord] = useState<Chord>({
    note: "C",
    form: "Major",
    shape: "E",
  });
  const [bpm, setBpm] = useState<number>(60);
  const [isActive, setIsActive] = useState<boolean>(false);

  // Progress state (0 to 100)
  const [progress, setProgress] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const requestRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(Date.now());

  const generateRandomChord = (): void => {
    const note = NOTES[Math.floor(Math.random() * NOTES.length)];
    const form = FORMS[Math.floor(Math.random() * FORMS.length)];
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];

    lastTickRef.current = Date.now(); // Reset the progress start time
    setCurrentChord({ note, form, shape });
  };

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

  const chordInfo = getChordData(
    currentChord.note,
    currentChord.form,
    currentChord.shape
  );

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
              type="range"
              min="20"
              max="120"
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
            />
          </div>
        </section>
        <h2>
          {currentChord.note} {currentChord.form} ({currentChord.shape}-shape)
        </h2>
        {chordInfo ? (
          <Chord
            chord={{
              name: `${currentChord.note}${currentChord.form}`,
              frets: chordInfo.frets,
              fingers: chordInfo.fingers,
              barres: chordInfo.barres,
              capo: chordInfo.baseFret > 1,
            }}
            instrument={{
              strings: 6,
              fretsOnChord: 4,
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
