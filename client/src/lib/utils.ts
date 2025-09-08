import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function apiRequest(method: string, url: string, data?: any) {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response;
}

// Функция для получения названия клиники на правильном языке
export function getClinicName(clinic: any, language: 'ru' | 'ro' = 'ru'): string {
  if (!clinic) return '';
  
  // Если есть поля nameRu/nameRo, используем их
  if (clinic.nameRu && clinic.nameRo) {
    return language === 'ru' ? clinic.nameRu : clinic.nameRo;
  }
  
  // Fallback на поле name если оно есть
  if (clinic.name) {
    return clinic.name;
  }
  
  return '';
}

// Функция для получения названия города на правильном языке
export function getCityName(city: any, language: 'ru' | 'ro' = 'ru'): string {
  if (!city) return '';
  
  if (city.nameRu && city.nameRo) {
    return language === 'ru' ? city.nameRu : city.nameRo;
  }
  
  if (city.name) {
    return city.name;
  }
  
  return '';
}

// Функция для получения названия района на правильном языке
export function getDistrictName(district: any, language: 'ru' | 'ro' = 'ru'): string {
  if (!district) return '';
  
  if (district.nameRu && district.nameRo) {
    return language === 'ru' ? district.nameRu : district.nameRo;
  }
  
  if (district.name) {
    return district.name;
  }
  
  return '';
}
