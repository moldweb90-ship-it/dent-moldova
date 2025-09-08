-- Migration: Add data protection tables
-- This migration adds backup, audit, and protection settings tables

-- Create data_backups table
CREATE TABLE IF NOT EXISTS "data_backups" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "backup_type" varchar NOT NULL,
  "description" text,
  "data_size" integer,
  "record_count" integer,
  "backup_data" json NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "created_by" varchar
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "table_name" varchar NOT NULL,
  "record_id" varchar NOT NULL,
  "action" varchar NOT NULL,
  "old_data" json,
  "new_data" json,
  "changed_fields" json,
  "user_id" varchar,
  "user_ip" varchar,
  "user_agent" text,
  "created_at" timestamp DEFAULT now()
);

-- Create data_protection_settings table
CREATE TABLE IF NOT EXISTS "data_protection_settings" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "key" varchar NOT NULL UNIQUE,
  "value" text NOT NULL,
  "description" text,
  "updated_at" timestamp DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "audit_logs_table_name_idx" ON "audit_logs" ("table_name");
CREATE INDEX IF NOT EXISTS "audit_logs_record_id_idx" ON "audit_logs" ("record_id");
CREATE INDEX IF NOT EXISTS "audit_logs_action_idx" ON "audit_logs" ("action");
CREATE INDEX IF NOT EXISTS "audit_logs_created_at_idx" ON "audit_logs" ("created_at");
CREATE INDEX IF NOT EXISTS "data_backups_created_at_idx" ON "data_backups" ("created_at");
CREATE INDEX IF NOT EXISTS "data_backups_type_idx" ON "data_backups" ("backup_type");

-- Insert default protection settings
INSERT INTO "data_protection_settings" ("key", "value", "description") VALUES
  ('protect_clinics', 'true', 'Защита от удаления клиник'),
  ('protect_cities', 'true', 'Защита от удаления городов'),
  ('protect_districts', 'false', 'Защита от удаления районов'),
  ('auto_backup_enabled', 'true', 'Автоматическое резервное копирование'),
  ('backup_retention_days', '30', 'Количество дней хранения резервных копий'),
  ('audit_log_retention_days', '90', 'Количество дней хранения журнала аудита')
ON CONFLICT ("key") DO NOTHING;
