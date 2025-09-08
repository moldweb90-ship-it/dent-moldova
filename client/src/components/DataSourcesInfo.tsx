import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@/lib/i18n';

export function DataSourcesInfo() {
  const { t, language } = useTranslation();
  
  const { data: lastUpdateData, isLoading, error } = useQuery({
    queryKey: ['/api/last-update'],
    queryFn: async () => {
      const response = await fetch('/api/last-update');
      if (!response.ok) {
        throw new Error('Failed to fetch last update');
      }
      return response.json();
    },
    staleTime: 0,
    gcTime: 0,
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = language === 'ru' ? 'ru-RU' : 'ro-RO';
    return date.toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const lastUpdate = lastUpdateData?.lastUpdate ? formatDate(lastUpdateData.lastUpdate) : '15.01.2024';

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Источники данных */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4 sm:pt-6">
          <h3 className="font-semibold text-blue-900 mb-2 sm:mb-3 text-sm sm:text-base">{t('dataSources')}</h3>
          <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-blue-800">
            <li>• <strong>{t('prices')}</strong> - {t('pricesProvidedByClinic')}</li>
            <li>• <strong>{t('reviews')}</strong> - {t('reviewsFromPublicSources')}</li>
            <li>• <strong>{t('updated')}:</strong> {lastUpdate}</li>
          </ul>
          {isLoading && <p className="text-xs text-blue-600 mt-2">{t('loading')}</p>}
          {error && <p className="text-xs text-red-600 mt-2">{t('errorLoadingDate')}</p>}
        </CardContent>
      </Card>

      {/* Отказ от ответственности */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="pt-4 sm:pt-6">
          <p className="text-xs sm:text-sm text-yellow-800">
            <strong>{t('disclaimer')}</strong>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
