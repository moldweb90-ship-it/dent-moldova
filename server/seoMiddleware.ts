import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';

export async function seoMiddleware(req: Request, res: Response, next: NextFunction) {
  // Проверяем, является ли это маршрутом клиники
  const clinicMatch = req.path.match(/^\/clinic\/(?:ro\/)?(.+)$/);
  
  if (clinicMatch) {
    const slug = clinicMatch[1];
    const isRomanian = req.path.startsWith('/clinic/ro/');
    const language = isRomanian ? 'ro' : 'ru';
    
    try {
      // Получаем данные клиники с учетом языка
      const clinic = await storage.getClinicBySlug(slug, language);
      
      if (clinic) {
        console.log('🔍 SEO Middleware - Clinic data:', {
          name: clinic.nameRu,
          googleRating: clinic.googleRating,
          googleReviewsCount: clinic.googleReviewsCount,
          dScore: clinic.dScore,
          reviewsIndex: clinic.reviewsIndex,
          workingHours: clinic.workingHours ? clinic.workingHours.length : 0,
          priceIndex: clinic.priceIndex,
          services: clinic.services ? clinic.services.length : 0,
          seoSchemaData: clinic.seoSchemaData
        });
        
        // Получаем рейтинг из отзывов
        let reviewsRating = null;
        let reviewsCount = 0;
        try {
          const reviews = await storage.getReviews({ clinicId: clinic.id, status: 'approved', limit: 1000, offset: 0 });
          if (reviews.reviews && reviews.reviews.length > 0) {
            const totalRating = reviews.reviews.reduce((sum: number, review: any) => {
              return sum + (review.averageRating || 0);
            }, 0);
            reviewsRating = Math.round((totalRating / reviews.reviews.length) * 100) / 100;
            reviewsCount = reviews.reviews.length;
          }
        } catch (error) {
          console.error('Error getting reviews for SEO:', error);
        }

        // Добавляем SEO данные в объект запроса
        (req as any).clinicSEO = {
          title: clinic.seoTitleRu || clinic.seoTitleRo || (isRomanian ? `${clinic.nameRo} - clinică stomatologică în ${clinic.city.nameRo}` : `${clinic.nameRu} - стоматологическая клиника в ${clinic.city.nameRu}`),
          description: clinic.seoDescriptionRu || clinic.seoDescriptionRo || (isRomanian ? `${clinic.nameRo} - clinică modernă în ${clinic.city.nameRo}. Programare online, consultație gratuită.` : `${clinic.nameRu} - современная клиника в ${clinic.city.nameRu}. Запись онлайн, консультация бесплатно.`),
          keywords: isRomanian ? clinic.seoKeywordsRo : clinic.seoKeywordsRu,
          h1: isRomanian ? clinic.seoH1Ro : clinic.seoH1Ru,
          ogTitle: clinic.ogTitleRu || clinic.ogTitleRo || clinic.seoTitleRu || clinic.seoTitleRo || (isRomanian ? clinic.nameRo : clinic.nameRu),
          ogDescription: clinic.ogDescriptionRu || clinic.ogDescriptionRo || clinic.seoDescriptionRu || clinic.seoDescriptionRo,
          ogImage: clinic.ogImage,
          canonical: clinic.seoCanonical,
          robots: clinic.seoRobots || 'index,follow',
          schemaType: clinic.seoSchemaType || 'Dentist',
          schemaData: clinic.seoSchemaData,
          language: language,
          // Добавляем данные клиники для JSON-LD схемы с рейтингом из отзывов
          clinicData: {
            ...clinic,
            reviewsRating, // Добавляем рейтинг из отзывов
            reviewsCount,  // Добавляем количество отзывов
            services: clinic.services || [] // Добавляем услуги для анализа цен
          }
        };
      }
    } catch (error) {
      console.error('Error fetching clinic SEO data:', error);
    }
  }
  
  // Проверяем, является ли это главной страницей
  const isHomepage = req.path === '/' || req.path === '/ro';
  if (isHomepage) {
    const isRomanian = req.path === '/ro';
    const language = isRomanian ? 'ro' : 'ru';
    
    try {
      // Получаем SEO настройки сайта
      const settings = await storage.getAllSiteSettings();
      const settingsMap = settings.reduce((acc: any, setting: any) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});
      
      // Добавляем SEO данные для главной страницы
      (req as any).homepageSEO = {
        title: isRomanian 
          ? (settingsMap.siteTitleRo || 'Dent Moldova - Catalogul clinicilor stomatologice')
          : (settingsMap.siteTitleRu || 'Dent Moldova - Каталог стоматологических клиник'),
        description: isRomanian
          ? (settingsMap.metaDescriptionRo || 'Găsiți cea mai bună clinică stomatologică din Moldova. Catalogul clinicilor verificate cu prețuri, recenzii și evaluări.')
          : (settingsMap.metaDescriptionRu || 'Найдите лучшую стоматологическую клинику в Молдове. Каталог проверенных клиник с ценами, отзывами и рейтингами.'),
        keywords: isRomanian
          ? (settingsMap.keywordsRo || 'stomatologie, dentist, tratament dentar, clinică, Moldova, Chișinău')
          : (settingsMap.keywordsRu || 'стоматология, стоматолог, лечение зубов, клиника, Молдова, Кишинёв'),
        h1: isRomanian
          ? (settingsMap.h1Ro || 'Catalogul clinicilor stomatologice din Moldova')
          : (settingsMap.h1Ru || 'Каталог стоматологических клиник в Молдове'),
        ogTitle: isRomanian
          ? (settingsMap.ogTitleRo || settingsMap.siteTitleRo || 'Dent Moldova - Catalogul clinicilor stomatologice')
          : (settingsMap.ogTitleRu || settingsMap.siteTitleRu || 'Dent Moldova - Каталог стоматологических клиник'),
        ogDescription: isRomanian
          ? (settingsMap.ogDescriptionRo || settingsMap.metaDescriptionRo || 'Găsiți cele mai bune clinici stomatologice din Moldova')
          : (settingsMap.ogDescriptionRu || settingsMap.metaDescriptionRu || 'Найдите лучшие стоматологические клиники в Молдове'),
        ogImage: isRomanian
          ? (settingsMap.ogImageRo || settingsMap.logo || '')
          : (settingsMap.ogImageRu || settingsMap.logo || ''),
        canonical: isRomanian
          ? (settingsMap.canonicalRo || 'https://dentmoldova.md/ro')
          : (settingsMap.canonicalRu || 'https://dentmoldova.md'),
        robots: settingsMap.robots || 'index,follow',
        schemaType: settingsMap.schemaType || 'Organization',
        schemaData: settingsMap.schemaData || '',
        language: language,
        // Добавляем настройки сайта для JSON-LD схемы
        settingsMap: settingsMap
      };
    } catch (error) {
      console.error('Error fetching homepage SEO data:', error);
    }
  }
  
  next();
}
