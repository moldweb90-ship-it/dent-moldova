import { useState, useEffect } from 'react';
import { ru } from '../languages/ru';
import { ro } from '../languages/ro';

type Language = 'ru' | 'ro';

interface Translations {
  [key: string]: string;
}

const translations: Record<Language, Translations> = {
  ru,
  ro
};

export function useTranslation() {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'ru';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
  };

  return { t, language, changeLanguage };
}

export const SPECIALIZATIONS = {
  implants: { ru: "Импланты", ro: "Implanturi" },
  veneers: { ru: "Виниры", ro: "Fațete" },
  endo: { ru: "Эндодонтия", ro: "Endodonție" },
  hygiene: { ru: "Гигиена", ro: "Igienă" },
  ortho: { ru: "Ортодонтия", ro: "Ortodonție" },
  kids: { ru: "Детская", ro: "Copii" }
};

export const LANGUAGES = {
  ru: { ru: "Русский", ro: "Rusă" },
  ro: { ru: "Румынский", ro: "Română" },
  en: { ru: "Английский", ro: "Engleză" }
};
