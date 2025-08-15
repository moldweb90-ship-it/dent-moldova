import { useState, useEffect } from 'react';
import { Filter, X, Search } from 'lucide-react';
import { useTranslation, SPECIALIZATIONS, LANGUAGES } from '../lib/i18n';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { useDebounce } from '../hooks/use-debounce';

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
  specializations: string[];
  languages: string[];
  verified: boolean;
  urgentToday: boolean;
  priceRange: [number, number];
  sort: 'dscore' | 'price' | 'trust' | 'reviews';
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

  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  const updateFilter = (key: keyof FilterValues, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayValue = (key: 'districts' | 'specializations' | 'languages', value: string) => {
    const current = filters[key];
    const updated = current.includes(value) 
      ? current.filter(v => v !== value)
      : [...current, value];
    updateFilter(key, updated);
  };

  return (
    <div className="h-screen sticky top-0 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-6 space-y-6">
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
              placeholder={t('searchPlaceholder')}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
            />
          </div>
        </div>

        {/* City Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">{t('city')}</label>
          <Select value={filters.city || 'all'} onValueChange={(value) => updateFilter('city', value === 'all' ? undefined : value)}>
            <SelectTrigger>
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
            <label className="block text-sm font-semibold text-gray-900 mb-3">{t('district')}</label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {districts.map(district => (
                <div key={district.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={district.id}
                    checked={filters.districts.includes(district.id)}
                    onCheckedChange={() => toggleArrayValue('districts', district.id)}
                  />
                  <label htmlFor={district.id} className="text-sm text-gray-700">
                    {language === 'ru' ? district.nameRu : district.nameRo}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Specialization Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">Категории услуг</label>
          <div className="space-y-2">
            {Object.entries(SPECIALIZATIONS).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={filters.specializations.includes(key)}
                  onCheckedChange={() => toggleArrayValue('specializations', key)}
                />
                <label htmlFor={key} className="text-sm text-gray-700">
                  {value[language]}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Ценовой уровень: {filters.priceRange[0]} - {filters.priceRange[1]}
          </label>
          <Slider
            value={filters.priceRange}
            onValueChange={(value) => updateFilter('priceRange', value)}
            max={100}
            min={0}
            step={5}
            className="w-full"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">Статус приёма</label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="verified"
                checked={filters.verified}
                onCheckedChange={(checked) => updateFilter('verified', checked)}
              />
              <label htmlFor="verified" className="text-sm text-gray-700">{t('verified')}</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="urgent"
                checked={filters.urgentToday}
                onCheckedChange={(checked) => updateFilter('urgentToday', checked)}
              />
              <label htmlFor="urgent" className="text-sm text-gray-700">{t('urgentToday')}</label>
            </div>
          </div>
        </div>

        {/* D-Score Range */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">D-Score диапазон</label>
          <Slider
            value={[0, 100]}
            max={100}
            min={0}
            step={5}
            className="w-full"
          />
        </div>

        {/* Sort */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">Сортировка</label>
          <Select value={filters.sort} onValueChange={(value) => updateFilter('sort', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dscore">{t('sort.dscore')}</SelectItem>
              <SelectItem value="price">{t('sort.price')}</SelectItem>
              <SelectItem value="trust">{t('sort.trust')}</SelectItem>
              <SelectItem value="reviews">{t('sort.reviews')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4 border-t border-gray-200">
          <Button onClick={onApply} className="w-full bg-blue-600 text-white hover:bg-blue-700">
            {t('apply')}
          </Button>
          <Button onClick={onReset} variant="outline" className="w-full">
            {t('reset')}
          </Button>
        </div>
      </div>
    </div>
  );
}