<?php
/**
 * API эндпоинты для AJAX запросов
 */

// Самая первая проверка - записываем что скрипт запустился
$logFile = __DIR__ . '/../logs/api_debug.log';
$logDir = dirname($logFile);
if (!is_dir($logDir)) {
    @mkdir($logDir, 0755, true);
}
@file_put_contents($logFile, date('Y-m-d H:i:s') . " - API STARTED\nREQUEST_URI: " . ($_SERVER['REQUEST_URI'] ?? 'none') . "\nMETHOD: " . ($_SERVER['REQUEST_METHOD'] ?? 'none') . "\n\n", FILE_APPEND);

define('DENTAL_CMS', true);

// Включаем логирование ошибок в файл для отладки
ini_set('display_errors', 1); // Временно включаем для отладки
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../logs/api_errors.log');
error_reporting(E_ALL);

@file_put_contents($logFile, date('Y-m-d H:i:s') . " - Error reporting set\n", FILE_APPEND);

// Устанавливаем обработчик ошибок для возврата JSON
set_error_handler(function($severity, $message, $file, $line) {
    if (error_reporting() & $severity) {
        // Пропускаем E_WARNING и E_NOTICE чтобы не перехватывать все
        if ($severity === E_ERROR || $severity === E_PARSE || $severity === E_CORE_ERROR || $severity === E_COMPILE_ERROR) {
            http_response_code(500);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode([
                'error' => 'Server error: ' . $message,
                'file' => basename($file),
                'line' => $line
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }
    return false;
});

// Обработчик фатальных ошибок
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error !== null && in_array($error['type'], [E_ERROR, E_CORE_ERROR, E_COMPILE_ERROR, E_PARSE])) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'error' => 'Fatal error: ' . $error['message'],
            'file' => basename($error['file']),
            'line' => $error['line']
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
});

// Убеждаемся что нет никакого вывода до этого момента
if (ob_get_level() > 0) {
    ob_end_clean();
}
// Начинаем новый буфер для перехвата любого случайного вывода
ob_start();

session_start();

try {
    require_once __DIR__ . '/../config/config.php';
    require_once __DIR__ . '/../includes/Database.php';
    require_once __DIR__ . '/../includes/helpers.php';
} catch (Exception $e) {
    ob_end_clean();
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'Initialization error: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    exit;
}

// Очищаем буфер перед отправкой JSON - проверяем что ничего не было выведено
$output = ob_get_contents();
ob_end_clean();

// Если был какой-то вывод, это ошибка - логируем и возвращаем ошибку
if (!empty($output) && trim($output) !== '') {
    error_log('Unexpected output before JSON: ' . substr($output, 0, 200));
    // Не возвращаем ошибку, просто очищаем - возможно это был whitespace
}

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];
$path = $_GET['path'] ?? '';

try {
    $db = Database::getInstance();
} catch (Exception $e) {
    jsonResponse(['error' => 'Database connection error: ' . $e->getMessage()], 500);
    exit;
}

