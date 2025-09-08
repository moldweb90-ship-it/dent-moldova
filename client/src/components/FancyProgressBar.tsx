import React from 'react';

interface FancyProgressBarProps {
  value: number; // 0..100
  heightClassName?: string; // e.g., h-2, h-3
  className?: string;
}

export function FancyProgressBar({ value, heightClassName = 'h-3', className = '' }: FancyProgressBarProps) {
  const percentage = Math.max(0, Math.min(100, value));

  return (
    <div className={`relative w-full ${heightClassName} rounded-full overflow-hidden bg-gray-200 ${className}`}>
      {/* filled bar */}
      <div
        className={`absolute inset-y-0 left-0 rounded-full transition-[width] duration-1000 ease-out ${
          percentage >= 80 ? 'bg-green-500' : percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
        }`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

export default FancyProgressBar;


