import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';

export async function seoMiddleware(req: Request, res: Response, next: NextFunction) {
  // Проверяем, является ли это маршрутом клиники
  const clinicMatch = req.path.match(/^\/clinic\/(.+)$/);
  
  if (clinicMatch) {
    const slug = clinicMatch[1];
    
    try {
      // Получаем данные клиники
              const clinic = await storage.getClinicBySlug(slug, 'ru'); // Используем русский язык для SEO
      
      if (clinic) {
        // Добавляем SEO данные в объект запроса
        (req as any).clinicSEO = {
          title: clinic.seoTitle || `${clinic.nameRu} - стоматологическая клиника в ${clinic.city.nameRu}`,
description: clinic.seoDescription || `${clinic.nameRu} - современная стоматологическая клиника в ${clinic.city.nameRu}. Запись онлайн, консультация бесплатно.`,
          keywords: clinic.seoKeywords,
          h1: clinic.seoH1,
          ogTitle: clinic.ogTitle || clinic.seoTitle || clinic.nameRu,
          ogDescription: clinic.ogDescription || clinic.seoDescription,
          ogImage: clinic.ogImage,
          canonical: clinic.seoCanonical,
          robots: clinic.seoRobots || 'index,follow',
          schemaType: clinic.seoSchemaType || 'Dentist',
          schemaData: clinic.seoSchemaData
        };
      }
    } catch (error) {
      console.error('Error fetching clinic SEO data:', error);
    }
  }
  
  next();
}