try {
    // Определяем путь из REQUEST_URI
    // После rewrite .htaccess запрос /clinicaphp.md/api/admin/cities 
    // перенаправляется на api/index.php, но REQUEST_URI остается оригинальным
    $requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    
    // Логируем для отладки
    @file_put_contents(__DIR__ . '/../logs/api_debug.log', date('Y-m-d H:i:s') . " - REQUEST_URI: $requestUri\n", FILE_APPEND);
    
    // Извлекаем путь после /api/
    $requestPath = '';
    
    // Ищем /api/ в пути
    $apiPos = strpos($requestUri, '/api/');
    if ($apiPos !== false) {
        $requestPath = substr($requestUri, $apiPos + 5); // +5 для '/api/'
    } else {
        // Если /api/ не найден, пробуем найти 'api/'
        $apiPos = strpos($requestUri, 'api/');
        if ($apiPos !== false) {
            $requestPath = substr($requestUri, $apiPos + 4); // +4 для 'api/'
        }
    }
    
    // Если путь пустой, пробуем через $_GET['route'] (на случай если rewrite работает иначе)
    if (empty($requestPath) && isset($_GET['route']) && !empty($_GET['route'])) {
        $requestPath = trim($_GET['route'], '/');
    }
    
    @file_put_contents(__DIR__ . '/../logs/api_debug.log', date('Y-m-d H:i:s') . " - Request path: $requestPath\n", FILE_APPEND);
    
    // Разбиваем путь на части
    $pathParts = explode('/', trim($requestPath, '/'));
    
    // Отладочная информация (только для разработки)
    // error_log('API Request: ' . $requestUri . ' -> Path: ' . $requestPath . ' -> Parts: ' . json_encode($pathParts));

    // Обработка маршрутов
    if (empty($pathParts[0])) {
        jsonResponse(['error' => 'Not found - empty path', 'debug' => ['uri' => $requestUri, 'path' => $requestPath]], 404);
        exit;
    }

    $endpoint = $pathParts[0];
    $param1 = $pathParts[1] ?? null;
    $param2 = $pathParts[2] ?? null;
    $param3 = $pathParts[3] ?? null;

    // Обработка админских эндпоинтов
    if ($endpoint === 'admin') {
        // Проверка авторизации
        if (!isAdmin()) {
            jsonResponse(['error' => 'Unauthorized'], 401);
            exit;
        }
        
        $adminEndpoint = $param1;
        $adminParam1 = $param2;
        $adminParam2 = $param3;
        
        switch ($adminEndpoint) {
            case 'stats':
                handleGetAdminStats($db);
                break;
            case 'recent-clinics':
                handleGetRecentClinics($db);
                break;
            case 'today-views':
                handleGetTodayViews($db);
                break;
            case 'clinics':
                handleAdminClinics($db, $adminParam1, $adminParam2, $method);
                break;
            case 'cities':
                if ($adminParam1 && $adminParam2 === 'districts') {
                    // admin/cities/{cityId}/districts
                    handleAdminDistricts($db, $adminParam1, null, $method);
                } else {
                    // admin/cities или admin/cities/{id}
                    handleAdminCities($db, $adminParam1, $adminParam2, $method);
                }
                break;
            case 'bookings':
                handleAdminBookings($db, $adminParam1, $adminParam2, $method);
                break;
            default:
                jsonResponse(['error' => 'Not found', 'debug' => ['endpoint' => $adminEndpoint, 'pathParts' => $pathParts]], 404);
                break;
        }
        exit;
    }

    // Публичные эндпоинты
    switch ($endpoint) {
        case 'clinics':
            if ($method === 'GET') {
                if ($param1 === 'ratings' && $param2) {
                    handleGetClinicRatings($db, $param2);
                } else {
                    handleGetClinics($db);
                }
            }
            break;
            
        case 'clinic':
            if ($method === 'GET' && $param1) {
                handleGetClinic($db, $param1);
            }
            break;
            
        case 'cities':
            if ($method === 'GET') {
                if ($param1 === 'districts' && $param2) {
                    handleGetDistricts($db, $param2);
                } else {
                    handleGetCities($db);
                }
            }
            break;
            
        case 'bookings':
            if ($method === 'POST') {
                handleCreateBooking($db);
            }
            break;
            
        case 'new-clinic-request':
            if ($method === 'POST') {
                handleNewClinicRequest($db);
            }
            break;
            
        case 'verification-requests':
            if ($method === 'POST') {
                handleVerificationRequest($db);
            }
            break;
            
        default:
            jsonResponse(['error' => 'Not found'], 404);
            break;
    }
} catch (Exception $e) {
    error_log('API Error: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
    jsonResponse(['error' => 'Internal server error: ' . $e->getMessage()], 500);
} catch (Error $e) {
    error_log('API Fatal Error: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
    jsonResponse(['error' => 'Internal server error: ' . $e->getMessage()], 500);
}

/**
 * Админские функции
 */

function handleGetAdminStats($db) {
    $stats = [
        'totalClinics' => $db->count('clinics'),
        'verifiedClinics' => $db->count('clinics', 'verified = 1'),
        'totalCities' => $db->count('cities'),
        'todayBookings' => $db->count('bookings', "DATE(created_at) = CURDATE()"),
    ];
    
    // Клиники с услугами
    try {
        $clinicsWithServices = $db->selectOne(
            "SELECT COUNT(DISTINCT clinic_id) as count FROM " . $db->table('services')
        );
        $stats['clinicsWithServices'] = (int)($clinicsWithServices['count'] ?? 0);
    } catch (Exception $e) {
        $stats['clinicsWithServices'] = 0;
    }
    
    jsonResponse($stats);
}

function handleGetRecentClinics($db) {
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 5;
    
    $clinics = $db->select(
        "SELECT c.*, 
                ci.name_ru as city_name_ru, ci.name_ro as city_name_ro,
                d.name_ru as district_name_ru, d.name_ro as district_name_ro
         FROM " . $db->table('clinics') . " c
         LEFT JOIN " . $db->table('cities') . " ci ON c.city_id = ci.id
         LEFT JOIN " . $db->table('districts') . " d ON c.district_id = d.id
         ORDER BY c.verified DESC, c.created_at DESC
         LIMIT " . (int)$limit
    );
    
    // Добавляем данные об отзывах
    foreach ($clinics as &$clinic) {
        try {
            $reviewsData = $db->selectOne(
                "SELECT AVG(rating) as avg_rating, COUNT(*) as count
                 FROM " . $db->table('reviews') . "
                 WHERE clinic_id = ? AND status = 'approved'",
                [$clinic['id']]
            );
            
            $clinic['reviewsData'] = [
                'averageRating' => $reviewsData ? (float)$reviewsData['avg_rating'] : 0,
                'reviewCount' => $reviewsData ? (int)$reviewsData['count'] : 0
            ];
        } catch (Exception $e) {
            $clinic['reviewsData'] = ['averageRating' => 0, 'reviewCount' => 0];
        }
        
        // Форматируем данные для совместимости с фронтендом
        $clinic['city'] = [
            'nameRu' => $clinic['city_name_ru'] ?? '',
            'nameRo' => $clinic['city_name_ro'] ?? ''
        ];
        
        if ($clinic['district_name_ru']) {
            $clinic['district'] = [
                'nameRu' => $clinic['district_name_ru'],
                'nameRo' => $clinic['district_name_ro']
            ];
        }
    }
    
    jsonResponse($clinics);
}

function handleGetTodayViews($db) {
    try {
        $views = $db->selectOne(
            "SELECT COUNT(DISTINCT ip_address) as count
             FROM " . $db->table('site_views') . "
             WHERE DATE(created_at) = CURDATE()"
        );
        
        jsonResponse(['views' => (int)($views['count'] ?? 0)]);
    } catch (Exception $e) {
        jsonResponse(['views' => 0]);
    }
}

function handleAdminClinics($db, $id, $action, $method) {
    if ($method === 'GET' && !$id) {
        // Список клиник
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 30;
        $offset = ($page - 1) * $limit;
        
        $search = $_GET['q'] ?? '';
        $city = $_GET['city'] ?? '';
        $district = $_GET['district'] ?? '';
        
        $where = ['1=1'];
        $params = [];
        
        if ($search) {
            $where[] = "(c.name_ru LIKE ? OR c.name_ro LIKE ?)";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }
        
        if ($city) {
            $where[] = "c.city_id = ?";
            $params[] = $city;
        }
        
        if ($district) {
            $where[] = "c.district_id = ?";
            $params[] = $district;
        }
        
        $whereClause = implode(' AND ', $where);
        
        $clinics = $db->select(
            "SELECT c.*, ci.name_ru as city_name_ru, ci.name_ro as city_name_ro
             FROM " . $db->table('clinics') . " c
             LEFT JOIN " . $db->table('cities') . " ci ON c.city_id = ci.id
             WHERE $whereClause
             ORDER BY c.verified DESC, c.created_at DESC
             LIMIT $limit OFFSET $offset",
            $params
        );
        
        $total = $db->selectOne(
            "SELECT COUNT(*) as count FROM " . $db->table('clinics') . " c WHERE $whereClause",
            $params
        );
        
        jsonResponse([
            'clinics' => $clinics,
            'total' => (int)$total['count'],
            'page' => $page,
            'limit' => $limit
        ]);
    } elseif ($method === 'GET' && $id) {
        // Одна клиника
        $clinic = $db->selectOne(
            "SELECT c.*, ci.name_ru as city_name_ru, ci.name_ro as city_name_ro
             FROM " . $db->table('clinics') . " c
             LEFT JOIN " . $db->table('cities') . " ci ON c.city_id = ci.id
             WHERE c.id = ?",
            [$id]
        );
        
        if (!$clinic) {
            jsonResponse(['error' => 'Clinic not found'], 404);
            return;
        }
        
        jsonResponse($clinic);
    } elseif ($method === 'DELETE' && $id) {
        // Удаление клиники
        $db->delete('clinics', 'id = ?', [$id]);
        jsonResponse(['success' => true]);
    } else {
        jsonResponse(['error' => 'Method not allowed'], 405);
    }
}

function handleAdminCities($db, $id, $action, $method) {
    if ($method === 'GET' && !$id) {
        $search = $_GET['q'] ?? '';
        $where = '';
        $params = [];
        
        if ($search) {
            $where = "WHERE name_ru LIKE ? OR name_ro LIKE ?";
            $params = ["%$search%", "%$search%"];
        }
        
        $cities = $db->select(
            "SELECT c.*, 
                    (SELECT COUNT(*) FROM " . $db->table('districts') . " WHERE city_id = c.id) as districts_count
             FROM " . $db->table('cities') . " c
             $where
             ORDER BY sort_order ASC, name_ru ASC",
            $params
        );
        
        // Загружаем районы для каждого города
        foreach ($cities as &$city) {
            $city['districts'] = $db->select(
                "SELECT * FROM " . $db->table('districts') . " WHERE city_id = ? ORDER BY name_ru ASC",
                [$city['id']]
            );
        }
        
        jsonResponse(['cities' => $cities]);
    } elseif ($method === 'POST' && !$id) {
        // ============================================
        // СОЗДАНИЕ ГОРОДА - ПОЛНАЯ ПЕРЕПИСЬ ЛОГИКИ
        // ============================================
        
        $logFile = __DIR__ . '/../logs/api_debug.log';
        
        try {
            // Шаг 1: Получаем JSON данные из запроса
            $rawInput = file_get_contents('php://input');
            @file_put_contents($logFile, date('Y-m-d H:i:s') . " [CREATE CITY] Raw input: " . substr($rawInput, 0, 200) . "\n", FILE_APPEND);
            
            if (empty($rawInput)) {
                jsonResponse(['error' => 'Пустой запрос'], 400);
                return;
            }
            
            $data = json_decode($rawInput, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                @file_put_contents($logFile, date('Y-m-d H:i:s') . " [CREATE CITY] JSON decode error: " . json_last_error_msg() . "\n", FILE_APPEND);
                jsonResponse(['error' => 'Неверный формат JSON: ' . json_last_error_msg()], 400);
                return;
            }
            
            @file_put_contents($logFile, date('Y-m-d H:i:s') . " [CREATE CITY] Parsed data: " . json_encode($data) . "\n", FILE_APPEND);
            
            // Шаг 2: Валидация входных данных
            $nameRu = isset($data['nameRu']) ? trim($data['nameRu']) : '';
            $nameRo = isset($data['nameRo']) ? trim($data['nameRo']) : '';
            
            if (empty($nameRu)) {
                jsonResponse(['error' => 'Название города на русском языке обязательно'], 400);
                return;
            }
            
            if (empty($nameRo)) {
                jsonResponse(['error' => 'Название города на румынском языке обязательно'], 400);
                return;
            }
            
            @file_put_contents($logFile, date('Y-m-d H:i:s') . " [CREATE CITY] Validation passed: RU='$nameRu', RO='$nameRo'\n", FILE_APPEND);
            
            // Шаг 3: Генерируем UUID (36 символов для MySQL char(36))
            $cityId = sprintf(
                '%08s-%04s-%04s-%04s-%012s',
                bin2hex(random_bytes(4)),
                bin2hex(random_bytes(2)),
                bin2hex(random_bytes(2)),
                bin2hex(random_bytes(2)),
                bin2hex(random_bytes(6))
            );
            
            @file_put_contents($logFile, date('Y-m-d H:i:s') . " [CREATE CITY] Generated ID: $cityId\n", FILE_APPEND);
            
            // Шаг 4: Генерируем slug для обоих языков
            $slugRu = slugify($nameRu, 'ru');
            $slugRo = slugify($nameRo, 'ro');
            
            @file_put_contents($logFile, date('Y-m-d H:i:s') . " [CREATE CITY] Generated slugs: RU='$slugRu', RO='$slugRo'\n", FILE_APPEND);
            
            // Шаг 5: Получаем максимальный sort_order
            $nextSortOrder = 1;
            try {
                $maxSortResult = $db->selectOne("SELECT MAX(sort_order) as max_sort FROM " . $db->table('cities') . " WHERE sort_order IS NOT NULL");
                if ($maxSortResult && isset($maxSortResult['max_sort']) && $maxSortResult['max_sort'] !== null) {
                    $nextSortOrder = intval($maxSortResult['max_sort']) + 1;
                }
            } catch (Exception $e) {
                @file_put_contents($logFile, date('Y-m-d H:i:s') . " [CREATE CITY] Warning: Could not get max sort_order: " . $e->getMessage() . ", using 1\n", FILE_APPEND);
                $nextSortOrder = 1;
            }
            
            @file_put_contents($logFile, date('Y-m-d H:i:s') . " [CREATE CITY] Next sort_order: $nextSortOrder\n", FILE_APPEND);
            
            // Шаг 6: Подготавливаем данные для вставки
            $insertData = [
                'id' => $cityId,
                'name_ru' => $nameRu,
                'name_ro' => $nameRo,
                'slug_ru' => $slugRu,
                'slug_ro' => $slugRo,
                'sort_order' => $nextSortOrder
            ];
            
            @file_put_contents($logFile, date('Y-m-d H:i:s') . " [CREATE CITY] Prepared insert data: " . json_encode($insertData) . "\n", FILE_APPEND);
            
            // Шаг 7: Вставляем в базу данных
            try {
                $db->insert('cities', $insertData);
                @file_put_contents($logFile, date('Y-m-d H:i:s') . " [CREATE CITY] ✓ Insert successful\n", FILE_APPEND);
            } catch (Exception $e) {
                @file_put_contents($logFile, date('Y-m-d H:i:s') . " [CREATE CITY] ✗ Insert failed: " . $e->getMessage() . "\n", FILE_APPEND);
                error_log('Database insert error: ' . $e->getMessage());
                jsonResponse(['error' => 'Ошибка базы данных: ' . $e->getMessage()], 500);
                return;
            }
            
            // Шаг 8: Получаем созданный город из БД для подтверждения
            $createdCity = null;
            try {
                $createdCity = $db->selectOne(
                    "SELECT * FROM " . $db->table('cities') . " WHERE id = ? LIMIT 1",
                    [$cityId]
                );
                
                if (!$createdCity) {
                    throw new Exception('Город не найден в БД после создания');
                }
                
                @file_put_contents($logFile, date('Y-m-d H:i:s') . " [CREATE CITY] ✓ City retrieved from DB\n", FILE_APPEND);
            } catch (Exception $e) {
                @file_put_contents($logFile, date('Y-m-d H:i:s') . " [CREATE CITY] ✗ Could not retrieve city: " . $e->getMessage() . "\n", FILE_APPEND);
                // Но не возвращаем ошибку - возможно город создан, просто не можем его получить
            }
            
            // Шаг 9: Формируем ответ в формате как в оригинале
            $response = [
                'id' => $cityId,
                'nameRu' => $nameRu,
                'nameRo' => $nameRo,
                'slugRu' => $slugRu,
                'slugRo' => $slugRo,
                'sortOrder' => $nextSortOrder
            ];
            
            // Добавляем created_at если есть в БД
            if ($createdCity && isset($createdCity['created_at'])) {
                $response['createdAt'] = $createdCity['created_at'];
            } else {
                $response['createdAt'] = date('Y-m-d H:i:s');
            }
            
            @file_put_contents($logFile, date('Y-m-d H:i:s') . " [CREATE CITY] ✓ SUCCESS - Returning response\n", FILE_APPEND);
            
            jsonResponse($response);
            
        } catch (Exception $e) {
            $errorMsg = $e->getMessage();
            @file_put_contents($logFile, date('Y-m-d H:i:s') . " [CREATE CITY] ✗ EXCEPTION: $errorMsg in " . $e->getFile() . ":" . $e->getLine() . "\n", FILE_APPEND);
            error_log('City creation error: ' . $errorMsg . ' in ' . $e->getFile() . ':' . $e->getLine());
            jsonResponse(['error' => 'Ошибка при создании города: ' . $errorMsg], 500);
        } catch (Error $e) {
            $errorMsg = $e->getMessage();
            @file_put_contents($logFile, date('Y-m-d H:i:s') . " [CREATE CITY] ✗ FATAL ERROR: $errorMsg in " . $e->getFile() . ":" . $e->getLine() . "\n", FILE_APPEND);
            error_log('City creation fatal error: ' . $errorMsg . ' in ' . $e->getFile() . ':' . $e->getLine());
            jsonResponse(['error' => 'Критическая ошибка: ' . $errorMsg], 500);
        }
    } elseif ($method === 'PUT' && $id) {
        // Обновление города
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Валидация
        if (empty($data['nameRu']) || empty($data['nameRo'])) {
            jsonResponse(['error' => 'Название города на обоих языках обязательно'], 400);
            return;
        }
        
        $updateData = [
            'name_ru' => trim($data['nameRu']),
            'name_ro' => trim($data['nameRo']),
        ];
        
        if (isset($data['nameRu'])) {
            $updateData['slug_ru'] = slugify(trim($data['nameRu']), 'ru');
        }
        if (isset($data['nameRo'])) {
            $updateData['slug_ro'] = slugify(trim($data['nameRo']), 'ro');
        }
        
        $db->update('cities', $updateData, 'id = ?', [$id]);
        
        // Получаем обновленный город из БД (как в оригинале)
        $updatedCity = $db->selectOne(
            "SELECT * FROM " . $db->table('cities') . " WHERE id = ?",
            [$id]
        );
        
        if (!$updatedCity) {
            jsonResponse(['error' => 'Город не найден'], 404);
            return;
        }
        
        // Форматируем ответ как в оригинале
        jsonResponse([
            'id' => $updatedCity['id'],
            'nameRu' => $updatedCity['name_ru'],
            'nameRo' => $updatedCity['name_ro'],
            'slugRu' => $updatedCity['slug_ru'],
            'slugRo' => $updatedCity['slug_ro'],
            'sortOrder' => $updatedCity['sort_order']
        ]);
    } elseif ($method === 'DELETE' && $id) {
        // Удаление города
        // Проверяем, есть ли клиники в этом городе
        $clinicCount = $db->count('clinics', 'city_id = ?', [$id]);
        if ($clinicCount > 0) {
            jsonResponse(['error' => "Нельзя удалить город, в котором есть клиники ($clinicCount клиник)"], 400);
            return;
        }
        
        // Удаляем все районы города
        $db->delete('districts', 'city_id = ?', [$id]);
        
        // Удаляем город
        $db->delete('cities', 'id = ?', [$id]);
        jsonResponse(['message' => 'Город успешно удален']);
    } else {
        jsonResponse(['error' => 'Method not allowed'], 405);
    }
}

function handleAdminDistricts($db, $cityId, $id, $method) {
    // Если cityId передан, это создание района для города
    if ($cityId && $method === 'POST' && !$id) {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                jsonResponse(['error' => 'Неверный формат JSON данных'], 400);
                return;
            }
            
            // Валидация
            if (empty($data['nameRu']) || empty($data['nameRo'])) {
                jsonResponse(['error' => 'Название района на обоих языках обязательно'], 400);
                return;
            }
            
            // Проверяем существование города
            $city = $db->selectOne("SELECT * FROM " . $db->table('cities') . " WHERE id = ?", [$cityId]);
            if (!$city) {
                jsonResponse(['error' => 'Город не найден'], 404);
                return;
            }
            
            $districtId = bin2hex(random_bytes(16));
            $districtId = substr($districtId, 0, 8) . '-' . substr($districtId, 8, 4) . '-' . substr($districtId, 12, 4) . '-' . substr($districtId, 16, 4) . '-' . substr($districtId, 20, 12);
            
            $insertData = [
                'id' => $districtId,
                'city_id' => $cityId,
                'name_ru' => trim($data['nameRu']),
                'name_ro' => trim($data['nameRo']),
                'slug_ru' => slugify(trim($data['nameRu']), 'ru'),
                'slug_ro' => slugify(trim($data['nameRo']), 'ro')
            ];
            
            // Пробуем вставить с created_at
            try {
                $db->insert('districts', array_merge($insertData, ['created_at' => date('Y-m-d H:i:s')]));
            } catch (Exception $e) {
                // Если created_at не существует или другое поле вызывает ошибку, пробуем без created_at
                if (strpos($e->getMessage(), 'created_at') !== false || strpos($e->getMessage(), 'Unknown column') !== false) {
                    $db->insert('districts', $insertData);
                } else {
                    throw $e; // Пробрасываем другие ошибки дальше
                }
            }
            
            // Получаем созданный район из БД (как в оригинале)
            $createdDistrict = $db->selectOne(
                "SELECT * FROM " . $db->table('districts') . " WHERE id = ?",
                [$districtId]
            );
            
            if (!$createdDistrict) {
                throw new Exception('Не удалось получить созданный район из БД');
            }
            
            // Форматируем ответ как в оригинале (возвращаем объект района)
            jsonResponse([
                'id' => $createdDistrict['id'],
                'cityId' => $createdDistrict['city_id'],
                'nameRu' => $createdDistrict['name_ru'],
                'nameRo' => $createdDistrict['name_ro'],
                'slugRu' => $createdDistrict['slug_ru'],
                'slugRo' => $createdDistrict['slug_ro']
            ]);
        } catch (Exception $e) {
            error_log('Error creating district: ' . $e->getMessage());
            jsonResponse(['error' => 'Ошибка при создании района: ' . $e->getMessage()], 500);
        }
        return;
    }
    
    // Обновление или удаление района
    if ($method === 'PUT' && $id) {
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Валидация
        if (empty($data['nameRu']) || empty($data['nameRo'])) {
            jsonResponse(['error' => 'Название района на обоих языках обязательно'], 400);
            return;
        }
        
        $updateData = [
            'name_ru' => trim($data['nameRu']),
            'name_ro' => trim($data['nameRo']),
        ];
        
        if (isset($data['nameRu'])) {
            $updateData['slug_ru'] = slugify(trim($data['nameRu']), 'ru');
        }
        if (isset($data['nameRo'])) {
            $updateData['slug_ro'] = slugify(trim($data['nameRo']), 'ro');
        }
        
        $db->update('districts', $updateData, 'id = ?', [$id]);
        
        // Получаем обновленный район из БД (как в оригинале)
        $updatedDistrict = $db->selectOne(
            "SELECT * FROM " . $db->table('districts') . " WHERE id = ?",
            [$id]
        );
        
        if (!$updatedDistrict) {
            jsonResponse(['error' => 'Район не найден'], 404);
            return;
        }
        
        // Форматируем ответ как в оригинале
        jsonResponse([
            'id' => $updatedDistrict['id'],
            'cityId' => $updatedDistrict['city_id'],
            'nameRu' => $updatedDistrict['name_ru'],
            'nameRo' => $updatedDistrict['name_ro'],
            'slugRu' => $updatedDistrict['slug_ru'],
            'slugRo' => $updatedDistrict['slug_ro']
        ]);
    } elseif ($method === 'DELETE' && $id) {
        // Проверяем, есть ли клиники в этом районе
        $clinicCount = $db->count('clinics', 'district_id = ?', [$id]);
        if ($clinicCount > 0) {
            jsonResponse(['error' => "Нельзя удалить район, в котором есть клиники ($clinicCount клиник)"], 400);
            return;
        }
        
        $db->delete('districts', 'id = ?', [$id]);
        jsonResponse(['message' => 'Район успешно удален']);
    } else {
        jsonResponse(['error' => 'Method not allowed'], 405);
    }
}

