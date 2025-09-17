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
  
  // Проверяем страницы функций
  const featureMatch = req.path.match(/^\/(?:ro\/)?(?:city\/([^\/]+)\/(?:([^\/]+)\/)?)?(?:pediatric-dentistry|parking|sos|work24h|credit|weekend-work)$/);
  if (featureMatch) {
    const isRomanian = req.path.startsWith('/ro');
    const language = isRomanian ? 'ro' : 'ru';
    const citySlug = featureMatch[1];
    const districtSlug = featureMatch[2];
    
    try {
      // Получаем данные городов и районов
      const cities = await storage.getCities();
      const districts = await storage.getDistrictsByCity(citySlug || '');
      
      const selectedCity = citySlug ? cities.find(c => c[language === 'ro' ? 'slugRo' : 'slugRu'] === citySlug) : null;
      const selectedDistrict = districtSlug ? districts.find(d => d[language === 'ro' ? 'slugRo' : 'slugRu'] === districtSlug) : null;
      
      // Определяем функцию из URL
      let feature = '';
      if (req.path.includes('pediatric-dentistry')) feature = 'pediatricDentistry';
      else if (req.path.includes('parking')) feature = 'parking';
      else if (req.path.includes('sos')) feature = 'sos';
      else if (req.path.includes('work24h')) feature = 'work24h';
      else if (req.path.includes('credit')) feature = 'credit';
      else if (req.path.includes('weekend-work')) feature = 'weekendWork';
      
      const featureNames: Record<string, { ru: string, ro: string, titleRu: string, titleRo: string }> = {
        'pediatricDentistry': { ru: 'Детская стоматология', ro: 'Stomatologie pediatrică', titleRu: 'Детские стоматологические клиники', titleRo: 'Clinici stomatologice pediatrice' },
        'parking': { ru: 'Парковка', ro: 'Parcare', titleRu: 'Стоматологические клиники с парковкой', titleRo: 'Clinici stomatologice cu parcare' },
        'sos': { ru: 'SOS услуги', ro: 'Servicii SOS', titleRu: 'Срочные стоматологии', titleRo: 'Stomatologii urgente' },
        'work24h': { ru: 'Работа 24 часа', ro: 'Lucru 24 ore', titleRu: 'Круглосуточные стоматологии', titleRo: 'Stomatologii 24/7' },
        'credit': { ru: 'Кредит', ro: 'Credit', titleRu: 'Стоматологии в рассрочку', titleRo: 'Stomatologii în rate' },
        'weekendWork': { ru: 'Работа в выходные', ro: 'Lucru în weekend', titleRu: 'Стоматологии работающие в выходные', titleRo: 'Stomatologii care lucrează în weekend' }
      };
      
      // Функции для склонения городов и районов
      const getCityNameDeclension = (city: any) => {
        if (!city) return '';
        
        if (language === 'ru') {
          const cityDecl: Record<string, string> = {
            'Кишинёв': 'Кишинёве',
            'Бельцы': 'Бельцах', 
            'Комрат': 'Комрате',
            'Тирасполь': 'Тирасполе',
            'Кахул': 'Кахуле',
            'Орхей': 'Орхее',
            'Сорока': 'Сороке',
            'Унгены': 'Унгенах'
          };
          return cityDecl[city.nameRu] || city.nameRu;
        } else {
          return city.nameRo;
        }
      };

      const getDistrictNameDeclension = (district: any) => {
        if (!district) return '';
        
        if (language === 'ru') {
          const districtDecl: Record<string, string> = {
            'Центр': 'Центре',
            'Ботаника': 'Ботанике',
            'Рышкань': 'Рышканах',
            'Чеканы': 'Чеканах',
            'Скулянка': 'Скулянке',
            'Буюканы': 'Буюканах',
            'Телецентр': 'Телецентре',
            'Пост': 'Посту'
          };
          return districtDecl[district.nameRu] || district.nameRu;
        } else {
          return district.nameRo;
        }
      };

      const featureInfo = featureNames[feature];
      if (featureInfo) {
        // Генерируем SEO данные для страницы функции
        let title, description, keywords;
        
        if (selectedCity && selectedDistrict) {
          const cityName = getCityNameDeclension(selectedCity);
          const districtName = getDistrictNameDeclension(selectedDistrict);
          title = language === 'ru' 
            ? `${featureInfo.titleRu} в ${cityName} на ${districtName} - Dent Moldova`
            : `${featureInfo.titleRo} în ${cityName}, ${districtName} - Dent Moldova`;
          description = language === 'ru'
            ? `Найдите ${featureInfo.titleRu.toLowerCase()} в районе ${districtName}, ${cityName}. Запись онлайн, отзывы, цены, адреса и телефоны.`
            : `Găsiți ${featureInfo.titleRo.toLowerCase()} în sectorul ${districtName}, ${cityName}. Programare online, recenzii, prețuri, adrese și telefoane.`;
          keywords = language === 'ru'
            ? `${featureInfo.ru.toLowerCase()} ${districtName} ${cityName}, стоматология ${districtName}, ${featureInfo.ru.toLowerCase()} ${cityName}`
            : `${featureInfo.ro.toLowerCase()} ${districtName} ${cityName}, stomatologie ${districtName}, ${featureInfo.ro.toLowerCase()} ${cityName}`;
        } else if (selectedCity) {
          const cityName = getCityNameDeclension(selectedCity);
          title = language === 'ru' 
            ? `${featureInfo.titleRu} в ${cityName} - Dent Moldova`
            : `${featureInfo.titleRo} în ${cityName} - Dent Moldova`;
          description = language === 'ru'
            ? `Найдите ${featureInfo.titleRu.toLowerCase()} в ${cityName}. Запись онлайн, отзывы, цены, адреса и телефоны.`
            : `Găsiți ${featureInfo.titleRo.toLowerCase()} în ${cityName}. Programare online, recenzii, prețuri, adrese și telefoane.`;
          keywords = language === 'ru'
            ? `${featureInfo.ru.toLowerCase()} ${cityName}, стоматология ${cityName}, ${featureInfo.ru.toLowerCase()}`
            : `${featureInfo.ro.toLowerCase()} ${cityName}, stomatologie ${cityName}, ${featureInfo.ro.toLowerCase()}`;
        } else {
          title = language === 'ru' 
            ? `${featureInfo.titleRu} в Молдове - Dent Moldova`
            : `${featureInfo.titleRo} în Moldova - Dent Moldova`;
          description = language === 'ru'
            ? `Найдите ${featureInfo.titleRu.toLowerCase()} в Молдове. Запись онлайн, отзывы, цены, адреса и телефоны.`
            : `Găsiți ${featureInfo.titleRo.toLowerCase()} în Moldova. Programare online, recenzii, prețuri, adrese și telefoane.`;
          keywords = language === 'ru'
            ? `${featureInfo.ru.toLowerCase()}, стоматология Молдова, ${featureInfo.ru.toLowerCase()} клиники`
            : `${featureInfo.ro.toLowerCase()}, stomatologie Moldova, ${featureInfo.ro.toLowerCase()} clinici`;
        }
        
        // Генерируем правильную Schema.org разметку для страниц каталога
        const schemaData = {
          name: title.replace(' - Dent Moldova', ''),
          description,
          url: `https://dent-moldova.com${req.path}`,
          about: {
            '@type': 'MedicalSpecialty',
            name: featureInfo[language === 'ro' ? 'ro' : 'ru']
          },
          mainEntity: {
            '@type': 'ItemList',
            name: language === 'ru' ? 'Список стоматологических клиник' : 'Lista clinicilor stomatologice',
            description: language === 'ru' ? 'Каталог проверенных стоматологических клиник' : 'Catalogul clinicilor stomatologice verificate'
          }
        };

        // Добавляем локацию если есть город
        if (selectedCity) {
          schemaData.spatialCoverage = {
            '@type': 'Place',
            name: selectedCity[language === 'ro' ? 'nameRo' : 'nameRu'],
            address: {
              '@type': 'PostalAddress', 
              addressLocality: selectedCity[language === 'ro' ? 'nameRo' : 'nameRu'],
              addressCountry: 'MD'
            }
          };
          
          // Добавляем район если есть
          if (selectedDistrict) {
            schemaData.spatialCoverage.address.addressRegion = selectedDistrict[language === 'ro' ? 'nameRo' : 'nameRu'];
          }
        }

        (req as any).featureSEO = {
          title,
          description,
          keywords,
          h1: title.replace(' - Dent Moldova', ''),
          ogTitle: title,
          ogDescription: description,
          ogImage: `https://dent-moldova.com/images/clinic-image-1757955205248-68680144.png`, // Используем логотип сайта
          canonical: `https://dent-moldova.com${req.path}`,
          robots: 'index,follow',
          language,
          schemaType: 'CollectionPage',
          schemaData
        };
      }
    } catch (error) {
      console.error('Error fetching feature SEO data:', error);
    }
  }
  
  // Проверяем страницы городов и районов
  const cityMatch = req.path.match(/^\/(?:ro\/)?city\/([^\/]+)(?:\/([^\/]+))?$/);
  if (cityMatch) {
    const isRomanian = req.path.startsWith('/ro');
    const language = isRomanian ? 'ro' : 'ru';
    const citySlug = cityMatch[1];
    const districtSlug = cityMatch[2];
    
    try {
      const cities = await storage.getCities();
      const selectedCity = cities.find(c => c[language === 'ro' ? 'slugRo' : 'slugRu'] === citySlug);
      
      if (selectedCity) {
        let selectedDistrict = null;
        if (districtSlug) {
          const districts = await storage.getDistrictsByCity(selectedCity.id);
          selectedDistrict = districts.find(d => d[language === 'ro' ? 'slugRo' : 'slugRu'] === districtSlug);
        }
        
        // Используем те же функции склонения для страниц городов
        const getCityNameDeclensionLocal = (city: any) => {
          if (!city) return '';
          
          if (language === 'ru') {
            const cityDecl: Record<string, string> = {
              'Кишинёв': 'Кишинёве',
              'Бельцы': 'Бельцах', 
              'Комрат': 'Комрате',
              'Тирасполь': 'Тирасполе',
              'Кахул': 'Кахуле',
              'Орхей': 'Орхее',
              'Сорока': 'Сороке',
              'Унгены': 'Унгенах'
            };
            return cityDecl[city.nameRu] || city.nameRu;
          } else {
            return city.nameRo;
          }
        };

        const getDistrictNameDeclensionLocal = (district: any) => {
          if (!district) return '';
          
          if (language === 'ru') {
            const districtDecl: Record<string, string> = {
              'Центр': 'Центре',
              'Ботаника': 'Ботанике',
              'Рышкань': 'Рышканах',
              'Чеканы': 'Чеканах',
              'Скулянка': 'Скулянке',
              'Буюканы': 'Буюканах',
              'Телецентр': 'Телецентре',
              'Пост': 'Посту'
            };
            return districtDecl[district.nameRu] || district.nameRu;
          } else {
            return district.nameRo;
          }
        };

        const cityName = getCityNameDeclensionLocal(selectedCity);
        const districtName = selectedDistrict ? getDistrictNameDeclensionLocal(selectedDistrict) : '';
        
        let title, description, keywords;
        
        if (selectedDistrict) {
          // Страница района
          title = language === 'ru' 
            ? `Стоматологические клиники в районе ${districtName}, ${cityName} - Dent Moldova`
            : `Clinici stomatologice în sectorul ${districtName}, ${cityName} - Dent Moldova`;
          description = language === 'ru'
            ? `Найдите лучшие стоматологические клиники в районе ${districtName}, ${cityName}. Запись онлайн, отзывы, цены, адреса и телефоны.`
            : `Găsiți cele mai bune clinici stomatologice în sectorul ${districtName}, ${cityName}. Programare online, recenzii, prețuri, adrese și telefoane.`;
          keywords = language === 'ru'
            ? `стоматология ${districtName} ${cityName}, стоматолог ${districtName}, лечение зубов ${districtName}`
            : `stomatologie ${districtName} ${cityName}, stomatolog ${districtName}, tratament dentar ${districtName}`;
        } else {
          // Страница города
          title = language === 'ru' 
            ? `Стоматологические клиники в ${cityName} - Dent Moldova`
            : `Clinici stomatologice în ${cityName} - Dent Moldova`;
          description = language === 'ru'
            ? `Найдите лучшие стоматологические клиники в ${cityName}. Запись онлайн, отзывы, цены, адреса и телефоны.`
            : `Găsiți cele mai bune clinici stomatologice în ${cityName}. Programare online, recenzii, prețuri, adrese și telefoane.`;
          keywords = language === 'ru'
            ? `стоматология ${cityName}, стоматолог ${cityName}, лечение зубов ${cityName}, клиника ${cityName}`
            : `stomatologie ${cityName}, stomatolog ${cityName}, tratament dentar ${cityName}, clinică ${cityName}`;
        }
        
        // Schema.org для страниц локаций
        const schemaData = {
          name: title.replace(' - Dent Moldova', ''),
          description,
          url: `https://dent-moldova.com${req.path}`,
          spatialCoverage: {
            '@type': 'Place',
            name: selectedDistrict ? `${districtName}, ${cityName}` : cityName,
            address: {
              '@type': 'PostalAddress',
              addressLocality: cityName,
              addressCountry: 'MD'
            }
          },
          mainEntity: {
            '@type': 'ItemList',
            name: language === 'ru' ? 'Список стоматологических клиник' : 'Lista clinicilor stomatologice',
            description: language === 'ru' ? 'Каталог стоматологических клиник в регионе' : 'Catalogul clinicilor stomatologice din regiune'
          },
          provider: {
            '@type': 'Organization',
            name: 'Dent Moldova',
            url: 'https://dent-moldova.com'
          }
        };
        
        if (selectedDistrict) {
          schemaData.spatialCoverage.address.addressRegion = districtName;
        }
        
        (req as any).locationSEO = {
          title,
          description,
          keywords,
          h1: title.replace(' - Dent Moldova', ''),
          ogTitle: title,
          ogDescription: description,
          ogImage: `https://dent-moldova.com/images/clinic-image-1757955205248-68680144.png`, // Используем логотип сайта
          canonical: `https://dent-moldova.com${req.path}`,
          robots: 'index,follow',
          language,
          schemaType: 'CollectionPage',
          schemaData
        };
      }
    } catch (error) {
      console.error('Error fetching location SEO data:', error);
    }
  }
  
  next();
}
