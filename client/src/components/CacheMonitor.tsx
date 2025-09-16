import { useState, useEffect } from 'react';
import { imageCache, CacheStats } from '../utils/imageCache';

interface CacheMonitorProps {
  show?: boolean;
}

export function CacheMonitor({ show = false }: CacheMonitorProps) {
  const [stats, setStats] = useState<CacheStats>({
    totalSize: 0,
    entryCount: 0,
    hitRate: 0,
    hits: 0,
    misses: 0
  });

  useEffect(() => {
    const updateStats = () => {
      setStats(imageCache.getStats());
    };

    // Обновляем статистику каждые 5 секунд
    const interval = setInterval(updateStats, 5000);
    updateStats(); // Первоначальное обновление

    return () => clearInterval(interval);
  }, []);

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const clearCache = () => {
    imageCache.clear();
    setStats(imageCache.getStats());
  };

      if (!show) return null;

      return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Статистика кеша</h3>
            <button
              onClick={clearCache}
              className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
            >
              Очистить кеш
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-gray-600">
            <div className="bg-white p-3 rounded border">
              <div className="text-xs text-gray-500 mb-1">Записей</div>
              <div className="font-semibold text-lg">{stats.entryCount}</div>
            </div>
            <div className="bg-white p-3 rounded border">
              <div className="text-xs text-gray-500 mb-1">Размер</div>
              <div className="font-semibold text-lg">{formatSize(stats.totalSize)}</div>
            </div>
            <div className="bg-white p-3 rounded border">
              <div className="text-xs text-gray-500 mb-1">Попадания</div>
              <div className="font-semibold text-lg text-green-600">{stats.hits}</div>
            </div>
            <div className="bg-white p-3 rounded border">
              <div className="text-xs text-gray-500 mb-1">Промахи</div>
              <div className="font-semibold text-lg text-red-600">{stats.misses}</div>
            </div>
            <div className="bg-white p-3 rounded border col-span-2">
              <div className="text-xs text-gray-500 mb-1">Эффективность кеша</div>
              <div className="font-semibold text-lg text-blue-600">{stats.hitRate.toFixed(1)}%</div>
            </div>
          </div>
        </div>
      );
}
