import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

interface AnimatedStarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  delay?: number;
  className?: string;
}

export function AnimatedStarRating({ 
  rating, 
  size = 'md', 
  delay = 0, 
  className = '' 
}: AnimatedStarRatingProps) {
  const [displayedRating, setDisplayedRating] = useState(0);
  
  // Защита от undefined/null значений
  const safeRating = rating || 0;
  
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayedRating(safeRating);
    }, delay);

    return () => clearTimeout(timer);
  }, [safeRating, delay]);

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(displayedRating);
    const hasHalfStar = displayedRating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <Star 
            key={i} 
            className={`${sizeClasses[size]} text-yellow-400 fill-current transition-all duration-300`}
            style={{ 
              animationDelay: `${delay + (i - 1) * 100}ms`,
              animation: 'starFill 0.3s ease-in-out forwards'
            }}
          />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <Star 
            key={i} 
            className={`${sizeClasses[size]} text-yellow-400 fill-current opacity-50 transition-all duration-300`}
            style={{ 
              animationDelay: `${delay + (i - 1) * 100}ms`,
              animation: 'starFill 0.3s ease-in-out forwards'
            }}
          />
        );
      } else {
        stars.push(
          <Star 
            key={i} 
            className={`${sizeClasses[size]} text-gray-300 transition-all duration-300`}
            style={{ 
              animationDelay: `${delay + (i - 1) * 100}ms`,
              animation: 'starEmpty 0.3s ease-in-out forwards'
            }}
          />
        );
      }
    }

    return stars;
  };

  return (
    <div className={`flex items-center space-x-0.5 ${className}`}>
      {renderStars()}
    </div>
  );
}
