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

      // Применяем SEO данные если они есть
      const clinicSEO = (req as any).clinicSEO;
      if (clinicSEO) {
        console.log('🔧 Applying SEO data for clinic:', clinicSEO.title);
        
        // Обновляем title
        template = template.replace(
          /<title>.*?<\/title>/,
          `<title>${clinicSEO.title}</title>`
        );
        
        // Обновляем meta description
        template = template.replace(
          /<meta name="description" content="[^"]*"/,
          `<meta name="description" content="${clinicSEO.description}"`
        );
        
        // Обновляем meta keywords
        if (clinicSEO.keywords) {
          template = template.replace(
            /<meta name="keywords" content="[^"]*"/,
            `<meta name="keywords" content="${clinicSEO.keywords}"`
          );
        }
        
        // Обновляем robots
        template = template.replace(
          /<meta name="robots" content="[^"]*"/,
          `<meta name="robots" content="${clinicSEO.robots}"`
        );
        
        // Обновляем Open Graph теги
        if (clinicSEO.ogTitle) {
          template = template.replace(
            /<meta property="og:title" content="[^"]*"/,
            `<meta property="og:title" content="${clinicSEO.ogTitle}"`
          );
        }
        
        if (clinicSEO.ogDescription) {
          template = template.replace(
            /<meta property="og:description" content="[^"]*"/,
            `<meta property="og:description" content="${clinicSEO.ogDescription}"`
          );
        }
        
        if (clinicSEO.ogImage) {
          template = template.replace(
            /<meta property="og:image" content=".*?" \/>/,
            `<meta property="og:image" content="${clinicSEO.ogImage}" />`
          );
        }
        
        // Обновляем canonical URL
        if (clinicSEO.canonical) {
          template = template.replace(
            /<link rel="canonical" href="[^"]*"/,
            `<link rel="canonical" href="${clinicSEO.canonical}"`
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
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
