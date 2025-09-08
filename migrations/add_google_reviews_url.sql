-- Добавление поля google_reviews_url в таблицу clinics
-- PostgreSQL
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS google_reviews_url TEXT;

-- SQLite (для локальной разработки)
-- ALTER TABLE clinics ADD COLUMN google_reviews_url TEXT;

