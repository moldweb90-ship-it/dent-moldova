-- Добавляем настройку для отслеживания последнего обновления данных
INSERT INTO "site_settings" ("key", "value") 
VALUES ('last_data_update', NOW()::text)
ON CONFLICT ("key") DO NOTHING;