function handleAdminBookings($db, $id, $action, $method) {
    if ($method === 'GET' && !$id) {
        // Список заявок
        $bookings = $db->select(
            "SELECT b.*, c.name_ru as clinic_name
             FROM " . $db->table('bookings') . " b
             LEFT JOIN " . $db->table('clinics') . " c ON b.clinic_id = c.id
             ORDER BY b.created_at DESC"
        );
        
        jsonResponse(['bookings' => $bookings]);
    } elseif ($method === 'PUT' && $id && $action === 'status') {
        // Обновление статуса заявки
        $data = json_decode(file_get_contents('php://input'), true);
        $db->update('bookings', ['status' => $data['status']], 'id = ?', [$id]);
        jsonResponse(['success' => true]);
    } elseif ($method === 'DELETE' && $id) {
        // Удаление заявки
        $db->delete('bookings', 'id = ?', [$id]);
        jsonResponse(['success' => true]);
    } else {
        jsonResponse(['error' => 'Method not allowed'], 405);
    }
}

/**
 * Получить список клиник
 */
function handleGetClinics($db) {
    $language = $_GET['lang'] ?? getLanguage();
    $limit = (int)($_GET['limit'] ?? 20);
    $offset = (int)($_GET['offset'] ?? 0);
    
    $sql = "SELECT 
        c.*,
        ci.name_{$language} as city_name,
        ci.slug_{$language} as city_slug,
        d.name_{$language} as district_name
    FROM " . $db->table('clinics') . " c
    LEFT JOIN " . $db->table('cities') . " ci ON c.city_id = ci.id
    LEFT JOIN " . $db->table('districts') . " d ON c.district_id = d.id
    ORDER BY c.verified DESC, c.d_score DESC
    LIMIT :limit OFFSET :offset";
    
    $clinics = $db->select($sql, ['limit' => $limit, 'offset' => $offset]);
    
    jsonResponse([
        'success' => true,
        'data' => $clinics
    ]);
}

