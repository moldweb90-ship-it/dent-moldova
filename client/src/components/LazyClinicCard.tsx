import { useState, useRef, useEffect } from 'react';
import { ClinicCard } from './ClinicCard';

interface LazyClinicCardProps {
  clinic: any;
  language: string;
  onClinicClick: (slug: string) => void;
  onBookClick: (clinic: any) => void;
  onPricesClick: (slug: string) => void;
  onPhoneClick: (clinic: any) => void;
  onWebsiteClick: (clinic: any) => void;
  priority?: boolean; // Приоритетная загрузка для первых карточек
}

export function LazyClinicCard({
  clinic,
  language,
  onClinicClick,
  onBookClick,
  onPricesClick,
  onPhoneClick,
  onWebsiteClick,
  priority = false,
}: LazyClinicCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
          // Отключаем observer после первой загрузки
          observer.disconnect();
        }
      },
      {
        // Загружаем карточку когда она появляется в viewport с небольшим отступом
        rootMargin: '100px 0px',
        threshold: 0.1,
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [hasLoaded]);

  return (
    <div ref={cardRef} className="w-full">
      {isVisible ? (
        <ClinicCard
          clinic={clinic}
          language={language}
          onClinicClick={onClinicClick}
          onBookClick={onBookClick}
          onPricesClick={onPricesClick}
          onPhoneClick={onPhoneClick}
          onWebsiteClick={onWebsiteClick}
          priority={priority}
        />
      ) : (
        // Skeleton loader для карточки клиники
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
          <div className="flex items-start space-x-4">
            {/* Логотип skeleton */}
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
            
            <div className="flex-1 min-w-0">
              {/* Название skeleton */}
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
              
              {/* Адрес skeleton */}
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              
              {/* Рейтинг skeleton */}
              <div className="flex items-center space-x-2 mb-2">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
              
              {/* Цены skeleton */}
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              
              {/* Кнопки skeleton */}
              <div className="flex space-x-2 mt-3">
                <div className="h-8 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
