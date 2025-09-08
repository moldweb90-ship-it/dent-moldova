import { useState } from 'react';
import { X, Phone, Globe, ExternalLink, Calendar, Shield } from 'lucide-react';
import { useTranslation, SPECIALIZATIONS } from '../lib/i18n';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScoreBar } from './ScoreBar';
import { BookingModal } from './BookingModal';
import { CurrencyConverter } from './CurrencyConverter';
import { DataSourcesInfo } from './DataSourcesInfo';
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
  currency: Currency;
  services?: Service[];
}

interface ClinicDetailProps {
  clinic: Clinic | null;
  open: boolean;
  onClose: () => void;
  onBookClick: (clinic: Clinic) => void;
}

export function ClinicDetail({ clinic, open, onClose, onBookClick }: ClinicDetailProps) {
  const { t, language } = useTranslation();
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationForm, setVerificationForm] = useState({ email: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!clinic) return null;

  const getDScoreColor = (score: number) => {
    if (score >= 75) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleBookClick = () => {
    trackClickBook(clinic.id);
    setShowBookingForm(true);
  };

  const handleCallClick = () => {
    if (clinic.phone) {
      trackClickPhone(clinic.id);
      window.open(`tel:${clinic.phone}`, '_self');
    }
  };

  const handleWebsiteClick = () => {
    if (clinic.website) {
      trackClickWebsite(clinic.id);
      window.open(clinic.website, '_blank');
    }
  };

  const handleViewFullPage = () => {
    window.open(`/clinic/${clinic.slug}`, '_blank');
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[95vh] overflow-y-auto mx-auto">
        <DialogHeader className="border-b border-gray-200 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                {language === 'ru' ? (clinic.nameRu || clinic.nameRo || 'Название клиники') : (clinic.nameRo || clinic.nameRu || 'Numele clinicii')}
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-2">
                {clinic.verified && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs sm:text-sm font-medium rounded-full">
                    {t('verifiedBadge')}
                  </span>
                )}
                {clinic.cnam && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs sm:text-sm font-medium rounded-full">
                    {t('cnamBadge')}
                  </span>
                )}
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${getDScoreColor(clinic.dScore)} rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg`} title={t('overallRating')}>
                  {clinic.dScore}
                </div>
                {/* Mobile open button - рядом с рейтингом */}
                <Button
                  onClick={handleViewFullPage}
                  className="sm:hidden flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-full"
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
            {/* Desktop button to view full page */}
            <div className="hidden sm:flex justify-end">
              <Button
                onClick={handleViewFullPage}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 mr-8"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="font-medium">{t('viewSeparately')}</span>
              </Button>
            </div>
          </div>
          <p className="text-gray-600 mt-2">
            {language === 'ru' ? (clinic.addressRu || clinic.addressRo) : (clinic.addressRo || clinic.addressRu)}
            {(clinic.addressRu || clinic.addressRo) && ', '}
            {language === 'ru' ? (clinic.city.nameRu || clinic.city.nameRo) : (clinic.city.nameRo || clinic.city.nameRu)}
            {clinic.district && `, ${language === 'ru' ? (clinic.district.nameRu || clinic.district.nameRo) : (clinic.district.nameRo || clinic.district.nameRu)}`}
          </p>
        </DialogHeader>

        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Content */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {clinic.verified ? (
                  <>
                    <Button 
                      onClick={handleBookClick}
                      className="bg-blue-600 text-white hover:bg-blue-700 w-full sm:w-auto flex items-center justify-center space-x-2"
                    >
                      <Calendar className="h-4 w-4" />
                      <span>{t('book')}</span>
                    </Button>
                    {clinic.phone && (
                      <Button 
                        onClick={handleCallClick}
                        variant="outline"
                        className="flex items-center justify-center space-x-2 w-full sm:w-auto"
                      >
                        <Phone className="h-4 w-4" />
                        <span>{t('callClinic')}</span>
                      </Button>
                    )}
                    {clinic.website && (
                      <Button 
                        onClick={handleWebsiteClick}
                        variant="outline"
                        className="flex items-center justify-center space-x-2 w-full sm:w-auto"
                      >
                        <Globe className="h-4 w-4" />
                        <span>{t('website')}</span>
                      </Button>
                    )}
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('servicesAndPrices')}
                  </h3>
                  {clinic.services && clinic.services.length > 0 ? (
                    <div className="bg-white rounded-lg border">
                      <CurrencyConverter 
                        services={clinic.services.map(service => ({
                          name: service.name,
                          price: service.price,
                          priceType: service.priceType || 'fixed',
                          currency: service.currency || clinic.currency || 'MDL'
                        }))}
                        className="p-4"
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                      <p className="text-gray-500">
                        {t('servicesUpdating')}
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {t('pricesProvidedByClinic')} {new Date().toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="space-y-4 sm:space-y-6">
              {/* Before/After Cases */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('beforeAfter')}</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <img 
                      src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=150" 
                      alt={t('beforeTreatment')} 
                      className="rounded-lg object-cover w-full h-24" 
                    />
                    <img 
                      src="https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=150" 
                      alt={t('afterTreatment')} 
                      className="rounded-lg object-cover w-full h-24" 
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    {t('teethWhitening')}
                  </p>
                </div>
                
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-2">
                    <img 
                      src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=150" 
                      alt={t('beforeImplant')} 
                      className="rounded-lg object-cover w-full h-24" 
                    />
                    <img 
                      src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=150" 
                      alt={t('afterImplant')} 
                      className="rounded-lg object-cover w-full h-24" 
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    {t('dentalImplant')}
                  </p>
                </div>
              </div>

              {/* Score Explanation - Moved to right sidebar */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('scoreExplanation')}</h3>
                <div className="space-y-3">
                  {/* Google Rating */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">G</span>
                        </div>
                        <span className="font-semibold text-blue-900">{t('googleRating')}</span>
                      </div>
                      <div className="text-right whitespace-nowrap">
                        <div className="text-lg font-bold text-blue-900">{clinic.reviewsIndex}<span className="text-xs text-blue-600">/100</span></div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <ScoreBar value={clinic.reviewsIndex} label="" />
                    </div>
                    <p className="text-xs text-blue-700">
                      {t('googleRatingDesc')}
                    </p>
                  </div>
                  
                  {/* Doctor Experience */}
                  <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">👨‍⚕️</span>
                        </div>
                        <span className="font-semibold text-green-900">{t('doctorExperience')}</span>
                      </div>
                      <div className="text-right whitespace-nowrap">
                        <div className="text-lg font-bold text-green-900">{clinic.trustIndex}<span className="text-xs text-green-600">/100</span></div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <ScoreBar value={clinic.trustIndex} label="" />
                    </div>
                    <p className="text-xs text-green-700">
                      {t('doctorExperienceDesc')}
                    </p>
                  </div>
                  
                  {/* Price Policy */}
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">💰</span>
                        </div>
                        <span className="font-semibold text-purple-900">{t('pricePolicy')}</span>
                      </div>
                      <div className="text-right whitespace-nowrap">
                        <div className="text-lg font-bold text-purple-900">{clinic.priceIndex}<span className="text-xs text-purple-600">/100</span></div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <ScoreBar value={clinic.priceIndex} label="" />
                    </div>
                    <p className="text-xs text-purple-700">
                      {t('pricePolicyDesc')}
                    </p>
                  </div>
                  
                  {/* Booking Convenience */}
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">📅</span>
                        </div>
                        <span className="font-semibold text-orange-900">{t('bookingConvenience')}</span>
                      </div>
                      <div className="text-right whitespace-nowrap">
                        <div className="text-lg font-bold text-orange-900">{clinic.accessIndex}<span className="text-xs text-orange-600">/100</span></div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <ScoreBar value={clinic.accessIndex} label="" />
                    </div>
                    <p className="text-xs text-orange-700">
                      {t('bookingConvenienceDesc')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Data Sources Info */}
              <DataSourcesInfo />
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{t('verificationRequest')}</h3>
                    <p className="text-blue-100 text-sm">{t('verificationDescription')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowVerificationModal(false)}
                  className="text-white hover:text-blue-100 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Clinic Info */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                {clinic.logoUrl && (
                  <img 
                    src={clinic.logoUrl} 
                    alt={language === 'ru' ? clinic.nameRu : clinic.nameRo}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">
                    {language === 'ru' ? clinic.nameRu : clinic.nameRo}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {language === 'ru' ? clinic.city.nameRu : clinic.city.nameRo}
                    {clinic.district && `, ${language === 'ru' ? clinic.district.nameRu : clinic.district.nameRo}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="p-6">
              <form onSubmit={handleVerificationSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('email')} *
                  </label>
                  <input
                    type="email"
                    required
                    value={verificationForm.email}
                    onChange={(e) => setVerificationForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder={t('emailPlaceholder')}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('phone')} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={verificationForm.phone}
                    onChange={(e) => setVerificationForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder={t('phonePlaceholder')}
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? t('sending') : t('sendVerificationRequest')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
}
