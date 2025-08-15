import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { convertPrice, formatPrice, type Currency, CURRENCY_NAMES } from '@/lib/currency';

interface CurrencyConverterProps {
  services: Array<{ name: string; price: number; currency: Currency }>;
  className?: string;
  onCurrencyChange?: (currency: Currency) => void;
}

export function CurrencyConverter({ services, className = '', onCurrencyChange }: CurrencyConverterProps) {
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
      selectedCurrency
    )
  }));

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Currency Selector */}
      <div className="flex items-center space-x-3">
        <span className="text-sm font-medium text-gray-700">Валюта:</span>
        <Select
          value={selectedCurrency}
          onValueChange={(value: Currency) => handleCurrencyChange(value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MDL">MDL (лей)</SelectItem>
            <SelectItem value="EUR">EUR (€)</SelectItem>
            <SelectItem value="USD">USD ($)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Services List */}
      <div className="space-y-3">
        {convertedServices.map((service, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="font-medium text-gray-900">
              {service.name}
            </div>
            <div className="font-semibold text-blue-600">
              {service.displayPrice}
              {service.currency !== selectedCurrency && (
                <span className="text-xs text-gray-500 ml-2">
                  (от {formatPrice(service.price, service.currency)})
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedCurrency !== 'MDL' && (
        <p className="text-xs text-gray-500">
          * Курсы валют могут отличаться от текущих рыночных. Уточняйте актуальные цены в клинике.
        </p>
      )}
    </div>
  );
}