<?php
/**
 * Управление заявками пациентов - полностью повторяет BookingsManagement.tsx
 */

$db = Database::getInstance();

// Фильтры
$filterStatus = $_GET['status'] ?? 'all';
$filterClinic = $_GET['clinic'] ?? 'all';
$currentPage = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$bookingsPerPage = 20;
$offset = ($currentPage - 1) * $bookingsPerPage;

// Построение запроса
$where = ['1=1'];
$params = [];

if ($filterStatus !== 'all') {
    $where[] = "b.status = ?";
    $params[] = $filterStatus;
}

if ($filterClinic !== 'all') {
    $where[] = "b.clinic_id = ?";
    $params[] = $filterClinic;
}

$whereClause = implode(' AND ', $where);

// Получаем заявки
$bookings = $db->select(
    "SELECT b.*, c.name_ru as clinic_name, c.slug as clinic_slug
     FROM " . $db->table('bookings') . " b
     LEFT JOIN " . $db->table('clinics') . " c ON b.clinic_id = c.id
     WHERE $whereClause
     ORDER BY b.created_at DESC
     LIMIT $bookingsPerPage OFFSET $offset",
    $params
);

// Общее количество
$totalResult = $db->selectOne(
    "SELECT COUNT(*) as count FROM " . $db->table('bookings') . " b WHERE $whereClause",
    $params
);
$total = (int)$totalResult['count'];
$totalPages = ceil($total / $bookingsPerPage);

// Статусы для фильтра
$statusLabels = [
    'new' => ['label' => 'Новая', 'color' => 'bg-blue-100 text-blue-800'],
    'contacted' => ['label' => 'Связались', 'color' => 'bg-yellow-100 text-yellow-800'],
    'confirmed' => ['label' => 'Подтверждена', 'color' => 'bg-green-100 text-green-800'],
    'completed' => ['label' => 'Выполнена', 'color' => 'bg-gray-100 text-gray-800'],
    'cancelled' => ['label' => 'Отменена', 'color' => 'bg-red-100 text-red-800'],
];

// Получаем клиники для фильтра
$clinics = $db->select(
    "SELECT DISTINCT c.id, c.name_ru 
     FROM " . $db->table('clinics') . " c
     INNER JOIN " . $db->table('bookings') . " b ON c.id = b.clinic_id
     ORDER BY c.name_ru ASC"
);

// Счетчики по статусам
$statusCounts = [];
foreach (array_keys($statusLabels) as $status) {
    $statusCounts[$status] = $db->count('bookings', "status = ?", [$status]);
}
$statusCounts['all'] = $db->count('bookings');

