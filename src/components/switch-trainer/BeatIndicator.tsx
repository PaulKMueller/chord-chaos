import styles from "../../app/switch-trainer/page.module.css";

export function BeatIndicator({
  beat,
  flash,
}: {
  beat: number;
  flash: boolean;
}) {
  return (
    <div className={styles.beatRow} style={{ opacity: flash ? 0.6 : 1 }}>
      {[0, 1, 2, 3].map((b) => {
        const isOn = beat === b;
        const isDownbeat = b === 0;

        return (
          <div
            key={b}
            className={`${styles.beatDot} ${isOn ? styles.beatDotOn : ""} ${
              isOn && isDownbeat ? styles.beatDotDownbeatOn : ""
            }`}
          />
        );
      })}
    </div>
  );
}
