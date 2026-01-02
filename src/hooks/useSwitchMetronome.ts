"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MetronomeAudio } from "@/lib/audio-utils";

export function useSwitchMetronome({
  bpm,
  sessionTime,
  beatsPerBar = 4,
  soundOn = true,
}: {
  bpm: number;
  sessionTime: number;
  beatsPerBar?: number;
  soundOn?: boolean;
}) {
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [beat, setBeat] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(sessionTime);
  const [progress, setProgress] = useState(0);
  const [flash, setFlash] = useState(false);
  const soundOnRef = useRef(soundOn);

  useEffect(() => {
    soundOnRef.current = soundOn;
  }, [soundOn]);
  const audioRef = useRef<MetronomeAudio | null>(null);
  const intervalRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const beatRef = useRef(0);
  const timeLeftRef = useRef(sessionTime);
  const lastTickRef = useRef(Date.now());

  const msPerBeat = (60 / bpm) * 1000;

  const stop = useCallback(() => {
    setIsActive(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    intervalRef.current = null;
    rafRef.current = null;
  }, []);

  const reset = useCallback(() => {
    stop();
    setIsFinished(false);
    setBeat(0);
    setActiveIndex(0);
    setFlash(false);

    beatRef.current = 0;
    timeLeftRef.current = sessionTime;
    setTimeLeft(sessionTime);
    setProgress(0);
  }, [stop, sessionTime]);

  const start = useCallback(() => {
    if (intervalRef.current || isFinished) return;

    setIsActive(true);
    audioRef.current ??= new MetronomeAudio();
    lastTickRef.current = Date.now();

    intervalRef.current = window.setInterval(() => {
      const nextBeat = (beatRef.current + 1) % beatsPerBar;
      beatRef.current = nextBeat;
      setBeat(nextBeat);

      if (soundOnRef.current) {
        audioRef.current?.playTick(nextBeat === 0);
      }

      if (nextBeat === 0) {
        setActiveIndex((i) => (i === 0 ? 1 : 0));
        setFlash(true);
        setTimeout(() => setFlash(false), 150);
      }

      const nextTime = Math.max(0, timeLeftRef.current - 60 / bpm);
      timeLeftRef.current = nextTime;
      setTimeLeft(nextTime);

      if (nextTime <= 0) {
        setIsFinished(true);
        stop();
      }

      lastTickRef.current = Date.now();
    }, msPerBeat);

    const animate = () => {
      const elapsed = Date.now() - lastTickRef.current;
      setProgress(Math.min((elapsed / msPerBeat) * 100, 100));
      if (intervalRef.current) rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
  }, [beatsPerBar, bpm, isFinished, msPerBeat, stop]);

  const toggle = () => (isActive ? stop() : start());

  useEffect(() => stop, [stop]);

  return {
    isActive,
    isFinished,
    beat,
    activeIndex,
    timeLeft,
    progress,
    flash,
    start,
    stop,
    toggle,
    reset,
  };
}
