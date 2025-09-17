import { useTranslation } from '../lib/i18n';
import { useLocation, useRoute } from 'wouter';
import { useState, useEffect } from 'react';

export function LanguageToggle() {
  const [, setLocation] = useLocation();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  
  // Слушаем изменения URL через wouter
  const [, params] = useRoute('*');

  // Обновляем путь при изменении URL
  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, [params]); // Обновляем при изменении параметров wouter

  // Определяем текущий язык по URL
  const currentLanguage = currentPath.startsWith('/clinic/ro/') || currentPath.startsWith('/ro') ? 'ro' : 'ru';
  console.log('🔄 LanguageToggle: Текущий путь:', currentPath, 'определенный язык:', currentLanguage);

  const handleLanguageChange = (newLanguage: 'ru' | 'ro') => {
    const path = window.location.pathname;
    console.log('🔄 LanguageToggle: Переключение языка на', newLanguage, 'текущий путь:', path);
    
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
    } else if (path.startsWith('/ro/')) {
      // Румынские страницы - переключаем на русские
      if (newLanguage === 'ru') {
        if (path === '/ro') {
          newPath = '/';
        } else if (path.startsWith('/ro/city/')) {
          // /ro/city/chisinau/sos -> /city/chisinau/sos
          newPath = path.replace('/ro/', '/');
        } else if (path.startsWith('/ro/')) {
          // /ro/sos -> /sos
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
        }
      }
    }
    
    // Применяем изменения только если путь действительно изменился
    if (newPath !== path) {
      console.log('🔄 LanguageToggle: Переключаем путь:', path, '->', newPath);
      setLocation(newPath);
      document.documentElement.lang = newLanguage;
    } else {
      console.log('🔄 LanguageToggle: Путь не изменился, только обновляем язык');
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
