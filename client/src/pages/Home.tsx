import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { LanguageToggle } from '../components/LanguageToggle';
import { SearchBar } from '../components/SearchBar';
import { Filters, FilterValues } from '../components/Filters';
import { ClinicGrid } from '../components/ClinicGrid';
import { ClinicDetail } from '../components/ClinicDetail';
import { useTranslation } from '../lib/i18n';

export default function Home() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClinic, setSelectedClinic] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  
  const [filters, setFilters] = useState<FilterValues>({
    districts: [],
    specializations: [],
    languages: [],
    verified: false,
    urgentToday: false,
    priceRange: [0, 100],
    sort: 'dscore'
  });
  
  const [page, setPage] = useState(1);
  const limit = 12;

  // Fetch cities
  const { data: cities = [] } = useQuery<any[]>({
    queryKey: ['/api/cities'],
  });

  // Fetch districts for selected city
  const { data: districts = [] } = useQuery<any[]>({
    queryKey: ['/api/cities', filters.city, 'districts'],
    enabled: !!filters.city,
  });

  // Build query parameters
  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams();
    
    if (searchQuery) params.set('q', searchQuery);
    if (filters.city) params.set('city', filters.city);
    if (filters.districts.length > 0) {
      filters.districts.forEach(d => params.append('districts', d));
    }
    if (filters.specializations.length > 0) {
      filters.specializations.forEach(s => params.append('specializations', s));
    }
    if (filters.languages.length > 0) {
      filters.languages.forEach(l => params.append('languages', l));
    }
    if (filters.verified) params.set('verified', 'true');
    if (filters.urgentToday) params.set('urgentToday', 'true');
    if (filters.priceRange[0] > 0) params.set('priceMin', filters.priceRange[0].toString());
    if (filters.priceRange[1] < 100) params.set('priceMax', filters.priceRange[1].toString());
    params.set('sort', filters.sort);
    params.set('page', page.toString());
    params.set('limit', limit.toString());
    
    return params.toString();
  }, [searchQuery, filters, page]);

  // Fetch clinics
  const { data: clinicsData, isLoading } = useQuery({
    queryKey: ['/api/clinics', buildQueryParams()],
    queryFn: async () => {
      const response = await fetch(`/api/clinics?${buildQueryParams()}`);
      if (!response.ok) throw new Error('Failed to fetch clinics');
      return response.json();
    },
  });

  // Fetch clinic detail
  const { data: clinicDetail } = useQuery({
    queryKey: ['/api/clinics', selectedClinic],
    enabled: !!selectedClinic,
    queryFn: async () => {
      const response = await fetch(`/api/clinics/${selectedClinic}`);
      if (!response.ok) throw new Error('Failed to fetch clinic');
      return response.json();
    },
  });

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(1);
  }, []);

  const handleFiltersChange = useCallback((newFilters: FilterValues) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const handleApplyFilters = useCallback(() => {
    setPage(1);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({
      districts: [],
      specializations: [],
      languages: [],
      verified: false,
      urgentToday: false,
      priceRange: [0, 100],
      sort: 'dscore'
    });
    setSearchQuery('');
    setPage(1);
  }, []);

  const handleClinicClick = useCallback((slug: string) => {
    setSelectedClinic(slug);
    setDetailOpen(true);
  }, []);

  const handleBookClick = useCallback((clinic: any) => {
    // Implement booking logic
    console.log('Book appointment for:', clinic.name);
    alert(`Запись в ${clinic.name} будет доступна в полной версии приложения`);
  }, []);

  const handlePricesClick = useCallback((clinic: any) => {
    // Show prices or navigate to clinic detail
    setSelectedClinic(clinic.slug);
    setDetailOpen(true);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">{t('appTitle')}</h1>
            </div>
            
            {/* Search Bar */}
            <SearchBar 
              onSearch={handleSearch}
              className="flex-1 max-w-lg mx-8"
            />
            
            {/* Language Toggle */}
            <LanguageToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8">
          <Filters
            cities={cities}
            districts={districts}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
          />
        </div>

        {/* Clinics Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 aspect-square">
                <div className="animate-pulse">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                  </div>
                  <div className="space-y-3 mb-4">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j}>
                        <div className="flex justify-between mb-1">
                          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-8"></div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2"></div>
                      </div>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <div className="flex-1 h-8 bg-gray-200 rounded"></div>
                    <div className="flex-1 h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
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

      {/* Clinic Detail Modal */}
      <ClinicDetail
        clinic={clinicDetail}
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSelectedClinic(null);
        }}
        onBookClick={handleBookClick}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-600">© 2024 {t('appTitle')}. Все права защищены.</p>
            </div>
            <div className="flex space-x-6 text-sm text-gray-600">
              <a href="#" className="hover:text-gray-900 transition-colors">Политика приватности</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Контакты</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
