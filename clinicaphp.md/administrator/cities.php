<?php
/**
 * Управление городами - полностью повторяет CitiesManagement.tsx
 */

$db = Database::getInstance();

$searchQuery = $_GET['q'] ?? '';
$editingCityId = $_GET['edit'] ?? null;
$editingDistrictId = $_GET['editDistrict'] ?? null;
$creatingDistrictCityId = $_GET['createDistrict'] ?? null;

// Получаем города с поиском
$where = '';
$params = [];
if ($searchQuery) {
    $where = "WHERE name_ru LIKE ? OR name_ro LIKE ?";
    $params = ["%$searchQuery%", "%$searchQuery%"];
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

// Получаем редактируемый город
$editingCity = null;
if ($editingCityId) {
    $editingCity = $db->selectOne(
        "SELECT * FROM " . $db->table('cities') . " WHERE id = ?",
        [$editingCityId]
    );
}

// Получаем редактируемый район
$editingDistrict = null;
if ($editingDistrictId) {
    $editingDistrict = $db->selectOne(
        "SELECT * FROM " . $db->table('districts') . " WHERE id = ?",
        [$editingDistrictId]
    );
}

// Получаем город для создания района
$creatingDistrictCity = null;
if ($creatingDistrictCityId) {
    $creatingDistrictCity = $db->selectOne(
        "SELECT * FROM " . $db->table('cities') . " WHERE id = ?",
        [$creatingDistrictCityId]
    );
}

$totalDistricts = array_sum(array_column($cities, 'districts_count'));

$language = getLanguage();
?>
<div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Управление городами</h1>
            <p class="text-xs sm:text-sm text-gray-600 mt-1">Добавление и редактирование городов и районов</p>
        </div>
        <button 
            onclick="openCreateCityModal()"
            class="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 rounded-md flex items-center justify-center w-full sm:w-auto shadow-sm transition-colors"
        >
            <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Добавить город
        </button>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-600">Городов</p>
                    <p class="text-2xl font-bold text-gray-900 mt-1"><?= count($cities) ?></p>
                </div>
                <div class="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                </div>
            </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-600">Районов</p>
                    <p class="text-2xl font-bold text-gray-900 mt-1"><?= $totalDistricts ?></p>
                </div>
                <div class="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                </div>
            </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-600">Активных</p>
                    <p class="text-2xl font-bold text-gray-900 mt-1"><?= count($cities) ?></p>
                </div>
                <div class="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <svg class="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                </div>
            </div>
        </div>
    </div>

    <!-- Search -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div class="relative">
            <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input
                type="text"
                id="search-input"
                placeholder="Поиск городов..."
                value="<?= e($searchQuery) ?>"
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onkeyup="handleSearch(event)"
            />
        </div>
    </div>

    <!-- Cities List -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="p-4 sm:p-6 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Список городов</h2>
        </div>
        <div class="p-4 sm:p-6">
            <?php if (empty($cities)): ?>
                <div class="text-center py-8 sm:py-12">
                    <svg class="h-12 w-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">
                        <?= $searchQuery ? 'Города не найдены' : 'Нет городов' ?>
                    </h3>
                    <p class="text-sm text-gray-600">
                        <?= $searchQuery 
                            ? 'Попробуйте изменить поисковый запрос'
                            : 'Добавьте первый город в систему'
                        ?>
                    </p>
                </div>
            <?php else: ?>
                <div class="space-y-4">
                    <?php foreach ($cities as $city): ?>
                        <div class="border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow">
                            <!-- City Header -->
                            <div class="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                                <div class="flex items-center space-x-4 flex-1 min-w-0">
                                    <div class="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                        </svg>
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <h3 class="font-semibold text-gray-900 text-base sm:text-lg"><?= e($city['name_ru']) ?></h3>
                                        <p class="text-sm text-gray-600"><?= e($city['name_ro']) ?></p>
                                        <div class="flex items-center space-x-2 mt-1">
                                            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                <?= $city['districts_count'] ?> <?= $city['districts_count'] == 1 ? 'район' : 'районов' ?>
                                            </span>
                                            <span class="text-xs text-gray-500">
                                                <?= date('d.m.Y', strtotime($city['created_at'] ?? 'now')) ?>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div class="flex space-x-2 ml-4">
                                    <button
                                        onclick="editCityModal('<?= $city['id'] ?>', '<?= e(addslashes($city['name_ru'])) ?>', '<?= e(addslashes($city['name_ro'])) ?>')"
                                        class="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                                        title="Редактировать"
                                    >
                                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                        </svg>
                                    </button>
                                    <button
                                        onclick="deleteCity('<?= $city['id'] ?>', '<?= e(addslashes($city['name_ru'])) ?>')"
                                        class="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                        title="Удалить"
                                    >
                                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Districts List -->
                            <?php if (!empty($city['districts'])): ?>
                                <div class="border-t bg-gray-50 p-4">
                                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        <?php foreach ($city['districts'] as $district): ?>
                                            <div class="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                                                <div class="flex items-center space-x-3 flex-1 min-w-0">
                                                    <div class="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <svg class="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                                        </svg>
                                                    </div>
                                                    <div class="flex-1 min-w-0">
                                                        <h4 class="font-medium text-gray-900 text-sm"><?= e($district['name_ru']) ?></h4>
                                                        <p class="text-xs text-gray-600"><?= e($district['name_ro']) ?></p>
                                                    </div>
                                                </div>
                                                <div class="flex space-x-1 ml-2">
                                                    <button
                                                        onclick="editDistrictModal('<?= $district['id'] ?>', '<?= e(addslashes($district['name_ru'])) ?>', '<?= e(addslashes($district['name_ro'])) ?>')"
                                                        class="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                                        title="Редактировать"
                                                    >
                                                        <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onclick="deleteDistrict('<?= $district['id'] ?>', '<?= e(addslashes($district['name_ru'])) ?>')"
                                                        class="p-1 text-red-400 hover:text-red-600 transition-colors"
                                                        title="Удалить"
                                                    >
                                                        <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        <?php endforeach; ?>
                                    </div>
                                </div>
                            <?php endif; ?>
                            
                            <!-- Add District Button -->
                            <div class="border-t bg-gray-50 p-4">
                                <button
                                    onclick="openCreateDistrictModal('<?= $city['id'] ?>', '<?= e(addslashes($city['name_ru'])) ?>')"
                                    class="w-full inline-flex items-center justify-center rounded-md border border-blue-300 bg-white px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                                >
                                    <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                                    </svg>
                                    Добавить район в <?= e($city['name_ru']) ?>
                                </button>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>

<!-- Create City Modal -->
<div id="create-city-modal" class="hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        <div class="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="text-xl font-bold">Добавить новый город</h3>
                    <p class="text-blue-100 text-sm mt-1">Заполните форму на двух языках</p>
                </div>
                <button onclick="closeCreateCityModal()" class="text-white/80 hover:text-white transition-colors">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        </div>
        <form id="create-city-form" class="p-6 space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    Название на русском <span class="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="create-city-name-ru"
                    name="nameRu"
                    placeholder="Кишинёв"
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    Название на румынском <span class="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="create-city-name-ro"
                    name="nameRo"
                    placeholder="Chișinău"
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            <div class="flex justify-end space-x-2 pt-4 border-t">
                <button
                    type="button"
                    onclick="closeCreateCityModal()"
                    class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    Отмена
                </button>
                <button
                    type="submit"
                    class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    <span id="create-city-submit-text">Добавить</span>
                    <span id="create-city-loading" class="hidden">Сохранение...</span>
                </button>
            </div>
        </form>
    </div>
</div>

<!-- Edit City Modal -->
<div id="edit-city-modal" class="hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        <div class="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="text-xl font-bold">Редактировать город</h3>
                    <p class="text-indigo-100 text-sm mt-1">Обновите информацию о городе</p>
                </div>
                <button onclick="closeEditCityModal()" class="text-white/80 hover:text-white transition-colors">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        </div>
        <form id="edit-city-form" class="p-6 space-y-4">
            <input type="hidden" id="edit-city-id" name="id" />
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    Название на русском <span class="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="edit-city-name-ru"
                    name="nameRu"
                    placeholder="Кишинёв"
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    Название на румынском <span class="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="edit-city-name-ro"
                    name="nameRo"
                    placeholder="Chișinău"
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>
            <div class="flex justify-end space-x-2 pt-4 border-t">
                <button
                    type="button"
                    onclick="closeEditCityModal()"
                    class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    Отмена
                </button>
                <button
                    type="submit"
                    class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                    <span id="edit-city-submit-text">Обновить</span>
                    <span id="edit-city-loading" class="hidden">Сохранение...</span>
                </button>
            </div>
        </form>
    </div>
</div>

<!-- Create District Modal -->
<div id="create-district-modal" class="hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        <div class="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="text-xl font-bold">Добавить район</h3>
                    <p class="text-green-100 text-sm mt-1" id="create-district-city-name">Город: <span id="create-district-city-name-value"></span></p>
                </div>
                <button onclick="closeCreateDistrictModal()" class="text-white/80 hover:text-white transition-colors">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        </div>
        <form id="create-district-form" class="p-6 space-y-4">
            <input type="hidden" id="create-district-city-id" name="cityId" />
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    Название на русском <span class="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="create-district-name-ru"
                    name="nameRu"
                    placeholder="Центр"
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    Название на румынском <span class="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="create-district-name-ro"
                    name="nameRo"
                    placeholder="Centru"
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
            </div>
            <div class="flex justify-end space-x-2 pt-4 border-t">
                <button
                    type="button"
                    onclick="closeCreateDistrictModal()"
                    class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    Отмена
                </button>
                <button
                    type="submit"
                    class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                    <span id="create-district-submit-text">Добавить</span>
                    <span id="create-district-loading" class="hidden">Сохранение...</span>
                </button>
            </div>
        </form>
    </div>
</div>

<!-- Edit District Modal -->
<div id="edit-district-modal" class="hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        <div class="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="text-xl font-bold">Редактировать район</h3>
                    <p class="text-purple-100 text-sm mt-1">Обновите информацию о районе</p>
                </div>
                <button onclick="closeEditDistrictModal()" class="text-white/80 hover:text-white transition-colors">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        </div>
        <form id="edit-district-form" class="p-6 space-y-4">
            <input type="hidden" id="edit-district-id" name="id" />
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    Название на русском <span class="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="edit-district-name-ru"
                    name="nameRu"
                    placeholder="Центр"
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    Название на румынском <span class="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="edit-district-name-ro"
                    name="nameRo"
                    placeholder="Centru"
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
            </div>
            <div class="flex justify-end space-x-2 pt-4 border-t">
                <button
                    type="button"
                    onclick="closeEditDistrictModal()"
                    class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    Отмена
                </button>
                <button
                    type="submit"
                    class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                    <span id="edit-district-submit-text">Обновить</span>
                    <span id="edit-district-loading" class="hidden">Сохранение...</span>
                </button>
            </div>
        </form>
    </div>
</div>

<script>
// Search handler
function handleSearch(event) {
    if (event.key === 'Enter') {
        const query = event.target.value.trim();
        const url = new URL(window.location.href);
        if (query) {
            url.searchParams.set('q', query);
        } else {
            url.searchParams.delete('q');
        }
        window.location.href = url.toString();
    }
}

// Create City Modal
function openCreateCityModal() {
    document.getElementById('create-city-modal').classList.remove('hidden');
    document.getElementById('create-city-modal').classList.add('flex');
    document.getElementById('create-city-name-ru').value = '';
    document.getElementById('create-city-name-ro').value = '';
    document.getElementById('create-city-name-ru').focus();
}

function closeCreateCityModal() {
    document.getElementById('create-city-modal').classList.add('hidden');
    document.getElementById('create-city-modal').classList.remove('flex');
}

document.getElementById('create-city-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const submitText = document.getElementById('create-city-submit-text');
    const loadingText = document.getElementById('create-city-loading');
    
    submitBtn.disabled = true;
    submitText.classList.add('hidden');
    loadingText.classList.remove('hidden');
    
    const formData = {
        nameRu: document.getElementById('create-city-name-ru').value.trim(),
        nameRo: document.getElementById('create-city-name-ro').value.trim()
    };
    
    try {
        // Формируем правильный URL для API
        let pathname = window.location.pathname;
        // Убираем /administrator и все что после
        pathname = pathname.replace(/\/administrator.*$/, '');
        // Убираем лишние слеши
        pathname = pathname.replace(/\/+$/, '') || '';
        
        // Собираем URL без двойных слешей
        const apiUrl = window.location.origin + (pathname ? pathname + '/' : '/') + 'api/admin/cities';
        
        console.log('API URL:', apiUrl); // Отладка
        console.log('Current pathname:', window.location.pathname); // Отладка
        console.log('Base path:', pathname); // Отладка
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin',
            body: JSON.stringify(formData)
        });
        
        // Проверяем Content-Type ответа
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Non-JSON response:', text.substring(0, 500));
            throw new Error('Сервер вернул не JSON ответ. Проверьте логи сервера.');
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || data.message || 'Ошибка сервера');
        }
        
        // В оригинале API возвращает объект города, проверяем наличие id
        if (data.id || data.success) {
            window.location.reload();
        } else {
            throw new Error(data.error || data.message || 'Неизвестная ошибка');
        }
    } catch (error) {
        console.error('Error:', error);
        if (error instanceof SyntaxError) {
            alert('Ошибка: Сервер вернул не JSON ответ. Проверьте консоль браузера (F12) для деталей.');
        } else {
            alert('Ошибка при создании города: ' + (error.message || 'Неизвестная ошибка'));
        }
        submitBtn.disabled = false;
        submitText.classList.remove('hidden');
        loadingText.classList.add('hidden');
    }
});

