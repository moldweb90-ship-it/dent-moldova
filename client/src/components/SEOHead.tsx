import { useEffect } from 'react';

interface SEOHeadProps {
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
}

export function SEOHead({
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
  schemaData
}: SEOHeadProps) {
  useEffect(() => {
    // Update document title
    if (title) {
      document.title = title;
    }

    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.getElementsByTagName('head')[0].appendChild(metaDescription);
    }
    if (description) {
      metaDescription.setAttribute('content', description);
    }

    // Update keywords
    if (keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.getElementsByTagName('head')[0].appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', keywords);
    }

    // Update robots
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.getElementsByTagName('head')[0].appendChild(metaRobots);
    }
    metaRobots.setAttribute('content', robots);

    // Update canonical URL
    if (canonical) {
      let linkCanonical = document.querySelector('link[rel="canonical"]');
      if (!linkCanonical) {
        linkCanonical = document.createElement('link');
        linkCanonical.setAttribute('rel', 'canonical');
        document.getElementsByTagName('head')[0].appendChild(linkCanonical);
      }
      linkCanonical.setAttribute('href', canonical);
    }

    // Update Open Graph tags
    if (ogTitle) {
      let ogTitleMeta = document.querySelector('meta[property="og:title"]');
      if (!ogTitleMeta) {
        ogTitleMeta = document.createElement('meta');
        ogTitleMeta.setAttribute('property', 'og:title');
        document.getElementsByTagName('head')[0].appendChild(ogTitleMeta);
      }
      ogTitleMeta.setAttribute('content', ogTitle);
    }

    if (ogDescription) {
      let ogDescMeta = document.querySelector('meta[property="og:description"]');
      if (!ogDescMeta) {
        ogDescMeta = document.createElement('meta');
        ogDescMeta.setAttribute('property', 'og:description');
        document.getElementsByTagName('head')[0].appendChild(ogDescMeta);
      }
      ogDescMeta.setAttribute('content', ogDescription);
    }

    if (ogImage) {
      let ogImageMeta = document.querySelector('meta[property="og:image"]');
      if (!ogImageMeta) {
        ogImageMeta = document.createElement('meta');
        ogImageMeta.setAttribute('property', 'og:image');
        document.getElementsByTagName('head')[0].appendChild(ogImageMeta);
      }
      ogImageMeta.setAttribute('content', ogImage);
    }

    // Set default OG tags
    let ogTypeMeta = document.querySelector('meta[property="og:type"]');
    if (!ogTypeMeta) {
      ogTypeMeta = document.createElement('meta');
      ogTypeMeta.setAttribute('property', 'og:type');
      document.getElementsByTagName('head')[0].appendChild(ogTypeMeta);
    }
    ogTypeMeta.setAttribute('content', 'website');

    let ogUrlMeta = document.querySelector('meta[property="og:url"]');
    if (!ogUrlMeta) {
      ogUrlMeta = document.createElement('meta');
      ogUrlMeta.setAttribute('property', 'og:url');
      document.getElementsByTagName('head')[0].appendChild(ogUrlMeta);
    }
    ogUrlMeta.setAttribute('content', window.location.href);

    // Add Schema.org structured data
    if (schemaType && schemaData) {
      const schemaScript = document.createElement('script');
      schemaScript.type = 'application/ld+json';
      schemaScript.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': schemaType,
        ...schemaData
      });
      document.getElementsByTagName('head')[0].appendChild(schemaScript);
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
  }, [title, description, keywords, h1, ogTitle, ogDescription, ogImage, canonical, robots, schemaType, schemaData]);

  return null;
}
