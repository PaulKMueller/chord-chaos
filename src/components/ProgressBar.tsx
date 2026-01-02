interface ProgressBarProps {
  progress: number;
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "400px",
        height: "12px",
        background: "#e2e8f0",
        margin: "20px auto",
        borderRadius: "6px",
        overflow: "hidden",
        position: "relative", // Good practice
      }}
    >
      <div
        style={{
          width: `${progress}%`,
          height: "100%",
          background: "#3b82f6",
          // REMOVE the transition property entirely
          transition: "none",
          // Optional: Use transform for smoother sub-pixel rendering
          // transform: `scaleX(${progress / 100})`,
          // transformOrigin: "left"
        }}
      />
    </div>
  );
}
