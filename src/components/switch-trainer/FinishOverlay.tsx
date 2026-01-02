import styles from "../../app/switch-trainer/page.module.css";

export function FinishOverlay({
  onRetry,
  onNewPair,
}: {
  onRetry: () => void;
  onNewPair: () => void;
}) {
  return (
    <div className={styles.overlay}>
      <div className={styles.overlayCard}>
        <h2 className={styles.overlayTitle}>Session Complete!</h2>
        <p className={styles.overlayText}>How did those switches feel?</p>

        <div className={styles.overlayButtons}>
          <button className={styles.overlayPrimaryBtn} onClick={onRetry}>
            Retry Same Pair
          </button>
          <button className={styles.overlaySecondaryBtn} onClick={onNewPair}>
            Get New Pair
          </button>
        </div>
      </div>
    </div>
  );
}
