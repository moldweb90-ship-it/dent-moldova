// Всегда загружаем .env файл
import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seoMiddleware } from "./seoMiddleware";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const app = express();

// Увеличиваем лимиты для больших запросов
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Добавляем обработку необработанных ошибок
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('Stack:', error.stack);
  // Не завершаем процесс, PM2 перезапустит если нужно
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  if (reason instanceof Error) {
    console.error('Stack:', reason.stack);
  }
  // Не завершаем процесс, PM2 перезапустит если нужно
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Отключаем кеширование для всех страниц
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Подключаем SEO middleware
app.use(seoMiddleware);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const { checkDatabaseConnection } = await import('./db');
    const dbStatus = await checkDatabaseConnection();
    
    const memoryUsage = process.memoryUsage();
    const memoryMB = {
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024)
    };

    res.status(dbStatus ? 200 : 503).json({ 
      status: dbStatus ? 'OK' : 'DB_ERROR',
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
      memory: memoryMB,
      database: dbStatus ? 'connected' : 'disconnected',
      env: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      status: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Миграции выполняются отдельно, не при каждом запуске

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV !== 'production') {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`✅ Server started on port ${port}`);
    // Отправляем сигнал PM2 что сервер готов
    if (process.send) {
      process.send('ready');
    }
  });

  // Обработка ошибок сервера
  server.on('error', (error: any) => {
    if (error.code === 'EADDRINUSE') {
      log(`❌ Port ${port} is already in use`);
      process.exit(1);
    } else {
      log(`❌ Server error: ${error.message}`);
    }
  });
})();
