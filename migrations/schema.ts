import { pgTable, varchar, text, timestamp, foreignKey, unique, json, integer, boolean, numeric, index } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const cities = pgTable("cities", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	nameRu: text("name_ru").notNull(),
	nameRo: text("name_ro").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const districts = pgTable("districts", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	cityId: varchar("city_id").notNull(),
	nameRu: text("name_ru").notNull(),
	nameRo: text("name_ro").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.cityId],
			foreignColumns: [cities.id],
			name: "districts_city_id_cities_id_fk"
		}),
]);

export const bookings = pgTable("bookings", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	clinicId: varchar("clinic_id").notNull(),
	firstName: text("first_name").notNull(),
	phone: text().notNull(),
	email: text(),
	service: text().notNull(),
	preferredDate: text("preferred_date").notNull(),
	preferredTime: text("preferred_time").notNull(),
	notes: text(),
	status: varchar().default('new').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	contactMethod: varchar("contact_method"),
}, (table) => [
	foreignKey({
			columns: [table.clinicId],
			foreignColumns: [clinics.id],
			name: "bookings_clinic_id_clinics_id_fk"
		}),
]);

export const siteSettings = pgTable("site_settings", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	key: varchar().notNull(),
	value: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("site_settings_key_unique").on(table.key),
]);

export const users = pgTable("users", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	username: text().notNull(),
	password: text().notNull(),
}, (table) => [
	unique("users_username_unique").on(table.username),
]);

export const verificationRequests = pgTable("verification_requests", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	clinicId: varchar("clinic_id").notNull(),
	clinicName: text("clinic_name").notNull(),
	clinicAddress: text("clinic_address"),
	requesterEmail: text("requester_email").notNull(),
	requesterPhone: text("requester_phone").notNull(),
	status: varchar().default('pending').notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.clinicId],
			foreignColumns: [clinics.id],
			name: "verification_requests_clinic_id_clinics_id_fk"
		}),
]);

export const newClinicRequests = pgTable("new_clinic_requests", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	clinicName: text("clinic_name").notNull(),
	contactEmail: text("contact_email"),
	contactPhone: text("contact_phone").notNull(),
	city: text(),
	address: text(),
	website: text(),
	specializations: text().array(),
	description: text(),
	status: varchar().default('pending').notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	workingHours: json("working_hours"),
});

export const workingHours = pgTable("working_hours", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	clinicId: varchar("clinic_id").notNull(),
	dayOfWeek: integer("day_of_week").notNull(),
	isOpen: boolean("is_open").default(true).notNull(),
	openTime: varchar("open_time"),
	closeTime: varchar("close_time"),
	breakStartTime: varchar("break_start_time"),
	breakEndTime: varchar("break_end_time"),
	is24Hours: boolean("is_24_hours").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.clinicId],
			foreignColumns: [clinics.id],
			name: "working_hours_clinic_id_clinics_id_fk"
		}).onDelete("cascade"),
]);

export const clinics = pgTable("clinics", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	slug: varchar().notNull(),
	logoUrl: text("logo_url"),
	cityId: varchar("city_id").notNull(),
	districtId: varchar("district_id", { length: 255 }),
	phone: text(),
	website: text(),
	bookingUrl: text("booking_url"),
	languages: json().default([]),
	specializations: json().default([]),
	tags: json().default([]),
	verified: boolean().default(false),
	cnam: boolean().default(false),
	availToday: boolean("avail_today").default(false),
	availTomorrow: boolean("avail_tomorrow").default(false),
	priceIndex: integer("price_index").notNull(),
	trustIndex: integer("trust_index").notNull(),
	reviewsIndex: integer("reviews_index").notNull(),
	accessIndex: integer("access_index").notNull(),
	dScore: integer("d_score").notNull(),
	googleRating: numeric("google_rating", { precision: 3, scale:  1 }),
	googleReviewsCount: integer("google_reviews_count"),
	recommended: boolean().default(false),
	promotionalLabels: json("promotional_labels").default([]),
	currency: varchar().default('MDL').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	doctorExperience: integer("doctor_experience").default(0),
	hasLicenses: boolean("has_licenses").default(false),
	hasCertificates: boolean("has_certificates").default(false),
	onlineBooking: boolean("online_booking").default(false),
	weekendWork: boolean("weekend_work").default(false),
	eveningWork: boolean("evening_work").default(false),
	urgentCare: boolean("urgent_care").default(false),
	convenientLocation: boolean("convenient_location").default(false),
	installmentPlan: boolean("installment_plan").default(false),
	hasPromotions: boolean("has_promotions").default(false),
	pediatricDentistry: boolean("pediatric_dentistry").default(false),
	parking: boolean().default(false),
	sos: boolean().default(false),
	work24H: boolean("work_24h").default(false),
	credit: boolean().default(false),
	ogImage: text("og_image"),
	seoCanonical: text("seo_canonical"),
	seoRobots: varchar("seo_robots").default('index,follow'),
	seoPriority: numeric("seo_priority", { precision: 2, scale:  1 }).default('0.5'),
	seoSchemaType: varchar("seo_schema_type").default('Dentist'),
	seoSchemaData: json("seo_schema_data"),
	nameRu: text("name_ru").notNull(),
	nameRo: text("name_ro").notNull(),
	addressRu: text("address_ru"),
	addressRo: text("address_ro"),
	seoTitleRu: text("seo_title_ru"),
	seoTitleRo: text("seo_title_ro"),
	seoDescriptionRu: text("seo_description_ru"),
	seoDescriptionRo: text("seo_description_ro"),
	seoKeywordsRu: text("seo_keywords_ru"),
	seoKeywordsRo: text("seo_keywords_ro"),
	seoH1Ru: text("seo_h1_ru"),
	seoH1Ro: text("seo_h1_ro"),
	ogTitleRu: text("og_title_ru"),
	ogTitleRo: text("og_title_ro"),
	ogDescriptionRu: text("og_description_ru"),
	ogDescriptionRo: text("og_description_ro"),
	publishedPricing: boolean("published_pricing").default(false),
	freeConsultation: boolean("free_consultation").default(false),
	interestFreeInstallment: boolean("interest_free_installment").default(false),
	implantWarranty: boolean("implant_warranty").default(false),
	popularServicesPromotions: boolean("popular_services_promotions").default(false),
	onlinePriceCalculator: boolean("online_price_calculator").default(false),
}, (table) => [
	foreignKey({
			columns: [table.cityId],
			foreignColumns: [cities.id],
			name: "clinics_city_id_cities_id_fk"
		}),
	foreignKey({
			columns: [table.districtId],
			foreignColumns: [districts.id],
			name: "clinics_district_id_districts_id_fk"
		}).onDelete("set null"),
	unique("clinics_slug_unique").on(table.slug),
]);