// Выбранная заявка для просмотра
$selectedBookingId = $_GET['view'] ?? null;
$selectedBooking = null;
if ($selectedBookingId) {
    $selectedBooking = $db->selectOne(
        "SELECT b.*, c.name_ru as clinic_name, c.slug as clinic_slug
         FROM " . $db->table('bookings') . " b
         LEFT JOIN " . $db->table('clinics') . " c ON b.clinic_id = c.id
         WHERE b.id = ?",
        [$selectedBookingId]
    );
}
?>
<div class="space-y-4 sm:space-y-6 px-2 sm:px-0">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Заявки пациентов</h1>
            <p class="text-xs sm:text-sm text-gray-600 mt-1">
                Всего заявок: <?= $total ?>
            </p>
        </div>
    </div>

    <!-- Статистика по статусам -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <?php foreach ($statusLabels as $status => $info): ?>
            <div class="bg-white rounded-lg shadow p-3 sm:p-4 cursor-pointer hover:shadow-lg transition-shadow"
                 onclick="filterByStatus('<?= $status ?>')">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-xs sm:text-sm text-gray-600"><?= $info['label'] ?></p>
                        <p class="text-lg sm:text-xl font-bold text-gray-900 mt-1">
                            <?= $statusCounts[$status] ?? 0 ?>
                        </p>
                    </div>
                </div>
            </div>
        <?php endforeach; ?>
    </div>

    <!-- Фильтры -->
    <div class="bg-white rounded-lg shadow p-4 sm:p-6">
        <div class="flex flex-col sm:flex-row gap-4">
            <select 
                id="status-filter"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onchange="filterByStatus(this.value)"
            >
                <option value="all" <?= $filterStatus === 'all' ? 'selected' : '' ?>>Все статусы</option>
                <?php foreach ($statusLabels as $status => $info): ?>
                    <option value="<?= $status ?>" <?= $filterStatus === $status ? 'selected' : '' ?>>
                        <?= $info['label'] ?> (<?= $statusCounts[$status] ?? 0 ?>)
                    </option>
                <?php endforeach; ?>
            </select>
            
            <select 
                id="clinic-filter"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onchange="filterByClinic(this.value)"
            >
                <option value="all" <?= $filterClinic === 'all' ? 'selected' : '' ?>>Все клиники</option>
                <?php foreach ($clinics as $clinic): ?>
                    <option value="<?= $clinic['id'] ?>" <?= $filterClinic === $clinic['id'] ? 'selected' : '' ?>>
                        <?= e($clinic['name_ru']) ?>
                    </option>
                <?php endforeach; ?>
            </select>
            
            <button 
                onclick="resetFilters()"
                class="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 sm:w-auto"
            >
                Сбросить
            </button>
        </div>
    </div>

    <!-- Список заявок -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Имя</th>
                        <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Телефон</th>
                        <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Клиника</th>
                        <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Услуга</th>
                        <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата/Время</th>
                        <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                        <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <?php if (empty($bookings)): ?>
                        <tr>
                            <td colspan="7" class="px-4 sm:px-6 py-8 text-center text-gray-500">
                                Заявки не найдены
                            </td>
                        </tr>
                    <?php else: ?>
                        <?php foreach ($bookings as $booking): ?>
                            <tr class="hover:bg-gray-50">
                                <td class="px-4 sm:px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm font-medium text-gray-900"><?= e($booking['first_name']) ?></div>
                                    <?php if ($booking['email']): ?>
                                        <div class="text-xs text-gray-500"><?= e($booking['email']) ?></div>
                                    <?php endif; ?>
                                </td>
                                <td class="px-4 sm:px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-900"><?= e($booking['phone']) ?></div>
                                    <?php if ($booking['contact_method']): ?>
                                        <div class="text-xs text-gray-500"><?= e($booking['contact_method']) ?></div>
                                    <?php endif; ?>
                                </td>
                                <td class="px-4 sm:px-6 py-4">
                                    <div class="text-sm text-gray-900"><?= e($booking['clinic_name'] ?? '') ?></div>
                                </td>
                                <td class="px-4 sm:px-6 py-4">
                                    <div class="text-sm text-gray-900"><?= e($booking['service']) ?></div>
                                </td>
                                <td class="px-4 sm:px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-900"><?= date('d.m.Y', strtotime($booking['preferred_date'])) ?></div>
                                    <div class="text-xs text-gray-500"><?= e($booking['preferred_time']) ?></div>
                                </td>
                                <td class="px-4 sm:px-6 py-4 whitespace-nowrap">
                                    <?php 
                                    $statusInfo = $statusLabels[$booking['status']] ?? ['label' => $booking['status'], 'color' => 'bg-gray-100 text-gray-800'];
                                    ?>
                                    <span class="px-2 py-1 text-xs font-semibold rounded-full <?= $statusInfo['color'] ?>">
                                        <?= $statusInfo['label'] ?>
                                    </span>
                                </td>
                                <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                                    <div class="flex items-center space-x-2">
                                        <select 
                                            class="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                                            onchange="updateStatus('<?= $booking['id'] ?>', this.value)"
                                        >
                                            <?php foreach ($statusLabels as $status => $info): ?>
                                                <option value="<?= $status ?>" <?= $booking['status'] === $status ? 'selected' : '' ?>>
                                                    <?= $info['label'] ?>
                                                </option>
                                            <?php endforeach; ?>
                                        </select>
                                        <button
                                            onclick="viewBooking('<?= $booking['id'] ?>')"
                                            class="text-blue-600 hover:text-blue-900"
                                            title="Просмотр"
                                        >
                                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                            </svg>
                                        </button>
                                        <button
                                            onclick="deleteBooking('<?= $booking['id'] ?>')"
                                            class="text-red-600 hover:text-red-900"
                                            title="Удалить"
                                        >
                                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Пагинация -->
    <?php if ($totalPages > 1): ?>
        <div class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 rounded-lg">
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

