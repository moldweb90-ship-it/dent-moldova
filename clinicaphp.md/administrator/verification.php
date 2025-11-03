<?php
/**
 * Заявки на верификацию клиник
 */

$db = Database::getInstance();

// Получаем заявки на верификацию
try {
    $requests = $db->select(
        "SELECT vr.*, c.name_ru as clinic_name_ru, c.slug as clinic_slug
         FROM " . $db->table('verification_requests') . " vr
         LEFT JOIN " . $db->table('clinics') . " c ON vr.clinic_id = c.id
         ORDER BY vr.created_at DESC"
    );
} catch (Exception $e) {
    $requests = [];
}

$language = getLanguage();
?>
<div class="space-y-4 sm:space-y-6 px-2 sm:px-0">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Заявки на верификацию</h1>
            <p class="text-xs sm:text-sm text-gray-600 mt-1">
                Всего заявок: <?= count($requests) ?>
            </p>
        </div>
    </div>

    <?php if (empty($requests)): ?>
        <div class="bg-white rounded-lg shadow p-8 text-center">
            <svg class="h-12 w-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p class="text-gray-500">Заявок на верификацию пока нет</p>
        </div>
    <?php else: ?>
        <div class="bg-white rounded-lg shadow overflow-hidden">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Клиника</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Телефон</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <?php foreach ($requests as $request): ?>
                            <tr>
                                <td class="px-6 py-4"><?= e($request['clinic_name_ru'] ?? $request['clinic_name']) ?></td>
                                <td class="px-6 py-4"><?= e($request['requester_email']) ?></td>
                                <td class="px-6 py-4"><?= e($request['requester_phone']) ?></td>
                                <td class="px-6 py-4">
                                    <span class="px-2 py-1 text-xs rounded-full <?= $request['status'] === 'pending' ? 'bg-yellow-100 text-yellow-800' : ($request['status'] === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800') ?>">
                                        <?= $request['status'] === 'pending' ? 'Ожидает' : ($request['status'] === 'approved' ? 'Одобрена' : 'Отклонена') ?>
                                    </span>
                                </td>
                                <td class="px-6 py-4"><?= date('d.m.Y', strtotime($request['created_at'])) ?></td>
                                <td class="px-6 py-4">
                                    <button onclick="alert('Функция будет реализована')" class="text-blue-600 hover:text-blue-900 text-sm">
                                        Просмотр
                                    </button>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    <?php endif; ?>
</div>


