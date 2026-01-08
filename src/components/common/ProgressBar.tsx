interface ProgressBarProps {
  progress: number;
  showLabel?: boolean;
  height?: 'sm' | 'md' | 'lg';
  color?: string;
}

export function ProgressBar({
  progress,
  showLabel = true,
  height = 'md',
  color = '#3b82f6',
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex-1 bg-gray-200 rounded-full overflow-hidden ${heightClasses[height]}`}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${clampedProgress}%`,
            backgroundColor: color,
          }}
        />
      </div>
      {showLabel && (
        <span className="text-sm text-gray-600 min-w-[3rem] text-right">
          {clampedProgress}%
        </span>
      )}
    </div>
  );
}
