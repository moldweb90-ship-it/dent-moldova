// Утилита для создания SEO-friendly slug из названий городов и районов

const cyrillicToLatin: Record<string, string> = {
  // Русские буквы
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
  'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
  'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
  'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
  'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
  
  // Румынские буквы с диакритиками
  'ă': 'a', 'â': 'a', 'î': 'i', 'ș': 's', 'ț': 't',
  'Ă': 'a', 'Â': 'a', 'Î': 'i', 'Ș': 's', 'Ț': 't'
};

export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Заменяем кириллицу и румынские символы на латиницу
    .split('')
    .map(char => cyrillicToLatin[char] || char)
    .join('')
    // Заменяем пробелы и специальные символы на дефисы
    .replace(/[^a-z0-9]+/g, '-')
    // Убираем дефисы в начале и конце
    .replace(/^-+|-+$/g, '')
    // Убираем повторяющиеся дефисы
    .replace(/-+/g, '-');
}

// Специальные случаи для известных городов/районов
const specialCases: Record<string, { ru: string; ro: string }> = {
  'Кишинёв': { ru: 'chisinev', ro: 'chisinau' },
  'Chișinău': { ru: 'chisinev', ro: 'chisinau' },
  'Бельцы': { ru: 'baltsy', ro: 'balti' },
  'Bălți': { ru: 'baltsy', ro: 'balti' },
  'Бендеры': { ru: 'bendery', ro: 'tighina' },
  'Tighina': { ru: 'bendery', ro: 'tighina' },
  'Ботаника': { ru: 'botanica', ro: 'botanica' },
  'Botanica': { ru: 'botanica', ro: 'botanica' },
  'Чеканы': { ru: 'chekany', ro: 'ciocana' },
  'Ciocana': { ru: 'chekany', ro: 'ciocana' },
  'Центр': { ru: 'centr', ro: 'centru' },
  'Centru': { ru: 'centr', ro: 'centru' },
  'Рышкановка': { ru: 'ryshkanovka', ro: 'riscani' },
  'Rîșcani': { ru: 'ryshkanovka', ro: 'riscani' }
};

export function createCitySlug(nameRu: string, nameRo: string, language: 'ru' | 'ro'): string {
  // Проверяем специальные случаи
  const special = specialCases[nameRu] || specialCases[nameRo];
  if (special) {
    return special[language];
  }
  
  // Используем соответствующее название для языка
  const name = language === 'ru' ? nameRu : nameRo;
  return createSlug(name);
}

export function createDistrictSlug(nameRu: string, nameRo: string, language: 'ru' | 'ro'): string {
  // Проверяем специальные случаи
  const special = specialCases[nameRu] || specialCases[nameRo];
  if (special) {
    return special[language];
  }
  
  // Используем соответствующее название для языка
  const name = language === 'ru' ? nameRu : nameRo;
  return createSlug(name);
}
