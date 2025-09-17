import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { Star, MapPin, Clock, Phone, Flame, Eye, Calendar, Shield, Gem, Sparkles, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnimatedProgressBar } from './AnimatedProgressBar';
import { AnimatedNumber } from './AnimatedNumber';
import { useTranslation } from '../lib/i18n';
import { getClinicName, getCityName, getDistrictName } from '../lib/utils';
import FancyProgressBar from './FancyProgressBar';
import { useClinicRating } from '../hooks/useClinicRating';
import { LazyImage } from './LazyImage';

interface RecommendedClinicsProps {
  onClinicClick: (slug: string) => void;
  onBookClick: (clinic: any) => void;
  onPricesClick: (slug: string) => void;
  language?: string; // Добавляем язык как пропс
  clinics?: any[]; // Добавляем клиники как пропс
}

const promotionalLabelStyles: Record<string, string> = {
  high_rating: 'bg-green-500 text-white',
  premium: 'bg-purple-500 text-white',
  popular: 'bg-red-500 text-white',
  new: 'bg-orange-500 text-white',
  discount: 'bg-pink-500 text-white'
};

// Компонент для отображения рейтинга клиники
function ClinicRatingDisplay({ clinicId }: { clinicId: string }) {
  const { ratingData } = useClinicRating(clinicId);

  if (!ratingData.hasRating) {
    return null;
  }

  return (
    <div className="bg-black bg-opacity-60 backdrop-blur-sm rounded-full px-2 py-1">
      <div className="flex items-center gap-1">
        <svg 
          className="w-4 h-4 text-yellow-400 fill-current" 
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        <span className="text-white font-bold text-sm drop-shadow-lg">
          {ratingData.averageRating.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

export function RecommendedClinics({ onClinicClick, onBookClick, onPricesClick, language: propLanguage, clinics: propClinics }: RecommendedClinicsProps) {
  const { language: i18nLanguage, t } = useTranslation();
  const language = propLanguage || i18nLanguage; // Используем переданный язык или из i18n
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<any | null>(null);
  const [verificationForm, setVerificationForm] = useState({ email: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Определяем стиль рамки для выделения
  const getPromotionalBorder = (clinic: any) => {
    if (!clinic.promotionalLabels || clinic.promotionalLabels.length === 0) return '';
    
    const label = clinic.promotionalLabels[0];
    const borderStyles: Record<string, string> = {
      premium: 'border-4 border-purple-400 shadow-lg shadow-purple-400/50',
      high_rating: 'border-4 border-green-400 shadow-lg shadow-green-400/50',
      popular: 'border-4 border-red-400 shadow-lg shadow-red-400/50',
      new: 'border-4 border-yellow-400 shadow-lg shadow-yellow-400/50',
      discount: 'border-4 border-pink-400 shadow-lg shadow-pink-400/50'
    };
    
    return borderStyles[label] || '';
  };

  // Получаем иконку для лейбла
  const getPromotionalIcon = (clinic: any) => {
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

  // Получаем текст для промо лейбла
  const getPromotionalLabelText = (label: string) => {
    const texts: Record<string, string> = {
      premium: language === 'ru' ? 'Премиум' : 'Premium',
      high_rating: language === 'ru' ? 'Высокий рейтинг' : 'Rating înalt',
      popular: language === 'ru' ? 'Выбор пациентов' : 'Alegerea pacienților',
      new: language === 'ru' ? 'Новое' : 'Nou',
      discount: language === 'ru' ? 'Скидки' : 'Reduceri'
    };
    
    return texts[label] || label;
  };

  // Use clinics from props if provided, otherwise fetch them
  const { data: clinicsData, isLoading } = useQuery({
    queryKey: ['/api/recommended-clinics'],
    queryFn: async () => {
      const response = await fetch('/api/recommended-clinics');
      if (!response.ok) throw new Error('Failed to fetch recommended clinics');
      return response.json();
    },
    enabled: !propClinics, // Only fetch if clinics not provided via props
  });

  const clinics = propClinics || clinicsData?.clinics || [];

  // Don't render anything if no clinics
  if (clinics.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center space-x-2 mb-6">
        <Flame className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          {t('recommended')}
        </h2>
        <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm flex items-center gap-1">
          <Star className="h-3 w-3" />
          {t('bestChoice')}
        </Badge>
      </div>
      
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {clinics.map((clinic: any) => (
          <div
            key={clinic.id}
            className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow ${clinic.verified ? 'cursor-pointer' : 'cursor-default'} relative overflow-hidden ${getPromotionalBorder(clinic)}`}
            onClick={() => clinic.verified && onClinicClick(clinic.slug)}
          >
            {/* Recommended Badge */}
            <div className="absolute top-3 left-3 z-10">
              <Badge className="bg-red-500 text-white font-semibold">
                <Flame className="h-3 w-3 mr-1" />
                {t('recommended')}
              </Badge>
            </div>

            {/* Star Rating - top right corner */}
            <div className="absolute top-3 right-3 z-10">
              <ClinicRatingDisplay clinicId={clinic.id} />
            </div>


            {/* Clinic Image */}
            <div className="h-32 md:h-48 bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden relative">
              <LazyImage
                src={`https://images.unsplash.com/photo-${clinic.id.slice(0, 10)}?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300`}
                alt={getClinicName(clinic)}
                className="w-full h-full object-cover absolute inset-0"
                fallbackSrc={clinic.logoUrl || 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'}
                onError={(e) => {
                  if (clinic.logoUrl && !(e.target as HTMLImageElement).src.includes(clinic.logoUrl)) {
                    (e.target as HTMLImageElement).src = clinic.logoUrl;
                    // Оставляем класс w-full h-full object-cover для логотипа тоже
                    (e.target as HTMLImageElement).className = "w-full h-full object-cover absolute inset-0";
                  } else {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300';
                  }
                }}
              />
              
              {/* Clinic Name Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-3 md:p-4">
                <h3 className="text-base md:text-lg font-extrabold leading-tight mb-2 relative z-10 break-words text-white drop-shadow-2xl tracking-wide">
                  {language === 'ru' ? clinic.nameRu : clinic.nameRo}
                </h3>
              </div>
            </div>

            {/* Clinic Info */}
            <div className="p-3 md:p-4">
              <div className="flex items-center gap-2 mb-2">
                {/* Promotional labels next to name */}
                {clinic.promotionalLabels && clinic.promotionalLabels.length > 0 && 
                  clinic.promotionalLabels.map((label: string, index: number) => (
                    <div key={index} className={`px-2 py-0.5 rounded-full text-xs font-bold shadow-md flex-shrink-0 ${promotionalLabelStyles[label]} ${label === 'popular' ? 'animate-pulse' : ''}`}>
                      {getPromotionalIconForLabel(label)} {getPromotionalLabelText(label)}
                    </div>
                  ))
                }
              </div>
              
              <div className="space-y-1 md:space-y-2 mb-2 md:mb-3">
                <div className="flex items-center text-gray-600 text-sm">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{getCityName(clinic.city, language)}</span>
                  {clinic.district && <span>, {getDistrictName(clinic.district, language)}</span>}
                </div>
                
                {clinic.phone && (
                  <div className="flex items-center text-gray-600 text-sm">
                    <Phone className="h-4 w-4 mr-1" />
                    <span>{clinic.phone}</span>
                  </div>
                )}
              </div>


              {/* Action Buttons */}
              {clinic.verified ? (
                <div className="flex space-x-1 md:space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs h-8 md:h-9 px-2 md:px-3 rounded-full border border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-[0.2rem]"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClinicClick(clinic.slug);
                    }}
                  >
                    <Eye className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-700" />
                    <span className="hidden md:inline font-medium">Подробно</span>
                    <span className="md:hidden"></span>
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onBookClick(clinic);
                    }}
                    className="w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 md:h-9 px-3 md:px-4 transition-all duration-200 shadow-md hover:shadow-lg"
                    size="sm"
                  >
                    <Calendar className="h-3 w-3 mr-1" />
                    <span className="hidden lg:inline">{t('bookOneClick')}</span>
                    <span className="lg:hidden">{t('book')}</span>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2">
                  <div className="text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                      <div className="w-1 h-1 bg-gray-400 rounded-full mr-1"></div>
                      {t('notVerified')}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    className="w-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs h-8 md:h-9 px-3 md:px-4 transition-all duration-200 shadow-md hover:shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedClinic(clinic);
                      setShowVerificationModal(true);
                    }}
                  >
                    <Shield className="h-3.5 w-3.5 md:h-3 md:w-3 mr-0.5" />
                    {t('verify')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Verification Modal */}
      {showVerificationModal && selectedClinic && (
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

            {/* Form */}
            <div className="p-6 bg-white">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!selectedClinic) return;
                  if (!verificationForm.email || !verificationForm.phone) return;
                  setIsSubmitting(true);
                  try {
                    const response = await fetch('/api/verification-requests', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        clinicId: selectedClinic.id,
                        clinicName: language === 'ru' ? selectedClinic.nameRu : selectedClinic.nameRo,
                        clinicAddress: language === 'ru' ? selectedClinic.addressRu : selectedClinic.addressRo,
                        requesterEmail: verificationForm.email,
                        requesterPhone: verificationForm.phone,
                      }),
                    });
                    if (response.ok) {
                      setShowVerificationModal(false);
                      setSelectedClinic(null);
                      setVerificationForm({ email: '', phone: '' });
                      toast({ title: t('verificationSentTitle'), description: t('verificationSentDesc') });
                    } else {
                      console.error('Failed to submit verification request');
                    }
                  } catch (err) {
                    console.error('Error submitting verification request:', err);
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                className="space-y-5"
              >
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