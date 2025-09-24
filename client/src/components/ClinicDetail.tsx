import { useState, useEffect, useRef } from 'react';
import { X, Phone, Globe, ExternalLink, Calendar, Shield, Copy, Star } from 'lucide-react';
import { useTranslation, SPECIALIZATIONS } from '../lib/i18n';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScoreBar } from './ScoreBar';
import { BookingModal } from './BookingModal';
import { CurrencyConverter } from './CurrencyConverter';
import { DataSourcesInfo } from './DataSourcesInfo';
import { ReviewsList } from './ReviewsList';
import { WorkingHoursDisplay } from './WorkingHoursDisplay';
import { Tooltip } from './Tooltip';
import { SosButton } from './SosButton';
import { ReviewModal } from './ReviewModal';
import { useClinicRating } from '../hooks/useClinicRating';
import { LazyImage } from './LazyImage';
import { lockBodyScroll, unlockBodyScroll } from '@/utils/modalBodyLock';

import { type Currency } from '@/lib/currency';
import { trackClickBook, trackClickPhone, trackClickWebsite } from '@/lib/analytics';
import { toast } from '@/hooks/use-toast';

interface Service {
  id: string;
  name: string;
  price: number;
  priceType?: 'fixed' | 'from';
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
  phone?: string;
  website?: string;
  languages: string[];
  specializations: string[];
  tags: string[];
  verified: boolean;
  cnam: boolean;
  priceIndex: number;
  trustIndex: number;
  reviewsIndex: number;
  accessIndex: number;
  dScore: number;
  googleRating?: number;
  googleReviewsCount?: number;
  currency: Currency;
  services?: Service[];
  workingHours?: any[];
  sosEnabled?: boolean;
}

interface ClinicDetailProps {
  clinic: Clinic | null;
  open: boolean;
  onClose: () => void;
  onBookClick: (clinic: Clinic) => void;
  language?: string; // Добавляем язык как пропс
}

