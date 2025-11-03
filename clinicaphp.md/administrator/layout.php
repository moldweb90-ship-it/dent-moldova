<?php
/**
 * Базовый layout для админки
 */
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $pageTitle ?? 'Панель управления' ?> - <?= t('siteName') ?></title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/admin.css">
    <style>
        .admin-sidebar {
            width: 16rem;
            background: white;
            border-right: 1px solid #e5e7eb;
            height: 100vh;
            position: fixed;
            left: 0;
            top: 0;
            overflow-y: auto;
        }
        .admin-content {
            margin-left: 16rem;
            min-height: 100vh;
            background: #f9fafb;
        }
        @media (max-width: 1024px) {
            .admin-sidebar {
                transform: translateX(-100%);
                transition: transform 0.3s;
                z-index: 50;
            }
            .admin-sidebar.open {
                transform: translateX(0);
            }
            .admin-content {
                margin-left: 0;
            }
        }
    </style>
</head>
<body class="bg-gray-50">
    <!-- Боковая панель -->
    <aside id="admin-sidebar" class="admin-sidebar shadow-lg">
        <div class="p-4">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold text-gray-900">Админ панель</h2>
                <button id="sidebar-close" class="lg:hidden p-1 rounded-md hover:bg-gray-100">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            <nav class="space-y-2">
                <a href="?action=dashboard&tab=dashboard" class="flex items-center px-3 py-2 rounded-md <?= $activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100' ?>">
                    <svg class="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                    </svg>
                    <span>Панель управления</span>
                </a>
                
                <a href="?action=clinics&tab=clinics" class="flex items-center px-3 py-2 rounded-md <?= $activeTab === 'clinics' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100' ?>">
                    <svg class="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                    <span>Клиники</span>
                </a>
                
                <a href="?action=cities&tab=cities" class="flex items-center px-3 py-2 rounded-md <?= $activeTab === 'cities' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100' ?>">
                    <svg class="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <span>Города</span>
                </a>
                
                <a href="?action=dashboard&tab=bookings" class="flex items-center px-3 py-2 rounded-md <?= $activeTab === 'bookings' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100' ?> relative">
                    <svg class="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span>Заявки пациентов</span>
                    <?php if (isset($stats['totalBookings']) && $stats['totalBookings'] > 0): ?>
                        <span class="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full"><?= $stats['totalBookings'] > 99 ? '99+' : $stats['totalBookings'] ?></span>
                    <?php endif; ?>
                </a>
                
                <a href="?action=dashboard&tab=verification" class="flex items-center px-3 py-2 rounded-md <?= $activeTab === 'verification' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100' ?> relative">
                    <svg class="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>Верификация</span>
                    <?php if (isset($stats['pendingVerification']) && $stats['pendingVerification'] > 0): ?>
                        <span class="ml-auto bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full"><?= $stats['pendingVerification'] > 99 ? '99+' : $stats['pendingVerification'] ?></span>
                    <?php endif; ?>
                </a>
                
                <a href="?action=dashboard&tab=new-clinics" class="flex items-center px-3 py-2 rounded-md <?= $activeTab === 'new-clinics' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100' ?> relative">
                    <svg class="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    <span>Новые клиники</span>
                    <?php if (isset($stats['pendingNewClinics']) && $stats['pendingNewClinics'] > 0): ?>
                        <span class="ml-auto bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full"><?= $stats['pendingNewClinics'] > 99 ? '99+' : $stats['pendingNewClinics'] ?></span>
                    <?php endif; ?>
                </a>
                
                <a href="?action=dashboard&tab=statistics" class="flex items-center px-3 py-2 rounded-md <?= $activeTab === 'statistics' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100' ?>">
                    <svg class="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                    <span>Статистика</span>
                </a>
                
                <a href="?action=dashboard&tab=settings" class="flex items-center px-3 py-2 rounded-md <?= $activeTab === 'settings' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100' ?>">
                    <svg class="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <span>Настройки</span>
                </a>
            </nav>
        </div>
    </aside>

    <!-- Основной контент -->
    <div class="admin-content">
        <!-- Шапка -->
        <header class="bg-white border-b border-gray-200 px-6 py-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <button id="sidebar-toggle" class="lg:hidden p-2 rounded-md hover:bg-gray-100">
                        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                    </button>
                    <h1 class="text-xl font-semibold text-gray-900">
                        <?php
                        $titles = [
                            'dashboard' => 'Панель управления',
                            'clinics' => 'Клиники',
                            'cities' => 'Города',
                            'bookings' => 'Заявки пациентов',
                            'verification' => 'Верификация',
                            'new-clinics' => 'Новые клиники',
                            'statistics' => 'Статистика',
                            'settings' => 'Настройки'
                        ];
                        echo $titles[$activeTab] ?? 'Панель управления';
                        ?>
                    </h1>
                </div>
                <div class="flex items-center space-x-4">
                    <a href="<?= BASE_URL ?>" target="_blank" class="text-gray-600 hover:text-gray-900" title="Открыть сайт">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                        </svg>
                    </a>
                    <a href="?action=logout" class="text-gray-600 hover:text-gray-900" title="Выйти">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                        </svg>
                    </a>
                </div>
            </div>
        </header>

        <!-- Контент -->
        <main class="p-6">
            <?php if (isset($content)): ?>
                <?= $content ?>
            <?php endif; ?>
        </main>
    </div>

    <script>
        // Переключение боковой панели на мобильных
        const sidebarToggle = document.getElementById('sidebar-toggle');
        const sidebarClose = document.getElementById('sidebar-close');
        const sidebar = document.getElementById('admin-sidebar');
        
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.add('open');
            });
        }
        
        if (sidebarClose) {
            sidebarClose.addEventListener('click', () => {
                sidebar.classList.remove('open');
            });
        }
        
        // Закрытие при клике вне панели на мобильных
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 1024 && sidebar.classList.contains('open')) {
                if (!sidebar.contains(e.target) && sidebarToggle && !sidebarToggle.contains(e.target)) {
                    sidebar.classList.remove('open');
                }
            }
        });
    </script>
</body>
</html>


