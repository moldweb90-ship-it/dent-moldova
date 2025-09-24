import { useTranslation } from '../lib/i18n';
import { useLocation } from 'wouter';
import { useEffect } from 'react';

export function LanguageToggle() {
  const [currentPath, setLocation] = useLocation();
  
  // Получаем текущий путь напрямую из wouter
  // currentPath автоматически обновляется при любых изменениях URL

  // Определяем текущий язык по URL
  const currentLanguage = currentPath.startsWith('/clinic/ro/') || currentPath.startsWith('/ro/') || currentPath === '/ro' ? 'ro' : 'ru';
  // Debug logging removed to prevent infinite loop

  const handleLanguageChange = (newLanguage: 'ru' | 'ro') => {
    // Не переключаем если уже на нужном языке
    if (currentLanguage === newLanguage) {
      // Already on the correct language
      return;
    }

    const fullPath = currentPath + window.location.search; // Включаем query parameters
    const path = currentPath; // Путь без параметров
    const queryString = window.location.search; // Параметры
    // Language switching logic
    
    let newPath = path;
    
    if (path.startsWith('/clinic/')) {
      // Для страниц клиник
      if (path.startsWith('/clinic/ro/')) {
        if (newLanguage === 'ru') {
          const slug = path.replace('/clinic/ro/', '');
          newPath = `/clinic/${slug}`;
        }
      } else {
        if (newLanguage === 'ro') {
          const slug = path.replace('/clinic/', '');
          newPath = `/clinic/ro/${slug}`;
        }
      }
    } else if (path.startsWith('/ro/') || path === '/ro') {
      // Румынские страницы - переключаем на русские
      if (newLanguage === 'ru') {
        if (path === '/ro') {
          newPath = '/';
        } else if (path.startsWith('/ro/city/')) {
          // /ro/city/chisinau/sos -> /city/chisinau/sos
          newPath = path.replace('/ro/', '/');
        } else if (path.startsWith('/ro/')) {
          // /ro/sos -> /sos
          // /ro/?features=parking&features=sos -> /?features=parking&features=sos
          newPath = path.replace('/ro/', '/');
        }
      }
    } else {
      // Русские страницы - переключаем на румынские  
      if (newLanguage === 'ro') {
        if (path === '/') {
          newPath = '/ro';
        } else if (path.startsWith('/city/')) {
          // /city/chisinau/sos -> /ro/city/chisinau/sos
          newPath = '/ro' + path;
        } else if (path.match(/^\/(pediatric-dentistry|parking|sos|work24h|credit|weekend-work)$/)) {
          // /sos -> /ro/sos
          newPath = '/ro' + path;
        } else if (path.match(/^\/city\/[^\/]+\/[^\/]+\/(pediatric-dentistry|parking|sos|work24h|credit|weekend-work)$/)) {
          // /city/chisinau/botanica/sos -> /ro/city/chisinau/botanica/sos
          newPath = '/ro' + path;
        } else {
          // Для всех остальных страниц (включая с URL параметрами)
          newPath = '/ro' + path;
        }
      }
    }
    
    // Добавляем query string к новому пути
    const finalPath = newPath + queryString;
    
    // Применяем изменения только если путь действительно изменился
    if (newPath !== path) {
      // Path changed, navigating
      setLocation(finalPath);
      document.documentElement.lang = newLanguage;
    } else {
      // Path unchanged, only updating language
      document.documentElement.lang = newLanguage;
    }
  };

  return (
    <div className="flex items-center space-x-1 sm:space-x-2">
      <button
        onClick={() => handleLanguageChange('ru')}
        className={`px-2 py-1 text-xs sm:px-3 sm:py-1 sm:text-sm font-medium rounded-md transition-colors ${
          currentLanguage === 'ru'
            ? 'bg-blue-600 text-white'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        RU
      </button>
      <button
        onClick={() => handleLanguageChange('ro')}
        className={`px-2 py-1 text-xs sm:px-3 sm:py-1 sm:text-sm font-medium rounded-md transition-colors ${
          currentLanguage === 'ro'
            ? 'bg-blue-600 text-white'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        RO
      </button>
    </div>
  );
}