// Edit City Modal
function editCityModal(id, nameRu, nameRo) {
    document.getElementById('edit-city-id').value = id;
    document.getElementById('edit-city-name-ru').value = nameRu;
    document.getElementById('edit-city-name-ro').value = nameRo;
    document.getElementById('edit-city-modal').classList.remove('hidden');
    document.getElementById('edit-city-modal').classList.add('flex');
    document.getElementById('edit-city-name-ru').focus();
}

function closeEditCityModal() {
    document.getElementById('edit-city-modal').classList.add('hidden');
    document.getElementById('edit-city-modal').classList.remove('flex');
}

document.getElementById('edit-city-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const submitText = document.getElementById('edit-city-submit-text');
    const loadingText = document.getElementById('edit-city-loading');
    
    submitBtn.disabled = true;
    submitText.classList.add('hidden');
    loadingText.classList.remove('hidden');
    
    const id = document.getElementById('edit-city-id').value;
    const formData = {
        nameRu: document.getElementById('edit-city-name-ru').value.trim(),
        nameRo: document.getElementById('edit-city-name-ro').value.trim()
    };
    
    try {
        // Формируем правильный URL для API
        let basePath = window.location.pathname.replace(/\/administrator.*$/, '');
        basePath = basePath.replace(/^\/clinicaphp\.md/, '');
        basePath = basePath.replace(/\/+$/, '');
        const apiUrl = window.location.origin + (basePath || '') + '/api/admin/cities/' + id;
        
        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin',
            body: JSON.stringify(formData)
        });
        
        // Проверяем Content-Type ответа
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Non-JSON response on PUT city:', text.substring(0, 500));
            throw new Error('Сервер вернул не JSON ответ. Проверьте логи сервера.');
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || data.message || 'Ошибка сервера');
        }
        
        // В оригинале API возвращает объект города, проверяем наличие id
        if (data.id || data.success) {
            window.location.reload();
        } else {
            throw new Error(data.error || data.message || 'Неизвестная ошибка');
        }
    } catch (error) {
        console.error('Error:', error);
        if (error instanceof SyntaxError) {
            alert('Ошибка: Сервер вернул не JSON ответ. Проверьте консоль браузера (F12) для деталей.');
        } else {
            alert('Ошибка при обновлении города: ' + (error.message || 'Неизвестная ошибка'));
        }
        submitBtn.disabled = false;
        submitText.classList.remove('hidden');
        loadingText.classList.add('hidden');
    }
});

