<?php
/**
 * Контроллер страницы клиники
 */

class ClinicController {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    /**
     * Страница клиники
     */
    public function index() {
        $language = getLanguage();
        $slug = $_GET['slug'] ?? null;
        
        if (!$slug) {
            http_response_code(404);
            require __DIR__ . '/../components/error/404.php';
            return;
        }
        
        // Получаем клинику
        $clinic = $this->db->selectOne(
            "SELECT 
                c.*,
                ci.name_{$language} as city_name,
                ci.slug_{$language} as city_slug,
                d.name_{$language} as district_name,
                d.slug_{$language} as district_slug
            FROM " . $this->db->table('clinics') . " c
            LEFT JOIN " . $this->db->table('cities') . " ci ON c.city_id = ci.id
            LEFT JOIN " . $this->db->table('districts') . " d ON c.district_id = d.id
            WHERE c.slug = :slug",
            ['slug' => $slug]
        );
        
        if (!$clinic) {
            http_response_code(404);
            require __DIR__ . '/../components/error/404.php';
            return;
        }
        
        // Получаем услуги
        $services = $this->db->select(
            "SELECT * FROM " . $this->db->table('services') . "
            WHERE clinic_id = :clinic_id AND language = :language
            ORDER BY name ASC",
            [
                'clinic_id' => $clinic['id'],
                'language' => $language
            ]
        );
        
        // Получаем рабочие часы
        $workingHours = $this->db->select(
            "SELECT * FROM " . $this->db->table('working_hours') . "
            WHERE clinic_id = :clinic_id
            ORDER BY day_of_week ASC",
            ['clinic_id' => $clinic['id']]
        );
        
        // Получаем отзывы
        $reviews = $this->db->select(
            "SELECT * FROM " . $this->db->table('reviews') . "
            WHERE clinic_id = :clinic_id AND language = :language
            ORDER BY created_at DESC
            LIMIT 10",
            [
                'clinic_id' => $clinic['id'],
                'language' => $language
            ]
        );
        
        // SEO данные
        $seoTitle = $clinic["seo_title_{$language}"] ?? $clinic["name_{$language}"] . ' - ' . t('siteName');
        $seoDescription = $clinic["seo_description_{$language}"] ?? $clinic["address_{$language}"] ?? '';
        
        // Подключаем шаблон
        require __DIR__ . '/../components/clinic/index.php';
    }
}


