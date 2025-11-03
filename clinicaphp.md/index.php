<?php
/**
 * Главная точка входа приложения
 * 
 * Обрабатывает все запросы и маршрутизирует их
 */

// Защита от прямого доступа к конфигурации
define('DENTAL_CMS', true);

// Настройки сессии ДО session_start()
ini_set('session.cookie_httponly', 1);
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_secure', 0); // 1 для HTTPS

// Начало сессии
session_start();

// Подключение конфигурации
require_once __DIR__ . '/config/config.php';

// Подключение классов
require_once __DIR__ . '/includes/Database.php';
require_once __DIR__ . '/includes/RatingCalculator.php';
require_once __DIR__ . '/includes/Router.php';
require_once __DIR__ . '/includes/helpers.php';

// Инициализация маршрутизатора
$router = new Router();

// Регистрация маршрутов
$router->add('', 'home', 'index');
$router->add('ro', 'home', 'index');
$router->add('city/{citySlug}', 'city', 'index');
$router->add('ro/city/{citySlug}', 'city', 'index');
$router->add('city/{citySlug}/{districtSlug}', 'city', 'district');
$router->add('ro/city/{citySlug}/{districtSlug}', 'city', 'district');
$router->add('clinic/{slug}', 'clinic', 'index');
$router->add('ro/clinic/{slug}', 'clinic', 'index');
$router->add('clinic/ro/{slug}', 'clinic', 'index');
$router->add('pricing', 'pricing', 'index');
$router->add('ro/pricing', 'pricing', 'index');
$router->add('privacy', 'privacy', 'index');
$router->add('ro/privacy', 'privacy', 'index');

// Если это API запрос, обрабатываем отдельно
$requestUri = $_SERVER['REQUEST_URI'] ?? '';
if (strpos($requestUri, '/api/') !== false) {
    require __DIR__ . '/api/index.php';
    exit;
}

// Обработка переключения языка через параметр lang
// Если язык переключен через GET параметр, редиректим на правильный URL БЕЗ параметра lang
if (isset($_GET['lang']) && in_array($_GET['lang'], SUPPORTED_LANGUAGES)) {
    $newLang = $_GET['lang'];
    $requestUri = $_SERVER['REQUEST_URI'] ?? '';
    $parsed = parse_url($requestUri);
    $currentPath = $parsed['path'] ?? '/';
    
    // Убираем префикс /clinicaphp.md если есть
    $currentPath = str_replace('/clinicaphp.md', '', $currentPath);
    $currentPath = trim($currentPath, '/');
    
    // Определяем текущий язык по URL
    $currentLang = 'ru';
    if ($currentPath === 'ro' || strpos($currentPath, 'ro/') === 0) {
        $currentLang = 'ro';
    }
    
    // Если язык уже правильный, просто убираем параметр lang из URL
    if ($currentLang === $newLang) {
        // Убираем параметр lang из query string
        $queryParams = $_GET;
        unset($queryParams['lang']);
        unset($queryParams['route']);
        
        // Формируем URL без параметра lang
        $queryString = http_build_query($queryParams);
        $redirectUrl = BASE_URL . $parsed['path'] . ($queryString ? '?' . $queryString : '');
        
        header('Location: ' . $redirectUrl);
        exit;
    }
    
    // Убираем параметр lang и route из query string
    $queryParams = $_GET;
    unset($queryParams['lang']);
    unset($queryParams['route']);
    
    // Определяем текущий путь без языка
    $pathWithoutLang = $currentPath;
    
    // Убираем префикс языка если есть
    if ($pathWithoutLang === 'ro' || strpos($pathWithoutLang, 'ro/') === 0) {
        if ($pathWithoutLang === 'ro') {
            $pathWithoutLang = '';
        } else {
            $pathWithoutLang = substr($pathWithoutLang, 3);
        }
    }
    
    // Формируем новый путь с правильным префиксом языка
    $newPath = '';
    if ($newLang === 'ro') {
        $newPath = '/ro' . ($pathWithoutLang ? '/' . $pathWithoutLang : '');
    } else {
        $newPath = $pathWithoutLang ? '/' . $pathWithoutLang : '/';
    }
    
    // Добавляем префикс /clinicaphp.md если нужно
    $basePath = parse_url(BASE_URL, PHP_URL_PATH);
    if ($basePath && $basePath !== '/') {
        $newPath = $basePath . $newPath;
    } else {
        // Если BASE_URL не содержит путь, добавляем префикс /clinicaphp.md
        // Проверяем, был ли он в оригинальном URL
        if (strpos($_SERVER['REQUEST_URI'] ?? '', '/clinicaphp.md') !== false) {
            $newPath = '/clinicaphp.md' . $newPath;
        }
    }
    
    // Формируем полный URL БЕЗ параметра lang (убираем все query параметры кроме нужных)
    $queryString = http_build_query($queryParams);
    $redirectUrl = BASE_URL . $newPath . ($queryString ? '?' . $queryString : '');
    
    // Редирект на новый URL БЕЗ параметра lang
    header('Location: ' . $redirectUrl);
    exit;
}

// Обработка обычного запроса
$router->dispatch();

