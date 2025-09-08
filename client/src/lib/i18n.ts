import { useState, useEffect } from 'react';
import { ru } from '../languages/ru';
import { ro } from '../languages/ro';

type Language = 'ru' | 'ro';

interface Translations {
  [key: string]: any;
}

const translations: Record<Language, Translations> = {
  ru,
  ro
};

// Global language state
let globalLanguage: Language = 'ru';
const listeners: Set<() => void> = new Set();

// Initialize from localStorage
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('language');
  globalLanguage = (saved as Language) || 'ru';
}

function setGlobalLanguage(lang: Language) {
  globalLanguage = lang;
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', lang);
  }
  // Notify all listeners
  listeners.forEach(listener => listener());
}

// Helper function to get nested object value
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

export function useTranslation() {
  const [language, setLanguage] = useState<Language>(globalLanguage);

  useEffect(() => {
    const listener = () => {
      setLanguage(globalLanguage);
    };
    listeners.add(listener);
    
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const t = (key: string): string => {
    const value = getNestedValue(translations[language], key);
    if (value === undefined) {
      console.warn(`Translation key not found: ${key} for language: ${language}`);
      return key;
    }
    return value;
  };

  const changeLanguage = (lang: Language) => {
    setGlobalLanguage(lang);
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
