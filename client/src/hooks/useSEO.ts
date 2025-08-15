import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

interface SEOSettings {
  siteTitle: string;
  metaDescription: string;
}

export function useSEO() {
  const { data: seoSettings, isLoading } = useQuery<SEOSettings>({
    queryKey: ['/api/seo-settings'],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  useEffect(() => {
    if (seoSettings) {
      // Update document title
      document.title = seoSettings.siteTitle;
      
      // Update meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.getElementsByTagName('head')[0].appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', seoSettings.metaDescription);

      // Update Open Graph tags
      updateOrCreateMeta('property', 'og:title', seoSettings.siteTitle);
      updateOrCreateMeta('property', 'og:description', seoSettings.metaDescription);
      updateOrCreateMeta('property', 'og:type', 'website');
      updateOrCreateMeta('property', 'og:url', window.location.origin);

      // Update Twitter Card tags  
      updateOrCreateMeta('name', 'twitter:card', 'summary_large_image');
      updateOrCreateMeta('name', 'twitter:title', seoSettings.siteTitle);
      updateOrCreateMeta('name', 'twitter:description', seoSettings.metaDescription);
    }
  }, [seoSettings]);

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