// Delete City
async function deleteCity(id, name) {
    if (!confirm(`Вы уверены, что хотите удалить город "${name}"?\n\nЭто действие нельзя отменить.`)) {
        return;
    }
    
    try {
        // Формируем правильный URL для API
        let basePath = window.location.pathname.replace(/\/administrator.*$/, '');
        basePath = basePath.replace(/^\/clinicaphp\.md/, '');
        basePath = basePath.replace(/\/+$/, '');
        const apiUrl = window.location.origin + (basePath || '') + '/api/admin/cities/' + id;
        
        const response = await fetch(apiUrl, {
            method: 'DELETE',
            credentials: 'same-origin'
        });
        
        // Проверяем Content-Type ответа
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Non-JSON response on DELETE:', text.substring(0, 500));
            throw new Error('Сервер вернул не JSON ответ. Проверьте логи сервера.');
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || data.message || 'Ошибка сервера');
        }
        
        // В оригинале API возвращает {message: 'Город успешно удален'}
        if (data.message || data.success) {
            window.location.reload();
        } else {
            throw new Error(data.error || data.message || 'Неизвестная ошибка');
        }
    } catch (error) {
        console.error('Error:', error);
        if (error instanceof SyntaxError) {
            alert('Ошибка: Сервер вернул не JSON ответ. Проверьте консоль браузера (F12) для деталей.');
        } else {
            alert('Ошибка при удалении города: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
        }
    }
}

