-- Initial migration for database setup
-- This file contains the base schema for the application

-- Create cities table
CREATE TABLE IF NOT EXISTS "cities" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
	"name_ru" text NOT NULL,
	"name_ro" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Create districts table
CREATE TABLE IF NOT EXISTS "districts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
	"city_id" varchar NOT NULL,
	"name_ru" text NOT NULL,
	"name_ro" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Create clinics table
CREATE TABLE IF NOT EXISTS "clinics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
	"slug" varchar UNIQUE NOT NULL,
	"name" text NOT NULL,
	"logo_url" text,
	"city_id" varchar NOT NULL,
	"district_id" varchar,
	"address" text,
	"languages" text[] DEFAULT '{}',
	"specializations" text[] DEFAULT '{}',
	"tags" text[] DEFAULT '{}',
	"verified" boolean DEFAULT false,
	
	"avail_today" boolean DEFAULT false,
	"price_index" integer DEFAULT 0,
	"trust_index" integer DEFAULT 0,
	"reviews_index" integer DEFAULT 0,
	"access_index" integer DEFAULT 0,
	"d_score" integer DEFAULT 0,
	"recommended" boolean DEFAULT false,
	"promotional_labels" text[] DEFAULT '{}',
	"currency" varchar DEFAULT 'MDL',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS "bookings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
	"clinic_id" varchar NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"service" text NOT NULL,
	"preferred_date" text NOT NULL,
	"preferred_time" text NOT NULL,
	"notes" text,
	"status" varchar NOT NULL DEFAULT 'new',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE "districts" ADD CONSTRAINT "districts_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "clinics" ADD CONSTRAINT "clinics_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "clinics" ADD CONSTRAINT "clinics_district_id_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
