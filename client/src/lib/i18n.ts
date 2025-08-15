import { useState, useEffect } from 'react';

type Language = 'ru' | 'ro';

interface Translations {
  [key: string]: string;
}

const translations: Record<Language, Translations> = {
  ru: {
    appTitle: "Dent Moldova",
    searchPlaceholder: "Поиск клиники или услуги...",
    filters: "Фильтры",
    city: "Город",
    district: "Район",
    specialization: "Специализация",
    languages: "Языки",
    verified: "Проверено",
    urgentToday: "Запись сегодня",
    priceRange: "Диапазон цены",
    sortBy: "Сортировать",
    "sort.dscore": "D-score",
    "sort.price": "Цена",
    "sort.trust": "Доверие",
    "sort.reviews": "Отзывы",
    apply: "Применить",
    reset: "Сброс",
    price: "Цена",
    trust: "Доверие",
    reviews: "Отзывы",
    access: "Доступность",
    book: "Записаться",
    prices: "Цены",
    verifiedBadge: "Verified",
    cnamBadge: "CNAM",
    packages: "Пакеты",
    disclaimer: "Информация носит справочный характер и не является медсоветом.",
    allCities: "Все города",
    allDistricts: "Все районы",
    allServices: "Все услуги",
    showingResults: "Показано",
    to: "до",
    of: "из",
    results: "результатов",
    previous: "Назад",
    next: "Далее",
    callClinic: "Позвонить",
    website: "Сайт",
    scoreExplanation: "Расшифровка оценок",
    priceDescription: "Доступность по стоимости, акции, рассрочка",
    trustDescription: "Лицензии, сертификаты, опыт врачей",
    reviewsDescription: "Рейтинг Google, публичные отзывы",
    accessDescription: "Запись онлайн, время работы, расположение",
    beforeAfter: "Случаи до/после",
    dataSources: "Источники данных",
    pricesProvidedBy: "Цены - предоставлены клиникой",
    reviewsFromPublic: "Отзывы - публичные источники",
    lastUpdated: "Обновлено"
  },
  ro: {
    appTitle: "Dent Moldova",
    searchPlaceholder: "Caută clinică sau serviciu...",
    filters: "Filtre",
    city: "Oraș",
    district: "Sector",
    specialization: "Specializare",
    languages: "Limbi",
    verified: "Verificat",
    urgentToday: "Programare azi",
    priceRange: "Interval preț",
    sortBy: "Sortează",
    "sort.dscore": "D-score",
    "sort.price": "Preț",
    "sort.trust": "Încredere",
    "sort.reviews": "Recenzii",
    apply: "Aplică",
    reset: "Resetează",
    price: "Preț",
    trust: "Încredere",
    reviews: "Recenzii",
    access: "Acces",
    book: "Programează",
    prices: "Prețuri",
    verifiedBadge: "Verificat",
    cnamBadge: "CNAM",
    packages: "Pachete",
    disclaimer: "Informațiile sunt cu caracter informativ, nu constituie sfat medical.",
    allCities: "Toate orașele",
    allDistricts: "Toate sectoarele",
    allServices: "Toate serviciile",
    showingResults: "Afișate",
    to: "până la",
    of: "din",
    results: "rezultate",
    previous: "Înapoi",
    next: "Următorul",
    callClinic: "Sună",
    website: "Site",
    scoreExplanation: "Explicația scorurilor",
    priceDescription: "Accesibilitate preț, promoții, plată în rate",
    trustDescription: "Licențe, certificate, experiența medicilor",
    reviewsDescription: "Rating Google, recenzii publice",
    accessDescription: "Programare online, program, locație",
    beforeAfter: "Cazuri înainte/după",
    dataSources: "Surse de date",
    pricesProvidedBy: "Prețuri - furnizate de clinică",
    reviewsFromPublic: "Recenzii - surse publice",
    lastUpdated: "Actualizat"
  }
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
