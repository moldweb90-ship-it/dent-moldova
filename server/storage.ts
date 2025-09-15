import { 
  cities, districts, clinics, packages, services, users, siteViews, siteSettings, bookings, analyticsEvents, verificationRequests, newClinicRequests, workingHours, reviews,
  type City, type District, type Clinic, type Package, type Service, type User, type SiteView, type SiteSetting, type Booking, type VerificationRequest, type NewClinicRequest, type WorkingHours, type Review,
  type InsertCity, type InsertDistrict, type InsertClinic, type InsertPackage, type InsertService, type InsertUser, type InsertSiteView, type InsertSiteSetting, type InsertBooking, type InsertVerificationRequest, type InsertNewClinicRequest, type InsertWorkingHours, type InsertReview
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, ilike, inArray, gte, lte, desc, asc, count, sql } from "drizzle-orm";
import { DataProtection } from "./utils/dataProtection";

export interface IStorage {
  // User methods (existing)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // City methods
  getCities(): Promise<City[]>;
  getCitiesWithDistricts(searchQuery?: string): Promise<(City & { districts: District[] })[]>;
  createCity(city: InsertCity): Promise<City>;
  updateCity(id: string, updates: Partial<InsertCity>): Promise<City>;
  updateCitySortOrder(cityId: string, sortOrder: number): Promise<City>;
  deleteCity(id: string): Promise<void>;

  // District methods
  getDistrictsByCity(cityId: string): Promise<District[]>;
  createDistrict(district: InsertDistrict): Promise<District>;
  updateDistrict(id: string, updates: Partial<InsertDistrict>): Promise<District>;
  deleteDistrict(id: string): Promise<void>;

  // Clinic methods
  getClinics(filters: ClinicFilters): Promise<{ clinics: (Clinic & { city: City; district: District | null; services: Service[] })[]; total: number }>;
  getClinicBySlug(slug: string, language?: string): Promise<(Clinic & { city: City; district: District | null; services: Service[] }) | undefined>;
  createClinic(clinic: InsertClinic): Promise<Clinic>;
  updateClinicDScore(id: string, dScore: number): Promise<void>;
  
  // Admin clinic methods
  getClinicById(id: string): Promise<Clinic | undefined>;
  getClinicWithServices(id: string): Promise<(Clinic & { servicesRu: any[], servicesRo: any[] }) | undefined>;
  updateClinic(id: string, updates: Partial<InsertClinic>): Promise<Clinic>;
  deleteClinic(id: string): Promise<void>;
  getAdminStats(): Promise<{ 
    totalClinics: number; 
    verifiedClinics: number; 
    totalCities: number; 
    cnamClinics: number;
    clinicsWithServices: number;
    todayBookings: number;
  }>;

  // Package methods
  createPackage(pkg: InsertPackage): Promise<Package>;

  // View tracking methods
  recordView(view: InsertSiteView): Promise<SiteView>;
  getTodayViews(): Promise<number>;
  getRecentClinics(limit?: number): Promise<(Clinic & { city: City; district: District | null; reviewsData?: { averageRating: number; reviewCount: number } })[]>;
  getRecommendedClinics(): Promise<(Clinic & { city: City; district: District | null; services: Service[] })[]>;
  
  // Site settings methods
  getSiteSetting(key: string): Promise<SiteSetting | undefined>;
  setSiteSetting(key: string, value: string): Promise<SiteSetting>;
  getAllSiteSettings(): Promise<SiteSetting[]>;
  
  // Booking methods
  createBooking(booking: InsertBooking): Promise<Booking>;
  
  // Service methods  
  getClinicServices(clinicId: string, language?: string): Promise<Service[]>;
  updateClinicServices(clinicId: string, services: {name: string, price: number, priceType: string, currency: string}[], language?: string): Promise<void>;
  getBookings(): Promise<(Booking & { clinic: Clinic })[]>;
  getBookingById(id: string): Promise<(Booking & { clinic: Clinic }) | undefined>;
  updateBookingStatus(id: string, status: string): Promise<Booking>;
  deleteBooking(id: string): Promise<void>;
  deleteMultipleBookings(bookingIds: string[]): Promise<void>;
  
  // Analytics methods
  recordAnalyticsEvent(event: { clinicId?: string; eventType: string; ipAddress: string; userAgent?: string; referrer?: string }): Promise<void>;
  getAnalyticsStats(period: string, clinicId?: string): Promise<{
    overall: { totalClicks: number; totalClinics: number; topClinic: any };
    clinics: Array<{ id: string; name: string; clicks: { book: number; phone: number; website: number; details: number }; totalClicks: number }>;
    cities: Array<{ id: string; name: string; totalClicks: number; clinicCount: number }>;
    districts: Array<{ id: string; name: string; cityName: string; totalClicks: number; clinicCount: number }>;
  }>;

  // Data protection methods
  createBackup(backupType: 'full' | 'clinics' | 'cities' | 'manual', description?: string, createdBy?: string): Promise<string>;
  restoreFromBackup(backupId: string, options?: { restoreType?: 'full' | 'partial'; tables?: string[]; userId?: string }): Promise<void>;
  getBackups(limit?: number): Promise<any[]>;
  getAuditLogs(filters?: { tableName?: string; recordId?: string; action?: string; userId?: string; limit?: number; offset?: number }): Promise<{ logs: any[]; total: number }>;
  getProtectionStats(): Promise<{ totalBackups: number; totalAuditLogs: number; lastBackupDate: string | null; protectedTables: string[] }>;
  setProtectionSetting(key: string, value: string, description?: string): Promise<void>;
  cleanupOldBackups(keepDays?: number): Promise<number>;
  
  // Verification requests methods
  createVerificationRequest(request: InsertVerificationRequest): Promise<VerificationRequest>;
  getVerificationRequests(filters?: { status?: string; limit?: number; offset?: number }): Promise<{ requests: (VerificationRequest & { clinic: Clinic })[]; total: number }>;
  getVerificationRequestById(id: string): Promise<(VerificationRequest & { clinic: Clinic }) | undefined>;
  updateVerificationRequestStatus(id: string, status: 'approved' | 'rejected', notes?: string): Promise<VerificationRequest>;
  getPendingVerificationCount(): Promise<number>;
  deleteVerificationRequest(id: string): Promise<void>;
  
  // New clinic requests methods
  createNewClinicRequest(request: InsertNewClinicRequest): Promise<NewClinicRequest>;
  
  // Reviews methods
  createReview(review: InsertReview): Promise<Review>;
  getReviews(filters?: { status?: string; clinicId?: string; limit?: number; offset?: number }): Promise<{ reviews: (Review & { clinic: Clinic })[]; total: number }>;
  getReviewById(id: string): Promise<(Review & { clinic: Clinic }) | undefined>;
  updateReviewStatus(id: string, status: 'approved' | 'rejected' | 'pending'): Promise<Review>;
  deleteReview(id: string): Promise<void>;
  
  // Working hours methods
  getClinicWorkingHours(clinicId: string): Promise<WorkingHours[]>;
  updateClinicWorkingHours(clinicId: string, workingHours: Omit<InsertWorkingHours, 'clinicId'>[]): Promise<void>;
  getNewClinicRequests(filters?: { status?: string; limit?: number; offset?: number }): Promise<{ requests: NewClinicRequest[]; total: number }>;
  getNewClinicRequestById(id: string): Promise<NewClinicRequest | undefined>;
  updateNewClinicRequestStatus(id: string, status: 'approved' | 'rejected', notes?: string): Promise<NewClinicRequest>;
  getPendingNewClinicCount(): Promise<number>;
  deleteNewClinicRequest(id: string): Promise<void>;
  
  // Price range methods
  getPriceRange(): Promise<{ min: number; max: number }>;
}

