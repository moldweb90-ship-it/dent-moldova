import { X } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { getCurrencyName } from '../lib/currency';
import { getClinicName } from '../lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

interface Clinic {
  id: string;
  name: string;
  packages: Array<{
    id: string;
    code: string;
    nameRu: string;
    nameRo: string;
    priceMin: number;
    priceMax: number;
    priceMedian: number;
  }>;
}

interface PricingModalProps {
  clinic: Clinic | null;
  open: boolean;
  onClose: () => void;
  onBookClick: (clinic: Clinic) => void;
}

export function PricingModal({ clinic, open, onClose, onBookClick }: PricingModalProps) {
  const { t, language } = useTranslation();
  const [currency, setCurrency] = useState('MDL');
  const [selectedCategory, setSelectedCategory] = useState('all');

  if (!clinic) return null;

  const handleBookClick = () => {
    onBookClick(clinic);
    onClose();
  };

  const categories = [
    { id: 'all', nameRu: 'Все услуги', nameRo: 'Toate serviciile' },
    { id: 'implant', nameRu: 'Имплантация', nameRo: 'Implantologie' },
    { id: 'hygiene', nameRu: 'Гигиена', nameRo: 'Igienă' },
    { id: 'endo', nameRu: 'Эндодонтия', nameRo: 'Endodonție' }
  ];

  const filteredPackages = selectedCategory === 'all' 
    ? clinic.packages 
    : clinic.packages.filter(pkg => pkg.code.includes(selectedCategory));

  const currencySymbol = currency === 'MDL' ? getCurrencyName('MDL', language) : '€';
  const exchangeRate = currency === 'MDL' ? 1 : 0.05;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-gray-200 pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Цены - {getClinicName(clinic)}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {language === 'ru' ? cat.nameRu : cat.nameRo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MDL">MDL</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-gray-50 rounded-lg overflow-hidden mb-6">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Услуга
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    От
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    До
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Медиана
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Примечание
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPackages.map(pkg => (
                  <tr key={pkg.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {language === 'ru' ? pkg.nameRu : pkg.nameRo}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {Math.round(pkg.priceMin * exchangeRate).toLocaleString()} {currencySymbol}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {Math.round(pkg.priceMax * exchangeRate).toLocaleString()} {currencySymbol}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {Math.round(pkg.priceMedian * exchangeRate).toLocaleString()} {currencySymbol}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      Консультация включена
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center">
            <Button 
              onClick={handleBookClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            >
              {t('wantAppointment')}
            </Button>
          </div>

          <p className="text-xs text-gray-500 mt-4 text-center">
            {t('pricesProvidedBy')}. {t('lastUpdated')}: 15.01.2024
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}