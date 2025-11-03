<?php
/**
 * Управление клиниками - полностью повторяет ClinicsManagement.tsx
 */

$db = Database::getInstance();

// Параметры фильтрации
$searchQuery = $_GET['q'] ?? '';
$selectedCity = $_GET['city'] ?? '';
$selectedDistrict = $_GET['district'] ?? '';
$currentPage = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = 30;
$offset = ($currentPage - 1) * $limit;

// Построение SQL запроса
$where = ['1=1'];
$params = [];

if ($searchQuery) {
    $where[] = "(c.name_ru LIKE ? OR c.name_ro LIKE ?)";
    $params[] = "%$searchQuery%";
    $params[] = "%$searchQuery%";
}

if ($selectedCity) {
    $where[] = "c.city_id = ?";
    $params[] = $selectedCity;
}

if ($selectedDistrict) {
    $where[] = "c.district_id = ?";
    $params[] = $selectedDistrict;
}

$whereClause = implode(' AND ', $where);

// Получаем клиники
$clinics = $db->select(
    "SELECT c.*, ci.name_ru as city_name_ru, ci.name_ro as city_name_ro,
            d.name_ru as district_name_ru, d.name_ro as district_name_ro
     FROM " . $db->table('clinics') . " c
     LEFT JOIN " . $db->table('cities') . " ci ON c.city_id = ci.id
     LEFT JOIN " . $db->table('districts') . " d ON c.district_id = d.id
     WHERE $whereClause
     ORDER BY c.verified DESC, c.created_at DESC
     LIMIT $limit OFFSET $offset",
    $params
);

// Общее количество
$totalResult = $db->selectOne(
    "SELECT COUNT(*) as count FROM " . $db->table('clinics') . " c WHERE $whereClause",
    $params
);
$total = (int)$totalResult['count'];
$totalPages = ceil($total / $limit);

// Получаем города для фильтра
$cities = $db->select(
    "SELECT * FROM " . $db->table('cities') . " ORDER BY sort_order ASC, name_ru ASC"
);

// Получаем районы для выбранного города
$districts = [];
if ($selectedCity) {
    $districts = $db->select(
        "SELECT * FROM " . $db->table('districts') . " WHERE city_id = ? ORDER BY name_ru ASC",
        [$selectedCity]
    );
}

// Режим редактирования
$editingClinicId = $_GET['edit'] ?? null;
$editingClinic = null;
if ($editingClinicId) {
    $editingClinic = $db->selectOne(
        "SELECT c.*, ci.name_ru as city_name_ru, ci.name_ro as city_name_ro
         FROM " . $db->table('clinics') . " c
         LEFT JOIN " . $db->table('cities') . " ci ON c.city_id = ci.id
         WHERE c.id = ?",
        [$editingClinicId]
    );
}

