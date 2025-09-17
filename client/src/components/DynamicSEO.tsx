import { useEffect } from 'react';

interface DynamicSEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  h1?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonical?: string;
  robots?: string;
  schemaType?: string;
  schemaData?: any;
  language?: string;
}

export function DynamicSEO({
  title,
  description,
  keywords,
  h1,
  ogTitle,
  ogDescription,
  ogImage,
  canonical,
  robots = 'index,follow',
  schemaType = 'Dentist',
  schemaData,
  language
}: DynamicSEOProps) {
  console.log('🔧 DynamicSEO: Компонент рендерится с параметрами:', {
    language,
    title,
    description,
    keywords,
    h1,
    ogTitle,
    ogDescription
  });

  useEffect(() => {
    console.log('🔧 DynamicSEO: Обновляем мета-теги', {
      language,
      title,
      description,
      keywords,
      h1,
      ogTitle,
      ogDescription,
      ogImage,
      canonical,
      robots,
      schemaType,
      schemaData
    });

    // Принудительно очищаем старые мета-теги
    const oldMetas = document.querySelectorAll('meta[name="description"], meta[name="keywords"], meta[name="robots"], meta[property^="og:"]');
    oldMetas.forEach(meta => meta.remove());
    
    const oldCanonical = document.querySelector('link[rel="canonical"]');
    if (oldCanonical) oldCanonical.remove();
    
    const oldSchemas = document.querySelectorAll('script[type="application/ld+json"]');
    oldSchemas.forEach(script => script.remove());

    // Update document title immediately and force it
    if (title) {
      document.title = title;
      console.log('✅ DynamicSEO: Установлен title:', title);
      
      // Также обновляем title тег в head если он есть
      const titleElement = document.querySelector('title');
      if (titleElement) {
        titleElement.textContent = title;
      }
    }

    // Function to update or create meta tag
    const updateMetaTag = (name: string, content: string, property?: string) => {
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

    // Update meta description
    if (description) {
      updateMetaTag('description', description);
      console.log('✅ DynamicSEO: Установлен description:', description);
    }

    // Update keywords
    if (keywords) {
      updateMetaTag('keywords', keywords);
      console.log('✅ DynamicSEO: Установлены keywords:', keywords);
    }

    // Update robots
    updateMetaTag('robots', robots);
    console.log('✅ DynamicSEO: Установлен robots:', robots);

    // Update canonical URL
    if (canonical) {
      let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!linkCanonical) {
        linkCanonical = document.createElement('link');
        linkCanonical.setAttribute('rel', 'canonical');
        document.head.appendChild(linkCanonical);
      }
      linkCanonical.setAttribute('href', canonical);
    }

    // Update Open Graph tags
    if (ogTitle) {
      updateMetaTag('og:title', ogTitle, 'og:title');
      console.log('✅ DynamicSEO: Установлен og:title:', ogTitle);
    }
    if (ogDescription) {
      updateMetaTag('og:description', ogDescription, 'og:description');
      console.log('✅ DynamicSEO: Установлен og:description:', ogDescription);
    }
    if (ogImage) {
      updateMetaTag('og:image', ogImage, 'og:image');
      console.log('✅ DynamicSEO: Установлен og:image:', ogImage);
    }

    // Set default OG tags
    updateMetaTag('og:type', 'website', 'og:type');
    updateMetaTag('og:url', window.location.href, 'og:url');

    // Add Schema.org structured data
    if (schemaType && schemaData) {
      // Remove existing schema scripts
      const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
      existingScripts.forEach(script => {
        if (script.textContent && script.textContent.includes(schemaType)) {
          script.remove();
        }
      });

      // Add new schema script
      const schemaScript = document.createElement('script');
      schemaScript.type = 'application/ld+json';
      schemaScript.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': schemaType,
        ...schemaData
      });
      document.head.appendChild(schemaScript);
    }

    // Cleanup function
    return () => {
      // Remove Schema.org script on unmount
      const schemaScripts = document.querySelectorAll('script[type="application/ld+json"]');
      schemaScripts.forEach(script => {
        if (script.textContent && script.textContent.includes(schemaType)) {
          script.remove();
        }
      });
    };
  }, [title, description, keywords, h1, ogTitle, ogDescription, ogImage, canonical, robots, schemaType, schemaData, language]);

  return null;
}
