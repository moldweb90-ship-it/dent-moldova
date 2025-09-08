import { AnimatedProgressBar } from './AnimatedProgressBar';

interface ScoreBarProps {
  value: number;
  label: string;
  className?: string;
  delay?: number;
}

export function ScoreBar({ value, label, className = "", delay = 0 }: ScoreBarProps) {
  const getColor = (score: number) => {
    if (score >= 75) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-700">{label}</span>
        <span className="text-sm font-medium text-gray-900">{value}</span>
      </div>
      <AnimatedProgressBar
        value={value}
        className="w-full bg-gray-200 rounded-full h-2 mt-1"
        barClassName={`h-2 rounded-full ${getColor(value)}`}
        duration={800}
        delay={delay}
      />
    </div>
  );
}
