import { Search, HelpCircle } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { useState } from 'react';

interface AnimatedSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export function AnimatedSearchInput({ 
  value, 
  onChange, 
  className = "", 
  placeholder 
}: AnimatedSearchInputProps) {
  const { t, language } = useTranslation();
  const [showTooltip, setShowTooltip] = useState(false);

  const searchPlaceholder = language === 'ru' 
    ? "Поиск клиники или услуги..."
    : "Caută clinică sau serviciu...";

  const tooltipText = language === 'ru' 
    ? "Вы можете искать по названию клиники или по услугам. Например: 'удаление зуба', 'импланты', 'Life Dental'"
    : "Puteți căuta după numele clinicii sau după servicii. De exemplu: 'extracție dinte', 'implanturi', 'Life Dental'";

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
  );
}
