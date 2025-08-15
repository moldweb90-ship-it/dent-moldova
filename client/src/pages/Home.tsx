import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { LanguageToggle } from '../components/LanguageToggle';
import { Filter, X, Plus, Building2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchBar } from '../components/SearchBar';
import { FiltersSidebar, FilterValues } from '../components/FiltersSidebar';
import { ClinicGrid } from '../components/ClinicGrid';
import { ClinicDetail } from '../components/ClinicDetail';
import { BookingModal } from '../components/BookingModal';
import { MobileFiltersModal } from '../components/MobileFiltersModal';
import { AddClinicModal } from '../components/AddClinicModal';
import { AdminModal } from '../components/AdminModal';
import { useTranslation } from '../lib/i18n';

export default function Home() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClinic, setSelectedClinic] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingClinic, setBookingClinic] = useState<any>(null);
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [clinicFormOpen, setClinicFormOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  
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
  const limit = 50;

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
    setBookingClinic(clinic);
    setBookingOpen(true);
  }, []);


  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">{t('appTitle')}</h1>
            </div>
            
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Mobile Filter Toggle */}
              <Button
                onClick={() => setMobileFiltersOpen(true)}
                variant="outline"
                size="sm"
                className="flex md:hidden items-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span>{t('filters')}</span>
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
              
              {/* Add Clinic Button */}
              <Button
                onClick={() => setClinicFormOpen(true)}
                className="bg-blue-600 text-white hover:bg-blue-700 flex items-center space-x-2"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">{t('addClinic')}</span>
              </Button>
              
              
              {/* Language Toggle */}
              <LanguageToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left Sidebar - Filters (Desktop) */}
        {filtersVisible && (
          <div className="hidden md:block w-80 flex-shrink-0">
            <FiltersSidebar
              cities={cities}
              districts={districts}
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onApply={handleApplyFilters}
              onReset={handleResetFilters}
              onSearch={handleSearch}
            />
          </div>
        )}

        {/* Main Content */}
        <main className={`flex-1 px-4 md:px-8 py-4 md:py-8 ${!filtersVisible ? 'max-w-full' : ''}`}>
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
      />
      
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
      
      {/* Admin Modal */}
      <AdminModal
        open={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-600">© 2024 {t('appTitle')}. Все права защищены.</p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex space-x-6 text-sm text-gray-600">
                <a href="#" className="hover:text-gray-900 transition-colors">Политика приватности</a>
                <a href="#" className="hover:text-gray-900 transition-colors">Контакты</a>
              </div>
              
              {/* Admin Button */}
              <Button
                onClick={() => setAdminModalOpen(true)}
                size="sm"
                variant="outline"
                className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 flex items-center space-x-1"
              >
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Админ</span>
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