// Create District Modal
function openCreateDistrictModal(cityId, cityName) {
    document.getElementById('create-district-city-id').value = cityId;
    document.getElementById('create-district-city-name-value').textContent = cityName;
    document.getElementById('create-district-name-ru').value = '';
    document.getElementById('create-district-name-ro').value = '';
    document.getElementById('create-district-modal').classList.remove('hidden');
    document.getElementById('create-district-modal').classList.add('flex');
    document.getElementById('create-district-name-ru').focus();
}

function closeCreateDistrictModal() {
    document.getElementById('create-district-modal').classList.add('hidden');
    document.getElementById('create-district-modal').classList.remove('flex');
}

document.getElementById('create-district-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const submitText = document.getElementById('create-district-submit-text');
    const loadingText = document.getElementById('create-district-loading');
    
    submitBtn.disabled = true;
    submitText.classList.add('hidden');
    loadingText.classList.remove('hidden');
    
    const cityId = document.getElementById('create-district-city-id').value;
    const formData = {
        nameRu: document.getElementById('create-district-name-ru').value.trim(),
        nameRo: document.getElementById('create-district-name-ro').value.trim()
    };
    
    try {
        // Формируем правильный URL для API
        let basePath = window.location.pathname.replace(/\/administrator.*$/, '');
        basePath = basePath.replace(/^\/clinicaphp\.md/, '');
        basePath = basePath.replace(/\/+$/, '');
        const apiUrl = window.location.origin + (basePath || '') + '/api/admin/cities/' + cityId + '/districts';
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin',
            body: JSON.stringify(formData)
        });
        
        // Проверяем Content-Type ответа
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Non-JSON response on POST district:', text.substring(0, 500));
            throw new Error('Сервер вернул не JSON ответ. Проверьте логи сервера.');
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || data.message || 'Ошибка сервера');
        }
        
        // В оригинале API возвращает объект района, проверяем наличие id
        if (data.id || data.success) {
            window.location.reload();
        } else {
            throw new Error(data.error || data.message || 'Неизвестная ошибка');
        }
    } catch (error) {
        console.error('Error:', error);
        if (error instanceof SyntaxError) {
            alert('Ошибка: Сервер вернул не JSON ответ. Проверьте консоль браузера (F12) для деталей.');
        } else {
            alert('Ошибка при создании района: ' + (error.message || 'Неизвестная ошибка'));
        }
        submitBtn.disabled = false;
        submitText.classList.remove('hidden');
        loadingText.classList.add('hidden');
    }
});

