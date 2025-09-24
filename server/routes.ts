import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { cities, districts, clinics, workingHours, reviews } from "@shared/schema";
import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import session from "express-session";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { calculateRatings } from './utils/ratingCalculator';

// Admin credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'dancerboy';

// Robots.txt generation function
async function generateRobotsTxt(baseUrl: string) {
  try {
    // Получаем robots.txt из настроек
    const settings = await storage.getAllSiteSettings();
    const settingsMap = settings.reduce((acc: any, setting: any) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
    
    const robotsContent = settingsMap.robotsTxt || `User-agent: *
Disallow: /admin
Disallow: /api

Sitemap: ${baseUrl}/sitemap.xml`;
    
    return robotsContent;
  } catch (error) {
    console.error('Error generating robots.txt:', error);
    return `User-agent: *
Disallow: /admin
Disallow: /api

Sitemap: ${baseUrl}/sitemap.xml`;
  }
}

// Sitemap generation function
async function generateSitemap(baseUrl: string) {
  const urls = [];
  
  // 1. Main pages
  urls.push({
    loc: `${baseUrl}/`,
    lastmod: new Date().toISOString(),
    changefreq: 'daily',
    priority: '1.0'
  });
  
  urls.push({
    loc: `${baseUrl}/ro/`,
    lastmod: new Date().toISOString(),
    changefreq: 'daily',
    priority: '1.0'
  });
  
  urls.push({
    loc: `${baseUrl}/pricing`,
    lastmod: new Date().toISOString(),
    changefreq: 'weekly',
    priority: '0.8'
  });
  
  urls.push({
    loc: `${baseUrl}/ro/pricing`,
    lastmod: new Date().toISOString(),
    changefreq: 'weekly',
    priority: '0.8'
  });
  
  // 2. City pages
  const allCities = await db.select().from(cities);
  
  for (const city of allCities) {
    if (city.slugRu) {
      urls.push({
        loc: `${baseUrl}/city/${city.slugRu}`,
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: '0.9'
      });
    }
    
    if (city.slugRo) {
      urls.push({
        loc: `${baseUrl}/ro/city/${city.slugRo}`,
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: '0.9'
      });
    }
  }
  
  // 3. District pages
  const allDistricts = await db
    .select()
    .from(districts)
    .leftJoin(cities, eq(districts.cityId, cities.id));
  
  for (const item of allDistricts) {
    const district = item.districts;
    const city = item.cities;
    
    if (district.slugRu && city?.slugRu) {
      urls.push({
        loc: `${baseUrl}/city/${city.slugRu}/${district.slugRu}`,
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: '0.8'
      });
    }
    
    if (district.slugRo && city?.slugRo) {
      urls.push({
        loc: `${baseUrl}/ro/city/${city.slugRo}/${district.slugRo}`,
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: '0.8'
      });
    }
  }

  // 4. Feature pages
  const features = [
    'pediatric-dentistry',
    'parking', 
    'sos',
    'work24h',
    'credit',
    'weekend-work'
  ];

  for (const feature of features) {
    // Russian version
    urls.push({
      loc: `${baseUrl}/${feature}`,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: '0.8'
    });
    
    // Romanian version
    urls.push({
      loc: `${baseUrl}/ro/${feature}`,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: '0.8'
    });
    
    // Feature + City combinations
    for (const city of allCities) {
      if (city.slugRu) {
        urls.push({
          loc: `${baseUrl}/city/${city.slugRu}/${feature}`,
          lastmod: new Date().toISOString(),
          changefreq: 'weekly',
          priority: '0.7'
        });
      }
      
      if (city.slugRo) {
        urls.push({
          loc: `${baseUrl}/ro/city/${city.slugRo}/${feature}`,
          lastmod: new Date().toISOString(),
          changefreq: 'weekly',
          priority: '0.7'
        });
      }
    }
    
    // Feature + City + District combinations
    for (const item of allDistricts) {
      const district = item.districts;
      const city = item.cities;
      
      if (district.slugRu && city?.slugRu) {
        urls.push({
          loc: `${baseUrl}/city/${city.slugRu}/${district.slugRu}/${feature}`,
          lastmod: new Date().toISOString(),
          changefreq: 'weekly',
          priority: '0.6'
        });
      }
      
      if (district.slugRo && city?.slugRo) {
        urls.push({
          loc: `${baseUrl}/ro/city/${city.slugRo}/${district.slugRo}/${feature}`,
          lastmod: new Date().toISOString(),
          changefreq: 'weekly',
          priority: '0.6'
        });
      }
    }
  }

  // 5. Active clinic pages
  const activeClinics = await db.query.clinics.findMany({
    where: eq(clinics.verified, true),
    columns: {
      slug: true,
      updatedAt: true
    }
  });
  
  for (const clinic of activeClinics) {
    // Russian version
    urls.push({
      loc: `${baseUrl}/clinic/${clinic.slug}`,
      lastmod: clinic.updatedAt?.toISOString() || new Date().toISOString(),
      changefreq: 'weekly',
      priority: '0.6'
    });
    
    // Romanian version
    urls.push({
      loc: `${baseUrl}/ro/clinic/${clinic.slug}`,
      lastmod: clinic.updatedAt?.toISOString() || new Date().toISOString(),
      changefreq: 'weekly',
      priority: '0.6'
    });
  }
  
  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
  
  return {
    xml,
    totalPages: urls.length,
    mainPages: 4,
    cityPages: allCities.length * 2, // Russian + Romanian
    districtPages: allDistricts.length * 2, // Russian + Romanian
    featurePages: features.length * 2, // Russian + Romanian
    featureCityPages: features.length * allCities.length * 2, // Feature + City combinations
    featureDistrictPages: features.length * allDistricts.length * 2, // Feature + District combinations
    clinicPages: activeClinics.length * 2, // Russian + Romanian
    lastUpdated: new Date().toISOString()
  };
}

// Session middleware
declare module 'express-session' {
  interface SessionData {
    isAdminAuthenticated?: boolean;
  }
}

// File upload configuration
const uploadDir = path.join(process.cwd(), 'img');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      // Определяем префикс в зависимости от типа файла
      let prefix = 'clinic-image-';
      if (file.fieldname === 'logo') {
        prefix = 'clinic-logo-';
      } else if (req.body?.type === 'logo') {
        prefix = 'site-logo-';
      } else if (req.body?.type === 'favicon') {
        prefix = 'favicon-';
      }
      cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 11 // Максимум 11 файлов (1 логотип + 10 изображений)
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Middleware to check admin authentication
const requireAdminAuth = (req: any, res: any, next: any) => {
  if (!req.session?.isAdminAuthenticated) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};


// Middleware to check admin access code
const checkAdminAccessCode = async (req: any, res: any, next: any) => {
  try {
    console.log('🔍 Checking admin access code for URL:', req.originalUrl);
    
    // Get admin access code from settings
    const settings = await storage.getAllSiteSettings();
    const settingsMap = settings.reduce((acc: any, setting: any) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
    
    const adminAccessCode = settingsMap.adminAccessCode;
    console.log('🔍 Admin access code from settings:', adminAccessCode);
    
    // If no access code is set, allow normal access
    if (!adminAccessCode || adminAccessCode.trim() === '') {
      console.log('🔍 No access code set, allowing normal access');
      return next();
    }
    
    // Check if access code is provided in query parameters
    // The URL should be /admin?ruslan (where ruslan is the access code)
    const providedCode = req.query[adminAccessCode];
    console.log('🔍 Provided code in query:', providedCode);
    console.log('🔍 All query params:', req.query);
    console.log('🔍 Looking for param:', adminAccessCode);
    
    // Check if the access code parameter exists (even if empty)
    if (!(adminAccessCode in req.query)) {
      console.log('🔍 Access code parameter not found, redirecting to home');
      // Redirect to home page if access code parameter is not found
      return res.redirect('/');
    }
    
    console.log('🔍 Access code parameter found, allowing access to login page');
    // If access code parameter is found, allow access to admin login page
    next();
  } catch (error) {
    console.error('Error checking admin access code:', error);
    // On error, allow normal access
    next();
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // CORS middleware
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // Admin access code middleware - проверяем доступ к админке
  app.use('/admin', checkAdminAccessCode);

  // Session configuration
  app.use(session({
    secret: 'dent-moldova-admin-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: null, // Session-only cookie (удаляется при закрытии браузера)
      sameSite: 'strict' // Дополнительная безопасность
    }
  }));

  // Serve uploaded files
  app.use('/images', (req, res, next) => {
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  }, express.static(uploadDir));

  // ===== DATA PROTECTION ROUTES =====
  
  // Create backup
  app.post('/api/admin/backups', requireAdminAuth, async (req, res) => {
    try {
      const { backupType, description } = req.body;
      const userId = req.session?.isAdminAuthenticated ? 'admin' : 'system';
      
      if (!backupType || !['full', 'clinics', 'cities', 'manual'].includes(backupType)) {
        return res.status(400).json({ message: 'Неверный тип резервной копии' });
      }
      
      const backupId = await storage.createBackup(backupType, description, userId);
      res.json({ success: true, backupId, message: 'Резервная копия создана успешно' });
    } catch (error) {
      console.error('Error creating backup:', error);
      res.status(500).json({ message: 'Ошибка при создании резервной копии' });
    }
  });

  // Get backups list
  app.get('/api/admin/backups', requireAdminAuth, async (req, res) => {
    try {
      const { limit = 20 } = req.query;
      const backups = await storage.getBackups(parseInt(limit as string));
      res.json({ backups });
    } catch (error) {
      console.error('Error fetching backups:', error);
      res.status(500).json({ message: 'Ошибка при получении списка резервных копий' });
    }
  });

  // Restore from backup
  app.post('/api/admin/backups/:id/restore', requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { restoreType = 'full', tables = [] } = req.body;
      const userId = req.session?.isAdminAuthenticated ? 'admin' : 'system';
      
      await storage.restoreFromBackup(id, { restoreType, tables, userId });
      res.json({ success: true, message: 'Данные восстановлены успешно' });
    } catch (error: any) {
      console.error('Error restoring backup:', error);
      res.status(500).json({ message: error.message || 'Ошибка при восстановлении данных' });
    }
  });

  // Delete backup
  app.delete('/api/admin/backups/:id', requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      // Note: This would require adding a delete method to DataProtection
      res.json({ success: true, message: 'Резервная копия удалена' });
    } catch (error) {
      console.error('Error deleting backup:', error);
      res.status(500).json({ message: 'Ошибка при удалении резервной копии' });
    }
  });

  // Get audit logs
  app.get('/api/admin/audit-logs', requireAdminAuth, async (req, res) => {
    try {
      const { tableName, recordId, action, userId, limit = 50, offset = 0 } = req.query;
      const logs = await storage.getAuditLogs({
        tableName: tableName as string,
        recordId: recordId as string,
        action: action as string,
        userId: userId as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      res.json(logs);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      res.status(500).json({ message: 'Ошибка при получении журнала аудита' });
    }
  });

  // Get data protection statistics
  app.get('/api/admin/data-protection/stats', requireAdminAuth, async (req, res) => {
    try {
      const stats = await storage.getProtectionStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching protection stats:', error);
      res.status(500).json({ message: 'Ошибка при получении статистики защиты данных' });
    }
  });

  // Set data protection setting
  app.post('/api/admin/data-protection/settings', requireAdminAuth, async (req, res) => {
    try {
      const { key, value, description } = req.body;
      
      if (!key || value === undefined) {
        return res.status(400).json({ message: 'Ключ и значение обязательны' });
      }
      
      await storage.setProtectionSetting(key, value, description);
      res.json({ success: true, message: 'Настройка сохранена' });
    } catch (error) {
      console.error('Error setting protection setting:', error);
      res.status(500).json({ message: 'Ошибка при сохранении настройки' });
    }
  });

  // Cleanup old backups
  app.post('/api/admin/data-protection/cleanup', requireAdminAuth, async (req, res) => {
    try {
      const { keepDays = 30 } = req.body;
      const deletedCount = await storage.cleanupOldBackups(keepDays);
      res.json({ success: true, deletedCount, message: `Удалено ${deletedCount} старых резервных копий` });
    } catch (error) {
      console.error('Error cleaning up backups:', error);
      res.status(500).json({ message: 'Ошибка при очистке резервных копий' });
    }
  });

  // ===== ADMIN AUTHENTICATION ROUTES =====
  
  // Admin login
  app.post('/api/admin/auth/login', async (req: any, res) => {
    try {
      const { username, password } = req.body;
      
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        req.session.isAdminAuthenticated = true;
        res.json({ success: true, message: 'Успешный вход в админ панель' });
      } else {
        res.status(401).json({ message: 'Неверный логин или пароль' });
      }
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  });

  // Check admin authentication status
  app.get('/api/admin/auth/check', (req: any, res) => {
    if (req.session?.isAdminAuthenticated) {
      res.json({ authenticated: true });
    } else {
      res.status(401).json({ authenticated: false });
    }
  });

  // Admin logout
  app.post('/api/admin/auth/logout', (req: any, res) => {
    req.session.destroy(() => {
      res.json({ success: true, message: 'Вышли из админ панели' });
    });
  });

  // ===== ADMIN CLINIC ROUTES =====
  
  // Get all clinics for admin (with pagination)
  app.get('/api/admin/clinics', requireAdminAuth, async (req, res) => {
    try {
      const querySchema = z.object({
        q: z.string().optional(),
        city: z.string().optional(),
        district: z.string().optional(),
        page: z.string().optional().transform(val => val ? parseInt(val) : 1),
        limit: z.string().optional().transform(val => val ? parseInt(val) : 30),
      });

      const { q, city, district, page, limit } = querySchema.parse(req.query);
      const result = await storage.getClinics({ 
        q, 
        city, 
        districts: district ? [district] : [], 
        page, 
        limit 
      });
      
      res.json(result);
    } catch (error) {
      console.error('Error fetching admin clinics:', error);
      res.status(500).json({ message: 'Ошибка при получении клиник' });
    }
  });

  // Get single clinic for admin
  app.get('/api/admin/clinics/:id', requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`🔍 Fetching clinic with services: ${id}`);
      
      const clinic = await storage.getClinicWithServices(id);
      
      if (!clinic) {
        console.log(`❌ Clinic not found: ${id}`);
        return res.status(404).json({ message: 'Клиника не найдена' });
      }
      
      console.log(`✅ Clinic loaded with ${clinic.servicesRu?.length || 0} RU services and ${clinic.servicesRo?.length || 0} RO services`);
      res.json(clinic);
    } catch (error) {
      console.error('Error fetching admin clinic:', error);
      res.status(500).json({ message: 'Ошибка при получении клиники' });
    }
  });

  // Create new clinic
  app.post('/api/admin/clinics', requireAdminAuth, upload.single('logo'), async (req: any, res) => {
    try {
      console.log('🔍 Creating new clinic');
      console.log('🔍 Request body keys:', Object.keys(req.body));
      console.log('🔍 Services RU (raw):', req.body.servicesRu);
      console.log('🔍 Services RO (raw):', req.body.servicesRo);
      const clinicSchema = z.object({
        nameRu: z.string().min(1, 'Название на русском обязательно'),
        nameRo: z.string().min(1, 'Название на румынском обязательно'),
        cityId: z.string().min(1, 'Город обязателен'),
        districtId: z.string().optional().transform(val => val === 'null' || val === '' || val === 'no_districts' ? null : val),
        addressRu: z.string().optional(),
        addressRo: z.string().optional(),
        phone: z.string().optional(),
        website: z.string().optional(),
        bookingUrl: z.string().optional(),
        languages: z.string().optional().transform(val => {
          if (!val || val === '[object Object]') return [];
          try {
            return JSON.parse(val);
          } catch {
            return [];
          }
        }),
        specializations: z.string().optional().transform(val => {
          if (!val || val === '[object Object]') return [];
          try {
            return JSON.parse(val);
          } catch {
            return [];
          }
        }),
        tags: z.string().optional().transform(val => {
          if (!val || val === '[object Object]') return [];
          try {
            return JSON.parse(val);
          } catch {
            return [];
          }
        }),
        verified: z.string().optional().transform(val => val === 'true'),
        cnam: z.string().optional().transform(val => val === 'true'),
        availToday: z.string().optional().transform(val => val === 'true'),
        availTomorrow: z.string().optional().transform(val => val === 'true'),
        // Google рейтинг
        googleRating: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
        googleReviewsCount: z.string().optional().transform(val => val ? parseInt(val) : undefined),
        // Опыт врачей
        doctorExperience: z.string().optional().transform(val => val ? parseInt(val) : 0),
        hasLicenses: z.string().optional().transform(val => val === 'true'),
        hasCertificates: z.string().optional().transform(val => val === 'true'),
        // Удобство записи
        onlineBooking: z.string().optional().transform(val => val === 'true'),
        weekendWork: z.string().optional().transform(val => val === 'true'),
        eveningWork: z.string().optional().transform(val => val === 'true'),
        urgentCare: z.string().optional().transform(val => val === 'true'),
        convenientLocation: z.string().optional().transform(val => val === 'true'),
        // Ценовая политика (старые поля)
        installmentPlan: z.string().optional().transform(val => val === 'true'),
        hasPromotions: z.string().optional().transform(val => val === 'true'),
        // Ценовая политика (новые поля)
        publishedPricing: z.string().optional().transform(val => val === 'true'),
        freeConsultation: z.string().optional().transform(val => val === 'true'),
        interestFreeInstallment: z.string().optional().transform(val => val === 'true'),
        implantWarranty: z.string().optional().transform(val => val === 'true'),
        popularServicesPromotions: z.string().optional().transform(val => val === 'true'),
        onlinePriceCalculator: z.string().optional().transform(val => val === 'true'),
        // Новые характеристики для фильтрации
        pediatricDentistry: z.string().optional().transform(val => val === 'true'),
        parking: z.string().optional().transform(val => val === 'true'),
        sos: z.string().optional().transform(val => val === 'true'),
        work24h: z.string().optional().transform(val => val === 'true'),
        credit: z.string().optional().transform(val => val === 'true'),
        sosEnabled: z.string().optional().transform(val => val === 'true'),
        // Старые поля
        priceIndex: z.string().transform(val => parseInt(val) || 50),
        trustIndex: z.string().transform(val => parseInt(val) || 50),
        reviewsIndex: z.string().transform(val => parseInt(val) || 50),
        accessIndex: z.string().transform(val => parseInt(val) || 50),
        // SEO fields
        seoTitleRu: z.string().optional(),
        seoTitleRo: z.string().optional(),
        seoDescriptionRu: z.string().optional(),
        seoDescriptionRo: z.string().optional(),
        seoKeywordsRu: z.string().optional(),
        seoKeywordsRo: z.string().optional(),
        seoH1Ru: z.string().optional(),
        seoH1Ro: z.string().optional(),
        ogTitleRu: z.string().optional(),
        ogTitleRo: z.string().optional(),
        ogDescriptionRu: z.string().optional(),
        ogDescriptionRo: z.string().optional(),
        ogImage: z.string().optional(),
        seoCanonical: z.string().optional(),
        seoRobots: z.string().optional(),
        seoPriority: z.string().optional().transform(val => val ? parseFloat(val) : 0.5),
        seoSchemaType: z.string().optional(),
        seoSchemaData: z.union([z.string(), z.object({}).passthrough()]).optional().transform(val => {
          if (typeof val === 'string') {
            if (val === '[object Object]' || val === '') {
              return undefined;
            }
            try {
              return val ? JSON.parse(val) : undefined;
            } catch {
              return undefined;
            }
          }
          return val;
        }),
        // Services
        servicesRu: z.string().optional().transform(val => {
          if (typeof val === 'string') {
            try {
              const parsed = val ? JSON.parse(val) : undefined;
              console.log('🔍 Parsed servicesRu (create):', parsed);
              return parsed;
            } catch (error) {
              console.error('❌ Error parsing servicesRu (create):', error);
              return undefined;
            }
          }
          return val;
        }),
        servicesRo: z.string().optional().transform(val => {
          if (typeof val === 'string') {
            try {
              const parsed = val ? JSON.parse(val) : undefined;
              console.log('🔍 Parsed servicesRo (create):', parsed);
              return parsed;
            } catch (error) {
              console.error('❌ Error parsing servicesRo (create):', error);
              return undefined;
            }
          }
          return val;
        }),
      });

      const clinicData = clinicSchema.parse(req.body);
      
      // Generate slug from Russian name
      const slug = clinicData.nameRu.toLowerCase()
        .replace(/[а-яё]/g, (match) => {
          const translit: { [key: string]: string } = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
            'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
            'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
            'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
            'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
          };
          return translit[match] || match;
        })
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
        .replace(/^-+|-+$/g, '');
      
      // Add logo path if uploaded
      let logoUrl = null;
      if (req.file) {
        logoUrl = `/images/${req.file.filename}`;
      }
      
      // Calculate ratings automatically based on new fields
      const calculatedRatings = calculateRatings({
        googleRating: clinicData.googleRating,
        googleReviewsCount: clinicData.googleReviewsCount,
        doctorExperience: clinicData.doctorExperience || 0,
        hasLicenses: clinicData.hasLicenses || false,
        hasCertificates: clinicData.hasCertificates || false,
        onlineBooking: clinicData.onlineBooking || false,
        weekendWork: clinicData.weekendWork || false,
        eveningWork: clinicData.eveningWork || false,
        urgentCare: clinicData.urgentCare || false,
        convenientLocation: clinicData.convenientLocation || false,
        installmentPlan: clinicData.installmentPlan || false,
        hasPromotions: clinicData.hasPromotions || false,
        publishedPricing: clinicData.publishedPricing || false,
        freeConsultation: clinicData.freeConsultation || false,
        interestFreeInstallment: clinicData.interestFreeInstallment || false,
        implantWarranty: clinicData.implantWarranty || false,
        popularServicesPromotions: clinicData.popularServicesPromotions || false,
        onlinePriceCalculator: clinicData.onlinePriceCalculator || false,
      });

      const newClinic = await storage.createClinic({
        ...clinicData,
        slug,
        logoUrl,
        
        trustIndex: calculatedRatings.trustIndex,
        accessIndex: calculatedRatings.accessIndex,
        priceIndex: calculatedRatings.priceIndex,
        dScore: calculatedRatings.dScore,
        // Новые поля ценовой политики
        publishedPricing: clinicData.publishedPricing || false,
        freeConsultation: clinicData.freeConsultation || false,
        interestFreeInstallment: clinicData.interestFreeInstallment || false,
        implantWarranty: clinicData.implantWarranty || false,
        popularServicesPromotions: clinicData.popularServicesPromotions || false,
        onlinePriceCalculator: clinicData.onlinePriceCalculator || false,
      });
      
      // Add services if provided
      if (clinicData.servicesRu) {
        console.log('🔍 Adding RU services:', clinicData.servicesRu);
        await storage.updateClinicServices(newClinic.id, clinicData.servicesRu, 'ru');
      }
      
      if (clinicData.servicesRo) {
        console.log('🔍 Adding RO services:', clinicData.servicesRo);
        await storage.updateClinicServices(newClinic.id, clinicData.servicesRo, 'ro');
      }
      
      // Add working hours if provided
      if (req.body.workingHours) {
        console.log('🔍 Adding working hours:', req.body.workingHours);
        try {
          const workingHoursData = JSON.parse(req.body.workingHours);
          await storage.updateClinicWorkingHours(newClinic.id, workingHoursData);
        } catch (error) {
          console.error('Error parsing working hours:', error);
        }
      }
      
      res.status(201).json(newClinic);
    } catch (error: any) {
      console.error('Error creating clinic:', error);
      res.status(400).json({ message: error.message || 'Ошибка при создании клиники' });
    }
  });

  // Update clinic
  app.put('/api/admin/clinics/:id', requireAdminAuth, upload.single('logo'), async (req: any, res) => {
    try {
      const { id } = req.params;
      
      console.log('🔍 Updating clinic:', id);
      console.log('🔍 Request body keys:', Object.keys(req.body));
      console.log('🔍 Services RU (raw):', req.body.servicesRu);
      console.log('🔍 Services RO (raw):', req.body.servicesRo);
      console.log('🔍 Services RU type:', typeof req.body.servicesRu);
      console.log('🔍 Services RO type:', typeof req.body.servicesRo);
      
      // Check if clinic exists
      const existingClinic = await storage.getClinicById(id);
      if (!existingClinic) {
        return res.status(404).json({ message: 'Клиника не найдена' });
      }

      const clinicSchema = z.object({
        nameRu: z.string().optional(),
        nameRo: z.string().optional(),
        cityId: z.string().optional(),
        districtId: z.string().optional().transform(val => val === 'null' || val === '' || val === 'no_districts' ? null : val),
        addressRu: z.string().optional(),
        addressRo: z.string().optional(),
        phone: z.string().optional(),
        website: z.string().optional(),
        bookingUrl: z.string().optional(),
        languages: z.union([z.string(), z.array(z.string())]).optional().transform(val => {
          if (typeof val === 'string') {
            if (val === '[object Object]' || val === '') {
              return undefined;
            }
            try {
              return val ? JSON.parse(val) : undefined;
            } catch {
              return undefined;
            }
          }
          return val;
        }),
        specializations: z.union([z.string(), z.array(z.string())]).optional().transform(val => {
          if (typeof val === 'string') {
            if (val === '[object Object]' || val === '') {
              return undefined;
            }
            try {
              return val ? JSON.parse(val) : undefined;
            } catch {
              return undefined;
            }
          }
          return val;
        }),
        tags: z.union([z.string(), z.array(z.string())]).optional().transform(val => {
          if (typeof val === 'string') {
            if (val === '[object Object]' || val === '') {
              return undefined;
            }
            try {
              return val ? JSON.parse(val) : undefined;
            } catch {
              return undefined;
            }
          }
          return val;
        }),
        verified: z.string().optional().transform(val => val === 'true'),
        cnam: z.string().optional().transform(val => val === 'true'),
        availToday: z.string().optional().transform(val => val === 'true'),
        availTomorrow: z.string().optional().transform(val => val === 'true'),
        // SEO fields
        seoTitleRu: z.string().optional(),
        seoTitleRo: z.string().optional(),
        seoDescriptionRu: z.string().optional(),
        seoDescriptionRo: z.string().optional(),
        seoKeywordsRu: z.string().optional(),
        seoKeywordsRo: z.string().optional(),
        seoH1Ru: z.string().optional(),
        seoH1Ro: z.string().optional(),
        ogTitleRu: z.string().optional(),
        ogTitleRo: z.string().optional(),
        ogDescriptionRu: z.string().optional(),
        ogDescriptionRo: z.string().optional(),
        ogImage: z.string().optional(),
        seoCanonical: z.string().optional(),
        seoRobots: z.string().optional(),
        seoPriority: z.string().optional().transform(val => val ? parseFloat(val) : 0.5),
        seoSchemaType: z.string().optional(),
        seoSchemaData: z.union([z.string(), z.object({}).passthrough()]).optional().transform(val => {
          if (typeof val === 'string') {
            if (val === '[object Object]' || val === '') {
              return undefined;
            }
            try {
              return val ? JSON.parse(val) : undefined;
            } catch {
              return undefined;
            }
          }
          return val;
        }),
        // Опыт врачей
        doctorExperience: z.string().optional().transform(val => val ? parseInt(val) : undefined),
        hasLicenses: z.string().optional().transform(val => val === 'true'),
        hasCertificates: z.string().optional().transform(val => val === 'true'),
        // Удобство записи
        onlineBooking: z.string().optional().transform(val => val === 'true'),
        weekendWork: z.string().optional().transform(val => val === 'true'),
        eveningWork: z.string().optional().transform(val => val === 'true'),
        urgentCare: z.string().optional().transform(val => val === 'true'),
        convenientLocation: z.string().optional().transform(val => val === 'true'),
        // Ценовая политика (старые поля)
        installmentPlan: z.string().optional().transform(val => val === 'true'),
        hasPromotions: z.string().optional().transform(val => val === 'true'),
        // Ценовая политика (новые поля)
        publishedPricing: z.string().optional().transform(val => val === 'true'),
        freeConsultation: z.string().optional().transform(val => val === 'true'),
        interestFreeInstallment: z.string().optional().transform(val => val === 'true'),
        implantWarranty: z.string().optional().transform(val => val === 'true'),
        popularServicesPromotions: z.string().optional().transform(val => val === 'true'),
        onlinePriceCalculator: z.string().optional().transform(val => val === 'true'),
        // Новые характеристики для фильтрации
        pediatricDentistry: z.string().optional().transform(val => val === 'true'),
        parking: z.string().optional().transform(val => val === 'true'),
        sos: z.string().optional().transform(val => val === 'true'),
        work24h: z.string().optional().transform(val => val === 'true'),
        credit: z.string().optional().transform(val => val === 'true'),
        sosEnabled: z.string().optional().transform(val => val === 'true'),
        // Старые поля
        priceIndex: z.string().optional().transform(val => val ? parseInt(val) : undefined),
        trustIndex: z.string().optional().transform(val => val ? parseInt(val) : undefined),
        
        accessIndex: z.string().optional().transform(val => val ? parseInt(val) : undefined),
        recommended: z.string().optional().transform(val => val === 'true'),
        promotionalLabels: z.union([z.string(), z.array(z.string())]).optional().transform(val => {
          if (typeof val === 'string') {
            if (val === '[object Object]' || val === '') {
              return undefined;
            }
            try {
              return val ? JSON.parse(val) : undefined;
            } catch {
              return undefined;
            }
          }
          return val;
        }),
        // Services
        servicesRu: z.string().optional().transform(val => {
          if (typeof val === 'string') {
            try {
              const parsed = val ? JSON.parse(val) : undefined;
              console.log('🔍 Parsed servicesRu (update):', parsed);
              return parsed;
            } catch (error) {
              console.error('❌ Error parsing servicesRu (update):', error);
              return undefined;
            }
          }
          return val;
        }),
        servicesRo: z.string().optional().transform(val => {
          if (typeof val === 'string') {
            try {
              const parsed = val ? JSON.parse(val) : undefined;
              console.log('🔍 Parsed servicesRo (update):', parsed);
              return parsed;
            } catch (error) {
              console.error('❌ Error parsing servicesRo (update):', error);
              return undefined;
            }
          }
          return val;
        }),
      });


      console.log('🔍 Parsing request body...');
      const parsedUpdates = clinicSchema.parse(req.body);
      console.log('🔍 Parsed updates:', JSON.stringify(parsedUpdates, null, 2));
      console.log('🔍 sosEnabled in parsed updates:', parsedUpdates.sosEnabled);
      console.log('🔍 sosEnabled type:', typeof parsedUpdates.sosEnabled);
      console.log('🔍 Price policy fields:', {
        publishedPricing: parsedUpdates.publishedPricing,
        freeConsultation: parsedUpdates.freeConsultation,
        interestFreeInstallment: parsedUpdates.interestFreeInstallment,
        implantWarranty: parsedUpdates.implantWarranty,
        popularServicesPromotions: parsedUpdates.popularServicesPromotions,
        onlinePriceCalculator: parsedUpdates.onlinePriceCalculator,
      });
      const updates: any = { ...parsedUpdates };
      
      // Update logo if uploaded
      if (req.file) {
        updates.logoUrl = `/images/${req.file.filename}`;
      }
      
      // Recalculate ratings automatically if any new fields are updated
      const hasNewFields = updates.googleRating !== undefined || 
                          updates.googleReviewsCount !== undefined ||
                          updates.doctorExperience !== undefined ||
                          updates.hasLicenses !== undefined ||
                          updates.hasCertificates !== undefined ||
                          updates.onlineBooking !== undefined ||
                          updates.weekendWork !== undefined ||
                          updates.eveningWork !== undefined ||
                          updates.urgentCare !== undefined ||
                          updates.convenientLocation !== undefined ||
                          updates.installmentPlan !== undefined ||
                          updates.hasPromotions !== undefined ||
                          updates.publishedPricing !== undefined ||
                          updates.freeConsultation !== undefined ||
                          updates.interestFreeInstallment !== undefined ||
                          updates.implantWarranty !== undefined ||
                          updates.popularServicesPromotions !== undefined ||
                          updates.onlinePriceCalculator !== undefined ||
                          updates.pediatricDentistry !== undefined ||
                          updates.parking !== undefined ||
                          updates.sos !== undefined ||
                          updates.work24h !== undefined ||
                          updates.credit !== undefined ||
                          updates.sosEnabled !== undefined;

      if (hasNewFields) {
        const calculatedRatings = calculateRatings({
          googleRating: updates.googleRating ?? existingClinic.googleRating,
          googleReviewsCount: updates.googleReviewsCount ?? existingClinic.googleReviewsCount,
          doctorExperience: updates.doctorExperience ?? existingClinic.doctorExperience ?? 0,
          hasLicenses: updates.hasLicenses ?? existingClinic.hasLicenses ?? false,
          hasCertificates: updates.hasCertificates ?? existingClinic.hasCertificates ?? false,
          onlineBooking: updates.onlineBooking ?? existingClinic.onlineBooking ?? false,
          weekendWork: updates.weekendWork ?? existingClinic.weekendWork ?? false,
          eveningWork: updates.eveningWork ?? existingClinic.eveningWork ?? false,
          urgentCare: updates.urgentCare ?? existingClinic.urgentCare ?? false,
          convenientLocation: updates.convenientLocation ?? existingClinic.convenientLocation ?? false,
          installmentPlan: updates.installmentPlan ?? existingClinic.installmentPlan ?? false,
          hasPromotions: updates.hasPromotions ?? existingClinic.hasPromotions ?? false,
          publishedPricing: updates.publishedPricing ?? existingClinic.publishedPricing ?? false,
          freeConsultation: updates.freeConsultation ?? existingClinic.freeConsultation ?? false,
          interestFreeInstallment: updates.interestFreeInstallment ?? existingClinic.interestFreeInstallment ?? false,
          implantWarranty: updates.implantWarranty ?? existingClinic.implantWarranty ?? false,
          popularServicesPromotions: updates.popularServicesPromotions ?? existingClinic.popularServicesPromotions ?? false,
          onlinePriceCalculator: updates.onlinePriceCalculator ?? existingClinic.onlinePriceCalculator ?? false,
        });

        
        updates.trustIndex = calculatedRatings.trustIndex;
        updates.accessIndex = calculatedRatings.accessIndex;
        updates.priceIndex = calculatedRatings.priceIndex;
        updates.dScore = calculatedRatings.dScore;
      }
      
      // Update slug if name changed
      if (updates.nameRu) {
        updates.slug = updates.nameRu.toLowerCase()
          .replace(/[а-яё]/g, (match) => {
            const translit: { [key: string]: string } = {
              'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
              'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
              'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
              'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
              'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
            };
            return translit[match] || match;
          })
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim()
          .replace(/^-+|-+$/g, '');
      }
      
      const updatedClinic = await storage.updateClinic(id, updates);
      
      // Update services if provided
      if (parsedUpdates.servicesRu !== undefined) {
        console.log('🔍 Updating RU services:', parsedUpdates.servicesRu);
        try {
          await storage.updateClinicServices(id, parsedUpdates.servicesRu, 'ru');
          console.log('✅ RU services updated successfully');
        } catch (error) {
          console.error('❌ Error updating RU services:', error);
        }
      }
      
      if (parsedUpdates.servicesRo !== undefined) {
        console.log('🔍 Updating RO services:', parsedUpdates.servicesRo);
        try {
          await storage.updateClinicServices(id, parsedUpdates.servicesRo, 'ro');
          console.log('✅ RO services updated successfully');
        } catch (error) {
          console.error('❌ Error updating RO services:', error);
        }
      }
      
      res.json(updatedClinic);
    } catch (error: any) {
      console.error('Error updating clinic:', error);
      res.status(400).json({ message: error.message || 'Ошибка при обновлении клиники' });
    }
  });

  // Delete clinic
  app.delete('/api/admin/clinics/:id', requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if clinic exists
      const existingClinic = await storage.getClinicById(id);
      if (!existingClinic) {
        return res.status(404).json({ message: 'Клиника не найдена' });
      }
      
      await storage.deleteClinic(id);
      res.json({ success: true, message: 'Клиника удалена' });
    } catch (error) {
      console.error('Error deleting clinic:', error);
      res.status(500).json({ message: 'Ошибка при удалении клиники' });
    }
  });

  // Get clinic services
  app.get('/api/admin/clinics/:id/services', requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { language } = req.query;
      
      // Check if clinic exists
      const existingClinic = await storage.getClinicById(id);
      if (!existingClinic) {
        return res.status(404).json({ message: 'Клиника не найдена' });
      }
      
      const services = await storage.getClinicServices(id, language as string);
      res.json(services);
    } catch (error) {
      console.error('Error fetching clinic services:', error);
      res.status(500).json({ message: 'Ошибка при получении услуг клиники' });
    }
  });

  // Update clinic services
  app.put('/api/admin/clinics/:id/services', requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      console.log('🔍 Updating services for clinic:', id);
      console.log('🔍 Request body:', JSON.stringify(req.body, null, 2));
      
      const serviceSchema = z.object({
        name: z.string().min(1, 'Название услуги обязательно'),
        price: z.number().min(1, 'Цена должна быть больше 0'),
        currency: z.string().default('MDL')
      });
      
      const servicesDataSchema = z.object({
        servicesRu: z.array(serviceSchema).default([]),
        servicesRo: z.array(serviceSchema).default([])
      });
      
      // Check if clinic exists
      const existingClinic = await storage.getClinicById(id);
      if (!existingClinic) {
        return res.status(404).json({ message: 'Клиника не найдена' });
      }
      
      console.log('🔍 Validating services data...');
      const validatedData = servicesDataSchema.parse(req.body);
      console.log('🔍 Validated data:', JSON.stringify(validatedData, null, 2));
      
      // Обновляем услуги для обоих языков
      console.log('🔍 Updating RU services...');
      await storage.updateClinicServices(id, validatedData.servicesRu, 'ru');
      console.log('🔍 Updating RO services...');
      await storage.updateClinicServices(id, validatedData.servicesRo, 'ro');
      
      console.log('🔍 Services updated successfully');
      res.json({ success: true, message: 'Услуги клиники обновлены' });
    } catch (error: any) {
      console.error('❌ Error updating clinic services:', error);
      if (error.name === 'ZodError') {
        console.error('❌ Zod validation error:', error.errors);
        return res.status(400).json({ message: 'Неверные данные услуг', details: error.errors });
      }
      res.status(500).json({ message: 'Ошибка при обновлении услуг клиники' });
    }
  });

  // Get clinic working hours
  app.get('/api/admin/clinics/:id/working-hours', requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if clinic exists
      const existingClinic = await storage.getClinicById(id);
      if (!existingClinic) {
        return res.status(404).json({ message: 'Клиника не найдена' });
      }
      
      const workingHours = await storage.getClinicWorkingHours(id);
      res.json(workingHours);
    } catch (error) {
      console.error('Error fetching clinic working hours:', error);
      res.status(500).json({ message: 'Ошибка при получении времени работы клиники' });
    }
  });

  // Update clinic working hours
  app.put('/api/admin/clinics/:id/working-hours', requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      console.log('🔍 Updating working hours for clinic:', id);
      console.log('🔍 Request body:', JSON.stringify(req.body, null, 2));
      
      const workingHoursSchema = z.array(z.object({
        dayOfWeek: z.number().min(0).max(6),
        isOpen: z.boolean(),
        openTime: z.string().optional(),
        closeTime: z.string().optional(),
        breakStartTime: z.string().optional(),
        breakEndTime: z.string().optional(),
        is24Hours: z.boolean().default(false)
      }));
      
      // Check if clinic exists
      const existingClinic = await storage.getClinicById(id);
      if (!existingClinic) {
        return res.status(404).json({ message: 'Клиника не найдена' });
      }
      
      console.log('🔍 Validating working hours data...');
      const validatedData = workingHoursSchema.parse(req.body);
      console.log('🔍 Validated data:', JSON.stringify(validatedData, null, 2));
      
      await storage.updateClinicWorkingHours(id, validatedData);
      
      console.log('🔍 Working hours updated successfully');
      res.json({ success: true, message: 'Время работы клиники обновлено' });
    } catch (error: any) {
      console.error('❌ Error updating clinic working hours:', error);
      if (error.name === 'ZodError') {
        console.error('❌ Zod validation error:', error.errors);
        return res.status(400).json({ message: 'Неверные данные времени работы', details: error.errors });
      }
      res.status(500).json({ message: 'Ошибка при обновлении времени работы клиники' });
    }
  });

  // Get admin statistics
  app.get('/api/admin/stats', requireAdminAuth, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      res.status(500).json({ message: 'Ошибка при получении статистики' });
    }
  });
  
  // Get recent clinics for admin dashboard
  app.get('/api/admin/recent-clinics', requireAdminAuth, async (req, res) => {
    try {
      const recentClinics = await storage.getRecentClinics(5);
      res.json(recentClinics);
    } catch (error) {
      console.error('Error fetching recent clinics:', error);
      res.status(500).json({ message: 'Ошибка при получении клиник' });
    }
  });

  // Get today's view statistics
  app.get('/api/admin/today-views', requireAdminAuth, async (req, res) => {
    try {
      const viewsCount = await storage.getTodayViews();
      res.json({ views: viewsCount });
    } catch (error) {
      console.error('Error fetching today views:', error);
      res.status(500).json({ message: 'Ошибка при получении статистики просмотров' });
    }
  });

  // Get subscription statistics for dashboard
  app.get('/api/admin/subscription-stats', requireAdminAuth, async (req, res) => {
    try {
      const subscriptionStats = await storage.getSubscriptionStats();
      res.json(subscriptionStats);
    } catch (error) {
      console.error('Error fetching subscription stats:', error);
      res.status(500).json({ message: 'Ошибка при получении статистики подписок' });
    }
  });

  // Settings endpoints
  app.get('/api/admin/settings', requireAdminAuth, async (req, res) => {
    try {
      const settings = await storage.getAllSiteSettings();
      console.log('🔧 Returning settings:', settings);
      res.json(settings);
    } catch (error) {
      console.error("Error getting settings:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post('/api/admin/settings', requireAdminAuth, async (req, res) => {
    try {
      console.log('🔧 Received settings request:', req.body);
        console.log('🔍 Logo data:', { logo: req.body.logo, logoAlt: req.body.logoAlt, LogoWidth_capital: req.body.LogoWidth, logoWidth_camel: req.body.logoWidth, logoWidth_lower: req.body.logowidth });
      console.log('🔍 All request body keys:', Object.keys(req.body));
      console.log('🔍 LogoWidth_capital type:', typeof req.body.LogoWidth, 'value:', req.body.LogoWidth);
      console.log('🔍 logoWidth_camel type:', typeof req.body.logoWidth, 'value:', req.body.logoWidth);
      console.log('🔍 logoWidth_lower type:', typeof req.body.logowidth, 'value:', req.body.logowidth);
      const {
        // Russian SEO settings
        siteTitleRu, metaDescriptionRu, keywordsRu, ogTitleRu, ogDescriptionRu, ogImageRu, canonicalRu, h1Ru,
        // Romanian SEO settings
        siteTitleRo, metaDescriptionRo, keywordsRo, ogTitleRo, ogDescriptionRo, ogImageRo, canonicalRo, h1Ro,
        // Common settings
        robotsTxt, robots, schemaType, schemaData
      } = req.body;
      
      // Save each setting individually
      const promises = [];
      
      // Russian settings
      if (siteTitleRu !== undefined) promises.push(storage.setSiteSetting('siteTitleRu', siteTitleRu));
      if (metaDescriptionRu !== undefined) promises.push(storage.setSiteSetting('metaDescriptionRu', metaDescriptionRu));
      if (keywordsRu !== undefined) promises.push(storage.setSiteSetting('keywordsRu', keywordsRu));
      if (ogTitleRu !== undefined) promises.push(storage.setSiteSetting('ogTitleRu', ogTitleRu));
      if (ogDescriptionRu !== undefined) promises.push(storage.setSiteSetting('ogDescriptionRu', ogDescriptionRu));
      if (ogImageRu !== undefined) promises.push(storage.setSiteSetting('ogImageRu', ogImageRu));
      if (canonicalRu !== undefined) promises.push(storage.setSiteSetting('canonicalRu', canonicalRu));
      if (h1Ru !== undefined) promises.push(storage.setSiteSetting('h1Ru', h1Ru));
      
      // Romanian settings
      if (siteTitleRo !== undefined) promises.push(storage.setSiteSetting('siteTitleRo', siteTitleRo));
      if (metaDescriptionRo !== undefined) promises.push(storage.setSiteSetting('metaDescriptionRo', metaDescriptionRo));
      if (keywordsRo !== undefined) promises.push(storage.setSiteSetting('keywordsRo', keywordsRo));
      if (ogTitleRo !== undefined) promises.push(storage.setSiteSetting('ogTitleRo', ogTitleRo));
      if (ogDescriptionRo !== undefined) promises.push(storage.setSiteSetting('ogDescriptionRo', ogDescriptionRo));
      if (ogImageRo !== undefined) promises.push(storage.setSiteSetting('ogImageRo', ogImageRo));
      if (canonicalRo !== undefined) promises.push(storage.setSiteSetting('canonicalRo', canonicalRo));
      if (h1Ro !== undefined) promises.push(storage.setSiteSetting('h1Ro', h1Ro));
      
      // Common settings
      if (robotsTxt !== undefined) promises.push(storage.setSiteSetting('robotsTxt', robotsTxt));
      if (robots !== undefined) promises.push(storage.setSiteSetting('robots', robots));
      if (schemaType !== undefined) promises.push(storage.setSiteSetting('schemaType', schemaType));
      if (schemaData !== undefined) promises.push(storage.setSiteSetting('schemaData', schemaData));
      
      // General settings
      if (req.body.logo !== undefined) {
        console.log('🔧 Saving logo:', req.body.logo);
        promises.push(storage.setSiteSetting('logo', req.body.logo));
      }
      if (req.body.logoAlt !== undefined) {
        console.log('🔧 Saving logoAlt:', req.body.logoAlt);
        promises.push(storage.setSiteSetting('logoAlt', req.body.logoAlt));
      }
      if (req.body.LogoWidth !== undefined) {
        console.log('🔧 Saving logoWidth (from LogoWidth):', req.body.LogoWidth);
        promises.push(storage.setSiteSetting('logoWidth', req.body.LogoWidth));
      } else if (req.body.logoWidth !== undefined) {
        console.log('🔧 Saving logoWidth (from camelCase):', req.body.logoWidth);
        promises.push(storage.setSiteSetting('logoWidth', req.body.logoWidth));
      } else if (req.body.logowidth !== undefined) {
        console.log('🔧 Saving logoWidth (from lowercase):', req.body.logowidth);
        promises.push(storage.setSiteSetting('logoWidth', req.body.logowidth));
      }
      if (req.body.favicon !== undefined) promises.push(storage.setSiteSetting('favicon', req.body.favicon));
      if (req.body.websiteName !== undefined) promises.push(storage.setSiteSetting('websiteName', req.body.websiteName));
      if (req.body.websiteUrl !== undefined) promises.push(storage.setSiteSetting('websiteUrl', req.body.websiteUrl));
      if (req.body.organizationName !== undefined) promises.push(storage.setSiteSetting('organizationName', req.body.organizationName));
      if (req.body.organizationDescription !== undefined) promises.push(storage.setSiteSetting('organizationDescription', req.body.organizationDescription));
      if (req.body.organizationUrl !== undefined) promises.push(storage.setSiteSetting('organizationUrl', req.body.organizationUrl));
      if (req.body.organizationCity !== undefined) promises.push(storage.setSiteSetting('organizationCity', req.body.organizationCity));
      if (req.body.organizationCountry !== undefined) promises.push(storage.setSiteSetting('organizationCountry', req.body.organizationCountry));
      if (req.body.businessType !== undefined) promises.push(storage.setSiteSetting('businessType', req.body.businessType));
      if (req.body.businessPriceRange !== undefined) promises.push(storage.setSiteSetting('businessPriceRange', req.body.businessPriceRange));
      if (req.body.businessOpeningHours !== undefined) promises.push(storage.setSiteSetting('businessOpeningHours', req.body.businessOpeningHours));
      
      // Security settings
      if (req.body.adminAccessCode !== undefined) promises.push(storage.setSiteSetting('adminAccessCode', req.body.adminAccessCode));
      
      await Promise.all(promises);
      console.log('✅ All settings saved successfully');
      console.log('🔧 Saved settings count:', promises.length);
      
      // Create robots.txt file in public directory
      if (robotsTxt !== undefined) {
        const publicDir = path.join(process.cwd(), 'public');
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true });
        }
        fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt);
        console.log('✅ robots.txt file created');
      }
      
      res.json({ message: 'Settings saved successfully' });
    } catch (error) {
      console.error("Error saving settings:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Upload endpoint for admin files
  app.post('/api/admin/upload', requireAdminAuth, (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({ message: 'File upload error: ' + err.message });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const fileType = req.body.type || 'general';
      const fileUrl = `/images/${req.file.filename}`;
      
      console.log(`📁 File uploaded: ${req.file.filename}, type: ${fileType}, size: ${req.file.size}`);
      
      res.json({
        success: true,
        filename: req.file.filename,
        url: fileUrl,
        size: req.file.size,
        type: fileType
      });
    });
  });

  // Serve robots.txt
  app.get('/robots.txt', (req, res) => {
    const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');
    if (fs.existsSync(robotsPath)) {
      res.sendFile(robotsPath);
    } else {
      // Default robots.txt if file doesn't exist
      res.type('text/plain');
      res.send('User-agent: *\nDisallow: /admin\nDisallow: /api\n');
    }
  });

  // Serve browserconfig.xml for Windows/Microsoft Edge
  app.get('/browserconfig.xml', (req, res) => {
    const browserconfigPath = path.join(process.cwd(), 'public', 'browserconfig.xml');
    if (fs.existsSync(browserconfigPath)) {
      res.setHeader('Content-Type', 'application/xml');
      res.sendFile(browserconfigPath);
    } else {
      res.status(404).send('browserconfig.xml not found');
    }
  });

  // API endpoint to get SEO settings for frontend
  app.get('/api/seo-settings', async (req, res) => {
    try {
      const settings = await storage.getAllSiteSettings();
      const settingsMap = settings.reduce((acc: any, setting: any) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});
      
      res.json({
        // Russian SEO settings
        siteTitleRu: settingsMap.siteTitleRu || 'Dent Moldova - Каталог стоматологических клиник',
        metaDescriptionRu: settingsMap.metaDescriptionRu || 'Найдите лучшую стоматологическую клинику в Молдове. Каталог проверенных клиник с ценами, отзывами и рейтингами.',
        keywordsRu: settingsMap.keywordsRu || 'стоматология, стоматолог, лечение зубов, клиника, Молдова, Кишинёв',
        ogTitleRu: settingsMap.ogTitleRu || 'Dent Moldova - Каталог стоматологических клиник',
        ogDescriptionRu: settingsMap.ogDescriptionRu || 'Найдите лучшие стоматологические клиники в Молдове',
        ogImageRu: settingsMap.ogImageRu || '',
        canonicalRu: settingsMap.canonicalRu || 'https://dentmoldova.md',
        h1Ru: settingsMap.h1Ru || 'Каталог стоматологических клиник в Молдове',
        
        // Romanian SEO settings
        siteTitleRo: settingsMap.siteTitleRo || 'Dent Moldova - Catalogul clinicilor stomatologice',
        metaDescriptionRo: settingsMap.metaDescriptionRo || 'Găsiți cea mai bună clinică stomatologică din Moldova. Catalogul clinicilor verificate cu prețuri, recenzii și evaluări.',
        keywordsRo: settingsMap.keywordsRo || 'stomatologie, dentist, tratament dentar, clinică, Moldova, Chișinău',
        ogTitleRo: settingsMap.ogTitleRo || 'Dent Moldova - Catalogul clinicilor stomatologice',
        ogDescriptionRo: settingsMap.ogDescriptionRo || 'Găsiți cele mai bune clinici stomatologice din Moldova',
        ogImageRo: settingsMap.ogImageRo || '',
        canonicalRo: settingsMap.canonicalRo || 'https://dentmoldova.md/ro',
        h1Ro: settingsMap.h1Ro || 'Catalogul clinicilor stomatologice din Moldova',
        
        // Common settings
        robots: settingsMap.robots || 'index,follow',
        schemaType: settingsMap.schemaType || 'Organization',
        schemaData: settingsMap.schemaData || '',
        logo: settingsMap.logo || '',
        logoAlt: settingsMap.logoAlt || 'Dent Moldova',
        logoWidth: settingsMap.logoWidth || '100',
      });
    } catch (error) {
      console.error("Error getting SEO settings:", error);
      res.json({
        // Russian defaults
        siteTitleRu: 'Dent Moldova - Каталог стоматологических клиник',
        metaDescriptionRu: 'Найдите лучшую стоматологическую клинику в Молдове. Каталог проверенных клиник с ценами, отзывами и рейтингами.',
        keywordsRu: 'стоматология, стоматолог, лечение зубов, клиника, Молдова, Кишинёв',
        ogTitleRu: 'Dent Moldova - Каталог стоматологических клиник',
        ogDescriptionRu: 'Найдите лучшие стоматологические клиники в Молдове',
        ogImageRu: '',
        canonicalRu: 'https://dentmoldova.md',
        h1Ru: 'Каталог стоматологических клиник в Молдове',
        
        // Romanian defaults
        siteTitleRo: 'Dent Moldova - Catalogul clinicilor stomatologice',
        metaDescriptionRo: 'Găsiți cea mai bună clinică stomatologică din Moldova. Catalogul clinicilor verificate cu prețuri, recenzii și evaluări.',
        keywordsRo: 'stomatologie, dentist, tratament dentar, clinică, Moldova, Chișinău',
        ogTitleRo: 'Dent Moldova - Catalogul clinicilor stomatologice',
        ogDescriptionRo: 'Găsiți cele mai bune clinici stomatologice din Moldova',
        ogImageRo: '',
        canonicalRo: 'https://dentmoldova.md/ro',
        h1Ro: 'Catalogul clinicilor stomatologice din Moldova',
        
        // Common defaults
        robots: 'index,follow',
        schemaType: 'Organization',
        schemaData: '',
        logo: '',
        logoAlt: 'Dent Moldova',
        logoWidth: '100',
      });
    }
  });

  // Booking endpoints
  app.post('/api/bookings', async (req, res) => {
    try {
      const { clinicId, firstName, phone, email, contactMethod, service, preferredDate, preferredTime, notes } = req.body;
      
      console.log('Received booking data:', { clinicId, firstName, phone, email, contactMethod, service, preferredDate, preferredTime, notes });
      
      // Validate required fields
      if (!clinicId || !firstName || !phone || !service || !preferredDate || !preferredTime) {
        return res.status(400).json({ message: 'Отсутствуют обязательные поля' });
      }

      const bookingData = {
        clinicId,
        firstName,
        phone,
        email: email || null,
        contactMethod: contactMethod || null,
        service,
        preferredDate,
        preferredTime,
        notes: notes || null,
      };

      console.log('Saving booking data:', bookingData);

      const booking = await storage.createBooking(bookingData);
      res.json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Ошибка при создании заявки" });
    }
  });

  // Admin cities management
  app.get('/api/admin/cities', requireAdminAuth, async (req, res) => {
    try {
      const { q } = req.query;
      const cities = await storage.getCitiesWithDistricts(q as string);
      res.json({ cities });
    } catch (error) {
      console.error("Error fetching cities:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post('/api/admin/cities', requireAdminAuth, async (req, res) => {
    try {
      const { nameRu, nameRo } = req.body;
      
      if (!nameRu || !nameRo) {
        return res.status(400).json({ message: 'Названия на обоих языках обязательны' });
      }

      const city = await storage.createCity({ nameRu, nameRo });
      res.json(city);
    } catch (error) {
      console.error("Error creating city:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put('/api/admin/cities/:id', requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { nameRu, nameRo } = req.body;
      
      if (!nameRu || !nameRo) {
        return res.status(400).json({ message: 'Названия на обоих языках обязательны' });
      }

      const city = await storage.updateCity(id, { nameRu, nameRo });
      res.json(city);
    } catch (error) {
      console.error("Error updating city:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put('/api/admin/cities/:id/sort-order', requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { sortOrder } = req.body;
      
      if (typeof sortOrder !== 'number') {
        return res.status(400).json({ message: 'sortOrder должен быть числом' });
      }

      const city = await storage.updateCitySortOrder(id, sortOrder);
      res.json(city);
    } catch (error) {
      console.error("Error updating city sort order:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete('/api/admin/cities/:id', requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCity(id);
      res.json({ message: 'Город успешно удален' });
    } catch (error) {
      console.error("Error deleting city:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin districts management
  app.get('/api/admin/cities/:cityId/districts', requireAdminAuth, async (req, res) => {
    try {
      const { cityId } = req.params;
      const districts = await storage.getDistrictsByCity(cityId);
      res.json({ districts });
    } catch (error) {
      console.error("Error fetching districts:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post('/api/admin/cities/:cityId/districts', requireAdminAuth, async (req, res) => {
    try {
      const { cityId } = req.params;
      const { nameRu, nameRo } = req.body;
      
      if (!nameRu || !nameRo) {
        return res.status(400).json({ message: 'Названия на обоих языках обязательны' });
      }

      const district = await storage.createDistrict({ cityId, nameRu, nameRo });
      res.json(district);
    } catch (error) {
      console.error("Error creating district:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put('/api/admin/districts/:id', requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { nameRu, nameRo } = req.body;
      
      if (!nameRu || !nameRo) {
        return res.status(400).json({ message: 'Названия на обоих языках обязательны' });
      }

      const district = await storage.updateDistrict(id, { nameRu, nameRo });
      res.json(district);
    } catch (error) {
      console.error("Error updating district:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete('/api/admin/districts/:id', requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteDistrict(id);
      res.json({ message: 'Район успешно удален' });
    } catch (error) {
      console.error("Error deleting district:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin booking management
  app.get('/api/admin/bookings', requireAdminAuth, async (req, res) => {
    try {
      const bookings = await storage.getBookings();
      res.json({ bookings });
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Ошибка при получении заявок" });
    }
  });

  app.get('/api/admin/bookings/:id', requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const booking = await storage.getBookingById(id);
      
      if (!booking) {
        return res.status(404).json({ message: "Заявка не найдена" });
      }
      
      res.json(booking);
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ message: "Ошибка при получении заявки" });
    }
  });

  app.put('/api/admin/bookings/:id/status', requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Статус обязателен" });
      }
      
      const booking = await storage.updateBookingStatus(id, status);
      res.json(booking);
    } catch (error) {
      console.error("Error updating booking status:", error);
      res.status(500).json({ message: "Ошибка при обновлении статуса заявки" });
    }
  });

  // Delete single booking
  app.delete('/api/admin/bookings/:id', requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteBooking(id);
      res.json({ message: 'Заявка успешно удалена' });
    } catch (error) {
      console.error("Error deleting booking:", error);
      res.status(500).json({ message: "Ошибка при удалении заявки" });
    }
  });

  // Delete multiple bookings
  app.delete('/api/admin/bookings/multiple', requireAdminAuth, async (req, res) => {
    try {
      const { bookingIds } = req.body;
      
      if (!bookingIds || !Array.isArray(bookingIds) || bookingIds.length === 0) {
        return res.status(400).json({ message: "Список ID заявок обязателен" });
      }
      
      await storage.deleteMultipleBookings(bookingIds);
      res.json({ message: `${bookingIds.length} заявок успешно удалено` });
    } catch (error) {
      console.error("Error deleting multiple bookings:", error);
      res.status(500).json({ message: "Ошибка при удалении заявок" });
    }
  });

  // Record a view (middleware for tracking)
  const recordViewMiddleware = async (req: any, res: any, next: any) => {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || '';
      const route = req.path;
      
      // Extract clinic ID if it's a clinic page
      let clinicId = null;
      if (route.includes('/clinic/')) {
        const slug = route.split('/clinic/')[1];
        if (slug) {
          const clinic = await storage.getClinicBySlug(slug);
          clinicId = clinic?.id || null;
        }
      } else if (route.includes('/api/clinics/')) {
        // For API routes like /api/clinics/:id
        const clinicIdFromRoute = route.split('/api/clinics/')[1];
        if (clinicIdFromRoute && clinicIdFromRoute !== '') {
          clinicId = clinicIdFromRoute;
        }
      }
      
      // Record the view asynchronously (don't block the response)
      storage.recordView({
        ipAddress,
        userAgent,
        route,
        clinicId,
      }).catch(error => console.error('Error recording view:', error));
      
    } catch (error) {
      console.error('Error in view tracking middleware:', error);
    }
    next();
  };

  // ===== PUBLIC ROUTES (existing) =====
  // Get cities
  app.get("/api/cities", async (req, res) => {
    try {
      const cities = await storage.getCities();
      res.json(cities);
    } catch (error) {
      console.error("Error fetching cities:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get districts by city
  app.get("/api/cities/:cityId/districts", async (req, res) => {
    try {
      const { cityId } = req.params;
      const districts = await storage.getDistrictsByCity(cityId);
      res.json(districts);
    } catch (error) {
      console.error("Error fetching districts:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get price range
  app.get("/api/price-range", async (req, res) => {
    try {
      const priceRange = await storage.getPriceRange();
      res.json(priceRange);
    } catch (error) {
      console.error("Error fetching price range:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Add view tracking middleware for all public routes
  app.use('/api/clinics', recordViewMiddleware);
  app.use('/clinic', recordViewMiddleware);
  
  // Get recommended clinics for the homepage
  app.get("/api/recommended-clinics", async (req, res) => {
    try {
      const recommendedClinics = await storage.getRecommendedClinics();
      res.json({ clinics: recommendedClinics });
    } catch (error) {
      console.error("Error fetching recommended clinics:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get verified clinics count
  app.get("/api/active-clinics-count", async (req, res) => {
    try {
      const verifiedClinics = await db
        .select({ count: sql`count(*)` })
        .from(clinics)
        .where(eq(clinics.verified, true));
      
      const count = verifiedClinics[0]?.count || 0;
      console.log(`📊 Verified clinics count: ${count}`);
      
      res.json({ count: Number(count) });
    } catch (error) {
      console.error("Error fetching active clinics count:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Test endpoint for debugging open now filter
  app.get("/api/test-open-now", async (req, res) => {
    try {
      const now = new Date();
      const currentDay = now.getDay();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      // Get all clinics with working hours
      const result = await storage.getClinics({});
      
      const openClinics = result.clinics.filter(clinic => {
        const todayHours = clinic.workingHours.find(wh => wh.dayOfWeek === currentDay);
        
        if (!todayHours || !todayHours.isOpen) {
          return false;
        }
        
        if (todayHours.is24Hours) {
          return true;
        }
        
        if (todayHours.openTime && todayHours.closeTime) {
          const timeToMinutes = (timeStr: string) => {
            const [hours, minutes] = timeStr.split(':').map(Number);
            return hours * 60 + minutes;
          };
          
          const currentMinutes = timeToMinutes(currentTime);
          const openMinutes = timeToMinutes(todayHours.openTime);
          const closeMinutes = timeToMinutes(todayHours.closeTime);
          
          if (closeMinutes > openMinutes) {
            return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
          } else {
            return currentMinutes >= openMinutes || currentMinutes <= closeMinutes;
          }
        }
        
        return false;
      });
      
      res.json({
        currentDay,
        currentTime,
        totalClinics: result.clinics.length,
        openClinics: openClinics.length,
        openClinicsList: openClinics.map(c => ({
          name: c.nameRu,
          workingHours: c.workingHours.filter(wh => wh.dayOfWeek === currentDay)
        }))
      });
    } catch (error) {
      console.error("Error testing open now filter:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get clinics with filters
  app.get("/api/clinics", async (req, res) => {
    try {
      const querySchema = z.object({
        q: z.string().optional(),
        city: z.string().optional(),
        districts: z.union([z.string(), z.array(z.string())]).optional().transform(val => 
          typeof val === 'string' ? [val] : val
        ),
        features: z.union([z.string(), z.array(z.string())]).optional().transform(val => 
          typeof val === 'string' ? [val] : val
        ),
        promotionalLabels: z.union([z.string(), z.array(z.string())]).optional().transform(val => 
          typeof val === 'string' ? [val] : val
        ),
        specializations: z.union([z.string(), z.array(z.string())]).optional().transform(val => 
          typeof val === 'string' ? [val] : val
        ),
        languages: z.union([z.string(), z.array(z.string())]).optional().transform(val => 
          typeof val === 'string' ? [val] : val
        ),
        verified: z.string().optional().transform(val => val === 'true'),
        openNow: z.string().optional().transform(val => val === 'true'),
        urgentToday: z.string().optional().transform(val => val === 'true'),
        priceMin: z.string().optional().transform(val => val ? parseInt(val) : undefined),
        priceMax: z.string().optional().transform(val => val ? parseInt(val) : undefined),
        sort: z.enum(['dscore', 'price', 'popularity', 'reviews']).optional(),
        page: z.string().optional().transform(val => val ? parseInt(val) : 1),
        limit: z.string().optional().transform(val => val ? parseInt(val) : 12),
        language: z.string().optional().default('ru'),
      });

      const filters = querySchema.parse(req.query);
      console.log('🔍 API /api/clinics filters:', filters);
      console.log('🔍 API /api/clinics openNow filter:', filters.openNow);
      const result = await storage.getClinics(filters);
      console.log(`📊 API /api/clinics result: ${result.clinics.length} clinics`);
      
      res.json(result);
    } catch (error) {
      console.error("Error fetching clinics:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get clinic by slug
  app.get("/api/clinics/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const { language = 'ru' } = req.query;
      console.log(`🔍 Fetching clinic by slug: ${slug}, language: ${language}`);
      
      const clinic = await storage.getClinicBySlug(slug, language as string);
      
      if (!clinic) {
        console.log(`❌ Clinic not found: ${slug}`);
        return res.status(404).json({ message: "Clinic not found" });
      }
      
      console.log(`✅ Clinic found: ${clinic.nameRu}`);
      console.log(`📊 Services count: ${clinic.services.length}`);
      console.log(`📊 SEO data:`, {
        seoTitle: clinic.seoTitle,
        seoDescription: clinic.seoDescription,
        seoKeywords: clinic.seoKeywords,
        seoH1: clinic.seoH1,
        ogTitle: clinic.ogTitle,
        ogDescription: clinic.ogDescription,
        ogImage: clinic.ogImage,
        seoCanonical: clinic.seoCanonical,
        seoRobots: clinic.seoRobots,
        seoSchemaType: clinic.seoSchemaType,
        seoSchemaData: clinic.seoSchemaData
      });
      
      res.json(clinic);
    } catch (error) {
      console.error("Error fetching clinic:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get clinic services (public endpoint)
  app.get("/api/clinics/:id/services", async (req, res) => {
    try {
      const { id } = req.params;
      const { language = 'ru' } = req.query;
      console.log('🔍 GET /api/clinics/:id/services - clinic ID:', id, 'language:', language);
      
      // Check if clinic exists
      const existingClinic = await storage.getClinicById(id);
      if (!existingClinic) {
        console.log('❌ Clinic not found:', id);
        return res.status(404).json({ message: 'Клиника не найдена' });
      }
      
      console.log('✅ Clinic found:', existingClinic.nameRu);
      const services = await storage.getClinicServices(id, language as string);
      console.log('📊 Services found:', services.length);
      res.json(services);
    } catch (error) {
      console.error('❌ Error fetching clinic services:', error);
      res.status(500).json({ message: 'Ошибка при получении услуг клиники' });
    }
  });

  // Get clinic working hours (public endpoint)
  app.get("/api/clinics/:id/working-hours", async (req, res) => {
    try {
      const { id } = req.params;
      console.log('🔍 GET /api/clinics/:id/working-hours - clinic ID:', id);
      
      // Check if clinic exists
      const existingClinic = await storage.getClinicById(id);
      if (!existingClinic) {
        console.log('❌ Clinic not found:', id);
        return res.status(404).json({ message: 'Клиника не найдена' });
      }
      
      console.log('✅ Clinic found:', existingClinic.nameRu);
      const workingHours = await storage.getClinicWorkingHours(id);
      console.log('📊 Working hours found:', workingHours.length);
      res.json(workingHours);
    } catch (error) {
      console.error('❌ Error fetching clinic working hours:', error);
      res.status(500).json({ message: 'Ошибка при получении рабочих часов клиники' });
    }
  });

  // Get last data update date
  app.get("/api/last-update", async (req, res) => {
    try {
      const setting = await storage.getSiteSetting('last_data_update');
      const lastUpdate = setting?.value || new Date().toISOString();
      res.json({ lastUpdate });
    } catch (error) {
      console.error("Error fetching last update date:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Analytics endpoints
  app.post('/api/analytics/event', async (req, res) => {
    try {
      const { clinicId, eventType } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'];
      const referrer = req.headers.referer;

      await storage.recordAnalyticsEvent({
        clinicId,
        eventType,
        ipAddress,
        userAgent,
        referrer,
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Error recording analytics event:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/admin/statistics', requireAdminAuth, async (req, res) => {
    try {
      const { period = '7d', clinic } = req.query;
      console.log(`GET /api/admin/statistics - period: ${period}, clinic: ${clinic}`);
      const stats = await storage.getAnalyticsStats(period as string, clinic as string);
      const uniqueVisitors = await storage.getUniqueVisitorsForPeriod(period as string);
      
      // Добавляем количество уникальных посетителей к статистике
      const statsWithVisitors = {
        ...stats,
        overall: {
          ...stats.overall,
          uniqueVisitors
        }
      };
      
      console.log(`GET /api/admin/statistics - returning stats with ${stats.overall.totalClicks} total clicks and ${uniqueVisitors} unique visitors`);
      res.json(statsWithVisitors);
    } catch (error) {
      console.error('Error getting analytics stats:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.delete('/api/admin/statistics', requireAdminAuth, async (req, res) => {
    try {
      console.log('DELETE /api/admin/statistics - Clearing statistics...');
      await storage.clearAnalyticsStats();
      console.log('DELETE /api/admin/statistics - Statistics cleared successfully');
      res.json({ message: 'Статистика успешно очищена' });
    } catch (error) {
      console.error('Error clearing analytics stats:', error);
      res.status(500).json({ message: 'Ошибка при очистке статистики' });
    }
  });

  // ===== CONVERSION ANALYTICS ROUTES =====
  app.get('/api/admin/conversions', requireAdminAuth, async (req, res) => {
    try {
      const { period = '7d' } = req.query;
      console.log(`GET /api/admin/conversions - period: ${period}`);
      const conversionStats = await storage.getConversionStats(period as string);
      console.log(`GET /api/admin/conversions - returning conversion stats with ${conversionStats.overallConversion.totalUniqueVisitors} unique visitors and ${conversionStats.overallConversion.totalBookings} bookings`);
      res.json(conversionStats);
    } catch (error) {
      console.error('Error getting conversion stats:', error);
      res.status(500).json({ message: 'Ошибка при получении статистики конверсий' });
    }
  });

  // ===== VERIFICATION REQUESTS ROUTES =====
  
  // Create verification request (public)
  app.post('/api/verification-requests', async (req, res) => {
    try {
      const { clinicId, clinicName, clinicAddress, requesterEmail, requesterPhone } = req.body;
      
      if (!clinicId || !clinicName || !requesterEmail || !requesterPhone) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const request = await storage.createVerificationRequest({
        clinicId,
        clinicName,
        clinicAddress,
        requesterEmail,
        requesterPhone
      });
      
      res.json({ success: true, request });
    } catch (error) {
      console.error('Error creating verification request:', error);
      res.status(500).json({ error: 'Failed to create verification request' });
    }
  });

  // Get verification requests (admin)
  app.get('/api/admin/verification-requests', requireAdminAuth, async (req, res) => {
    try {
      const { status, page = 1, limit = 50 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);
      
      const result = await storage.getVerificationRequests({
        status: status as string,
        limit: Number(limit),
        offset
      });
      
      res.json(result);
    } catch (error) {
      console.error('Error getting verification requests:', error);
      res.status(500).json({ error: 'Failed to get verification requests' });
    }
  });

  // Get single verification request (admin)
  app.get('/api/admin/verification-requests/:id', requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const request = await storage.getVerificationRequestById(id);
      
      if (!request) {
        return res.status(404).json({ error: 'Verification request not found' });
      }
      
      res.json(request);
    } catch (error) {
      console.error('Error getting verification request:', error);
      res.status(500).json({ error: 'Failed to get verification request' });
    }
  });

  // Update verification request status (admin)
  app.put('/api/admin/verification-requests/:id/status', requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      
      if (!status || !['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      
      const request = await storage.updateVerificationRequestStatus(id, status, notes);
      res.json({ success: true, request });
    } catch (error) {
      console.error('Error updating verification request status:', error);
      res.status(500).json({ error: 'Failed to update verification request status' });
    }
  });

  // Delete verification request (admin)
  app.delete('/api/admin/verification-requests/:id', requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      console.log('🗑️ DELETE request received for verification request:', id);
      
      await storage.deleteVerificationRequest(id);
      console.log('✅ Verification request deleted successfully on server');
      res.json({ success: true, message: 'Verification request deleted successfully' });
    } catch (error) {
      console.error('❌ Error deleting verification request:', error);
      res.status(500).json({ error: 'Failed to delete verification request' });
    }
  });

  // Get pending verification count (admin)
  app.get('/api/admin/pending-verification-count', requireAdminAuth, async (req, res) => {
    try {
      const count = await storage.getPendingVerificationCount();
      res.json({ count });
    } catch (error) {
      console.error('Error getting pending verification count:', error);
      res.status(500).json({ error: 'Failed to get pending verification count' });
    }
  });

  // Create new clinic request (public)
  app.post('/api/new-clinic-requests', async (req, res) => {
    try {
      const { clinicName, contactEmail, contactPhone, city, address, website, specializations, description, workingHours } = req.body;
      
      console.log('🔍 Received new clinic request data:', {
        clinicName, contactEmail, contactPhone, city, address, website, specializations, description, workingHours
      });
      
      if (!clinicName || !contactPhone) {
        return res.status(400).json({ error: 'Missing required fields: clinicName and contactPhone are required' });
      }
      
      // Обрабатываем specializations - если пустой массив, то null
      const processedSpecializations = specializations && specializations.length > 0 ? specializations : null;
      
      const request = await storage.createNewClinicRequest({
        clinicName,
        contactEmail,
        contactPhone,
        city,
        address,
        website: website || null,
        specializations: processedSpecializations,
        description,
        workingHours: workingHours || null
      });
      
      res.json({ success: true, request });
    } catch (error) {
      console.error('Error creating new clinic request:', error);
      res.status(500).json({ error: 'Failed to create new clinic request' });
    }
  });

  // Get new clinic requests (admin)
  app.get('/api/admin/new-clinic-requests', requireAdminAuth, async (req, res) => {
    try {
      const { status, page = 1, limit = 50 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);
      
      const result = await storage.getNewClinicRequests({
        status: status as string,
        limit: Number(limit),
        offset
      });
      
      res.json(result);
    } catch (error) {
      console.error('Error getting new clinic requests:', error);
      res.status(500).json({ error: 'Failed to get new clinic requests' });
    }
  });

  // Get single new clinic request (admin)
  app.get('/api/admin/new-clinic-requests/:id', requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const request = await storage.getNewClinicRequestById(id);
      
      if (!request) {
        return res.status(404).json({ error: 'New clinic request not found' });
      }
      
      res.json(request);
    } catch (error) {
      console.error('Error getting new clinic request:', error);
      res.status(500).json({ error: 'Failed to get new clinic request' });
    }
  });

  // Update new clinic request status (admin)
  app.put('/api/admin/new-clinic-requests/:id/status', requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      
      if (!status || !['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      
      const request = await storage.updateNewClinicRequestStatus(id, status, notes);
      res.json({ success: true, request });
    } catch (error) {
      console.error('Error updating new clinic request status:', error);
      res.status(500).json({ error: 'Failed to update new clinic request status' });
    }
  });

  // Delete new clinic request (admin)
  app.delete('/api/admin/new-clinic-requests/:id', requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      console.log('🗑️ DELETE request received for new clinic request:', id);
      
      await storage.deleteNewClinicRequest(id);
      console.log('✅ New clinic request deleted successfully on server');
      res.json({ success: true, message: 'New clinic request deleted successfully' });
    } catch (error) {
      console.error('❌ Error deleting new clinic request:', error);
      res.status(500).json({ error: 'Failed to delete new clinic request' });
    }
  });

  // Get pending new clinic count (admin)
  app.get('/api/admin/pending-new-clinic-count', requireAdminAuth, async (req, res) => {
    try {
      const count = await storage.getPendingNewClinicCount();
      res.json({ count });
    } catch (error) {
      console.error('Error getting pending new clinic count:', error);
      res.status(500).json({ error: 'Failed to get pending new clinic count' });
    }
  });

  // Test route to check database connection
  app.get('/api/test-db', async (req, res) => {
    try {
      // Простой запрос для проверки подключения
      const cities = await storage.getCities();
      res.json({ 
        success: true, 
        message: 'Database connection working',
        citiesCount: cities.length,
        sampleCity: cities[0]
      });
    } catch (error) {
      console.error('Database test error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message,
        stack: error.stack 
      });
    }
  });

  // Test route to check clinics
  app.get('/api/test-clinics', async (req, res) => {
    try {
      // Простой запрос для проверки клиник без сложной логики
      const clinics = await db.select().from(clinics).limit(5);
      res.json({ 
        success: true, 
        message: 'Clinics query working',
        clinicsCount: clinics.length,
        sampleClinic: clinics[0]
      });
    } catch (error) {
      console.error('Clinics test error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message,
        stack: error.stack 
      });
    }
  });

  // Simple clinics test without JSON parsing
  app.get('/api/simple-clinics', async (req, res) => {
    try {
      // Простой запрос без сложной логики и JSON парсинга
      const result = await db.execute(sql`SELECT id, name_ru, name_ro, city_id FROM clinics LIMIT 5`);
      res.json({ 
        success: true, 
        message: 'Simple clinics query working',
        clinicsCount: result.length,
        sampleClinic: result[0]
      });
    } catch (error) {
      console.error('Simple clinics test error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message,
        stack: error.stack 
      });
    }
  });

  // Raw clinics test - direct SQL query
  app.get('/api/raw-clinics', async (req, res) => {
    try {
      // Прямой SQL запрос для получения клиник
      const result = await db.execute(sql`SELECT id, name_ru, name_ro, city_id, verified FROM clinics ORDER BY verified DESC, name_ru LIMIT 10`);
      res.json({ 
        success: true, 
        message: 'Raw clinics query working',
        clinicsCount: result.length,
        clinics: result
      });
    } catch (error) {
      console.error('Raw clinics test error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message,
        stack: error.stack 
      });
    }
  });

  // ===== REVIEWS API =====
  
  // Submit a new review
  app.post('/api/reviews', async (req, res) => {
    try {
      const {
        clinicId,
        authorName,
        authorEmail,
        authorPhone,
        qualityRating,
        serviceRating,
        comfortRating,
        priceRating,
        averageRating,
        comment
      } = req.body;

      // Validate required fields
      if (!clinicId || !qualityRating || !serviceRating || !comfortRating || !priceRating || !averageRating) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Validate ratings (1-5)
      const ratings = [qualityRating, serviceRating, comfortRating, priceRating, averageRating];
      for (const rating of ratings) {
        if (rating < 1 || rating > 5) {
          return res.status(400).json({ message: 'Ratings must be between 1 and 5' });
        }
      }

      // Check if clinic exists
      const [clinic] = await db.select().from(clinics).where(eq(clinics.id, clinicId));
      if (!clinic) {
        return res.status(404).json({ message: 'Clinic not found' });
      }

      // Create review using storage
      const reviewData = {
        clinicId,
        authorName: authorName || null,
        authorEmail: authorEmail || null,
        authorPhone: authorPhone || null,
        qualityRating: qualityRating.toString(),
        serviceRating: serviceRating.toString(),
        comfortRating: comfortRating.toString(),
        priceRating: priceRating.toString(),
        averageRating: averageRating.toString(),
        comment: comment || null,
        status: 'pending' as const,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const newReview = await storage.createReview(reviewData);

      res.status(201).json({
        success: true,
        message: 'Review submitted successfully',
        review: newReview
      });
    } catch (error) {
      console.error('Error submitting review:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get reviews for admin (with pagination and filters)
  app.get('/api/admin/reviews', requireAdminAuth, async (req, res) => {
    try {
      const { page = 1, limit = 20, status, clinicId } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const result = await storage.getReviews({
        status: status as string,
        clinicId: clinicId as string,
        limit: Number(limit),
        offset
      });

      res.json({
        reviews: result.reviews.map(review => ({
          review: {
            id: review.id,
            clinicId: review.clinicId,
            authorName: review.authorName,
            authorEmail: review.authorEmail,
            authorPhone: review.authorPhone,
            qualityRating: review.qualityRating,
            serviceRating: review.serviceRating,
            comfortRating: review.comfortRating,
            priceRating: review.priceRating,
            averageRating: review.averageRating,
            comment: review.comment,
            status: review.status,
            ipAddress: review.ipAddress,
            userAgent: review.userAgent,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt,
            approvedAt: review.approvedAt,
            rejectedAt: review.rejectedAt
          },
          clinic: {
            id: review.clinic.id,
            nameRu: review.clinic.nameRu,
            nameRo: review.clinic.nameRo
          }
        })),
        total: result.total,
        page: Number(page),
        limit: Number(limit)
      });
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  });

  // Update review status (approve/reject)
  app.patch('/api/admin/reviews/:id/status', requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['approved', 'rejected', 'pending'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      const updatedReview = await storage.updateReviewStatus(id, status);

      res.json({
        success: true,
        message: `Review ${status} successfully`,
        review: updatedReview
      });
    } catch (error) {
      console.error('Error updating review status:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Delete review
  app.delete('/api/admin/reviews/:id', requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;

      await storage.deleteReview(id);

      res.json({
        success: true,
        message: 'Review deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting review:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get approved reviews for a clinic (public endpoint)
  app.get('/api/clinics/:id/reviews', async (req, res) => {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const result = await storage.getReviews({
        clinicId: id,
        status: 'approved',
        limit,
        offset: (page - 1) * limit
      });
      
      res.json({
        reviews: result.reviews.map(review => ({
          id: review.id,
          authorName: review.authorName,
          qualityRating: Number(review.qualityRating),
          serviceRating: Number(review.serviceRating),
          comfortRating: Number(review.comfortRating),
          priceRating: Number(review.priceRating),
          averageRating: Number(review.averageRating),
          comment: review.comment,
          createdAt: review.createdAt
        })),
        total: result.total,
        page,
        limit
      });
    } catch (error) {
      console.error('Error fetching clinic reviews:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Crawler endpoints
  app.post('/api/admin/crawler/start', requireAdminAuth, async (req, res) => {
    try {
      // Get base URL from request headers or use localhost as fallback
      const protocol = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
      const host = req.headers.host || 'localhost:5000';
      const baseUrl = `${protocol}://${host}`;
      
      console.log('🕷️ Starting crawler with base URL:', baseUrl);
      
      const sitemapData = await generateSitemap(baseUrl);
      
      // Save sitemap to file
      const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
      fs.writeFileSync(sitemapPath, sitemapData.xml);
      
      console.log('✅ Sitemap generated and saved:', sitemapPath);
      console.log(`📊 Total pages: ${sitemapData.totalPages}, Clinic pages: ${sitemapData.clinicPages}, Main pages: ${sitemapData.mainPages}`);
      
      res.json({
        success: true,
        message: 'Crawler completed successfully',
        ...sitemapData
      });
    } catch (error) {
      console.error('❌ Crawler error:', error);
      res.status(500).json({ 
        message: 'Crawler failed', 
        error: error.message 
      });
    }
  });

  // Sitemap endpoint
  app.get('/sitemap.xml', async (req, res) => {
    try {
      const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
      
      if (fs.existsSync(sitemapPath)) {
        const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
        res.set('Content-Type', 'application/xml');
        res.send(sitemapContent);
      } else {
        // Generate sitemap on the fly if file doesn't exist
        const protocol = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
        const host = req.headers.host || 'localhost:5000';
        const baseUrl = `${protocol}://${host}`;
        
        const sitemapData = await generateSitemap(baseUrl);
        res.set('Content-Type', 'application/xml');
        res.send(sitemapData.xml);
      }
    } catch (error) {
      console.error('❌ Sitemap error:', error);
      res.status(500).json({ 
        message: 'Failed to generate sitemap', 
        error: error.message 
      });
    }
  });

  // Robots.txt endpoint
  app.get('/robots.txt', async (req, res) => {
    try {
      const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');
      
      if (fs.existsSync(robotsPath)) {
        const robotsContent = fs.readFileSync(robotsPath, 'utf8');
        res.set('Content-Type', 'text/plain');
        res.send(robotsContent);
      } else {
        // Generate robots.txt on the fly if file doesn't exist
        const protocol = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
        const host = req.headers.host || 'localhost:5000';
        const baseUrl = `${protocol}://${host}`;
        
        const robotsContent = await generateRobotsTxt(baseUrl);
        res.set('Content-Type', 'text/plain');
        res.send(robotsContent);
      }
    } catch (error) {
      console.error('❌ Robots.txt error:', error);
      res.status(500).json({ 
        message: 'Failed to generate robots.txt', 
        error: error.message 
      });
    }
  });

  // ===== CITY AND DISTRICT SEO ROUTES =====
  
  // Get city by slug
  app.get('/api/cities/slug/:citySlug', async (req, res) => {
    try {
      const { citySlug } = req.params;
      const { language = 'ru' } = req.query;
      
      const slugField = language === 'ro' ? 'slugRo' : 'slugRu';
      const city = await storage.getCityBySlug(citySlug, language as 'ru' | 'ro');
      
      if (!city) {
        return res.status(404).json({ message: 'City not found' });
      }
      
      res.json({ city });
    } catch (error) {
      console.error('Error getting city by slug:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Get district by city and district slug
  app.get('/api/districts/slug/:citySlug/:districtSlug', async (req, res) => {
    try {
      const { citySlug, districtSlug } = req.params;
      const { language = 'ru' } = req.query;
      
      const result = await storage.getDistrictBySlug(citySlug, districtSlug, language as 'ru' | 'ro');
      
      if (!result) {
        return res.status(404).json({ message: 'District not found' });
      }
      
      res.json(result);
    } catch (error) {
      console.error('Error getting district by slug:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
