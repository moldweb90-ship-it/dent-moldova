import { relations } from "drizzle-orm/relations";
import { cities, districts, clinics, bookings, verificationRequests, workingHours, packages, siteViews, analyticsEvents, services, reviews, reviewAttachments } from "./schema";

export const districtsRelations = relations(districts, ({one, many}) => ({
	city: one(cities, {
		fields: [districts.cityId],
		references: [cities.id]
	}),
	clinics: many(clinics),
}));

export const citiesRelations = relations(cities, ({many}) => ({
	districts: many(districts),
	clinics: many(clinics),
}));

export const bookingsRelations = relations(bookings, ({one}) => ({
	clinic: one(clinics, {
		fields: [bookings.clinicId],
		references: [clinics.id]
	}),
}));

export const clinicsRelations = relations(clinics, ({one, many}) => ({
	bookings: many(bookings),
	verificationRequests: many(verificationRequests),
	workingHours: many(workingHours),
	city: one(cities, {
		fields: [clinics.cityId],
		references: [cities.id]
	}),
	district: one(districts, {
		fields: [clinics.districtId],
		references: [districts.id]
	}),
	packages: many(packages),
	siteViews: many(siteViews),
	analyticsEvents: many(analyticsEvents),
	services: many(services),
	reviews: many(reviews),
}));

export const verificationRequestsRelations = relations(verificationRequests, ({one}) => ({
	clinic: one(clinics, {
		fields: [verificationRequests.clinicId],
		references: [clinics.id]
	}),
}));

export const workingHoursRelations = relations(workingHours, ({one}) => ({
	clinic: one(clinics, {
		fields: [workingHours.clinicId],
		references: [clinics.id]
	}),
}));

export const packagesRelations = relations(packages, ({one}) => ({
	clinic: one(clinics, {
		fields: [packages.clinicId],
		references: [clinics.id]
	}),
}));

export const siteViewsRelations = relations(siteViews, ({one}) => ({
	clinic: one(clinics, {
		fields: [siteViews.clinicId],
		references: [clinics.id]
	}),
}));

export const analyticsEventsRelations = relations(analyticsEvents, ({one}) => ({
	clinic: one(clinics, {
		fields: [analyticsEvents.clinicId],
		references: [clinics.id]
	}),
}));

export const servicesRelations = relations(services, ({one}) => ({
	clinic: one(clinics, {
		fields: [services.clinicId],
		references: [clinics.id]
	}),
}));

export const reviewsRelations = relations(reviews, ({one, many}) => ({
	clinic: one(clinics, {
		fields: [reviews.clinicId],
		references: [clinics.id]
	}),
	reviewAttachments: many(reviewAttachments),
}));

export const reviewAttachmentsRelations = relations(reviewAttachments, ({one}) => ({
	review: one(reviews, {
		fields: [reviewAttachments.reviewId],
		references: [reviews.id]
	}),
}));