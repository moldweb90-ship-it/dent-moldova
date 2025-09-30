import { useState, useRef, useEffect } from 'react';
import { imageCache } from '../utils/imageCache';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  priority?: boolean; // Приоритетная загрузка для видимых изображений
  width?: number;
  height?: number;
  sizes?: string;
}

export function LazyImage({ 
  src, 
  alt, 
  className = '', 
  fallbackSrc,
  onError,
  priority = false,
  width = 400,
  height = 300,
  sizes
}: LazyImageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Если это приоритетное изображение, загружаем сразу
    if (priority) {
      loadImage();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
          loadImage();
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px 0px', // Увеличиваем зону предзагрузки
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [hasLoaded, priority]);

  const loadImage = async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      
      // Загружаем изображение через кеш
      const cachedSrc = await imageCache.loadImage(src);
      setCurrentSrc(cachedSrc);
      
    } catch (error) {
      console.warn('Ошибка загрузки изображения:', error);
      setHasError(true);
      
      // Пробуем fallback если есть
      if (fallbackSrc) {
        try {
          const fallbackCachedSrc = await imageCache.loadImage(fallbackSrc);
          setCurrentSrc(fallbackCachedSrc);
          setHasError(false);
        } catch (fallbackError) {
          console.warn('Ошибка загрузки fallback изображения:', fallbackError);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (fallbackSrc && currentSrc !== fallbackSrc && !hasError) {
      setHasError(true);
      loadImage(); // Перезагружаем с fallback
    } else if (onError) {
      onError(e);
    }
  };

  // Показываем skeleton только если изображение не загружено
  const showSkeleton = isLoading && !currentSrc;

  return (
    <div ref={imgRef} className={className}>
      {showSkeleton ? (
        // Skeleton для изображения
        <div className={`${className} bg-gray-200 animate-pulse`}></div>
      ) : currentSrc ? (
        <img
          src={currentSrc}
          alt={alt}
          className={`${className} transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          width={width}
          height={height}
          fetchpriority={priority ? 'high' : undefined}
          sizes={sizes}
          onLoad={() => setIsLoading(false)}
        />
      ) : (
        // Fallback если ничего не загрузилось
        <div className={`${className} bg-gray-100 flex items-center justify-center`}>
          <span className="text-gray-400 text-xs">Изображение недоступно</span>
        </div>
      )}
    </div>
  );
}
