import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

// Функция для генерации базовой JSON-LD схемы
function generateBasicSchema(seoData: any, settingsMap: any, clinicData?: any) {
  const baseUrl = settingsMap.websiteUrl || 'https://dentmoldova.md';
  const organizationName = settingsMap.organizationName || 'Dent Moldova';
  const organizationDescription = settingsMap.organizationDescription || 'Каталог стоматологических клиник в Молдове';
  const organizationCity = settingsMap.organizationCity || 'Кишинёв';
  const organizationCountry = settingsMap.organizationCountry || 'MD';
  const businessType = settingsMap.businessType || 'Dentist';
  const businessPriceRange = settingsMap.businessPriceRange || '$$';
  const businessOpeningHours = settingsMap.businessOpeningHours || 'Mo-Fr 09:00-18:00';
  
  // Определяем тип схемы
  const schemaType = seoData.schemaType || 'Organization';
  
  // Базовые поля для всех схем
  const baseSchema = {
    "@context": "https://schema.org",
    "@type": schemaType,
    "name": clinicData?.nameRu || organizationName,
    "description": clinicData?.seoDescriptionRu || organizationDescription,
    "url": clinicData ? `${baseUrl}/clinic/${clinicData.slug}` : baseUrl,
    "logo": clinicData?.logoUrl ? `${baseUrl}${clinicData.logoUrl}` : (settingsMap.logo ? `${baseUrl}${settingsMap.logo}` : undefined),
    "address": {
      "@type": "PostalAddress",
      "addressLocality": clinicData?.city?.nameRu || organizationCity,
      "addressCountry": organizationCountry,
      "streetAddress": clinicData?.addressRu
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": ["Russian", "Romanian"],
      "telephone": clinicData?.phone
    }
  };

  // Добавляем рейтинги если есть данные клиники
  if (clinicData) {
    // Приоритет: рейтинг из отзывов > Google рейтинг
    if (clinicData.reviewsRating && clinicData.reviewsCount) {
      baseSchema.aggregateRating = {
        "@type": "AggregateRating",
        "ratingValue": clinicData.reviewsRating,
        "reviewCount": clinicData.reviewsCount,
        "bestRating": 5,
        "worstRating": 1
      };
    } else if (clinicData.googleRating && clinicData.googleReviewsCount) {
      // Fallback на Google рейтинг если нет отзывов
      baseSchema.aggregateRating = {
        "@type": "AggregateRating",
        "ratingValue": parseFloat(clinicData.googleRating),
        "reviewCount": clinicData.googleReviewsCount,
        "bestRating": 5,
        "worstRating": 1
      };
    }

    // DentHUB рейтинг (как дополнительный)
    if (clinicData.dScore) {
      baseSchema.additionalProperty = [
        {
          "@type": "PropertyValue",
          "name": "DentHUB Score",
          "value": clinicData.dScore,
          "maxValue": 100,
          "description": "Общий рейтинг DentHUB"
        }
      ];

      // Добавляем индексы DentHUB как дополнительные свойства
      if (clinicData.reviewsIndex) {
        baseSchema.additionalProperty.push({
          "@type": "PropertyValue",
          "name": "Reviews Index",
          "value": clinicData.reviewsIndex,
          "maxValue": 100,
          "description": "Индекс отзывов"
        });
      }

      if (clinicData.trustIndex) {
        baseSchema.additionalProperty.push({
          "@type": "PropertyValue",
          "name": "Trust Index",
          "value": clinicData.trustIndex,
          "maxValue": 100,
          "description": "Индекс доверия"
        });
      }

      if (clinicData.accessIndex) {
        baseSchema.additionalProperty.push({
          "@type": "PropertyValue",
          "name": "Access Index",
          "value": clinicData.accessIndex,
          "maxValue": 100,
          "description": "Индекс доступности"
        });
      }

      if (clinicData.priceIndex) {
        baseSchema.additionalProperty.push({
          "@type": "PropertyValue",
          "name": "Price Index",
          "value": clinicData.priceIndex,
          "maxValue": 100,
          "description": "Ценовой индекс"
        });
      }
    }

            // Специализации - сначала анализируем услуги, потом fallback на данные клиники
            if (clinicData.services && clinicData.services.length > 0) {
              console.log('🔍 Analyzing services for medicalSpecialty:', clinicData.services.map((s: any) => s.name));
              // Определяем специализации на основе услуг
              const serviceSpecialties = new Set<string>();
              
              clinicData.services.forEach((service: any) => {
                const serviceName = service.name.toLowerCase();
                
                // Полный маппинг услуг на медицинские специализации
                
                // Имплантология
                if (serviceName.includes('имплант') || serviceName.includes('implant') || serviceName.includes('имплантат') ||
                    serviceName.includes('all-on-4') || serviceName.includes('all-on-6') || serviceName.includes('синус-лифт') ||
                    serviceName.includes('костная пластика') || serviceName.includes('лазерная имплантац') ||
                    serviceName.includes('одномоментн') && serviceName.includes('имплантац')) {
                  serviceSpecialties.add('Implantology');
                }
                
                // Оральная хирургия
                if (serviceName.includes('хирург') || serviceName.includes('удален') || serviceName.includes('surgery') || 
                    serviceName.includes('extraction') || serviceName.includes('операц') || serviceName.includes('резекц') ||
                    serviceName.includes('цистэктом') || serviceName.includes('иссечен') || serviceName.includes('кист') ||
                    serviceName.includes('зуб мудрост') || serviceName.includes('лазерная хирург') ||
                    serviceName.includes('уздечк') || serviceName.includes('мини-имплант')) {
                  serviceSpecialties.add('Oral Surgery');
                }
                
                // Ортодонтия
                if (serviceName.includes('брекет') || serviceName.includes('ортодонт') || serviceName.includes('orthodont') ||
                    serviceName.includes('выравниван') || serviceName.includes('капп') || serviceName.includes('элайнер') ||
                    serviceName.includes('ретейнер') || serviceName.includes('пластинк') || serviceName.includes('invisalign') ||
                    serviceName.includes('лингвальн') || serviceName.includes('сапфиров') || serviceName.includes('керамическ')) {
                  serviceSpecialties.add('Orthodontics');
                }
                
                // Протезирование
                if (serviceName.includes('протез') || serviceName.includes('prosthodont') || serviceName.includes('корон') ||
                    serviceName.includes('мост') || serviceName.includes('съемн') || serviceName.includes('зубной протез') ||
                    serviceName.includes('вкладк') || serviceName.includes('накладк') || serviceName.includes('штифт') ||
                    serviceName.includes('металлокерамик') || serviceName.includes('безметаллов') || serviceName.includes('циркони') ||
                    serviceName.includes('e.max') || serviceName.includes('inlay') || serviceName.includes('onlay') ||
                    serviceName.includes('бюгельн') || serviceName.includes('протезирован') && serviceName.includes('имплант')) {
                  serviceSpecialties.add('Prosthodontics');
                }
                
                // Эндодонтия (лечение корневых каналов)
                if (serviceName.includes('лечен') || serviceName.includes('пломб') || serviceName.includes('endodont') ||
                    serviceName.includes('корнев') || serviceName.includes('канал') || serviceName.includes('пульп') ||
                    serviceName.includes('депульпир') || serviceName.includes('ретроградн') || serviceName.includes('апекс') ||
                    serviceName.includes('кариес') || serviceName.includes('пульпит') || serviceName.includes('периодонтит') ||
                    serviceName.includes('световая пломб') || serviceName.includes('временная пломб') ||
                    serviceName.includes('микроскоп') || serviceName.includes('перелечиван') ||
                    serviceName.includes('художествен') || serviceName.includes('шпонк')) {
                  serviceSpecialties.add('Endodontics');
                }
                
                // Пародонтология
                if (serviceName.includes('десен') || serviceName.includes('пародонт') || serviceName.includes('periodont') ||
                    serviceName.includes('гингив') || serviceName.includes('кюретаж') || serviceName.includes('лоскутн') ||
                    serviceName.includes('регенерац') || serviceName.includes('шинирован') || serviceName.includes('пародонтоз') ||
                    serviceName.includes('деснев') || serviceName.includes('карман') || serviceName.includes('лазерное лечение')) {
                  serviceSpecialties.add('Periodontics');
                }
                
                // Детская стоматология
                if (serviceName.includes('детск') || serviceName.includes('pediatric') || serviceName.includes('молочн') ||
                    serviceName.includes('герметизац') || serviceName.includes('фторирован') || serviceName.includes('серебрен') ||
                    serviceName.includes('цветн') && serviceName.includes('пломб') || serviceName.includes('седац') ||
                    serviceName.includes('общий наркоз') || serviceName.includes('адаптац') || serviceName.includes('ребенк') ||
                    serviceName.includes('детская профилактик') || serviceName.includes('гигиена детям')) {
                  serviceSpecialties.add('Pediatric Dentistry');
                }
                
                // Эстетическая стоматология
                if (serviceName.includes('эстет') || serviceName.includes('отбел') || serviceName.includes('винир') || 
                    serviceName.includes('cosmetic') || serviceName.includes('veneers') || serviceName.includes('whitening') ||
                    serviceName.includes('bleaching') || serviceName.includes('ламин') || serviceName.includes('реставрац') ||
                    serviceName.includes('композит') || serviceName.includes('фотополимер') || serviceName.includes('наращиван') ||
                    serviceName.includes('офисное') || serviceName.includes('zoom') || serviceName.includes('домашнее отбел') ||
                    serviceName.includes('керамическ') && serviceName.includes('винир') || serviceName.includes('люминир') ||
                    serviceName.includes('голливудск') || serviceName.includes('smile design') || serviceName.includes('улыбк')) {
                  serviceSpecialties.add('Cosmetic Dentistry');
                }
                
                // Профессиональная гигиена
                if (serviceName.includes('гигиен') || serviceName.includes('чистк') || serviceName.includes('hygiene') ||
                    (serviceName.includes('удален') && serviceName.includes('зубн') && serviceName.includes('камень')) ||
                    serviceName.includes('ультразвук') || serviceName.includes('air flow') || serviceName.includes('полировк') ||
                    serviceName.includes('фторирован') || serviceName.includes('герметизац') || serviceName.includes('пескоструй') ||
                    serviceName.includes('профессиональн') && serviceName.includes('чистк') || serviceName.includes('фиссур')) {
                  serviceSpecialties.add('Dental Hygiene');
                }
                
                // Рентгенология и диагностика
                if (serviceName.includes('томограф') || serviceName.includes('рентген') || serviceName.includes('снимок') ||
                    serviceName.includes('диагност') || serviceName.includes('панорам') || serviceName.includes('прицельн') ||
                    serviceName.includes('ортопантом') || serviceName.includes('цефалометр') || serviceName.includes('3d') ||
                    serviceName.includes('кт') || serviceName.includes('фотопротокол') || serviceName.includes('осмотр') ||
                    serviceName.includes('план лечения') || serviceName.includes('смет') || serviceName.includes('консультац')) {
                  serviceSpecialties.add('Oral and Maxillofacial Radiology');
                }
                
                // Челюстно-лицевая хирургия
                if (serviceName.includes('челюстн') || serviceName.includes('лицев') || serviceName.includes('maxillofacial') ||
                    serviceName.includes('травматолог') || serviceName.includes('перелом') || serviceName.includes('вправлен') ||
                    serviceName.includes('внчс') || serviceName.includes('дисфункц') || serviceName.includes('артроз')) {
                  serviceSpecialties.add('Oral and Maxillofacial Surgery');
                }
                
                // Стоматологическая анестезиология
                if (serviceName.includes('анестез') || serviceName.includes('наркоз') || serviceName.includes('седац') ||
                    (serviceName.includes('обезбол') && serviceName.includes('местн')) || serviceName.includes('лечение во сне')) {
                  serviceSpecialties.add('Dental Anesthesiology');
                }
                
                // Стоматологическая патология
                if (serviceName.includes('патолог') || serviceName.includes('биопс') || serviceName.includes('цитолог') ||
                    serviceName.includes('гистолог') || serviceName.includes('опухол') || serviceName.includes('новообразован')) {
                  serviceSpecialties.add('Oral and Maxillofacial Pathology');
                }
                
                // Стоматологическая медицина
                if (serviceName.includes('медицин') || serviceName.includes('терапевт') || serviceName.includes('консультац') ||
                    serviceName.includes('обследован') || serviceName.includes('профилактик') || serviceName.includes('повторн') ||
                    serviceName.includes('узк') && serviceName.includes('специалист') || serviceName.includes('составлен')) {
                  serviceSpecialties.add('Oral Medicine');
                }
                
                // Стоматологическая общественная гигиена
                if (serviceName.includes('обществен') || serviceName.includes('санитарн') ||
                    serviceName.includes('эпидемиолог') || serviceName.includes('статистик') || serviceName.includes('исследован')) {
                  serviceSpecialties.add('Dental Public Health');
                }
                
                // Лазерная стоматология
                if (serviceName.includes('лазерн') || serviceName.includes('laser') || serviceName.includes('лазер')) {
                  serviceSpecialties.add('Laser Dentistry');
                }
                
                // Стоматология сна и бруксизма
                if (serviceName.includes('бруксизм') || serviceName.includes('ночная кап') || serviceName.includes('кап') && serviceName.includes('спорт') ||
                    serviceName.includes('скрежетан') || serviceName.includes('сжати') && serviceName.includes('зуб')) {
                  serviceSpecialties.add('Sleep Dentistry');
                }
                
                // Экстренная стоматология
                if (serviceName.includes('sos') || serviceName.includes('срочн') || serviceName.includes('экстренн') ||
                    serviceName.includes('24/7') || serviceName.includes('круглосуточн') || serviceName.includes('неотложн')) {
                  serviceSpecialties.add('Emergency Dentistry');
                }
              });
              
              if (serviceSpecialties.size > 0) {
                baseSchema.medicalSpecialty = Array.from(serviceSpecialties);
              }
            }
            
            // Fallback на данные клиники, если услуги не дали результата
            if (!baseSchema.medicalSpecialty && clinicData.specializations && clinicData.specializations.length > 0) {
              console.log('🔍 Using fallback specializations from clinic data:', clinicData.specializations);
              baseSchema.medicalSpecialty = clinicData.specializations;
            } else if (!baseSchema.medicalSpecialty) {
              console.log('🔍 No medicalSpecialty determined - no services matched and no clinic specializations');
            }

    // Языки
    if (clinicData.languages && clinicData.languages.length > 0) {
      baseSchema.availableLanguage = clinicData.languages;
    }
  }

  // Добавляем часы работы и ценовой диапазон для клиник
  if (clinicData) {
            // Часы работы из данных клиники
            if (clinicData.workingHours && clinicData.workingHours.length > 0) {
              const openingHours = clinicData.workingHours
                .filter((wh: any) => wh.isOpen)
                .map((wh: any) => {
                  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
                  const dayName = dayNames[wh.dayOfWeek];
                  if (wh.is24Hours) {
                    return `${dayName} 00:00-23:59`;
                  } else if (wh.openTime && wh.closeTime) {
                    let hours = `${dayName} ${wh.openTime}-${wh.closeTime}`;
                    if (wh.breakStartTime && wh.breakEndTime) {
                      hours += `,${wh.breakStartTime}-${wh.breakEndTime}`;
                    }
                    return hours;
                  }
                  return null;
                })
                .filter(Boolean);
              
              // Убираем дубликаты
              const uniqueOpeningHours = [...new Set(openingHours)];
              
              if (uniqueOpeningHours.length > 0) {
                baseSchema.openingHours = uniqueOpeningHours;
              }
            }

    // Ценовой диапазон на основе услуг клиники
    if (clinicData.services && clinicData.services.length > 0) {
      // Получаем все цены из услуг
      const prices = clinicData.services
        .filter((service: any) => service.price && service.price > 0)
        .map((service: any) => service.price);
      
      if (prices.length > 0) {
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        
        // Определяем ценовой диапазон на основе реальных цен
        let priceRange = '$';
        if (maxPrice >= 5000) priceRange = '$$$$';
        else if (maxPrice >= 2000) priceRange = '$$$';
        else if (maxPrice >= 800) priceRange = '$$';
        
        baseSchema.priceRange = priceRange;
        
        // Добавляем дополнительную информацию о ценах
        if (!baseSchema.additionalProperty) {
          baseSchema.additionalProperty = [];
        }
        
        // Добавляем информацию о ценовом диапазоне
        baseSchema.additionalProperty.push({
          "@type": "PropertyValue",
          "name": "Price Range",
          "value": `${minPrice}-${maxPrice} MDL`,
          "description": "Диапазон цен на услуги"
        });
        
        // Добавляем количество услуг
        baseSchema.additionalProperty.push({
          "@type": "PropertyValue", 
          "name": "Services Count",
          "value": clinicData.services.length,
          "description": "Количество услуг"
        });
        
        // Добавляем информацию о валюте
        const currencies = [...new Set(clinicData.services.map((service: any) => service.currency))];
        if (currencies.length > 0) {
          baseSchema.additionalProperty.push({
            "@type": "PropertyValue",
            "name": "Currency",
            "value": currencies.join(', '),
            "description": "Валюты для оплаты"
          });
        }
      }
    } else if (clinicData.priceIndex) {
      // Fallback на priceIndex если нет услуг
      let priceRange = '$';
      if (clinicData.priceIndex >= 80) priceRange = '$$$$';
      else if (clinicData.priceIndex >= 60) priceRange = '$$$';
      else if (clinicData.priceIndex >= 40) priceRange = '$$';
      baseSchema.priceRange = priceRange;
    }
  }

  // Специфичные поля для разных типов схем
  if (schemaType === 'Organization') {
    return {
      ...baseSchema,
      "sameAs": settingsMap.organizationUrl ? [settingsMap.organizationUrl] : undefined
    };
  } else if (schemaType === 'LocalBusiness' || schemaType === 'Dentist') {
    return {
      ...baseSchema,
      "@type": "Dentist",
      "priceRange": baseSchema.priceRange || businessPriceRange,
      "openingHours": baseSchema.openingHours || businessOpeningHours,
      "sameAs": settingsMap.organizationUrl ? [settingsMap.organizationUrl] : undefined
    };
  } else {
    // Fallback для других типов
    return baseSchema;
  }
}

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    // Проверяем доступ к админке
    if (url.startsWith('/admin')) {
      try {
        console.log('🔍 Vite middleware - checking admin access for URL:', url);
        
        // Get admin access code from settings
        const { storage } = await import('./storage');
        const settings = await storage.getAllSiteSettings();
        const settingsMap = settings.reduce((acc: any, setting: any) => {
          acc[setting.key] = setting.value;
          return acc;
        }, {});
        
        const adminAccessCode = settingsMap.adminAccessCode;
        console.log('🔍 Vite middleware - admin access code from settings:', adminAccessCode);
        
        // If no access code is set, allow normal access
        if (!adminAccessCode || adminAccessCode.trim() === '') {
          console.log('🔍 Vite middleware - no access code set, allowing normal access');
        } else {
          // Check if access code is provided in query parameters
          // The URL should be /admin?ruslan (where ruslan is the access code)
          const providedCode = req.query[adminAccessCode];
          console.log('🔍 Vite middleware - provided code in query:', providedCode);
          console.log('🔍 Vite middleware - all query params:', req.query);
          console.log('🔍 Vite middleware - looking for param:', adminAccessCode);
          
          // Check if the access code parameter exists (even if empty)
          if (!(adminAccessCode in req.query)) {
            console.log('🔍 Vite middleware - access code parameter not found, redirecting to home');
            // Redirect to home page if access code parameter is not found
            return res.redirect('/');
          }
          
          console.log('🔍 Vite middleware - access code parameter found, allowing access to login page');
          // If access code parameter is found, allow access to admin login page
        }
      } catch (error) {
        console.error('Error checking admin access code in Vite middleware:', error);
        // On error, allow normal access
      }
    }

    // Отключаем кеширование для HTML страниц
    if (url.includes('/clinic/')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );

      // Определяем язык из URL и устанавливаем lang атрибут
      const isRomanian = url.startsWith('/clinic/ro/') || url === '/ro';
      const lang = isRomanian ? 'ro' : 'ru';
      template = template.replace(
        /<html lang="[^"]*"/,
        `<html lang="${lang}"`
      );
      console.log('🔧 Setting HTML lang attribute to:', lang, 'for URL:', url);

      // Получаем глобальные настройки для фавиконки
      const { storage } = await import('./storage');
      const settings = await storage.getAllSiteSettings();
      const settingsMap = settings.reduce((acc: any, setting: any) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});

      // Добавляем фавикон ко всем страницам для лучшей индексации
      console.log('🔍 Favicon check:', settingsMap.favicon);
      if (settingsMap.favicon) {
        console.log('✅ Adding favicon to HTML:', settingsMap.favicon);
        
        // Получаем расширение файла для определения типа
        const faviconUrl = settingsMap.favicon;
        const extension = faviconUrl.split('.').pop()?.toLowerCase();
        let mimeType = 'image/x-icon';
        
        if (extension === 'png') mimeType = 'image/png';
        else if (extension === 'jpg' || extension === 'jpeg') mimeType = 'image/jpeg';
        else if (extension === 'svg') mimeType = 'image/svg+xml';
        
        // Добавляем preload в начало head для мгновенной загрузки с высоким приоритетом
        template = template.replace(
          /<head>/,
          `<head>
    <!-- Favicon preload для мгновенной загрузки -->
    <link rel="preload" href="${faviconUrl}" as="image" type="${mimeType}" fetchpriority="high" crossorigin="anonymous">`
        );
        
        // Добавляем полный набор тегов для максимальной совместимости и индексации
        template = template.replace(
          /<\/head>/,
          `    <!-- Favicon для поисковиков и браузеров -->
    <link rel="icon" type="${mimeType}" href="${faviconUrl}" sizes="any">
    <link rel="shortcut icon" href="${faviconUrl}" type="${mimeType}">
    <link rel="icon" href="${faviconUrl}" type="${mimeType}">
    <link rel="apple-touch-icon" href="${faviconUrl}" sizes="180x180">
    <link rel="apple-touch-icon-precomposed" href="${faviconUrl}">
    <meta name="msapplication-TileImage" content="${faviconUrl}">
    <meta name="msapplication-config" content="/browserconfig.xml">
    <link rel="manifest" href="/site.webmanifest">
  </head>`
        );
        console.log('✅ Favicon preload and tags added to HTML');
      } else {
        console.log('❌ No favicon found in settings');
      }

      // Добавляем логотип сайта в мета-теги Open Graph
      if (settingsMap.logo) {
        console.log('✅ Adding logo to HTML:', settingsMap.logo);
        const logoUrl = `${settingsMap.websiteUrl || 'https://dentmoldova.md'}${settingsMap.logo}`;
        
        // Добавляем og:image и og:logo
        template = template.replace(
          /<\/head>/,
          `    <!-- Logo для Open Graph -->
    <meta property="og:image" content="${logoUrl}" />
    <meta property="og:logo" content="${logoUrl}" />
  </head>`
        );
        console.log('✅ Logo added to HTML');
      } else {
        console.log('❌ No logo found in settings');
      }

      // Применяем SEO данные если они есть
      const clinicSEO = (req as any).clinicSEO;
      const homepageSEO = (req as any).homepageSEO;
      const seoData = clinicSEO || homepageSEO;
      
      if (seoData) {
        console.log('🔧 Applying SEO data:', seoData.title);
        
        // Обновляем title
        template = template.replace(
          /<title>.*?<\/title>/,
          `<title>${seoData.title}</title>`
        );
        
        // Обновляем meta description
        template = template.replace(
          /<meta name="description" content="[^"]*"/,
          `<meta name="description" content="${seoData.description}"`
        );
        
        // Обновляем meta keywords
        if (seoData.keywords) {
          template = template.replace(
            /<meta name="keywords" content="[^"]*"/,
            `<meta name="keywords" content="${seoData.keywords}"`
          );
        }
        
        // Обновляем robots
        template = template.replace(
          /<meta name="robots" content="[^"]*"/,
          `<meta name="robots" content="${seoData.robots}"`
        );
        
        // Обновляем Open Graph теги
        if (seoData.ogTitle) {
          template = template.replace(
            /<meta property="og:title" content="[^"]*"/,
            `<meta property="og:title" content="${seoData.ogTitle}"`
          );
        }
        
        if (seoData.ogDescription) {
          template = template.replace(
            /<meta property="og:description" content="[^"]*"/,
            `<meta property="og:description" content="${seoData.ogDescription}"`
          );
        }
        
        if (seoData.ogImage) {
          template = template.replace(
            /<meta property="og:image" content=".*?" \/>/,
            `<meta property="og:image" content="${seoData.ogImage}" />`
          );
        }
        
        // Обновляем canonical URL
        if (seoData.canonical) {
          template = template.replace(
            /<link rel="canonical" href="[^"]*"/,
            `<link rel="canonical" href="${seoData.canonical}"`
          );
        }
        
        // Генерируем и добавляем JSON-LD схему
        if (seoData.schemaType && seoData.schemaData && Object.keys(seoData.schemaData).length > 0) {
          let jsonLdSchema;
          
          try {
            // Если schemaData уже является объектом, используем его
            if (typeof seoData.schemaData === 'object') {
              jsonLdSchema = seoData.schemaData;
            } else {
              // Если это строка, пытаемся распарсить JSON
              jsonLdSchema = JSON.parse(seoData.schemaData);
            }
          } catch (error) {
            console.error('❌ Error parsing schemaData:', error);
            // Создаем базовую схему на основе настроек
            jsonLdSchema = generateBasicSchema(seoData, seoData.settingsMap || settingsMap, seoData.clinicData);
          }
          
          // Добавляем JSON-LD в head
          const jsonLdScript = `<script type="application/ld+json">${JSON.stringify(jsonLdSchema, null, 2)}</script>`;
          template = template.replace(
            /<\/head>/,
            `    ${jsonLdScript}
  </head>`
          );
          console.log('✅ Custom JSON-LD schema added to HTML');
        } else {
          // Если нет кастомной схемы, генерируем базовую
          console.log('🔍 Generating basic schema with clinicData:', seoData.clinicData ? 'YES' : 'NO');
          if (seoData.clinicData) {
            console.log('🔍 Clinic data available:', {
              name: seoData.clinicData.nameRu,
              googleRating: seoData.clinicData.googleRating,
              googleReviewsCount: seoData.clinicData.googleReviewsCount,
              dScore: seoData.clinicData.dScore,
              reviewsRating: seoData.clinicData.reviewsRating,
              reviewsCount: seoData.clinicData.reviewsCount,
              services: seoData.clinicData.services ? seoData.clinicData.services.length : 0,
              servicesData: seoData.clinicData.services ? seoData.clinicData.services.slice(0, 3).map((s: any) => ({ name: s.name, price: s.price, currency: s.currency })) : []
            });
          } else {
            console.log('❌ No clinic data available for schema generation');
          }
          const basicSchema = generateBasicSchema(seoData, seoData.settingsMap || settingsMap, seoData.clinicData);
          console.log('🔍 Generated schema:', JSON.stringify(basicSchema, null, 2));
          const jsonLdScript = `<script type="application/ld+json">${JSON.stringify(basicSchema, null, 2)}</script>`;
          template = template.replace(
            /<\/head>/,
            `    ${jsonLdScript}
  </head>`
          );
          console.log('✅ Basic JSON-LD schema added to HTML');
        }
        
      }

      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "..", "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", async (req, res) => {
    try {
      const indexPath = path.resolve(distPath, "index.html");
      let template = await fs.promises.readFile(indexPath, "utf-8");
      
      // Определяем язык из URL и устанавливаем lang атрибут
      const isRomanian = req.originalUrl.startsWith('/clinic/ro/') || req.originalUrl === '/ro';
      const lang = isRomanian ? 'ro' : 'ru';
      template = template.replace(
        /<html lang="[^"]*"/,
        `<html lang="${lang}"`
      );
      console.log('🔧 Setting HTML lang attribute to:', lang, 'for URL:', req.originalUrl);

      // Получаем глобальные настройки для фавиконки (продакшн)
      const { storage } = await import('./storage');
      const settings = await storage.getAllSiteSettings();
      const settingsMap = settings.reduce((acc: any, setting: any) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});

      // Добавляем фавикон ко всем страницам для лучшей индексации (продакшн)
      console.log('🔍 Favicon check (prod):', settingsMap.favicon);
      if (settingsMap.favicon) {
        console.log('✅ Adding favicon to HTML (prod):', settingsMap.favicon);
        
        // Получаем расширение файла для определения типа
        const faviconUrl = settingsMap.favicon;
        const extension = faviconUrl.split('.').pop()?.toLowerCase();
        let mimeType = 'image/x-icon';
        
        if (extension === 'png') mimeType = 'image/png';
        else if (extension === 'jpg' || extension === 'jpeg') mimeType = 'image/jpeg';
        else if (extension === 'svg') mimeType = 'image/svg+xml';
        
        // Добавляем preload в начало head для мгновенной загрузки с высоким приоритетом
        template = template.replace(
          /<head>/,
          `<head>
    <!-- Favicon preload для мгновенной загрузки -->
    <link rel="preload" href="${faviconUrl}" as="image" type="${mimeType}" fetchpriority="high" crossorigin="anonymous">`
        );
        
        // Добавляем полный набор тегов для максимальной совместимости и индексации
        template = template.replace(
          /<\/head>/,
          `    <!-- Favicon для поисковиков и браузеров -->
    <link rel="icon" type="${mimeType}" href="${faviconUrl}" sizes="any">
    <link rel="shortcut icon" href="${faviconUrl}" type="${mimeType}">
    <link rel="icon" href="${faviconUrl}" type="${mimeType}">
    <link rel="apple-touch-icon" href="${faviconUrl}" sizes="180x180">
    <link rel="apple-touch-icon-precomposed" href="${faviconUrl}">
    <meta name="msapplication-TileImage" content="${faviconUrl}">
    <meta name="msapplication-config" content="/browserconfig.xml">
    <link rel="manifest" href="/site.webmanifest">
  </head>`
        );
        console.log('✅ Favicon preload and tags added to HTML (prod)');
      } else {
        console.log('❌ No favicon found in settings (prod)');
      }

      // Добавляем логотип сайта в мета-теги Open Graph (продакшн)
      if (settingsMap.logo) {
        console.log('✅ Adding logo to HTML (prod):', settingsMap.logo);
        const logoUrl = `${settingsMap.websiteUrl || 'https://dentmoldova.md'}${settingsMap.logo}`;
        
        // Добавляем og:image и og:logo
        template = template.replace(
          /<\/head>/,
          `    <!-- Logo для Open Graph -->
    <meta property="og:image" content="${logoUrl}" />
    <meta property="og:logo" content="${logoUrl}" />
  </head>`
        );
        console.log('✅ Logo added to HTML (prod)');
      } else {
        console.log('❌ No logo found in settings (prod)');
      }

      // Применяем SEO данные если они есть
      const clinicSEO = (req as any).clinicSEO;
      const homepageSEO = (req as any).homepageSEO;
      const seoData = clinicSEO || homepageSEO;
      
      if (seoData) {
        console.log('🔧 Applying SEO data:', seoData.title);
        
        // Обновляем title
        template = template.replace(
          /<title>.*?<\/title>/,
          `<title>${seoData.title}</title>`
        );
        
        // Обновляем meta description
        template = template.replace(
          /<meta name="description" content="[^"]*"/,
          `<meta name="description" content="${seoData.description}"`
        );
        
        // Обновляем meta keywords
        if (seoData.keywords) {
          template = template.replace(
            /<meta name="keywords" content="[^"]*"/,
            `<meta name="keywords" content="${seoData.keywords}"`
          );
        }
        
        // Обновляем robots
        template = template.replace(
          /<meta name="robots" content="[^"]*"/,
          `<meta name="robots" content="${seoData.robots}"`
        );
        
        // Обновляем Open Graph теги
        if (seoData.ogTitle) {
          template = template.replace(
            /<meta property="og:title" content="[^"]*"/,
            `<meta property="og:title" content="${seoData.ogTitle}"`
          );
        }
        
        if (seoData.ogDescription) {
          template = template.replace(
            /<meta property="og:description" content="[^"]*"/,
            `<meta property="og:description" content="${seoData.ogDescription}"`
          );
        }
        
        if (seoData.ogImage) {
          template = template.replace(
            /<meta property="og:image" content=".*?" \/>/,
            `<meta property="og:image" content="${seoData.ogImage}" />`
          );
        }
        
        // Обновляем canonical URL
        if (seoData.canonical) {
          template = template.replace(
            /<link rel="canonical" href="[^"]*"/,
            `<link rel="canonical" href="${seoData.canonical}"`
          );
        }
        
      }
      
      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (error) {
      console.error('Error serving static file:', error);
      res.sendFile(path.resolve(distPath, "index.html"));
    }
  });
}
