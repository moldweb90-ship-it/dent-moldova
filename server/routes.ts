import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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
