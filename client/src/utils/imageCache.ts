// Система кеширования изображений с несколькими уровнями
interface CacheEntry {
  data: string; // base64 или blob URL
  timestamp: number;
  expiresAt: number;
  size: number;
}

interface CacheStats {
  totalSize: number;
  entryCount: number;
  hitRate: number;
  hits: number;
  misses: number;
}

class ImageCache {
  private memoryCache = new Map<string, CacheEntry>();
    private readonly MAX_MEMORY_SIZE = 200 * 1024 * 1024; // 200MB
    private readonly MAX_ENTRIES = 500;
    private readonly CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 часа
  private readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 минут
  private stats: CacheStats = {
    totalSize: 0,
    entryCount: 0,
    hitRate: 0,
    hits: 0,
    misses: 0
  };

  constructor() {
    this.loadFromLocalStorage();
    this.startCleanupTimer();
  }

  // Загрузка кеша из localStorage при инициализации
  private loadFromLocalStorage() {
    try {
      const cached = localStorage.getItem('imageCache');
      if (cached) {
        const data = JSON.parse(cached);
        const now = Date.now();
        
        // Восстанавливаем только не истекшие записи
        Object.entries(data).forEach(([key, entry]: [string, any]) => {
          if (entry.expiresAt > now) {
            this.memoryCache.set(key, entry);
            this.stats.totalSize += entry.size;
            this.stats.entryCount++;
          }
        });
        
        console.log(`🔄 Восстановлено ${this.stats.entryCount} изображений из кеша`);
      }
    } catch (error) {
      console.warn('Ошибка загрузки кеша:', error);
    }
  }

  // Сохранение кеша в localStorage
  private saveToLocalStorage() {
    try {
      const data: Record<string, CacheEntry> = {};
      this.memoryCache.forEach((entry, key) => {
        data[key] = entry;
      });
      localStorage.setItem('imageCache', JSON.stringify(data));
    } catch (error) {
      console.warn('Ошибка сохранения кеша:', error);
    }
  }

  // Получение изображения из кеша
  async get(src: string): Promise<string | null> {
    const entry = this.memoryCache.get(src);
    
    if (entry) {
      if (entry.expiresAt > Date.now()) {
        this.stats.hits++;
        this.updateHitRate();
        return entry.data;
      } else {
        // Удаляем истекшую запись
        this.memoryCache.delete(src);
        this.stats.totalSize -= entry.size;
        this.stats.entryCount--;
      }
    }
    
    this.stats.misses++;
    this.updateHitRate();
    return null;
  }

  // Сохранение изображения в кеш
  async set(src: string, data: string): Promise<void> {
    const size = this.estimateSize(data);
    const now = Date.now();
    
    const entry: CacheEntry = {
      data,
      timestamp: now,
      expiresAt: now + this.CACHE_DURATION,
      size
    };

    // Проверяем лимиты
    this.enforceLimits(size);
    
    this.memoryCache.set(src, entry);
    this.stats.totalSize += size;
    this.stats.entryCount++;
    
    // Сохраняем в localStorage
    this.saveToLocalStorage();
    
    console.log(`💾 Изображение сохранено в кеш: ${src.substring(0, 50)}... (${this.formatSize(size)})`);
  }

  // Загрузка изображения с кешированием
  async loadImage(src: string): Promise<string> {
    // Проверяем кеш
    const cached = await this.get(src);
    if (cached) {
      return cached;
    }

    // Загружаем изображение
    try {
      const response = await fetch(src);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const blob = await response.blob();
      const dataUrl = await this.blobToDataUrl(blob);
      
      // Сохраняем в кеш
      await this.set(src, dataUrl);
      
      return dataUrl;
    } catch (error) {
      console.error('Ошибка загрузки изображения:', error);
      throw error;
    }
  }

  // Очистка истекших записей
  private cleanup() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.expiresAt <= now) {
        this.memoryCache.delete(key);
        this.stats.totalSize -= entry.size;
        this.stats.entryCount--;
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Очищено ${cleaned} истекших записей из кеша`);
      this.saveToLocalStorage();
    }
  }

  // Принудительная очистка старых записей при превышении лимитов
  private enforceLimits(newEntrySize: number) {
    // Удаляем старые записи если превышен лимит размера
    while (this.stats.totalSize + newEntrySize > this.MAX_MEMORY_SIZE && this.memoryCache.size > 0) {
      const oldestKey = this.memoryCache.keys().next().value;
      const oldestEntry = this.memoryCache.get(oldestKey);
      if (oldestEntry) {
        this.memoryCache.delete(oldestKey);
        this.stats.totalSize -= oldestEntry.size;
        this.stats.entryCount--;
      }
    }

    // Удаляем записи если превышен лимит количества
    while (this.memoryCache.size >= this.MAX_ENTRIES) {
      const oldestKey = this.memoryCache.keys().next().value;
      const oldestEntry = this.memoryCache.get(oldestKey);
      if (oldestEntry) {
        this.memoryCache.delete(oldestKey);
        this.stats.totalSize -= oldestEntry.size;
        this.stats.entryCount--;
      }
    }
  }

  // Таймер для периодической очистки
  private startCleanupTimer() {
    setInterval(() => {
      this.cleanup();
    }, this.CLEANUP_INTERVAL);
  }

  // Вспомогательные методы
  private estimateSize(data: string): number {
    // Примерная оценка размера base64 данных
    return Math.round(data.length * 0.75);
  }

  private formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  private async blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private updateHitRate() {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }

  // Публичные методы для мониторинга
  getStats(): CacheStats {
    return { ...this.stats };
  }

  clear(): void {
    this.memoryCache.clear();
    this.stats = {
      totalSize: 0,
      entryCount: 0,
      hitRate: 0,
      hits: 0,
      misses: 0
    };
    localStorage.removeItem('imageCache');
  }

  // Предзагрузка изображений
  async preloadImages(urls: string[]): Promise<void> {
    const promises = urls.map(async (url) => {
      try {
        await this.loadImage(url);
      } catch (error) {
        console.warn(`Не удалось предзагрузить изображение: ${url}`, error);
      }
    });
    
    await Promise.allSettled(promises);
    console.log(`🚀 Предзагружено ${urls.length} изображений`);
  }
}

// Создаем глобальный экземпляр кеша
export const imageCache = new ImageCache();

// Экспортируем типы для использования в компонентах
export type { CacheStats };
