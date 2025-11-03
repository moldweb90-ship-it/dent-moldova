<?php
/**
 * Административная панель - точка входа
 */

define('DENTAL_CMS', true);
define('ADMIN_MODE', true);

// Настройки сессии ДО session_start()
ini_set('session.cookie_httponly', 1);
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_secure', 0); // 1 для HTTPS

session_start();

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../includes/Database.php';
require_once __DIR__ . '/../includes/RatingCalculator.php';
require_once __DIR__ . '/../includes/helpers.php';

// Проверка авторизации
$action = $_GET['action'] ?? 'login';

// Обработка POST запроса логина
if ($action === 'login' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    
    if ($username === ADMIN_USERNAME && $password === ADMIN_PASSWORD) {
        $_SESSION['admin_logged_in'] = true;
        header('Location: ' . BASE_URL . '/administrator/index.php?action=dashboard');
        exit;
    } else {
        $loginError = 'Неверный логин или пароль';
    }
}

if ($action !== 'login' && !isAdmin()) {
    header('Location: ' . BASE_URL . '/administrator/index.php?action=login');
    exit;
}

// Передаем ошибку в login.php если есть
if (isset($loginError)) {
    $error = $loginError;
}

// Если это не логин, подготавливаем данные для админки
if ($action !== 'login') {
    $db = Database::getInstance();
    $activeTab = $_GET['tab'] ?? 'dashboard';
    
    // Статистика для дашборда
    $stats = [
        'totalClinics' => $db->count('clinics'),
        'verifiedClinics' => $db->count('clinics', 'verified = 1'),
        'totalCities' => $db->count('cities'),
        'totalBookings' => $db->count('bookings', "status = 'new'"),
    ];
    
    // Если таблицы не существуют, устанавливаем значения в 0
    try {
        $stats['pendingVerification'] = $db->count('verification_requests', "status = 'pending'");
    } catch (Exception $e) {
        $stats['pendingVerification'] = 0;
    }
    
    try {
        $stats['pendingNewClinics'] = $db->count('new_clinic_requests', "status = 'pending'");
    } catch (Exception $e) {
        $stats['pendingNewClinics'] = 0;
    }
    
    // Последние клиники
    $recentClinics = $db->select(
        "SELECT c.*, ci.name_ru as city_name 
        FROM " . $db->table('clinics') . " c
        LEFT JOIN " . $db->table('cities') . " ci ON c.city_id = ci.id
        ORDER BY c.created_at DESC 
        LIMIT 10"
    );
    
    // Последние записи
    $recentBookings = $db->select(
        "SELECT b.*, c.name_ru as clinic_name 
        FROM " . $db->table('bookings') . " b
        LEFT JOIN " . $db->table('clinics') . " c ON b.clinic_id = c.id
        WHERE b.status = 'new'
        ORDER BY b.created_at DESC 
        LIMIT 10"
    );
    
    $pageTitle = 'Панель управления';
}

// Обработка действий
switch ($action) {
    case 'login':
        require __DIR__ . '/login.php';
        break;
    case 'logout':
        session_destroy();
        header('Location: ' . BASE_URL . '/administrator/index.php?action=login');
        exit;
    case 'dashboard':
        // Обработка табов через dashboard
        $tab = $_GET['tab'] ?? 'dashboard';
        if ($tab === 'bookings') {
            $activeTab = 'bookings';
            ob_start();
            require __DIR__ . '/bookings.php';
            $content = ob_get_clean();
            require __DIR__ . '/layout.php';
        } elseif ($tab === 'verification') {
            $activeTab = 'verification';
            ob_start();
            require __DIR__ . '/verification.php';
            $content = ob_get_clean();
            require __DIR__ . '/layout.php';
        } elseif ($tab === 'new-clinics') {
            $activeTab = 'new-clinics';
            ob_start();
            require __DIR__ . '/new-clinics.php';
            $content = ob_get_clean();
            require __DIR__ . '/layout.php';
        } elseif ($tab === 'settings') {
            $activeTab = 'settings';
            ob_start();
            require __DIR__ . '/settings.php';
            $content = ob_get_clean();
            require __DIR__ . '/layout.php';
        } else {
            ob_start();
            require __DIR__ . '/dashboard.php';
            $content = ob_get_clean();
            require __DIR__ . '/layout.php';
        }
        break;
    case 'clinics':
        $activeTab = 'clinics';
        ob_start();
        require __DIR__ . '/clinics.php';
        $content = ob_get_clean();
        require __DIR__ . '/layout.php';
        break;
    case 'cities':
        $activeTab = 'cities';
        ob_start();
        require __DIR__ . '/cities.php';
        $content = ob_get_clean();
        require __DIR__ . '/layout.php';
        break;
    case 'bookings':
        $activeTab = 'bookings';
        ob_start();
        require __DIR__ . '/bookings.php';
        $content = ob_get_clean();
        require __DIR__ . '/layout.php';
        break;
    default:
        // Обработка табов через dashboard
        $tab = $_GET['tab'] ?? 'dashboard';
        if ($tab === 'settings') {
            $activeTab = 'settings';
            ob_start();
            require __DIR__ . '/settings.php';
            $content = ob_get_clean();
            require __DIR__ . '/layout.php';
        } else {
            ob_start();
            require __DIR__ . '/dashboard.php';
            $content = ob_get_clean();
            require __DIR__ . '/layout.php';
        }
        break;
}