/**
 * Получить данные клиники
 */
function handleGetClinic($db, $slug = null) {
    if (!$slug) {
        $slug = $_GET['slug'] ?? null;
    }
    $language = $_GET['lang'] ?? getLanguage();
    
    if (!$slug) {
        jsonResponse(['error' => 'Slug required'], 400);
        return;
    }
    
    $clinic = $db->selectOne(
        "SELECT 
            c.*,
            ci.name_{$language} as city_name,
            ci.slug_{$language} as city_slug,
            d.name_{$language} as district_name
        FROM " . $db->table('clinics') . " c
        LEFT JOIN " . $db->table('cities') . " ci ON c.city_id = ci.id
        LEFT JOIN " . $db->table('districts') . " d ON c.district_id = d.id
        WHERE c.slug = :slug",
        ['slug' => $slug]
    );
    
    if (!$clinic) {
        jsonResponse(['error' => 'Clinic not found'], 404);
        return;
    }
    
    // Получаем услуги
    $services = $db->select(
        "SELECT * FROM " . $db->table('services') . "
        WHERE clinic_id = :clinic_id AND language = :language",
        [
            'clinic_id' => $clinic['id'],
            'language' => $language
        ]
    );
    
    $clinic['services'] = $services;
    
    jsonResponse([
        'success' => true,
        'data' => $clinic
    ]);
}

