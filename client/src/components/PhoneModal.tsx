import React from 'react';
import { Phone, Copy } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { toast } from '@/hooks/use-toast';

interface PhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinic: {
    nameRu: string;
    nameRo: string;
    phone?: string;
    logoUrl?: string;
    city: { nameRu: string; nameRo: string };
    district?: { nameRu: string; nameRo: string } | null;
  };
}

export function PhoneModal({ isOpen, onClose, clinic }: PhoneModalProps) {
  const { t, language } = useTranslation();

  // Handle Escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !clinic.phone) return null;

  const handleCopyPhone = async () => {
    if (clinic.phone) {
      try {
        await navigator.clipboard.writeText(clinic.phone);
        toast({
          title: t('phoneCopied'),
          description: t('phoneCopiedDesc'),
        });
      } catch (err) {
        console.error('Failed to copy phone number:', err);
      }
    }
  };



  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button - positioned absolutely */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 z-20 text-gray-400 hover:text-gray-600 transition-colors p-2 bg-white rounded-full shadow-lg hover:shadow-xl cursor-pointer"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{t('callClinic')}</h3>
                <p className="text-blue-100 text-sm">{t('chooseContactMethod')}</p>
              </div>
            </div>
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

        {/* Phone Number */}
        <div className="p-6 border-b border-gray-100">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">{t('phoneNumber')}</p>
            <div className="flex items-center justify-center space-x-2">
              <Phone className="h-5 w-5 text-gray-400" />
              <span className="text-2xl font-bold text-gray-900">{clinic.phone}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 space-y-3">
          {/* Copy Phone */}
          <button
            onClick={handleCopyPhone}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-all duration-200 border border-gray-300 hover:border-gray-400"
          >
            <div className="flex items-center justify-center space-x-2">
              <Copy className="h-5 w-5" />
              <span>{t('copyPhoneNumber')}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
