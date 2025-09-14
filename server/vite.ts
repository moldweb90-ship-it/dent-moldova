import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

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
        // Удаляем существующие favicon теги
        template = template.replace(/<link[^>]*rel="[^"]*icon[^"]*"[^>]*>/gi, '');
        
        // Получаем расширение файла для определения типа
        const faviconUrl = settingsMap.favicon;
        const extension = faviconUrl.split('.').pop()?.toLowerCase();
        let mimeType = 'image/x-icon';
        
        if (extension === 'png') mimeType = 'image/png';
        else if (extension === 'jpg' || extension === 'jpeg') mimeType = 'image/jpeg';
        else if (extension === 'svg') mimeType = 'image/svg+xml';
        
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
        console.log('✅ Favicon tags added to HTML');
      } else {
        console.log('❌ No favicon found in settings');
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
        // Удаляем существующие favicon теги
        template = template.replace(/<link[^>]*rel="[^"]*icon[^"]*"[^>]*>/gi, '');
        
        // Получаем расширение файла для определения типа
        const faviconUrl = settingsMap.favicon;
        const extension = faviconUrl.split('.').pop()?.toLowerCase();
        let mimeType = 'image/x-icon';
        
        if (extension === 'png') mimeType = 'image/png';
        else if (extension === 'jpg' || extension === 'jpeg') mimeType = 'image/jpeg';
        else if (extension === 'svg') mimeType = 'image/svg+xml';
        
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
        console.log('✅ Favicon tags added to HTML (prod)');
      } else {
        console.log('❌ No favicon found in settings (prod)');
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