/**
 * Получить список городов
 */
function handleGetCities($db) {
    $language = $_GET['lang'] ?? getLanguage();
    
    $cities = $db->select(
        "SELECT * FROM " . $db->table('cities') . "
        ORDER BY sort_order ASC, name_{$language} ASC"
    );
    
    jsonResponse([
        'success' => true,
        'data' => $cities
    ]);
}

/**
 * Создать запись на прием
 */
function handleCreateBooking($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $required = ['clinic_id', 'first_name', 'phone', 'service', 'preferred_date', 'preferred_time'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            jsonResponse(['error' => "Field {$field} is required"], 400);
            return;
        }
    }
    
    $bookingData = [
        'id' => bin2hex(random_bytes(16)),
        'clinic_id' => $data['clinic_id'],
        'first_name' => $data['first_name'],
        'phone' => $data['phone'],
        'email' => $data['email'] ?? null,
        'contact_method' => $data['contact_method'] ?? 'phone',
        'service' => $data['service'],
        'preferred_date' => $data['preferred_date'],
        'preferred_time' => $data['preferred_time'],
        'notes' => $data['notes'] ?? null,
        'status' => 'new'
    ];
    
    try {
        $db->insert('bookings', $bookingData);
    jsonResponse([
        'success' => true,
        'message' => 'Запись успешно создана'
    ]);
    } catch (Exception $e) {
        jsonResponse(['error' => 'Database error'], 500);
    }
}

