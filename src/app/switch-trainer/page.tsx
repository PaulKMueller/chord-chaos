// src/app/switch-trainer/page.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  getRandomChord,
  getChordData,
  getShapeName,
  ChordSelection,
} from "@/lib/chord-utils";
import { MetronomeAudio } from "@/lib/audio-utils";
import ChordDisplay from "@/components/ChordDisplay";
import ProgressBar from "@/components/ProgressBar";

export default function SwitchTrainer() {
  const [bpm, setBpm] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [showDiagrams, setShowDiagrams] = useState(true);
  const [chordPair, setChordPair] = useState<
    [ChordSelection, ChordSelection] | null
  >(null);
  const [activeIndex, setActiveIndex] = useState(0); // 0 or 1
  const [beat, setBeat] = useState(0); // 0, 1, 2, 3
  const [progress, setProgress] = useState(0);

  const audioRef = useRef<MetronomeAudio | null>(null);
  const lastTickRef = useRef(Date.now());

  // Initialize pair
  const generatePair = useCallback(() => {
    let c1 = getRandomChord();
    let c2 = getRandomChord();
    // Ensure they aren't the same chord/form/version
    while (JSON.stringify(c1) === JSON.stringify(c2)) {
      c2 = getRandomChord();
    }
    setChordPair([c1, c2]);
    setActiveIndex(0);
    setBeat(0);
  }, []);

  useEffect(() => {
    if (!chordPair) generatePair();
    audioRef.current = new MetronomeAudio();
  }, [chordPair, generatePair]);

  // Game Loop
  useEffect(() => {
    if (!isActive) return;

    const msPerBeat = (60 / bpm) * 1000;
    lastTickRef.current = Date.now();

    const interval = setInterval(() => {
      setBeat((prev) => {
        const nextBeat = (prev + 1) % 4;
        const isDownbeat = nextBeat === 0;

        audioRef.current?.playTick(isDownbeat);

        if (isDownbeat) {
          setActiveIndex((idx) => (idx === 0 ? 1 : 0));
        }

        lastTickRef.current = Date.now();
        return nextBeat;
      });
    }, msPerBeat);

    const animate = () => {
      const elapsed = Date.now() - lastTickRef.current;
      setProgress(Math.min((elapsed / msPerBeat) * 100, 100));
      requestAnimationFrame(animate);
    };
    const animId = requestAnimationFrame(animate);

    return () => {
      clearInterval(interval);
      cancelAnimationFrame(animId);
    };
  }, [isActive, bpm]);

  if (!chordPair) return null;

  return (
    <main
      style={{
        minHeight: "100vh",
        transition: "background-color 0.3s ease",
        backgroundColor: isActive
          ? activeIndex === 0
            ? "#f0f9ff"
            : "#fff7ed"
          : "#ffffff",
        padding: "40px",
      }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
        <h1>Switch Trainer</h1>

        <div
          style={{
            margin: "20px 0",
            display: "flex",
            justifyContent: "center",
            gap: "20px",
          }}
        >
          <button onClick={() => setIsActive(!isActive)}>
            {isActive ? "Stop" : "Start"}
          </button>
          <button onClick={generatePair}>New Chord Pair</button>
          <label>
            <input
              type="checkbox"
              checked={showDiagrams}
              onChange={() => setShowDiagrams(!showDiagrams)}
            />
            Show Diagrams
          </label>
        </div>

        <ProgressBar progress={progress} />

        <div
          style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "20px" }}
        >
          Beat: {beat + 1}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "40px",
          }}
        >
          {chordPair.map((chord, index) => {
            const data = getChordData(chord.note, chord.form, chord.version);
            const isCurrent = activeIndex === index;
            return (
              <div
                key={index}
                style={{
                  opacity: isCurrent ? 1 : 0.3,
                  transform: isCurrent ? "scale(1.05)" : "scale(1)",
                  transition: "all 0.2s",
                }}
              >
                <h2 style={{ color: isCurrent ? "#2563eb" : "#000" }}>
                  {chord.note} {chord.form}
                </h2>
                {showDiagrams && data && (
                  <ChordDisplay
                    note={chord.note}
                    form={chord.form}
                    data={data}
                    shape={getShapeName(data.frets)}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
