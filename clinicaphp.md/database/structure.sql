-- Структура базы данных для Dental Clinics CMS
-- MySQL 5.6+ (совместимость с Open Server)
-- Важно: VARCHAR(191) для индексированных полей в utf8mb4 (191*4=764 байта < 767 лимит)

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";
SET NAMES utf8mb4;

-- Префикс таблиц
SET @prefix = 'dc_';

-- Города
CREATE TABLE IF NOT EXISTS `dc_cities` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `name_ru` VARCHAR(255) NOT NULL,
  `name_ro` VARCHAR(255) NOT NULL,
  `slug_ru` VARCHAR(191) DEFAULT NULL,
  `slug_ro` VARCHAR(191) DEFAULT NULL,
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_slug_ru` (`slug_ru`),
  INDEX `idx_slug_ro` (`slug_ro`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Районы
CREATE TABLE IF NOT EXISTS `dc_districts` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `city_id` CHAR(36) NOT NULL,
  `name_ru` VARCHAR(255) NOT NULL,
  `name_ro` VARCHAR(255) NOT NULL,
  `slug_ru` VARCHAR(191) DEFAULT NULL,
  `slug_ro` VARCHAR(191) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`city_id`) REFERENCES `dc_cities`(`id`) ON DELETE CASCADE,
  INDEX `idx_city_id` (`city_id`),
  INDEX `idx_slug_ru` (`slug_ru`),
  INDEX `idx_slug_ro` (`slug_ro`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Клиники
CREATE TABLE IF NOT EXISTS `dc_clinics` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `slug` VARCHAR(191) NOT NULL UNIQUE,
  `name_ru` VARCHAR(255) NOT NULL,
  `name_ro` VARCHAR(255) NOT NULL,
  `logo_url` TEXT DEFAULT NULL,
  `city_id` CHAR(36) NOT NULL,
  `district_id` CHAR(36) DEFAULT NULL,
  `address_ru` TEXT DEFAULT NULL,
  `address_ro` TEXT DEFAULT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `website` VARCHAR(255) DEFAULT NULL,
  `booking_url` VARCHAR(255) DEFAULT NULL,
  `languages` TEXT DEFAULT NULL COMMENT 'JSON array',
  `specializations` TEXT DEFAULT NULL COMMENT 'JSON array',
  `tags` TEXT DEFAULT NULL COMMENT 'JSON array',
  `verified` BOOLEAN DEFAULT FALSE,
  `avail_today` BOOLEAN DEFAULT FALSE,
  `avail_tomorrow` BOOLEAN DEFAULT FALSE,
  `price_index` INT NOT NULL DEFAULT 0,
  `trust_index` INT NOT NULL DEFAULT 0,
  `reviews_index` INT NOT NULL DEFAULT 0,
  `access_index` INT NOT NULL DEFAULT 0,
  `d_score` INT NOT NULL DEFAULT 0,
  `doctor_experience` INT DEFAULT 0,
  `has_licenses` BOOLEAN DEFAULT FALSE,
  `has_certificates` BOOLEAN DEFAULT FALSE,
  `online_booking` BOOLEAN DEFAULT FALSE,
  `weekend_work` BOOLEAN DEFAULT FALSE,
  `evening_work` BOOLEAN DEFAULT FALSE,
  `urgent_care` BOOLEAN DEFAULT FALSE,
  `convenient_location` BOOLEAN DEFAULT FALSE,
  `installment_plan` BOOLEAN DEFAULT FALSE,
  `has_promotions` BOOLEAN DEFAULT FALSE,
  `published_pricing` BOOLEAN DEFAULT FALSE,
  `free_consultation` BOOLEAN DEFAULT FALSE,
  `interest_free_installment` BOOLEAN DEFAULT FALSE,
  `implant_warranty` BOOLEAN DEFAULT FALSE,
  `popular_services_promotions` BOOLEAN DEFAULT FALSE,
  `online_price_calculator` BOOLEAN DEFAULT FALSE,
  `pediatric_dentistry` BOOLEAN DEFAULT FALSE,
  `parking` BOOLEAN DEFAULT FALSE,
  `sos` BOOLEAN DEFAULT FALSE,
  `work_24h` BOOLEAN DEFAULT FALSE,
  `credit` BOOLEAN DEFAULT FALSE,
  `sos_enabled` BOOLEAN DEFAULT FALSE,
  `google_rating` DECIMAL(3,1) DEFAULT NULL,
  `google_reviews_count` INT DEFAULT NULL,
  `recommended` BOOLEAN DEFAULT FALSE,
  `promotional_labels` TEXT DEFAULT NULL COMMENT 'JSON array',
  `currency` VARCHAR(3) NOT NULL DEFAULT 'MDL',
  `seo_title_ru` VARCHAR(255) DEFAULT NULL,
  `seo_title_ro` VARCHAR(255) DEFAULT NULL,
  `seo_description_ru` TEXT DEFAULT NULL,
  `seo_description_ro` TEXT DEFAULT NULL,
  `seo_keywords_ru` TEXT DEFAULT NULL,
  `seo_keywords_ro` TEXT DEFAULT NULL,
  `seo_h1_ru` VARCHAR(255) DEFAULT NULL,
  `seo_h1_ro` VARCHAR(255) DEFAULT NULL,
  `og_title_ru` VARCHAR(255) DEFAULT NULL,
  `og_title_ro` VARCHAR(255) DEFAULT NULL,
  `og_description_ru` TEXT DEFAULT NULL,
  `og_description_ro` TEXT DEFAULT NULL,
  `og_image` TEXT DEFAULT NULL,
  `seo_canonical` VARCHAR(191) DEFAULT NULL,
  `seo_robots` VARCHAR(50) DEFAULT 'index,follow',
  `seo_priority` DECIMAL(2,1) DEFAULT 0.5,
  `seo_schema_type` VARCHAR(50) DEFAULT 'Dentist',
  `seo_schema_data` TEXT DEFAULT NULL COMMENT 'JSON object',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`city_id`) REFERENCES `dc_cities`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`district_id`) REFERENCES `dc_districts`(`id`) ON DELETE SET NULL,
  INDEX `idx_city_id` (`city_id`),
  INDEX `idx_district_id` (`district_id`),
  INDEX `idx_slug` (`slug`),
  INDEX `idx_verified` (`verified`),
  INDEX `idx_d_score` (`d_score`),
  INDEX `idx_verified_d_score` (`verified`, `d_score`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Рабочие часы
CREATE TABLE IF NOT EXISTS `dc_working_hours` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `clinic_id` CHAR(36) NOT NULL,
  `day_of_week` TINYINT NOT NULL COMMENT '0=Sunday, 1=Monday, ..., 6=Saturday',
  `is_open` BOOLEAN NOT NULL DEFAULT TRUE,
  `open_time` VARCHAR(5) DEFAULT NULL COMMENT 'Format: HH:MM',
  `close_time` VARCHAR(5) DEFAULT NULL COMMENT 'Format: HH:MM',
  `break_start_time` VARCHAR(5) DEFAULT NULL COMMENT 'Format: HH:MM',
  `break_end_time` VARCHAR(5) DEFAULT NULL COMMENT 'Format: HH:MM',
  `is_24_hours` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`clinic_id`) REFERENCES `dc_clinics`(`id`) ON DELETE CASCADE,
  INDEX `idx_clinic_id` (`clinic_id`),
  INDEX `idx_day_of_week` (`day_of_week`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Услуги клиник
CREATE TABLE IF NOT EXISTS `dc_services` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `clinic_id` CHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `price` INT NOT NULL,
  `price_type` VARCHAR(10) NOT NULL DEFAULT 'fixed' COMMENT 'fixed or from',
  `currency` VARCHAR(3) NOT NULL DEFAULT 'MDL',
  `language` VARCHAR(2) NOT NULL DEFAULT 'ru' COMMENT 'ru or ro',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`clinic_id`) REFERENCES `dc_clinics`(`id`) ON DELETE CASCADE,
  INDEX `idx_clinic_id` (`clinic_id`),
  INDEX `idx_language` (`language`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Записи на прием
CREATE TABLE IF NOT EXISTS `dc_bookings` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `clinic_id` CHAR(36) NOT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `contact_method` VARCHAR(20) DEFAULT NULL COMMENT 'phone, email, whatsapp, telegram',
  `service` VARCHAR(255) NOT NULL,
  `preferred_date` DATE NOT NULL,
  `preferred_time` VARCHAR(5) NOT NULL COMMENT 'Format: HH:MM',
  `notes` TEXT DEFAULT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'new' COMMENT 'new, contacted, confirmed, completed, cancelled',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`clinic_id`) REFERENCES `dc_clinics`(`id`) ON DELETE RESTRICT,
  INDEX `idx_clinic_id` (`clinic_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Отзывы
