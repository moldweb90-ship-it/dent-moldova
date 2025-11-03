<?php
/**
 * Страница настроек админки
 */

$db = Database::getInstance();
$activeTab = $_GET['tab'] ?? 'settings';
$section = $_GET['section'] ?? 'general';
$message = '';
$error = '';

// Обработка сохранения настроек
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['save_settings'])) {
    try {
        $settings = $_POST['settings'] ?? [];
        
        foreach ($settings as $key => $value) {
            if ($value !== null && $value !== '') {
                $db->setSiteSetting($key, $value);
            }
        }
        
        $message = 'Настройки успешно сохранены';
    } catch (Exception $e) {
        $error = 'Ошибка сохранения настроек: ' . $e->getMessage();
    }
}

// Загрузка настроек
$allSettings = $db->getAllSiteSettings();
$settingsMap = [];
foreach ($allSettings as $setting) {
    $settingsMap[$setting['setting_key']] = $setting['setting_value'];
}

// Получение значений с дефолтами
function getSetting($key, $default = '') {
    global $settingsMap;
    return $settingsMap[$key] ?? $default;
}

// Общие настройки
$logo = getSetting('logo', '');
$logoAlt = getSetting('logoAlt', 'Dent Moldova');
$logoWidth = getSetting('logoWidth', '100');
$favicon = getSetting('favicon', '');
$websiteName = getSetting('websiteName', 'Dent Moldova');
$websiteUrl = getSetting('websiteUrl', BASE_URL);
$organizationName = getSetting('organizationName', 'Dent Moldova');
$organizationDescription = getSetting('organizationDescription', 'Каталог стоматологических клиник в Молдове');
$organizationUrl = getSetting('organizationUrl', BASE_URL);
$organizationCity = getSetting('organizationCity', 'Кишинёв');
$organizationCountry = getSetting('organizationCountry', 'MD');
$businessType = getSetting('businessType', 'Dentist');
$businessPriceRange = getSetting('businessPriceRange', '$$');
$businessOpeningHours = getSetting('businessOpeningHours', 'Mo-Fr 09:00-18:00');
$schemaType = getSetting('schemaType', 'Organization');
$schemaData = getSetting('schemaData', '');

// SEO настройки (RU)
$siteTitleRu = getSetting('siteTitleRu', 'Dent Moldova - Каталог стоматологических клиник');
$metaDescriptionRu = getSetting('metaDescriptionRu', 'Найдите лучшую стоматологическую клинику в Молдове. Каталог проверенных клиник с ценами, отзывами и рейтингами.');
$keywordsRu = getSetting('keywordsRu', 'стоматология, стоматолог, лечение зубов, клиника, Молдова, Кишинёв');
$ogTitleRu = getSetting('ogTitleRu', 'Dent Moldova - Каталог стоматологических клиник');
$ogDescriptionRu = getSetting('ogDescriptionRu', 'Найдите лучшие стоматологические клиники в Молдове');
$ogImageRu = getSetting('ogImageRu', '');
$canonicalRu = getSetting('canonicalRu', BASE_URL);
$h1Ru = getSetting('h1Ru', 'Каталог стоматологических клиник в Молдове');

// SEO настройки (RO)
$siteTitleRo = getSetting('siteTitleRo', 'Dent Moldova - Catalogul clinicilor stomatologice');
$metaDescriptionRo = getSetting('metaDescriptionRo', 'Găsiți cea mai bună clinică stomatologică din Moldova. Catalogul clinicilor verificate cu prețuri, recenzii și evaluări.');
$keywordsRo = getSetting('keywordsRo', 'stomatologie, dentist, tratament dentar, clinică, Moldova, Chișinău');
$ogTitleRo = getSetting('ogTitleRo', 'Dent Moldova - Catalogul clinicilor stomatologice');
$ogDescriptionRo = getSetting('ogDescriptionRo', 'Găsiți cele mai bune clinici stomatologice din Moldova');
$ogImageRo = getSetting('ogImageRo', '');
$canonicalRo = getSetting('canonicalRo', BASE_URL . '/ro');
$h1Ro = getSetting('h1Ro', 'Catalogul clinicilor stomatologice din Moldova');

// Robots настройки
$robots = getSetting('robots', 'index,follow');
$robotsTxt = getSetting('robotsTxt', "User-agent: *\nDisallow: /administrator\nDisallow: /api\n\nSitemap: " . BASE_URL . "/sitemap.xml");

// Защита
$adminAccessCode = getSetting('adminAccessCode', '');

// Кеш настройки
$cacheEnabled = getSetting('cacheEnabled', 'true');
$cacheStrategy = getSetting('cacheStrategy', 'staleWhileRevalidate');
$staticAssetsEnabled = getSetting('staticAssetsEnabled', 'true');
$staticAssetsDuration = getSetting('staticAssetsDuration', '30');
$staticAssetsMaxSize = getSetting('staticAssetsMaxSize', '100');
$apiDataEnabled = getSetting('apiDataEnabled', 'true');
$apiDataDuration = getSetting('apiDataDuration', '15');
$apiEndpoints = getSetting('apiEndpoints', 'clinics,cities,districts,services');
$pagesEnabled = getSetting('pagesEnabled', 'true');
$pagesDuration = getSetting('pagesDuration', '2');
$pagesPreload = getSetting('pagesPreload', 'true');
?>

<div class="space-y-6">
    <!-- Заголовок -->
    <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
            <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <h1 class="text-2xl font-bold text-gray-900">Настройки</h1>
        </div>
    </div>

    <?php if ($message): ?>
        <div class="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
            <?= htmlspecialchars($message) ?>
        </div>
    <?php endif; ?>

    <?php if ($error): ?>
        <div class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            <?= htmlspecialchars($error) ?>
        </div>
    <?php endif; ?>

    <!-- Вкладки -->
    <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8 overflow-x-auto">
            <a href="?action=dashboard&tab=settings&section=general" 
               class="<?= $section === 'general' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300' ?> whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                Общие
            </a>
            <a href="?action=dashboard&tab=settings&section=seo" 
               class="<?= $section === 'seo' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300' ?> whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                SEO
            </a>
            <a href="?action=dashboard&tab=settings&section=robots" 
               class="<?= $section === 'robots' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300' ?> whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                Robots.txt
            </a>
            <a href="?action=dashboard&tab=settings&section=security" 
               class="<?= $section === 'security' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300' ?> whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                Защита
            </a>
        </nav>
    </div>

    <!-- Контент вкладок -->
    <?php
    $section = $_GET['section'] ?? 'general';
    
    if ($section === 'general') {
        include __DIR__ . '/settings/general.php';
    } elseif ($section === 'seo') {
        include __DIR__ . '/settings/seo.php';
    } elseif ($section === 'robots') {
        include __DIR__ . '/settings/robots.php';
    } elseif ($section === 'security') {
        include __DIR__ . '/settings/security.php';
    }
    ?>
</div>