/**
 * Получить рейтинги клиники
 */
function handleGetClinicRatings($db, $clinicId) {
    // Получаем отзывы клиники
    $reviews = $db->select(
        "SELECT * FROM " . $db->table('reviews') . " WHERE clinic_id = :clinic_id",
        ['clinic_id' => $clinicId]
    );
    
    if (empty($reviews)) {
        jsonResponse([
            'success' => true,
            'hasRating' => false,
            'ratings' => null
        ]);
        return;
    }
    
    // Рассчитываем средние рейтинги
    $qualityRatings = array_column($reviews, 'rating');
    $averageRating = array_sum($qualityRatings) / count($qualityRatings);
    
    jsonResponse([
        'success' => true,
        'hasRating' => true,
        'averageRating' => round($averageRating, 2),
        'ratings' => [
            'qualityRating' => round($averageRating, 2),
            'serviceRating' => round($averageRating, 2),
            'priceRating' => round($averageRating, 2),
            'comfortRating' => round($averageRating, 2)
        ]
    ]);
}

/**
 * Получить районы города
 */
function handleGetDistricts($db, $citySlug) {
    $language = $_GET['language'] ?? getLanguage();
    
    $city = $db->selectOne(
        "SELECT * FROM " . $db->table('cities') . " WHERE slug_{$language} = :slug",
        ['slug' => $citySlug]
    );
    
    if (!$city) {
        jsonResponse(['error' => 'City not found'], 404);
        return;
    }
    
    $districts = $db->select(
        "SELECT * FROM " . $db->table('districts') . " 
        WHERE city_id = :city_id 
        ORDER BY name_{$language} ASC",
        ['city_id' => $city['id']]
    );
    
    jsonResponse([
        'success' => true,
        'data' => $districts
    ]);
}

