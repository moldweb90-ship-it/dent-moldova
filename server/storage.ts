import { 
  cities, districts, clinics, packages, users, siteViews,
  type City, type District, type Clinic, type Package, type User, type SiteView,
  type InsertCity, type InsertDistrict, type InsertClinic, type InsertPackage, type InsertUser, type InsertSiteView
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, ilike, inArray, gte, lte, desc, asc, count, sql } from "drizzle-orm";

export interface IStorage {
  // User methods (existing)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // City methods
  getCities(): Promise<City[]>;
  createCity(city: InsertCity): Promise<City>;

  // District methods
  getDistrictsByCity(cityId: string): Promise<District[]>;
  createDistrict(district: InsertDistrict): Promise<District>;

  // Clinic methods
  getClinics(filters: ClinicFilters): Promise<{ clinics: (Clinic & { city: City; district: District | null; packages: Package[] })[]; total: number }>;
  getClinicBySlug(slug: string): Promise<(Clinic & { city: City; district: District | null; packages: Package[] }) | undefined>;
  createClinic(clinic: InsertClinic): Promise<Clinic>;
  updateClinicDScore(id: string, dScore: number): Promise<void>;
  
  // Admin clinic methods
  getClinicById(id: string): Promise<Clinic | undefined>;
  updateClinic(id: string, updates: Partial<InsertClinic>): Promise<Clinic>;
  deleteClinic(id: string): Promise<void>;
  getAdminStats(): Promise<{ totalClinics: number; verifiedClinics: number; totalCities: number; averageDScore: number }>;

  // Package methods
  createPackage(pkg: InsertPackage): Promise<Package>;

  // View tracking methods
  recordView(view: InsertSiteView): Promise<SiteView>;
  getTodayViews(): Promise<number>;
  getRecentClinics(limit?: number): Promise<(Clinic & { city: City; district: District | null })[]>;
}

export interface ClinicFilters {
  q?: string;
  city?: string;
  districts?: string[];
  specializations?: string[];
  languages?: string[];
  verified?: boolean;
  urgentToday?: boolean;
  priceMin?: number;
  priceMax?: number;
  sort?: 'dscore' | 'price' | 'trust' | 'reviews';
  page?: number;
  limit?: number;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getCities(): Promise<City[]> {
    return await db.select().from(cities);
  }

  async createCity(city: InsertCity): Promise<City> {
    const [newCity] = await db.insert(cities).values(city).returning();
    return newCity;
  }

  async getDistrictsByCity(cityId: string): Promise<District[]> {
    return await db.select().from(districts).where(eq(districts.cityId, cityId));
  }

  async createDistrict(district: InsertDistrict): Promise<District> {
    const [newDistrict] = await db.insert(districts).values(district).returning();
    return newDistrict;
  }