CREATE TABLE IF NOT EXISTS `dc_reviews` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `clinic_id` CHAR(36) NOT NULL,
  `author_name` VARCHAR(100) NOT NULL,
  `rating` TINYINT NOT NULL COMMENT '1-5',
  `comment` TEXT DEFAULT NULL,
  `language` VARCHAR(2) NOT NULL DEFAULT 'ru',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`clinic_id`) REFERENCES `dc_clinics`(`id`) ON DELETE CASCADE,
  INDEX `idx_clinic_id` (`clinic_id`),
  INDEX `idx_rating` (`rating`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Настройки сайта
CREATE TABLE IF NOT EXISTS `dc_site_settings` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `key` VARCHAR(100) NOT NULL UNIQUE,
  `value` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Аналитика (просмотры)
CREATE TABLE IF NOT EXISTS `dc_site_views` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `ip_address` VARCHAR(45) NOT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `route` VARCHAR(255) NOT NULL,
  `clinic_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_ip_address` (`ip_address`),
  INDEX `idx_clinic_id` (`clinic_id`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Аналитика (события)
CREATE TABLE IF NOT EXISTS `dc_analytics_events` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `clinic_id` CHAR(36) DEFAULT NULL,
  `event_type` VARCHAR(50) NOT NULL COMMENT 'view, click_details, click_book, click_phone, click_website',
  `ip_address` VARCHAR(45) NOT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `referrer` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`clinic_id`) REFERENCES `dc_clinics`(`id`) ON DELETE SET NULL,
  INDEX `idx_clinic_id` (`clinic_id`),
  INDEX `idx_event_type` (`event_type`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Заявки на верификацию клиник
CREATE TABLE IF NOT EXISTS `dc_verification_requests` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `clinic_id` CHAR(36) NOT NULL,
  `clinic_name` TEXT NOT NULL,
  `clinic_address` TEXT DEFAULT NULL,
  `requester_email` TEXT NOT NULL,
  `requester_phone` TEXT NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT 'pending, approved, rejected',
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`clinic_id`) REFERENCES `dc_clinics`(`id`) ON DELETE CASCADE,
  INDEX `idx_clinic_id` (`clinic_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Заявки на добавление новых клиник
CREATE TABLE IF NOT EXISTS `dc_new_clinic_requests` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `clinic_name` TEXT NOT NULL,
  `contact_email` TEXT DEFAULT NULL,
  `contact_phone` TEXT NOT NULL,
  `city` TEXT DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `website` TEXT DEFAULT NULL,
  `specializations` TEXT DEFAULT NULL COMMENT 'JSON array',
  `description` TEXT DEFAULT NULL,
  `working_hours` TEXT DEFAULT NULL COMMENT 'JSON array',
  `status` VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT 'pending, approved, rejected',
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_status` (`status`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

