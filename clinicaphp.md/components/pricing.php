<?php
/**
 * Контроллер страницы цен
 */

class PricingController {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    /**
     * Страница сравнения цен
     */
    public function index() {
        $language = getLanguage();
        
        // Получаем все услуги всех клиник
        $services = $this->db->select(
            "SELECT 
                s.*,
                c.name_{$language} as clinic_name,
                c.slug as clinic_slug,
                c.logo_url as clinic_logo,
                ci.name_{$language} as city_name
            FROM " . $this->db->table('services') . " s
            LEFT JOIN " . $this->db->table('clinics') . " c ON s.clinic_id = c.id
            LEFT JOIN " . $this->db->table('cities') . " ci ON c.city_id = ci.id
            WHERE s.language = :language
            ORDER BY s.name ASC, s.price ASC",
            ['language' => $language]
        );
        
        // Группируем услуги по названию
        $groupedServices = [];
        foreach ($services as $service) {
            $name = $service['name'];
            if (!isset($groupedServices[$name])) {
                $groupedServices[$name] = [];
            }
            $groupedServices[$name][] = $service;
        }
        
        // SEO данные
        $seoTitle = t('pricing') . ' - ' . t('siteName');
        $seoDescription = t('pricing') . ' на стоматологические услуги в Молдове';
        
        // Подключаем шаблон
        require __DIR__ . '/../components/pricing/index.php';
    }
}


