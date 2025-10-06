// Утилиты для работы с Service Worker

interface CacheSettings {
  cacheEnabled: boolean;
  cacheStrategy: 'cacheFirst' | 'networkFirst' | 'staleWhileRevalidate';
  staticAssetsEnabled: boolean;
  staticAssetsDuration: number;
  staticAssetsMaxSize: number;
  apiDataEnabled: boolean;
  apiDataDuration: number;
  apiEndpoints: string[];
  pagesEnabled: boolean;
  pagesDuration: number;
  pagesPreload: boolean;
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private isSupported = 'serviceWorker' in navigator;

  async register(): Promise<boolean> {
    if (!this.isSupported) {
      console.log('Service Worker не поддерживается в этом браузере');
      return false;
    }

    try {
      // Сначала пытаемся зарегистрировать обычный SW
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker зарегистрирован:', this.registration);

      // Обработка обновлений
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration!.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Новый Service Worker установлен, уведомляем пользователя
              this.showUpdateNotification();
            }
          });
        }
      });

      return true;
    } catch (error) {
      console.error('Ошибка регистрации Service Worker:', error);
      
      // Если не удалось - пытаемся зарегистрировать отключенную версию
      try {
        this.registration = await navigator.serviceWorker.register('/sw-disabled.js', {
          scope: '/'
        });
        console.log('Отключенный Service Worker зарегистрирован как fallback');
        return true;
      } catch (fallbackError) {
        console.error('Fallback Service Worker также не удалось зарегистрировать:', fallbackError);
        return false;
      }
    }
  }

  async updateSettings(settings: Partial<CacheSettings>): Promise<void> {
    if (!this.registration || !this.registration.active) {
      console.log('Service Worker не активен');
      return;
    }

    try {
      this.registration.active.postMessage({
        type: 'UPDATE_SETTINGS',
        settings
      });
      console.log('Настройки кеширования обновлены');
    } catch (error) {
      console.error('Ошибка обновления настроек:', error);
    }
  }

  async clearCache(): Promise<void> {
    if (!this.registration || !this.registration.active) {
      console.log('Service Worker не активен');
      return;
    }

    try {
      this.registration.active.postMessage({
        type: 'CLEAR_CACHE'
      });
      console.log('Запрос на очистку кеша отправлен');
    } catch (error) {
      console.error('Ошибка очистки кеша:', error);
    }
  }

  async getCacheStats(): Promise<any> {
    if (!this.registration || !this.registration.active) {
      return null;
    }

    try {
      // Отправляем запрос на получение статистики
      const response = await fetch('/api/admin/cache/stats');
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Ошибка получения статистики кеша:', error);
    }

    return null;
  }

  async skipWaiting(): Promise<void> {
    if (!this.registration || !this.registration.waiting) {
      return;
    }

    try {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      console.log('Service Worker обновлен');
    } catch (error) {
      console.error('Ошибка обновления Service Worker:', error);
    }
  }

  private showUpdateNotification(): void {
    // Показываем уведомление об обновлении
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Обновление доступно', {
        body: 'Доступна новая версия сайта. Обновите страницу.',
        icon: '/favicon.ico',
        tag: 'sw-update'
      });
    }

    // Показываем уведомление в интерфейсе
    const updateBanner = document.createElement('div');
    updateBanner.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #3b82f6;
        color: white;
        padding: 12px;
        text-align: center;
        z-index: 9999;
        font-family: system-ui, -apple-system, sans-serif;
      ">
        <span>Доступно обновление сайта</span>
        <button onclick="this.parentElement.parentElement.remove(); window.location.reload();" 
                style="
                  margin-left: 12px;
                  background: white;
                  color: #3b82f6;
                  border: none;
                  padding: 6px 12px;
                  border-radius: 4px;
                  cursor: pointer;
                  font-weight: 500;
                ">
          Обновить
        </button>
      </div>
    `;
    document.body.appendChild(updateBanner);
  }

  isRegistered(): boolean {
    return this.registration !== null;
  }

  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }
}

// Создаем глобальный экземпляр
export const serviceWorkerManager = new ServiceWorkerManager();

// Функция для инициализации Service Worker
export async function initServiceWorker(): Promise<boolean> {
  // Запрашиваем разрешение на уведомления
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }

  // Регистрируем Service Worker
  return await serviceWorkerManager.register();
}

// Функция для обновления настроек кеширования
export async function updateCacheSettings(settings: Partial<CacheSettings>): Promise<void> {
  await serviceWorkerManager.updateSettings(settings);
}

// Функция для очистки кеша
export async function clearCache(): Promise<void> {
  await serviceWorkerManager.clearCache();
}

// Функция для получения статистики кеша
export async function getCacheStats(): Promise<any> {
  return await serviceWorkerManager.getCacheStats();
}

// Функция для принудительного обновления Service Worker
export async function forceUpdateServiceWorker(): Promise<void> {
  await serviceWorkerManager.skipWaiting();
}

// Экспортируем тип для использования в других файлах
export type { CacheSettings };
