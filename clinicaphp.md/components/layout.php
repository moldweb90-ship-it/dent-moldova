<?php
/**
 * Базовый шаблон - полностью повторяет дизайн оригинального проекта
 */

$language = getLanguage();
$currentUrl = $_SERVER['REQUEST_URI'] ?? BASE_URL;
?>
<!DOCTYPE html>
<html lang="<?= $language ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= e($seoTitle ?? t('siteName')) ?></title>
    <meta name="description" content="<?= e($seoDescription ?? t('siteDescription')) ?>">
    
    <!-- Open Graph -->
    <?php if (isset($ogTitle)): ?>
    <meta property="og:title" content="<?= e($ogTitle) ?>">
    <?php endif; ?>
    <?php if (isset($ogDescription)): ?>
    <meta property="og:description" content="<?= e($ogDescription) ?>">
    <?php endif; ?>
    <?php if (isset($ogImage)): ?>
    <meta property="og:image" content="<?= e($ogImage) ?>">
    <?php endif; ?>
    
    <!-- Canonical -->
    <?php if (isset($canonical)): ?>
    <link rel="canonical" href="<?= e($canonical) ?>">
    <?php endif; ?>
    
    <!-- Styles -->
    <link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/style.css">
    
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: 'hsl(203.8863 88.2845% 53.1373%)',
                    }
                }
            }
        }
    </script>
</head>
<body class="min-h-screen bg-gray-50">
    <!-- Header - Fixed -->
    <header class="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16">
                <!-- Mobile: Filter Button -->
                <div class="flex items-center md:hidden">
                    <button 
                        id="mobile-filters-toggle"
                        class="flex items-center space-x-1 px-2 bg-gray-100 border border-gray-300 rounded-md text-sm hover:bg-gray-200 transition-colors"
                    >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                        </svg>
                        <span><?= t('filters') ?></span>
                    </button>
                </div>

                <!-- Logo - Center on mobile, Left on desktop -->
                <div class="flex items-center md:flex-none absolute left-1/2 transform -translate-x-1/2 md:relative md:left-auto md:transform-none">
                    <a href="<?= BASE_URL ?>/<?= $language === 'ro' ? 'ro' : '' ?>" class="flex items-center space-x-2 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                        <span><?= t('siteName') ?></span>
                    </a>
                </div>
                
                <div class="flex items-center space-x-2 md:space-x-4">
                    <!-- Desktop Filter Toggle -->
                    <button
                        id="desktop-filters-toggle"
                        class="hidden md:flex items-center space-x-2 px-3 py-1.5 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors"
                    >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                        </svg>
                        <span id="filters-toggle-text"><?= t('showFilters') ?></span>
                    </button>
                    
                    <!-- Add Clinic Button -->
                    <button
                        id="add-clinic-btn"
                        class="hidden md:inline-flex h-9 px-5 gap-2 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg text-sm font-medium"
                    >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                        <span><?= t('addClinic') ?></span>
                    </button>
                    <button
                        id="add-clinic-btn-mobile"
                        class="md:hidden inline-flex h-9 px-3 gap-1 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow text-xs"
                    >
                        <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                        <span class="hidden sm:inline"><?= t('addClinic') ?></span>
                    </button>
                    
                    <!-- Language Toggle -->
                    <div class="lang-toggle">
                        <div class="toggle-button-cover">
                            <div class="button r" id="lang-button">
                                <input type="checkbox" class="checkbox" id="lang-checkbox" <?= $language === 'ro' ? 'checked' : '' ?>>
                                <div class="knobs"></div>
                                <div class="layer"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="pt-16">
        <?php if (isset($content)): ?>
            <?= $content ?>
        <?php endif; ?>
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 mt-8 md:mt-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
            <div class="flex flex-col md:flex-row justify-between items-center">
                <div class="mb-4 md:mb-0">
                    <p class="text-sm text-gray-600">© <?= date('Y') ?> <?= t('siteName') ?>. <?= t('siteDescription') ?></p>
                </div>
                <div class="flex items-center space-x-6">
                    <div class="flex space-x-6 text-sm text-gray-600">
                        <a href="<?= BASE_URL ?>/<?= $language === 'ro' ? 'ro/' : '' ?>pricing" class="hover:text-gray-900 transition-colors">
                            <?= t('pricing.title') ?>
                        </a>
                        <a href="<?= BASE_URL ?>/<?= $language === 'ro' ? 'ro/' : '' ?>privacy" class="hover:text-gray-900 transition-colors">
                            <?= $language === 'ro' ? 'Politica de confidențialitate' : 'Политика приватности' ?>
                        </a>
                        <a href="#" class="hover:text-gray-900 transition-colors">
                            <?= $language === 'ro' ? 'Contacte' : 'Контакты' ?>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </footer>

    <!-- Modals -->
    <div id="modal-overlay" class="hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 items-center justify-center p-4">
        <div id="modal-content" class="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden max-h-[85vh] overflow-y-auto"></div>
    </div>

    <!-- Scripts -->
    <script>
        // Global variables
        const BASE_URL = <?= json_encode(BASE_URL) ?>;
        const LANGUAGE = <?= json_encode($language) ?>;
        const CURRENT_URL = <?= json_encode($currentUrl) ?>;
    </script>
    <script src="<?= BASE_URL ?>/assets/js/main.js"></script>
</body>
</html>
