<?php
/**
 * Контроллер главной страницы
 */

class HomeController {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    /**
     * Главная страница - список клиник
     */
    public function index() {
        $language = getLanguage();
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = CLINICS_PER_PAGE;
        $offset = ($page - 1) * $limit;
        
        // Фильтры
        $filters = [
            'city' => $_GET['city'] ?? null,
            'district' => $_GET['district'] ?? null,
            'search' => $_GET['search'] ?? null,
            'verified' => $_GET['verified'] ?? null,
            'minRating' => $_GET['minRating'] ?? null,
        ];
        
        // Получаем клиники
        $clinics = $this->getClinics($filters, $limit, $offset);
        $total = $this->getClinicsCount($filters);
        
        // Получаем города и районы для фильтров
        $cities = $this->db->select("SELECT * FROM " . $this->db->table('cities') . " ORDER BY sort_order ASC, name_{$language} ASC");
        
        // SEO данные
        $seoTitle = t('siteName');
        $seoDescription = t('siteDescription');
        
        // Подключаем шаблон
        require __DIR__ . '/../components/home/index.php';
    }
    
    /**
     * Получить список клиник с фильтрами
     */
    private function getClinics($filters, $limit, $offset) {
        $language = getLanguage();
        $sql = "SELECT 
            c.*,
            ci.name_{$language} as city_name,
            ci.slug_{$language} as city_slug,
            d.name_{$language} as district_name,
            d.slug_{$language} as district_slug
        FROM " . $this->db->table('clinics') . " c
        LEFT JOIN " . $this->db->table('cities') . " ci ON c.city_id = ci.id
        LEFT JOIN " . $this->db->table('districts') . " d ON c.district_id = d.id
        WHERE 1=1";
        
        $params = [];
        
        // Фильтр по городу
        if (!empty($filters['city'])) {
            $sql .= " AND ci.slug_{$language} = :city";
            $params['city'] = $filters['city'];
        }
        
        // Фильтр по району
        if (!empty($filters['district'])) {
            $sql .= " AND d.slug_{$language} = :district";
            $params['district'] = $filters['district'];
        }
        
        // Поиск
        if (!empty($filters['search'])) {
            $sql .= " AND (c.name_{$language} LIKE :search OR c.address_{$language} LIKE :search)";
            $params['search'] = '%' . $filters['search'] . '%';
        }
        
        // Фильтр по верификации
        if ($filters['verified'] !== null) {
            $sql .= " AND c.verified = :verified";
            $params['verified'] = $filters['verified'] ? 1 : 0;
        }
        
        // Фильтр по минимальному рейтингу
        if (!empty($filters['minRating'])) {
            $sql .= " AND c.d_score >= :minRating";
            $params['minRating'] = (int)$filters['minRating'];
        }
        
        // Сортировка: сначала верифицированные, потом по рейтингу
        $sql .= " ORDER BY c.verified DESC, c.d_score DESC";
        
        // Пагинация
        $sql .= " LIMIT :limit OFFSET :offset";
        $params['limit'] = $limit;
        $params['offset'] = $offset;
        
        return $this->db->select($sql, $params);
    }
    
    /**
     * Получить общее количество клиник
     */
    private function getClinicsCount($filters) {
        $language = getLanguage();
        $sql = "SELECT COUNT(*) as count
        FROM " . $this->db->table('clinics') . " c
        LEFT JOIN " . $this->db->table('cities') . " ci ON c.city_id = ci.id
        LEFT JOIN " . $this->db->table('districts') . " d ON c.district_id = d.id
        WHERE 1=1";
        
        $params = [];
        
        if (!empty($filters['city'])) {
            $sql .= " AND ci.slug_{$language} = :city";
            $params['city'] = $filters['city'];
        }
        
        if (!empty($filters['district'])) {
            $sql .= " AND d.slug_{$language} = :district";
            $params['district'] = $filters['district'];
        }
        
        if (!empty($filters['search'])) {
            $sql .= " AND (c.name_{$language} LIKE :search OR c.address_{$language} LIKE :search)";
            $params['search'] = '%' . $filters['search'] . '%';
        }
        
        if ($filters['verified'] !== null) {
            $sql .= " AND c.verified = :verified";
            $params['verified'] = $filters['verified'] ? 1 : 0;
        }
        
        $result = $this->db->selectOne($sql, $params);
        return (int)$result['count'];
    }
}


