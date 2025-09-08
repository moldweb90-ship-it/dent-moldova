import { useState, useEffect } from 'react';
import { useTranslation } from '../lib/i18n';
import { Building2, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ActiveClinicsResponse {
  count: number;
}

interface ActiveClinicsCounterProps {
  onClick?: () => void;
}

export function ActiveClinicsCounter({ onClick }: ActiveClinicsCounterProps) {
  const { t } = useTranslation();
  const [count, setCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActiveClinicsCount = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/active-clinics-count');
        if (!response.ok) {
          throw new Error('Failed to fetch active clinics count');
        }
        
        const data: ActiveClinicsResponse = await response.json();
        setCount(data.count);
      } catch (err) {
        console.error('Error fetching active clinics count:', err);
        setError('Failed to load count');
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveClinicsCount();
  }, []);

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-blue-100">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-600">
                {t('activeClinics.title')}
              </div>
              <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-red-100">
              <Building2 className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-600">
                {t('activeClinics.title')}
              </div>
              <div className="text-sm text-red-600">
                {error}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={`bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-sm hover:shadow-md transition-all duration-300 group ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-full bg-green-100 group-hover:bg-green-200 transition-colors duration-300">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-700 mb-1">
              {t('activeClinics.title')}
              {onClick && (
                <div className="text-xs text-gray-500 mt-1">
                  {t('activeClinics.clickToFilter')}
                </div>
              )}
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-bold text-green-700 group-hover:text-green-800 transition-colors duration-300">
                {count?.toLocaleString()}
              </span>
              <span className="text-sm text-gray-500">
                {t('activeClinics.clinics')}
              </span>
            </div>
          </div>
          {onClick && (
            <div className="text-green-600 group-hover:text-green-700 transition-colors duration-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
