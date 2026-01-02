"use client";

import { useState } from "react";
import { useSwitchMetronome } from "@/hooks/useSwitchMetronome";
import { pickDistinctChordPair } from "@/lib/chord-utils";
import ProgressBar from "@/components/ProgressBar";
import { BeatIndicator } from "@/components/switch-trainer/BeatIndicator";
import { ChordCard } from "@/components/switch-trainer/ChordCard";
import { FinishOverlay } from "@/components/switch-trainer/FinishOverlay";
import styles from "./page.module.css";

export default function SwitchTrainerPage() {
  const [bpm, setBpm] = useState(60);
  const [showDiagrams, setShowDiagrams] = useState(true);
  const [sessionTime] = useState(60);
  const [chords, setChords] = useState(() => pickDistinctChordPair());

  const {
    isActive,
    isFinished,
    beat,
    activeIndex,
    timeLeft,
    progress,
    flash,
    toggle,
    reset,
  } = useSwitchMetronome({ bpm, sessionTime });

  // Restore the original dynamic background behavior
  const bg = !isActive ? "#ffffff" : activeIndex === 0 ? "#f8fafc" : "#fffbeb";

  return (
    <main className={styles.page} style={{ ["--page-bg" as any]: bg }}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Switch Trainer</h1>
          <div className={styles.subtle}>
            Time Remaining: <strong>{Math.ceil(timeLeft)}s</strong>
          </div>
        </header>

        {/* Controls (match original look) */}
        <div className={styles.controls}>
          <button
            className={`${styles.startPauseBtn} ${
              isActive ? styles.pauseBtn : styles.startBtn
            }`}
            onClick={toggle}
          >
            {isActive ? "PAUSE" : "START"}
          </button>

          <div className={styles.bpmPill}>
            <label>BPM:</label>
            <input
              type="number"
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className={styles.bpmInput}
            />
          </div>

          <button
            className={styles.secondaryBtn}
            onClick={() => setShowDiagrams((v) => !v)}
          >
            {showDiagrams ? "Hide Diagrams" : "Show Diagrams"}
          </button>
        </div>

        <ProgressBar progress={progress} />

        <BeatIndicator beat={beat} flash={flash} />

        {/* Chord Switching Grid (restore original spacing + size) */}
        <div className={styles.chordCompare}>
          {chords.map((chord, i) => (
            <ChordCard
              key={`${chord.note}-${chord.form}-${chord.version}-${i}`}
              chord={chord}
              isCurrent={activeIndex === i}
              showDiagrams={showDiagrams}
            />
          ))}
        </div>

        {isFinished && (
          <FinishOverlay
            onRetry={reset}
            onNewPair={() => {
              setChords(pickDistinctChordPair());
              reset();
            }}
          />
        )}
      </div>
    </main>
  );
}
