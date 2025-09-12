import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

interface SEOSettings {
  siteTitle: string;
  metaDescription: string;
}

export function useSEO(language?: string) {
  const { data: seoSettings, isLoading } = useQuery<SEOSettings>({
    queryKey: ['/api/seo-settings', language],
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
      
      // Add HTML lang attribute
      if (language) {
        document.documentElement.lang = language === 'ru' ? 'ru' : 'ro';
      }
      
      // Add hreflang tags for homepage
      if (language) {
        const currentUrl = window.location.origin;
        const currentPath = window.location.pathname;
        
        // Remove existing hreflang tags
        const existingHreflang = document.querySelectorAll('link[rel="alternate"][hreflang]');
        existingHreflang.forEach(tag => tag.remove());
        
        // Add hreflang for current language
        let hreflangCurrent = document.createElement('link');
        hreflangCurrent.setAttribute('rel', 'alternate');
        hreflangCurrent.setAttribute('hreflang', language === 'ru' ? 'ru' : 'ro');
        hreflangCurrent.setAttribute('href', `${currentUrl}${currentPath}`);
        document.head.appendChild(hreflangCurrent);
        
        // Add hreflang for alternate language
        let hreflangAlt = document.createElement('link');
        hreflangAlt.setAttribute('rel', 'alternate');
        hreflangAlt.setAttribute('hreflang', language === 'ru' ? 'ro' : 'ru');
        
        if (currentPath === '/ro') {
          // Current is Romanian homepage, alternate is Russian homepage
          hreflangAlt.setAttribute('href', `${currentUrl}/`);
        } else if (currentPath === '/') {
          // Current is Russian homepage, alternate is Romanian homepage
          hreflangAlt.setAttribute('href', `${currentUrl}/ro`);
        }
        document.head.appendChild(hreflangAlt);
        
        // Add x-default hreflang (points to Russian homepage)
        let hreflangDefault = document.createElement('link');
        hreflangDefault.setAttribute('rel', 'alternate');
        hreflangDefault.setAttribute('hreflang', 'x-default');
        hreflangDefault.setAttribute('href', `${currentUrl}/`);
        document.head.appendChild(hreflangDefault);
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