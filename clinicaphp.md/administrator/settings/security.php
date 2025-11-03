<!-- Настройки защиты -->
<form method="POST" action="?action=dashboard&tab=settings&section=security" class="space-y-6">
    <input type="hidden" name="save_settings" value="1">
    
    <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">Защита админки</h2>
        
        <div class="mb-4 bg-red-50 p-4 rounded-lg border border-red-200">
            <p class="text-sm text-red-700">
                Кодовое слово для доступа к админке. Если указано, админка будет доступна только по адресу 
                <strong><?= BASE_URL ?>/administrator/?code=кодовое_слово</strong>
            </p>
        </div>
        
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Кодовое слово для доступа к админке</label>
            <input type="text" name="settings[adminAccessCode]" value="<?= htmlspecialchars($adminAccessCode) ?>" 
                   placeholder="Введите кодовое слово (например: ruslan)" 
                   class="w-full px-3 py-2 border border-gray-300 rounded-md">
            <p class="text-xs text-gray-500 mt-1">
                Если кодовое слово не указано - админка доступна по /administrator<br>
                Если указано - админка доступна только по /administrator/?code=кодовое_слово
            </p>
        </div>
        
        <div class="mt-6">
            <button type="submit" class="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md">
                Сохранить настройки безопасности
            </button>
        </div>
    </div>
</form>


