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
import styles from "./page.module.css";

export default function SwitchTrainer() {
  const [bpm, setBpm] = useState(60);
  const [flash, setFlash] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [showDiagrams, setShowDiagrams] = useState(true);
  const [sessionTime, setSessionTime] = useState(60); // seconds
  const [timeLeft, setTimeLeft] = useState(60);

  const [chordPair, setChordPair] = useState<
    [ChordSelection, ChordSelection] | null
  >(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [beat, setBeat] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const audioRef = useRef<MetronomeAudio | null>(null);
  const lastTickRef = useRef(Date.now());

  const generatePair = useCallback(() => {
    let c1 = getRandomChord();
    let c2 = getRandomChord();
    while (JSON.stringify(c1) === JSON.stringify(c2)) {
      c2 = getRandomChord();
    }
    setChordPair([c1, c2]);
    resetSession();
  }, []);

  const resetSession = () => {
    setActiveIndex(0);
    setBeat(0);
    setTimeLeft(sessionTime);
    setIsFinished(false);
    setIsActive(false);
  };

  useEffect(() => {
    if (!chordPair) generatePair();
    audioRef.current = new MetronomeAudio();
  }, [chordPair, generatePair]);

  useEffect(() => {
    if (!isActive) return;

    if (beat === 0) {
      setActiveIndex((idx) => (idx === 0 ? 1 : 0));

      setFlash(true);
      const t = setTimeout(() => setFlash(false), 150);
      return () => clearTimeout(t);
    }
  }, [beat, isActive]);

  // Logic for the Metronome and Switching
  useEffect(() => {
    if (!isActive || isFinished) return;

    const msPerBeat = (60 / bpm) * 1000;

    const interval = setInterval(() => {
      audioRef.current?.playTick(beat === 0);

      setBeat((prev) => (prev + 1) % 4);

      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsFinished(true);
          setIsActive(false);
          return 0;
        }
        return prev - msPerBeat / 1000;
      });

      lastTickRef.current = Date.now();
    }, msPerBeat);

    return () => clearInterval(interval);
  }, [isActive, bpm, isFinished, beat]);

  if (!chordPair) return null;

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        padding: "40px",
        transition: "background-color 0.5s ease",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
        <header style={{ marginBottom: "30px" }}>
          <h1 style={{ fontSize: "2.5rem", marginBottom: "10px" }}>
            Switch Trainer
          </h1>
          <div style={{ fontSize: "1.2rem", color: "#64748b" }}>
            Time Remaining: <strong>{Math.ceil(timeLeft)}s</strong>
          </div>
        </header>

        {/* Controls */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "15px",
            marginBottom: "30px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => setIsActive(!isActive)}
            style={{
              padding: "10px 25px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: isActive ? "#ef4444" : "#22c55e",
              color: "white",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {isActive ? "PAUSE" : "START"}
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "#f1f5f9",
              padding: "5px 15px",
              borderRadius: "8px",
            }}
          >
            <label>BPM:</label>
            <input
              type="number"
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              style={{
                width: "70px",
                border: "none",
                background: "transparent",
                textAlign: "center",
                fontWeight: "bold",
              }}
            />
          </div>

          <button
            onClick={() => setShowDiagrams(!showDiagrams)}
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              color: "black",
              background: "white",
              cursor: "pointer",
            }}
          >
            {showDiagrams ? "Hide Diagrams" : "Show Diagrams"}
          </button>
        </div>

        <ProgressBar progress={progress} />

        {/* Visual Beat Indicator */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            margin: "20px 0",
          }}
        >
          {[0, 1, 2, 3].map((b) => (
            <div
              key={b}
              style={{
                width: "15px",
                height: "15px",
                borderRadius: "50%",
                backgroundColor:
                  beat === b ? (b === 0 ? "#2563eb" : "#94a3b8") : "#e2e8f0",
                transform: beat === b ? "scale(1.3)" : "scale(1)",
                transition: "all 0.1s",
              }}
            />
          ))}
        </div>

        {/* The Chord Switching Grid */}
        <div
          style={{
            gridTemplateColumns: "1fr 1fr",
            gap: "30px",
            marginTop: "40px",
          }}
          className={styles.chordCompare}
        >
          {chordPair.map((chord, index) => {
            const data = getChordData(chord.note, chord.form, chord.version);
            const isCurrent = activeIndex === index;

            return (
              <div
                // 1. UNIQUE KEY: This forces React to "repaint" the card when activeIndex changes
                key={`${index}-${isCurrent}`}
                style={{
                  padding: "30px",
                  borderRadius: "16px",
                  backgroundColor: "white",
                  // 2. STRONGER VISUAL SWITCH: Blue outline for active, grey for inactive
                  border: isCurrent
                    ? "6px solid #3b82f6"
                    : "6px solid transparent",
                  boxShadow: isCurrent
                    ? "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
                    : "none",
                  // 3. SCALE: Make the active one significantly larger
                  transform: isCurrent ? "scale(1.1)" : "scale(0.9)",
                  // 4. OPACITY: Dim the inactive one almost entirely
                  opacity: isCurrent ? 1 : 0.2,
                  height: "500px",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: "relative",
                }}
              >
                {/* 5. DYNAMIC BADGE */}
                {isCurrent && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-20px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      backgroundColor: "#3b82f6",
                      color: "white",
                      padding: "5px 15px",
                      borderRadius: "20px",
                      fontWeight: "bold",
                      fontSize: "0.8rem",
                    }}
                  >
                    PLAYING
                  </div>
                )}

                <h2
                  style={{
                    fontSize: "2rem",
                    color: isCurrent ? "#1e40af" : "#94a3b8",
                  }}
                >
                  {chord.note} {chord.form}
                </h2>

                <div style={{ height: "250px", opacity: showDiagrams ? 1 : 0 }}>
                  {data && (
                    <ChordDisplay
                      note={chord.note}
                      form={chord.form}
                      data={data}
                      shape={getShapeName(data.frets)}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Finish Overlay */}
        {isFinished && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100,
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                padding: "40px",
                borderRadius: "20px",
                maxWidth: "400px",
              }}
            >
              <h2>Session Complete!</h2>
              <p>How did those switches feel?</p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  marginTop: "20px",
                }}
              >
                <button
                  onClick={resetSession}
                  style={{
                    padding: "12px",
                    backgroundColor: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "bold",
                  }}
                >
                  Retry Same Pair
                </button>
                <button
                  onClick={generatePair}
                  style={{
                    padding: "12px",
                    backgroundColor: "#f1f5f9",
                    border: "none",
                    borderRadius: "8px",
                  }}
                >
                  Get New Pair
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
