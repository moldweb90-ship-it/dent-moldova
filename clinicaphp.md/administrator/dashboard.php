<?php
/**
 * Контент дашборда - полностью повторяет оригинальный Dashboard.tsx
 */

$db = Database::getInstance();

// Загружаем статистику через API (можно загружать сразу здесь)
$stats = [
    'totalClinics' => $db->count('clinics'),
    'verifiedClinics' => $db->count('clinics', 'verified = 1'),
    'totalCities' => $db->count('cities'),
    'todayBookings' => $db->count('bookings', "DATE(created_at) = CURDATE()"),
];

// Последние клиники (с отзывами)
$recentClinics = $db->select(
    "SELECT c.*, 
            ci.name_ru as city_name_ru, ci.name_ro as city_name_ro,
            d.name_ru as district_name_ru, d.name_ro as district_name_ro
     FROM " . $db->table('clinics') . " c
     LEFT JOIN " . $db->table('cities') . " ci ON c.city_id = ci.id
     LEFT JOIN " . $db->table('districts') . " d ON c.district_id = d.id
     ORDER BY c.verified DESC, c.created_at DESC
     LIMIT 5"
);

// Добавляем данные об отзывах
foreach ($recentClinics as &$clinic) {
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
}

// Просмотры за сегодня
try {
    $todayViews = $db->selectOne(
        "SELECT COUNT(DISTINCT ip_address) as count
         FROM " . $db->table('site_views') . "
         WHERE DATE(created_at) = CURDATE()"
    );
    $todayViewsCount = (int)($todayViews['count'] ?? 0);
} catch (Exception $e) {
    $todayViewsCount = 0;
}
?>
<div class="space-y-4 sm:space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Панель управления</h1>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <!-- Всего клиник -->
        <div class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer" onclick="window.location.href='?action=clinics&tab=clinics'">
            <div class="p-3 sm:p-4 lg:p-6">
                <div class="flex items-center justify-between">
                    <div class="flex-1 min-w-0">
                        <p class="text-xs sm:text-sm font-medium text-gray-600 truncate">Всего клиник</p>
                        <p class="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mt-1">
                            <?= $stats['totalClinics'] ?>
                        </p>
                        <p class="text-xs text-gray-500 mt-1 truncate">+2 за неделю</p>
                    </div>
                    <div class="p-2 rounded-lg bg-blue-500 flex-shrink-0 ml-2 sm:ml-3">
                        <svg class="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Городов -->
        <div class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer" onclick="window.location.href='?action=cities&tab=cities'">
            <div class="p-3 sm:p-4 lg:p-6">
                <div class="flex items-center justify-between">
                    <div class="flex-1 min-w-0">
                        <p class="text-xs sm:text-sm font-medium text-gray-600 truncate">Городов</p>
                        <p class="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mt-1">
                            <?= $stats['totalCities'] ?>
                        </p>
                        <p class="text-xs text-gray-500 mt-1 truncate">стабильно</p>
                    </div>
                    <div class="p-2 rounded-lg bg-green-500 flex-shrink-0 ml-2 sm:ml-3">
                        <svg class="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Текущий оборот -->
        <div class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer" onclick="window.location.href='?action=dashboard&tab=packages'">
            <div class="p-3 sm:p-4 lg:p-6">
                <div class="flex items-center justify-between">
                    <div class="flex-1 min-w-0">
                        <p class="text-xs sm:text-sm font-medium text-gray-600 truncate">Текущий оборот</p>
                        <p class="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mt-1">
                            0 MDL
                        </p>
                        <p class="text-xs text-gray-500 mt-1 truncate">0 активных подписок</p>
                    </div>
                    <div class="p-2 rounded-lg bg-purple-500 flex-shrink-0 ml-2 sm:ml-3">
                        <svg class="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Заявки -->
        <div class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer" onclick="window.location.href='?action=dashboard&tab=bookings'">
            <div class="p-3 sm:p-4 lg:p-6">
                <div class="flex items-center justify-between">
                    <div class="flex-1 min-w-0">
                        <p class="text-xs sm:text-sm font-medium text-gray-600 truncate">Заявки</p>
                        <p class="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mt-1">
                            <?= $stats['todayBookings'] ?>
                        </p>
                        <p class="text-xs text-gray-500 mt-1 truncate">за сегодня</p>
                    </div>
                    <div class="p-2 rounded-lg bg-orange-500 flex-shrink-0 ml-2 sm:ml-3">
                        <svg class="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Recent Activity -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <!-- Клиники с отзывами -->
        <div class="bg-white rounded-lg shadow">
            <div class="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                <h2 class="flex items-center text-base sm:text-lg font-semibold text-gray-900">
                    <svg class="h-4 w-4 sm:h-5 sm:w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                    Клиники с отзывами
                </h2>
            </div>
            <div class="p-3 sm:p-4">
                <div class="space-y-3 sm:space-y-4">
                    <?php 
                    $clinicsWithReviews = array_filter($recentClinics, function($clinic) {
                        return isset($clinic['reviewsData']) && 
                               $clinic['reviewsData']['reviewCount'] > 0 && 
                               $clinic['reviewsData']['averageRating'] > 0;
                    });
                    ?>
                    <?php if (!empty($clinicsWithReviews)): ?>
                        <?php foreach (array_slice($clinicsWithReviews, 0, 5) as $clinic): ?>
                            <div class="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                                 onclick="window.location.href='?action=clinics&tab=clinics&edit=<?= $clinic['id'] ?>'">
                                <div class="flex-1 min-w-0">
                                    <h4 class="text-sm sm:text-base font-medium text-gray-900 truncate"><?= e($clinic['name_ru']) ?></h4>
                                    <p class="text-xs sm:text-sm text-gray-600"><?= e($clinic['city_name_ru'] ?? '') ?></p>
                                </div>
                                <div class="text-right ml-2">
                                    <?php if ($clinic['reviewsData']['reviewCount'] > 0 && $clinic['reviewsData']['averageRating'] > 0): ?>
                                        <div class="text-xs sm:text-sm font-medium text-green-600 flex items-center justify-end gap-1">
                                            <span>⭐</span>
                                            <span><?= number_format($clinic['reviewsData']['averageRating'], 1) ?></span>
                                            <span class="text-gray-500">(<?= $clinic['reviewsData']['reviewCount'] ?>)</span>
                                        </div>
                                    <?php endif; ?>
                                    <div class="text-xs text-gray-500">
                                        <?= date('d.m.Y', strtotime($clinic['created_at'])) ?>
                                    </div>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <div class="text-center text-gray-500 py-8">
                            <svg class="h-12 w-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                            </svg>
                            <p>Пока нет добавленных клиник</p>
                        </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>

        <!-- Финансовые показатели -->
        <div class="bg-white rounded-lg shadow">
            <div class="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                <h2 class="flex items-center text-base sm:text-lg font-semibold text-gray-900">
                    <svg class="h-4 w-4 sm:h-5 sm:w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                    </svg>
                    Финансовые показатели
                </h2>
            </div>
            <div class="p-3 sm:p-4">
                <div class="space-y-2 sm:space-y-3">
                    <!-- Просмотры сегодня -->
                    <div class="flex justify-between items-center p-2 sm:p-3 bg-blue-50 rounded-lg">
                        <div class="flex items-center min-w-0">
                            <svg class="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                            <span class="text-xs sm:text-sm font-medium truncate">Просмотры сегодня</span>
                        </div>
                        <span class="text-sm sm:text-lg font-bold text-blue-600 ml-2"><?= $todayViewsCount ?></span>
                    </div>
                    
                    <!-- Месячный доход -->
                    <div class="flex justify-between items-center p-2 sm:p-3 bg-purple-50 rounded-lg">
                        <div class="flex items-center min-w-0">
                            <svg class="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                            </svg>
                            <span class="text-xs sm:text-sm font-medium truncate">Месячный доход</span>
                        </div>
                        <span class="text-sm sm:text-lg font-bold text-purple-600 ml-2">0 MDL</span>
                    </div>

                    <!-- Истекают скоро -->
                    <div class="flex justify-between items-center p-2 sm:p-3 bg-orange-50 rounded-lg">
                        <div class="flex items-center min-w-0">
                            <svg class="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-orange-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                            </svg>
                            <span class="text-xs sm:text-sm font-medium truncate">Истекают скоро</span>
                        </div>
                        <span class="text-sm sm:text-lg font-bold text-orange-600 ml-2">0</span>
                    </div>

                    <!-- Топ пакеты -->
                    <div class="mt-4">
                        <h4 class="text-xs sm:text-sm font-medium text-gray-700 mb-2">Топ пакеты</h4>
                        <div class="space-y-2">
                            <div class="text-center text-gray-500 py-4">
                                <p class="text-xs">Нет данных о пакетах</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
