import { useTranslation } from '../lib/i18n';

export function LanguageToggle() {
  const { language, changeLanguage } = useTranslation();

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => changeLanguage('ru')}
        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
          language === 'ru'
            ? 'bg-blue-600 text-white'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        RU
      </button>
      <button
        onClick={() => changeLanguage('ro')}
        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
          language === 'ro'
            ? 'bg-blue-600 text-white'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        RO
      </button>
    </div>
  );
}