// Edit District Modal
function editDistrictModal(id, nameRu, nameRo) {
    document.getElementById('edit-district-id').value = id;
    document.getElementById('edit-district-name-ru').value = nameRu;
    document.getElementById('edit-district-name-ro').value = nameRo;
    document.getElementById('edit-district-modal').classList.remove('hidden');
    document.getElementById('edit-district-modal').classList.add('flex');
    document.getElementById('edit-district-name-ru').focus();
}

function closeEditDistrictModal() {
    document.getElementById('edit-district-modal').classList.add('hidden');
    document.getElementById('edit-district-modal').classList.remove('flex');
}

document.getElementById('edit-district-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const submitText = document.getElementById('edit-district-submit-text');
    const loadingText = document.getElementById('edit-district-loading');
    
    submitBtn.disabled = true;
    submitText.classList.add('hidden');
    loadingText.classList.remove('hidden');
    
    const id = document.getElementById('edit-district-id').value;
    const formData = {
        nameRu: document.getElementById('edit-district-name-ru').value.trim(),
        nameRo: document.getElementById('edit-district-name-ro').value.trim()
    };
    
    try {
        // Формируем правильный URL для API
        let basePath = window.location.pathname.replace(/\/administrator.*$/, '');
        basePath = basePath.replace(/^\/clinicaphp\.md/, '');
        basePath = basePath.replace(/\/+$/, '');
        const apiUrl = window.location.origin + (basePath || '') + '/api/admin/districts/' + id;
        
        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin',
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || data.message || 'Ошибка сервера');
        }
        
        // В оригинале API возвращает объект города, проверяем наличие id
        if (data.id || data.success) {
            window.location.reload();
        } else {
            throw new Error(data.error || data.message || 'Неизвестная ошибка');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Ошибка при обновлении района: ' + error.message);
        submitBtn.disabled = false;
        submitText.classList.remove('hidden');
        loadingText.classList.add('hidden');
    }
});

