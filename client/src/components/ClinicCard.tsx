import { ScoreBar } from './ScoreBar';
import { useTranslation, SPECIALIZATIONS } from '../lib/i18n';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { useState } from 'react';

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
  const [isHovered, setIsHovered] = useState(false);

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

  // Generate clinic image based on ID for consistency
  const clinicImage = `https://images.unsplash.com/photo-${clinic.id.slice(0, 10)}?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300`;
  const fallbackImage = 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300';

  return (
    <div 
      className="relative rounded-2xl overflow-hidden cursor-pointer aspect-[4/3] group"
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={clinicImage}
          alt={clinic.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackImage;
          }}
        />
        {/* Base overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>

      {/* Always visible content */}
      <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center p-6">
        <h3 className="text-2xl font-bold mb-2 drop-shadow-lg">{clinic.name}</h3>
        <p className="text-lg drop-shadow-md">
          {language === 'ru' ? clinic.city.nameRu : clinic.city.nameRo}
          {clinic.district && `, ${language === 'ru' ? clinic.district.nameRu : clinic.district.nameRo}`}
        </p>
      </div>

      {/* Hover overlay */}
      <div className={`absolute inset-0 bg-black transition-all duration-300 ${
        isHovered ? 'bg-opacity-60' : 'bg-opacity-0 pointer-events-none'
      }`}>
        <div className={`h-full flex flex-col justify-between p-6 text-white transform transition-all duration-300 ${
          isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}>
          
          {/* Top section */}
          <div className="flex justify-between items-start">
            <div>
              <div className="flex flex-wrap gap-1 mb-2">
                {clinic.specializations.slice(0, 2).map(spec => (
                  <span key={spec} className="px-2 py-1 bg-white bg-opacity-20 text-white text-xs rounded-full backdrop-blur-sm">
                    {SPECIALIZATIONS[spec as keyof typeof SPECIALIZATIONS]?.[language] || spec}
                  </span>
                ))}
                {clinic.verified && (
                  <span className="px-2 py-1 bg-green-500 bg-opacity-80 text-white text-xs rounded-full">
                    {t('verifiedBadge')}
                  </span>
                )}
                {clinic.cnam && (
                  <span className="px-2 py-1 bg-blue-500 bg-opacity-80 text-white text-xs rounded-full">
                    {t('cnamBadge')}
                  </span>
                )}
              </div>
              
              <div className="text-sm mb-1">
                {t('price')}: от {Math.round(clinic.priceIndex * 10)} лей
              </div>
            </div>
            
            {/* D-Score with tooltip */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center space-x-1">
                    <div className={`w-14 h-14 ${getDScoreColor(clinic.dScore)} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                      {clinic.dScore}
                    </div>
                    <Info className="w-4 h-4 text-white opacity-70" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-sm">
                    <p className="font-semibold">D-Score - комплексная оценка</p>
                    <p>Доверие: 30% • Отзывы: 25%</p>
                    <p>Цена: 25% • Доступность: 20%</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Center - Progress bars */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span>{t('price')}</span>
                  <span>{100 - clinic.priceIndex}</span>
                </div>
                <div className="w-full bg-white bg-opacity-20 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-500 ${getDScoreColor(100 - clinic.priceIndex)}`}
                    style={{ width: `${100 - clinic.priceIndex}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span>{t('trust')}</span>
                  <span>{clinic.trustIndex}</span>
                </div>
                <div className="w-full bg-white bg-opacity-20 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-500 ${getDScoreColor(clinic.trustIndex)}`}
                    style={{ width: `${clinic.trustIndex}%` }}
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span>{t('reviews')}</span>
                  <span>{clinic.reviewsIndex}</span>
                </div>
                <div className="w-full bg-white bg-opacity-20 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-500 ${getDScoreColor(clinic.reviewsIndex)}`}
                    style={{ width: `${clinic.reviewsIndex}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span>{t('access')}</span>
                  <span>{clinic.accessIndex}</span>
                </div>
                <div className="w-full bg-white bg-opacity-20 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-500 ${getDScoreColor(clinic.accessIndex)}`}
                    style={{ width: `${clinic.accessIndex}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom section - Action Buttons */}
          <div className="flex space-x-3">
            <Button 
              onClick={handleBookClick}
              className="flex-1 bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
              size="sm"
            >
              {t('book')}
            </Button>
            <Button 
              onClick={handlePricesClick}
              variant="outline"
              className="flex-1 border-white text-white hover:bg-white hover:text-gray-900"
              size="sm"
            >
              {t('prices')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
