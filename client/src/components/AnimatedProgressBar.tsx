import { useEffect, useState } from 'react';

interface AnimatedProgressBarProps {
  value: number;
  maxValue?: number;
  className?: string;
  barClassName?: string;
  duration?: number;
  delay?: number;
}

export function AnimatedProgressBar({ 
  value, 
  maxValue = 100, 
  className = "w-full bg-gray-200 rounded-full h-2",
  barClassName = "h-2 rounded-full transition-all duration-1000 ease-out",
  duration = 1000,
  delay = 0
}: AnimatedProgressBarProps) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  const percentage = Math.min((animatedValue / maxValue) * 100, 100);

  return (
    <div className={className}>
      <div 
        className={barClassName}
        style={{ 
          width: `${percentage}%`,
          transition: `width ${duration}ms ease-out`
        }}
      />
    </div>
  );
}
