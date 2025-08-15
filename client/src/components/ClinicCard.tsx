import { ScoreBar } from './ScoreBar';
import { useTranslation, SPECIALIZATIONS, LANGUAGES } from '../lib/i18n';
import { Button } from '@/components/ui/button';

interface Clinic {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string;
  city: { nameRu: string; nameRo: string };
  district?: { nameRu: string; nameRo: string } | null;
  languages: string[];
  specializations: string[];
  tags: string[];
  verified: boolean;
  cnam: boolean;
  availToday: boolean;
  priceIndex: number;
  trustIndex: number;
  reviewsIndex: number;
  accessIndex: number;
  dScore: number;
}

interface ClinicCardProps {
  clinic: Clinic;
  onClinicClick: (slug: string) => void;
  onBookClick: (clinic: Clinic) => void;
  onPricesClick: (clinic: Clinic) => void;
}

export function ClinicCard({ clinic, onClinicClick, onBookClick, onPricesClick }: ClinicCardProps) {
  const { t, language } = useTranslation();

  const getDScoreColor = (score: number) => {
    if (score >= 75) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onClinicClick(clinic.slug);
  };

  const handleBookClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBookClick(clinic);
  };

  const handlePricesClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPricesClick(clinic);
  };

  return (
    <div 
      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer aspect-square flex flex-col"
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {clinic.logoUrl && (
            <img 
              src={clinic.logoUrl} 
              alt={`${clinic.name} Logo`} 
              className="w-12 h-12 rounded-lg object-cover mb-2"
              onError={(e) => {
                // Fallback to placeholder
                (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1629909613654-28e377c37b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100`;
              }}
            />
          )}
          <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1">{clinic.name}</h3>
          <p className="text-sm text-gray-600">
            {language === 'ru' ? clinic.city.nameRu : clinic.city.nameRo}
            {clinic.district && `, ${language === 'ru' ? clinic.district.nameRu : clinic.district.nameRo}`}
          </p>
        </div>
        <div className="text-center">
          <div className={`w-16 h-16 ${getDScoreColor(clinic.dScore)} rounded-full flex items-center justify-center text-white font-bold text-xl`}>
            {clinic.dScore}
          </div>
          <span className="text-xs text-gray-500 mt-1">D-score</span>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-3 mb-4 flex-1">
        <ScoreBar value={100 - clinic.priceIndex} label={t('price')} />
        <ScoreBar value={clinic.trustIndex} label={t('trust')} />
        <ScoreBar value={clinic.reviewsIndex} label={t('reviews')} />
        <ScoreBar value={clinic.accessIndex} label={t('access')} />
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-4">
        {clinic.specializations.slice(0, 2).map(spec => (
          <span key={spec} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            {SPECIALIZATIONS[spec as keyof typeof SPECIALIZATIONS]?.[language] || spec}
          </span>
        ))}
        {clinic.verified && (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
            {t('verifiedBadge')}
          </span>
        )}
        {clinic.cnam && (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            {t('cnamBadge')}
          </span>
        )}
        {clinic.availToday && (
          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
            {t('urgentToday')}
          </span>
        )}
        {clinic.languages.slice(0, 3).map(lang => (
          <span key={lang} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
            {lang.toUpperCase()}
          </span>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <Button 
          onClick={handleBookClick}
          className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
          size="sm"
        >
          {t('book')}
        </Button>
        <Button 
          onClick={handlePricesClick}
          variant="outline"
          className="flex-1"
          size="sm"
        >
          {t('prices')}
        </Button>
      </div>
    </div>
  );
}
