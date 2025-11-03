<!-- Robots.txt настройки -->
<form method="POST" action="?action=dashboard&tab=settings&section=robots" class="space-y-6">
    <input type="hidden" name="save_settings" value="1">
    
    <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">Robots.txt</h2>
        
        <div class="mb-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p class="text-sm text-blue-700">
                Файл robots.txt указывает поисковым роботам, какие страницы можно индексировать.
                Он будет доступен по адресу <strong><?= BASE_URL ?>/robots.txt</strong>
            </p>
        </div>
        
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Содержимое robots.txt</label>
            <textarea name="settings[robotsTxt]" rows="10" 
                      class="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"><?= htmlspecialchars($robotsTxt) ?></textarea>
            <p class="text-xs text-gray-500 mt-1">Каждая директива должна быть на новой строке</p>
        </div>
        
        <div class="mt-6">
            <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md">
                Сохранить robots.txt
            </button>
        </div>
    </div>
</form>


