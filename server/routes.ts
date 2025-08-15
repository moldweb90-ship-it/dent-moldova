import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import session from "express-session";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

// Admin credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'dancerboy';

// Session middleware
declare module 'express-session' {
  interface SessionData {
    isAdminAuthenticated?: boolean;
  }
}

// File upload configuration
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'clinic-logo-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
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

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  app.use(session({
    secret: 'dent-moldova-admin-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  }, express.static(uploadDir));

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
        page: z.string().optional().transform(val => val ? parseInt(val) : 1),
        limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
      });

      const { q, page, limit } = querySchema.parse(req.query);
      const result = await storage.getClinics({ q, page, limit });
      
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
      const clinic = await storage.getClinicById(id);
      
      if (!clinic) {
        return res.status(404).json({ message: 'Клиника не найдена' });
      }
      
      res.json(clinic);
    } catch (error) {
      console.error('Error fetching admin clinic:', error);
      res.status(500).json({ message: 'Ошибка при получении клиники' });
    }
  });

  // Create new clinic
  app.post('/api/admin/clinics', requireAdminAuth, upload.single('logo'), async (req: any, res) => {
    try {
      const clinicSchema = z.object({
        name: z.string().min(1, 'Название обязательно'),
        cityId: z.string().min(1, 'Город обязателен'),
        districtId: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        website: z.string().optional(),
        bookingUrl: z.string().optional(),
        languages: z.string().optional().transform(val => val ? JSON.parse(val) : []),
        specializations: z.string().optional().transform(val => val ? JSON.parse(val) : []),
        tags: z.string().optional().transform(val => val ? JSON.parse(val) : []),
        verified: z.string().optional().transform(val => val === 'true'),
        cnam: z.string().optional().transform(val => val === 'true'),
        availToday: z.string().optional().transform(val => val === 'true'),
        availTomorrow: z.string().optional().transform(val => val === 'true'),
        priceIndex: z.string().transform(val => parseInt(val) || 50),
        trustIndex: z.string().transform(val => parseInt(val) || 50),
        reviewsIndex: z.string().transform(val => parseInt(val) || 50),
        accessIndex: z.string().transform(val => parseInt(val) || 50),
      });

      const clinicData = clinicSchema.parse(req.body);
      
      // Generate slug from name
      const slug = clinicData.name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
      
      // Add logo path if uploaded
      let logoUrl = null;
      if (req.file) {
        logoUrl = `/uploads/${req.file.filename}`;
      }
      
      // Calculate D-Score
      const dScore = Math.round(
        clinicData.trustIndex * 0.3 +
        clinicData.reviewsIndex * 0.25 +
        clinicData.priceIndex * 0.25 +
        clinicData.accessIndex * 0.2
      );

      const newClinic = await storage.createClinic({
        ...clinicData,
        slug,
        logoUrl,
        dScore,
      });
      
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
      
      // Check if clinic exists
      const existingClinic = await storage.getClinicById(id);
      if (!existingClinic) {
        return res.status(404).json({ message: 'Клиника не найдена' });
      }

      const clinicSchema = z.object({
        name: z.string().optional(),
        cityId: z.string().optional(),
        districtId: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        website: z.string().optional(),
        bookingUrl: z.string().optional(),
        languages: z.string().optional().transform(val => val ? JSON.parse(val) : undefined),
        specializations: z.string().optional().transform(val => val ? JSON.parse(val) : undefined),
        tags: z.string().optional().transform(val => val ? JSON.parse(val) : undefined),
        verified: z.string().optional().transform(val => val === 'true'),
        cnam: z.string().optional().transform(val => val === 'true'),
        availToday: z.string().optional().transform(val => val === 'true'),
        availTomorrow: z.string().optional().transform(val => val === 'true'),
        priceIndex: z.string().optional().transform(val => val ? parseInt(val) : undefined),
        trustIndex: z.string().optional().transform(val => val ? parseInt(val) : undefined),
        reviewsIndex: z.string().optional().transform(val => val ? parseInt(val) : undefined),
        accessIndex: z.string().optional().transform(val => val ? parseInt(val) : undefined),
      });

      const parsedUpdates = clinicSchema.parse(req.body);
      const updates: any = { ...parsedUpdates };
      
      // Update logo if uploaded
      if (req.file) {
        updates.logoUrl = `/uploads/${req.file.filename}`;
      }
      
      // Recalculate D-Score if rating indexes are provided
      if (updates.trustIndex || updates.reviewsIndex || updates.priceIndex || updates.accessIndex) {
        const trustIndex = updates.trustIndex ?? existingClinic.trustIndex;
        const reviewsIndex = updates.reviewsIndex ?? existingClinic.reviewsIndex;
        const priceIndex = updates.priceIndex ?? existingClinic.priceIndex;
        const accessIndex = updates.accessIndex ?? existingClinic.accessIndex;
        
        updates.dScore = Math.round(
          trustIndex * 0.3 +
          reviewsIndex * 0.25 +
          priceIndex * 0.25 +
          accessIndex * 0.2
        );
      }
      
      // Update slug if name changed
      if (updates.name) {
        updates.slug = updates.name.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim('-');
      }
      
      const updatedClinic = await storage.updateClinic(id, updates);
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

  // Get clinics with filters
  app.get("/api/clinics", async (req, res) => {
    try {
      const querySchema = z.object({
        q: z.string().optional(),
        city: z.string().optional(),
        districts: z.union([z.string(), z.array(z.string())]).optional().transform(val => 
          typeof val === 'string' ? [val] : val
        ),
        specializations: z.union([z.string(), z.array(z.string())]).optional().transform(val => 
          typeof val === 'string' ? [val] : val
        ),
        languages: z.union([z.string(), z.array(z.string())]).optional().transform(val => 
          typeof val === 'string' ? [val] : val
        ),
        verified: z.string().optional().transform(val => val === 'true'),
        urgentToday: z.string().optional().transform(val => val === 'true'),
        priceMin: z.string().optional().transform(val => val ? parseInt(val) : undefined),
        priceMax: z.string().optional().transform(val => val ? parseInt(val) : undefined),
        sort: z.enum(['dscore', 'price', 'trust', 'reviews']).optional(),
        page: z.string().optional().transform(val => val ? parseInt(val) : 1),
        limit: z.string().optional().transform(val => val ? parseInt(val) : 12),
      });

      const filters = querySchema.parse(req.query);
      const result = await storage.getClinics(filters);
      
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
      const clinic = await storage.getClinicBySlug(slug);
      
      if (!clinic) {
        return res.status(404).json({ message: "Clinic not found" });
      }
      
      res.json(clinic);
    } catch (error) {
      console.error("Error fetching clinic:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
