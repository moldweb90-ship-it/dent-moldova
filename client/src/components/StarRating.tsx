import { useState } from 'react';

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  label?: string;
}

export function StarRating({ value, onChange, size = 'md', disabled = false, label }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>, index: number) => {
    if (disabled) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const isHalf = x < rect.width / 2;
    const newValue = index + (isHalf ? 0.5 : 1);
    setHoverValue(newValue);
  };

  const handleMouseLeave = () => {
    if (disabled) return;
    setHoverValue(null);
  };

  const handleClick = (event: React.MouseEvent<HTMLDivElement>, index: number) => {
    if (disabled) return;
    
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const isHalf = x < rect.width / 2;
    const newValue = index + (isHalf ? 0.5 : 1);
    onChange(newValue);
  };

  // Touch events для мобильных устройств
  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>, index: number) => {
    if (disabled) return;
    
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    const touch = event.touches[0];
    const x = touch.clientX - rect.left;
    const isHalf = x < rect.width / 2;
    const newValue = index + (isHalf ? 0.5 : 1);
    setHoverValue(newValue);
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>, index: number) => {
    if (disabled) return;
    
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    const touch = event.changedTouches[0];
    const x = touch.clientX - rect.left;
    const isHalf = x < rect.width / 2;
    const newValue = index + (isHalf ? 0.5 : 1);
    onChange(newValue);
    setHoverValue(null);
  };

  const displayValue = hoverValue !== null ? hoverValue : value;

  return (
    <div className="flex flex-col items-center space-y-2">
      {label && (
        <span className="text-sm font-medium text-gray-700">{label}</span>
      )}
      <div className="flex items-center space-x-0.5">
        {[0, 1, 2, 3, 4].map((index) => {
          const starValue = index + 1;
          const isHalf = displayValue >= starValue - 0.5 && displayValue < starValue;
          const isFull = displayValue >= starValue;
          
          return (
            <div
              key={index}
              className={`${sizeClasses[size]} cursor-pointer transition-colors ${
                disabled ? 'cursor-not-allowed' : 'hover:scale-110'
              }`}
              onMouseMove={(e) => handleMouseMove(e, index)}
              onMouseLeave={handleMouseLeave}
              onClick={(e) => handleClick(e, index)}
              onTouchStart={(e) => handleTouchStart(e, index)}
              onTouchEnd={(e) => handleTouchEnd(e, index)}
            >
              <svg
                viewBox="0 0 24 24"
                className={`w-full h-full ${
                  isFull ? 'text-yellow-400' : isHalf ? 'text-yellow-400' : 'text-gray-300'
                } transition-colors`}
                fill="currentColor"
              >
                {isHalf ? (
                  <defs>
                    <linearGradient id={`half-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="50%" stopColor="currentColor" />
                      <stop offset="50%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                ) : null}
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  fill={isHalf ? `url(#half-${index})` : 'currentColor'}
                />
              </svg>
            </div>
          );
        })}
      </div>
      <span className="text-xs text-gray-500">
        {displayValue.toFixed(1)} / 5.0
      </span>
    </div>
  );
}
