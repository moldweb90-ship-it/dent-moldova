import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useHreflang } from './useHreflang';

interface SEOSettings {
  // Russian SEO settings
  siteTitleRu: string;
  metaDescriptionRu: string;
  keywordsRu?: string;
  ogTitleRu?: string;
  ogDescriptionRu?: string;
  ogImageRu?: string;
  canonicalRu?: string;
  h1Ru?: string;
  
  // Romanian SEO settings
  siteTitleRo: string;
  metaDescriptionRo: string;
  keywordsRo?: string;
  ogTitleRo?: string;
  ogDescriptionRo?: string;
  ogImageRo?: string;
  canonicalRo?: string;
  h1Ro?: string;
  
  // Common settings
  robots?: string;
  schemaType?: string;
  schemaData?: string;
}

export function useSEO(language?: string) {
  // Генерируем hreflang теги для homepage
  useHreflang({ 
    language: (language === 'ro' ? 'ro' : 'ru') as 'ru' | 'ro',
    enabled: !!language 
  });
  
  const { data: seoSettings, isLoading, error } = useQuery<SEOSettings>({
    queryKey: ['/api/seo-settings', language],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    queryFn: async () => {
      const response = await fetch('/api/seo-settings');
      return response.json();
    }
  });



  useEffect(() => {
    if (seoSettings && language) {
      // Get language-specific data
      const isRomanian = language === 'ro';
      const title = isRomanian ? seoSettings.siteTitleRo : seoSettings.siteTitleRu;
      const description = isRomanian ? seoSettings.metaDescriptionRo : seoSettings.metaDescriptionRu;
      const keywords = isRomanian ? seoSettings.keywordsRo : seoSettings.keywordsRu;
      const ogTitle = isRomanian ? seoSettings.ogTitleRo : seoSettings.ogTitleRu;
      const ogDescription = isRomanian ? seoSettings.ogDescriptionRo : seoSettings.ogDescriptionRu;
      const ogImage = isRomanian ? seoSettings.ogImageRo : seoSettings.ogImageRu;
      const canonical = isRomanian ? seoSettings.canonicalRo : seoSettings.canonicalRu;
      
      // Update document title
      document.title = title;
      
      // Update meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.getElementsByTagName('head')[0].appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', description);

      // Update keywords
      if (keywords) {
        updateOrCreateMeta('name', 'keywords', keywords);
      }

      // Update canonical URL
      if (canonical) {
        updateOrCreateMeta('rel', 'canonical', canonical);
      }

      // Update robots meta
      if (seoSettings.robots) {
        updateOrCreateMeta('name', 'robots', seoSettings.robots);
      }

      // Update Open Graph tags
      updateOrCreateMeta('property', 'og:title', ogTitle || title);
      updateOrCreateMeta('property', 'og:description', ogDescription || description);
      updateOrCreateMeta('property', 'og:type', 'website');
      updateOrCreateMeta('property', 'og:url', window.location.href);
      if (ogImage) {
        updateOrCreateMeta('property', 'og:image', ogImage);
      }

      // Update Twitter Card tags  
      updateOrCreateMeta('name', 'twitter:card', 'summary_large_image');
      updateOrCreateMeta('name', 'twitter:title', ogTitle || title);
      updateOrCreateMeta('name', 'twitter:description', ogDescription || description);
      if (ogImage) {
        updateOrCreateMeta('name', 'twitter:image', ogImage);
      }
      
      // Add HTML lang attribute
      if (language) {
        document.documentElement.lang = language === 'ru' ? 'ru' : 'ro';
      }
    }
  }, [seoSettings, language]);

  return {
    seoSettings,
    isLoading
  };
}

function updateOrCreateMeta(attribute: string, value: string, content: string) {
  let meta = document.querySelector(`meta[${attribute}="${value}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, value);
    document.getElementsByTagName('head')[0].appendChild(meta);
  }
  meta.setAttribute('content', content);
}