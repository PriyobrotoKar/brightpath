interface SegmentedProgressBarProps {
  progressPercent: number;
  total: number;
}

export default function SegmentedProgressBar({
  progressPercent,
  total,
}: SegmentedProgressBarProps): React.JSX.Element {
  const segments = Array.from({ length: total }, (_, i) => i + 1);
  const progress = progressPercent * total;

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1">
        {segments.map((segment) => (
          <div
            className={`h-5 w-1 rounded-full transition-colors duration-300 ${
              segment <= progress ? 'bg-primary' : 'bg-muted'
            }`}
            key={segment}
          />
        ))}
      </div>
      <span>{Math.floor(progressPercent * 100)}%</span>
    </div>
  );
}
