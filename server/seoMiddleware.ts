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
        // Добавляем SEO данные в объект запроса
        (req as any).clinicSEO = {
          title: clinic.seoTitle || (isRomanian ? `${clinic.nameRo} - clinică stomatologică în ${clinic.city.nameRo}` : `${clinic.nameRu} - стоматологическая клиника в ${clinic.city.nameRu}`),
          description: clinic.seoDescription || (isRomanian ? `${clinic.nameRo} - clinică modernă în ${clinic.city.nameRo}. Programare online, consultație gratuită.` : `${clinic.nameRu} - современная клиника в ${clinic.city.nameRu}. Запись онлайн, консультация бесплатно.`),
          keywords: clinic.seoKeywords,
          h1: clinic.seoH1,
          ogTitle: clinic.ogTitle || clinic.seoTitle || (isRomanian ? clinic.nameRo : clinic.nameRu),
          ogDescription: clinic.ogDescription || clinic.seoDescription,
          ogImage: clinic.ogImage,
          canonical: clinic.seoCanonical,
          robots: clinic.seoRobots || 'index,follow',
          schemaType: clinic.seoSchemaType || 'Dentist',
          schemaData: clinic.seoSchemaData,
          language: language
        };
      }
    } catch (error) {
      console.error('Error fetching clinic SEO data:', error);
    }
  }
  
  next();
}
