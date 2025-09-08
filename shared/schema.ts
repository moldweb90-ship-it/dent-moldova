import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, json, decimal, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const cities = pgTable("cities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nameRu: text("name_ru").notNull(),
  nameRo: text("name_ro").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const districts = pgTable("districts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cityId: varchar("city_id").notNull().references(() => cities.id),
  nameRu: text("name_ru").notNull(),
  nameRo: text("name_ro").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const clinics = pgTable("clinics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: varchar("slug").notNull().unique(),
  nameRu: text("name_ru").notNull(),
  nameRo: text("name_ro").notNull(),
  logoUrl: text("logo_url"),
  cityId: varchar("city_id").notNull().references(() => cities.id),
  districtId: varchar("district_id", { length: 255 }).references(() => districts.id, { onDelete: 'set null' }),
  addressRu: text("address_ru"),
  addressRo: text("address_ro"),
  phone: text("phone"),
  website: text("website"),
  bookingUrl: text("booking_url"),
  languages: json("languages").$type<string[]>().default([]),
  specializations: json("specializations").$type<string[]>().default([]),
  tags: json("tags").$type<string[]>().default([]),
  verified: boolean("verified").default(false),

  availToday: boolean("avail_today").default(false),
  availTomorrow: boolean("avail_tomorrow").default(false),
  priceIndex: integer("price_index").notNull(),
  trustIndex: integer("trust_index").notNull(),
  reviewsIndex: integer("reviews_index").notNull(),
  accessIndex: integer("access_index").notNull(),
  dScore: integer("d_score").notNull(),


  doctorExperience: integer("doctor_experience").default(0), // Опыт врачей в годах
  hasLicenses: boolean("has_licenses").default(false), // Есть лицензии
  hasCertificates: boolean("has_certificates").default(false), // Есть сертификаты
  onlineBooking: boolean("online_booking").default(false), // Онлайн запись
  weekendWork: boolean("weekend_work").default(false), // Работа в выходные
  eveningWork: boolean("evening_work").default(false), // Работа вечером
  urgentCare: boolean("urgent_care").default(false), // Срочный прием
  convenientLocation: boolean("convenient_location").default(false), // Удобное расположение
  installmentPlan: boolean("installment_plan").default(false), // Рассрочка
  hasPromotions: boolean("has_promotions").default(false), // Есть акции
  // Новые характеристики для ценовой политики
  publishedPricing: boolean("published_pricing").default(false), // Опубликован прайс на сайте/в приложении
  freeConsultation: boolean("free_consultation").default(false), // Бесплатная консультация
  interestFreeInstallment: boolean("interest_free_installment").default(false), // Рассрочка без %
  implantWarranty: boolean("implant_warranty").default(false), // Гарантия на импланты/работы
  popularServicesPromotions: boolean("popular_services_promotions").default(false), // Акции на популярные услуги
  onlinePriceCalculator: boolean("online_price_calculator").default(false), // Онлайн-калькулятор стоимости
  // Новые характеристики для фильтрации
  pediatricDentistry: boolean("pediatric_dentistry").default(false), // Детская стоматология
  parking: boolean("parking").default(false), // Парковка
  sos: boolean("sos").default(false), // SOS
 // SOS кнопка включена
  work24h: boolean("work_24h").default(false), // 24/7
  credit: boolean("credit").default(false), // Рассрочка/кредит
  sosEnabled: boolean("sos_enabled").default(false),
  // Google рейтинг
  googleRating: decimal("google_rating", { precision: 3, scale: 1 }),
  googleReviewsCount: integer("google_reviews_count"),
  recommended: boolean("recommended").default(false),
  promotionalLabels: json("promotional_labels").$type<string[]>().default([]),
  currency: varchar("currency").notNull().default("MDL"), // MDL, EUR, USD
  // SEO fields
  seoTitleRu: text("seo_title_ru"), // Page title (до 60 символов)
  seoTitleRo: text("seo_title_ro"), // Page title (до 60 символов)
  seoDescriptionRu: text("seo_description_ru"), // Meta description (до 160 символов)
  seoDescriptionRo: text("seo_description_ro"), // Meta description (до 160 символов)
  seoKeywordsRu: text("seo_keywords_ru"), // Keywords (через запятую)
  seoKeywordsRo: text("seo_keywords_ro"), // Keywords (через запятую)
  seoH1Ru: text("seo_h1_ru"), // H1 заголовок страницы
  seoH1Ro: text("seo_h1_ro"), // H1 заголовок страницы
  ogTitleRu: text("og_title_ru"), // Open Graph title
  ogTitleRo: text("og_title_ro"), // Open Graph title
  ogDescriptionRu: text("og_description_ru"), // Open Graph description
  ogDescriptionRo: text("og_description_ro"), // Open Graph description
  ogImage: text("og_image"), // Open Graph image
  seoCanonical: text("seo_canonical"), // Canonical URL
  seoRobots: varchar("seo_robots").default("index,follow"), // Robots meta
  seoPriority: decimal("seo_priority", { precision: 2, scale: 1 }).default("0.5"), // Sitemap priority
  seoSchemaType: varchar("seo_schema_type").default("Dentist"), // Schema.org type
  seoSchemaData: json("seo_schema_data").$type<object>(), // Additional Schema.org data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const workingHours = pgTable("working_hours", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clinicId: varchar("clinic_id").notNull().references(() => clinics.id, { onDelete: 'cascade' }),
  dayOfWeek: integer("day_of_week").notNull(), // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  isOpen: boolean("is_open").notNull().default(true),
  openTime: varchar("open_time"), // Format: "09:00"
  closeTime: varchar("close_time"), // Format: "18:00"
  breakStartTime: varchar("break_start_time"), // Format: "13:00" (optional)
  breakEndTime: varchar("break_end_time"), // Format: "14:00" (optional)
  is24Hours: boolean("is_24_hours").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const packages = pgTable("packages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clinicId: varchar("clinic_id").notNull().references(() => clinics.id),
  code: varchar("code").notNull(), // "implant_standard" | "hygiene_pro" | "rct_molar"
  nameRu: text("name_ru").notNull(),
  nameRo: text("name_ro").notNull(),
  priceMin: integer("price_min").notNull(),
  priceMax: integer("price_max").notNull(),
  priceMedian: integer("price_median").notNull(),
});

// Services table for custom clinic services managed by admin
export const services = pgTable("services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clinicId: varchar("clinic_id").notNull().references(() => clinics.id),
  name: text("name").notNull(),
  price: integer("price").notNull(), // Base price
  priceType: varchar("price_type").notNull().default("fixed"), // "fixed" | "from"
  currency: varchar("currency").notNull().default("MDL"), // MDL, EUR, USD
  language: varchar("language").notNull().default("ru"), // ru, ro
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// View tracking table for real IP-based analytics
export const siteViews = pgTable("site_views", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ipAddress: varchar("ip_address").notNull(),
  userAgent: text("user_agent"),
  route: varchar("route").notNull(),
  clinicId: varchar("clinic_id").references(() => clinics.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Site settings table for admin configuration
export const siteSettings = pgTable("site_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key").notNull().unique(),
  value: text("value"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Analytics events table for tracking user interactions
export const analyticsEvents = pgTable("analytics_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clinicId: varchar("clinic_id").references(() => clinics.id),
  eventType: varchar("event_type").notNull(), // 'view', 'click_details', 'click_book', 'click_phone', 'click_website'
  ipAddress: varchar("ip_address").notNull(),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Bookings table for clinic appointment requests
export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clinicId: varchar("clinic_id").notNull().references(() => clinics.id),
  firstName: text("first_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  contactMethod: varchar("contact_method"), // phone, email, whatsapp, telegram
  service: text("service").notNull(),
  preferredDate: text("preferred_date").notNull(),
  preferredTime: text("preferred_time").notNull(),
  notes: text("notes"),
  status: varchar("status").notNull().default("new"), // new, contacted, confirmed, completed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Backup and audit tables for data protection
export const dataBackups = pgTable("data_backups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  backupType: varchar("backup_type").notNull(), // 'full', 'clinics', 'cities', 'manual'
  description: text("description"),
  dataSize: integer("data_size"), // Size in bytes
  recordCount: integer("record_count"), // Number of records backed up
  backupData: json("backup_data").notNull(), // Actual backup data
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: varchar("created_by"), // Admin username or 'system'
});

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tableName: varchar("table_name").notNull(), // 'clinics', 'cities', etc.
  recordId: varchar("record_id").notNull(),
  action: varchar("action").notNull(), // 'create', 'update', 'delete', 'restore'
  oldData: json("old_data"), // Previous state for updates/deletes
  newData: json("new_data"), // New state for creates/updates
  changedFields: json("changed_fields").$type<string[]>(), // Fields that were modified
  userId: varchar("user_id"), // Admin user who made the change
  userIp: varchar("user_ip"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dataProtectionSettings = pgTable("data_protection_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const verificationRequests = pgTable('verification_requests', {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clinicId: varchar("clinic_id").notNull().references(() => clinics.id),
  clinicName: text('clinic_name').notNull(),
  clinicAddress: text('clinic_address'),
  requesterEmail: text('requester_email').notNull(),
  requesterPhone: text('requester_phone').notNull(),
  status: varchar("status").notNull().default("pending"), // pending, approved, rejected
  notes: text('notes'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const newClinicRequests = pgTable('new_clinic_requests', {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clinicName: text("clinic_name").notNull(),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone").notNull(),
  city: text("city"),
  address: text("address"),
  website: text("website"),
  specializations: text("specializations").array().$type<string[]>(),
  description: text("description"),
  workingHours: json("working_hours").$type<any[]>(), // Working hours data
  status: varchar("status").notNull().default("pending"), // pending, approved, rejected
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const citiesRelations = relations(cities, ({ many }) => ({
  districts: many(districts),
  clinics: many(clinics),
}));

export const districtsRelations = relations(districts, ({ one, many }) => ({
  city: one(cities, {
    fields: [districts.cityId],
    references: [cities.id],
  }),
  clinics: many(clinics),
}));

export const clinicsRelations = relations(clinics, ({ one, many }) => ({
  city: one(cities, {
    fields: [clinics.cityId],
    references: [cities.id],
  }),
  district: one(districts, {
    fields: [clinics.districtId],
    references: [districts.id],
  }),
  packages: many(packages),
  services: many(services),
}));

export const packagesRelations = relations(packages, ({ one }) => ({
  clinic: one(clinics, {
    fields: [packages.clinicId],
    references: [clinics.id],
  }),
}));

export const servicesRelations = relations(services, ({ one }) => ({
  clinic: one(clinics, {
    fields: [services.clinicId],
    references: [clinics.id],
  }),
}));

export const siteViewsRelations = relations(siteViews, ({ one }) => ({
  clinic: one(clinics, {
    fields: [siteViews.clinicId],
    references: [clinics.id],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  clinic: one(clinics, {
    fields: [bookings.clinicId],
    references: [clinics.id],
  }),
}));

export const analyticsEventsRelations = relations(analyticsEvents, ({ one }) => ({
  clinic: one(clinics, {
    fields: [analyticsEvents.clinicId],
    references: [clinics.id],
  }),
}));

export const dataBackupsRelations = relations(dataBackups, ({}) => ({}));
export const auditLogsRelations = relations(auditLogs, ({}) => ({}));
export const dataProtectionSettingsRelations = relations(dataProtectionSettings, ({}) => ({}));
export const verificationRequestsRelations = relations(verificationRequests, ({ one }) => ({
  clinic: one(clinics, {
    fields: [verificationRequests.clinicId],
    references: [clinics.id],
  }),
}));

// Insert schemas
export const insertCitySchema = createInsertSchema(cities).omit({
  id: true,
  createdAt: true,
});

export const insertDistrictSchema = createInsertSchema(districts).omit({
  id: true,
  createdAt: true,
});

export const insertClinicSchema = createInsertSchema(clinics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPackageSchema = createInsertSchema(packages).omit({
  id: true,
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSiteViewSchema = createInsertSchema(siteViews).omit({
  id: true,
  createdAt: true,
});

export const insertSiteSettingSchema = createInsertSchema(siteSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDataBackupSchema = createInsertSchema(dataBackups).omit({
  id: true,
  createdAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export const insertDataProtectionSettingSchema = createInsertSchema(dataProtectionSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertVerificationRequestSchema = createInsertSchema(verificationRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNewClinicRequestSchema = createInsertSchema(newClinicRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWorkingHoursSchema = createInsertSchema(workingHours).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type City = typeof cities.$inferSelect;
export type District = typeof districts.$inferSelect;
export type Clinic = typeof clinics.$inferSelect;
export type Package = typeof packages.$inferSelect;
export type Service = typeof services.$inferSelect;
export type SiteView = typeof siteViews.$inferSelect;
export type SiteSetting = typeof siteSettings.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type DataBackup = typeof dataBackups.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type DataProtectionSetting = typeof dataProtectionSettings.$inferSelect;
export type VerificationRequest = typeof verificationRequests.$inferSelect;
export type NewClinicRequest = typeof newClinicRequests.$inferSelect;
export type WorkingHours = typeof workingHours.$inferSelect;

export type InsertCity = z.infer<typeof insertCitySchema>;
export type InsertDistrict = z.infer<typeof insertDistrictSchema>;
export type InsertClinic = z.infer<typeof insertClinicSchema>;
export type InsertPackage = z.infer<typeof insertPackageSchema>;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type InsertSiteView = z.infer<typeof insertSiteViewSchema>;
export type InsertSiteSetting = z.infer<typeof insertSiteSettingSchema>;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type InsertDataBackup = z.infer<typeof insertDataBackupSchema>;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type InsertDataProtectionSetting = z.infer<typeof insertDataProtectionSettingSchema>;
export type InsertVerificationRequest = z.infer<typeof insertVerificationRequestSchema>;
export type InsertNewClinicRequest = z.infer<typeof insertNewClinicRequestSchema>;
export type InsertWorkingHours = z.infer<typeof insertWorkingHoursSchema>;

// Keep existing user schema for compatibility
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Reviews table for clinic reviews
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clinicId: varchar("clinic_id").notNull().references(() => clinics.id, { onDelete: 'cascade' }),
  authorName: varchar("author_name", { length: 255 }),
  authorEmail: varchar("author_email", { length: 255 }),
  authorPhone: varchar("author_phone", { length: 50 }),
  
  // Рейтинги (1-5 с половинками)
  qualityRating: decimal("quality_rating", { precision: 2, scale: 1 }).notNull(),
  serviceRating: decimal("service_rating", { precision: 2, scale: 1 }).notNull(),
  comfortRating: decimal("comfort_rating", { precision: 2, scale: 1 }).notNull(),
  priceRating: decimal("price_rating", { precision: 2, scale: 1 }).notNull(),
  averageRating: decimal("average_rating", { precision: 2, scale: 1 }).notNull(),
  
  // Текстовый отзыв
  comment: text("comment"),
  
  // Статус модерации
  status: varchar("status", { length: 20 }).notNull().default('pending'), // pending, approved, rejected
  
  // Метаданные
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  
  // Временные метки
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  approvedAt: timestamp("approved_at"),
  rejectedAt: timestamp("rejected_at"),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;
