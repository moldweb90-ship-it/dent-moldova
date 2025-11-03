<?php
/**
 * Главная страница - полностью повторяет дизайн оригинального проекта
 */

$language = getLanguage();
$db = Database::getInstance();
ob_start();

// Вспомогательные функции для определения цвета D-Score
function getDScoreColor($score) {
    if ($score >= 85) return 'bg-gradient-to-br from-emerald-500 to-green-600';
    if ($score >= 75) return 'bg-gradient-to-br from-green-500 to-emerald-500';
    if ($score >= 65) return 'bg-gradient-to-br from-yellow-500 to-orange-500';
    if ($score >= 50) return 'bg-gradient-to-br from-orange-500 to-red-500';
    return 'bg-gradient-to-br from-red-500 to-pink-600';
}

// Функция для получения изображения клиники
function getClinicImage($clinic) {
    if (!empty($clinic['logo_url'])) {
        return htmlspecialchars($clinic['logo_url']);
    }
    // Fallback изображение
    return 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300';
}

// Функция для получения названия клиники
function getClinicName($clinic, $language) {
    $field = $language === 'ro' ? 'name_ro' : 'name_ru';
    return htmlspecialchars($clinic[$field] ?? $clinic['name_ru'] ?? 'Клиника');
}
?>
<div class="flex min-h-screen bg-gray-50">
    <!-- Левая боковая панель - Фильтры (Desktop) -->
    <aside id="filters-sidebar" class="hidden md:block w-80 flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto">
        <div class="p-6 space-y-6">
            <?php
            // Получаем текущие значения фильтров
            $currentSearch = $_GET['search'] ?? '';
            $currentCitySlug = $_GET['city'] ?? '';
            $currentCityId = null;
            $currentDistricts = isset($_GET['districts']) ? (is_array($_GET['districts']) ? $_GET['districts'] : [$_GET['districts']]) : [];
            $currentFeatures = isset($_GET['features']) ? (is_array($_GET['features']) ? $_GET['features'] : [$_GET['features']]) : [];
            $currentPromotionalLabels = isset($_GET['promotionalLabels']) ? (is_array($_GET['promotionalLabels']) ? $_GET['promotionalLabels'] : [$_GET['promotionalLabels']]) : [];
            $currentSort = $_GET['sort'] ?? 'dscore';
            $currentVerified = isset($_GET['verified']) ? (bool)$_GET['verified'] : null;
            $currentOpenNow = isset($_GET['openNow']) ? (bool)$_GET['openNow'] : false;
            
            // Находим ID выбранного города
            if ($currentCitySlug) {
                foreach ($cities as $city) {
                    if ($city["slug_{$language}"] === $currentCitySlug) {
                        $currentCityId = $city['id'];
                        break;
                    }
                }
            }
            
            // Получаем районы для выбранного города
            $districts = [];
            if ($currentCityId) {
                $districts = $db->select(
                    "SELECT * FROM " . $db->table('districts') . " WHERE city_id = :city_id ORDER BY name_{$language} ASC",
                    ['city_id' => $currentCityId]
                );
            }
            
            // Группируем районы в колонки
            $districtsPerColumn = 3;
            $districtColumns = [];
            if (count($districts) > 0) {
                for ($i = 0; $i < count($districts); $i += $districtsPerColumn) {
                    $districtColumns[] = array_slice($districts, $i, $districtsPerColumn);
                }
            }
            ?>
            
            <!-- Поиск -->
            <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                </div>
                <input 
                    type="text" 
                    id="search-input"
                    name="search" 
                    placeholder="<?= t('searchPlaceholder') ?>"
                    value="<?= e($currentSearch) ?>"
                    class="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:border-blue-500 bg-white text-sm"
                >
                <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button type="button" class="text-gray-400 hover:text-gray-600 transition-colors" title="<?= $language === 'ru' ? 'Вы можете искать по названию клиники или по услугам' : 'Puteți căuta după numele clinicii sau după servicii' ?>">
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </button>
                </div>
            </div>
            
            <!-- Город -->
            <div>
                <div class="mt-6 mb-2 flex items-center gap-2">
                    <svg class="h-4 w-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <span class="text-[0.8rem] font-bold uppercase text-gray-800"><?= t('city') ?></span>
                    <div class="ml-2 h-px flex-1 bg-gray-200"></div>
                </div>
                <div class="relative">
                    <button
                        type="button"
                        id="city-dropdown-toggle"
                        class="w-full h-10 px-3 py-2 border-2 border-gray-200 rounded-md bg-white text-sm focus:outline-none focus:border-blue-500 hover:border-gray-300 transition-colors disabled:cursor-not-allowed disabled:opacity-50 text-left flex items-center justify-between"
                        <?= count($cities) === 0 ? 'disabled' : '' ?>
                    >
                        <span>
                            <?php
                            $selectedCityName = t('allCities');
                            if ($currentCitySlug) {
                                foreach ($cities as $city) {
                                    if ($city["slug_{$language}"] === $currentCitySlug) {
                                        $selectedCityName = $city["name_{$language}"];
                                        break;
                                    }
                                }
                            }
                            echo e($selectedCityName);
                            ?>
                        </span>
                        <span class="text-gray-400 transition-transform" id="city-dropdown-arrow">▼</span>
                    </button>
                    
                    <div id="city-dropdown" class="hidden absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                        <button
                            type="button"
                            class="city-option w-full px-3 py-2 text-left text-sm hover:bg-gray-50 <?= !$currentCitySlug ? 'bg-blue-50 text-blue-600' : '' ?>"
                            data-city-id=""
                            data-city-slug=""
                        >
                            <?= t('allCities') ?>
                        </button>
                        <?php foreach ($cities as $city): ?>
                            <button
                                type="button"
                                class="city-option w-full px-3 py-2 text-left text-sm hover:bg-gray-50 <?= $currentCitySlug === $city["slug_{$language}"] ? 'bg-blue-50 text-blue-600' : '' ?>"
                                data-city-id="<?= e($city['id']) ?>"
                                data-city-slug="<?= e($city["slug_{$language}"]) ?>"
                            >
                                <?= e($city["name_{$language}"]) ?>
                            </button>
                        <?php endforeach; ?>
                    </div>
                </div>
                <input type="hidden" id="city-input" name="city" value="<?= e($currentCitySlug) ?>">
                <?php if (count($cities) === 0): ?>
                    <p class="text-xs text-gray-500 mt-1"><?= $language === 'ru' ? 'Загружаем список городов...' : 'Se încarcă lista de orașe...' ?></p>
                <?php endif; ?>
            </div>
            
            <!-- Районы - показываем только если выбран город -->
            <?php if ($currentCityId && count($districts) > 0): ?>
                <div>
                    <div class="mt-6 mb-2 flex items-center gap-2">
                        <svg class="h-4 w-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        <span class="text-[0.8rem] font-bold uppercase text-gray-800"><?= t('districts') ?></span>
                        <div class="ml-2 h-px flex-1 bg-gray-200"></div>
                    </div>
                    <div class="space-y-3 max-h-48 overflow-y-auto">
                        <?php foreach ($districtColumns as $column): ?>
                            <div class="grid grid-cols-1 gap-2">
                                <?php foreach ($column as $district): ?>
                                    <?php $districtId = $district['id']; ?>
                                    <div class="flex items-center space-x-2">
                                        <input 
                                            type="checkbox" 
                                            id="district-<?= e($districtId) ?>"
                                            class="district-checkbox h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            value="<?= e($districtId) ?>"
                                            data-slug="<?= e($district["slug_{$language}"]) ?>"
                                            <?= in_array($districtId, $currentDistricts) ? 'checked' : '' ?>
                                        >
                                        <label 
                                            for="district-<?= e($districtId) ?>" 
                                            class="text-sm text-gray-700 cursor-pointer hover:text-gray-900 transition-colors"
                                        >
                                            <?= e($district["name_{$language}"]) ?>
                                        </label>
                                    </div>
                                <?php endforeach; ?>
                            </div>
                        <?php endforeach; ?>
                    </div>
                    <input type="hidden" id="districts-input" name="districts" value="<?= e(implode(',', $currentDistricts)) ?>">
                </div>
            <?php endif; ?>
            
            <!-- Открытые сейчас -->
            <div>
                <div class="mt-6 mb-2 flex items-center gap-2">
                    <svg class="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span class="text-[0.8rem] font-bold uppercase text-gray-800"><?= t('availability') ?></span>
                    <div class="ml-2 h-px flex-1 bg-gray-200"></div>
                </div>
                <div class="space-y-2">
                    <div class="flex items-center space-x-2">
                        <input 
                            type="checkbox" 
                            id="openNow"
                            name="openNow"
                            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            <?= $currentOpenNow ? 'checked' : '' ?>
                        >
                        <label 
                            for="openNow" 
                            class="text-sm text-gray-700 cursor-pointer hover:text-gray-900 transition-colors flex items-center gap-2"
                        >
                            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <?= t('openNow') ?>
                        </label>
                    </div>
                </div>
            </div>
            
            <!-- Удобства & Преимущества -->
            <div>
                <div class="mt-6 mb-2 flex items-center gap-2">
                    <svg class="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                    <span class="text-[0.8rem] font-bold uppercase text-gray-800"><?= t('conveniences') ?></span>
                    <div class="ml-2 h-px flex-1 bg-gray-200"></div>
                </div>
                <div class="space-y-2 max-h-48 overflow-y-auto">
                    <?php
                    $features = [
                        'pediatricDentistry' => ['icon' => '👶', 'color' => 'text-blue-500'],
                        'parking' => ['icon' => '🚗', 'color' => 'text-gray-600'],
                        'sos' => ['icon' => '⚠️', 'color' => 'text-red-500'],
                        'work24h' => ['icon' => '🕐', 'color' => 'text-green-500'],
                        'credit' => ['icon' => '💳', 'color' => 'text-purple-500'],
                        'weekendWork' => ['icon' => '📅', 'color' => 'text-orange-500'],
                    ];
                    ?>
                    <?php foreach ($features as $featureKey => $featureData): ?>
                        <div class="flex items-center space-x-2">
                            <input 
                                type="checkbox" 
                                id="feature-<?= $featureKey ?>"
                                class="feature-checkbox h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                value="<?= $featureKey ?>"
                                <?= in_array($featureKey, $currentFeatures) ? 'checked' : '' ?>
                            >
                            <label 
                                for="feature-<?= $featureKey ?>" 
                                class="text-sm text-gray-700 cursor-pointer hover:text-gray-900 transition-colors flex items-center gap-2"
                            >
                                <span class="<?= $featureData['color'] ?>"><?= $featureData['icon'] ?></span>
                                <?= t($featureKey) ?>
                            </label>
                        </div>
                    <?php endforeach; ?>
                </div>
                <input type="hidden" id="features-input" name="features" value="<?= e(implode(',', $currentFeatures)) ?>">
            </div>
            
            <!-- Сортировка -->
            <div>
                <div class="mt-6 mb-2 flex items-center gap-2">
                    <svg class="h-4 w-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                    </svg>
                    <span class="text-[0.8rem] font-bold uppercase text-gray-800"><?= t('sort') ?></span>
                    <div class="ml-2 h-px flex-1 bg-gray-200"></div>
                </div>
                <div class="relative">
                    <button
                        type="button"
                        id="sort-dropdown-toggle"
                        class="w-full h-10 px-3 py-2 border-2 border-gray-200 rounded-md bg-white text-sm focus:outline-none focus:border-blue-500 hover:border-gray-300 transition-colors text-left flex items-center justify-between"
                    >
                        <span>
                            <?php
                            $sortLabels = [
                                'dscore' => '🏆 ' . t('sortByRating'),
                                'price' => '💰 ' . t('sortByPrice'),
                                'popularity' => '📈 ' . t('sortByPopularity'),
                                'reviews' => '⭐ ' . t('sortByReviews'),
                            ];
                            echo e($sortLabels[$currentSort] ?? $sortLabels['dscore']);
                            ?>
                        </span>
                        <span class="text-gray-400 transition-transform" id="sort-dropdown-arrow">▼</span>
                    </button>
                    
                    <div id="sort-dropdown" class="hidden absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                        <?php foreach ($sortLabels as $sortKey => $sortLabel): ?>
                            <button
                                type="button"
                                class="sort-option w-full px-3 py-2 text-left text-sm hover:bg-gray-50 <?= $currentSort === $sortKey ? 'bg-blue-50 text-blue-600' : '' ?>"
                                data-sort="<?= $sortKey ?>"
                            >
                                <?= e($sortLabel) ?>
                            </button>
                        <?php endforeach; ?>
                    </div>
                </div>
                <input type="hidden" id="sort-input" name="sort" value="<?= e($currentSort) ?>">
            </div>
            
            <!-- Статусы & Рейтинги -->
            <div>
                <div class="mt-6 mb-2 flex items-center gap-2">
                    <svg class="h-4 w-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                    </svg>
                    <span class="text-[0.8rem] font-bold uppercase text-gray-800"><?= t('statuses') ?></span>
                    <div class="ml-2 h-px flex-1 bg-gray-200"></div>
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <?php
                    $promotionalLabels = [
                        'premium' => ['label' => t('premium'), 'bg' => 'bg-purple-100'],
                        'discount' => ['label' => t('discount'), 'bg' => 'bg-pink-100'],
                        'new' => ['label' => t('new'), 'bg' => 'bg-yellow-100'],
                        'popular' => ['label' => t('popular'), 'bg' => 'bg-red-100'],
                        'high_rating' => ['label' => t('high_rating'), 'bg' => 'bg-green-100'],
                    ];
                    ?>
                    <?php foreach ($promotionalLabels as $labelKey => $labelData): ?>
                        <div class="flex items-center space-x-2">
                            <input 
                                type="checkbox" 
                                id="label-<?= $labelKey ?>"
                                class="promotional-label-checkbox h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                value="<?= $labelKey ?>"
                                <?= in_array($labelKey, $currentPromotionalLabels) ? 'checked' : '' ?>
                            >
                            <label 
                                for="label-<?= $labelKey ?>" 
                                class="text-xs text-gray-700 cursor-pointer hover:text-gray-900 transition-colors <?= $labelData['bg'] ?> px-2 py-1 rounded"
                            >
                                <?= e($labelData['label']) ?>
                            </label>
                        </div>
                    <?php endforeach; ?>
                </div>
                <input type="hidden" id="promotional-labels-input" name="promotionalLabels" value="<?= e(implode(',', $currentPromotionalLabels)) ?>">
            </div>
            
            <!-- Кнопки -->
            <div class="pt-3 border-t border-gray-200">
                <div class="grid grid-cols-2 gap-3">
                    <button type="button" id="apply-filters-btn" class="bg-blue-600 text-white hover:bg-blue-700 shadow-lg px-4 py-2 rounded-md transition-colors">
                        <?= t('apply') ?>
                    </button>
                    <button type="button" id="reset-filters-btn" class="border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-md transition-colors">
                        <?= t('reset') ?>
                    </button>
                </div>
            </div>
        </div>
    </aside>

    <!-- Основной контент -->
    <main class="flex-1 px-4 md:px-8 py-2 md:py-8">
        <!-- Hero Section -->
        <?php if (empty($_GET['city']) && empty($_GET['search']) && empty($_GET['district'])): ?>
            <div class="mb-6 text-center">
                <h1 class="font-bold text-gray-900 leading-tight text-2xl md:text-3xl mb-3 md:mb-4">
                    <?= $language === 'ru' ? 'Все стоматологии Молдовы в один клик' : 'Toate clinicile stomatologice din Moldova într-un singur click' ?>
                </h1>
                <p class="text-gray-600 max-w-3xl mx-auto">
                    <?= $language === 'ru' ? 'Нашёл → Сравнил → Записался' : 'Am găsit → Am comparat → M-am înscris' ?>
                </p>
            </div>
        <?php endif; ?>

        <!-- Сетка клиник -->
        <?php if (empty($clinics)): ?>
            <div class="text-center py-12">
                <p class="text-gray-500 text-lg">
                    <?= t('noClinicsFound') ?>
                </p>
            </div>
        <?php else: ?>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-2 xs:gap-3 sm:gap-4 md:gap-6">
                <?php foreach ($clinics as $clinic): ?>
                    <?php
                    $clinicName = getClinicName($clinic, $language);
                    $clinicImage = getClinicImage($clinic);
                    $clinicSlug = htmlspecialchars($clinic['slug']);
                    $dScoreColor = getDScoreColor($clinic['d_score']);
                    $cityName = htmlspecialchars($clinic['city_name'] ?? '');
                    $districtName = htmlspecialchars($clinic['district_name'] ?? '');
                    $address = htmlspecialchars($clinic["address_{$language}"] ?? $clinic['address_ru'] ?? '');
                    $isVerified = !empty($clinic['verified']);
                    ?>
                    <div 
                        class="clinic-card relative rounded-2xl overflow-hidden aspect-[5/6] md:aspect-[4/3] <?= $isVerified ? 'cursor-pointer' : 'cursor-default' ?> group"
                        data-slug="<?= $clinicSlug ?>"
                        data-clinic-id="<?= htmlspecialchars($clinic['id']) ?>"
                    >
                        <!-- Фоновое изображение -->
                        <div class="absolute inset-0">
                            <img 
                                src="<?= $clinicImage ?>" 
                                alt="<?= $clinicName ?>"
                                class="w-full h-full object-cover clinic-image"
                                loading="lazy"
                            >
                            <!-- Затемнение -->
                            <div class="absolute inset-0 bg-black bg-opacity-50 clinic-overlay"></div>
                        </div>

                        <!-- Контент -->
                        <div class="absolute inset-0 flex flex-col justify-between text-white pl-2 pr-2 pt-2 sm:p-2 md:p-4 relative z-10">
                            <!-- Верхняя часть -->
                            <div class="flex justify-between items-start">
                                <div class="flex-1 min-w-0">
                                    <!-- Название клиники -->
                                    <h3 class="text-[1.1rem] sm:text-sm md:text-lg font-bold leading-tight mb-1 sm:mb-2 relative z-10 break-words text-white drop-shadow-2xl">
                                        <?= $clinicName ?>
                                        <?php if ($isVerified): ?>
                                            <svg 
                                                class="inline-block w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-400 ml-1" 
                                                viewBox="0 0 24 24" 
                                                fill="currentColor"
                                            >
                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                            </svg>
                                        <?php endif; ?>
                                    </h3>
                                    
                                    <!-- Город и район -->
                                    <div class="mb-1 sm:mb-2 space-y-0.5 sm:space-y-1">
                                        <p class="text-xs sm:text-xs md:text-sm drop-shadow-md opacity-90">
                                            <?= $cityName ?><?= $districtName ? ', ' . $districtName : '' ?>
                                        </p>
                                        
                                        <!-- Адрес -->
                                        <?php if ($address): ?>
                                            <p class="text-xs sm:text-xs md:text-sm drop-shadow-md opacity-90 flex items-center">
                                                <svg class="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                </svg>
                                                <span class="truncate"><?= $address ?></span>
                                            </p>
                                        <?php endif; ?>
                                    </div>
                                    
                                    <!-- Бейджи -->
                                    <div class="flex gap-0.5 sm:gap-1 flex-wrap">
                                        <?php if (!empty($clinic['recommended'])): ?>
                                            <div class="bg-red-500 text-white px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-bold shadow-md flex-shrink-0 flex items-center gap-0.5 sm:gap-1">
                                                <svg class="h-2.5 w-2.5 sm:h-3 sm:w-3" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                                </svg>
                                                <?= $language === 'ru' ? 'ТОП' : 'TOP' ?>
                                            </div>
                                        <?php endif; ?>
                                    </div>
                                </div>
                                
                                <!-- D-Score -->
                                <div class="flex-shrink-0 ml-1 sm:ml-2">
                                    <div class="<?= $dScoreColor ?> text-white px-2 py-1 rounded-lg shadow-lg">
                                        <div class="text-base sm:text-lg md:text-xl font-bold">
                                            <?= $clinic['d_score'] ?>
                                        </div>
                                        <div class="text-xs opacity-90">/100</div>
                                    </div>
                                </div>
                            </div>

                            <!-- Нижняя часть - Кнопки -->
                            <div class="absolute bottom-0 left-0 right-0 pl-2 pr-2 pb-2 sm:p-2 md:p-4 z-20">
                                <?php if ($isVerified): ?>
                                    <div class="flex space-x-1 sm:space-x-1 md:space-x-2">
                                        <button 
                                            onclick="event.stopPropagation(); window.location.href='<?= BASE_URL ?>/<?= $language === 'ro' ? 'ro/' : '' ?>clinic/<?= $clinicSlug ?>'"
                                            class="w-full inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg text-xs sm:text-sm md:text-base h-8 sm:h-9 md:h-10 px-3 sm:px-4 md:px-5 transition-all duration-200"
                                        >
                                            <svg class="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                            </svg>
                                            <span class="hidden lg:inline font-medium lg:text-[0.9rem]"><?= t('bookOneClick') ?></span>
                                            <span class="lg:hidden font-medium"><?= t('book') ?></span>
                                        </button>
                                        <button 
                                            onclick="event.stopPropagation(); window.location.href='<?= BASE_URL ?>/<?= $language === 'ro' ? 'ro/' : '' ?>clinic/<?= $clinicSlug ?>'"
                                            class="flex-1 border-2 border-white bg-white text-gray-900 hover:bg-gray-100 text-xs sm:text-xs md:text-sm h-8 sm:h-9 md:h-10 px-2 sm:px-3 md:px-4 rounded-full flex items-center justify-center"
                                        >
                                            <svg class="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-4 md:w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                            </svg>
                                            <span class="hidden sm:inline"><?= t('details') ?></span>
                                        </button>
                                    </div>
                                <?php else: ?>
                                    <div class="flex flex-col space-y-2">
                                        <div class="text-center">
                                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                                <div class="w-1.5 h-1.5 bg-gray-400 rounded-full mr-1.5"></div>
                                                <?= t('notVerified') ?>
                                            </span>
                                        </div>
                                        <button 
                                            onclick="event.stopPropagation(); openVerificationModal('<?= htmlspecialchars($clinic['id'], ENT_QUOTES) ?>')"
                                            class="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-sm text-xs sm:text-xs md:text-sm h-6 sm:h-7 md:h-8 px-1 sm:px-1 md:px-3 rounded-full transition-all duration-200 flex items-center justify-center"
                                        >
                                            <svg class="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                                            </svg>
                                            <?= t('verify') ?>
                                        </button>
                                    </div>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>

            <!-- Пагинация -->
            <?php if ($total > $limit): ?>
                <?php
                $totalPages = ceil($total / $limit);
                $currentPage = $page;
                ?>
                <div class="mt-8 flex justify-center space-x-2">
                    <?php for ($i = 1; $i <= $totalPages; $i++): ?>
                        <?php
                        $queryParams = $_GET;
                        $queryParams['page'] = $i;
                        $url = BASE_URL . '/?' . http_build_query($queryParams);
                        ?>
                        <a 
                            href="<?= $url ?>" 
                            class="px-4 py-2 rounded-md <?= $i === $currentPage ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100' ?> transition-colors"
                        >
                            <?= $i ?>
                        </a>
                    <?php endfor; ?>
                </div>
            <?php endif; ?>
        <?php endif; ?>
    </main>
