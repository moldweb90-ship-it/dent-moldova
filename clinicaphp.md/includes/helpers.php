<?php
/**
 * Вспомогательные функции
 */

/**
 * Получить текущий язык
 */
function getLanguage() {
    return $_SESSION['language'] ?? DEFAULT_LANGUAGE;
}

/**
 * Установить язык
 */
function setLanguage($lang) {
    if (in_array($lang, SUPPORTED_LANGUAGES)) {
        $_SESSION['language'] = $lang;
        return true;
    }
    return false;
}

/**
 * Перевод строки
 */
function t($key, $default = null) {
    // Получаем текущий язык
    $lang = getLanguage();
    
    // Загружаем переводы для текущего языка
    $langFile = LANGUAGE_PATH . "/{$lang}.php";
    
    if (!file_exists($langFile)) {
        // Fallback на русский если файл языка не найден
        $langFile = LANGUAGE_PATH . "/ru.php";
    }
    
    // Загружаем переводы (каждый раз, чтобы не было проблем с кешированием)
    $translations = require $langFile;
    
    return $translations[$key] ?? $default ?? $key;
}

/**
 * Экранирование HTML
 */
function e($string) {
    return htmlspecialchars($string, ENT_QUOTES, 'UTF-8');
}

/**
 * Генерация slug из строки
 */
function slugify($text, $language = 'ru') {
    if ($language === 'ro') {
        // Для румынского языка используем транслитерацию
        $text = transliterate($text);
    } else {
        // Для русского - обычная транслитерация
        $text = transliterate($text);
    }
    
    $text = strtolower($text);
    $text = preg_replace('/[^a-z0-9-]/', '-', $text);
    $text = preg_replace('/-+/', '-', $text);
    $text = trim($text, '-');
    return $text;
}

/**
 * Транслитерация кириллицы
 */
function transliterate($text) {
    $cyrillic = [
        'а' => 'a', 'б' => 'b', 'в' => 'v', 'г' => 'g', 'д' => 'd',
        'е' => 'e', 'ё' => 'yo', 'ж' => 'zh', 'з' => 'z', 'и' => 'i',
        'й' => 'y', 'к' => 'k', 'л' => 'l', 'м' => 'm', 'н' => 'n',
        'о' => 'o', 'п' => 'p', 'р' => 'r', 'с' => 's', 'т' => 't',
        'у' => 'u', 'ф' => 'f', 'х' => 'h', 'ц' => 'ts', 'ч' => 'ch',
        'ш' => 'sh', 'щ' => 'sch', 'ъ' => '', 'ы' => 'y', 'ь' => '',
        'э' => 'e', 'ю' => 'yu', 'я' => 'ya'
    ];
    
    return strtr($text, $cyrillic);
}

/**
 * Форматирование цены
 */
function formatPrice($amount, $currency = 'MDL', $language = null) {
    if ($language === null) {
        $language = getLanguage();
    }
    
    $symbols = [
        'ru' => ['MDL' => 'лей', 'EUR' => '€', 'USD' => '$'],
        'ro' => ['MDL' => 'lei', 'EUR' => '€', 'USD' => '$']
    ];
    
    $symbol = $symbols[$language][$currency] ?? $currency;
    
    if ($currency === 'MDL') {
        return number_format($amount, 0, ',', ' ') . ' ' . $symbol;
    }
    
    return $symbol . number_format($amount, 0, '.', ',');
}

/**
 * Получить URL изображения
 */
function imageUrl($path) {
    if (empty($path)) {
        return IMAGES_URL . '/placeholder.jpg';
    }
    
    if (strpos($path, 'http') === 0) {
        return $path; // Уже полный URL
    }
    
    return IMAGES_URL . '/' . ltrim($path, '/');
}

/**
 * Проверка авторизации администратора
 */
function isAdmin() {
    return isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;
}

/**
 * Редирект
 */
function redirect($url) {
    header('Location: ' . $url);
    exit;
}

/**
 * JSON ответ
 */
function jsonResponse($data, $statusCode = 200) {
    // Очищаем любой предыдущий вывод
    if (ob_get_level() > 0) {
        ob_end_clean();
    }
    
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Получить IP адрес клиента
 */
function getClientIp() {
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        return $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        return $_SERVER['HTTP_X_FORWARDED_FOR'];
    } else {
        return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    }
}

