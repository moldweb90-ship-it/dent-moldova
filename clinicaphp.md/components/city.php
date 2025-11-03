<?php
/**
 * Контроллер страницы города
 */

class CityController {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    /**
     * Список клиник в городе
     */
    public function index() {
        $language = getLanguage();
        $citySlug = $_GET['citySlug'] ?? null;
        
        if (!$citySlug) {
            http_response_code(404);
            require __DIR__ . '/../components/error/404.php';
            return;
        }
        
        // Получаем город
        $city = $this->db->selectOne(
            "SELECT * FROM " . $this->db->table('cities') . "
            WHERE slug_{$language} = :slug",
            ['slug' => $citySlug]
        );
        
        if (!$city) {
            http_response_code(404);
            require __DIR__ . '/../components/error/404.php';
            return;
        }
        
        // Получаем районы города
        $districts = $this->db->select(
            "SELECT * FROM " . $this->db->table('districts') . "
            WHERE city_id = :city_id
            ORDER BY name_{$language} ASC",
            ['city_id' => $city['id']]
        );
        
        // Получаем клиники города
        $clinics = $this->db->select(
            "SELECT 
                c.*,
                ci.name_{$language} as city_name,
                d.name_{$language} as district_name,
                d.slug_{$language} as district_slug
            FROM " . $this->db->table('clinics') . " c
            LEFT JOIN " . $this->db->table('districts') . " d ON c.district_id = d.id
            LEFT JOIN " . $this->db->table('cities') . " ci ON c.city_id = ci.id
            WHERE c.city_id = :city_id
            ORDER BY c.verified DESC, c.d_score DESC",
            ['city_id' => $city['id']]
        );
        
        // SEO данные
        $seoTitle = $city["name_{$language}"] . ' - ' . t('siteName');
        $seoDescription = t('clinics') . ' в ' . $city["name_{$language}"];
        
        // Подключаем шаблон
        require __DIR__ . '/../components/city/index.php';
    }
    
    /**
     * Список клиник в районе
     */
    public function district() {
        $language = getLanguage();
        $citySlug = $_GET['citySlug'] ?? null;
        $districtSlug = $_GET['districtSlug'] ?? null;
        
        if (!$citySlug || !$districtSlug) {
            http_response_code(404);
            require __DIR__ . '/../components/error/404.php';
            return;
        }
        
        // Получаем город
        $city = $this->db->selectOne(
            "SELECT * FROM " . $this->db->table('cities') . "
            WHERE slug_{$language} = :slug",
            ['slug' => $citySlug]
        );
        
        if (!$city) {
            http_response_code(404);
            require __DIR__ . '/../components/error/404.php';
            return;
        }
        
        // Получаем район
        $district = $this->db->selectOne(
            "SELECT * FROM " . $this->db->table('districts') . "
            WHERE city_id = :city_id AND slug_{$language} = :slug",
            [
                'city_id' => $city['id'],
                'slug' => $districtSlug
            ]
        );
        
        if (!$district) {
            http_response_code(404);
            require __DIR__ . '/../components/error/404.php';
            return;
        }
        
        // Получаем клиники района
        $clinics = $this->db->select(
            "SELECT 
                c.*,
                ci.name_{$language} as city_name,
                d.name_{$language} as district_name
            FROM " . $this->db->table('clinics') . " c
            LEFT JOIN " . $this->db->table('cities') . " ci ON c.city_id = ci.id
            LEFT JOIN " . $this->db->table('districts') . " d ON c.district_id = d.id
            WHERE c.district_id = :district_id
            ORDER BY c.verified DESC, c.d_score DESC",
            ['district_id' => $district['id']]
        );
        
        // SEO данные
        $seoTitle = $district["name_{$language}"] . ', ' . $city["name_{$language}"] . ' - ' . t('siteName');
        $seoDescription = t('clinics') . ' в ' . $district["name_{$language}"] . ', ' . $city["name_{$language}"];
        
        // Подключаем шаблон
        require __DIR__ . '/../components/city/district.php';
    }
}


