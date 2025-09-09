import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScoreBar } from '@/components/ScoreBar';
import { BookingModal } from '@/components/BookingModal';
import { PhoneModal } from '@/components/PhoneModal';
import { CurrencyConverter } from '@/components/CurrencyConverter';
import { DataSourcesInfo } from '@/components/DataSourcesInfo';
import { ReviewsSection } from '@/components/ReviewsSection';
import { ReviewModal } from '@/components/ReviewModal';
import { WorkingHoursDisplay } from '@/components/WorkingHoursDisplay';
import { Tooltip } from '@/components/Tooltip';
import { SosButton } from '@/components/SosButton';
import { useClinicRating } from '@/hooks/useClinicRating';

import { type Currency } from '@/lib/currency';
import { trackClickBook, trackClickPhone, trackClickWebsite } from '@/lib/analytics';
import { Phone, Globe, ExternalLink, MapPin, Clock, Star, ChevronRight, Home, Calendar } from 'lucide-react';
import { LanguageToggle } from '@/components/LanguageToggle';

interface Service {
  id: string;
  name: string;
  price: number;
  currency: Currency;
}

export default function ClinicPage() {
  const [, params] = useRoute<{ slug: string }>('/clinic/:slug');
  const { t, language } = useTranslation();
  const queryClient = useQueryClient();
  const slug = params?.slug;
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  // Принудительно обновляем данные при изменении языка
  useEffect(() => {
    if (slug) {
      console.log('🔄 Clinic page: Обновляем данные при изменении языка на:', language);
      queryClient.invalidateQueries({ queryKey: ['clinic', slug] });
      queryClient.removeQueries({ queryKey: ['clinic', slug] });
    }
  }, [language, slug, queryClient]);

  // Убираем отслеживание скролла для анимированного меню
  // useEffect(() => {
  //   let lastScrollY = window.scrollY;
  //   
  //   const handleScroll = () => {
  //     const currentScrollY = window.scrollY;
  //     const headerHeight = 64;
  //     
  //     if (currentScrollY > headerHeight) {
  //       setIsHeaderVisible(true);
  //     } else {
  //       setIsHeaderVisible(false);
  //     }
  //     
  //     lastScrollY = currentScrollY;
  //   };

  //   window.addEventListener('scroll', handleScroll, { passive: true });
  //   return () => window.removeEventListener('scroll', handleScroll);
  // }, []);

  const { data: clinic, isLoading, error } = useQuery({
    queryKey: ['clinic', slug, language],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/clinics/${slug}?language=${language}&t=${Date.now()}`);
      return response.json();
    },
    enabled: !!slug,
    refetchOnWindowFocus: true,
    staleTime: 0, // Отключаем кеширование
    gcTime: 0 // Отключаем кеширование
  });

  // Получаем реальный рейтинг на основе отзывов
  const { ratingData } = useClinicRating(clinic?.id || '');

  // SEO данные для мета-тегов
  const seoTitle = clinic ? (language === 'ru' 
    ? (clinic?.seoTitleRu || clinic?.seoTitle || clinic?.nameRu || clinic?.nameRo || 'Название клиники')
    : (clinic?.seoTitleRo || clinic?.seoTitle || clinic?.nameRo || clinic?.nameRu || 'Numele clinicii')) : '';

  const seoDescription = clinic ? (language === 'ru'
    ? (clinic?.seoDescriptionRu || clinic?.seoDescription || `${clinic?.nameRu || clinic?.nameRo} - современная клиника в ${clinic?.city.nameRu}. Запись онлайн, консультация бесплатно.`)
    : (clinic?.seoDescriptionRo || clinic?.seoDescription || `${clinic?.nameRo || clinic?.nameRu} - clinică modernă în ${clinic?.city.nameRo}. Programare online, consultație gratuită.`)) : '';

  // Обновляем мета-теги при изменении языка или данных клиники
  useEffect(() => {
    if (typeof window !== 'undefined' && clinic) {
      // Title
      document.title = seoTitle;
      
      // Description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', seoDescription);
      
      // Keywords
      const seoKeywords = language === 'ru' ? clinic?.seoKeywordsRu : clinic?.seoKeywordsRo || clinic?.seoKeywords;
      if (seoKeywords) {
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {
          metaKeywords = document.createElement('meta');
          metaKeywords.setAttribute('name', 'keywords');
          document.head.appendChild(metaKeywords);
        }
        metaKeywords.setAttribute('content', seoKeywords);
      }
      
      // OG Title
      const ogTitle = language === 'ru' 
        ? (clinic?.ogTitleRu || clinic?.ogTitle || clinic?.seoTitleRu || clinic?.seoTitle || clinic?.nameRu || clinic?.nameRo)
        : (clinic?.ogTitleRo || clinic?.ogTitle || clinic?.seoTitleRo || clinic?.seoTitle || clinic?.nameRo || clinic?.nameRu);
      
      if (ogTitle) {
        let metaOgTitle = document.querySelector('meta[property="og:title"]');
        if (!metaOgTitle) {
          metaOgTitle = document.createElement('meta');
          metaOgTitle.setAttribute('property', 'og:title');
          document.head.appendChild(metaOgTitle);
        }
        metaOgTitle.setAttribute('content', ogTitle);
      }
      
      // OG Description
      const ogDescription = language === 'ru'
        ? (clinic?.ogDescriptionRu || clinic?.ogDescription || clinic?.seoDescriptionRu || clinic?.seoDescription)
        : (clinic?.ogDescriptionRo || clinic?.ogDescription || clinic?.seoDescriptionRo || clinic?.seoDescription);
      
      if (ogDescription) {
        let metaOgDesc = document.querySelector('meta[property="og:description"]');
        if (!metaOgDesc) {
          metaOgDesc = document.createElement('meta');
          metaOgDesc.setAttribute('property', 'og:description');
          document.head.appendChild(metaOgDesc);
        }
        metaOgDesc.setAttribute('content', ogDescription);
      }
      
      // OG URL
      let metaOgUrl = document.querySelector('meta[property="og:url"]');
      if (!metaOgUrl) {
        metaOgUrl = document.createElement('meta');
        metaOgUrl.setAttribute('property', 'og:url');
        document.head.appendChild(metaOgUrl);
      }
      metaOgUrl.setAttribute('content', window.location.href);
      
      // OG Type
      let metaOgType = document.querySelector('meta[property="og:type"]');
      if (!metaOgType) {
        metaOgType = document.createElement('meta');
        metaOgType.setAttribute('property', 'og:type');
        document.head.appendChild(metaOgType);
      }
      metaOgType.setAttribute('content', 'website');
    }
  }, [language, clinic, seoTitle, seoDescription]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loadingClinic')}</p>
        </div>
      </div>
    );
  }

  if (error || !clinic) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('clinicNotFound')}</h1>
          <p className="text-gray-600 mb-4">{t('clinicNotFoundDesc')}</p>
          <Button onClick={() => window.history.back()}>
            {t('goBack')}
          </Button>
        </div>
      </div>
    );
  }

  const getDScoreColor = (score: number) => {
    if (score >= 85) return 'bg-gradient-to-br from-emerald-500 to-green-600';
    if (score >= 75) return 'bg-gradient-to-br from-green-500 to-emerald-500';
    if (score >= 65) return 'bg-gradient-to-br from-yellow-500 to-orange-500';
    if (score >= 50) return 'bg-gradient-to-br from-orange-500 to-red-500';
    return 'bg-gradient-to-br from-red-500 to-pink-600';
  };

  const handleBookClick = () => {
    trackClickBook(clinic.id);
    setShowBookingForm(true);
  };

  const handleCallClick = () => {
    if (clinic.phone) {
      trackClickPhone(clinic.id);
      
      // Проверяем мобильное устройство
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        // На мобильном - открываем звонок
        window.open(`tel:${clinic.phone}`, '_self');
      } else {
        // На ПК - показываем модальное окно с номером
        setShowPhoneModal(true);
      }
    }
  };

  const handleWebsiteClick = () => {
    if (clinic.website) {
      trackClickWebsite(clinic.id);
      window.open(clinic.website, '_blank');
    }
  };

  // Debug: Log clinic data
  console.log('🔍 Clinic page data:', {
    nameRu: clinic?.nameRu,
    nameRo: clinic?.nameRo,
    seoTitle: clinic?.seoTitle,
    seoDescription: clinic?.seoDescription,
    seoKeywords: clinic?.seoKeywords,
    seoH1: clinic?.seoH1,
    ogTitle: clinic?.ogTitle,
    ogDescription: clinic?.ogDescription,
    ogImage: clinic?.ogImage,
    seoCanonical: clinic?.seoCanonical,
    seoRobots: clinic?.seoRobots,
    seoSchemaType: clinic?.seoSchemaType,
    seoSchemaData: clinic?.seoSchemaData
  });



  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header - прилипающий к верху */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                {clinic.logoUrl && (
                  <img 
                    src={clinic.logoUrl} 
                    alt={language === 'ru' ? (clinic.nameRu || clinic.nameRo) : (clinic.nameRo || clinic.nameRu)}
                    className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 break-words leading-tight flex items-center gap-2">
                    {language === 'ru' ? (clinic.nameRu || clinic.nameRo) : (clinic.nameRo || clinic.nameRu)}
                    {clinic.verified && (
                      <Tooltip content={language === 'ru' ? 'Клиника верифицирована' : 'Clinică verificată'}>
                        <svg 
                          className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-blue-500 flex-shrink-0 cursor-help" 
                          viewBox="0 0 24 24" 
                          fill="currentColor"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      </Tooltip>
                    )}
                  </h1>
                  <p className="text-gray-600 mt-1 text-xs sm:text-sm lg:text-base line-clamp-2">
                    {language === 'ru' ? (clinic.addressRu || clinic.addressRo) : (clinic.addressRo || clinic.addressRu)}
                    {(clinic.addressRu || clinic.addressRo) && ', '}
                    {language === 'ru' ? (clinic.city.nameRu || clinic.city.nameRo) : (clinic.city.nameRo || clinic.city.nameRu)}
                    {clinic.district && `, ${language === 'ru' ? (clinic.district.nameRu || clinic.district.nameRo) : (clinic.district.nameRo || clinic.district.nameRu)}`}
                  </p>
                  
                  {/* Working Hours */}
                  {clinic.workingHours && clinic.workingHours.length > 0 && (
                    <div className="mt-1">
                      <WorkingHoursDisplay 
                        workingHours={clinic.workingHours} 
                        compact={true} 
                        showToday={true}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                <Button
                  onClick={() => setShowReviewModal(true)}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                >
                  <Star className="h-4 w-4 mr-2" />
                  {t('leaveReview')}
                </Button>
                <LanguageToggle />
                {ratingData.hasRating && (
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg border border-white/20 flex-shrink-0">
                      <svg 
                        className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-yellow-400 fill-current mr-2" 
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      <span className="text-gray-800 font-bold text-sm sm:text-base lg:text-lg">
                        {ratingData.averageRating.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs sm:text-sm text-gray-500">{t('overallRating')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Breadcrumbs - под header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3">
            <nav className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-600 overflow-x-auto scrollbar-hide">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/'}
                className="flex items-center space-x-1 hover:text-blue-600 whitespace-nowrap px-2 sm:px-3"
              >
                <Home className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{t('home')}</span>
                <span className="sm:hidden">{language === 'ru' ? 'Гл' : 'Ac'}</span>
              </Button>
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="hover:text-blue-600 whitespace-nowrap px-2 sm:px-3"
              >
                {t('back')}
              </Button>
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="text-gray-900 font-medium truncate max-w-[120px] sm:max-w-none">
                {language === 'ru' ? (clinic.nameRu || clinic.nameRo) : (clinic.nameRo || clinic.nameRu)}
              </span>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Left Content */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
              {/* Action Buttons */}
              <Card>
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4">
                    <Button 
                      onClick={handleBookClick}
                      className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto order-1 sm:order-none shadow-md hover:shadow-lg transition-all duration-200 border-0"
                      size="lg"
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      <span className="font-medium">{t('wantAppointment')}</span>
                    </Button>
                    <div className="flex gap-2 sm:gap-3 lg:gap-4 order-2 sm:order-none">
                      {clinic.phone && (
                        <Button 
                          onClick={handleCallClick}
                          className="bg-gray-700 hover:bg-gray-800 text-white flex items-center justify-center space-x-[0.2rem] flex-1 sm:flex-none shadow-md hover:shadow-lg transition-all duration-200 border-0"
                          size="lg"
                        >
                          <Phone className="h-4 w-4" />
                          <span className="hidden sm:inline font-medium">{t('callClinic')}</span>
                          <span className="sm:hidden font-medium">{t('phone')}</span>
                        </Button>
                      )}
                      {clinic.website && (
                        <Button 
                          onClick={handleWebsiteClick}
                          className="bg-gray-600 hover:bg-gray-700 text-white flex items-center justify-center space-x-[0.2rem] flex-1 sm:flex-none shadow-md hover:shadow-lg transition-all duration-200 border-0"
                          size="lg"
                        >
                          <Globe className="h-4 w-4" />
                          <span className="hidden sm:inline font-medium">{t('website')}</span>
                          <span className="sm:hidden font-medium">{t('webSite')}</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Services and Prices */}
              <Card>
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg sm:text-xl">
                      {t('servicesAndPrices')}
                    </CardTitle>
                    {clinic.services && clinic.services.length > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600 font-medium">
                          {clinic.services.length} {language === 'ru' ? 'услуг' : 'servicii'}
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {clinic.services && clinic.services.length > 0 ? (
                    <CurrencyConverter services={clinic.services} />
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-sm sm:text-base font-medium">
                        {t('priceInfoClarification')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-3 sm:space-y-4 lg:space-y-6 lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-2rem)]">
              {/* SOS Button */}
              {clinic.sosEnabled && (
                <SosButton 
                  phone={clinic.phone || ''} 
                  clinicName={language === 'ru' ? clinic.nameRu : clinic.nameRo}
                />
              )}
              
              {/* Contact Info */}
              <Card>
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg">
                    {t('contacts')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  {clinic.address && (
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm sm:text-base">{clinic.address}</span>
                    </div>
                  )}
                  {clinic.phone && (
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-700 text-sm sm:text-base">{clinic.phone}</span>
                    </div>
                  )}
                  {clinic.website && (
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                      <a 
                        href={clinic.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm sm:text-base"
                      >
                        {t('webSite')}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <ReviewsSection 
          clinicId={clinic.id} 
          clinicName={language === 'ru' ? (clinic.nameRu || clinic.nameRo) : (clinic.nameRo || clinic.nameRu)}
        />

        {/* Booking Form Modal - using unified styled modal */}
        {showBookingForm && (
          <BookingModal
            clinic={{
              ...clinic,
              name: language === 'ru' ? (clinic.nameRu || clinic.nameRo) : (clinic.nameRo || clinic.nameRu)
            }}
            open={showBookingForm}
            onClose={() => setShowBookingForm(false)}
          />
        )}

              </div>

        {/* Phone Modal */}
        <PhoneModal 
          isOpen={showPhoneModal}
          onClose={() => setShowPhoneModal(false)}
          clinic={clinic}
        />

        {/* Review Modal */}
        {showReviewModal && (
          <ReviewModal
            open={showReviewModal}
            onClose={() => setShowReviewModal(false)}
            clinicId={clinic.id}
            clinicName={language === 'ru' ? (clinic.nameRu || clinic.nameRo) : (clinic.nameRo || clinic.nameRu)}
            onSubmit={() => {
              // Invalidate reviews queries to refresh the reviews section
              queryClient.invalidateQueries({ queryKey: ['clinicReviews', clinic.id] });
              queryClient.invalidateQueries({ queryKey: ['totalClinicReviews', clinic.id] });
            }}
          />
        )}
      </>
    );
  }
