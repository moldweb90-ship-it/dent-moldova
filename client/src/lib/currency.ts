// Currency conversion utilities
export type Currency = 'MDL' | 'EUR' | 'USD';

export interface CurrencyRates {
  MDL: number;
  EUR: number;
  USD: number;
}

// Static currency rates (in practice, these would come from an API)
export const CURRENCY_RATES: CurrencyRates = {
  MDL: 1, // Base currency
  EUR: 20.5, // 1 EUR = 20.5 MDL (approximate)
  USD: 18.5, // 1 USD = 18.5 MDL (approximate)
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  MDL: 'лей',
  EUR: '€',
  USD: '$',
};

export const CURRENCY_NAMES: Record<Currency, string> = {
  MDL: 'лей',
  EUR: 'евро',
  USD: 'доллар',
};

export const CURRENCY_NAMES_RO: Record<Currency, string> = {
  MDL: 'lei',
  EUR: 'euro',
  USD: 'dolar',
};

/**
 * Get currency name based on language
 */
export function getCurrencyName(currency: Currency, language: 'ru' | 'ro'): string {
  if (language === 'ro') {
    return CURRENCY_NAMES_RO[currency];
  }
  return CURRENCY_NAMES[currency];
}

/**
 * Convert price from one currency to another
 */
export function convertPrice(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): number {
  if (fromCurrency === toCurrency) return amount;
  
  // Convert to MDL first (base currency)
  const amountInMDL = amount * CURRENCY_RATES[fromCurrency];
  
  // Convert from MDL to target currency
  const convertedAmount = amountInMDL / CURRENCY_RATES[toCurrency];
  
  return Math.round(convertedAmount);
}

/**
 * Format price with currency symbol
 */
export function formatPrice(amount: number, currency: Currency, language?: 'ru' | 'ro'): string {
  if (currency === 'MDL') {
    const symbol = language === 'ro' ? 'lei' : 'лей';
    return `${amount} ${symbol}`;
  }
  
  const symbol = CURRENCY_SYMBOLS[currency];
  return `${symbol}${amount}`;
}

/**
 * Get minimum price from services array, optionally convert to target currency
 */
export function getMinPrice(
  services: Array<{ price: number; currency: Currency }>,
  targetCurrency?: Currency
): { price: number; currency: Currency } | null {
  if (!services || services.length === 0) return null;
  
  // Convert all prices to the same currency for comparison
  const baseCurrency: Currency = 'MDL';
  const convertedServices = services.map(service => ({
    ...service,
    priceInBase: convertPrice(service.price, service.currency, baseCurrency)
  }));
  
  // Find minimum price
  const minService = convertedServices.reduce((min, current) => 
    current.priceInBase < min.priceInBase ? current : min
  );
  
  if (targetCurrency && targetCurrency !== minService.currency) {
    return {
      price: convertPrice(minService.price, minService.currency, targetCurrency),
      currency: targetCurrency
    };
  }
  
  return {
    price: minService.price,
    currency: minService.currency
  };
}