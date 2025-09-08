import { sql, relations } from "drizzle-orm";
import { sqliteTable, text, integer, blob, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const cities = sqliteTable("cities", {
  id: text("id").primaryKey(),
  nameRu: text("name_ru").notNull(),
  nameRo: text("name_ro").notNull(),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const districts = sqliteTable("districts", {
  id: text("id").primaryKey(),
  cityId: text("city_id").notNull().references(() => cities.id),
  nameRu: text("name_ru").notNull(),
  nameRo: text("name_ro").notNull(),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const clinics = sqliteTable("clinics", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  nameRu: text("name_ru").notNull(),
  nameRo: text("name_ro").notNull(),
  logoUrl: text("logo_url"),
  cityId: text("city_id").notNull().references(() => cities.id),
  districtId: text("district_id").references(() => districts.id),
  addressRu: text("address_ru"),
  addressRo: text("address_ro"),
  phone: text("phone"),
  website: text("website"),
  bookingUrl: text("booking_url"),
  languages: text("languages", { mode: 'json' }).$type<string[]>().default([]),
  specializations: text("specializations", { mode: 'json' }).$type<string[]>().default([]),
  tags: text("tags", { mode: 'json' }).$type<string[]>().default([]),
  verified: integer("verified", { mode: 'boolean' }).default(false),

  availToday: integer("avail_today", { mode: 'boolean' }).default(false),
  availTomorrow: integer("avail_tomorrow", { mode: 'boolean' }).default(false),
  priceIndex: integer("price_index").notNull(),
  trustIndex: integer("trust_index").notNull(),
  reviewsIndex: integer("reviews_index").notNull(),
  accessIndex: integer("access_index").notNull(),
  dScore: integer("d_score").notNull(),


  doctorExperience: integer("doctor_experience").default(0),
  hasLicenses: integer("has_licenses", { mode: 'boolean' }).default(false),
  hasCertificates: integer("has_certificates", { mode: 'boolean' }).default(false),
  onlineBooking: integer("online_booking", { mode: 'boolean' }).default(false),
  weekendWork: integer("weekend_work", { mode: 'boolean' }).default(false),
  eveningWork: integer("evening_work", { mode: 'boolean' }).default(false),
  urgentCare: integer("urgent_care", { mode: 'boolean' }).default(false),
  convenientLocation: integer("convenient_location", { mode: 'boolean' }).default(false),
  installmentPlan: integer("installment_plan", { mode: 'boolean' }).default(false),
  hasPromotions: integer("has_promotions", { mode: 'boolean' }).default(false),
  // Новые характеристики для ценовой политики
  publishedPricing: integer("published_pricing", { mode: 'boolean' }).default(false),
  freeConsultation: integer("free_consultation", { mode: 'boolean' }).default(false),
  interestFreeInstallment: integer("interest_free_installment", { mode: 'boolean' }).default(false),
  implantWarranty: integer("implant_warranty", { mode: 'boolean' }).default(false),
  popularServicesPromotions: integer("popular_services_promotions", { mode: 'boolean' }).default(false),
  onlinePriceCalculator: integer("online_price_calculator", { mode: 'boolean' }).default(false),
  // Новые характеристики для фильтрации
  pediatricDentistry: integer("pediatric_dentistry", { mode: 'boolean' }).default(false),
  parking: integer("parking", { mode: 'boolean' }).default(false),
  sos: integer("sos", { mode: 'boolean' }).default(false),
  sosEnabled: integer("sos_enabled", { mode: 'boolean' }).default(false),
  // Google рейтинг
  googleRating: real("google_rating"),
  googleReviewsCount: integer("google_reviews_count"),

  work24h: integer("work_24h", { mode: 'boolean' }).default(false),
  credit: integer("credit", { mode: 'boolean' }).default(false),
  recommended: integer("recommended", { mode: 'boolean' }).default(false),
  promotionalLabels: text("promotional_labels", { mode: 'json' }).$type<string[]>().default([]),
  currency: text("currency").default("MDL"),
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
  seoRobots: text("seo_robots").default("index,follow"), // Robots meta
  seoPriority: real("seo_priority").default(0.5), // Sitemap priority
  seoSchemaType: text("seo_schema_type").default("Dentist"), // Schema.org type
  seoSchemaData: text("seo_schema_data", { mode: 'json' }).$type<object>(), // Additional Schema.org data
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const services = sqliteTable("services", {
  id: text("id").primaryKey(),
  clinicId: text("clinic_id").notNull().references(() => clinics.id),
  nameRu: text("name_ru").notNull(),
  nameRo: text("name_ro").notNull(),
  price: integer("price"),
  currency: text("currency").default("MDL"),
  language: text("language").default("ru"),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const packages = sqliteTable("packages", {
  id: text("id").primaryKey(),
  clinicId: text("clinic_id").notNull().references(() => clinics.id),
  nameRu: text("name_ru").notNull(),
  nameRo: text("name_ro").notNull(),
  descriptionRu: text("description_ru"),
  descriptionRo: text("description_ro"),
  price: integer("price"),
  currency: text("currency").default("MDL"),
  language: text("language").default("ru"),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`(unixepoch())`),
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
  services: many(services),
  packages: many(packages),
}));

export const servicesRelations = relations(services, ({ one }) => ({
  clinic: one(clinics, {
    fields: [services.clinicId],
    references: [clinics.id],
  }),
}));

export const packagesRelations = relations(packages, ({ one }) => ({
  clinic: one(clinics, {
    fields: [packages.clinicId],
    references: [clinics.id],
  }),
}));

// Types
export type City = typeof cities.$inferSelect;
export type District = typeof districts.$inferSelect;
export type Clinic = typeof clinics.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Package = typeof packages.$inferSelect;

export type InsertCity = typeof cities.$inferInsert;
export type InsertDistrict = typeof districts.$inferInsert;
export type InsertClinic = typeof clinics.$inferInsert;
export type InsertService = typeof services.$inferInsert;
export type InsertPackage = typeof packages.$inferInsert;

// Validation schemas
export const insertCitySchema = createInsertSchema(cities);
export const insertDistrictSchema = createInsertSchema(districts);
export const insertClinicSchema = createInsertSchema(clinics);
export const insertServiceSchema = createInsertSchema(services);
export const insertPackageSchema = createInsertSchema(packages);
