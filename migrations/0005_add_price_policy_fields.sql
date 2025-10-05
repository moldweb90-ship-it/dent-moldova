-- Добавляем новые поля для ценовой политики
ALTER TABLE "clinics" ADD COLUMN IF NOT EXISTS "published_pricing" boolean DEFAULT false;
ALTER TABLE "clinics" ADD COLUMN IF NOT EXISTS "free_consultation" boolean DEFAULT false;
ALTER TABLE "clinics" ADD COLUMN IF NOT EXISTS "interest_free_installment" boolean DEFAULT false;
ALTER TABLE "clinics" ADD COLUMN IF NOT EXISTS "implant_warranty" boolean DEFAULT false;
ALTER TABLE "clinics" ADD COLUMN IF NOT EXISTS "popular_services_promotions" boolean DEFAULT false;
ALTER TABLE "clinics" ADD COLUMN IF NOT EXISTS "online_price_calculator" boolean DEFAULT false;

-- Комментарии к полям
COMMENT ON COLUMN "clinics"."published_pricing" IS 'Опубликован прайс на сайте/в приложении';
COMMENT ON COLUMN "clinics"."free_consultation" IS 'Бесплатная консультация';
COMMENT ON COLUMN "clinics"."interest_free_installment" IS 'Рассрочка без %';
COMMENT ON COLUMN "clinics"."implant_warranty" IS 'Гарантия на импланты/работы';
COMMENT ON COLUMN "clinics"."popular_services_promotions" IS 'Акции на популярные услуги';
COMMENT ON COLUMN "clinics"."online_price_calculator" IS 'Онлайн-калькулятор стоимости';




