</div>

<!-- Мобильные фильтры -->
<div id="mobile-filters-modal" class="hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 items-end justify-center">
    <div class="bg-white rounded-t-3xl w-full max-h-[85vh] overflow-y-auto p-6">
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold"><?= t('filters') ?></h2>
            <button onclick="closeMobileFilters()" class="text-gray-500 hover:text-gray-700">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
        <!-- Форма фильтров (копия из desktop sidebar) -->
        <form id="mobile-filters-form" method="GET" class="space-y-4">
            <!-- Те же поля что и в desktop версии -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"><?= t('search') ?></label>
                <input 
                    type="text" 
                    name="search" 
                    placeholder="<?= t('searchPlaceholder') ?>"
                    value="<?= e($_GET['search'] ?? '') ?>"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md"
                >
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"><?= t('city') ?></label>
                <select name="city" class="w-full px-4 py-2 border border-gray-300 rounded-md">
                    <option value=""><?= t('allCities') ?></option>
                    <?php foreach ($cities as $city): ?>
                        <option value="<?= e($city["slug_{$language}"]) ?>" <?= ($_GET['city'] ?? '') === $city["slug_{$language}"] ? 'selected' : '' ?>>
                            <?= e($city["name_{$language}"]) ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>
            <div class="flex space-x-2">
                <button type="submit" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md">
                    <?= t('applyFilters') ?>
                </button>
                <button type="button" onclick="resetFilters()" class="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md">
                    <?= t('resetFilters') ?>
                </button>
            </div>
        </form>
    </div>
</div>

<script>
function openVerificationModal(clinicId) {
    // TODO: Реализовать модальное окно верификации
    alert('<?= $language === 'ru' ? 'Функция верификации будет реализована' : 'Funcția de verificare va fi implementată' ?>');
}

function closeMobileFilters() {
    document.getElementById('mobile-filters-modal').classList.add('hidden');
    document.body.classList.remove('modal-open');
}
</script>

<?php
$content = ob_get_clean();
require __DIR__ . '/../layout.php';
?>
