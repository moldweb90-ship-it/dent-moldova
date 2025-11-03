<?php
/**
 * Калькулятор рейтингов клиник
 * 
 * Переписано с TypeScript версии из server/utils/ratingCalculator.ts
 */

class RatingCalculator {
    /**
     * Рассчитать все рейтинги клиники
     * 
     * @param array $data Данные клиники
     * @return array Массив с рассчитанными рейтингами
     */
    public static function calculate($data) {
        return [
            'reviewsIndex' => self::calculateReviewsIndex($data),
            'trustIndex' => self::calculateTrustIndex($data),
            'accessIndex' => self::calculateAccessIndex($data),
            'priceIndex' => self::calculatePriceIndex($data),
            'dScore' => self::calculateDScore($data)
        ];
    }
    
    /**
     * Рассчитать рейтинг Google отзывов (Reviews Index)
     * Базовый рейтинг: 70 баллов
     * Рейтинг от 4.0 до 5.0: 20 баллов (2 балла на каждую десятую)
     * Отзывы: 10 баллов максимум (2 балла за каждые 100 отзывов)
     */
    private static function calculateReviewsIndex($data) {
        $index = 70; // Базовый рейтинг
        
        if (!empty($data['googleRating']) && $data['googleRating'] > 0) {
            // Рейтинг от 4.0 до 5.0: 20 баллов
            $ratingBonus = 0;
            if ($data['googleRating'] >= 4.0) {
                $ratingDiff = min($data['googleRating'] - 4.0, 1.0); // максимум до 5.0
                $ratingBonus = round($ratingDiff * 20); // 20 баллов за 1.0 разницу
            }
            
            // Количество отзывов: 10 баллов максимум
            $reviewsBonus = 0;
            if (!empty($data['googleReviewsCount'])) {
                $reviewsBonus = min(floor($data['googleReviewsCount'] / 100) * 2, 10);
            }
            
            $index = min(100, 70 + $ratingBonus + $reviewsBonus);
        }
        
        return (int)$index;
    }
    
    /**
     * Рассчитать рейтинг опыта врачей (Trust Index)
     * Базовый рейтинг: 70 баллов
     * Лицензии: +5 баллов
     * Сертификаты: +5 баллов
     * Опыт врачей: +1 балл за каждый год (максимум 20 лет)
     */
    private static function calculateTrustIndex($data) {
        $index = 70; // Базовый рейтинг
        
        // Лицензии и сертификаты: 10 баллов
        if (!empty($data['hasLicenses'])) {
            $index += 5;
        }
        if (!empty($data['hasCertificates'])) {
            $index += 5;
        }
        
        // Опыт врачей: 20 баллов (1 балл за каждый год)
        $experienceBonus = min((int)($data['doctorExperience'] ?? 0), 20);
        $index += $experienceBonus;
        
        return min(100, (int)$index);
    }
    
    /**
     * Рассчитать рейтинг удобства записи (Access Index)
     * Базовый рейтинг: 70 баллов
     * 5 опций по 6 баллов каждая (30 баллов максимум)
     */
    private static function calculateAccessIndex($data) {
        $index = 70; // Базовый рейтинг
        
        // 5 опций по 6 баллов каждая
        if (!empty($data['onlineBooking'])) $index += 6;
        if (!empty($data['weekendWork'])) $index += 6;
        if (!empty($data['eveningWork'])) $index += 6;
        if (!empty($data['urgentCare'])) $index += 6;
        if (!empty($data['convenientLocation'])) $index += 6;
        
        return min(100, (int)$index);
    }
    
    /**
     * Рассчитать рейтинг ценовой политики (Price Index)
     * Базовый рейтинг: 50 баллов
     * Опубликован прайс: +15
     * Бесплатная консультация: +5
     * Рассрочка без %: +5
     * Гарантия на импланты: +10
     * Акции на популярные услуги: +10
     * Онлайн-калькулятор: +5
     */
    private static function calculatePriceIndex($data) {
        $index = 50; // Базовый рейтинг
        
        // Новые характеристики ценовой политики (50 баллов максимум)
        if (!empty($data['publishedPricing'])) $index += 15;
        if (!empty($data['freeConsultation'])) $index += 5;
        if (!empty($data['interestFreeInstallment'])) $index += 5;
        if (!empty($data['implantWarranty'])) $index += 10;
        if (!empty($data['popularServicesPromotions'])) $index += 10;
        if (!empty($data['onlinePriceCalculator'])) $index += 5;
        
        return min(100, (int)$index);
    }
    
    /**
     * Рассчитать общий рейтинг (D-Score)
     * Взвешенная сумма всех индексов:
     * - Trust Index: 30%
     * - Reviews Index: 25%
     * - Price Index: 25%
     * - Access Index: 20%
     */
    private static function calculateDScore($data) {
        $reviewsIndex = self::calculateReviewsIndex($data);
        $trustIndex = self::calculateTrustIndex($data);
        $priceIndex = self::calculatePriceIndex($data);
        $accessIndex = self::calculateAccessIndex($data);
        
        $dScore = round(
            $trustIndex * 0.3 +      // Доверие: 30%
            $reviewsIndex * 0.25 +   // Отзывы: 25%
            $priceIndex * 0.25 +     // Цена: 25%
            $accessIndex * 0.2       // Удобство: 20%
        );
        
        return (int)$dScore;
    }
}


