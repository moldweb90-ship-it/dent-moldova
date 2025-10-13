import { useState, useEffect, useRef } from 'react';
import { Filter, X, MapPin, ArrowUpDown, Clock, Zap, Trophy, Star, Shield, CreditCard, Calendar, Baby, Car, AlertTriangle, DollarSign, TrendingUp } from 'lucide-react';
import { AnimatedSearchInput } from './AnimatedSearchInput';
import { useTranslation } from '../lib/i18n';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { useDebounce } from '../hooks/use-debounce';
import { useQuery } from '@tanstack/react-query';

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

interface FiltersSidebarProps {
  cities: City[];
  districts: District[];
  filters: FilterValues;
  onFiltersChange: (filters: FilterValues) => void;
  onApply: () => void;
  onReset: () => void;
  onSearch: (query: string) => void;
}

export function FiltersSidebar({ 
  cities, 
  districts, 
  filters, 
  onFiltersChange, 
  onApply, 
  onReset,
  onSearch 
}: FiltersSidebarProps) {
  const { t, language } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  // Debug logging removed to prevent infinite loop

  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  // Закрытие dropdown'ов при клике вне их
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
        setCityDropdownOpen(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setSortDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const togglePromotionalLabel = (label: string) => {
    const current = filters.promotionalLabels;
    const updated = current.includes(label) 
      ? current.filter(v => v !== label)
      : [...current, label];
    updateFilter('promotionalLabels', updated);
  };

  // Group districts into columns for better layout
  const districtsPerColumn = 3;
  const districtColumns = [];
  if (districts.length > 0) {
    for (let i = 0; i < districts.length; i += districtsPerColumn) {
      districtColumns.push(districts.slice(i, i + districtsPerColumn));
    }
  }

  return (
    <div className="bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Search */}
          <div>
            <AnimatedSearchInput
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>

        {/* City Filter */}
        <div>
          <div className="mt-6 mb-2 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-indigo-600" />
                          <span className="text-[0.8rem] font-bold uppercase text-gray-800">{t('city')}</span>
            <div className="ml-2 h-px flex-1 bg-gray-200"></div>
          </div>
                  <div className="relative" ref={cityDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                      className="w-full h-10 px-3 py-2 border-2 border-gray-200 rounded-md bg-white text-sm focus:outline-none focus:border-blue-500 hover:border-gray-300 transition-colors disabled:cursor-not-allowed disabled:opacity-50 text-left flex items-center justify-between"
                      disabled={cities.length === 0}
                    >
                      <span>
                        {filters.city 
                          ? cities.find(c => c.id === filters.city)?.[language === 'ru' ? 'nameRu' : 'nameRo'] || t('allCities')
                          : t('allCities')
                        }
                      </span>
                      <span className={`text-gray-400 transition-transform ${cityDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                    
                    {cityDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                        <button
                          type="button"
                          onClick={() => {
                            updateFilter('city', undefined);
                            setCityDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${!filters.city ? 'bg-blue-50 text-blue-600' : ''}`}
                        >
                          {t('allCities')}
                        </button>
                        {cities.map(city => (
                          <button
                            key={city.id}
                            type="button"
                            onClick={() => {
                              updateFilter('city', city.id);
                              setCityDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${filters.city === city.id ? 'bg-blue-50 text-blue-600' : ''}`}
                          >
                            {language === 'ru' ? city.nameRu : city.nameRo}
                          </button>
                        ))}
                      </div>
                    )}
          </div>
          {cities.length === 0 && (
            <p className="text-xs text-gray-500 mt-1">Загружаем список городов...</p>
          )}
        </div>

        {/* District Filter - only show if city is selected and has districts */}
        {filters.city && districts.length > 0 && (
          <div>
            <div className="mt-6 mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-cyan-600" />
                              <span className="text-[0.8rem] font-bold uppercase text-gray-800">{t('districts')}</span>
              <div className="ml-2 h-px flex-1 bg-gray-200"></div>
            </div>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {districtColumns.map((column, columnIndex) => (
                <div key={columnIndex} className="grid grid-cols-1 gap-2">
                  {column.map(district => (
                    <div key={district.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={district.id}
                        checked={filters.districts.includes(district.id)}
                        onCheckedChange={() => toggleDistrict(district.id)}
                        className="h-6 w-6 sm:h-4 sm:w-4 mobile-checkbox"
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
              ))}
            </div>
          </div>
        )}

        {/* Open Now Filter */}
        <div>
          <div className="mt-6 mb-2 flex items-center gap-2">
            <Clock className="h-4 w-4 text-green-600" />
            <span className="text-[0.8rem] font-bold uppercase text-gray-800">{t('availability')}</span>
            <div className="ml-2 h-px flex-1 bg-gray-200"></div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="openNow"
                checked={filters.openNow || false}
                onCheckedChange={(checked) => {
                  updateFilter('openNow', checked);
                }}
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

        {/* Additional Features */}
        <div>
          <div className="mt-6 mb-2 flex items-center gap-2">
            <Zap className="h-4 w-4 text-blue-600" />
            <span className="text-[0.8rem] font-bold uppercase text-gray-800">{t('conveniences')}</span>
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
            <span className="text-[0.8rem] font-bold uppercase text-gray-800">{t('sort')}</span>
            <div className="ml-2 h-px flex-1 bg-gray-200"></div>
          </div>
                  <div className="relative" ref={sortDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                      className="w-full h-10 px-3 py-2 border-2 border-gray-200 rounded-md bg-white text-sm focus:outline-none focus:border-blue-500 hover:border-gray-300 transition-colors text-left flex items-center justify-between"
                    >
                      <span>
                        {filters.sort === 'dscore' && '🏆 ' + t('sortByRating')}
                        {filters.sort === 'price' && '💰 ' + t('sortByPrice')}
                        {filters.sort === 'popularity' && '📈 ' + t('sortByPopularity')}
                        {filters.sort === 'reviews' && '⭐ ' + t('sortByReviews')}
                      </span>
                      <span className={`text-gray-400 transition-transform ${sortDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                    
                    {sortDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                        <button
                          type="button"
                          onClick={() => {
                            updateFilter('sort', 'dscore');
                            setSortDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${filters.sort === 'dscore' ? 'bg-blue-50 text-blue-600' : ''}`}
                        >
                          🏆 {t('sortByRating')}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            updateFilter('sort', 'price');
                            setSortDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${filters.sort === 'price' ? 'bg-blue-50 text-blue-600' : ''}`}
                        >
                          💰 {t('sortByPrice')}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            updateFilter('sort', 'popularity');
                            setSortDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${filters.sort === 'popularity' ? 'bg-blue-50 text-blue-600' : ''}`}
                        >
                          📈 {t('sortByPopularity')}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            updateFilter('sort', 'reviews');
                            setSortDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${filters.sort === 'reviews' ? 'bg-blue-50 text-blue-600' : ''}`}
                        >
                          ⭐ {t('sortByReviews')}
                        </button>
                      </div>
                    )}
          </div>
        </div>

        {/* Promotional Labels */}
        <div>
          <div className="mt-6 mb-2 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-orange-600" />
            <span className="text-[0.8rem] font-bold uppercase text-gray-800">{t('statuses')}</span>
            <div className="ml-2 h-px flex-1 bg-gray-200"></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="premium"
                checked={filters.promotionalLabels.includes('premium')}
                onCheckedChange={() => togglePromotionalLabel('premium')}
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
                onCheckedChange={() => togglePromotionalLabel('discount')}
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
                onCheckedChange={() => togglePromotionalLabel('new')}
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
                onCheckedChange={() => togglePromotionalLabel('popular')}
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
                onCheckedChange={() => togglePromotionalLabel('high_rating')}
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
        <div className="pt-3 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={onApply} className="bg-blue-600 text-white hover:bg-blue-700 shadow-lg">
              {t('apply')}
            </Button>
            <Button onClick={onReset} variant="outline" className="hover:bg-gray-50">
              {t('reset')}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}