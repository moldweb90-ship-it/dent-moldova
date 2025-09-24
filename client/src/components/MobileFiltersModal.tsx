import { useState, useEffect } from 'react';
import { Filter, X, Search, MapPin, ArrowUpDown, Clock, Zap, Trophy, Star, Shield, CreditCard, Calendar, Baby, Car, AlertTriangle, DollarSign, TrendingUp, HelpCircle } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useDebounce } from '../hooks/use-debounce';
import { useQuery } from '@tanstack/react-query';
import { ActiveClinicsCounter } from './ActiveClinicsCounter';

interface City {
  id: string;
  nameRu: string;
  nameRo: string;
}

interface District {
  id: string;
  nameRu: string;
  nameRo: string;
}

export interface FilterValues {
  city?: string;
  districts: string[];
  features: string[];
  promotionalLabels: string[];
  sort: 'dscore' | 'price' | 'popularity' | 'reviews';
  verified?: boolean;
  openNow?: boolean;
}

interface MobileFiltersModalProps {
  cities: City[];
  districts: District[];
  filters: FilterValues;
  onFiltersChange: (filters: FilterValues) => void;
  onApply: () => void;
  onReset: () => void;
  onSearch: (query: string) => void;
  open: boolean;
  onClose: () => void;
}

export function MobileFiltersModal({ 
  cities, 
  districts, 
  filters, 
  onFiltersChange, 
  onApply, 
  onReset,
  onSearch,
  open,
  onClose
}: MobileFiltersModalProps) {
  const { t, language } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);
  const debouncedQuery = useDebounce(searchQuery, 300);



  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  const updateFilter = (key: keyof FilterValues, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleDistrict = (districtId: string) => {
    const current = filters.districts;
    // Если район уже выбран, снимаем его
    if (current.includes(districtId)) {
      const updated = current.filter(v => v !== districtId);
      updateFilter('districts', updated);
    } else {
      // Если выбираем новый район, заменяем весь массив (только один район может быть выбран)
      updateFilter('districts', [districtId]);
    }
  };

  const toggleFeature = (feature: string) => {
    const current = filters.features;
    const updated = current.includes(feature) 
      ? current.filter(v => v !== feature)
      : [...current, feature];
    updateFilter('features', updated);
  };

  const handleApply = () => {
    onApply();
    onClose();
  };

  const handleReset = () => {
    onReset();
    setSearchQuery('');
  };

  const searchPlaceholder = language === 'ru' 
    ? "Поиск клиники или услуги..."
    : "Caută clinică sau serviciu...";

  const tooltipText = language === 'ru' 
    ? "Вы можете искать по названию клиники или по услугам. Например: 'удаление зуба', 'импланты', 'Life Dental'"
    : "Puteți căuta după numele clinicii sau după servicii. De exemplu: 'extracție dinte', 'implanturi', 'Life Dental'";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto p-0 mobile-filters-modal">
        <DialogHeader className="px-6 py-4 border-b border-gray-200">
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            {t('filters')}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Hidden button to receive initial focus */}
          <button tabIndex={-1} className="sr-only" autoFocus></button>
          
          {/* Search */}
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:border-blue-500 bg-white text-sm"
              />
              
              {/* Info icon */}
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <HelpCircle className="h-4 w-4" />
                </button>
              </div>
              
              {/* Tooltip - positioned relative to the main container */}
              {showTooltip && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-[9999]">
                  <div className="relative">
                    {tooltipText}
                    {/* Arrow */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-900"></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* City Filter */}
          <div>
            <div className="mt-6 mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-indigo-600" />
              <span className="text-xs font-bold uppercase text-gray-800">{t('city')}</span>
              <div className="ml-2 h-px flex-1 bg-gray-200"></div>
            </div>
            <Select value={filters.city || 'all'} onValueChange={(value) => updateFilter('city', value === 'all' ? undefined : value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('allCities')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allCities')}</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city.id} value={city.id}>
                    {language === 'ru' ? city.nameRu : city.nameRo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* District Filter */}
          {filters.city && districts.length > 0 && (
            <div>
              <div className="mt-6 mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-cyan-600" />
                <span className="text-xs font-bold uppercase text-gray-800">{t('districts')}</span>
                <div className="ml-2 h-px flex-1 bg-gray-200"></div>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {districts.map(district => (
                  <div key={district.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={district.id}
                      checked={filters.districts.includes(district.id)}
                      onCheckedChange={() => toggleDistrict(district.id)}
                      className="h-6 w-6 mobile-checkbox"
                    />
                    <label 
                      htmlFor={district.id} 
                      className="text-sm text-gray-700 cursor-pointer hover:text-gray-900 transition-colors"
                    >
                      {language === 'ru' ? district.nameRu : district.nameRo}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}



          {/* Availability Filter */}
          <div>
            <div className="mt-6 mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-600" />
              <span className="text-xs font-bold uppercase text-gray-800">{t('availability')}</span>
              <div className="ml-2 h-px flex-1 bg-gray-200"></div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="openNow"
                  checked={filters.openNow || false}
                  onCheckedChange={(checked) => updateFilter('openNow', checked)}
                  className="h-4 w-4"
                />
                <label 
                  htmlFor="openNow" 
                  className="text-sm text-gray-700 cursor-pointer hover:text-gray-900 transition-colors flex items-center gap-2"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  {t('openNow')}
                </label>
              </div>
            </div>
          </div>

          {/* Conveniences */}
          <div>
            <div className="mt-6 mb-2 flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-bold uppercase text-gray-800">{t('conveniences')}</span>
              <div className="ml-2 h-px flex-1 bg-gray-200"></div>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pediatricDentistry"
                  checked={filters.features.includes('pediatricDentistry')}
                  onCheckedChange={() => toggleFeature('pediatricDentistry')}
                  className="h-4 w-4"
                />
                <label 
                  htmlFor="pediatricDentistry" 
                  className="text-sm text-gray-700 cursor-pointer hover:text-gray-900 transition-colors flex items-center gap-2"
                >
                  <Baby className="h-4 w-4 text-blue-500" />
                  {t('pediatricDentistry')}
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="parking"
                  checked={filters.features.includes('parking')}
                  onCheckedChange={() => toggleFeature('parking')}
                  className="h-4 w-4"
                />
                <label 
                  htmlFor="parking" 
                  className="text-sm text-gray-700 cursor-pointer hover:text-gray-900 transition-colors flex items-center gap-2"
                >
                  <Car className="h-4 w-4 text-gray-600" />
                  {t('parking')}
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sos"
                  checked={filters.features.includes('sos')}
                  onCheckedChange={() => toggleFeature('sos')}
                  className="h-4 w-4"
                />
                <label 
                  htmlFor="sos" 
                  className="text-sm text-gray-700 cursor-pointer hover:text-gray-900 transition-colors flex items-center gap-2"
                >
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  {t('sos')}
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="work24h"
                  checked={filters.features.includes('work24h')}
                  onCheckedChange={() => toggleFeature('work24h')}
                  className="h-4 w-4"
                />
                <label 
                  htmlFor="work24h" 
                  className="text-sm text-gray-700 cursor-pointer hover:text-gray-900 transition-colors flex items-center gap-2"
                >
                  <Clock className="h-4 w-4 text-green-500" />
                  {t('work24h')}
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="credit"
                  checked={filters.features.includes('credit')}
                  onCheckedChange={() => toggleFeature('credit')}
                  className="h-4 w-4"
                />
                <label 
                  htmlFor="credit" 
                  className="text-sm text-gray-700 cursor-pointer hover:text-gray-900 transition-colors flex items-center gap-2"
                >
                  <CreditCard className="h-4 w-4 text-purple-500" />
                  {t('credit')}
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="weekendWork"
                  checked={filters.features.includes('weekendWork')}
                  onCheckedChange={() => toggleFeature('weekendWork')}
                  className="h-4 w-4"
                />
                <label 
                  htmlFor="weekendWork" 
                  className="text-sm text-gray-700 cursor-pointer hover:text-gray-900 transition-colors flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4 text-orange-500" />
                  {t('weekendWork')}
                </label>
              </div>
            </div>
          </div>

          {/* Sort */}
          <div>
            <div className="mt-6 mb-2 flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-bold uppercase text-gray-800">{t('sort')}</span>
              <div className="ml-2 h-px flex-1 bg-gray-200"></div>
            </div>
            <Select value={filters.sort} onValueChange={(value) => updateFilter('sort', value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dscore">
                  <div className="flex items-center">
                    <Trophy className="h-4 w-4 mr-2 text-yellow-500" />
                    {t('sortByRating')}
                  </div>
                </SelectItem>
                <SelectItem value="price">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                    {t('sortByPrice')}
                  </div>
                </SelectItem>
                <SelectItem value="popularity">
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-blue-500" />
                    {t('sortByPopularity')}
                  </div>
                </SelectItem>
                <SelectItem value="reviews">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-2 text-yellow-500" />
                    {t('sortByReviews')}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Promotional Labels */}
          <div>
            <div className="mt-6 mb-2 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-orange-600" />
              <span className="text-xs font-bold uppercase text-gray-800">{t('statuses')}</span>
              <div className="ml-2 h-px flex-1 bg-gray-200"></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="premium"
                  checked={filters.promotionalLabels.includes('premium')}
                  onCheckedChange={() => {
                    const current = filters.promotionalLabels;
                    const updated = current.includes('premium') 
                      ? current.filter(v => v !== 'premium')
                      : [...current, 'premium'];
                    updateFilter('promotionalLabels', updated);
                  }}
                  className="h-4 w-4"
                />
                <label 
                  htmlFor="premium" 
                  className="text-xs text-gray-700 cursor-pointer hover:text-gray-900 transition-colors bg-purple-100 px-2 py-1 rounded"
                >
                  {t('premium')}
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="discount"
                  checked={filters.promotionalLabels.includes('discount')}
                  onCheckedChange={() => {
                    const current = filters.promotionalLabels;
                    const updated = current.includes('discount') 
                      ? current.filter(v => v !== 'discount')
                      : [...current, 'discount'];
                    updateFilter('promotionalLabels', updated);
                  }}
                  className="h-4 w-4"
                />
                <label 
                  htmlFor="discount" 
                  className="text-xs text-gray-700 cursor-pointer hover:text-gray-900 transition-colors bg-pink-100 px-2 py-1 rounded"
                >
                  {t('discount')}
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="new"
                  checked={filters.promotionalLabels.includes('new')}
                  onCheckedChange={() => {
                    const current = filters.promotionalLabels;
                    const updated = current.includes('new') 
                      ? current.filter(v => v !== 'new')
                      : [...current, 'new'];
                    updateFilter('promotionalLabels', updated);
                  }}
                  className="h-4 w-4"
                />
                <label 
                  htmlFor="new" 
                  className="text-xs text-gray-700 cursor-pointer hover:text-gray-900 transition-colors bg-yellow-100 px-2 py-1 rounded"
                >
                  {t('new')}
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="popular"
                  checked={filters.promotionalLabels.includes('popular')}
                  onCheckedChange={() => {
                    const current = filters.promotionalLabels;
                    const updated = current.includes('popular') 
                      ? current.filter(v => v !== 'popular')
                      : [...current, 'popular'];
                    updateFilter('promotionalLabels', updated);
                  }}
                  className="h-4 w-4"
                />
                <label 
                  htmlFor="popular" 
                  className="text-xs text-gray-700 cursor-pointer hover:text-gray-900 transition-colors bg-red-100 px-2 py-1 rounded"
                >
                  {t('popular')}
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="high_rating"
                  checked={filters.promotionalLabels.includes('high_rating')}
                  onCheckedChange={() => {
                    const current = filters.promotionalLabels;
                    const updated = current.includes('high_rating') 
                      ? current.filter(v => v !== 'high_rating')
                      : [...current, 'high_rating'];
                    updateFilter('promotionalLabels', updated);
                  }}
                  className="h-4 w-4"
                />
                <label 
                  htmlFor="high_rating" 
                  className="text-xs text-gray-700 cursor-pointer hover:text-gray-900 transition-colors bg-green-100 px-2 py-1 rounded"
                >
                  {t('high_rating')}
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <Button onClick={handleApply} className="w-full bg-blue-600 text-white hover:bg-blue-700 shadow-lg">
              {t('applyFilters')}
            </Button>
            <Button onClick={handleReset} variant="outline" className="w-full hover:bg-gray-50">
              {t('reset')}
            </Button>
          </div>
          
          {/* Active Clinics Counter */}
          <div className="pt-4 border-t border-gray-200">
            <ActiveClinicsCounter 
              onClick={() => {
                onFiltersChange({ 
                  districts: [],
                  features: [],
                  promotionalLabels: [],
                  sort: 'dscore',
                  verified: true,
                  openNow: undefined
                });
                onApply();
                onClose();
                // Прокрутка в начало страницы при клике на "Активные клиники" в мобильной версии
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}