export function ClinicDetail({ clinic, open, onClose, onBookClick, language: propLanguage }: ClinicDetailProps) {
  const { t, language: i18nLanguage } = useTranslation();
  const language = propLanguage || i18nLanguage; // Используем переданный язык или из i18n
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showPhoneOptions, setShowPhoneOptions] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationForm, setVerificationForm] = useState({ email: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const phoneOptionsRef = useRef<HTMLDivElement>(null);
  
  // Получаем реальный рейтинг на основе отзывов
  const { ratingData } = useClinicRating(clinic?.id || '');

  // Закрываем меню телефона при закрытии попапа
  useEffect(() => {
    if (!open) {
      setShowPhoneOptions(false);
    }
  }, [open]);

  // Управление блокировкой скролла для скрытия меню браузера на iOS
  useEffect(() => {
    if (open) {
      lockBodyScroll();
    } else {
      unlockBodyScroll();
    }

    // Cleanup при размонтировании компонента
    return () => {
      unlockBodyScroll();
    };
  }, [open]);

  // Обработчик клика вне меню телефона
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (phoneOptionsRef.current && !phoneOptionsRef.current.contains(event.target as Node)) {
        setShowPhoneOptions(false);
      }
    };

    if (showPhoneOptions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showPhoneOptions]);

  if (!clinic) return null;

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
      // На мобильных устройствах открываем звонок напрямую и записываем событие
      if (window.innerWidth <= 768) {
        trackClickPhone(clinic.id);
        window.open(`tel:${clinic.phone}`, '_self');
      } else {
        // На ПК переключаем видимость опций телефона (без записи события)
        setShowPhoneOptions(!showPhoneOptions);
      }
    }
  };

  const handleCopyPhone = async () => {
    if (clinic.phone) {
      try {
        await navigator.clipboard.writeText(clinic.phone);
        trackClickPhone(clinic.id); // Записываем событие при копировании номера
        toast({
          title: t('phoneCopied'),
          description: t('phoneCopiedDesc'),
        });
        setShowPhoneOptions(false); // Закрываем меню после копирования
      } catch (err) {
        console.error('Failed to copy phone number:', err);
      }
    }
  };



  const handleWebsiteClick = () => {
    if (clinic.website) {
      trackClickWebsite(clinic.id);
      window.open(clinic.website, '_blank');
    }
  };

  const handleViewFullPage = () => {
    if (!clinic) return;
    const clinicPath = language === 'ro' ? `/clinic/ro/${clinic.slug}` : `/clinic/${clinic.slug}`;
    window.open(clinicPath, '_blank');
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

  const handleReviewSubmit = async (reviewData: any) => {
    try {
      // Здесь будет API для отправки отзыва
      console.log('Review submitted:', reviewData);
      
      toast({
        title: t('reviewSubmitted'),
        description: t('reviewSubmitted'),
      });
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: t('reviewError'),
        description: t('reviewError'),
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-6xl h-[85vh] max-h-[85vh] overflow-hidden z-[9999] clinic-detail-modal">
        <DialogHeader className="border-b border-gray-200 pb-4">
          {/* Two column layout - Desktop */}
          <div className="hidden sm:flex items-start justify-between gap-6 mb-4">
            {/* Left column - Clinic info */}
            <div className="flex-1 min-w-0">
              {/* Clinic name */}
              <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 break-words text-left mb-3">
                {language === 'ru' ? (clinic.nameRu || clinic.nameRo || 'Название клиники') : (clinic.nameRo || clinic.nameRu || 'Numele clinicii')}
                {clinic.verified && (
                  <Tooltip content={language === 'ru' ? 'Клиника верифицирована' : 'Clinică verificată'} position="bottom">
                    <svg 
                      className="inline-block w-5 h-5 md:w-6 md:h-6 text-blue-500 cursor-help ml-2" 
                      viewBox="0 0 24 24" 
                      fill="currentColor"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </Tooltip>
                )}
              </DialogTitle>

              {/* Address and working hours */}
              <div className="space-y-2">
                <div className="flex items-center text-gray-600 text-sm">
                  <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>
                    {language === 'ru' ? (clinic.addressRu || clinic.addressRo) : (clinic.addressRo || clinic.addressRu)}
                    {(clinic.addressRu || clinic.addressRo) && ', '}
                    {language === 'ru' ? (clinic.city.nameRu || clinic.city.nameRo) : (clinic.city.nameRo || clinic.city.nameRu)}
                    {clinic.district && `, ${language === 'ru' ? (clinic.district.nameRu || clinic.district.nameRo) : (clinic.district.nameRo || clinic.district.nameRu)}`}
                  </span>
                </div>
                
                {clinic.workingHours && clinic.workingHours.length > 0 && (
                  <div className="flex items-center text-gray-600 text-sm">
                    <WorkingHoursDisplay 
                      workingHours={clinic.workingHours} 
                      compact={true} 
                      showToday={true}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right column - Rating and Action buttons */}
            <div className="flex flex-col items-end gap-3 mr-16">
              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowReviewModal(true)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                >
                  <Star className="h-4 w-4" />
                  <span className="font-medium">{t('leaveReview')}</span>
                </Button>
                
                <Button
                  onClick={handleViewFullPage}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="font-medium">{t('details')}</span>
                </Button>
              </div>
              
              {ratingData.hasRating && (
                <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-xl px-2 py-1 shadow-lg border border-white/20" title={t('overallRating')}>
                  <svg 
                    className="w-5 h-5 text-yellow-400 fill-current mr-1" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span className="text-gray-800 font-bold text-sm">
                    {ratingData.averageRating.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Mobile layout */}
          <div className="sm:hidden">
            {/* Clinic name */}
            <DialogTitle className="text-xl font-bold text-gray-900 break-words text-left mb-3">
              {language === 'ru' ? (clinic.nameRu || clinic.nameRo || 'Название клиники') : (clinic.nameRo || clinic.nameRu || 'Numele clinicii')}
              {clinic.verified && (
                <Tooltip content={language === 'ru' ? 'Клиника верифицирована' : 'Clinică verificată'} position="bottom">
                  <svg 
                    className="inline-block w-5 h-5 text-blue-500 cursor-help ml-2" 
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </Tooltip>
              )}
            </DialogTitle>

            {/* Address and working hours */}
            <div className="mb-4 space-y-2">
              <div className="flex items-center text-gray-600 text-sm">
                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>
                  {language === 'ru' ? (clinic.addressRu || clinic.addressRo) : (clinic.addressRo || clinic.addressRu)}
                  {(clinic.addressRu || clinic.addressRo) && ', '}
                  {language === 'ru' ? (clinic.city.nameRu || clinic.city.nameRo) : (clinic.city.nameRo || clinic.city.nameRu)}
                  {clinic.district && `, ${language === 'ru' ? (clinic.district.nameRu || clinic.district.nameRo) : (clinic.district.nameRo || clinic.district.nameRu)}`}
                </span>
              </div>
              
              {clinic.workingHours && clinic.workingHours.length > 0 && (
                <div className="flex items-center text-gray-600 text-sm">
                  <WorkingHoursDisplay 
                    workingHours={clinic.workingHours} 
                    compact={true} 
                    showToday={true}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {clinic.cnam && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs sm:text-sm font-medium rounded-full">
                {t('cnamBadge')}
              </span>
            )}
          </div>

          {/* Rating and Action buttons - Mobile */}
          <div className="sm:hidden flex items-center justify-between gap-2 mb-4">
            {ratingData.hasRating && (
              <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-xl px-2 py-1 shadow-lg border border-white/20" title={t('overallRating')}>
                <svg 
                  className="w-4 h-4 text-yellow-400 fill-current mr-1" 
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span className="text-gray-800 font-bold text-sm">
                  {ratingData.averageRating.toFixed(2)}
                </span>
              </div>
            )}
            
            <div className="flex space-x-2">
              <Button
                onClick={() => setShowReviewModal(true)}
                className="flex items-center space-x-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 text-xs px-2 py-1 h-7"
              >
                <Star className="h-3 w-3" />
                <span>{language === 'ru' ? 'Оставить отзыв' : 'Lasă recenzie'}</span>
              </Button>
              
              <Button
                onClick={handleViewFullPage}
                className="flex items-center space-x-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 text-xs px-2 py-1 h-7"
              >
                <ExternalLink className="h-3 w-3" />
                <span>{language === 'ru' ? 'Подробнее' : 'Detalii'}</span>
              </Button>
            </div>
          </div>

        </DialogHeader>

        <div className="p-4 sm:p-6 overflow-y-auto h-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Content */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {clinic.verified ? (
                  <>
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
                        <div className="relative flex-1 sm:flex-none" ref={phoneOptionsRef}>
                          <Button 
                            onClick={handleCallClick}
                            className="bg-gray-700 hover:bg-gray-800 text-white flex items-center justify-center space-x-[0.2rem] w-full shadow-md hover:shadow-lg transition-all duration-200 border-0"
                            size="lg"
                          >
                            <Phone className="h-4 w-4" />
                            <span className="hidden sm:inline font-medium">{t('callClinic')}</span>
                            <span className="sm:hidden font-medium">{t('phone')}</span>
                          </Button>
                          
                          {/* Phone Options Dropdown - только для ПК */}
                          {showPhoneOptions && window.innerWidth > 768 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden min-w-[280px] w-full">
                              {/* Phone Number Display */}
                              <div className="p-4 border-b border-gray-100 bg-gray-50">
                                <div className="text-center">
                                  <p className="text-sm text-gray-600 mb-1">{t('phoneNumber')}</p>
                                  <div className="flex items-center justify-center space-x-2">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    <span className="text-lg font-bold text-gray-900">{clinic.phone}</span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="p-3 space-y-2">
                                {/* Copy Phone */}
                                <button
                                  onClick={handleCopyPhone}
                                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-3 rounded-lg transition-all duration-200 border border-gray-300 hover:border-gray-400 flex items-center justify-center space-x-2"
                                >
                                  <Copy className="h-4 w-4" />
                                  <span className="text-sm">{t('copyPhoneNumber')}</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
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
                  </>
                ) : (
                  <div className="w-full flex flex-col items-center space-y-3">
                    <div className="text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
                        <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                        {t('notVerified')}
                      </span>
                    </div>
                    <Button 
                      onClick={() => setShowVerificationModal(true)} 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white w-full sm:w-auto flex items-center justify-center space-x-2 transition-all duration-200"
                    >
                      <Shield className="h-4 w-4" />
                      <span>{t('verify')}</span>
                    </Button>
                  </div>
                )}
              </div>


              {/* Services and Prices */}
              {clinic.verified && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      {t('servicesAndPrices')}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600 font-medium">
                        {clinic.services?.length || 0} {language === 'ru' ? 'услуг' : 'servicii'}
                      </span>
                    </div>
                  </div>
                  {clinic.services && clinic.services.length > 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                      <CurrencyConverter 
                        services={clinic.services.map(service => ({
                          name: service.name,
                          price: service.price,
                          priceType: service.priceType || 'fixed',
                          currency: service.currency || clinic.currency || 'MDL'
                        }))}
                        className="p-6"
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-200">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 font-medium">
                        {t('servicesUpdating')}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-gray-500">
                      {t('pricesProvidedByClinic')} {new Date().toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <span className="text-xs text-gray-500">
                        {language === 'ru' ? 'Актуальные цены' : 'Prețuri actuale'}
                      </span>
                    </div>
                  </div>
                  

                </div>
              )}
            </div>

            {/* Right Sidebar - Sticky Container */}
            <div className="lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-2rem)] lg:min-h-[600px]">
              <div className="space-y-4 sm:space-y-6 h-full">
                {/* SOS Button */}
                {clinic.sosEnabled && (
                  <SosButton 
                    phone={clinic.phone} 
                    clinicName={language === 'ru' ? clinic.nameRu : clinic.nameRo} 
                  />
                )}

                {/* Reviews - Independent Scroll Container */}
                <div className="lg:sticky lg:top-0 lg:bg-white lg:z-10 lg:pb-4 lg:flex-1 lg:flex lg:flex-col">
                  <ReviewsList clinicId={clinic.id} compact={true} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
      
      {/* Booking Form Overlay */}
      <BookingModal 
        clinic={{
          ...clinic,
          name: language === 'ru' ? clinic.nameRu : clinic.nameRo
        }}
        open={showBookingForm}
        onClose={() => setShowBookingForm(false)}
      />

      {/* Verification Modal */}
      {showVerificationModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
          onClick={() => setShowVerificationModal(false)}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden border-0"
            onClick={(e) => e.stopPropagation()}
          >
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
                    <LazyImage 
                      src={clinic.logoUrl} 
                      alt={language === 'ru' ? clinic.nameRu : clinic.nameRo}
                      className="w-full h-full object-cover"
                      priority={true}
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

      {/* Review Modal */}
      <ReviewModal
        open={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        clinicId={clinic.id}
        clinicName={language === 'ru' ? clinic.nameRu : clinic.nameRo}
        onSubmit={handleReviewSubmit}
      />

    </Dialog>
  );
}