<?php if ($selectedBooking): ?>
    <!-- Модальное окно просмотра заявки -->
    <div id="booking-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onclick="closeBookingModal()">
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
            <div class="p-6">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-bold text-gray-900">Заявка #<?= substr($selectedBooking['id'], 0, 8) ?></h2>
                    <button onclick="closeBookingModal()" class="text-gray-400 hover:text-gray-600">
                        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                
                <div class="space-y-4">
                    <div>
                        <h3 class="text-sm font-medium text-gray-500">Имя</h3>
                        <p class="text-lg text-gray-900"><?= e($selectedBooking['first_name']) ?></p>
                    </div>
                    
                    <div>
                        <h3 class="text-sm font-medium text-gray-500">Телефон</h3>
                        <p class="text-lg text-gray-900"><?= e($selectedBooking['phone']) ?></p>
                    </div>
                    
                    <?php if ($selectedBooking['email']): ?>
                        <div>
                            <h3 class="text-sm font-medium text-gray-500">Email</h3>
                            <p class="text-lg text-gray-900"><?= e($selectedBooking['email']) ?></p>
                        </div>
                    <?php endif; ?>
                    
                    <div>
                        <h3 class="text-sm font-medium text-gray-500">Клиника</h3>
                        <p class="text-lg text-gray-900"><?= e($selectedBooking['clinic_name'] ?? '') ?></p>
                    </div>
                    
                    <div>
                        <h3 class="text-sm font-medium text-gray-500">Услуга</h3>
                        <p class="text-lg text-gray-900"><?= e($selectedBooking['service']) ?></p>
                    </div>
                    
                    <div>
                        <h3 class="text-sm font-medium text-gray-500">Предпочтительная дата</h3>
                        <p class="text-lg text-gray-900"><?= date('d.m.Y', strtotime($selectedBooking['preferred_date'])) ?></p>
                    </div>
                    
                    <div>
                        <h3 class="text-sm font-medium text-gray-500">Предпочтительное время</h3>
                        <p class="text-lg text-gray-900"><?= e($selectedBooking['preferred_time']) ?></p>
                    </div>
                    
                    <?php if ($selectedBooking['notes']): ?>
                        <div>
                            <h3 class="text-sm font-medium text-gray-500">Примечания</h3>
                            <p class="text-lg text-gray-900"><?= nl2br(e($selectedBooking['notes'])) ?></p>
                        </div>
                    <?php endif; ?>
                    
                    <div>
                        <h3 class="text-sm font-medium text-gray-500">Статус</h3>
                        <?php 
                        $statusInfo = $statusLabels[$selectedBooking['status']] ?? ['label' => $selectedBooking['status'], 'color' => 'bg-gray-100 text-gray-800'];
                        ?>
                        <span class="px-3 py-1 text-sm font-semibold rounded-full <?= $statusInfo['color'] ?>">
                            <?= $statusInfo['label'] ?>
                        </span>
                    </div>
                    
                    <div>
                        <h3 class="text-sm font-medium text-gray-500">Дата создания</h3>
                        <p class="text-lg text-gray-900"><?= date('d.m.Y H:i', strtotime($selectedBooking['created_at'])) ?></p>
                    </div>
                </div>
            </div>
        </div>
    </div>
<?php endif; ?>

<script>
function filterByStatus(status) {
    const url = new URL(window.location.href);
    if (status === 'all') {
        url.searchParams.delete('status');
    } else {
        url.searchParams.set('status', status);
    }
    url.searchParams.delete('page');
    window.location.href = url.toString();
}

function filterByClinic(clinicId) {
    const url = new URL(window.location.href);
    if (clinicId === 'all') {
        url.searchParams.delete('clinic');
    } else {
        url.searchParams.set('clinic', clinicId);
    }
    url.searchParams.delete('page');
    window.location.href = url.toString();
}

function resetFilters() {
    const url = new URL(window.location.href);
    url.searchParams.delete('status');
    url.searchParams.delete('clinic');
    url.searchParams.delete('page');
    window.location.href = url.toString();
}

function changePage(page) {
    const url = new URL(window.location.href);
    url.searchParams.set('page', page);
    window.location.href = url.toString();
}

function updateStatus(bookingId, status) {
    fetch('<?= BASE_URL ?>/api/admin/bookings/' + bookingId + '/status', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify({ status })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.reload();
        } else {
            alert('Ошибка при обновлении статуса');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Ошибка при обновлении статуса');
    });
}

function viewBooking(id) {
    const url = new URL(window.location.href);
    url.searchParams.set('view', id);
    window.location.href = url.toString();
}

function closeBookingModal() {
    const url = new URL(window.location.href);
    url.searchParams.delete('view');
    window.location.href = url.toString();
}

function deleteBooking(id) {
    if (confirm('Вы уверены, что хотите удалить эту заявку?')) {
        fetch('<?= BASE_URL ?>/api/admin/bookings/' + id, {
            method: 'DELETE',
            credentials: 'same-origin'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.reload();
            } else {
                alert('Ошибка при удалении заявки');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Ошибка при удалении заявки');
        });
    }
}
</script>