// Delete District
async function deleteDistrict(id, name) {
    if (!confirm(`Вы уверены, что хотите удалить район "${name}"?\n\nЭто действие нельзя отменить.`)) {
        return;
    }
    
    try {
        // Формируем правильный URL для API
        let basePath = window.location.pathname.replace(/\/administrator.*$/, '');
        basePath = basePath.replace(/^\/clinicaphp\.md/, '');
        basePath = basePath.replace(/\/+$/, '');
        const apiUrl = window.location.origin + (basePath || '') + '/api/admin/districts/' + id;
        
        const response = await fetch(apiUrl, {
            method: 'DELETE',
            credentials: 'same-origin'
        });
        
        // Проверяем Content-Type ответа
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Non-JSON response on DELETE:', text.substring(0, 500));
            throw new Error('Сервер вернул не JSON ответ. Проверьте логи сервера.');
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || data.message || 'Ошибка сервера');
        }
        
        // В оригинале API возвращает {message: 'Район успешно удален'}
        if (data.message || data.success) {
            window.location.reload();
        } else {
            throw new Error(data.error || data.message || 'Неизвестная ошибка');
        }
    } catch (error) {
        console.error('Error:', error);
        if (error instanceof SyntaxError) {
            alert('Ошибка: Сервер вернул не JSON ответ. Проверьте консоль браузера (F12) для деталей.');
        } else {
            alert('Ошибка при удалении района: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
        }
    }
}

// Close modals on ESC key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeCreateCityModal();
        closeEditCityModal();
        closeCreateDistrictModal();
        closeEditDistrictModal();
    }
});

// Close modals on backdrop click
document.querySelectorAll('[id$="-modal"]').forEach(modal => {
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    });
});
</script>
