import { useState, useEffect, useCallback } from 'react';
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
import { AddClinicModal } from '../components/AddClinicModal';
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
  
  const isRomanian = !!(paramsRo || cityParamsRo || districtParamsRo);
  const language = isRomanian ? 'ro' : 'ru';
  
  // Определяем slug из URL
  const citySlug = cityParamsRu?.citySlug || cityParamsRo?.citySlug || districtParamsRu?.citySlug || districtParamsRo?.citySlug;
  const districtSlug = districtParamsRu?.districtSlug || districtParamsRo?.districtSlug;
  
  useSEO(language); // Применяем глобальные SEO настройки только на главной странице
  
  // Переключаем язык в i18n системе при изменении URL
  useEffect(() => {
    changeLanguage(language);
    // Обновляем lang атрибут HTML
    document.documentElement.lang = language;
  }, [language, changeLanguage]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClinic, setSelectedClinic] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingClinic, setBookingClinic] = useState<any>(null);
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [clinicFormOpen, setClinicFormOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  const [filters, setFilters] = useState<FilterValues>({
    city: '',
    districts: [],
    features: [],
    promotionalLabels: [],
    sort: 'dscore',
    verified: undefined
  });
  
  const [page, setPage] = useState(1);
  const limit = 50;

  // Убираем отслеживание скролла для анимированного меню
  // useEffect(() => {
  //   const handleScroll = () => {
  //     const currentScrollY = window.scrollY;
  //     const headerHeight = 64;
  //     
  //     if (currentScrollY > headerHeight) {
  //       setIsHeaderVisible(true);
  //     } else {
  //       setIsHeaderVisible(false);
  //     }
  //     
  //     setLastScrollY(currentScrollY);
  //   };

  //   window.addEventListener('scroll', handleScroll, { passive: true });
  //   return () => window.removeEventListener('scroll', handleScroll);
  // }, [lastScrollY]);

  // Fetch cities
  const { data: cities = [], isLoading: citiesLoading } = useQuery<any[]>({
    queryKey: ['/api/cities', language],
    queryFn: async () => {
      const response = await fetch('/api/cities');
      if (!response.ok) throw new Error('Failed to fetch cities');
      const data = await response.json();
      console.log('🔍 Cities loaded:', data);
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
      console.log('🔍 Districts loaded for city', filters.city, ':', data);
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
            : []
        }));
      }
    } else if (!citySlug) {
      // Если нет citySlug в URL, сбрасываем фильтры города и района
      setFilters(prev => ({
        ...prev,
        city: '',
        districts: []
      }));
    }
  }, [citySlug, districtSlug, cities, districts, language]);
  
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
    
    if (filters.openNow !== undefined) {
      params.set('openNow', filters.openNow.toString());
    }
    
    params.set('sort', filters.sort);
    params.set('page', page.toString());
    params.set('limit', limit.toString());
    params.set('language', language);
    
    const queryString = params.toString();
    console.log('🔍 Frontend query params:', queryString);
    console.log('🔍 Frontend filters:', filters);
    console.log('🔍 Cities available:', cities.length);
    console.log('🔍 Districts available:', districts.length);
    
    return queryString;
  }, [searchQuery, filters, page, language, cities.length, districts.length]);

  // Fetch clinics
  const queryKey = ['/api/clinics', buildQueryParams(), language];
  console.log('🔍 Query key:', queryKey);
  
  const { data: clinicsData, isLoading, isFetching } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await fetch(`/api/clinics?${buildQueryParams()}`);
      if (!response.ok) throw new Error('Failed to fetch clinics');
      const data = await response.json();
      console.log('🔍 Clinics data received:', data.clinics.length, 'clinics');
      // console.log('🔍 First clinic sample:', data.clinics[0]);
      return data;
    },
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
    cacheTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

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
      console.log('🔍 Site settings loaded:', settings);
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

  const handleFiltersChange = useCallback((newFilters: FilterValues) => {
    console.log('🔍 handleFiltersChange:', newFilters);
    
    // Проверяем, изменился ли город или район для навигации
    const cityChanged = newFilters.city !== filters.city;
    const districtChanged = newFilters.districts.length !== filters.districts.length || 
                           newFilters.districts[0] !== filters.districts[0];
    
    // Если пользователь выбрал "Все города" (city = ''), возвращаемся на главную
    if (cityChanged && !newFilters.city) {
      const homeUrl = language === 'ro' ? '/ro' : '/';
      setLocation(homeUrl);
      setFilters(newFilters);
      setPage(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    if (cityChanged && newFilters.city) {
      // Если выбран конкретный город, переходим на его страницу
      navigateToLocation(newFilters.city);
      return;
    }
    
    if (districtChanged && newFilters.city && newFilters.districts.length > 0) {
      // Если выбран район, переходим на страницу района
      navigateToLocation(newFilters.city, newFilters.districts[0]);
      return;
    }
    
    // Обычное изменение фильтров без навигации
    setFilters(newFilters);
    setPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [filters.city, filters.districts, navigateToLocation, language, setLocation]);

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
      openNow: undefined
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

  // Генерируем SEO данные в зависимости от выбранной локации
  const generateSEOData = () => {
    const safeCities = cities || [];
    const safeDistricts = districts || [];
    
    const selectedCity = citySlug && safeCities.length > 0 
      ? safeCities.find(c => c[language === 'ro' ? 'slugRo' : 'slugRu'] === citySlug)
      : null;
    
    const selectedDistrict = districtSlug && safeDistricts.length > 0
      ? safeDistricts.find(d => d[language === 'ro' ? 'slugRo' : 'slugRu'] === districtSlug)
      : null;

    const cityName = selectedCity ? (language === 'ru' ? selectedCity.nameRu : selectedCity.nameRo) : '';
    const districtName = selectedDistrict ? (language === 'ru' ? selectedDistrict.nameRu : selectedDistrict.nameRo) : '';

    if (selectedDistrict && selectedCity) {
      // Страница района
      return {
        title: language === 'ru' 
          ? `Стоматологические клиники в районе ${districtName}, ${cityName} - Dent Moldova`
          : `Clinici stomatologice în sectorul ${districtName}, ${cityName} - Dent Moldova`,
        description: language === 'ru'
          ? `Найдите лучшие стоматологические клиники в районе ${districtName}, ${cityName}. Запись онлайн, отзывы, цены, адреса и телефоны.`
          : `Găsiți cele mai bune clinici stomatologice în sectorul ${districtName}, ${cityName}. Programare online, recenzii, prețuri, adrese și telefoane.`,
        keywords: language === 'ru'
          ? `стоматология ${districtName} ${cityName}, стоматолог ${districtName}, лечение зубов ${districtName}`
          : `stomatologie ${districtName} ${cityName}, stomatolog ${districtName}, tratament dentar ${districtName}`,
        canonical: `/${language === 'ro' ? 'ro/' : ''}city/${citySlug}/${districtSlug}`
      };
    } else if (selectedCity) {
      // Страница города
      return {
        title: language === 'ru' 
          ? `Стоматологические клиники в ${cityName} - Dent Moldova`
          : `Clinici stomatologice în ${cityName} - Dent Moldova`,
        description: language === 'ru'
          ? `Найдите лучшие стоматологические клиники в ${cityName}. Запись онлайн, отзывы, цены, адреса и телефоны.`
          : `Găsiți cele mai bune clinici stomatologice în ${cityName}. Programare online, recenzii, prețuri, adrese și telefoane.`,
        keywords: language === 'ru'
          ? `стоматология ${cityName}, стоматолог ${cityName}, лечение зубов ${cityName}, клиника ${cityName}`
          : `stomatologie ${cityName}, stomatolog ${cityName}, tratament dentar ${cityName}, clinică ${cityName}`,
        canonical: `/${language === 'ro' ? 'ro/' : ''}city/${citySlug}`
      };
    } else {
      // Главная страница
      return {
        title: language === 'ru' ? "Dent Moldova - Каталог стоматологических клиник в Молдове" : "Dent Moldova - Catalogul clinicilor stomatologice din Moldova",
        description: language === 'ru' ? "Найдите лучшие стоматологические клиники в Молдове. Запись онлайн, отзывы, цены, адреса и телефоны." : "Găsiți cele mai bune clinici stomatologice din Moldova. Programare online, recenzii, prețuri, adrese și telefoane.",
        keywords: language === 'ru' ? "стоматология, стоматолог, лечение зубов, клиника, Молдова, Кишинёв" : "stomatologie, stomatolog, tratament dentar, clinică, Moldova, Chișinău",
        canonical: language === 'ro' ? "/ro" : "/"
      };
    }
  };

  const seoData = generateSEOData();

  return (
    <>
      <DynamicSEO
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        ogTitle={seoData.title}
        ogDescription={seoData.description}
        canonical={seoData.canonical}
      />
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <button 
                onClick={() => window.location.href = '/'}
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
              {/* Mobile Filter Toggle */}
              <Button
                onClick={() => setMobileFiltersOpen(true)}
                variant="outline"
                size="sm"
                className="flex md:hidden items-center space-x-1 px-2 bg-gray-100 border-gray-300"
              >
                <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">{t('filters')}</span>
              </Button>
              
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
                className="bg-blue-600 text-white hover:bg-blue-700 flex items-center space-x-1 px-2"
                size="sm"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline text-xs sm:text-sm">{t('addClinic')}</span>
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
                ? 'Клиники не найдены. Попробуйте изменить параметры поиска.'
                : 'Загрузка клиник...'
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
      
      {/* Add Clinic Modal */}
      <AddClinicModal
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
                <a href="/pricing" className="hover:text-gray-900 transition-colors">{t('pricing.title')}</a>
                <a href="#" className="hover:text-gray-900 transition-colors">Политика приватности</a>
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
