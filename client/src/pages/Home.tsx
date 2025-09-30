import { useState, useEffect, useCallback, useMemo } from 'react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useRoute } from 'wouter';
import { LanguageToggle } from '../components/LanguageToggle';
import { Filter, X, Plus, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchBar } from '../components/SearchBar';
import { FiltersSidebar, FilterValues } from '../components/FiltersSidebar';
import { ClinicGrid } from '../components/ClinicGrid';
import { ClinicDetail } from '../components/ClinicDetail';
import { LazyClinicCard } from '../components/LazyClinicCard';
import { BookingModal } from '../components/BookingModal';
import { MobileFiltersModal } from '../components/MobileFiltersModal';
import { AddClinicForm } from '../components/AddClinicForm';
import { RecommendedClinics } from '../components/RecommendedClinics';
import { DynamicSEO } from '../components/DynamicSEO';
import { ActiveClinicsCounter } from '../components/ActiveClinicsCounter';

import { useTranslation } from '../lib/i18n';
import { useSEO } from '@/hooks/useSEO';

export default function Home() {
  const { t, changeLanguage } = useTranslation();
  const [location, setLocation] = useLocation();
  
  // Определяем язык и параметры из URL
  const [, paramsRo] = useRoute('/ro');
  const [, cityParamsRu] = useRoute<{ citySlug: string }>('/city/:citySlug');
  const [, cityParamsRo] = useRoute<{ citySlug: string }>('/ro/city/:citySlug');
  const [, districtParamsRu] = useRoute<{ citySlug: string; districtSlug: string }>('/city/:citySlug/:districtSlug');
  const [, districtParamsRo] = useRoute<{ citySlug: string; districtSlug: string }>('/ro/city/:citySlug/:districtSlug');
  
  // Feature-based routes - Romanian
  const [, featurePediatricRo] = useRoute('/ro/pediatric-dentistry');
  const [, featureParkingRo] = useRoute('/ro/parking');
  const [, featureSosRo] = useRoute('/ro/sos');
  const [, featureWork24hRo] = useRoute('/ro/work24h');
  const [, featureCreditRo] = useRoute('/ro/credit');
  const [, featureWeekendRo] = useRoute('/ro/weekend-work');
  const [, cityFeaturePediatricRo] = useRoute<{ citySlug: string }>('/ro/city/:citySlug/pediatric-dentistry');
  const [, cityFeatureParkingRo] = useRoute<{ citySlug: string }>('/ro/city/:citySlug/parking');
  const [, cityFeatureSosRo] = useRoute<{ citySlug: string }>('/ro/city/:citySlug/sos');
  const [, cityFeatureWork24hRo] = useRoute<{ citySlug: string }>('/ro/city/:citySlug/work24h');
  const [, cityFeatureCreditRo] = useRoute<{ citySlug: string }>('/ro/city/:citySlug/credit');
  const [, cityFeatureWeekendRo] = useRoute<{ citySlug: string }>('/ro/city/:citySlug/weekend-work');
  const [, districtFeaturePediatricRo] = useRoute<{ citySlug: string; districtSlug: string }>('/ro/city/:citySlug/:districtSlug/pediatric-dentistry');
  const [, districtFeatureParkingRo] = useRoute<{ citySlug: string; districtSlug: string }>('/ro/city/:citySlug/:districtSlug/parking');
  const [, districtFeatureSosRo] = useRoute<{ citySlug: string; districtSlug: string }>('/ro/city/:citySlug/:districtSlug/sos');
  const [, districtFeatureWork24hRo] = useRoute<{ citySlug: string; districtSlug: string }>('/ro/city/:citySlug/:districtSlug/work24h');
  const [, districtFeatureCreditRo] = useRoute<{ citySlug: string; districtSlug: string }>('/ro/city/:citySlug/:districtSlug/credit');
  const [, districtFeatureWeekendRo] = useRoute<{ citySlug: string; districtSlug: string }>('/ro/city/:citySlug/:districtSlug/weekend-work');
  const [, featureOpenNowRo] = useRoute('/ro/open-now');
  const [, cityFeatureOpenNowRo] = useRoute<{ citySlug: string }>('/ro/city/:citySlug/open-now');
  const [, districtFeatureOpenNowRo] = useRoute<{ citySlug: string; districtSlug: string }>('/ro/city/:citySlug/:districtSlug/open-now');
  
  // Feature-based routes - Russian
  const [, featurePediatricRu] = useRoute('/pediatric-dentistry');
  const [, featureParkingRu] = useRoute('/parking');
  const [, featureSosRu] = useRoute('/sos');
  const [, featureWork24hRu] = useRoute('/work24h');
  const [, featureCreditRu] = useRoute('/credit');
  const [, featureWeekendRu] = useRoute('/weekend-work');
  const [, cityFeaturePediatricRu] = useRoute<{ citySlug: string }>('/city/:citySlug/pediatric-dentistry');
  const [, cityFeatureParkingRu] = useRoute<{ citySlug: string }>('/city/:citySlug/parking');
  const [, cityFeatureSosRu] = useRoute<{ citySlug: string }>('/city/:citySlug/sos');
  const [, cityFeatureWork24hRu] = useRoute<{ citySlug: string }>('/city/:citySlug/work24h');
  const [, cityFeatureCreditRu] = useRoute<{ citySlug: string }>('/city/:citySlug/credit');
  const [, cityFeatureWeekendRu] = useRoute<{ citySlug: string }>('/city/:citySlug/weekend-work');
  const [, districtFeaturePediatricRu] = useRoute<{ citySlug: string; districtSlug: string }>('/city/:citySlug/:districtSlug/pediatric-dentistry');
  const [, districtFeatureParkingRu] = useRoute<{ citySlug: string; districtSlug: string }>('/city/:citySlug/:districtSlug/parking');
  const [, districtFeatureSosRu] = useRoute<{ citySlug: string; districtSlug: string }>('/city/:citySlug/:districtSlug/sos');
  const [, districtFeatureWork24hRu] = useRoute<{ citySlug: string; districtSlug: string }>('/city/:citySlug/:districtSlug/work24h');
  const [, districtFeatureCreditRu] = useRoute<{ citySlug: string; districtSlug: string }>('/city/:citySlug/:districtSlug/credit');
  const [, districtFeatureWeekendRu] = useRoute<{ citySlug: string; districtSlug: string }>('/city/:citySlug/:districtSlug/weekend-work');
  const [, featureOpenNowRu] = useRoute('/open-now');
  const [, cityFeatureOpenNowRu] = useRoute<{ citySlug: string }>('/city/:citySlug/open-now');
  const [, districtFeatureOpenNowRu] = useRoute<{ citySlug: string; districtSlug: string }>('/city/:citySlug/:districtSlug/open-now');
  
  const isRomanian = !!(paramsRo || cityParamsRo || districtParamsRo || 
                       featurePediatricRo || featureParkingRo || featureSosRo || featureWork24hRo || featureCreditRo || featureWeekendRo || featureOpenNowRo ||
                       cityFeaturePediatricRo || cityFeatureParkingRo || cityFeatureSosRo || cityFeatureWork24hRo || cityFeatureCreditRo || cityFeatureWeekendRo || cityFeatureOpenNowRo ||
                       districtFeaturePediatricRo || districtFeatureParkingRo || districtFeatureSosRo || districtFeatureWork24hRo || districtFeatureCreditRo || districtFeatureWeekendRo || districtFeatureOpenNowRo);
  const language = isRomanian ? 'ro' : 'ru';
  
  // Определяем slug из URL
  const citySlug = cityParamsRu?.citySlug || cityParamsRo?.citySlug || districtParamsRu?.citySlug || districtParamsRo?.citySlug ||
                   cityFeaturePediatricRu?.citySlug || cityFeatureParkingRu?.citySlug || cityFeatureSosRu?.citySlug || 
                   cityFeatureWork24hRu?.citySlug || cityFeatureCreditRu?.citySlug || cityFeatureWeekendRu?.citySlug || cityFeatureOpenNowRu?.citySlug ||
                   cityFeaturePediatricRo?.citySlug || cityFeatureParkingRo?.citySlug || cityFeatureSosRo?.citySlug || 
                   cityFeatureWork24hRo?.citySlug || cityFeatureCreditRo?.citySlug || cityFeatureWeekendRo?.citySlug || cityFeatureOpenNowRo?.citySlug ||
                   districtFeaturePediatricRu?.citySlug || districtFeatureParkingRu?.citySlug || districtFeatureSosRu?.citySlug ||
                   districtFeatureWork24hRu?.citySlug || districtFeatureCreditRu?.citySlug || districtFeatureWeekendRu?.citySlug || districtFeatureOpenNowRu?.citySlug ||
                   districtFeaturePediatricRo?.citySlug || districtFeatureParkingRo?.citySlug || districtFeatureSosRo?.citySlug ||
                   districtFeatureWork24hRo?.citySlug || districtFeatureCreditRo?.citySlug || districtFeatureWeekendRo?.citySlug || districtFeatureOpenNowRo?.citySlug;
  const districtSlug = districtParamsRu?.districtSlug || districtParamsRo?.districtSlug ||
                       districtFeaturePediatricRu?.districtSlug || districtFeatureParkingRu?.districtSlug || districtFeatureSosRu?.districtSlug ||
                       districtFeatureWork24hRu?.districtSlug || districtFeatureCreditRu?.districtSlug || districtFeatureWeekendRu?.districtSlug || districtFeatureOpenNowRu?.districtSlug ||
                       districtFeaturePediatricRo?.districtSlug || districtFeatureParkingRo?.districtSlug || districtFeatureSosRo?.districtSlug ||
                       districtFeatureWork24hRo?.districtSlug || districtFeatureCreditRo?.districtSlug || districtFeatureWeekendRo?.districtSlug || districtFeatureOpenNowRo?.districtSlug;
  
  // Определяем активные функции из URL (мемоизируем для предотвращения бесконечных циклов)
  const activeFeatures = useMemo(() => {
    const features = [];
    
    // Проверяем одиночные функции из slug'ов
    if (featurePediatricRu || featurePediatricRo || cityFeaturePediatricRu || cityFeaturePediatricRo || districtFeaturePediatricRu || districtFeaturePediatricRo) {
      features.push('pediatricDentistry');
    }
    if (featureParkingRu || featureParkingRo || cityFeatureParkingRu || cityFeatureParkingRo || districtFeatureParkingRu || districtFeatureParkingRo) {
      features.push('parking');
    }
    if (featureSosRu || featureSosRo || cityFeatureSosRu || cityFeatureSosRo || districtFeatureSosRu || districtFeatureSosRo) {
      features.push('sos');
    }
    if (featureWork24hRu || featureWork24hRo || cityFeatureWork24hRu || cityFeatureWork24hRo || districtFeatureWork24hRu || districtFeatureWork24hRo) {
      features.push('work24h');
    }
    if (featureCreditRu || featureCreditRo || cityFeatureCreditRu || cityFeatureCreditRo || districtFeatureCreditRu || districtFeatureCreditRo) {
      features.push('credit');
    }
    if (featureWeekendRu || featureWeekendRo || cityFeatureWeekendRu || cityFeatureWeekendRo || districtFeatureWeekendRu || districtFeatureWeekendRo) {
      features.push('weekendWork');
    }
    
    // Проверяем URL параметры для множественных функций
    const urlParams = new URLSearchParams(window.location.search);
    const urlFeatures = urlParams.getAll('features');
    if (urlFeatures.length > 0) {
      features.push(...urlFeatures);
    }
    
    return [...new Set(features)]; // Убираем дубликаты
  }, [
    featurePediatricRu, featurePediatricRo, cityFeaturePediatricRu, cityFeaturePediatricRo, districtFeaturePediatricRu, districtFeaturePediatricRo,
    featureParkingRu, featureParkingRo, cityFeatureParkingRu, cityFeatureParkingRo, districtFeatureParkingRu, districtFeatureParkingRo,
    featureSosRu, featureSosRo, cityFeatureSosRu, cityFeatureSosRo, districtFeatureSosRu, districtFeatureSosRo,
    featureWork24hRu, featureWork24hRo, cityFeatureWork24hRu, cityFeatureWork24hRo, districtFeatureWork24hRu, districtFeatureWork24hRo,
    featureCreditRu, featureCreditRo, cityFeatureCreditRu, cityFeatureCreditRo, districtFeatureCreditRu, districtFeatureCreditRo,
    featureWeekendRu, featureWeekendRo, cityFeatureWeekendRu, cityFeatureWeekendRo, districtFeatureWeekendRu, districtFeatureWeekendRo
  ]);

  const activeFeature = activeFeatures.length > 0 ? activeFeatures[0] : null; // Для обратной совместимости
  
  // Определяем, активен ли фильтр "Открыты сейчас" из URL (мемоизируем)
  const isOpenNowActive = useMemo(() => {
    return !!(featureOpenNowRu || featureOpenNowRo || cityFeatureOpenNowRu || cityFeatureOpenNowRo || districtFeatureOpenNowRu || districtFeatureOpenNowRo);
  }, [featureOpenNowRu, featureOpenNowRo, cityFeatureOpenNowRu, cityFeatureOpenNowRo, districtFeatureOpenNowRu, districtFeatureOpenNowRo]);
  
  // useSEO будет вызван условно ниже
  
  // Переключаем язык в i18n системе при изменении URL
  useEffect(() => {
    changeLanguage(language);
    // Обновляем lang атрибут HTML
    document.documentElement.lang = language;
  }, [language]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClinic, setSelectedClinic] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingClinic, setBookingClinic] = useState<any>(null);
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [clinicFormOpen, setClinicFormOpen] = useState(false);
  // Lock body scroll when any modal is open to prevent background jump
  useBodyScrollLock(detailOpen || bookingOpen || mobileFiltersOpen || clinicFormOpen);
  
  const [filters, setFilters] = useState<FilterValues>({
    city: '',
    districts: [],
    features: activeFeatures,
    promotionalLabels: [],
    sort: 'dscore',
    verified: undefined,
    openNow: isOpenNowActive ? true : undefined,
  });

  // ПРИНУДИТЕЛЬНО АКТИВИРУЕМ ФИЛЬТР "ОТКРЫТЫ СЕЙЧАС" ЕСЛИ URL СОДЕРЖИТ open-now
  useEffect(() => {
    if (isOpenNowActive && !filters.openNow) {
      setFilters(prev => ({ ...prev, openNow: true }));
    }
  }, [isOpenNowActive]); // Убрал filters.openNow из зависимостей
  
  const [page, setPage] = useState(1);
  // Количество карточек на странице (вернули как было)
  const limit = 50;
  const [isManualFilterChange, setIsManualFilterChange] = useState(false);

  // Fetch cities
  const { data: cities = [], isLoading: citiesLoading } = useQuery<any[]>({
    queryKey: ['/api/cities', language],
    queryFn: async () => {
      const response = await fetch('/api/cities');
      if (!response.ok) throw new Error('Failed to fetch cities');
      const data = await response.json();
      return data;
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    cacheTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
  });

  // Fetch districts for selected city
  const { data: districts = [], isLoading: districtsLoading } = useQuery<any[]>({
    queryKey: ['/api/cities', filters.city, 'districts', language],
    enabled: !!filters.city,
    queryFn: async () => {
      const response = await fetch(`/api/cities/${filters.city}/districts`);
      if (!response.ok) throw new Error('Failed to fetch districts');
      const data = await response.json();
      return data;
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    cacheTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
  });

  // Устанавливаем фильтры на основе URL после загрузки данных
  useEffect(() => {
    if (citySlug && cities.length > 0) {
      const slugField = language === 'ro' ? 'slugRo' : 'slugRu';
      const selectedCity = cities.find(c => c[slugField] === citySlug);
      
      if (selectedCity) {
        setFilters(prev => ({
          ...prev,
          city: selectedCity.id,
          districts: districtSlug && districts.length > 0 
            ? [districts.find(d => d[slugField] === districtSlug)?.id].filter(Boolean)
            : [],
          features: activeFeatures.length > 0 ? activeFeatures : prev.features
        }));
      }
    } else if (!citySlug) {
      // Если нет citySlug в URL, сбрасываем фильтры города и района, но сохраняем функцию
      setFilters(prev => ({
        ...prev,
        city: '',
        districts: [],
        features: activeFeatures.length > 0 ? activeFeatures : prev.features
      }));
    }
    
    // Если есть активные функции, но они не установлены в фильтрах
    // Проверяем, что это не результат ручного снятия галочки пользователем
    if (activeFeatures.length > 0 && !isManualFilterChange) {
      const missingFeatures = activeFeatures.filter(f => !filters.features.includes(f));
      if (missingFeatures.length > 0) {
        setFilters(prev => ({
          ...prev,
          features: [...new Set([...prev.features, ...activeFeatures])]
        }));
      }
    }
    
    // Сбрасываем флаг ручного изменения после обработки URL
    if (isManualFilterChange) {
      setIsManualFilterChange(false);
    }
  }, [citySlug, districtSlug, cities, districts, language, activeFeatures, isManualFilterChange]);

  
  // Build query parameters
  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams();
    
    if (searchQuery) params.set('q', searchQuery);
    if (filters.city) params.set('city', filters.city);
    if (filters.districts.length > 0) {
      filters.districts.forEach(d => params.append('districts', d));
    }
    if (filters.features.length > 0) {
      filters.features.forEach(f => params.append('features', f));
    }
    if (filters.promotionalLabels.length > 0) {
      filters.promotionalLabels.forEach(label => params.append('promotionalLabels', label));
    }
    
    if (filters.verified !== undefined) {
      params.set('verified', filters.verified.toString());
    }
    
    // ПРИНУДИТЕЛЬНАЯ АКТИВАЦИЯ ФИЛЬТРА "ОТКРЫТЫ СЕЙЧАС" ДЛЯ ТЕСТИРОВАНИЯ
    if (isOpenNowActive || filters.openNow) {
      params.set('openNow', 'true');
    }
    
    // ФИЛЬТР "ЕЩЕ ОТКРЫТЫ"
    
    params.set('sort', filters.sort);
    params.set('page', page.toString());
    params.set('limit', limit.toString());
    params.set('language', language);
    
    const queryString = params.toString();
    
    
    return queryString;
  }, [searchQuery, filters, page, language, isOpenNowActive]);

  // Fetch clinics
  const queryKey = ['/api/clinics', buildQueryParams(), language];
  
  const { data: clinicsData, isLoading, isFetching } = useQuery({
    queryKey,
    queryFn: async () => {
      // Добавляем информацию о времени клиента для корректной работы фильтра "Открытые сейчас"
      const clientTime = new Date().toISOString();
      const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const clientTimezoneOffset = new Date().getTimezoneOffset();
      
      const url = `/api/clinics?${buildQueryParams()}&clientTime=${encodeURIComponent(clientTime)}&clientTimezone=${encodeURIComponent(clientTimezone)}&clientTimezoneOffset=${clientTimezoneOffset}`;
      
      // Отправляем время клиента на сервер для корректной работы фильтра "Открытые сейчас"
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch clinics');
      const data = await response.json();
      
      
      return data;
    },
    staleTime: 30 * 1000, // Кешируем на 30 секунд
    cacheTime: 2 * 60 * 1000, // Храним в кеше 2 минуты
    refetchOnWindowFocus: false, // Не перезапрашивать при фокусе
    refetchOnMount: false, // Не перезапрашивать при монтировании если данные есть
  });

  // Логи убраны для предотвращения бесконечного цикла

  // Fetch clinic detail
  const { data: clinicDetail, error: clinicDetailError } = useQuery({
    queryKey: ['/api/clinics', selectedClinic, language],
    enabled: !!selectedClinic,
    queryFn: async () => {
      const response = await fetch(`/api/clinics/${selectedClinic}?language=${language}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch clinic: ${response.status} ${errorText}`);
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  // Fetch site settings for logo
  const { data: siteSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['/api/seo-settings'],
    queryFn: async () => {
      const response = await fetch('/api/seo-settings');
      if (!response.ok) throw new Error('Failed to fetch site settings');
      const settings = await response.json();
      return settings;
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    cacheTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
  });

  // Fetch recommended clinics to check if they exist
  const { data: recommendedData, isLoading: recommendedLoading } = useQuery({
    queryKey: ['/api/recommended-clinics'],
    queryFn: async () => {
      const response = await fetch('/api/recommended-clinics');
      if (!response.ok) throw new Error('Failed to fetch recommended clinics');
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    cacheTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
  });

  const hasRecommendedClinics = recommendedData?.clinics && recommendedData.clinics.length > 0;

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(1);
    // Прокрутка в начало страницы при поиске
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Функция для навигации к URL города/района
  const navigateToLocation = useCallback((cityId: string, districtId?: string) => {
    const safeCities = cities || [];
    const safeDistricts = districts || [];
    
    const selectedCity = safeCities.find(c => c.id === cityId);
    if (!selectedCity) return;

    const citySlug = language === 'ro' ? selectedCity.slugRo : selectedCity.slugRu;
    if (!citySlug) return;

    if (districtId) {
      const selectedDistrict = safeDistricts.find(d => d.id === districtId);
      if (selectedDistrict) {
        const districtSlug = language === 'ro' ? selectedDistrict.slugRo : selectedDistrict.slugRu;
        if (districtSlug) {
          const url = `/${language === 'ro' ? 'ro/' : ''}city/${citySlug}/${districtSlug}`;
          setLocation(url);
        }
      }
    } else {
      const url = `/${language === 'ro' ? 'ro/' : ''}city/${citySlug}`;
      setLocation(url);
    }
  }, [cities, districts, language, setLocation]);

  // Функция для навигации к URL "Открыты сейчас"
  const navigateToOpenNow = useCallback((cityId?: string, districtId?: string) => {
    let baseUrl = language === 'ro' ? '/ro/open-now' : '/open-now';
    
    if (cityId && cities.length > 0) {
      const slugField = language === 'ro' ? 'slugRo' : 'slugRu';
      const city = cities.find(c => c.id === cityId);
      if (city) {
        if (districtId && districts.length > 0) {
          const district = districts.find(d => d.id === districtId);
          if (district) {
            baseUrl = language === 'ro' 
              ? `/ro/city/${city[slugField]}/${district[slugField]}/open-now`
              : `/city/${city[slugField]}/${district[slugField]}/open-now`;
          } else {
            baseUrl = language === 'ro' 
              ? `/ro/city/${city[slugField]}/open-now`
              : `/city/${city[slugField]}/open-now`;
          }
        } else {
          baseUrl = language === 'ro' 
            ? `/ro/city/${city[slugField]}/open-now`
            : `/city/${city[slugField]}/open-now`;
        }
      }
    }
    
    setLocation(baseUrl);
  }, [cities, districts, language, setLocation]);

  // Функция для навигации к URL функций/удобств
  const navigateToFeature = useCallback((features: string[], cityId?: string, districtId?: string) => {
    // Если выбрана только одна функция, используем красивые URL
    if (features.length === 1) {
      const featureSlugMap: Record<string, string> = {
        'pediatricDentistry': 'pediatric-dentistry',
        'parking': 'parking',
        'sos': 'sos',
        'work24h': 'work24h',
        'credit': 'credit',
        'weekendWork': 'weekend-work'
      };

      const featureSlug = featureSlugMap[features[0]];
      if (!featureSlug) return;

      if (cityId) {
        const safeCities = cities || [];
        const safeDistricts = districts || [];
        const selectedCity = safeCities.find(c => c.id === cityId);
        
        if (selectedCity) {
          const citySlug = language === 'ro' ? selectedCity.slugRo : selectedCity.slugRu;
          if (citySlug) {
            if (districtId) {
              // Город + район + функция
              const selectedDistrict = safeDistricts.find(d => d.id === districtId);
              if (selectedDistrict) {
                const districtSlug = language === 'ro' ? selectedDistrict.slugRo : selectedDistrict.slugRu;
                if (districtSlug) {
                  const url = `/${language === 'ro' ? 'ro/' : ''}city/${citySlug}/${districtSlug}/${featureSlug}`;
                  setLocation(url);
                }
              }
            } else {
              // Город + функция
              const url = `/${language === 'ro' ? 'ro/' : ''}city/${citySlug}/${featureSlug}`;
              setLocation(url);
            }
          }
        }
      } else {
        // Только функция
        const url = `/${language === 'ro' ? 'ro/' : ''}${featureSlug}`;
        setLocation(url);
      }
    } else if (features.length > 1) {
      // Если выбрано несколько функций, используем параметры URL
      const params = new URLSearchParams();
      features.forEach(feature => params.append('features', feature));
      
      let baseUrl = `/${language === 'ro' ? 'ro/' : ''}`;
      if (cityId) {
        const safeCities = cities || [];
        const safeDistricts = districts || [];
        const selectedCity = safeCities.find(c => c.id === cityId);
        
        if (selectedCity) {
          const citySlug = language === 'ro' ? selectedCity.slugRo : selectedCity.slugRu;
          if (citySlug) {
            if (districtId) {
              const selectedDistrict = safeDistricts.find(d => d.id === districtId);
              if (selectedDistrict) {
                const districtSlug = language === 'ro' ? selectedDistrict.slugRo : selectedDistrict.slugRu;
                if (districtSlug) {
                  baseUrl += `city/${citySlug}/${districtSlug}`;
                }
              }
            } else {
              baseUrl += `city/${citySlug}`;
            }
          }
        }
      }
      
      const url = `${baseUrl}?${params.toString()}`;
      setLocation(url);
    }
  }, [cities, districts, language, setLocation]);

  const handleFiltersChange = useCallback((newFilters: FilterValues) => {
    setIsManualFilterChange(true); // Отмечаем как ручное изменение
    
    // Проверяем, изменился ли город, район или функции для навигации
    const cityChanged = newFilters.city !== filters.city;
    const districtChanged = newFilters.districts.length !== filters.districts.length || 
                           newFilters.districts[0] !== filters.districts[0];
    const featuresChanged = newFilters.features.length !== filters.features.length || 
                           !newFilters.features.every(f => filters.features.includes(f)) ||
                           !filters.features.every(f => newFilters.features.includes(f));
    
    // Проверяем, изменился ли фильтр openNow
    const openNowChanged = newFilters.openNow !== filters.openNow;
    
    // Если изменились только фильтры без навигации (verified, promotionalLabels, sort)
    const onlyFilterChanged = !cityChanged && !districtChanged && !featuresChanged && !openNowChanged;
    
    if (onlyFilterChanged) {
      setFilters(newFilters);
      setPage(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    // Если изменился только фильтр openNow
    if (openNowChanged && !cityChanged && !districtChanged && !featuresChanged) {
      // Принудительно очищаем кэш перед навигацией
      if (window.queryClient) {
        window.queryClient.invalidateQueries({ queryKey: ['/api/clinics'] });
        window.queryClient.removeQueries({ queryKey: ['/api/clinics'] });
      }
      
      if (newFilters.openNow) {
        // Включаем фильтр "Открыты сейчас" - переходим на URL
        navigateToOpenNow(newFilters.city, newFilters.districts[0]);
      } else {
        // Выключаем фильтр "Открыты сейчас" - возвращаемся на обычную страницу
        if (newFilters.features.length > 0) {
          navigateToFeature(newFilters.features, newFilters.city, newFilters.districts[0]);
        } else if (newFilters.city) {
          navigateToLocation(newFilters.city, newFilters.districts[0]);
        } else {
          const homeUrl = language === 'ro' ? '/ro' : '/';
          setLocation(homeUrl);
        }
      }
      setFilters(newFilters);
      setPage(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    // Если пользователь выбрал "Все города" (city = ''), возвращаемся на главную
    if (cityChanged && !newFilters.city) {
      // Если есть активная функция, переходим на страницу функции без города
      if (newFilters.features.length > 0) {
        navigateToFeature(newFilters.features);
      } else {
      const homeUrl = language === 'ro' ? '/ro' : '/';
      setLocation(homeUrl);
      }
      setFilters(newFilters);
      setPage(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    // Если изменилась функция
    if (featuresChanged) {
      if (newFilters.features.length > 0) {
        // Выбрана новая функция - переходим на страницу функции
        const districtId = newFilters.districts.length > 0 ? newFilters.districts[0] : undefined;
        navigateToFeature(newFilters.features, newFilters.city, districtId);
        // Обновляем фильтры после навигации
        setTimeout(() => {
          setFilters(newFilters);
          setPage(1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 0);
        return;
      } else if (newFilters.city) {
        // Убрана функция, но есть город - переходим на страницу города
        navigateToLocation(newFilters.city);
        // Важно: обновляем фильтры после навигации
        setTimeout(() => {
          setFilters(newFilters);
          setPage(1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 0);
        return;
      } else {
        // Убрана функция и нет города - переходим на главную
        const homeUrl = language === 'ro' ? '/ro' : '/';
        setLocation(homeUrl);
        setFilters(newFilters);
        setPage(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    
    if (cityChanged && newFilters.city) {
      // Если выбран конкретный город
      if (newFilters.features.length > 0) {
        // Есть активная функция - переходим на страницу город+функция
        const districtId = newFilters.districts.length > 0 ? newFilters.districts[0] : undefined;
        navigateToFeature(newFilters.features, newFilters.city, districtId);
      } else {
        // Нет функции - переходим на страницу города
        const districtId = newFilters.districts.length > 0 ? newFilters.districts[0] : undefined;
        if (districtId) {
          navigateToLocation(newFilters.city, districtId);
        } else {
      navigateToLocation(newFilters.city);
        }
      }
      // Обновляем фильтры после навигации
      setTimeout(() => {
        setFilters(newFilters);
        setPage(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 0);
      return;
    }
    
    if (districtChanged && newFilters.city) {
      if (newFilters.districts.length > 0) {
        // Выбран новый район
        if (newFilters.features.length > 0) {
          // Есть функция - переходим на страницу район+функция
          navigateToFeature(newFilters.features, newFilters.city, newFilters.districts[0]);
        } else {
          // Нет функции - переходим на страницу района
      navigateToLocation(newFilters.city, newFilters.districts[0]);
        }
      } else {
        // Район убран - переходим на страницу города или город+функция
        if (newFilters.features.length > 0) {
          // Есть функция - переходим на страницу город+функция
          navigateToFeature(newFilters.features, newFilters.city);
        } else {
          // Нет функции - переходим на страницу города
          navigateToLocation(newFilters.city);
        }
      }
      // Обновляем фильтры после навигации
      setTimeout(() => {
        setFilters(newFilters);
        setPage(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 0);
      return;
    }
    
    // Обычное изменение фильтров без навигации
    setFilters(newFilters);
    setPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [filters.city, filters.districts, filters.features, filters.openNow, navigateToLocation, navigateToFeature, navigateToOpenNow, language, setLocation, setIsManualFilterChange]);

  const handleApplyFilters = useCallback(() => {
    setPage(1);
    // Прокрутка в начало страницы при применении фильтров
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleResetFilters = useCallback(() => {
    // Сбрасываем все фильтры, включая город
    setFilters({
      city: '',
      districts: [],
      features: [],
      promotionalLabels: [],
      sort: 'dscore',
      verified: undefined,
      openNow: undefined,
    });
    setSearchQuery('');
    setPage(1);
    
    // Возвращаемся на главную страницу
    const homeUrl = language === 'ro' ? '/ro' : '/';
    setLocation(homeUrl);
    
    // Прокрутка в начало страницы при сбросе фильтров
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [language, setLocation]);

  const handleClinicClick = useCallback((slug: string) => {
    setSelectedClinic(slug);
    setDetailOpen(true);
  }, []);

  const handlePricesClick = useCallback((slug: string) => {
    setSelectedClinic(slug);
    setDetailOpen(true);
  }, []);

  const handleBookClick = useCallback((clinic: any) => {
    setBookingClinic(clinic);
    setBookingOpen(true);
  }, []);

  const handlePhoneClick = useCallback((clinic: any) => {
    if (clinic.phone) {
      window.open(`tel:${clinic.phone}`, '_self');
    }
  }, []);

  const handleWebsiteClick = useCallback((clinic: any) => {
    if (clinic.website) {
      window.open(clinic.website, '_blank');
    }
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Генерируем SEO данные в зависимости от выбранной локации и функций
  const generateSEOData = useCallback(() => {
    const safeCities = cities || [];
    const safeDistricts = districts || [];
    
    const selectedCity = citySlug && safeCities.length > 0 
      ? safeCities.find(c => c[language === 'ro' ? 'slugRo' : 'slugRu'] === citySlug)
      : null;
    
    const selectedDistrict = districtSlug && safeDistricts.length > 0
      ? safeDistricts.find(d => d[language === 'ro' ? 'slugRo' : 'slugRu'] === districtSlug)
      : null;

    // Функция для склонения городов (предложный падеж - "в чём?")
    const getCityNameDeclension = (city: any) => {
      if (!city) return '';
      
      if (language === 'ru') {
        const cityDecl: Record<string, string> = {
          'Кишинёв': 'Кишинёве',
          'Бельцы': 'Бельцах', 
          'Комрат': 'Комрате',
          'Тирасполь': 'Тирасполе',
          'Кахул': 'Кахуле',
          'Орхей': 'Орхее',
          'Сорока': 'Сороке',
          'Унгены': 'Унгенах'
        };
        return cityDecl[city.nameRu] || city.nameRu;
      } else {
        // Для румынского языка склонение не требуется
        return city.nameRo;
      }
    };

    // Функция для склонения районов (предложный падеж - "на чём?")
    const getDistrictNameDeclension = (district: any) => {
      if (!district) return '';
      
      if (language === 'ru') {
        const districtDecl: Record<string, string> = {
          'Центр': 'Центре',
          'Ботаника': 'Ботанике',
          'Рышкань': 'Рышканах',
          'Чеканы': 'Чеканах',
          'Скулянка': 'Скулянке',
          'Буюканы': 'Буюканах',
          'Телецентр': 'Телецентре',
          'Пост': 'Посту'
        };
        return districtDecl[district.nameRu] || district.nameRu;
      } else {
        // Для румынского языка склонение не требуется
        return district.nameRo;
      }
    };

    const cityName = selectedCity ? getCityNameDeclension(selectedCity) : '';
    const districtName = selectedDistrict ? getDistrictNameDeclension(selectedDistrict) : '';

    // Названия функций для SEO
    const featureNames: Record<string, { ru: string, ro: string, slug: string, titleRu: string, titleRo: string }> = {
      'pediatricDentistry': { 
        ru: 'Детская стоматология', 
        ro: 'Stomatologie pediatrică',
        slug: 'pediatric-dentistry',
        titleRu: 'Детские стоматологические клиники',
        titleRo: 'Clinici stomatologice pediatrice'
      },
      'parking': { 
        ru: 'Парковка', 
        ro: 'Parcare',
        slug: 'parking',
        titleRu: 'Стоматологические клиники с парковкой',
        titleRo: 'Clinici stomatologice cu parcare'
      },
      'sos': { 
        ru: 'SOS услуги', 
        ro: 'Servicii SOS',
        slug: 'sos',
        titleRu: 'Срочные стоматологии',
        titleRo: 'Stomatologii urgente'
      },
      'work24h': { 
        ru: 'Работа 24 часа', 
        ro: 'Lucru 24 ore',
        slug: 'work24h',
        titleRu: 'Круглосуточные стоматологии',
        titleRo: 'Stomatologii 24/7'
      },
      'credit': { 
        ru: 'Кредит', 
        ro: 'Credit',
        slug: 'credit',
        titleRu: 'Стоматологии в рассрочку',
        titleRo: 'Stomatologii în rate'
      },
      'weekendWork': { 
        ru: 'Работа в выходные', 
        ro: 'Lucru în weekend',
        slug: 'weekend-work',
        titleRu: 'Стоматологии работающие в выходные',
        titleRo: 'Stomatologii care lucrează în weekend'
      }
    };

    // Обработка множественных функций для SEO
    const getMultipleFeaturesTitle = (features: string[]) => {
      if (features.length === 0) return { title: '', name: '' };
      if (features.length === 1) {
        const feature = featureNames[features[0]];
        return {
          title: language === 'ru' ? feature.titleRu : feature.titleRo,
          name: language === 'ru' ? feature.ru : feature.ro
        };
      }
      
      // Для множественных функций создаем комбинированное название
      const titles = features.map(f => featureNames[f] ? (language === 'ru' ? featureNames[f].titleRu : featureNames[f].titleRo) : '').filter(Boolean);
      const names = features.map(f => featureNames[f] ? (language === 'ru' ? featureNames[f].ru : featureNames[f].ro) : '').filter(Boolean);
      
      if (language === 'ru') {
        // Для русского: "Детские стоматологические клиники с парковкой"
        const mainTitle = titles[0];
        const additionalFeatures = titles.slice(1);
        if (additionalFeatures.length > 0) {
          const additional = additionalFeatures.map(t => t.toLowerCase().replace('стоматологические клиники', '').replace('стоматологии', '').trim()).join(' и ');
          return {
            title: `${mainTitle} с ${additional}`,
            name: names.join(' и ')
          };
        }
        return { title: mainTitle, name: names[0] };
      } else {
        // Для румынского: простое перечисление
        return {
          title: titles.join(' și '),
          name: names.join(' și ')
        };
      }
    };

    const selectedFeatures = activeFeatures.length > 0 ? activeFeatures : (activeFeature ? [activeFeature] : []);
    const featureInfo = getMultipleFeaturesTitle(selectedFeatures);
    const featureTitle = featureInfo.title;
    const featureName = featureInfo.name;

    // Генерируем canonical URL
    let canonical = `/${language === 'ro' ? 'ro/' : ''}`;
    if (isOpenNowActive && selectedCity && selectedDistrict) {
      canonical += `city/${citySlug}/${districtSlug}/open-now`;
    } else if (isOpenNowActive && selectedCity) {
      canonical += `city/${citySlug}/open-now`;
    } else if (isOpenNowActive) {
      canonical += 'open-now';
    } else if (selectedFeatures.length === 1 && selectedCity && selectedDistrict) {
      const feature = featureNames[selectedFeatures[0]];
      canonical += `city/${citySlug}/${districtSlug}/${feature.slug}`;
    } else if (selectedFeatures.length === 1 && selectedCity) {
      const feature = featureNames[selectedFeatures[0]];
      canonical += `city/${citySlug}/${feature.slug}`;
    } else if (selectedFeatures.length === 1) {
      const feature = featureNames[selectedFeatures[0]];
      canonical += feature.slug;
    } else if (selectedFeatures.length > 1) {
      // Для множественных функций используем параметры
      if (selectedCity && selectedDistrict) {
        canonical += `city/${citySlug}/${districtSlug}`;
      } else if (selectedCity) {
        canonical += `city/${citySlug}`;
      }
      const params = new URLSearchParams();
      selectedFeatures.forEach(feature => params.append('features', feature));
      canonical += `?${params.toString()}`;
    } else if (selectedCity && selectedDistrict) {
      canonical += `city/${citySlug}/${districtSlug}`;
    } else if (selectedCity) {
      canonical += `city/${citySlug}`;
    } else {
      canonical = canonical.slice(0, -1) || '/'; // Remove trailing slash for home
    }

    if (isOpenNowActive && selectedCity && selectedDistrict) {
      // Страница "Открыты сейчас" + город + район
      return {
        title: language === 'ru' 
          ? `Открытые сейчас стоматологические клиники в ${cityName} на ${districtName} - Dent Moldova`
          : `Clinici stomatologice deschise acum în ${cityName}, ${districtName} - Dent Moldova`,
        h1: language === 'ru'
          ? `Открытые сейчас стоматологические клиники в ${cityName} на ${districtName}`
          : `Clinici stomatologice deschise acum în ${cityName}, ${districtName}`,
        description: language === 'ru'
          ? `Найдите открытые сейчас стоматологические клиники в районе ${districtName}, ${cityName}. Запись онлайн, отзывы, цены, адреса и телефоны.`
          : `Găsiți clinici stomatologice deschise acum în sectorul ${districtName}, ${cityName}. Programare online, recenzii, prețuri, adrese și telefoane.`,
        keywords: language === 'ru'
          ? `открытые сейчас стоматологические клиники ${cityName}, стоматолог ${cityName}, лечение зубов ${cityName}, клиника ${cityName}`
          : `clinici stomatologice deschise acum ${cityName}, stomatolog ${cityName}, tratament dentar ${cityName}, clinică ${cityName}`,
        canonical,
        schemaType: 'MedicalBusiness',
        schemaData: {
          name: language === 'ru' ? `Стоматологические клиники в ${cityName}` : `Clinici stomatologice în ${cityName}`,
          description: language === 'ru' 
            ? `Открытые сейчас стоматологические клиники в ${cityName}`
            : `Clinici stomatologice deschise acum în ${cityName}`,
          address: {
            addressLocality: cityName,
            addressCountry: 'MD'
          }
        }
      };
    } else if (isOpenNowActive && selectedCity) {
      // Страница "Открыты сейчас" + город
      return {
        title: language === 'ru' 
          ? `Открытые сейчас стоматологические клиники в ${cityName} - Dent Moldova`
          : `Clinici stomatologice deschise acum în ${cityName} - Dent Moldova`,
        h1: language === 'ru'
          ? `Открытые сейчас стоматологические клиники в ${cityName}`
          : `Clinici stomatologice deschise acum în ${cityName}`,
        description: language === 'ru'
          ? `Найдите открытые сейчас стоматологические клиники в ${cityName}. Запись онлайн, отзывы, цены, адреса и телефоны.`
          : `Găsiți clinici stomatologice deschise acum în ${cityName}. Programare online, recenzii, prețuri, adrese și telefoane.`,
        keywords: language === 'ru'
          ? `открытые сейчас стоматологические клиники ${cityName}, стоматолог ${cityName}, лечение зубов ${cityName}, клиника ${cityName}`
          : `clinici stomatologice deschise acum ${cityName}, stomatolog ${cityName}, tratament dentar ${cityName}, clinică ${cityName}`,
        canonical,
        schemaType: 'MedicalBusiness',
        schemaData: {
          name: language === 'ru' ? `Стоматологические клиники в ${cityName}` : `Clinici stomatologice în ${cityName}`,
          description: language === 'ru' 
            ? `Открытые сейчас стоматологические клиники в ${cityName}`
            : `Clinici stomatologice deschise acum în ${cityName}`,
          address: {
            addressLocality: cityName,
            addressCountry: 'MD'
          }
        }
      };
    } else if (isOpenNowActive) {
      // Страница "Открыты сейчас"
      return {
        title: language === 'ru' 
          ? `Открытые сейчас стоматологические клиники - Dent Moldova`
          : `Clinici stomatologice deschise acum - Dent Moldova`,
        h1: language === 'ru'
          ? `Открытые сейчас стоматологические клиники`
          : `Clinici stomatologice deschise acum`,
        description: language === 'ru'
          ? `Найдите открытые сейчас стоматологические клиники в Молдове. Запись онлайн, отзывы, цены, адреса и телефоны.`
          : `Găsiți clinici stomatologice deschise acum în Moldova. Programare online, recenzii, prețuri, adrese și telefoane.`,
        keywords: language === 'ru'
          ? `открытые сейчас стоматологические клиники, стоматолог, лечение зубов, клиника`
          : `clinici stomatologice deschise acum, stomatolog, tratament dentar, clinică`,
        canonical,
        schemaType: 'MedicalBusiness',
        schemaData: {
          name: language === 'ru' ? `Стоматологические клиники` : `Clinici stomatologice`,
          description: language === 'ru' 
            ? `Открытые сейчас стоматологические клиники в Молдове`
            : `Clinici stomatologice deschise acum în Moldova`,
          address: {
            addressCountry: 'MD'
          }
        }
      };
    } else if (selectedFeatures.length > 0 && selectedCity && selectedDistrict) {
      // Страница функций + город + район
      return {
        title: language === 'ru' 
          ? `${featureTitle} в ${cityName} на ${districtName} - Dent Moldova`
          : `${featureTitle} în ${cityName}, ${districtName} - Dent Moldova`,
        h1: language === 'ru'
          ? `${featureTitle} в ${cityName} на ${districtName}`
          : `${featureTitle} în ${cityName}, ${districtName}`,
        description: language === 'ru'
          ? `Найдите ${featureTitle.toLowerCase()} в районе ${districtName}, ${cityName}. Запись онлайн, отзывы, цены, адреса и телефоны.`
          : `Găsiți ${featureTitle.toLowerCase()} în sectorul ${districtName}, ${cityName}. Programare online, recenzii, prețuri, adrese și telefoane.`,
        keywords: language === 'ru'
          ? `${featureName.toLowerCase()} ${districtName} ${cityName}, стоматология ${districtName}, ${featureName.toLowerCase()} ${cityName}`
          : `${featureName.toLowerCase()} ${districtName} ${cityName}, stomatologie ${districtName}, ${featureName.toLowerCase()} ${cityName}`,
        canonical,
        schemaType: 'LocalBusiness',
        schemaData: {
          name: language === 'ru' ? `${featureTitle} в ${cityName} на ${districtName}` : `${featureTitle} în ${cityName}, ${districtName}`,
          description: language === 'ru'
            ? `Найдите ${featureTitle.toLowerCase()} в районе ${districtName}, ${cityName}. Запись онлайн, отзывы, цены, адреса и телефоны.`
            : `Găsiți ${featureTitle.toLowerCase()} în sectorul ${districtName}, ${cityName}. Programare online, recenzii, prețuri, adrese și telefoane.`,
          '@type': 'Dentist',
          address: {
            '@type': 'PostalAddress',
            addressLocality: selectedCity ? selectedCity[language === 'ro' ? 'nameRo' : 'nameRu'] : '',
            addressRegion: selectedDistrict ? selectedDistrict[language === 'ro' ? 'nameRo' : 'nameRu'] : '',
            addressCountry: 'MD'
          },
          geo: {
            '@type': 'GeoCoordinates',
            latitude: '47.0105',
            longitude: '28.8638'
          },
          url: `https://dent-moldova.com${canonical}`
        }
      };
    } else if (selectedFeatures.length > 0 && selectedCity) {
      // Страница функций + город
      return {
        title: language === 'ru' 
          ? `${featureTitle} в ${cityName} - Dent Moldova`
          : `${featureTitle} în ${cityName} - Dent Moldova`,
        h1: language === 'ru'
          ? `${featureTitle} в ${cityName}`
          : `${featureTitle} în ${cityName}`,
        description: language === 'ru'
          ? `Найдите ${featureTitle.toLowerCase()} в ${cityName}. Запись онлайн, отзывы, цены, адреса и телефоны.`
          : `Găsiți ${featureTitle.toLowerCase()} în ${cityName}. Programare online, recenzii, prețuri, adrese și telefoane.`,
        keywords: language === 'ru'
          ? `${featureName.toLowerCase()} ${cityName}, стоматология ${cityName}, ${featureName.toLowerCase()}`
          : `${featureName.toLowerCase()} ${cityName}, stomatologie ${cityName}, ${featureName.toLowerCase()}`,
        canonical
      };
    } else if (selectedFeatures.length > 0) {
      // Страница функций без города
      return {
        title: language === 'ru' 
          ? `${featureTitle} в Молдове - Dent Moldova`
          : `${featureTitle} în Moldova - Dent Moldova`,
        h1: language === 'ru'
          ? `${featureTitle} в Молдове`
          : `${featureTitle} în Moldova`,
        description: language === 'ru'
          ? `Найдите ${featureTitle.toLowerCase()} в Молдове. Запись онлайн, отзывы, цены, адреса и телефоны.`
          : `Găsiți ${featureTitle.toLowerCase()} în Moldova. Programare online, recenzii, prețuri, adrese și telefoane.`,
        keywords: language === 'ru'
          ? `${featureName.toLowerCase()}, стоматология Молдова, ${featureName.toLowerCase()} клиники`
          : `${featureName.toLowerCase()}, stomatologie Moldova, ${featureName.toLowerCase()} clinici`,
        canonical
      };
    } else if (selectedDistrict && selectedCity) {
      // Страница района
      return {
        title: language === 'ru' 
          ? `Стоматологические клиники в районе ${districtName}, ${cityName} - Dent Moldova`
          : `Clinici stomatologice în sectorul ${districtName}, ${cityName} - Dent Moldova`,
        h1: language === 'ru'
          ? `Стоматологические клиники в районе ${districtName}, ${cityName}`
          : `Clinici stomatologice în sectorul ${districtName}, ${cityName}`,
        description: language === 'ru'
          ? `Найдите лучшие стоматологические клиники в районе ${districtName}, ${cityName}. Запись онлайн, отзывы, цены, адреса и телефоны.`
          : `Găsiți cele mai bune clinici stomatologice în sectorul ${districtName}, ${cityName}. Programare online, recenzii, prețuri, adrese și telefoane.`,
        keywords: language === 'ru'
          ? `стоматология ${districtName} ${cityName}, стоматолог ${districtName}, лечение зубов ${districtName}`
          : `stomatologie ${districtName} ${cityName}, stomatolog ${districtName}, tratament dentar ${districtName}`,
        canonical
      };
    } else if (selectedCity) {
      // Страница города
      return {
        title: language === 'ru' 
          ? `Стоматологические клиники в ${cityName} - Dent Moldova`
          : `Clinici stomatologice în ${cityName} - Dent Moldova`,
        h1: language === 'ru'
          ? `Стоматологические клиники в ${cityName}`
          : `Clinici stomatologice în ${cityName}`,
        description: language === 'ru'
          ? `Найдите лучшие стоматологические клиники в ${cityName}. Запись онлайн, отзывы, цены, адреса и телефоны.`
          : `Găsiți cele mai bune clinici stomatologice în ${cityName}. Programare online, recenzii, prețuri, adrese și telefoane.`,
        keywords: language === 'ru'
          ? `стоматология ${cityName}, стоматолог ${cityName}, лечение зубов ${cityName}, клиника ${cityName}`
          : `stomatologie ${cityName}, stomatolog ${cityName}, tratament dentar ${cityName}, clinică ${cityName}`,
        canonical
      };
    } else {
      // Главная страница - НЕ генерируем SEO данные, используем настройки из админки
      return null; // Возвращаем null чтобы использовались настройки из useSEO
    }
  }, [cities, districts, citySlug, districtSlug, language, activeFeatures, isOpenNowActive]);

  const seoData = useMemo(() => generateSEOData(), [generateSEOData]);
  
  // Всегда вызываем useSEO для правильной работы хуков
  const seoSettings = useSEO(language);
  
  // Но применяем только для главной страницы (когда seoData === null)

  return (
    <>
      {seoData ? (
        <DynamicSEO
          title={seoData.title}
          description={seoData.description}
          keywords={seoData.keywords}
          h1={seoData.h1}
          ogTitle={seoData.title}
          ogDescription={seoData.description}
          canonical={seoData.canonical}
          schemaType={seoData.schemaType}
          schemaData={seoData.schemaData}
          language={language}
        />
      ) : seoSettings?.seoSettings ? (
        <DynamicSEO
          title={language === 'ru' ? seoSettings.seoSettings.siteTitleRu : seoSettings.seoSettings.siteTitleRo}
          description={language === 'ru' ? seoSettings.seoSettings.metaDescriptionRu : seoSettings.seoSettings.metaDescriptionRo}
          keywords={language === 'ru' ? seoSettings.seoSettings.keywordsRu : seoSettings.seoSettings.keywordsRo}
          ogTitle={language === 'ru' ? seoSettings.seoSettings.ogTitleRu : seoSettings.seoSettings.ogTitleRo}
          ogDescription={language === 'ru' ? seoSettings.seoSettings.ogDescriptionRu : seoSettings.seoSettings.ogDescriptionRo}
          canonical={language === 'ru' ? seoSettings.seoSettings.canonicalRu : seoSettings.seoSettings.canonicalRo}
          language={language}
        />
      ) : null}
      <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Mobile: Left side - Filter Button, Center - Logo, Right - Language + Add Clinic */}
            {/* Desktop: Left - Logo, Right - Filter + Language + Add Clinic */}
            <div className="flex items-center md:hidden">
              {/* Mobile Filter Toggle - Left side */}
              <Button
                onClick={() => setMobileFiltersOpen(true)}
                variant="outline"
                size="sm"
                className="flex items-center space-x-1 px-2 bg-gray-100 border-gray-300"
              >
                <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">{t('filters')}</span>
              </Button>
            </div>

            {/* Logo - Center on mobile, Left on desktop */}
            <div className="flex items-center md:flex-none absolute left-1/2 transform -translate-x-1/2 md:relative md:left-auto md:transform-none">
              <button 
                onClick={() => {
                  const isRO = typeof window !== 'undefined' && (window.location.pathname === '/ro' || window.location.pathname.startsWith('/ro/'));
                  window.location.href = isRO ? '/ro' : '/';
                }}
                className="flex items-center space-x-2 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
                title={siteSettings?.logoAlt || t('appTitle')}
              >
                {settingsLoading ? (
                  <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
      ) : siteSettings?.logo ? (
        <img 
          src={siteSettings.logo} 
          alt={siteSettings.logoAlt || t('appTitle')}
          style={{ 
            width: `${siteSettings.logoWidth || 100}px`,
            height: 'auto'
          }}
          className="object-contain"
        />
      ) : (
                  <span>{t('appTitle')}</span>
                )}
              </button>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
              
              {/* Desktop Filter Toggle */}
              <Button
                onClick={() => setFiltersVisible(!filtersVisible)}
                variant="outline"
                size="sm"
                className="hidden md:flex items-center space-x-2"
              >
                {filtersVisible ? (
                  <>
                    <X className="h-4 w-4" />
                    <span>{t('hideFilters')}</span>
                  </>
                ) : (
                  <>
                    <Filter className="h-4 w-4" />
                    <span>{t('showFilters')}</span>
                  </>
                )}
              </Button>
              
              {/* Language Toggle - moved before Add Clinic Button for mobile */}
              <div className="flex md:hidden">
                <LanguageToggle />
              </div>
              
              {/* Add Clinic Button */}
              <Button
                onClick={() => setClinicFormOpen(true)}
                className="hidden md:inline-flex h-9 md:h-9 px-4 md:px-5 pb-[0.7rem] gap-2 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg border border-white/20"
              >
                <Plus className="h-4 w-4" />
                <span className="text-sm font-medium leading-[0]">{t('addClinic')}</span>
              </Button>
              <Button
                onClick={() => setClinicFormOpen(true)}
                className="md:hidden inline-flex h-9 px-3 gap-1 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow md:shadow-md"
                size="sm"
              >
                <Plus className="h-3 w-3" />
                <span className="hidden sm:inline text-xs sm:text-sm leading-[0]">{t('addClinic')}</span>
              </Button>
              
              {/* Language Toggle - for desktop */}
              <div className="hidden md:flex">
                <LanguageToggle />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left Sidebar - Filters (Desktop) */}
        {filtersVisible && (
          <div className="hidden md:block w-80 flex-shrink-0">
            <div className="sticky top-4">
              <FiltersSidebar
                cities={cities}
                districts={districts}
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onApply={handleApplyFilters}
                onReset={handleResetFilters}
                onSearch={handleSearch}
              />
              
              {/* Active Clinics Counter */}
              <div className="p-4 border-t border-gray-200">
                <ActiveClinicsCounter 
                  onClick={() => {
                    setFilters({ 
                      districts: [],
                      features: [],
                      promotionalLabels: [],
                      sort: 'dscore',
                      verified: true 
                    });
                    setPage(1);
                    // Прокрутка в начало страницы при клике на "Активные клиники"
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className={`flex-1 px-4 md:px-8 py-2 md:py-8 md:min-h-screen ${!filtersVisible ? 'max-w-full' : ''}`}>
        

        {/* Recommended Clinics Section */}
        {recommendedLoading ? (
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-6">
              <div className="h-5 w-5 sm:h-6 sm:w-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <div className="p-3 md:p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-2 bg-gray-200 rounded-full"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : hasRecommendedClinics ? (
          <RecommendedClinics
            onClinicClick={handleClinicClick}
            onBookClick={handleBookClick}
            onPricesClick={handlePricesClick}
            language={language}
            clinics={recommendedData.clinics}
          />
        ) : null}
        

        {isLoading ? (
          <div className="space-y-8">
            {/* Results Info Skeleton */}
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-48"></div>
            </div>

            {/* Grid Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="relative rounded-2xl overflow-hidden aspect-[3/4] md:aspect-[4/3] bg-gray-200">
                  <div className="animate-pulse">
                    {/* Background placeholder */}
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-300 to-gray-400"></div>
                    
                    {/* Content overlay */}
                    <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6">
                      {/* Clinic name placeholder */}
                      <div className="h-6 bg-white bg-opacity-40 rounded w-3/4 mb-2"></div>
                      {/* Location placeholder */}
                      <div className="h-4 bg-white bg-opacity-30 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : clinicsData?.clinics?.length > 0 ? (
          <ClinicGrid
            clinics={clinicsData.clinics}
            total={clinicsData.total}
            page={page}
            limit={limit}
            onPageChange={handlePageChange}
            onClinicClick={handleClinicClick}
            onBookClick={handleBookClick}
            onPricesClick={handlePricesClick}
            onPhoneClick={handlePhoneClick}
            onWebsiteClick={handleWebsiteClick}
            filtersVisible={filtersVisible}
            language={language}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchQuery || Object.values(filters).some(v => 
                Array.isArray(v) ? v.length > 0 : v !== false && v !== 'dscore' && !Array.isArray(v) && v !== 0 && v !== 100
              ) 
                ? t('noClinicsFound')
                : t('loading')
              }
            </p>
          </div>
        )}
        </main>
      </div>

      {/* Modals */}
      <ClinicDetail
        clinic={clinicDetail}
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSelectedClinic(null);
        }}
        onBookClick={handleBookClick}
        language={language}
      />
      
      {clinicDetailError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md">
            <h3 className="text-lg font-semibold text-red-600 mb-2">Ошибка загрузки клиники</h3>
            <p className="text-sm text-gray-600 mb-4">{clinicDetailError.message}</p>
            <button 
              onClick={() => {
                setDetailOpen(false);
                setSelectedClinic(null);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
      
      <BookingModal
        clinic={bookingClinic}
        open={bookingOpen}
        onClose={() => {
          setBookingOpen(false);
          setBookingClinic(null);
        }}
      />
      
      {/* Mobile Filters Modal */}
      <MobileFiltersModal
        cities={cities}
        districts={districts}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        onSearch={handleSearch}
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
      />
      
      {/* Add Clinic Form */}
      <AddClinicForm
        open={clinicFormOpen}
        onClose={() => setClinicFormOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8 md:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
          
          
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-600">© 2024 {t('appTitle')}. Все права защищены.</p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex space-x-6 text-sm text-gray-600">
                <a 
                  href={language === 'ro' ? '/ro/pricing' : '/pricing'} 
                  className="hover:text-gray-900 transition-colors"
                >
                  {t('pricing.title')}
                </a>
                <a
                  href={language === 'ro' ? '/ro/privacy' : '/privacy'}
                  className="hover:text-gray-900 transition-colors"
                >
                  {language === 'ro' ? 'Politica de confidențialitate' : 'Политика приватности'}
                </a>
                <a href="#" className="hover:text-gray-900 transition-colors">Контакты</a>
              </div>
              
            </div>
          </div>
        </div>
      </footer>
      </div>
      
    </>
  );
}