$language = getLanguage();
?>
<div class="space-y-4 sm:space-y-6 px-2 sm:px-0">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Управление клиниками</h1>
            <p class="text-xs sm:text-sm text-gray-600 mt-1">
                Всего клиник: <?= $total ?>
            </p>
        </div>
        <button 
            onclick="openCreateModal()"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center justify-center w-full sm:w-auto"
        >
            <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            <span class="hidden xs:inline">Добавить клинику</span>
            <span class="xs:hidden">Добавить</span>
        </button>
    </div>

    <!-- Search and Filters -->
    <div class="bg-white rounded-lg shadow p-4 sm:p-6">
        <div class="space-y-4">
            <!-- Поиск -->
            <div class="relative">
                <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <input
                    type="text"
                    id="search-input"
                    placeholder="Поиск клиник..."
                    value="<?= e($searchQuery) ?>"
                    class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onkeyup="handleSearch(event)"
                />
            </div>
            
            <!-- Фильтры по городам и районам -->
            <div class="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <!-- Фильтр по городу -->
                <div class="flex-1">
                    <select 
                        id="city-filter"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        onchange="handleCityChange(event)"
                    >
                        <option value="">Все города</option>
                        <?php foreach ($cities as $city): ?>
                            <option value="<?= $city['id'] ?>" <?= $selectedCity === $city['id'] ? 'selected' : '' ?>>
                                <?= e($city['name_ru']) ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                
                <!-- Фильтр по району -->
                <div class="flex-1">
                    <select 
                        id="district-filter"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 <?= !$selectedCity ? 'opacity-50 cursor-not-allowed' : '' ?>"
                        <?= !$selectedCity ? 'disabled' : '' ?>
                        onchange="handleDistrictChange(event)"
                    >
                        <option value="">Все районы</option>
                        <?php foreach ($districts as $district): ?>
                            <option value="<?= $district['id'] ?>" <?= $selectedDistrict === $district['id'] ? 'selected' : '' ?>>
                                <?= e($district['name_ru']) ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                
                <!-- Кнопка сброса фильтров -->
                <button 
                    onclick="resetFilters()"
                    class="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 sm:w-auto"
                >
                    Сбросить
                </button>
            </div>
            
            <!-- Счетчик результатов -->
            <div class="text-sm text-gray-600">
                Найдено клиник: <span class="font-medium"><?= $total ?></span>
                <?php if ($selectedCity): ?>
                    <?php 
                    $cityName = '';
                    foreach ($cities as $c) {
                        if ($c['id'] === $selectedCity) {
                            $cityName = $c['name_ru'];
                            break;
                        }
                    }
                    ?>
                    <span class="ml-2">
                        в городе: <span class="font-medium"><?= e($cityName) ?></span>
                    </span>
                <?php endif; ?>
                <?php if ($selectedDistrict): ?>
                    <?php 
                    $districtName = '';
                    foreach ($districts as $d) {
                        if ($d['id'] === $selectedDistrict) {
                            $districtName = $d['name_ru'];
                            break;
                        }
                    }
                    ?>
                    <span class="ml-2">
                        в районе: <span class="font-medium"><?= e($districtName) ?></span>
                    </span>
                <?php endif; ?>
            </div>
        </div>
    </div>

    <!-- Clinics List -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <?php if (empty($clinics)): ?>
            <div class="col-span-full text-center py-8 sm:py-12">
                <div class="text-gray-400 mb-3 sm:mb-4">
                    <svg class="h-8 w-8 sm:h-12 sm:w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                </div>
                <h3 class="text-base sm:text-lg font-medium text-gray-900 mb-2">
                    <?= $searchQuery ? 'Клиники не найдены' : 'Нет клиник' ?>
                </h3>
                <p class="text-sm sm:text-base text-gray-600 px-4">
                    <?= $searchQuery 
                        ? 'Попробуйте изменить поисковый запрос'
                        : 'Добавьте первую клинику в систему'
                    ?>
                </p>
            </div>
        <?php else: ?>
            <?php foreach ($clinics as $clinic): ?>
                <div class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow flex flex-col">
                    <div class="p-3 sm:p-6">
                        <div class="flex justify-between items-start mb-3">
                            <div class="flex items-start space-x-2 sm:space-x-3 flex-1 min-w-0">
                                <!-- Clinic Logo -->
                                <div class="flex-shrink-0">
                                    <img 
                                        src="<?= imageUrl($clinic['logo_url']) ?>"
                                        alt="<?= e($clinic['name_ru']) ?>"
                                        class="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover border"
                                        onerror="this.src='https://images.unsplash.com/photo-1629909613654-28e377c37b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100'"
                                    />
                                </div>
                                <div class="flex-1 min-w-0">
                                    <h3 class="text-sm sm:text-lg font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                                        onclick="editClinic('<?= $clinic['id'] ?>')">
                                        <?= e($clinic['name_ru']) ?>
                                    </h3>
                                    <div class="flex items-center text-xs sm:text-sm text-gray-600 mt-1">
                                        <svg class="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                        </svg>
                                        <span>
                                            <?= e($clinic['city_name_ru'] ?? '') ?>
                                            <?php if ($clinic['district_name_ru']): ?>
                                                , <?= e($clinic['district_name_ru']) ?>
                                            <?php endif; ?>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="space-y-2 sm:space-y-3 flex-1">
                            <!-- Status Badges -->
                            <div class="flex flex-wrap gap-1">
                                <?php if ($clinic['verified']): ?>
                                    <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center">
                                        <svg class="h-2 w-2 sm:h-3 sm:w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                        <span class="hidden xs:inline">Проверено</span>
                                        <span class="xs:hidden">✓</span>
                                    </span>
                                <?php endif; ?>
                            </div>

                            <!-- Contact Info -->
                            <div class="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                                <?php if ($clinic['phone']): ?>
                                    <div class="flex items-center text-gray-600">
                                        <svg class="h-3 w-3 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                        </svg>
                                        <span class="truncate"><?= e($clinic['phone']) ?></span>
                                    </div>
                                <?php endif; ?>
                                <?php if ($clinic['website']): ?>
                                    <div class="flex items-center text-gray-600">
                                        <svg class="h-3 w-3 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                                        </svg>
                                        <span class="truncate"><?= e($clinic['website']) ?></span>
                                    </div>
                                <?php endif; ?>
                            </div>

                            <!-- Last Updated Date -->
                            <div class="flex items-center justify-between text-xs">
                                <span class="text-gray-500">
                                    <span class="hidden sm:inline">Обновлено: </span>
                                    <span class="sm:hidden">Обн: </span>
                                    <?= date('d.m.Y', strtotime($clinic['updated_at'])) ?>
                                </span>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="flex space-x-1 sm:space-x-2 pt-2 border-t border-gray-100 mt-auto">
                            <button
                                onclick="window.open('<?= BASE_URL ?>/clinic/<?= $clinic['slug'] ?>', '_blank')"
                                class="flex-1 text-xs px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center"
                            >
                                <svg class="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                </svg>
                                Просмотр
                            </button>
                            <button
                                onclick="editClinic('<?= $clinic['id'] ?>')"
                                class="text-xs px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center"
                            >
                                <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                                <span class="hidden xs:inline ml-1">Изм</span>
                            </button>
                            <button
                                onclick="deleteClinic('<?= $clinic['id'] ?>', '<?= e($clinic['name_ru']) ?>')"
                                class="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs px-2 py-1 border border-gray-300 rounded-md"
                            >
                                <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>

    <!-- Pagination -->
    <?php if ($totalPages > 1): ?>
        <div class="flex items-center justify-between border-t border-gray-200 bg-white px-2 sm:px-4 py-3 sm:px-6 rounded-lg">
            <div class="flex items-center gap-2">
                <span class="text-sm text-gray-700">
                    Страница <span class="font-medium"><?= $currentPage ?></span> из <span class="font-medium"><?= $totalPages ?></span>
                </span>
            </div>
            <div class="flex items-center gap-2">
                <button
                    onclick="changePage(<?= $currentPage - 1 ?>)"
                    <?= $currentPage === 1 ? 'disabled' : '' ?>
                    class="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 <?= $currentPage === 1 ? 'opacity-50 cursor-not-allowed' : '' ?>"
                >
                    Назад
                </button>
                <button
                    onclick="changePage(<?= $currentPage + 1 ?>)"
                    <?= $currentPage >= $totalPages ? 'disabled' : '' ?>
                    class="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 <?= $currentPage >= $totalPages ? 'opacity-50 cursor-not-allowed' : '' ?>"
                >
                    Вперед
                </button>
            </div>
        </div>
    <?php endif; ?>
