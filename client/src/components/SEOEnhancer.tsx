import { useEffect } from 'react';

interface SEOEnhancerProps {
  url: string;
  language: string;
}

export function SEOEnhancer({ url, language }: SEOEnhancerProps) {
  useEffect(() => {
    // Добавляем дополнительные мета-теги для лучшей индексации
    const addMetaTag = (name: string, content: string, property?: string) => {
      const selector = property ? `meta[property="${property}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', property);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    // Добавляем hreflang теги для лучшей индексации
    const addHreflangTag = (lang: string, href: string) => {
      let link = document.querySelector(`link[hreflang="${lang}"]`) as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'alternate');
        link.setAttribute('hreflang', lang);
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
    };

    // Генерируем hreflang теги
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://mdent.md';
    const currentPath = url.replace(baseUrl, '');
    
    // Русская версия
    addHreflangTag('ru', `${baseUrl}${currentPath}`);
    // Румынская версия
    addHreflangTag('ro', `${baseUrl}/ro${currentPath}`);
    // x-default (русская как основная)
    addHreflangTag('x-default', `${baseUrl}${currentPath}`);

    // Добавляем дополнительные мета-теги
    addMetaTag('language', language);
    addMetaTag('geo.region', 'MD');
    addMetaTag('geo.country', 'Moldova');
    addMetaTag('geo.placename', 'Moldova');
    
    // Open Graph дополнительные теги
    addMetaTag('og:locale', language === 'ro' ? 'ro_MD' : 'ru_MD', 'og:locale');
    addMetaTag('og:site_name', 'MDent.md', 'og:site_name');
    
    // Twitter Card теги
    addMetaTag('twitter:card', 'summary_large_image');
    addMetaTag('twitter:site', '@mdent_md');
    
    // Дополнительные теги для поисковиков
    addMetaTag('format-detection', 'telephone=no');
    addMetaTag('mobile-web-app-capable', 'yes');
    addMetaTag('apple-mobile-web-app-capable', 'yes');
    addMetaTag('apple-mobile-web-app-status-bar-style', 'default');
    
    // Теги для лучшей индексации
    addMetaTag('revisit-after', '1 day');
    addMetaTag('distribution', 'global');
    addMetaTag('rating', 'general');
    addMetaTag('target', 'all');

  }, [url, language]);

  return null;
}
