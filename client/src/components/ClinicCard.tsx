import { ScoreBar } from './ScoreBar';
import { useTranslation, SPECIALIZATIONS } from '../lib/i18n';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, Flame } from 'lucide-react';
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
  recommended?: boolean;
  promotionalLabels?: string[];
}

interface ClinicCardProps {
  clinic: Clinic;
  onClinicClick: (slug: string) => void;
  onBookClick: (clinic: Clinic) => void;
  onPricesClick: (slug: string) => void;
}

export function ClinicCard({ clinic, onClinicClick, onBookClick, onPricesClick }: ClinicCardProps) {
  const { t, language } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);

  const promotionalLabelStyles: Record<string, string> = {
    top: 'bg-yellow-500 text-white',
    high_rating: 'bg-green-500 text-white',
    premium: 'bg-purple-500 text-white',
    verified_plus: 'bg-blue-500 text-white',
    popular: 'bg-red-500 text-white',
    new: 'bg-orange-500 text-white',
    discount: 'bg-pink-500 text-white',
    fast_service: 'bg-teal-500 text-white'
  };

  const promotionalLabelText: Record<string, string> = {
    top: 'ТОП',
    high_rating: 'Высокий рейтинг',
    premium: 'Премиум',
    verified_plus: 'Верифицирован+',
    popular: 'Популярное',
    new: 'Новое',
    discount: 'Скидки',
    fast_service: 'Быстро'
  };

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
    onPricesClick(clinic.slug);
  };

  // Generate clinic image based on ID for consistency
  const clinicImage = `https://images.unsplash.com/photo-${clinic.id.slice(0, 10)}?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300`;
  const fallbackImage = 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300';

  // Определяем стиль рамки для выделения
  const getPromotionalBorder = () => {
    if (!clinic.promotionalLabels || clinic.promotionalLabels.length === 0) return '';
    
    const label = clinic.promotionalLabels[0];
    const borderStyles: Record<string, string> = {
      top: 'border-4 border-yellow-400 shadow-lg shadow-yellow-400/50',
      premium: 'border-4 border-purple-400 shadow-lg shadow-purple-400/50',
      high_rating: 'border-4 border-green-400 shadow-lg shadow-green-400/50',
      verified_plus: 'border-4 border-blue-400 shadow-lg shadow-blue-400/50',
      popular: 'border-4 border-red-400 shadow-lg shadow-red-400/50',
      new: 'border-4 border-orange-400 shadow-lg shadow-orange-400/50',
      discount: 'border-4 border-pink-400 shadow-lg shadow-pink-400/50',
      fast_service: 'border-4 border-teal-400 shadow-lg shadow-teal-400/50'
    };
    
    return borderStyles[label] || '';
  };

  // Получаем иконку для лейбла
  const getPromotionalIcon = () => {
    if (!clinic.promotionalLabels || clinic.promotionalLabels.length === 0) return null;
    
    const label = clinic.promotionalLabels[0];
    const icons: Record<string, string> = {
      top: '👑',
      premium: '💎', 
      high_rating: '⭐',
      verified_plus: '✅',
      popular: '🔥',
      new: '🆕',
      discount: '💰',
      fast_service: '⚡'
    };
    
    return icons[label] || '✨';
  };

  return (
    <div 
      className={`relative rounded-2xl overflow-hidden cursor-pointer aspect-[3/4] md:aspect-[4/3] group ${getPromotionalBorder()}`}
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

      {/* Top left badges */}
      <div className="absolute top-3 left-3 z-10 space-y-1">
        {clinic.recommended && (
          <Badge className="bg-red-500 text-white font-semibold text-xs">
            <Flame className="h-2 w-2 mr-1" />
            Рекомендуем
          </Badge>
        )}
      </div>

      {/* Promotional icon in top right */}
      {getPromotionalIcon() && (
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center text-lg shadow-lg">
            {getPromotionalIcon()}
          </div>
        </div>
      )}


      {/* Always visible content */}
      <div className="absolute inset-0 flex flex-col justify-between text-white p-4">
        {/* Top section - always visible */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-base md:text-lg font-bold mb-1 drop-shadow-lg leading-tight">{clinic.name}</h3>
            <p className="text-xs md:text-sm drop-shadow-md opacity-90 mb-2">
              {language === 'ru' ? clinic.city.nameRu : clinic.city.nameRo}
              {clinic.district && `, ${language === 'ru' ? clinic.district.nameRu : clinic.district.nameRo}`}
            </p>
            
            {/* Specializations and badges */}
            <div className="flex flex-wrap gap-1 mb-2">
              {clinic.specializations.slice(0, 1).map(spec => (
                <span key={spec} className="px-1.5 md:px-2 py-0.5 bg-white bg-opacity-20 text-white text-xs rounded-full backdrop-blur-sm">
                  {SPECIALIZATIONS[spec as keyof typeof SPECIALIZATIONS]?.[language] || spec}
                </span>
              ))}
              {clinic.verified && (
                <span className="px-1.5 md:px-2 py-0.5 bg-green-500 bg-opacity-80 text-white text-xs rounded-full">
                  {t('verifiedBadge')}
                </span>
              )}
              {clinic.cnam && (
                <span className="px-1.5 md:px-2 py-0.5 bg-blue-500 bg-opacity-80 text-white text-xs rounded-full">
                  {t('cnamBadge')}
                </span>
              )}
            </div>
            
            <div className="text-xs md:text-sm mb-1">
              {t('price')}: от {Math.round(clinic.priceIndex * 10)} лей
            </div>
          </div>
          
          {/* D-Score - always visible */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-1 cursor-pointer">
                  <div className={`w-10 h-10 md:w-12 md:h-12 ${getDScoreColor(clinic.dScore)} rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm shadow-lg`}>
                    {clinic.dScore}
                  </div>
                  <Info className="w-4 h-4 md:w-5 md:h-5 text-white opacity-80 hover:opacity-100" />
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

        {/* Bottom section - Action Buttons - always visible */}
        <div className={`flex space-x-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-90'}`}>
          <Button 
            onClick={handleBookClick}
            className="flex-1 bg-blue-600 text-white hover:bg-blue-700 shadow-lg text-xs md:text-sm"
            size="sm"
          >
            {t('book')}
          </Button>
          <Button 
            onClick={handlePricesClick}
            variant="outline"
            className="flex-1 border-2 border-white bg-white text-gray-900 hover:bg-gray-100 text-xs md:text-sm"
            size="sm"
          >
            {t('prices')}
          </Button>
        </div>
      </div>

      {/* Hover overlay - Progress bars only */}
      <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 pointer-events-none ${
        isHovered ? 'bg-black bg-opacity-40' : 'bg-transparent'
      }`}>
        <div className={`text-white transform transition-all duration-300 ${
          isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}>
          {/* Progress bars - only visible on hover */}
          <div className="space-y-1.5 md:space-y-2 bg-black bg-opacity-60 p-2 md:p-4 rounded-lg backdrop-blur-sm mx-2">
            <div className="grid grid-cols-2 gap-2 md:gap-3 text-xs">
              <div>
                <div className="flex justify-between mb-0.5 md:mb-1">
                  <span className="text-xs">{t('price')}</span>
                  <span className="text-xs">{100 - clinic.priceIndex}</span>
                </div>
                <div className="w-full bg-white bg-opacity-20 rounded-full h-1 md:h-1.5">
                  <div 
                    className={`h-1 md:h-1.5 rounded-full transition-all duration-700 delay-100 ${getDScoreColor(100 - clinic.priceIndex)}`}
                    style={{ width: isHovered ? `${100 - clinic.priceIndex}%` : '0%' }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-0.5 md:mb-1">
                  <span className="text-xs">{t('trust')}</span>
                  <span className="text-xs">{clinic.trustIndex}</span>
                </div>
                <div className="w-full bg-white bg-opacity-20 rounded-full h-1 md:h-1.5">
                  <div 
                    className={`h-1 md:h-1.5 rounded-full transition-all duration-700 delay-200 ${getDScoreColor(clinic.trustIndex)}`}
                    style={{ width: isHovered ? `${clinic.trustIndex}%` : '0%' }}
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 md:gap-3 text-xs">
              <div>
                <div className="flex justify-between mb-0.5 md:mb-1">
                  <span className="text-xs">{t('reviews')}</span>
                  <span className="text-xs">{clinic.reviewsIndex}</span>
                </div>
                <div className="w-full bg-white bg-opacity-20 rounded-full h-1 md:h-1.5">
                  <div 
                    className={`h-1 md:h-1.5 rounded-full transition-all duration-700 delay-300 ${getDScoreColor(clinic.reviewsIndex)}`}
                    style={{ width: isHovered ? `${clinic.reviewsIndex}%` : '0%' }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-0.5 md:mb-1">
                  <span className="text-xs">{t('access')}</span>
                  <span className="text-xs">{clinic.accessIndex}</span>
                </div>
                <div className="w-full bg-white bg-opacity-20 rounded-full h-1 md:h-1.5">
                  <div 
                    className={`h-1 md:h-1.5 rounded-full transition-all duration-700 delay-400 ${getDScoreColor(clinic.accessIndex)}`}
                    style={{ width: isHovered ? `${clinic.accessIndex}%` : '0%' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
