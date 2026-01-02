"use client";

import { useEffect, useState } from "react";
import { pickDistinctChordPair } from "@/lib/chord-utils";
import { useSwitchMetronome } from "@/hooks/useSwitchMetronome";
import { ChordCard } from "@/components/switch-trainer/ChordCard";
import styles from "./page.module.css";

export default function SwitchTrainerSimplePage() {
  const sessionTime = 120;
  const bpm = 60;
  const [soundOn, setSoundOn] = useState(true);

  // ✅ toggle state
  const [showDiagrams, setShowDiagrams] = useState(true);

  // Start with null to avoid SSR/client mismatch
  const [chords, setChords] = useState<ReturnType<
    typeof pickDistinctChordPair
  > | null>(null);

  const { timeLeft, isFinished, reset, start } = useSwitchMetronome({
    bpm,
    sessionTime,
    soundOn,
  });

  // Generate the random pair only on the client (after mount)
  useEffect(() => {
    setChords(pickDistinctChordPair());
    start?.();
  }, [start]);

  // When session ends, pick new chords and restart
  useEffect(() => {
    if (!isFinished) return;
    setChords(pickDistinctChordPair());
    reset();
    start?.();
  }, [isFinished, reset, start]);

  if (!chords) return null;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.timerRow}>
            <div className={styles.timer}>{Math.ceil(timeLeft)}s</div>

            <button
              className={styles.toggleBtn}
              onClick={() => setShowDiagrams((v) => !v)}
              type="button"
            >
              {showDiagrams ? "Hide Fingering" : "Show Fingering"}
            </button>
          </div>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => setSoundOn((v) => !v)}
            aria-label={soundOn ? "Mute metronome" : "Unmute metronome"}
            title={soundOn ? "Mute" : "Unmute"}
          >
            {soundOn ? "🔊" : "🔇"}
          </button>
        </header>

        <div className={styles.chordCompare}>
          {chords.map((chord, i) => (
            <ChordCard
              key={`${chord.note}-${chord.form}-${chord.version}-${i}`}
              chord={chord}
              isCurrent={true}
              showDiagrams={showDiagrams}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
