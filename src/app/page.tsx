"use client";

import { useState, useCallback } from "react";
import { useChordTimer } from "../hooks/useChordTimer"; // Using the hook from previous response
import { getRandomChord, getChordData, getShapeName } from "../lib/chord-utils";
import ProgressBar from "../components/ProgressBar";
import ChordDisplay from "../components/ChordDisplay";

export default function ChordTrainer() {
  const [bpm, setBpm] = useState(20);
  const [isActive, setIsActive] = useState(false);
  const [chord, setChord] = useState(() => getRandomChord());

  const handleTick = useCallback(() => {
    setChord(getRandomChord());
  }, []);

  const progress = useChordTimer(bpm, isActive, handleTick);
  const chordData = getChordData(chord.note, chord.form, chord.version);

  return (
    <main style={{ textAlign: "center", padding: "40px" }}>
      <h1>Chord Trainer</h1>

      <ProgressBar progress={progress} />

      <section style={{ marginBottom: "30px" }}>
        <button
          onClick={() => setIsActive(!isActive)}
          style={{
            padding: "12px 24px",
            backgroundColor: isActive ? "#ef4444" : "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          {isActive ? "STOP" : "START"}
        </button>

        <div style={{ marginTop: "15px" }}>
          <label>BPM: </label>
          <input
            type="number"
            value={bpm}
            onChange={(e) => setBpm(Math.max(1, Number(e.target.value)))}
            style={{ width: "60px", padding: "4px", textAlign: "center" }}
          />
        </div>
      </section>

      <ChordDisplay
        note={chord.note}
        form={chord.form}
        data={chordData}
        shape={chordData ? getShapeName(chordData.frets) : "Unknown"}
      />
    </main>
  );
}
