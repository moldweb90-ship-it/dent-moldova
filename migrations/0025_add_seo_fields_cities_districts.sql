-- Migration: Add SEO fields to cities and districts tables
-- Created at: 2025-01-16

-- Add SEO fields to cities table
ALTER TABLE "cities" ADD COLUMN "seo_title_ru" text;
ALTER TABLE "cities" ADD COLUMN "seo_title_ro" text;
ALTER TABLE "cities" ADD COLUMN "seo_description_ru" text;
ALTER TABLE "cities" ADD COLUMN "seo_description_ro" text;
ALTER TABLE "cities" ADD COLUMN "seo_keywords_ru" text;
ALTER TABLE "cities" ADD COLUMN "seo_keywords_ro" text;
ALTER TABLE "cities" ADD COLUMN "seo_h1_ru" text;
ALTER TABLE "cities" ADD COLUMN "seo_h1_ro" text;

-- Add SEO fields to districts table  
ALTER TABLE "districts" ADD COLUMN "seo_title_ru" text;
ALTER TABLE "districts" ADD COLUMN "seo_title_ro" text;
ALTER TABLE "districts" ADD COLUMN "seo_description_ru" text;
ALTER TABLE "districts" ADD COLUMN "seo_description_ro" text;
ALTER TABLE "districts" ADD COLUMN "seo_keywords_ru" text;
ALTER TABLE "districts" ADD COLUMN "seo_keywords_ro" text;
ALTER TABLE "districts" ADD COLUMN "seo_h1_ru" text;
ALTER TABLE "districts" ADD COLUMN "seo_h1_ro" text;
