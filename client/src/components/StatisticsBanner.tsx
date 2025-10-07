import { useQuery } from '@tanstack/react-query';
import { Building2, MapPin, MapPinned } from 'lucide-react';
import { useTranslation } from '../lib/i18n';

interface AdminStats {
  totalClinics: number;
  totalCities: number;
  totalPackages: number;
  verifiedClinics: number;
  todayBookings: number;
  averageDScore: number;
}

interface CityWithDistricts {
  id: string;
  nameRu: string;
  nameRo: string;
  districts: Array<{ id: string; nameRu: string; nameRo: string }>;
}

export function StatisticsBanner() {
  const { t, language } = useTranslation();

  // Получаем публичную статистику
  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ['public-stats'],
    queryFn: async () => {
      const response = await fetch('/api/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Получаем данные городов с районами
  const { data: citiesData } = useQuery<CityWithDistricts[]>({
    queryKey: ['cities-with-districts'],
    queryFn: async () => {
      const response = await fetch('/api/cities-with-districts');
      if (!response.ok) throw new Error('Failed to fetch cities');
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  if (isLoading || !stats) {
    return null;
  }

  const totalClinics = stats.totalClinics || 0;
  const totalCities = stats.totalCities || 0;
  const totalDistricts = citiesData?.reduce((sum: number, city) => sum + (city.districts?.length || 0), 0) || 0;

  if (totalClinics === 0 && totalCities === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 mb-6 shadow-sm">
      {/* Desktop version */}
      <div className="hidden sm:flex items-center justify-center space-x-6 text-sm text-gray-600">
        {/* Стоматологии */}
        <div className="flex items-center space-x-2">
          <Building2 className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-gray-900">{totalClinics}</span>
          <span>{language === 'ro' ? 'stomatologii' : 'стоматологий'}</span>
        </div>

        <div className="text-gray-300">•</div>

        {/* Города */}
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-gray-900">{totalCities}</span>
          <span>{language === 'ro' ? 'orașe' : 'городов'}</span>
        </div>

        <div className="text-gray-300">•</div>

        {/* Районы */}
        <div className="flex items-center space-x-2">
          <MapPinned className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-gray-900">{totalDistricts}</span>
          <span>{language === 'ro' ? 'raioane' : 'районов'}</span>
        </div>

      </div>

      {/* Mobile version - compact */}
      <div className="flex sm:hidden items-center justify-center space-x-3 text-xs text-gray-600">
        {/* Стоматологии */}
        <div className="flex items-center space-x-1">
          <Building2 className="w-3.5 h-3.5 text-gray-500" />
          <span className="font-semibold text-gray-900">{totalClinics}</span>
          <span className="text-gray-600">{language === 'ro' ? 'clinici' : 'клиник'}</span>
        </div>

        <div className="text-gray-300">•</div>

        {/* Города */}
        <div className="flex items-center space-x-1">
          <MapPin className="w-3.5 h-3.5 text-gray-500" />
          <span className="font-semibold text-gray-900">{totalCities}</span>
          <span className="text-gray-600">{language === 'ro' ? 'orașe' : 'городов'}</span>
        </div>

        <div className="text-gray-300">•</div>

        {/* Районы */}
        <div className="flex items-center space-x-1">
          <MapPinned className="w-3.5 h-3.5 text-gray-500" />
          <span className="font-semibold text-gray-900">{totalDistricts}</span>
          <span className="text-gray-600">{language === 'ro' ? 'raioane' : 'районов'}</span>
        </div>
      </div>
    </div>
  );
}
