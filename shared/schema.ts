import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
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
  name: text("name").notNull(),
  logoUrl: text("logo_url"),
  cityId: varchar("city_id").notNull().references(() => cities.id),
  address: text("address"),
  phone: text("phone"),
  website: text("website"),
  bookingUrl: text("booking_url"),
  languages: json("languages").$type<string[]>().default([]),
  specializations: json("specializations").$type<string[]>().default([]),
  tags: json("tags").$type<string[]>().default([]),
  verified: boolean("verified").default(false),
  cnam: boolean("cnam").default(false),
  availToday: boolean("avail_today").default(false),
  availTomorrow: boolean("avail_tomorrow").default(false),
  priceIndex: integer("price_index").notNull(),
  trustIndex: integer("trust_index").notNull(),
  reviewsIndex: integer("reviews_index").notNull(),
  accessIndex: integer("access_index").notNull(),
  dScore: integer("d_score").notNull(),
  googleRating: integer("google_rating"),
  googleReviewsCount: integer("google_reviews_count"),
  recommended: boolean("recommended").default(false),
  promotionalLabels: json("promotional_labels").$type<string[]>().default([]),
  currency: varchar("currency").notNull().default("MDL"), // MDL, EUR, USD
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
  currency: varchar("currency").notNull().default("MDL"), // MDL, EUR, USD
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

// Bookings table for clinic appointment requests
export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clinicId: varchar("clinic_id").notNull().references(() => clinics.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  service: text("service").notNull(),
  preferredDate: text("preferred_date").notNull(),
  preferredTime: text("preferred_time").notNull(),
  notes: text("notes"),
  status: varchar("status").notNull().default("new"), // new, contacted, confirmed, completed, cancelled
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

// Types
export type City = typeof cities.$inferSelect;
export type District = typeof districts.$inferSelect;
export type Clinic = typeof clinics.$inferSelect;
export type Package = typeof packages.$inferSelect;
export type Service = typeof services.$inferSelect;
export type SiteView = typeof siteViews.$inferSelect;
export type SiteSetting = typeof siteSettings.$inferSelect;
export type Booking = typeof bookings.$inferSelect;

export type InsertCity = z.infer<typeof insertCitySchema>;
export type InsertDistrict = z.infer<typeof insertDistrictSchema>;
export type InsertClinic = z.infer<typeof insertClinicSchema>;
export type InsertPackage = z.infer<typeof insertPackageSchema>;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type InsertSiteView = z.infer<typeof insertSiteViewSchema>;
export type InsertSiteSetting = z.infer<typeof insertSiteSettingSchema>;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

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
