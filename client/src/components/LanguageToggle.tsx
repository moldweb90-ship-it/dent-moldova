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
  const currentLanguage = currentPath.startsWith('/clinic/ro/') || currentPath === '/ro' ? 'ro' : 'ru';
  console.log('🔄 LanguageToggle: Текущий путь:', currentPath, 'определенный язык:', currentLanguage);

  const handleLanguageChange = (newLanguage: 'ru' | 'ro') => {
    const path = window.location.pathname; // Используем актуальный путь
    console.log('🔄 LanguageToggle: Переключение языка на', newLanguage, 'текущий путь:', path);
    
    if (path.startsWith('/clinic/')) {
      // Для страниц клиник
      if (path.startsWith('/clinic/ro/')) {
        // Сейчас румынский, переключаем на русский
        if (newLanguage === 'ru') {
          const slug = path.replace('/clinic/ro/', '');
          const newPath = `/clinic/${slug}`;
          console.log('🔄 LanguageToggle: Переключаем с румынского на русский:', newPath);
          setLocation(newPath);
          // Обновляем lang атрибут
          document.documentElement.lang = newLanguage;
        }
      } else {
        // Сейчас русский, переключаем на румынский
        if (newLanguage === 'ro') {
          const slug = path.replace('/clinic/', '');
          const newPath = `/clinic/ro/${slug}`;
          console.log('🔄 LanguageToggle: Переключаем с русского на румынский:', newPath);
          setLocation(newPath);
          // Обновляем lang атрибут
          document.documentElement.lang = newLanguage;
        }
      }
    } else if (path === '/' || path === '/ro') {
      // Для главной страницы
      if (path === '/ro' && newLanguage === 'ru') {
        // Сейчас румынская главная, переключаем на русскую
        console.log('🔄 LanguageToggle: Переключаем с румынской главной на русскую: /');
        setLocation('/');
        // Обновляем lang атрибут
        document.documentElement.lang = newLanguage;
      } else if (path === '/' && newLanguage === 'ro') {
        // Сейчас русская главная, переключаем на румынскую
        console.log('🔄 LanguageToggle: Переключаем с русской главной на румынскую: /ro');
        setLocation('/ro');
        // Обновляем lang атрибут
        document.documentElement.lang = newLanguage;
      }
    } else {
      // Для других страниц пока оставляем как есть
      console.log('🔄 LanguageToggle: Неподдерживаемая страница, переключение не поддерживается');
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
