-- Изменяем тип поля google_rating с integer на decimal для поддержки десятичных значений
ALTER TABLE "clinics" ALTER COLUMN "google_rating" TYPE DECIMAL(3,1);
