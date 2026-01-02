import { useEffect, useRef, useState } from "react";

export function useChordTimer(
  bpm: number,
  isActive: boolean,
  onTick: () => void
) {
  const [progress, setProgress] = useState(0);
  const lastTickRef = useRef(Date.now());
  const requestRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!isActive) {
      setProgress(0);
      return;
    }

    const msPerBeat = (60 / bpm) * 1000;
    lastTickRef.current = Date.now();

    const tick = setInterval(() => {
      lastTickRef.current = Date.now();
      onTick();
    }, msPerBeat);

    const animate = () => {
      const elapsed = Date.now() - lastTickRef.current;
      setProgress(Math.min((elapsed / msPerBeat) * 100, 100));
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      clearInterval(tick);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isActive, bpm, onTick]);

  return progress;
}
