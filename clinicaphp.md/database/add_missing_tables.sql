-- Добавление недостающих таблиц для админки
-- Выполните этот SQL в phpMyAdmin, если таблицы еще не созданы

SET NAMES utf8mb4;

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


