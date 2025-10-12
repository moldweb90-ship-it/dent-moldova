import { useEffect } from 'react';
import { useLocation } from 'wouter';

interface HreflangConfig {
  language: 'ru' | 'ro';
  enabled?: boolean;
}

/**
 * Универсальный хук для генерации hreflang тегов
 * Автоматически создает hreflang для текущей страницы и её языковых альтернатив
 */
export function useHreflang({ language, enabled = true }: HreflangConfig) {
  const [location] = useLocation();

  useEffect(() => {
    if (!enabled) return;

    const currentUrl = window.location.origin;
    const currentPath = location;

    // Удаляем существующие hreflang теги
    const existingHreflang = document.querySelectorAll('link[rel="alternate"][hreflang]');
    existingHreflang.forEach(tag => tag.remove());

    // Определяем пути для обоих языков
    let ruPath: string;
    let roPath: string;

    if (language === 'ro') {
      // Текущий путь - румынский
      roPath = currentPath;
      // Генерируем русский путь (убираем /ro)
      if (currentPath.startsWith('/ro/')) {
        ruPath = currentPath.replace('/ro/', '/');
      } else if (currentPath === '/ro') {
        ruPath = '/';
      } else {
        // Для остальных случаев убираем /ro в начале
        ruPath = currentPath.replace(/^\/ro/, '') || '/';
      }
    } else {
      // Текущий путь - русский
      ruPath = currentPath;
      // Генерируем румынский путь (добавляем /ro)
      if (currentPath === '/') {
        roPath = '/ro';
      } else if (currentPath.startsWith('/')) {
        roPath = '/ro' + currentPath;
      } else {
        roPath = '/ro/' + currentPath;
      }
    }

    // Создаем hreflang для русского языка
    const hreflangRu = document.createElement('link');
    hreflangRu.setAttribute('rel', 'alternate');
    hreflangRu.setAttribute('hreflang', 'ru');
    hreflangRu.setAttribute('href', `${currentUrl}${ruPath}`);
    document.head.appendChild(hreflangRu);

    // Создаем hreflang для румынского языка
    const hreflangRo = document.createElement('link');
    hreflangRo.setAttribute('rel', 'alternate');
    hreflangRo.setAttribute('hreflang', 'ro');
    hreflangRo.setAttribute('href', `${currentUrl}${roPath}`);
    document.head.appendChild(hreflangRo);

    // Создаем x-default (по умолчанию русский)
    const hreflangDefault = document.createElement('link');
    hreflangDefault.setAttribute('rel', 'alternate');
    hreflangDefault.setAttribute('hreflang', 'x-default');
    hreflangDefault.setAttribute('href', `${currentUrl}${ruPath}`);
    document.head.appendChild(hreflangDefault);

    console.log('🌐 Hreflang generated:', {
      current: language,
      ru: `${currentUrl}${ruPath}`,
      ro: `${currentUrl}${roPath}`,
      default: `${currentUrl}${ruPath}`
    });

    // Cleanup при размонтировании
    return () => {
      const hreflangTags = document.querySelectorAll('link[rel="alternate"][hreflang]');
      hreflangTags.forEach(tag => tag.remove());
    };
  }, [location, language, enabled]);
}

