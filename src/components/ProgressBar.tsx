interface ProgressBarProps {
  progress: number;
  step: string;
}

export function ProgressBar({ progress, step }: ProgressBarProps) {
  return (
    <div className="progress-container">
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="progress-info">
        <span className="progress-step">{step}</span>
        <span className="progress-percent">{progress}%</span>
      </div>
    </div>
  );
}
