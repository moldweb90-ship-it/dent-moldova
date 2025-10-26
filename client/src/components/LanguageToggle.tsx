import { useLocation } from 'wouter';

interface City {
  id: string;
  nameRu: string;
  nameRo: string;
  slugRu: string;
  slugRo: string;
}

interface LanguageToggleProps {
  cities?: City[];
}

export function LanguageToggle({ cities = [] }: LanguageToggleProps) {
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
          // /ro/city/cahul -> /city/kahul (используем slugRu)
          const citySlug = path.split('/')[3]; // Получаем slug города
          const city = cities.find(c => c.slugRo === citySlug);
          if (city && city.slugRu) {
            newPath = `/city/${city.slugRu}`;
            // Добавляем остальную часть пути (район, функция и т.д.)
            const remainingPath = path.split('/').slice(4).join('/');
            if (remainingPath) {
              newPath += `/${remainingPath}`;
            }
          } else {
            // Fallback: используем старую логику если город не найден
            newPath = path.replace('/ro/', '/');
          }
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
          // /city/kahul -> /ro/city/cahul (используем slugRo)
          const citySlug = path.split('/')[2]; // Получаем slug города
          const city = cities.find(c => c.slugRu === citySlug);
          if (city && city.slugRo) {
            newPath = `/ro/city/${city.slugRo}`;
            // Добавляем остальную часть пути (район, функция и т.д.)
            const remainingPath = path.split('/').slice(3).join('/');
            if (remainingPath) {
              newPath += `/${remainingPath}`;
            }
          } else {
            // Fallback: используем старую логику если город не найден
            newPath = '/ro' + path;
          }
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

  // Fancy RU/RO toggle
  const isRO = currentLanguage === 'ro';
  return (
    <div className="lang-toggle inline-flex h-9 items-center">
      <div className="toggle-button-cover">
        <div className="button r" id="lang-button">
          <input
            className="checkbox"
            type="checkbox"
            aria-label={isRO ? 'Romanian' : 'Russian'}
            checked={isRO}
            onChange={(e) => handleLanguageChange(e.target.checked ? 'ro' : 'ru')}
          />
          <div className="knobs" />
          <div className="layer" />
        </div>
      </div>
    </div>
  );
}
