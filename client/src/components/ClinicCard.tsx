import { ScoreBar } from './ScoreBar';
import { useTranslation, SPECIALIZATIONS } from '../lib/i18n';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flame, Calendar, DollarSign, Shield, MapPin, Star, Gem, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { getMinPrice, formatPrice, type Currency } from '@/lib/currency';
import { AnimatedProgressBar } from './AnimatedProgressBar';
import { AnimatedNumber } from './AnimatedNumber';
import { trackClickDetails, trackClickBook, trackClickPhone, trackClickWebsite } from '@/lib/analytics';
import { toast } from '@/hooks/use-toast';
import { WorkingHoursDisplay } from './WorkingHoursDisplay';
import { Tooltip } from './Tooltip';

interface Service {
  id: string;
  name: string;
  price: number;
  currency: Currency;
}

interface Clinic {
  id: string;
  slug: string;
  nameRu: string;
  nameRo: string;
  logoUrl?: string;
  city: { nameRu: string; nameRo: string };
  district?: { nameRu: string; nameRo: string } | null;
  addressRu?: string;
  addressRo?: string;
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
  currency: Currency;
  services?: Service[];
  workingHours?: any[];
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
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationForm, setVerificationForm] = useState({ email: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Отладка названий клиник (временно отключено)
  // console.log('🔍 ClinicCard names:', {
  //   nameRu: clinic.nameRu,
  //   nameRo: clinic.nameRo,
  //   language,
  //   promotionalLabels: clinic.promotionalLabels
  // });

  // Get minimum price with currency support
  const minPriceInfo = clinic.services && clinic.services.length > 0
    ? getMinPrice(clinic.services.map(s => ({ 
        price: s.price, 
        currency: s.currency || clinic.currency || 'MDL' 
      })))
    : { 
        price: Math.round(clinic.priceIndex * 10), 
        currency: clinic.currency || 'MDL' as Currency 
      };

  const promotionalLabelStyles: Record<string, string> = {
    high_rating: 'bg-green-500 text-white',
    premium: 'bg-purple-500 text-white',
    popular: 'bg-red-500 text-white',
    new: 'bg-orange-500 text-white',
    discount: 'bg-pink-500 text-white'
  };

  const promotionalLabelText: Record<string, string> = {
    high_rating: language === 'ru' ? 'Высокий рейтинг' : 'Rating înalt',
    premium: language === 'ru' ? 'Премиум' : 'Premium',
    popular: language === 'ru' ? 'Выбор пациентов' : 'Alegerea pacienților',
    new: language === 'ru' ? 'Новое' : 'Nou',
    discount: language === 'ru' ? 'Скидки' : 'Reduceri'
  };

  const getDScoreColor = (score: number) => {
    if (score >= 85) return 'bg-gradient-to-br from-emerald-500 to-green-600';
    if (score >= 75) return 'bg-gradient-to-br from-green-500 to-emerald-500';
    if (score >= 65) return 'bg-gradient-to-br from-yellow-500 to-orange-500';
    if (score >= 50) return 'bg-gradient-to-br from-orange-500 to-red-500';
    return 'bg-gradient-to-br from-red-500 to-pink-600';
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    // Don't navigate if clinic is not verified
    if (!clinic.verified) {
      return;
    }
    trackClickDetails(clinic.id);
    onClinicClick(clinic.slug);
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationForm.email || !verificationForm.phone) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/verification-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clinicId: clinic.id,
          clinicName: language === 'ru' ? clinic.nameRu : clinic.nameRo,
          clinicAddress: language === 'ru' ? clinic.addressRu : clinic.addressRo,
          requesterEmail: verificationForm.email,
          requesterPhone: verificationForm.phone,
        }),
      });
      
      if (response.ok) {
        setShowVerificationModal(false);
        setVerificationForm({ email: '', phone: '' });
        toast({
          title: t('verificationSentTitle'),
          description: t('verificationSentDesc'),
        });
      } else {
        console.error('Failed to submit verification request');
      }
    } catch (error) {
      console.error('Error submitting verification request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    trackClickBook(clinic.id);
    onBookClick(clinic);
  };

  const handlePricesClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPricesClick(clinic.slug);
  };

  // Приоритет: загруженное фото клиники -> сгенерированное изображение -> резервное
  const clinicImage = clinic.logoUrl || `https://images.unsplash.com/photo-${clinic.id.slice(0, 10)}?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300`;
  const fallbackImage = 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300';

  // Определяем стиль рамки для выделения
  const getPromotionalBorder = () => {
    if (!clinic.promotionalLabels || clinic.promotionalLabels.length === 0) return '';
    
    const label = clinic.promotionalLabels[0];
    const borderStyles: Record<string, string> = {
      premium: 'border-4 border-purple-400 shadow-lg shadow-purple-400/50',
      high_rating: 'border-4 border-green-400 shadow-lg shadow-green-400/50',
      popular: 'border-4 border-red-400 shadow-lg shadow-red-400/50',
      new: 'border-4 border-orange-400 shadow-lg shadow-orange-400/50',
      discount: 'border-4 border-pink-400 shadow-lg shadow-pink-400/50'
    };
    
    return borderStyles[label] || '';
  };

  // Получаем иконку для лейбла
  const getPromotionalIcon = () => {
    if (!clinic.promotionalLabels || clinic.promotionalLabels.length === 0) return null;
    
    const label = clinic.promotionalLabels[0];
    const icons: Record<string, JSX.Element> = {
      premium: <Gem className="h-3 w-3 text-purple-400" />, 
      high_rating: <Star className="h-3 w-3 text-yellow-400" />,
      popular: <Flame className="h-3 w-3 text-red-400" />,
      new: <Sparkles className="h-3 w-3 text-orange-400" />,
      discount: <DollarSign className="h-3 w-3 text-pink-400" />
    };
    
    return icons[label] || <Sparkles className="h-3 w-3 text-gray-400" />;
  };

  // Получаем иконку для конкретного лейбла
  const getPromotionalIconForLabel = (label: string) => {
    const icons: Record<string, JSX.Element> = {
      premium: <Gem className="h-3 w-3 text-purple-400" />, 
      high_rating: <Star className="h-3 w-3 text-yellow-400" />,
      popular: <Flame className="h-3 w-3 text-red-400" />,
      new: <Sparkles className="h-3 w-3 text-orange-400" />,
      discount: <DollarSign className="h-3 w-3 text-pink-400" />
    };
    
    return icons[label] || <Sparkles className="h-3 w-3 text-gray-400" />;
  };

  return (
    <div 
      className={`relative rounded-2xl overflow-hidden ${clinic.verified ? 'cursor-pointer' : 'cursor-default'} aspect-[5/6] md:aspect-[4/3] group ${getPromotionalBorder()}`}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={clinicImage}
          alt={language === 'ru' ? (clinic.nameRu || clinic.nameRo || 'Клиника') : (clinic.nameRo || clinic.nameRu || 'Clinică')}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Если не загрузилось загруженное фото, пробуем сгенерированное
            if (clinic.logoUrl && (e.target as HTMLImageElement).src === clinic.logoUrl) {
              (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-${clinic.id.slice(0, 10)}?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300`;
            } else {
              // Иначе используем резервное изображение
              (e.target as HTMLImageElement).src = fallbackImage;
            }
          }}
        />
        {/* Base overlay - slightly darker for better text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>




      {/* Always visible content */}
      <div className={`absolute inset-0 flex flex-col justify-between text-white p-2 md:p-4 relative z-10 transition-opacity duration-300 ${
        isHovered ? 'opacity-30' : 'opacity-100'
      }`}>
        {/* Top section - always visible */}
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0 relative z-10">
            {/* Clinic name - always first and prominent */}
            <h3 className="text-base md:text-xl font-extrabold leading-tight mb-2 relative z-10 break-words text-white drop-shadow-2xl">
              {language === 'ru' ? (clinic.nameRu || clinic.nameRo || 'Название клиники') : (clinic.nameRo || clinic.nameRu || 'Numele clinicii')}
              {clinic.verified && (
                <Tooltip content={language === 'ru' ? 'Клиника верифицирована' : 'Clinică verificată'} position="bottom">
                  <svg 
                    className="inline-block w-4 h-4 md:w-5 md:h-5 text-blue-400 cursor-help ml-1" 
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </Tooltip>
              )}
            </h3>
            
            {/* City, District and Address - moved up */}
            <div className="mb-2 space-y-1">
              {/* City and District - first line */}
              <p className="text-xs md:text-sm drop-shadow-md opacity-90">
                {language === 'ru' ? (clinic.city.nameRu || clinic.city.nameRo) : (clinic.city.nameRo || clinic.city.nameRu)}
                {clinic.district && `, ${language === 'ru' ? (clinic.district.nameRu || clinic.district.nameRo) : (clinic.district.nameRo || clinic.district.nameRu)}`}
              </p>
              
              {/* Address - second line */}
              {(language === 'ru' ? (clinic.addressRu || clinic.addressRo) : (clinic.addressRo || clinic.addressRu)) && (
                <p className="text-xs md:text-sm drop-shadow-md opacity-90 flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span className="truncate">
                    {language === 'ru' ? (clinic.addressRu || clinic.addressRo) : (clinic.addressRo || clinic.addressRu)}
                  </span>
                </p>
              )}
              
              {/* Working Hours - compact display */}
              {clinic.workingHours && clinic.workingHours.length > 0 && (
                <div className="inline-block bg-black bg-opacity-40 backdrop-blur-sm rounded-full px-1.5 py-0.5">
                  <WorkingHoursDisplay 
                    workingHours={clinic.workingHours} 
                    compact={true} 
                    showToday={true}
                    isCard={true}
                  />
                </div>
              )}
              

            </div>
            
            {/* Badges - moved down */}
            <div className="flex gap-1 flex-wrap">
              {clinic.recommended && (
                <div className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold shadow-md flex-shrink-0 flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  {language === 'ru' ? 'ТОП' : 'TOP'}
                </div>
              )}
              {clinic.promotionalLabels && clinic.promotionalLabels.length > 0 && 
                clinic.promotionalLabels.map((label, index) => {
                  const style = promotionalLabelStyles[label] || 'bg-gray-500 text-white';
                  const text = promotionalLabelText[label] || label;
                  const icon = getPromotionalIconForLabel(label);
                  
                  return (
                    <div key={index} className={`px-2 py-0.5 rounded-full text-xs font-bold shadow-md flex-shrink-0 ${style} ${label === 'popular' ? 'animate-pulse' : ''}`}>
                      {icon} {text}
                    </div>
                  );
                })
              }

            </div>
          </div>
          
          {/* D-Score - always visible */}
          <div className="flex-shrink-0 ml-2">
            <div className={`relative w-8 h-8 md:w-10 md:h-10 ${getDScoreColor(clinic.dScore)} rounded-xl flex items-center justify-center text-white font-bold text-xs md:text-sm shadow-lg border-2 border-white/20 backdrop-blur-sm`}>
              <AnimatedNumber
                value={clinic.dScore}
                className="text-white font-bold text-xs md:text-sm"
                duration={1000}
                delay={100}
              />
              {/* Modern gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl"></div>
              {/* Subtle glow effect */}
              <div className={`absolute inset-0 rounded-xl ${getDScoreColor(clinic.dScore)} opacity-20 blur-sm`}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section - Action Buttons - always visible at bottom */}
      <div className={`absolute bottom-0 left-0 right-0 p-2 md:p-4 transition-opacity duration-300 z-20 ${isHovered ? 'opacity-70' : 'opacity-90'}`}>
        {clinic.verified ? (
          <div className="flex space-x-1 md:space-x-2">
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                onBookClick(clinic);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm text-xs md:text-sm h-8 md:h-9 px-1 md:px-3 transition-all duration-200"
              size="sm"
            >
              <Calendar className="h-3 w-3 mr-0.5" />
              <span className="hidden lg:inline">{t('bookOneClick')}</span>
              <span className="lg:hidden">{t('book')}</span>
            </Button>
            <Button 
              onClick={handlePricesClick}
              variant="outline"
              className="flex-1 border-2 border-white bg-white text-gray-900 hover:bg-gray-100 text-xs md:text-sm h-8 md:h-9 px-1 md:px-3"
              size="sm"
            >
              <DollarSign className="h-2.5 w-2.5 md:h-4 md:w-4 mr-0.5" />
              {t('prices')}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col space-y-2">
            <div className="text-center">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-1.5"></div>
                {t('notVerified')}
              </span>
            </div>
            <Button 
              onClick={() => setShowVerificationModal(true)} 
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-sm text-xs md:text-sm h-8 md:h-9 px-1 md:px-3 transition-all duration-200" 
              size="sm"
            >
              <Shield className="h-3 w-3 md:h-4 md:w-4 mr-0.5" />
              {t('verify')}
            </Button>
          </div>
        )}
      </div>

      {/* Hover overlay - Progress bars only */}
      <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 pointer-events-none z-20 ${
        isHovered ? 'bg-black bg-opacity-40' : 'bg-transparent'
      }`}>
        <div className={`text-white transform transition-all duration-300 ${
          isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}>
          {/* Progress bars - only visible on hover */}
          <div className="space-y-1.5 md:space-y-2 bg-black bg-opacity-80 p-2 md:p-4 rounded-lg backdrop-blur-sm mx-2 shadow-xl">
            <div className="grid grid-cols-2 gap-2 md:gap-3 text-xs">
              <div>
                <div className="flex justify-between mb-0.5 md:mb-1">
                  <span className="text-xs">{t('googleRating')}</span>
                  <AnimatedNumber
                    value={isHovered ? clinic.reviewsIndex : 0}
                    className="text-xs"
                    duration={700}
                    delay={100}
                  />
                </div>
                <AnimatedProgressBar
                  value={isHovered ? clinic.reviewsIndex : 0}
                  className="w-full bg-white bg-opacity-20 rounded-full h-1 md:h-1.5"
                  barClassName={`h-1 md:h-1.5 rounded-full ${getDScoreColor(clinic.reviewsIndex)}`}
                  duration={700}
                  delay={100}
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-0.5 md:mb-1">
                  <span className="text-xs">{t('experience')}</span>
                  <AnimatedNumber
                    value={isHovered ? clinic.trustIndex : 0}
                    className="text-xs"
                    duration={700}
                    delay={200}
                  />
                </div>
                <AnimatedProgressBar
                  value={isHovered ? clinic.trustIndex : 0}
                  className="w-full bg-white bg-opacity-20 rounded-full h-1 md:h-1.5"
                  barClassName={`h-1 md:h-1.5 rounded-full ${getDScoreColor(clinic.trustIndex)}`}
                  duration={700}
                  delay={200}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 md:gap-3 text-xs">
              <div>
                <div className="flex justify-between mb-0.5 md:mb-1">
                  <span className="text-xs">{t('price')}</span>
                  <AnimatedNumber
                    value={isHovered ? clinic.priceIndex : 0}
                    className="text-xs"
                    duration={700}
                    delay={300}
                  />
                </div>
                <AnimatedProgressBar
                  value={isHovered ? clinic.priceIndex : 0}
                  className="w-full bg-white bg-opacity-20 rounded-full h-1 md:h-1.5"
                  barClassName={`h-1 md:h-1.5 rounded-full ${getDScoreColor(clinic.priceIndex)}`}
                  duration={700}
                  delay={300}
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-0.5 md:mb-1">
                  <span className="text-xs">{t('convenience')}</span>
                  <AnimatedNumber
                    value={isHovered ? clinic.accessIndex : 0}
                    className="text-xs"
                    duration={700}
                    delay={400}
                  />
                </div>
                <AnimatedProgressBar
                  value={isHovered ? clinic.accessIndex : 0}
                  className="w-full bg-white bg-opacity-20 rounded-full h-1 md:h-1.5"
                  barClassName={`h-1 md:h-1.5 rounded-full ${getDScoreColor(clinic.accessIndex)}`}
                  duration={700}
                  delay={400}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden border-0">
            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-6 text-white relative overflow-hidden bg-white">
              {/* Background pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{t('verificationRequest')}</h3>
                    <p className="text-white/90 text-sm font-medium">{t('verificationDescription')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowVerificationModal(false)}
                  className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200 border border-white/30"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Clinic Info */}
            <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
              <div className="flex items-center space-x-4">
                {clinic.logoUrl ? (
                  <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg border-2 border-white">
                    <img 
                      src={clinic.logoUrl} 
                      alt={language === 'ru' ? clinic.nameRu : clinic.nameRo}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">
                      {(language === 'ru' ? clinic.nameRu : clinic.nameRo).charAt(0)}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 text-lg">
                    {language === 'ru' ? clinic.nameRu : clinic.nameRo}
                  </h4>
                  <div className="flex items-center space-x-1 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-sm text-gray-600 font-medium">
                      {language === 'ru' ? clinic.city.nameRu : clinic.city.nameRo}
                      {clinic.district && `, ${language === 'ru' ? clinic.district.nameRu : clinic.district.nameRo}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="p-6 bg-white">
              <form onSubmit={handleVerificationSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    {t('email')} *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={verificationForm.email}
                      onChange={(e) => setVerificationForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50/50 hover:bg-gray-50"
                      placeholder={t('emailPlaceholder')}
                    />
                    <div className="absolute inset-y-0 right-0 w-12 flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    {t('phone')} *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={verificationForm.phone}
                      onChange={(e) => setVerificationForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 bg-gray-50/50 hover:bg-gray-50"
                      placeholder={t('phonePlaceholder')}
                    />
                    <div className="absolute inset-y-0 right-0 w-12 flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:via-gray-500 disabled:to-gray-600 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>{t('sending')}</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          <span>{t('sendVerificationRequest')}</span>
                        </>
                      )}
                    </div>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