</div>

<script>
function handleSearch(event) {
    if (event.key === 'Enter') {
        const query = event.target.value;
        const url = new URL(window.location.href);
        url.searchParams.set('q', query);
        url.searchParams.delete('page');
        window.location.href = url.toString();
    }
}

function handleCityChange(event) {
    const cityId = event.target.value;
    const url = new URL(window.location.href);
    if (cityId) {
        url.searchParams.set('city', cityId);
    } else {
        url.searchParams.delete('city');
    }
    url.searchParams.delete('district');
    url.searchParams.delete('page');
    window.location.href = url.toString();
}

function handleDistrictChange(event) {
    const districtId = event.target.value;
    const url = new URL(window.location.href);
    if (districtId) {
        url.searchParams.set('district', districtId);
    } else {
        url.searchParams.delete('district');
    }
    url.searchParams.delete('page');
    window.location.href = url.toString();
}

function resetFilters() {
    const url = new URL(window.location.href);
    url.searchParams.delete('q');
    url.searchParams.delete('city');
    url.searchParams.delete('district');
    url.searchParams.delete('page');
    window.location.href = url.toString();
}

function changePage(page) {
    const url = new URL(window.location.href);
    url.searchParams.set('page', page);
    window.location.href = url.toString();
}

function editClinic(id) {
    const url = new URL(window.location.href);
    url.searchParams.set('edit', id);
    window.location.href = url.toString();
}

function openCreateModal() {
    alert('Форма создания клиники будет реализована');
    // TODO: Открыть модальное окно создания клиники
}

function deleteClinic(id, name) {
    if (confirm(`Вы уверены, что хотите удалить клинику "${name}"?`)) {
        fetch('<?= BASE_URL ?>/api/admin/clinics/' + id, {
            method: 'DELETE',
            credentials: 'same-origin'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.reload();
            } else {
                alert('Ошибка при удалении клиники');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Ошибка при удалении клиники');
        });
    }
}
</script>