export interface ClinicFilters {
  q?: string;
  city?: string;
  districts?: string[];
  features?: string[];
  promotionalLabels?: string[];
  specializations?: string[];
  languages?: string[];
  verified?: boolean;
  openNow?: boolean;
  urgentToday?: boolean;
  priceMin?: number;
  priceMax?: number;
  sort?: 'dscore' | 'price' | 'popularity' | 'reviews';
  page?: number;
  limit?: number;
  language?: string;
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
    return await db.select().from(cities).orderBy(asc(cities.sortOrder), asc(cities.nameRu));
  }

  async getCitiesWithDistricts(searchQuery?: string): Promise<(City & { districts: District[] })[]> {
    let query = db.select().from(cities);
    
    if (searchQuery) {
      query = query.where(
        or(
          ilike(cities.nameRu, `%${searchQuery}%`),
          ilike(cities.nameRo, `%${searchQuery}%`)
        )
      );
    }
    
    // Always sort by sortOrder, then by nameRu
    query = query.orderBy(asc(cities.sortOrder), asc(cities.nameRu));
    
    const citiesList = await query;
    
    // Get districts for each city
    const citiesWithDistricts = await Promise.all(
      citiesList.map(async (city) => {
        const cityDistricts = await db
          .select()
          .from(districts)
          .where(eq(districts.cityId, city.id));
        
        return {
          ...city,
          districts: cityDistricts
        };
      })
    );
    
    return citiesWithDistricts;
  }

  async createCity(city: InsertCity): Promise<City> {
    // Get the highest sortOrder and add 1 for the new city
    const maxSortOrder = await db.select({ maxSort: sql<number>`MAX(${cities.sortOrder})` }).from(cities);
    const nextSortOrder = (maxSortOrder[0]?.maxSort || 0) + 1;
    
    const [newCity] = await db.insert(cities).values({
      ...city,
      sortOrder: nextSortOrder
    }).returning();
    
    await DataProtection.logAudit({
      tableName: 'cities',
      recordId: newCity.id,
      action: 'create',
      newData: newCity,
      userAgent: 'system',
    });
    
    await this.updateLastDataModification();
    return newCity;
  }

  async updateCity(id: string, updates: Partial<InsertCity>): Promise<City> {
    const oldCity = await db.select().from(cities).where(eq(cities.id, id));
    
    const [updatedCity] = await db
      .update(cities)
      .set(updates)
      .where(eq(cities.id, id))
      .returning();
    
    if (!updatedCity) {
      throw new Error('Город не найден');
    }
    
    await DataProtection.logAudit({
      tableName: 'cities',
      recordId: id,
      action: 'update',
      oldData: oldCity[0],
      newData: updatedCity,
      changedFields: Object.keys(updates),
      userAgent: 'system',
    });
    
    await this.updateLastDataModification();
    return updatedCity;
  }

  async updateCitySortOrder(cityId: string, sortOrder: number): Promise<City> {
    const [updatedCity] = await db
      .update(cities)
      .set({ sortOrder })
      .where(eq(cities.id, cityId))
      .returning();
    
    if (!updatedCity) {
      throw new Error('Город не найден');
    }
    
    await DataProtection.logAudit({
      tableName: 'cities',
      recordId: cityId,
      action: 'update',
      newData: { sortOrder },
      userAgent: 'system',
    });
    
    await this.updateLastDataModification();
    return updatedCity;
  }

  async deleteCity(id: string): Promise<void> {
    // Check if deletion is allowed
    const isAllowed = await DataProtection.isDeletionAllowed('cities');
    if (!isAllowed) {
      throw new Error('Удаление городов заблокировано настройками защиты данных');
    }

    const [city] = await db.select().from(cities).where(eq(cities.id, id));
    
    // Check if city has clinics
    const [clinicCount] = await db
      .select({ count: count() })
      .from(clinics)
      .where(eq(clinics.cityId, id));
    
    if (clinicCount.count > 0) {
      throw new Error(`Нельзя удалить город, в котором есть клиники (${clinicCount.count} клиник)`);
    }

    // Clear districtId from all districts that belong to this city
    await db
      .update(districts)
      .set({ cityId: undefined })
      .where(eq(districts.cityId, id));
    
    await db.delete(cities).where(eq(cities.id, id));
    
    await DataProtection.logAudit({
      tableName: 'cities',
      recordId: id,
      action: 'delete',
      oldData: city,
      userAgent: 'system',
    });
    
    await this.updateLastDataModification();
  }

  async getDistrictsByCity(cityId: string): Promise<District[]> {
    return await db.select().from(districts).where(eq(districts.cityId, cityId));
  }

  async createDistrict(district: InsertDistrict): Promise<District> {
    const [newDistrict] = await db.insert(districts).values(district).returning();
    await this.updateLastDataModification();
    return newDistrict;
  }

  async updateDistrict(id: string, updates: Partial<InsertDistrict>): Promise<District> {
    const [updatedDistrict] = await db
      .update(districts)
      .set(updates)
      .where(eq(districts.id, id))
      .returning();
    
    if (!updatedDistrict) {
      throw new Error('Район не найден');
    }
    
    await this.updateLastDataModification();
    return updatedDistrict;
  }

  async deleteDistrict(id: string): Promise<void> {
    // First, clear districtId from all clinics that use this district
    await db
      .update(clinics)
      .set({ districtId: null })
      .where(eq(clinics.districtId, id));
    
    // Then delete the district
    await db.delete(districts).where(eq(districts.id, id));
    await this.updateLastDataModification();
  }

  async getClinics(filters: ClinicFilters): Promise<{ clinics: (Clinic & { city: City; district: District | null; services: Service[] })[]; total: number }> {
    const { q, city, districts: filterDistricts, features, promotionalLabels, specializations, languages, verified, urgentToday, priceMin, priceMax, sort = 'dscore', page = 1, limit = 12 } = filters;

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

    // Search query - search in name, specializations, tags, and services
    if (q) {
      // Find clinics that have matching services
      const subquery = db
        .select({ clinicId: services.clinicId })
        .from(services)
        .where(
          ilike(services.name, `%${q}%`)
        );
      
      conditions.push(
        or(
          ilike(clinics.nameRu, `%${q}%`),
          ilike(clinics.nameRo, `%${q}%`),
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

    // Features filter
    if (features && features.length > 0) {
      features.forEach(feature => {
        switch (feature) {
          case 'pediatricDentistry':
            conditions.push(eq(clinics.pediatricDentistry, true));
            break;
          case 'parking':
            conditions.push(eq(clinics.parking, true));
            break;
          case 'sos':
            conditions.push(eq(clinics.sos, true));
            break;
          case 'work24h':
            conditions.push(eq(clinics.work24h, true));
            break;
          case 'credit':
            conditions.push(eq(clinics.credit, true));
            break;
          case 'weekendWork':
            conditions.push(eq(clinics.weekendWork, true));
            break;
        }
      });
    }

    // Promotional labels filter
    if (promotionalLabels && promotionalLabels.length > 0) {
      console.log('🔍 Filtering by promotional labels:', promotionalLabels);
      const promotionalConditions = promotionalLabels.map(label => 
        sql`${clinics.promotionalLabels}::jsonb ? ${label}`
      );
      conditions.push(...promotionalConditions);
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

    // Open now filter - this will be handled after getting the results
    // because we need to check working hours dynamically

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
      console.log('🔍 Applying conditions:', conditions.length);
      finalQuery = finalQuery.where(and(...conditions));
    }

    // First get all results without sorting
    console.log('🔍 Getting results without sorting first...');
    let unsortedQuery = query;
    if (conditions.length > 0) {
      unsortedQuery = unsortedQuery.where(and(...conditions));
    }
    
    const allResults = await unsortedQuery;

    // Get services for each clinic
    const clinicIds = allResults.map((r: any) => r.clinic.id);
    console.log('🔍 getClinics: clinicIds:', clinicIds);
    console.log('🔍 getClinics: filters.language:', filters.language);
    
    const clinicServices = clinicIds.length > 0 
      ? await db.select().from(services).where(
          filters.language 
            ? and(inArray(services.clinicId, clinicIds), eq(services.language, filters.language))
            : inArray(services.clinicId, clinicIds)
        )
      : [];
    
    // Get working hours for each clinic
    const clinicWorkingHours = clinicIds.length > 0 
      ? await db.select().from(workingHours).where(inArray(workingHours.clinicId, clinicIds))
      : [];
    
    console.log('🔍 getClinics: found services:', clinicServices.length);
    console.log('🔍 getClinics: services sample:', clinicServices.slice(0, 2));
    console.log('🔍 getClinics: services by clinic:', clinicServices.reduce((acc, service) => {
      acc[service.clinicId] = (acc[service.clinicId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>));

    // Get reviews data for rating-based sorting (always load for potential use)
    console.log('🔍 Loading reviews data for sorting...');
    
    // Get all approved reviews for clinics in results
    const allReviews = await db
      .select({
        clinicId: reviews.clinicId,
        averageRating: reviews.averageRating,
      })
      .from(reviews)
      .where(and(
        eq(reviews.status, 'approved'),
        inArray(reviews.clinicId, clinicIds)
      ));
    
    // Calculate average rating and count for each clinic
    const clinicReviewsData = allReviews.reduce((acc, review) => {
      if (!acc[review.clinicId]) {
        acc[review.clinicId] = { averageRating: 0, reviewCount: 0 };
      }
      acc[review.clinicId].averageRating += parseFloat(review.averageRating.toString());
      acc[review.clinicId].reviewCount += 1;
      return acc;
    }, {} as Record<string, { averageRating: number; reviewCount: number }>);
    
    // Calculate final averages
    Object.keys(clinicReviewsData).forEach(clinicId => {
      const data = clinicReviewsData[clinicId];
      data.averageRating = data.reviewCount > 0 ? data.averageRating / data.reviewCount : 0;
    });
    
    console.log('🔍 Reviews data loaded:', Object.keys(clinicReviewsData).length, 'clinics with reviews');

    // Get bookings data for popularity-based sorting
    console.log('🔍 Loading bookings data for sorting...');
    
    const allBookings = await db
      .select({
        clinicId: bookings.clinicId,
      })
      .from(bookings)
      .where(inArray(bookings.clinicId, clinicIds));
    
    // Calculate booking count for each clinic
    const clinicBookingsData = allBookings.reduce((acc, booking) => {
      acc[booking.clinicId] = (acc[booking.clinicId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('🔍 Bookings data loaded:', Object.keys(clinicBookingsData).length, 'clinics with bookings');

    // Combine results
    let clinicsWithServices = allResults.map((result: any) => {
      const servicesForClinic = clinicServices.filter(service => service.clinicId === result.clinic.id);
      const workingHoursForClinic = clinicWorkingHours.filter(wh => wh.clinicId === result.clinic.id);
      const reviewsData = clinicReviewsData[result.clinic.id] || { averageRating: 0, reviewCount: 0 };
      const bookingsCount = clinicBookingsData[result.clinic.id] || 0;
      
      console.log(`🔍 Clinic ${result.clinic.nameRu}: ${servicesForClinic.length} services, ${workingHoursForClinic.length} working hours, ${reviewsData.reviewCount} reviews (avg: ${reviewsData.averageRating.toFixed(2)}), ${bookingsCount} bookings`);
      return {
        ...result.clinic,
        city: result.city!,
        district: result.district,
        services: servicesForClinic,
        workingHours: workingHoursForClinic,
        reviewsData: reviewsData,
        bookingsCount: bookingsCount
      };
    });

    // Sort in JavaScript to ensure verified clinics are always first
    console.log('🔍 Sorting in JavaScript to prioritize verified clinics...');
    clinicsWithServices = clinicsWithServices.sort((a, b) => {
      // First priority: verified status - unverified clinics go to the end
      if (a.verified && !b.verified) return -1;
      if (!a.verified && b.verified) return 1;
      
      // If both are unverified, keep original order
      if (!a.verified && !b.verified) return 0;
      
      // Second priority: selected sort criteria (only for verified clinics)
      switch (sort) {
        case 'price':
          // Sort by minimum price from services
          const aMinPrice = a.services && a.services.length > 0 
            ? Math.min(...a.services.map(s => s.price))
            : Infinity;
          const bMinPrice = b.services && b.services.length > 0 
            ? Math.min(...b.services.map(s => s.price))
            : Infinity;
          
          console.log(`🔍 Price comparison: ${a.nameRu} (min: ${aMinPrice}) vs ${b.nameRu} (min: ${bMinPrice})`);
          
          return aMinPrice - bMinPrice;
        case 'popularity':
          // Sort by number of bookings (more bookings = more popular)
          const aBookings = a.bookingsCount || 0;
          const bBookings = b.bookingsCount || 0;
          
          console.log(`🔍 Comparing ${a.nameRu} (${aBookings} bookings) vs ${b.nameRu} (${bBookings} bookings)`);
          
          const bookingsResult = bBookings - aBookings;
          console.log(`🔍 Bookings comparison: ${bookingsResult > 0 ? b.nameRu : a.nameRu} wins by bookings`);
          return bookingsResult;
        case 'reviews':
          // Sort by review count only (more reviews is better)
          const aReviews = a.reviewsData || { averageRating: 0, reviewCount: 0 };
          const bReviews = b.reviewsData || { averageRating: 0, reviewCount: 0 };
          
          console.log(`🔍 Comparing ${a.nameRu} (${aReviews.reviewCount} reviews) vs ${b.nameRu} (${bReviews.reviewCount} reviews)`);
          
          // Sort by review count only (more reviews is better)
          const countResult = bReviews.reviewCount - aReviews.reviewCount;
          console.log(`🔍 Review count comparison: ${countResult > 0 ? b.nameRu : a.nameRu} wins by count`);
          return countResult;
        case 'dscore':
        default:
          // For dscore (sortByRating), use real reviews data if available
          const aRatingData = a.reviewsData || { averageRating: 0, reviewCount: 0 };
          const bRatingData = b.reviewsData || { averageRating: 0, reviewCount: 0 };
          
          // If both clinics have reviews, sort by reviews
          if (aRatingData.reviewCount > 0 && bRatingData.reviewCount > 0) {
            console.log(`🔍 dscore: Comparing ${a.nameRu} (${aRatingData.averageRating.toFixed(2)}, ${aRatingData.reviewCount}) vs ${b.nameRu} (${bRatingData.averageRating.toFixed(2)}, ${bRatingData.reviewCount})`);
            
            // First compare by average rating (higher is better)
            if (Math.abs(aRatingData.averageRating - bRatingData.averageRating) > 0.01) {
              const result = bRatingData.averageRating - aRatingData.averageRating;
              console.log(`🔍 dscore: Rating difference: ${result > 0 ? b.nameRu : a.nameRu} wins by rating`);
              return result;
            }
            
            // If ratings are similar, compare by review count (more reviews is better)
            const countResult = bRatingData.reviewCount - aRatingData.reviewCount;
            console.log(`🔍 dscore: Rating similar, comparing count: ${countResult > 0 ? b.nameRu : a.nameRu} wins by count`);
            return countResult;
          }
          
          // If only one clinic has reviews, prioritize it
          if (aRatingData.reviewCount > 0 && bRatingData.reviewCount === 0) {
            console.log(`🔍 dscore: ${a.nameRu} has reviews, ${b.nameRu} doesn't - ${a.nameRu} wins`);
            return -1;
          }
          if (bRatingData.reviewCount > 0 && aRatingData.reviewCount === 0) {
            console.log(`🔍 dscore: ${b.nameRu} has reviews, ${a.nameRu} doesn't - ${b.nameRu} wins`);
            return 1;
          }
          
          // If neither has reviews, fall back to dScore
          console.log(`🔍 dscore: Neither has reviews, using dScore: ${a.nameRu}(${a.dScore}) vs ${b.nameRu}(${b.dScore})`);
          return b.dScore - a.dScore;
      }
    });

    // Apply pagination after sorting
    const offset = (page - 1) * limit;
    clinicsWithServices = clinicsWithServices.slice(offset, offset + limit);

    // Filter by open now if requested
    if (filters.openNow) {
      console.log('🔍 Filtering by open now...');
      const now = new Date();
      const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      console.log(`🔍 Current day: ${currentDay} (0=Sunday, 1=Monday, etc.), current time: ${currentTime}`);
      
      clinicsWithServices = clinicsWithServices.filter(clinic => {
        // Find today's working hours
        const todayHours = clinic.workingHours.find(wh => wh.dayOfWeek === currentDay);
        
        console.log(`🔍 Clinic ${clinic.nameRu}: todayHours:`, todayHours);
        
        if (!todayHours || !todayHours.isOpen) {
          console.log(`🔍 Clinic ${clinic.nameRu}: closed today (no hours or isOpen=false)`);
          return false; // Clinic is closed today
        }
        
        if (todayHours.is24Hours) {
          console.log(`🔍 Clinic ${clinic.nameRu}: open 24/7`);
          return true; // Clinic is open 24/7
        }
        
        if (todayHours.openTime && todayHours.closeTime) {
          // Convert times to minutes for comparison
          const timeToMinutes = (timeStr: string) => {
            const [hours, minutes] = timeStr.split(':').map(Number);
            return hours * 60 + minutes;
          };
          
          const currentMinutes = timeToMinutes(currentTime);
          const openMinutes = timeToMinutes(todayHours.openTime);
          const closeMinutes = timeToMinutes(todayHours.closeTime);
          
          console.log(`🔍 Clinic ${clinic.nameRu}: current=${currentMinutes}, open=${openMinutes}, close=${closeMinutes}`);
          
          // Check if clinic is currently open
          let isOpen = false;
          if (closeMinutes > openMinutes) {
            // Normal case: opening and closing on the same day
            isOpen = currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
          } else {
            // Midnight crossing case (e.g., 22:00 - 06:00)
            isOpen = currentMinutes >= openMinutes || currentMinutes <= closeMinutes;
          }
          
          console.log(`🔍 Clinic ${clinic.nameRu}: isOpen=${isOpen}`);
          return isOpen;
        }
        
        console.log(`🔍 Clinic ${clinic.nameRu}: no time specified, assuming closed`);
        return false; // No time specified, assume closed
      });
      
      console.log(`🔍 After open now filter: ${clinicsWithServices.length} clinics`);
    }

    // Get total count after all filtering
    const total = allResults.length;

    // Отладка - проверим порядок клиник и их верификацию
    console.log('🔍 Clinics order after sorting:');
    clinicsWithServices.forEach((clinic, index) => {
      const reviewsInfo = clinic.reviewsData ? `, reviews: ${clinic.reviewsData.reviewCount} (avg: ${clinic.reviewsData.averageRating.toFixed(2)})` : '';
      console.log(`${index + 1}. ${clinic.nameRu} - verified: ${clinic.verified}, dScore: ${clinic.dScore}${reviewsInfo}`);
    });

    return { clinics: clinicsWithServices, total };
  }

  async getClinicBySlug(slug: string, language?: string): Promise<(Clinic & { city: City; district: District | null; services: Service[] }) | undefined> {
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

    // Загружаем услуги с учетом языка
    console.log('🔍 getClinicBySlug: clinicId:', result.clinic.id, 'language:', language);
    const clinicServices = language 
      ? await db.select().from(services).where(and(eq(services.clinicId, result.clinic.id), eq(services.language, language)))
      : await db.select().from(services).where(eq(services.clinicId, result.clinic.id));
    
    console.log('🔍 getClinicBySlug: found services:', clinicServices.length);
    console.log('🔍 getClinicBySlug: services:', clinicServices);
    
    // Загружаем время работы
    const clinicWorkingHours = await db.select().from(workingHours).where(eq(workingHours.clinicId, result.clinic.id));
    console.log('🔍 getClinicBySlug: found working hours:', clinicWorkingHours.length);

    // Подготавливаем SEO данные в зависимости от языка
    const clinicData = { ...result.clinic };
    
    // Создаем объект с SEO данными в зависимости от языка
    const seoData = {
      seoTitle: language === 'ro' 
        ? (clinicData.seoTitleRo || clinicData.seoTitleRu || `${clinicData.nameRo || clinicData.nameRu} - clinică stomatologică`)
        : (clinicData.seoTitleRu || clinicData.seoTitleRo || `${clinicData.nameRu || clinicData.nameRo} - стоматологическая клиника`),
      seoDescription: language === 'ro' 
        ? (clinicData.seoDescriptionRo || clinicData.seoDescriptionRu || `${clinicData.nameRo || clinicData.nameRu} - clinică modernă în ${result.city?.nameRo || 'Chișinău'}. Programare online, consultație gratuită.`)
        : (clinicData.seoDescriptionRu || clinicData.seoDescriptionRo || `${clinicData.nameRu || clinicData.nameRo} - современная клиника в ${result.city?.nameRu || 'Кишинёв'}. Запись онлайн, консультация бесплатно.`),
      seoKeywords: language === 'ro' 
        ? (clinicData.seoKeywordsRo || clinicData.seoKeywordsRu || 'stomatologie, tratament dentar, dentist')
        : (clinicData.seoKeywordsRu || clinicData.seoKeywordsRo || 'стоматология, лечение зубов, стоматолог'),
      seoH1: language === 'ro' 
        ? (clinicData.seoH1Ro || clinicData.seoH1Ru || `${clinicData.nameRo || clinicData.nameRu} - clinică stomatologică`)
        : (clinicData.seoH1Ru || clinicData.seoH1Ro || `${clinicData.nameRu || clinicData.nameRo} - стоматологическая клиника`),
      ogTitle: language === 'ro' 
        ? (clinicData.ogTitleRo || clinicData.ogTitleRu || `${clinicData.nameRo || clinicData.nameRu} - clinică stomatologică`)
        : (clinicData.ogTitleRu || clinicData.ogTitleRo || `${clinicData.nameRu || clinicData.nameRo} - стоматологическая клиника`),
      ogDescription: language === 'ro' 
        ? (clinicData.ogDescriptionRo || clinicData.ogDescriptionRu || `${clinicData.nameRo || clinicData.nameRu} - clinică stomatologică în ${result.city?.nameRo || 'Chișinău'}`)
        : (clinicData.ogDescriptionRu || clinicData.ogDescriptionRo || `${clinicData.nameRu || clinicData.nameRo} - стоматологическая клиника в ${result.city?.nameRu || 'Кишинёв'}`),
    };

    console.log('🔍 getClinicBySlug: SEO data for language', language, ':', seoData);

    return {
      ...clinicData,
      ...seoData,
      city: result.city!,
      district: result.district,
      services: clinicServices,
      workingHours: clinicWorkingHours
    } as any;
  }

  async createClinic(clinic: InsertClinic): Promise<Clinic> {
    const [newClinic] = await db.insert(clinics).values(clinic as any).returning();
    
    await DataProtection.logAudit({
      tableName: 'clinics',
      recordId: newClinic.id,
      action: 'create',
      newData: newClinic,
      userAgent: 'system',
    });
    
    await this.updateLastDataModification();
    return newClinic;
  }

  async updateClinicDScore(id: string, dScore: number): Promise<void> {
    await db.update(clinics)
      .set({ dScore, updatedAt: new Date() })
      .where(eq(clinics.id, id));
    await this.updateLastDataModification();
  }

  async createPackage(pkg: InsertPackage): Promise<Package> {
    const [newPackage] = await db.insert(packages).values(pkg).returning();
    await this.updateLastDataModification();
    return newPackage;
  }

  // Admin methods implementation
  async getClinicById(id: string): Promise<Clinic | undefined> {
    const [clinic] = await db.select({
      id: clinics.id,
      slug: clinics.slug,
      nameRu: clinics.nameRu,
      nameRo: clinics.nameRo,
      cityId: clinics.cityId,
      districtId: clinics.districtId,
      addressRu: clinics.addressRu,
      addressRo: clinics.addressRo,
      phone: clinics.phone,
      website: clinics.website,
      bookingUrl: clinics.bookingUrl,
      languages: clinics.languages,
      specializations: clinics.specializations,
      tags: clinics.tags,
      verified: clinics.verified,

      availToday: clinics.availToday,
      availTomorrow: clinics.availTomorrow,
      priceIndex: clinics.priceIndex,
      trustIndex: clinics.trustIndex,
      reviewsIndex: clinics.reviewsIndex,
      accessIndex: clinics.accessIndex,
      dScore: clinics.dScore,
      
    
      recommended: clinics.recommended,
      promotionalLabels: clinics.promotionalLabels,
      currency: clinics.currency,
      createdAt: clinics.createdAt,
      updatedAt: clinics.updatedAt,
      doctorExperience: clinics.doctorExperience,
      hasLicenses: clinics.hasLicenses,
      hasCertificates: clinics.hasCertificates,
      onlineBooking: clinics.onlineBooking,
      weekendWork: clinics.weekendWork,
      eveningWork: clinics.eveningWork,
      urgentCare: clinics.urgentCare,
      convenientLocation: clinics.convenientLocation,
      installmentPlan: clinics.installmentPlan,
      hasPromotions: clinics.hasPromotions,
      // Новые поля ценовой политики
      publishedPricing: clinics.publishedPricing,
      freeConsultation: clinics.freeConsultation,
      interestFreeInstallment: clinics.interestFreeInstallment,
      implantWarranty: clinics.implantWarranty,
      popularServicesPromotions: clinics.popularServicesPromotions,
      onlinePriceCalculator: clinics.onlinePriceCalculator,
      // Новые поля для фильтрации
      pediatricDentistry: clinics.pediatricDentistry,
      parking: clinics.parking,
      sos: clinics.sos,
      sosEnabled: clinics.sosEnabled,
      // Google рейтинг
      googleRating: clinics.googleRating,
      googleReviewsCount: clinics.googleReviewsCount,
    
      work24h: clinics.work24h,
      credit: clinics.credit,
      // SEO поля
      seoTitleRu: clinics.seoTitleRu,
      seoTitleRo: clinics.seoTitleRo,
      seoDescriptionRu: clinics.seoDescriptionRu,
      seoDescriptionRo: clinics.seoDescriptionRo,
      seoKeywordsRu: clinics.seoKeywordsRu,
      seoKeywordsRo: clinics.seoKeywordsRo,
      seoH1Ru: clinics.seoH1Ru,
      seoH1Ro: clinics.seoH1Ro,
      ogTitleRu: clinics.ogTitleRu,
      ogTitleRo: clinics.ogTitleRo,
      ogDescriptionRu: clinics.ogDescriptionRu,
      ogDescriptionRo: clinics.ogDescriptionRo,
      ogImage: clinics.ogImage,
      seoCanonical: clinics.seoCanonical,
      seoRobots: clinics.seoRobots,
      seoPriority: clinics.seoPriority,
      seoSchemaType: clinics.seoSchemaType,
      seoSchemaData: clinics.seoSchemaData,
      logoUrl: clinics.logoUrl,
    }).from(clinics).where(eq(clinics.id, id));
    return clinic || undefined;
  }

  async getClinicWithServices(id: string): Promise<(Clinic & { servicesRu: any[], servicesRo: any[] }) | undefined> {
    console.log(`🔍 getClinicWithServices: clinicId=${id}`);
    
    const [clinic] = await db.select().from(clinics).where(eq(clinics.id, id));
    if (!clinic) {
      console.log(`❌ Clinic not found: ${id}`);
      return undefined;
    }

    // Get services for both languages
    const ruServices = await db.select().from(services).where(and(eq(services.clinicId, id), eq(services.language, 'ru')));
    const roServices = await db.select().from(services).where(and(eq(services.clinicId, id), eq(services.language, 'ro')));

    console.log(`🔍 Found ${ruServices.length} RU services and ${roServices.length} RO services`);
    console.log(`🔍 RU services:`, ruServices);
    console.log(`🔍 RO services:`, roServices);

    return {
      ...clinic,
      servicesRu: ruServices,
      servicesRo: roServices
    };
  }

  async updateClinic(id: string, updates: Partial<InsertClinic>): Promise<Clinic> {
    const [oldClinic] = await db.select().from(clinics).where(eq(clinics.id, id));
    
    const updateData = { ...updates, updatedAt: new Date() };
    const [updatedClinic] = await db.update(clinics)
      .set(updateData as any)
      .where(eq(clinics.id, id))
      .returning();
    
    await DataProtection.logAudit({
      tableName: 'clinics',
      recordId: id,
      action: 'update',
      oldData: oldClinic,
      newData: updatedClinic,
      changedFields: Object.keys(updates),
      userAgent: 'system',
    });
    
    await this.updateLastDataModification();
    return updatedClinic;
  }

  async deleteClinic(id: string): Promise<void> {
    // Check if deletion is allowed
    const isAllowed = await DataProtection.isDeletionAllowed('clinics');
    if (!isAllowed) {
      throw new Error('Удаление клиник заблокировано настройками защиты данных');
    }

    const [clinic] = await db.select().from(clinics).where(eq(clinics.id, id));
    
    // Delete associated packages first
    await db.delete(packages).where(eq(packages.clinicId, id));
    // Delete associated services
    await db.delete(services).where(eq(services.clinicId, id));
    // Then delete clinic
    await db.delete(clinics).where(eq(clinics.id, id));
    
    await DataProtection.logAudit({
      tableName: 'clinics',
      recordId: id,
      action: 'delete',
      oldData: clinic,
      userAgent: 'system',
    });
    
    await this.updateLastDataModification();
  }

  async getAdminStats(): Promise<{ 
    totalClinics: number; 
    verifiedClinics: number; 
    totalCities: number; 
    clinicsWithServices: number;
    todayBookings: number;
  }> {
    const [stats] = await db
      .select({
        totalClinics: count(),
        verifiedClinics: sql<number>`sum(case when ${clinics.verified} then 1 else 0 end)`,

      })
      .from(clinics);

    const [cityStats] = await db
      .select({ totalCities: count() })
      .from(cities);

    // Count clinics with services
    const [serviceStats] = await db
      .select({
        clinicsWithServices: sql<number>`count(distinct ${services.clinicId})`
      })
      .from(services);

    // Count today's bookings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [bookingStats] = await db
      .select({
        todayBookings: sql<number>`count(*)`
      })
      .from(bookings)
      .where(gte(bookings.createdAt, today));

    return {
      totalClinics: stats.totalClinics,
      verifiedClinics: Number(stats.verifiedClinics),
      totalCities: cityStats.totalCities,

      clinicsWithServices: Number(serviceStats.clinicsWithServices),
      todayBookings: Number(bookingStats.todayBookings),
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

  async getRecommendedClinics(): Promise<(Clinic & { city: City; district: District | null; services: Service[] })[]> {
    const results = await db.query.clinics.findMany({
      where: eq(clinics.recommended, true),
      with: {
        city: true,
        district: true,
        services: true,
      },
      orderBy: [desc(clinics.verified), desc(clinics.dScore)],
      limit: 6,
    });
    return results as any;
  }

  async getRecentClinics(limit: number = 5): Promise<(Clinic & { city: City; district: District | null; reviewsData?: { averageRating: number; reviewCount: number } })[]> {
    const results = await db.query.clinics.findMany({
      with: {
        city: true,
        district: true,
      },
      orderBy: [desc(clinics.verified), desc(clinics.createdAt)],
      limit: limit,
    });

    // Get reviews data for each clinic
    const clinicIds = results.map(clinic => clinic.id);
    console.log('🔍 getRecentClinics - clinic IDs:', clinicIds);
    
    const reviewsData = await db
      .select({
        clinicId: reviews.clinicId,
        averageRating: sql<number>`AVG(${reviews.averageRating})`,
        reviewCount: sql<number>`COUNT(*)`
      })
      .from(reviews)
      .where(and(
        eq(reviews.status, 'approved'),
        inArray(reviews.clinicId, clinicIds)
      ))
      .groupBy(reviews.clinicId);

    console.log('🔍 getRecentClinics - reviews data:', reviewsData);

    // Create a map of clinic reviews data
    const reviewsDataMap: Record<string, { averageRating: number; reviewCount: number }> = {};
    reviewsData.forEach(data => {
      reviewsDataMap[data.clinicId] = {
        averageRating: Number(data.averageRating) || 0,
        reviewCount: Number(data.reviewCount) || 0
      };
    });

    console.log('🔍 getRecentClinics - reviews data map:', reviewsDataMap);

    // Add reviews data to each clinic
    const resultsWithReviews = results.map(clinic => ({
      ...clinic,
      reviewsData: reviewsDataMap[clinic.id] || { averageRating: 0, reviewCount: 0 }
    }));

    console.log('🔍 getRecentClinics - final results with reviews:', resultsWithReviews.map(c => ({ 
      name: c.nameRu, 
      reviewsData: c.reviewsData 
    })));

    return resultsWithReviews as (Clinic & { city: City; district: District | null; reviewsData?: { averageRating: number; reviewCount: number } })[];
  }

  // Site settings methods
  async getSiteSetting(key: string): Promise<SiteSetting | undefined> {
    const [setting] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    return setting || undefined;
  }

  async setSiteSetting(key: string, value: string): Promise<SiteSetting> {
    console.log(`🔧 Setting site setting: ${key} = ${value}`);
    try {
      const [setting] = await db
        .insert(siteSettings)
        .values({ key, value })
        .onConflictDoUpdate({
          target: siteSettings.key,
          set: {
            value,
            updatedAt: new Date(),
          },
        })
        .returning();
      console.log(`✅ Site setting saved: ${key} = ${value}`, setting);
      return setting;
    } catch (error) {
      console.error(`❌ Error saving site setting ${key}:`, error);
      throw error;
    }
  }

  async getAllSiteSettings(): Promise<SiteSetting[]> {
    return await db.select().from(siteSettings);
  }

  // Update last data modification date
  async updateLastDataModification(): Promise<void> {
    await this.setSiteSetting('last_data_update', new Date().toISOString());
  }

  // Booking methods
  async createBooking(bookingData: InsertBooking): Promise<Booking> {
    console.log('Storage: Creating booking with data:', bookingData);
    const [booking] = await db.insert(bookings).values(bookingData).returning();
    console.log('Storage: Created booking:', booking);
    return booking;
  }

  async getBookings(): Promise<(Booking & { clinic: Clinic })[]> {
    const results = await db
      .select({
        booking: bookings,
        clinic: clinics,
      })
      .from(bookings)
      .leftJoin(clinics, eq(bookings.clinicId, clinics.id))
      .orderBy(desc(bookings.createdAt));

    return results.map(result => ({
      ...result.booking,
      clinic: result.clinic!,
    }));
  }

  async getBookingById(id: string): Promise<(Booking & { clinic: Clinic }) | undefined> {
    const [result] = await db
      .select({
        booking: bookings,
        clinic: clinics,
      })
      .from(bookings)
      .leftJoin(clinics, eq(bookings.clinicId, clinics.id))
      .where(eq(bookings.id, id));

    if (!result) return undefined;

    return {
      ...result.booking,
      clinic: result.clinic!,
    };
  }

  async updateBookingStatus(id: string, status: string): Promise<Booking> {
    const [booking] = await db
      .update(bookings)
      .set({ status, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }

  async deleteBooking(id: string): Promise<void> {
    await db.delete(bookings).where(eq(bookings.id, id));
  }

  async deleteMultipleBookings(bookingIds: string[]): Promise<void> {
    await db.delete(bookings).where(inArray(bookings.id, bookingIds));
  }

  // Service methods
  async getClinicServices(clinicId: string, language?: string): Promise<Service[]> {
    if (language) {
      return db.select().from(services).where(and(eq(services.clinicId, clinicId), eq(services.language, language)));
    }
    return db.select().from(services).where(eq(services.clinicId, clinicId));
  }

  async updateClinicServices(clinicId: string, serviceData: {name: string, price: number, priceType: string, currency: string}[], language: string = 'ru'): Promise<void> {
    console.log(`🔍 updateClinicServices: clinicId=${clinicId}, language=${language}`);
    console.log(`🔍 Service data type:`, typeof serviceData);
    console.log(`🔍 Service data:`, JSON.stringify(serviceData, null, 2));
    console.log(`🔍 Services count:`, Array.isArray(serviceData) ? serviceData.length : 'Not an array');
    
    // Ensure serviceData is an array
    const servicesArray = Array.isArray(serviceData) ? serviceData : [];
    
    // First delete all existing services for this clinic and language
    await db.delete(services).where(and(eq(services.clinicId, clinicId), eq(services.language, language)));
    console.log(`🔍 Deleted existing services for ${language}`);
    
    // Then insert new services if any
    if (servicesArray.length > 0) {
      const servicesToInsert = servicesArray.map(service => ({
        clinicId,
        name: service.name,
        price: service.price,
        priceType: service.priceType || 'fixed',
        currency: service.currency,
        language
      }));
      
      console.log(`🔍 Inserting ${servicesToInsert.length} services for ${language}:`, servicesToInsert);
      await db.insert(services).values(servicesToInsert);
    }
    
    await this.updateLastDataModification();
    console.log(`🔍 Services updated successfully for ${language}`);
  }

  // Analytics methods
  async recordAnalyticsEvent(event: { clinicId?: string; eventType: string; ipAddress: string; userAgent?: string; referrer?: string }): Promise<void> {
    await db.insert(analyticsEvents).values({
      clinicId: event.clinicId,
      eventType: event.eventType,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      referrer: event.referrer,
    });
  }

  async getAnalyticsStats(period: string, clinicId?: string): Promise<{
    overall: { totalClicks: number; totalClinics: number; topClinic: any };
    clinics: Array<{ id: string; name: string; clicks: { book: number; phone: number; website: number; details: number }; totalClicks: number }>;
    cities: Array<{ id: string; name: string; totalClicks: number; clinicCount: number }>;
    districts: Array<{ id: string; name: string; cityName: string; totalClicks: number; clinicCount: number }>;
  }> {
    console.log(`Getting analytics stats for period: ${period}, clinic: ${clinicId}`);
    
    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '1d':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Build where conditions
    const whereConditions = [gte(analyticsEvents.createdAt, startDate)];
    if (clinicId && clinicId !== 'all') {
      whereConditions.push(eq(analyticsEvents.clinicId, clinicId));
    }

    // Get all events for the period
    const events = await db
      .select({
        clinicId: analyticsEvents.clinicId,
        eventType: analyticsEvents.eventType,
      })
      .from(analyticsEvents)
      .where(and(...whereConditions));
    
    console.log(`Found ${events.length} analytics events for the period`);

    // Get clinic names and location data
    const clinicIds = [...new Set(events.map(e => e.clinicId).filter(Boolean))];
    
    const clinicsData = clinicIds.length > 0 
      ? await db.select({ 
          id: clinics.id, 
          nameRu: clinics.nameRu, 
          nameRo: clinics.nameRo,
          cityId: clinics.cityId,
          districtId: clinics.districtId
        }).from(clinics).where(inArray(clinics.id, clinicIds))
      : [];

    // Get cities and districts data
    const cityIds = [...new Set(clinicsData.map(c => c.cityId).filter(Boolean))];
    const districtIds = [...new Set(clinicsData.map(c => c.districtId).filter(Boolean))];

    const citiesData = cityIds.length > 0 
      ? await db.select({ id: cities.id, nameRu: cities.nameRu, nameRo: cities.nameRo }).from(cities).where(inArray(cities.id, cityIds))
      : [];

    const districtsData = districtIds.length > 0 
      ? await db.select({ 
          id: districts.id, 
          nameRu: districts.nameRu, 
          nameRo: districts.nameRo,
          cityId: districts.cityId
        }).from(districts).where(inArray(districts.id, districtIds))
      : [];

    // Process events
    const clinicStats = new Map<string, {
      id: string;
      name: string;
      clicks: { book: number; phone: number; website: number; details: number };
      totalClicks: number;
    }>();

    // Initialize clinic stats
    clinicsData.forEach(clinic => {
      clinicStats.set(clinic.id, {
        id: clinic.id,
        name: clinic.nameRu, // Используем русское название для аналитики
        clicks: { book: 0, phone: 0, website: 0, details: 0 },
        totalClicks: 0,
      });
    });

    // Initialize city and district stats
    const cityStats = new Map<string, {
      id: string;
      name: string;
      totalClicks: number;
      clinicCount: number;
    }>();

    const districtStats = new Map<string, {
      id: string;
      name: string;
      cityName: string;
      totalClicks: number;
      clinicCount: number;
    }>();

    // Initialize city stats
    citiesData.forEach(city => {
      cityStats.set(city.id, {
        id: city.id,
        name: city.nameRu,
        totalClicks: 0,
        clinicCount: 0,
      });
    });

    // Initialize district stats
    districtsData.forEach(district => {
      const city = citiesData.find(c => c.id === district.cityId);
      districtStats.set(district.id, {
        id: district.id,
        name: district.nameRu,
        cityName: city?.nameRu || 'Неизвестный город',
        totalClicks: 0,
        clinicCount: 0,
      });
    });

    // Count events
    console.log(`Processing ${events.length} events for analytics`);
    console.log(`Found ${clinicsData.length} clinics with location data`);
    console.log(`Found ${citiesData.length} cities`);
    console.log(`Found ${districtsData.length} districts`);

    events.forEach(event => {
      if (!event.clinicId) return;
      
      const stats = clinicStats.get(event.clinicId);
      if (!stats) return;

      const clinic = clinicsData.find(c => c.id === event.clinicId);
      if (!clinic) return;

      if (event.eventType === 'view') {
        // Игнорируем просмотры в статистике
      } else if (event.eventType === 'click_details') {
        stats.clicks.details++;
        stats.totalClicks++;
      } else if (event.eventType === 'click_book') {
        stats.clicks.book++;
        stats.totalClicks++;
      } else if (event.eventType === 'click_phone') {
        stats.clicks.phone++;
        stats.totalClicks++;
      } else if (event.eventType === 'click_website') {
        stats.clicks.website++;
        stats.totalClicks++;
      }

      // Update city stats
      if (clinic.cityId && event.eventType !== 'view') {
        const cityStat = cityStats.get(clinic.cityId);
        if (cityStat) {
          cityStat.totalClicks++;
        }
      }

      // Update district stats
      if (clinic.districtId && event.eventType !== 'view') {
        const districtStat = districtStats.get(clinic.districtId);
        if (districtStat) {
          districtStat.totalClicks++;
        }
      }
    });

    // Count clinics per city and district
    clinicsData.forEach(clinic => {
      if (clinic.cityId) {
        const cityStat = cityStats.get(clinic.cityId);
        if (cityStat) {
          cityStat.clinicCount++;
        }
      }
      
      if (clinic.districtId) {
        const districtStat = districtStats.get(clinic.districtId);
        if (districtStat) {
          districtStat.clinicCount++;
        }
      }
    });

    console.log('Final city stats:', Array.from(cityStats.values()).map(c => `${c.name}: ${c.totalClicks} clicks, ${c.clinicCount} clinics`));
    console.log('Final district stats:', Array.from(districtStats.values()).map(d => `${d.name} (${d.cityName}): ${d.totalClicks} clicks, ${d.clinicCount} clinics`));

    // Calculate overall stats
    const overallStats = {
      totalClicks: 0,
      totalClinics: clinicStats.size,
      topClinic: null as any,
    };

    let maxClicks = 0;
    clinicStats.forEach(stats => {
      overallStats.totalClicks += stats.totalClicks;
      
      if (stats.totalClicks > maxClicks) {
        maxClicks = stats.totalClicks;
        overallStats.topClinic = stats;
      }
    });

    const result = {
      overall: overallStats,
      clinics: Array.from(clinicStats.values()).sort((a, b) => b.totalClicks - a.totalClicks),
      cities: Array.from(cityStats.values()).sort((a, b) => b.totalClicks - a.totalClicks),
      districts: Array.from(districtStats.values()).sort((a, b) => b.totalClicks - a.totalClicks),
    };
    
    console.log(`Returning stats: ${result.overall.totalClicks} total clicks, ${result.clinics.length} clinics, ${result.cities.length} cities, ${result.districts.length} districts`);
    console.log('City stats:', result.cities.map(c => `${c.name}: ${c.totalClicks} clicks`));
    console.log('District stats:', result.districts.map(d => `${d.name} (${d.cityName}): ${d.totalClicks} clicks`));
    
    return result;
  }

  async clearAnalyticsStats(): Promise<void> {
    console.log('Clearing analytics stats...');
    
    // Очищаем все аналитические события
    const analyticsResult = await db.delete(analyticsEvents);
    console.log('Analytics events cleared:', analyticsResult);
    
    // Очищаем все просмотры сайта
    const viewsResult = await db.delete(siteViews);
    console.log('Site views cleared:', viewsResult);
    
    console.log('Analytics stats cleared successfully');
  }

  // Data protection methods implementation
  async createBackup(backupType: 'full' | 'clinics' | 'cities' | 'manual', description?: string, createdBy?: string): Promise<string> {
    return await DataProtection.createBackup({ backupType, description, createdBy });
  }

  async restoreFromBackup(backupId: string, options?: { restoreType?: 'full' | 'partial'; tables?: string[]; userId?: string }): Promise<void> {
    await DataProtection.restoreFromBackup(backupId, options);
  }

  async getBackups(limit = 20): Promise<any[]> {
    return await DataProtection.getBackups(limit);
  }

  async getAuditLogs(filters: { tableName?: string; recordId?: string; action?: string; userId?: string; limit?: number; offset?: number } = {}): Promise<{ logs: any[]; total: number }> {
    return await DataProtection.getAuditLogs(filters);
  }

  async getProtectionStats(): Promise<{ totalBackups: number; totalAuditLogs: number; lastBackupDate: string | null; protectedTables: string[] }> {
    return await DataProtection.getProtectionStats();
  }

  async setProtectionSetting(key: string, value: string, description?: string): Promise<void> {
    await DataProtection.setProtectionSetting(key, value, description);
  }

  async cleanupOldBackups(keepDays = 30): Promise<number> {
    return await DataProtection.cleanupOldBackups(keepDays);
  }

  async getPriceRange(): Promise<{ min: number; max: number }> {
    // Get price range from packages table
    const [minResult] = await db
      .select({ min: sql<number>`min(price_min)` })
      .from(packages);
    
    const [maxResult] = await db
      .select({ max: sql<number>`max(price_max)` })
      .from(packages);
    
    return {
      min: minResult?.min || 0,
      max: maxResult?.max || 1000
    };
  }

  // Verification requests methods implementation
  async createVerificationRequest(request: InsertVerificationRequest): Promise<VerificationRequest> {
    console.log('🔍 Creating verification request:', request);
    
    const [newRequest] = await db
      .insert(verificationRequests)
      .values(request)
      .returning();
    
    console.log('✅ Verification request created:', newRequest);
    return newRequest;
  }

  async getVerificationRequests(filters: { status?: string; limit?: number; offset?: number } = {}): Promise<{ requests: (VerificationRequest & { clinic: Clinic })[]; total: number }> {
    console.log('🔍 Getting verification requests with filters:', filters);
    
    const { status, limit = 50, offset = 0 } = filters;
    
    let query = db
      .select()
      .from(verificationRequests)
      .leftJoin(clinics, eq(verificationRequests.clinicId, clinics.id));
    
    if (status) {
      query = query.where(eq(verificationRequests.status, status));
    }
    
    const totalQuery = db
      .select({ count: count() })
      .from(verificationRequests);
    
    if (status) {
      totalQuery.where(eq(verificationRequests.status, status));
    }
    
    const [totalResult] = await totalQuery;
    const total = totalResult?.count || 0;
    
    const requests = await query
      .orderBy(desc(verificationRequests.createdAt))
      .limit(limit)
      .offset(offset);
    
    console.log(`✅ Found ${requests.length} verification requests (total: ${total})`);
    
    return {
      requests: requests.map(row => ({
        ...row.verification_requests,
        clinic: row.clinics
      })),
      total
    };
  }

  async getVerificationRequestById(id: string): Promise<(VerificationRequest & { clinic: Clinic }) | undefined> {
    console.log('🔍 Getting verification request by ID:', id);
    
    const [result] = await db
      .select()
      .from(verificationRequests)
      .leftJoin(clinics, eq(verificationRequests.clinicId, clinics.id))
      .where(eq(verificationRequests.id, id));
    
    if (!result) {
      console.log('❌ Verification request not found');
      return undefined;
    }
    
    console.log('✅ Verification request found:', result.verification_requests);
    
    return {
      ...result.verification_requests,
      clinic: result.clinics
    };
  }

  async updateVerificationRequestStatus(id: string, status: 'approved' | 'rejected', notes?: string): Promise<VerificationRequest> {
    console.log('🔍 Updating verification request status:', { id, status, notes });
    
    const [updatedRequest] = await db
      .update(verificationRequests)
      .set({ 
        status, 
        notes, 
        updatedAt: new Date() 
      })
      .where(eq(verificationRequests.id, id))
      .returning();
    
    console.log('✅ Verification request status updated:', updatedRequest);
    return updatedRequest;
  }

  async getPendingVerificationCount(): Promise<number> {
    console.log('🔍 Getting pending verification count');
    
    try {
      // Используем другой подход - получаем все записи и считаем их
      const allRequests = await db
        .select()
        .from(verificationRequests)
        .where(eq(verificationRequests.status, 'pending'));
      
      const pendingCount = allRequests.length;
      console.log(`✅ Pending verification count: ${pendingCount}`);
      
      return pendingCount;
    } catch (error) {
      console.error('❌ Error getting pending verification count:', error);
      return 0;
    }
  }

  async deleteVerificationRequest(id: string): Promise<void> {
    console.log('🔍 Deleting verification request:', id);
    
    try {
      await db
        .delete(verificationRequests)
        .where(eq(verificationRequests.id, id));
      
      console.log('✅ Verification request deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting verification request:', error);
      throw error;
    }
  }

  // New clinic requests methods implementation
  async createNewClinicRequest(request: InsertNewClinicRequest): Promise<NewClinicRequest> {
    console.log('🔍 Creating new clinic request:', request);
    
    const [newRequest] = await db
      .insert(newClinicRequests)
      .values(request)
      .returning();
    
    console.log('✅ New clinic request created:', newRequest);
    return newRequest;
  }

  async getNewClinicRequests(filters: { status?: string; limit?: number; offset?: number } = {}): Promise<{ requests: NewClinicRequest[]; total: number }> {
    console.log('🔍 Getting new clinic requests with filters:', filters);
    
    const { status, limit = 50, offset = 0 } = filters;
    
    let query = db
      .select()
      .from(newClinicRequests);
    
    if (status) {
      query = query.where(eq(newClinicRequests.status, status));
    }
    
    const totalQuery = db
      .select({ count: count() })
      .from(newClinicRequests);
    
    if (status) {
      totalQuery.where(eq(newClinicRequests.status, status));
    }
    
    const [totalResult] = await totalQuery;
    const total = totalResult?.count || 0;
    
    const requests = await query
      .orderBy(desc(newClinicRequests.createdAt))
      .limit(limit)
      .offset(offset);
    
    console.log(`✅ Found ${requests.length} new clinic requests (total: ${total})`);
    
    return {
      requests: requests,
      total
    };
  }

  async getNewClinicRequestById(id: string): Promise<NewClinicRequest | undefined> {
    console.log('🔍 Getting new clinic request by ID:', id);
    
    const [result] = await db
      .select()
      .from(newClinicRequests)
      .where(eq(newClinicRequests.id, id));
    
    if (!result) {
      console.log('❌ New clinic request not found');
      return undefined;
    }
    
    console.log('✅ New clinic request found:', result);
    
    return result;
  }

  async updateNewClinicRequestStatus(id: string, status: 'approved' | 'rejected', notes?: string): Promise<NewClinicRequest> {
    console.log('🔍 Updating new clinic request status:', { id, status, notes });
    
    const [updatedRequest] = await db
      .update(newClinicRequests)
      .set({ 
        status, 
        notes, 
        updatedAt: new Date() 
      })
      .where(eq(newClinicRequests.id, id))
      .returning();
    
    console.log('✅ New clinic request status updated:', updatedRequest);
    return updatedRequest;
  }

  async getPendingNewClinicCount(): Promise<number> {
    console.log('🔍 Getting pending new clinic requests count');
    
    try {
      // Используем другой подход - получаем все записи и считаем их
      const allRequests = await db
        .select()
        .from(newClinicRequests)
        .where(eq(newClinicRequests.status, 'pending'));
      
      const pendingCount = allRequests.length;
      console.log(`✅ Pending new clinic requests count: ${pendingCount}`);
      
      return pendingCount;
    } catch (error) {
      console.error('❌ Error getting pending new clinic requests count:', error);
      return 0;
    }
  }

  async deleteNewClinicRequest(id: string): Promise<void> {
    console.log('🔍 Deleting new clinic request:', id);
    
    try {
      await db
        .delete(newClinicRequests)
        .where(eq(newClinicRequests.id, id));
      
      console.log('✅ New clinic request deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting new clinic request:', error);
      throw error;
    }
  }

  // Working hours methods
  async getClinicWorkingHours(clinicId: string): Promise<WorkingHours[]> {
    console.log('🔍 Getting working hours for clinic:', clinicId);
    
    const results = await db
      .select()
      .from(workingHours)
      .where(eq(workingHours.clinicId, clinicId))
      .orderBy(asc(workingHours.dayOfWeek));
    
    console.log(`✅ Found ${results.length} working hours records for clinic ${clinicId}`);
    
    return results;
  }

  async updateClinicWorkingHours(clinicId: string, workingHoursData: Omit<InsertWorkingHours, 'clinicId'>[]): Promise<void> {
    console.log('🔍 Updating working hours for clinic:', clinicId);
    console.log('🔍 Working hours data:', JSON.stringify(workingHoursData, null, 2));
    
    try {
      // Delete existing working hours for this clinic
      await db
        .delete(workingHours)
        .where(eq(workingHours.clinicId, clinicId));
      
      // Insert new working hours
      if (workingHoursData.length > 0) {
        const workingHoursToInsert = workingHoursData.map(wh => ({
          ...wh,
          clinicId
        }));
        
        await db
          .insert(workingHours)
          .values(workingHoursToInsert);
      }
      
      console.log('✅ Working hours updated successfully for clinic:', clinicId);
    } catch (error) {
      console.error('❌ Error updating working hours:', error);
      throw error;
    }
  }

  async getSubscriptionStats(): Promise<{
    totalRevenue: number;
    activeSubscriptions: number;
    monthlyRevenue: number;
    expiringSoon: number;
    topPackages: Array<{ name: string; count: number; revenue: number }>;
  }> {
    console.log('🔍 Getting subscription statistics');
    
    try {
      // Поскольку данные подписок хранятся в localStorage на клиенте,
      // а сервер не имеет доступа к localStorage, мы будем возвращать
      // базовую структуру, а реальные данные будут загружаться на клиенте
      
      // В будущем, когда будет база данных для подписок, здесь будет реальная логика
      const stats = {
        totalRevenue: 0,
        activeSubscriptions: 0,
        monthlyRevenue: 0,
        expiringSoon: 0,
        topPackages: []
      };
      
      console.log('✅ Subscription stats (server):', stats);
      return stats;
    } catch (error) {
      console.error('❌ Error getting subscription stats:', error);
      return {
        totalRevenue: 0,
        activeSubscriptions: 0,
        monthlyRevenue: 0,
        expiringSoon: 0,
        topPackages: []
      };
    }
  }

  // ===== REVIEWS METHODS =====
  
  async createReview(review: InsertReview): Promise<Review> {
    console.log('🔍 Creating review:', review);
    
    const [newReview] = await db
      .insert(reviews)
      .values(review)
      .returning();
    
    console.log('✅ Review created:', newReview);
    return newReview;
  }

  async getReviews(filters: { status?: string; clinicId?: string; limit?: number; offset?: number } = {}): Promise<{ reviews: (Review & { clinic: Clinic })[]; total: number }> {
    console.log('🔍 Getting reviews with filters:', filters);
    
    const { status, clinicId, limit = 50, offset = 0 } = filters;
    
    let query = db
      .select()
      .from(reviews)
      .leftJoin(clinics, eq(reviews.clinicId, clinics.id));
    
    if (status) {
      query = query.where(eq(reviews.status, status));
    }
    
    if (clinicId) {
      query = query.where(eq(reviews.clinicId, clinicId));
    }
    
    const totalQuery = db
      .select({ count: count() })
      .from(reviews);
    
    if (status) {
      totalQuery.where(eq(reviews.status, status));
    }
    
    if (clinicId) {
      totalQuery.where(eq(reviews.clinicId, clinicId));
    }
    
    const [totalResult] = await totalQuery;
    const total = totalResult?.count || 0;
    
    const reviewsData = await query
      .orderBy(desc(reviews.createdAt))
      .limit(limit)
      .offset(offset);
    
    const formattedReviews = reviewsData.map(row => ({
      ...row.reviews,
      clinic: row.clinics
    }));
    
    console.log(`✅ Found ${formattedReviews.length} reviews (total: ${total})`);
    return {
      reviews: formattedReviews,
      total
    };
  }

  async getReviewById(id: string): Promise<(Review & { clinic: Clinic }) | undefined> {
    console.log('🔍 Getting review by ID:', id);
    
    const result = await db
      .select()
      .from(reviews)
      .leftJoin(clinics, eq(reviews.clinicId, clinics.id))
      .where(eq(reviews.id, id))
      .limit(1);
    
    if (result.length === 0) {
      console.log('❌ Review not found');
      return undefined;
    }
    
    const review = result[0];
    console.log('✅ Review found:', review.reviews.id);
    
    return {
      ...review.reviews,
      clinic: review.clinics
    };
  }

  async updateReviewStatus(id: string, status: 'approved' | 'rejected' | 'pending'): Promise<Review> {
    console.log('🔍 Updating review status:', id, 'to', status);
    
    const updateData: any = {
      status,
      updatedAt: new Date()
    };
    
    if (status === 'approved') {
      updateData.approvedAt = new Date();
    } else if (status === 'rejected') {
      updateData.rejectedAt = new Date();
    }
    
    const [updatedReview] = await db
      .update(reviews)
      .set(updateData)
      .where(eq(reviews.id, id))
      .returning();
    
    console.log('✅ Review status updated:', updatedReview.id);
    return updatedReview;
  }

  async deleteReview(id: string): Promise<void> {
    console.log('🗑️ Deleting review:', id);
    
    await db
      .delete(reviews)
      .where(eq(reviews.id, id));
    
    console.log('✅ Review deleted:', id);
  }
}

export const storage = new DatabaseStorage();