  async getClinics(filters: ClinicFilters): Promise<{ clinics: (Clinic & { city: City; district: District | null; packages: Package[] })[]; total: number }> {
    const { q, city, districts: filterDistricts, specializations, languages, verified, urgentToday, priceMin, priceMax, sort = 'dscore', page = 1, limit = 12 } = filters;

    let query = db
      .select({
        clinic: clinics,
        city: cities,
        district: districts,
      })
      .from(clinics)
      .leftJoin(cities, eq(clinics.cityId, cities.id))
      .leftJoin(districts, eq(clinics.districtId, districts.id));

    const conditions = [];

    // Search query - search in name, specializations, tags, and packages
    if (q) {
      // Find clinics that have matching packages
      const subquery = db
        .select({ clinicId: packages.clinicId })
        .from(packages)
        .where(
          or(
            ilike(packages.nameRu, `%${q}%`),
            ilike(packages.nameRo, `%${q}%`)
          )
        );
      
      conditions.push(
        or(
          ilike(clinics.name, `%${q}%`),
          sql`${clinics.specializations}::text ilike ${`%${q}%`}`,
          sql`${clinics.tags}::text ilike ${`%${q}%`}`,
          sql`${clinics.id} IN (${subquery})`
        )
      );
    }

    // City filter
    if (city) {
      conditions.push(eq(cities.id, city));
    }

    // Districts filter
    if (filterDistricts && filterDistricts.length > 0) {
      conditions.push(inArray(clinics.districtId, filterDistricts));
    }

    // Specializations filter
    if (specializations && specializations.length > 0) {
      // Use SQL for proper JSON array contains check
      const specializationConditions = specializations.map(spec => 
        sql`${clinics.specializations}::jsonb ? ${spec}`
      );
      conditions.push(...specializationConditions);
    }

    // Languages filter
    if (languages && languages.length > 0) {
      const languageConditions = languages.map(lang => 
        sql`${clinics.languages}::jsonb ? ${lang}`
      );
      conditions.push(...languageConditions);
    }

    // Verified filter
    if (verified) {
      conditions.push(eq(clinics.verified, true));
    }

    // Urgent today filter
    if (urgentToday) {
      conditions.push(eq(clinics.availToday, true));
    }

    // Price range filter
    if (priceMin !== undefined) {
      conditions.push(gte(clinics.priceIndex, priceMin));
    }
    if (priceMax !== undefined) {
      conditions.push(lte(clinics.priceIndex, priceMax));
    }

    // Apply conditions and sorting
    let finalQuery: any = query;
    if (conditions.length > 0) {
      finalQuery = finalQuery.where(and(...conditions));
    }

    // Sorting
    switch (sort) {
      case 'price':
        finalQuery = finalQuery.orderBy(asc(clinics.priceIndex));
        break;
      case 'trust':
        finalQuery = finalQuery.orderBy(desc(clinics.trustIndex));
        break;
      case 'reviews':
        finalQuery = finalQuery.orderBy(desc(clinics.reviewsIndex));
        break;
      case 'dscore':
      default:
        finalQuery = finalQuery.orderBy(desc(clinics.dScore));
        break;
    }

    // Pagination
    const offset = (page - 1) * limit;
    const results = await finalQuery.limit(limit).offset(offset);

    // Get packages for each clinic
    const clinicIds = results.map((r: any) => r.clinic.id);
    const clinicPackages = clinicIds.length > 0 
      ? await db.select().from(packages).where(inArray(packages.clinicId, clinicIds))
      : [];

    // Get total count
    let countQuery = db.select({ count: count() }).from(clinics)
      .leftJoin(cities, eq(clinics.cityId, cities.id))
      .leftJoin(districts, eq(clinics.districtId, districts.id));

    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions)) as any;
    }

    const [{ count: total }] = await countQuery;

    // Combine results
    const clinicsWithPackages = results.map((result: any) => ({
      ...result.clinic,
      city: result.city!,
      district: result.district,
      packages: clinicPackages.filter(pkg => pkg.clinicId === result.clinic.id)
    }));

    return { clinics: clinicsWithPackages, total };
  }

  async getClinicBySlug(slug: string): Promise<(Clinic & { city: City; district: District | null; packages: Package[] }) | undefined> {
    const [result] = await db
      .select({
        clinic: clinics,
        city: cities,
        district: districts,
      })
      .from(clinics)
      .leftJoin(cities, eq(clinics.cityId, cities.id))
      .leftJoin(districts, eq(clinics.districtId, districts.id))
      .where(eq(clinics.slug, slug));

    if (!result) return undefined;

    const clinicPackages = await db.select().from(packages).where(eq(packages.clinicId, result.clinic.id));

    return {
      ...result.clinic,
      city: result.city!,
      district: result.district,
      packages: clinicPackages
    };
  }

  async createClinic(clinic: InsertClinic): Promise<Clinic> {
    const [newClinic] = await db.insert(clinics).values(clinic as any).returning();
    return newClinic;
  }

  async updateClinicDScore(id: string, dScore: number): Promise<void> {
    await db.update(clinics)
      .set({ dScore, updatedAt: new Date() })
      .where(eq(clinics.id, id));
  }

  async createPackage(pkg: InsertPackage): Promise<Package> {
    const [newPackage] = await db.insert(packages).values(pkg).returning();
    return newPackage;
  }

  // Admin methods implementation
  async getClinicById(id: string): Promise<Clinic | undefined> {
    const [clinic] = await db.select().from(clinics).where(eq(clinics.id, id));
    return clinic || undefined;
  }

  async updateClinic(id: string, updates: Partial<InsertClinic>): Promise<Clinic> {
    const updateData = { ...updates, updatedAt: new Date() };
    const [updatedClinic] = await db.update(clinics)
      .set(updateData as any)
      .where(eq(clinics.id, id))
      .returning();
    return updatedClinic;
  }

  async deleteClinic(id: string): Promise<void> {
    // Delete associated packages first
    await db.delete(packages).where(eq(packages.clinicId, id));
    // Then delete clinic
    await db.delete(clinics).where(eq(clinics.id, id));
  }

  async getAdminStats(): Promise<{ totalClinics: number; verifiedClinics: number; totalCities: number; averageDScore: number }> {
    const [stats] = await db
      .select({
        totalClinics: count(),
        verifiedClinics: sql<number>`sum(case when ${clinics.verified} then 1 else 0 end)`,
        averageDScore: sql<number>`avg(${clinics.dScore})`,
      })
      .from(clinics);

    const [cityStats] = await db
      .select({ totalCities: count() })
      .from(cities);

    return {
      totalClinics: stats.totalClinics,
      verifiedClinics: Number(stats.verifiedClinics),
      totalCities: cityStats.totalCities,
      averageDScore: Number(stats.averageDScore) || 0,
    };
  }

  // View tracking methods
  async recordView(view: InsertSiteView): Promise<SiteView> {
    const [newView] = await db.insert(siteViews).values(view).returning();
    return newView;
  }

  async getTodayViews(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Count unique IP addresses for today
    const [result] = await db
      .select({ 
        count: sql<number>`count(distinct ${siteViews.ipAddress})` 
      })
      .from(siteViews)
      .where(gte(siteViews.createdAt, today));
      
    return result.count || 0;
  }

  async getRecentClinics(limit: number = 5): Promise<(Clinic & { city: City; district: District | null })[]> {
    const results = await db.query.clinics.findMany({
      with: {
        city: true,
        district: true,
      },
      orderBy: [desc(clinics.createdAt)],
      limit: limit,
    });

    return results as (Clinic & { city: City; district: District | null })[];
  }
}

export const storage = new DatabaseStorage();
