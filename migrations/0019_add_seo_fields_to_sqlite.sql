-- Добавляем SEO поля в таблицу clinics для SQLite
ALTER TABLE clinics ADD COLUMN seo_title_ru TEXT;
ALTER TABLE clinics ADD COLUMN seo_title_ro TEXT;
ALTER TABLE clinics ADD COLUMN seo_description_ru TEXT;
ALTER TABLE clinics ADD COLUMN seo_description_ro TEXT;
ALTER TABLE clinics ADD COLUMN seo_keywords_ru TEXT;
ALTER TABLE clinics ADD COLUMN seo_keywords_ro TEXT;
ALTER TABLE clinics ADD COLUMN seo_h1_ru TEXT;
ALTER TABLE clinics ADD COLUMN seo_h1_ro TEXT;
ALTER TABLE clinics ADD COLUMN og_title_ru TEXT;
ALTER TABLE clinics ADD COLUMN og_title_ro TEXT;
ALTER TABLE clinics ADD COLUMN og_description_ru TEXT;
ALTER TABLE clinics ADD COLUMN og_description_ro TEXT;
ALTER TABLE clinics ADD COLUMN og_image TEXT;
ALTER TABLE clinics ADD COLUMN seo_canonical TEXT;
ALTER TABLE clinics ADD COLUMN seo_robots TEXT DEFAULT 'index,follow';
ALTER TABLE clinics ADD COLUMN seo_priority REAL DEFAULT 0.5;
ALTER TABLE clinics ADD COLUMN seo_schema_type TEXT DEFAULT 'Dentist';
ALTER TABLE clinics ADD COLUMN seo_schema_data TEXT;