export const packages = pgTable("packages", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	clinicId: varchar("clinic_id").notNull(),
	code: varchar().notNull(),
	nameRu: text("name_ru").notNull(),
	nameRo: text("name_ro").notNull(),
	priceMin: integer("price_min").notNull(),
	priceMax: integer("price_max").notNull(),
	priceMedian: integer("price_median").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.clinicId],
			foreignColumns: [clinics.id],
			name: "packages_clinic_id_clinics_id_fk"
		}),
]);

export const siteViews = pgTable("site_views", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	ipAddress: varchar("ip_address").notNull(),
	userAgent: text("user_agent"),
	route: varchar().notNull(),
	clinicId: varchar("clinic_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.clinicId],
			foreignColumns: [clinics.id],
			name: "site_views_clinic_id_clinics_id_fk"
		}),
]);

export const analyticsEvents = pgTable("analytics_events", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	clinicId: varchar("clinic_id"),
	eventType: varchar("event_type").notNull(),
	ipAddress: varchar("ip_address").notNull(),
	userAgent: text("user_agent"),
	referrer: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.clinicId],
			foreignColumns: [clinics.id],
			name: "analytics_events_clinic_id_clinics_id_fk"
		}),
]);

export const auditLogs = pgTable("audit_logs", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	tableName: varchar("table_name").notNull(),
	recordId: varchar("record_id").notNull(),
	action: varchar().notNull(),
	oldData: json("old_data"),
	newData: json("new_data"),
	changedFields: json("changed_fields"),
	userId: varchar("user_id"),
	userIp: varchar("user_ip"),
	userAgent: text("user_agent"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const dataBackups = pgTable("data_backups", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	backupType: varchar("backup_type").notNull(),
	description: text(),
	dataSize: integer("data_size"),
	recordCount: integer("record_count"),
	backupData: json("backup_data").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	createdBy: varchar("created_by"),
});

export const services = pgTable("services", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	clinicId: varchar("clinic_id").notNull(),
	name: text().notNull(),
	price: integer().notNull(),
	currency: varchar().default('MDL').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	language: varchar().default('ru').notNull(),
	priceType: varchar("price_type").default('fixed').notNull(),
}, (table) => [
	foreignKey({
			columns: [table.clinicId],
			foreignColumns: [clinics.id],
			name: "services_clinic_id_clinics_id_fk"
		}),
]);

export const dataProtectionSettings = pgTable("data_protection_settings", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	key: varchar().notNull(),
	value: text().notNull(),
	description: text(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("data_protection_settings_key_unique").on(table.key),
]);

export const reviews = pgTable("reviews", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	clinicId: varchar("clinic_id").notNull(),
	authorName: text("author_name").notNull(),
	authorEmail: text("author_email"),
	authorPhone: text("author_phone"),
	clinicRating: integer("clinic_rating").notNull(),
	doctorRating: integer("doctor_rating").notNull(),
	title: text().notNull(),
	content: text().notNull(),
	visitDate: timestamp("visit_date", { mode: 'string' }),
	serviceType: text("service_type"),
	status: varchar().default('pending').notNull(),
	moderatorNotes: text("moderator_notes"),
	moderatedBy: varchar("moderated_by"),
	moderatedAt: timestamp("moderated_at", { mode: 'string' }),
	ipAddress: varchar("ip_address"),
	userAgent: text("user_agent"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("reviews_clinic_id_idx").using("btree", table.clinicId.asc().nullsLast().op("text_ops")),
	index("reviews_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("reviews_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.clinicId],
			foreignColumns: [clinics.id],
			name: "reviews_clinic_id_fkey"
		}).onDelete("cascade"),
]);

export const reviewAttachments = pgTable("review_attachments", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	reviewId: varchar("review_id").notNull(),
	fileName: text("file_name").notNull(),
	fileUrl: text("file_url").notNull(),
	fileType: varchar("file_type").notNull(),
	fileSize: integer("file_size"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("review_attachments_review_id_idx").using("btree", table.reviewId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.reviewId],
			foreignColumns: [reviews.id],
			name: "review_attachments_review_id_fkey"
		}).onDelete("cascade"),
]);
