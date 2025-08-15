import { useState } from 'react';
import { X, Phone, Globe } from 'lucide-react';
import { useTranslation, SPECIALIZATIONS } from '../lib/i18n';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScoreBar } from './ScoreBar';
import { BookingForm } from './BookingForm';
import { CurrencyConverter } from './CurrencyConverter';
import { type Currency } from '@/lib/currency';

interface Service {
  id: string;
  name: string;
  price: number;
  currency: Currency;
}

interface Clinic {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string;
  city: { nameRu: string; nameRo: string };
  district?: { nameRu: string; nameRo: string } | null;
  address?: string;
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

  if (!clinic) return null;

  const getDScoreColor = (score: number) => {
    if (score >= 75) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleBookClick = () => {
    setShowBookingForm(true);
    // Don't close the main modal, just open booking form overlay
  };

  const handleCallClick = () => {
    if (clinic.phone) {
      window.open(`tel:${clinic.phone}`, '_self');
    }
  };

  const handleWebsiteClick = () => {
    if (clinic.website) {
      window.open(clinic.website, '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <DialogTitle className="text-2xl font-bold text-gray-900">
                {clinic.name}
              </DialogTitle>
              <div className="flex items-center space-x-2">
                {clinic.verified && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                    {t('verifiedBadge')}
                  </span>
                )}
                {clinic.cnam && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    {t('cnamBadge')}
                  </span>
                )}
              </div>
              <div className={`w-12 h-12 ${getDScoreColor(clinic.dScore)} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                {clinic.dScore}
              </div>
            </div>
          </div>
          <p className="text-gray-600 mt-2">
            {clinic.address && `${clinic.address}, `}
            {language === 'ru' ? clinic.city.nameRu : clinic.city.nameRo}
            {clinic.district && `, ${language === 'ru' ? clinic.district.nameRu : clinic.district.nameRo}`}
          </p>
        </DialogHeader>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Action Buttons */}
              <div className="flex space-x-4">
                <Button 
                  onClick={handleBookClick}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  {t('book')}
                </Button>
                {clinic.phone && (
                  <Button 
                    onClick={handleCallClick}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <Phone className="h-4 w-4" />
                    <span>{t('callClinic')}</span>
                  </Button>
                )}
                {clinic.website && (
                  <Button 
                    onClick={handleWebsiteClick}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <Globe className="h-4 w-4" />
                    <span>{t('website')}</span>
                  </Button>
                )}
              </div>

              {/* Services and Prices */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {language === 'ru' ? 'Услуги и цены' : 'Servicii și prețuri'}
                </h3>
                {clinic.services && clinic.services.length > 0 ? (
                  <div className="bg-white rounded-lg border">
                    <CurrencyConverter 
                      services={clinic.services.map(service => ({
                        name: service.name,
                        price: service.price,
                        currency: service.currency || clinic.currency || 'MDL'
                      }))}
                      className="p-4"
                    />
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <p className="text-gray-500">
                      {language === 'ru' 
                        ? 'Услуги и цены уточняются. Свяжитесь с клиникой для получения актуальной информации.' 
                        : 'Serviciile și prețurile sunt în curs de actualizare. Contactați clinica pentru informații actuale.'}
                    </p>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {language === 'ru' 
                    ? 'Цены предоставлены клиникой. Последнее обновление: ' 
                    : 'Prețurile sunt furnizate de clinică. Ultima actualizare: '
                  }{new Date().toLocaleDateString()}
                </p>
              </div>

              {/* Score Explanation */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('scoreExplanation')}</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium text-gray-900">{t('price')}</span>
                      <p className="text-sm text-gray-600">{t('priceDescription')}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24">
                        <ScoreBar value={100 - clinic.priceIndex} label="" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{100 - clinic.priceIndex}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium text-gray-900">{t('trust')}</span>
                      <p className="text-sm text-gray-600">{t('trustDescription')}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24">
                        <ScoreBar value={clinic.trustIndex} label="" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{clinic.trustIndex}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium text-gray-900">{t('reviews')}</span>
                      <p className="text-sm text-gray-600">{t('reviewsDescription')}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24">
                        <ScoreBar value={clinic.reviewsIndex} label="" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{clinic.reviewsIndex}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium text-gray-900">{t('access')}</span>
                      <p className="text-sm text-gray-600">{t('accessDescription')}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24">
                        <ScoreBar value={clinic.accessIndex} label="" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{clinic.accessIndex}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Before/After Cases */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('beforeAfter')}</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <img 
                      src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=150" 
                      alt={language === 'ru' ? 'До лечения' : 'Înainte de tratament'} 
                      className="rounded-lg object-cover w-full h-24" 
                    />
                    <img 
                      src="https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=150" 
                      alt={language === 'ru' ? 'После лечения' : 'După tratament'} 
                      className="rounded-lg object-cover w-full h-24" 
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    {language === 'ru' ? 'Отбеливание зубов' : 'Albirea dinților'}
                  </p>
                </div>
                
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-2">
                    <img 
                      src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=150" 
                      alt={language === 'ru' ? 'До имплантации' : 'Înainte de implant'} 
                      className="rounded-lg object-cover w-full h-24" 
                    />
                    <img 
                      src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=150" 
                      alt={language === 'ru' ? 'После имплантации' : 'După implant'} 
                      className="rounded-lg object-cover w-full h-24" 
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    {language === 'ru' ? 'Имплантация зуба' : 'Implant dentar'}
                  </p>
                </div>
              </div>

              {/* Data Sources */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">{t('dataSources')}</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• {t('pricesProvidedBy')}</li>
                  <li>• {t('reviewsFromPublic')}</li>
                  <li>• {t('lastUpdated')}: 15.01.2024</li>
                </ul>
              </div>

              {/* Disclaimer */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  {t('disclaimer')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
      
      {/* Booking Form Overlay */}
      <BookingForm 
        clinic={clinic}
        open={showBookingForm}
        onClose={() => setShowBookingForm(false)}
      />
    </Dialog>
  );
}
