import { useState, useEffect } from 'react';
import { Filter, X } from 'lucide-react';
import { useTranslation, SPECIALIZATIONS, LANGUAGES } from '../lib/i18n';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

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
  sort: 'dscore' | 'price' | 'popularity' | 'reviews';
}

interface FiltersProps {
  cities: City[];
  districts: District[];
  filters: FilterValues;
  onFiltersChange: (filters: FilterValues) => void;
  onApply: () => void;
  onReset: () => void;
}

export function Filters({ cities, districts, filters, onFiltersChange, onApply, onReset }: FiltersProps) {
  const { t, language } = useTranslation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = (key: keyof FilterValues, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayValue = (key: 'districts' | 'specializations' | 'languages', value: string) => {
    const current = filters[key];
    
    // Для районов используем логику "только один выбран"
    if (key === 'districts') {
      if (current.includes(value)) {
        // Если район уже выбран, снимаем его
        const updated = current.filter(v => v !== value);
        updateFilter(key, updated);
      } else {
        // Если выбираем новый район, заменяем весь массив (только один район может быть выбран)
        updateFilter(key, [value]);
      }
    } else {
      // Для остальных фильтров используем стандартную логику множественного выбора
      const updated = current.includes(value) 
        ? current.filter(v => v !== value)
        : [...current, value];
      updateFilter(key, updated);
    }
  };

  const FiltersContent = () => (
    <div className="space-y-6">
      {/* City Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('city')}</label>
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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('district')}</label>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {districts.map(district => (
            <div key={district.id} className="flex items-center space-x-2">
              <Checkbox
                id={district.id}
                checked={filters.districts.includes(district.id)}
                onCheckedChange={() => toggleArrayValue('districts', district.id)}
                className="h-6 w-6 sm:h-4 sm:w-4 mobile-checkbox"
              />
              <label htmlFor={district.id} className="text-sm">
                {language === 'ru' ? district.nameRu : district.nameRo}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Specialization Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('specialization')}</label>
        <div className="space-y-2">
          {Object.entries(SPECIALIZATIONS).map(([key, value]) => (
            <div key={key} className="flex items-center space-x-2">
              <Checkbox
                id={key}
                checked={filters.specializations.includes(key)}
                onCheckedChange={() => toggleArrayValue('specializations', key)}
                className="h-6 w-6 sm:h-4 sm:w-4 mobile-checkbox"
              />
              <label htmlFor={key} className="text-sm">
                {value[language]}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Languages Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('languages')}</label>
        <div className="space-y-2">
          {Object.entries(LANGUAGES).map(([key, value]) => (
            <div key={key} className="flex items-center space-x-2">
              <Checkbox
                id={`lang-${key}`}
                checked={filters.languages.includes(key)}
                onCheckedChange={() => toggleArrayValue('languages', key)}
                className="h-6 w-6 sm:h-4 sm:w-4 mobile-checkbox"
              />
              <label htmlFor={`lang-${key}`} className="text-sm">
                {value[language]}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Verified Toggle */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="verified"
          checked={filters.verified}
          onCheckedChange={(checked) => updateFilter('verified', checked)}
          className="h-6 w-6 sm:h-4 sm:w-4 mobile-checkbox"
        />
        <label htmlFor="verified" className="text-sm">{t('verified')}</label>
      </div>

      {/* Urgent Today Toggle */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="urgent"
          checked={filters.urgentToday}
          onCheckedChange={(checked) => updateFilter('urgentToday', checked)}
          className="h-6 w-6 sm:h-4 sm:w-4 mobile-checkbox"
        />
        <label htmlFor="urgent" className="text-sm">{t('urgentToday')}</label>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('priceRange')}: {filters.priceRange[0]} - {filters.priceRange[1]}
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

      {/* Sort */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('sortBy')}</label>
        <Select value={filters.sort} onValueChange={(value) => updateFilter('sort', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dscore">{t('sort.dscore')}</SelectItem>
            <SelectItem value="price">{t('sort.price')}</SelectItem>
            <SelectItem value="popularity">{t('sort.popularity')}</SelectItem>
            <SelectItem value="reviews">{t('sort.reviews')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <Button onClick={onApply} className="flex-1">
          {t('apply')}
        </Button>
        <Button onClick={onReset} variant="outline" className="flex-1">
          {t('reset')}
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            {t('filters')}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{t('filters')}</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <FiltersContent />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{t('filters')}</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <FiltersContent />
      </div>
    </div>
  );
}