/**
 * Обработка заявки на добавление клиники
 */
function handleNewClinicRequest($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (empty($data['name']) || empty($data['city_id'])) {
        jsonResponse(['error' => 'Name and city are required'], 400);
        return;
    }
    
    $requestData = [
        'id' => bin2hex(random_bytes(16)),
        'clinic_name' => $data['name'],
        'city_id' => $data['city_id'],
        'address' => $data['address'] ?? null,
        'phone' => $data['phone'] ?? null,
        'email' => $data['email'] ?? null,
        'website' => $data['website'] ?? null,
        'description' => $data['description'] ?? null,
        'status' => 'pending'
    ];
    
    try {
        $db->insert('new_clinic_requests', $requestData);
        jsonResponse([
            'success' => true,
            'message' => 'Заявка успешно отправлена'
        ]);
    } catch (Exception $e) {
        jsonResponse(['error' => 'Database error'], 500);
    }
}

/**
 * Обработка заявки на верификацию
 */
function handleVerificationRequest($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (empty($data['clinic_id']) || empty($data['requester_email']) || empty($data['requester_phone'])) {
        jsonResponse(['error' => 'All fields are required'], 400);
        return;
    }
    
    $requestData = [
        'id' => bin2hex(random_bytes(16)),
        'clinic_id' => $data['clinic_id'],
        'clinic_name' => $data['clinic_name'] ?? null,
        'clinic_address' => $data['clinic_address'] ?? null,
        'requester_email' => $data['requester_email'],
        'requester_phone' => $data['requester_phone'],
        'status' => 'pending'
    ];
    
    try {
        $db->insert('verification_requests', $requestData);
        jsonResponse([
            'success' => true,
            'message' => 'Заявка на верификацию успешно отправлена'
        ]);
    } catch (Exception $e) {
        jsonResponse(['error' => 'Database error'], 500);
    }
}

