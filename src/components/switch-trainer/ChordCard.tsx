import { getChordData, getShapeName, ChordSelection } from "@/lib/chord-utils";
import ChordDisplay from "@/components/ChordDisplay";
import styles from "../../app/switch-trainer/page.module.css";

export function ChordCard({
  chord,
  isCurrent,
  showDiagrams,
}: {
  chord: ChordSelection;
  isCurrent: boolean;
  showDiagrams: boolean;
}) {
  const data = getChordData(chord.note, chord.form, chord.version);

  return (
    <div
      className={`${styles.chordCard} ${
        isCurrent ? styles.chordCardActive : styles.chordCardInactive
      }`}
    >
      {isCurrent && <div className={styles.playingBadge}>PLAYING</div>}

      <h2
        className={`${styles.chordTitle} ${
          isCurrent ? styles.chordTitleActive : styles.chordTitleInactive
        }`}
      >
        {chord.note} {chord.form}
      </h2>

      <div
        className={styles.diagramWrap}
        style={{ opacity: showDiagrams ? 1 : 0 }}
      >
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
}
