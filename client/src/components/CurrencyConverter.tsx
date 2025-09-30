import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { convertPrice, formatPrice, type Currency, getCurrencyName } from '@/lib/currency';
import { useTranslation } from '@/lib/i18n';

interface CurrencyConverterProps {
  services: Array<{ name: string; price: number; priceType?: 'fixed' | 'from'; currency: Currency }>;
  className?: string;
  onCurrencyChange?: (currency: Currency) => void;
}

export function CurrencyConverter({ services, className = '', onCurrencyChange }: CurrencyConverterProps) {
  const { t, language } = useTranslation();
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('MDL');

  // Load saved currency preference
  useEffect(() => {
    const savedCurrency = localStorage.getItem('preferred_currency') as Currency;
    if (savedCurrency && ['MDL', 'EUR', 'USD'].includes(savedCurrency)) {
      setSelectedCurrency(savedCurrency);
    }
  }, []);

  const handleCurrencyChange = (currency: Currency) => {
    setSelectedCurrency(currency);
    localStorage.setItem('preferred_currency', currency);
    onCurrencyChange?.(currency);
  };

  // Convert services to selected currency
  const convertedServices = services.map(service => ({
    ...service,
    convertedPrice: convertPrice(service.price, service.currency, selectedCurrency),
    displayPrice: formatPrice(
      convertPrice(service.price, service.currency, selectedCurrency), 
      selectedCurrency,
      language
    )
  }));

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Currency Selector */}
      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-sm font-semibold text-gray-700">{t('currency')}:</span>
        </div>
        <Select value={selectedCurrency} onValueChange={(value: Currency) => handleCurrencyChange(value)}>
          <SelectTrigger className="w-32 sm:w-36 h-8 rounded-lg bg-white border-gray-300 hover:border-gray-400 transition-colors">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MDL">MDL ({getCurrencyName('MDL', language)})</SelectItem>
            <SelectItem value="EUR">EUR ({getCurrencyName('EUR', language)})</SelectItem>
            <SelectItem value="USD">USD ({getCurrencyName('USD', language)})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Services List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {convertedServices.map((service, index) => (
          <div
            key={index}
            className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white hover:border-gray-300 hover:shadow-md transition-all duration-200"
          >
            {/* Service Name */}
            <div className="p-4 pb-2">
              <div className="text-gray-900 font-light text-sm leading-tight line-clamp-2 min-h-[0.5rem] flex items-start">
                {service.name}
              </div>
            </div>
            
            {/* Price Section */}
            <div className="px-4 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {service.priceType === 'from' && (
                    <span className="text-gray-500 text-xs font-medium">
                      {language === 'ro' ? 'de la' : 'от'}
                    </span>
                  )}
                  <span className="text-gray-900 font-bold text-lg">
                    {service.displayPrice}
                  </span>
                </div>
              </div>
              
              {/* Original Currency */}
              {service.currency !== selectedCurrency && (
                <div className="mt-1 text-xs text-gray-500">
                  ({t('from')} {formatPrice(service.price, service.currency, language)})
                </div>
              )}
            </div>
            
            {/* Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
          </div>
        ))}
      </div>

      {selectedCurrency !== 'MDL' && (
        <p className="text-xs text-gray-500">
          * {t('currencyRatesDisclaimer')}
        </p>
      )}
    </div>
  );
}