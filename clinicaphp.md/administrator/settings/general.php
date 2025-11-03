<!-- Общие настройки -->
<form method="POST" action="?action=dashboard&tab=settings&section=general" class="space-y-6">
    <input type="hidden" name="save_settings" value="1">
    
    <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">Общие настройки</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Логотип -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Логотип сайта</label>
                <?php if ($logo): ?>
                    <img src="<?= htmlspecialchars($logo) ?>" alt="Logo" class="mb-2 max-h-24">
                <?php endif; ?>
                <input type="text" name="settings[logo]" value="<?= htmlspecialchars($logo) ?>" 
                       placeholder="URL логотипа" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                <p class="text-xs text-gray-500 mt-1">Введите URL изображения логотипа</p>
            </div>
            
            <!-- Фавикон -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Фавикон</label>
                <?php if ($favicon): ?>
                    <img src="<?= htmlspecialchars($favicon) ?>" alt="Favicon" class="mb-2 w-16 h-16">
                <?php endif; ?>
                <input type="text" name="settings[favicon]" value="<?= htmlspecialchars($favicon) ?>" 
                       placeholder="URL фавикона" class="w-full px-3 py-2 border border-gray-300 rounded-md">
            </div>
        </div>
        
        <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Логотип Alt -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Alt текст для логотипа</label>
                <input type="text" name="settings[logoAlt]" value="<?= htmlspecialchars($logoAlt) ?>" 
                       class="w-full px-3 py-2 border border-gray-300 rounded-md">
            </div>
            
            <!-- Ширина логотипа -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Ширина логотипа (px)</label>
                <input type="number" name="settings[logoWidth]" value="<?= htmlspecialchars($logoWidth) ?>" 
                       min="50" max="300" class="w-full px-3 py-2 border border-gray-300 rounded-md">
            </div>
        </div>
        
        <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Название сайта -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Название сайта</label>
                <input type="text" name="settings[websiteName]" value="<?= htmlspecialchars($websiteName) ?>" 
                       class="w-full px-3 py-2 border border-gray-300 rounded-md">
            </div>
            
            <!-- URL сайта -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">URL сайта</label>
                <input type="url" name="settings[websiteUrl]" value="<?= htmlspecialchars($websiteUrl) ?>" 
                       class="w-full px-3 py-2 border border-gray-300 rounded-md">
            </div>
        </div>
        
        <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Название организации -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Название организации</label>
                <input type="text" name="settings[organizationName]" value="<?= htmlspecialchars($organizationName) ?>" 
                       class="w-full px-3 py-2 border border-gray-300 rounded-md">
            </div>
            
            <!-- URL организации -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">URL организации</label>
                <input type="url" name="settings[organizationUrl]" value="<?= htmlspecialchars($organizationUrl) ?>" 
                       class="w-full px-3 py-2 border border-gray-300 rounded-md">
            </div>
        </div>
        
        <div class="mt-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Описание организации</label>
            <textarea name="settings[organizationDescription]" rows="3" 
                      class="w-full px-3 py-2 border border-gray-300 rounded-md"><?= htmlspecialchars($organizationDescription) ?></textarea>
        </div>
        
        <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Город -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Город</label>
                <input type="text" name="settings[organizationCity]" value="<?= htmlspecialchars($organizationCity) ?>" 
                       class="w-full px-3 py-2 border border-gray-300 rounded-md">
            </div>
            
            <!-- Страна -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Страна</label>
                <input type="text" name="settings[organizationCountry]" value="<?= htmlspecialchars($organizationCountry) ?>" 
                       class="w-full px-3 py-2 border border-gray-300 rounded-md">
            </div>
        </div>
        
        <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Тип бизнеса -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Тип бизнеса</label>
                <input type="text" name="settings[businessType]" value="<?= htmlspecialchars($businessType) ?>" 
                       placeholder="Dentist" class="w-full px-3 py-2 border border-gray-300 rounded-md">
            </div>
            
            <!-- Ценовой диапазон -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Ценовой диапазон</label>
                <input type="text" name="settings[businessPriceRange]" value="<?= htmlspecialchars($businessPriceRange) ?>" 
                       placeholder="$$" class="w-full px-3 py-2 border border-gray-300 rounded-md">
            </div>
            
            <!-- Часы работы -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Часы работы</label>
                <input type="text" name="settings[businessOpeningHours]" value="<?= htmlspecialchars($businessOpeningHours) ?>" 
                       placeholder="Mo-Fr 09:00-18:00" class="w-full px-3 py-2 border border-gray-300 rounded-md">
            </div>
        </div>
        
        <div class="mt-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Тип схемы Schema.org</label>
            <input type="text" name="settings[schemaType]" value="<?= htmlspecialchars($schemaType) ?>" 
                   placeholder="Organization" class="w-full px-3 py-2 border border-gray-300 rounded-md">
        </div>
        
        <div class="mt-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">JSON-LD схема (опционально)</label>
            <textarea name="settings[schemaData]" rows="6" 
                      class="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"><?= htmlspecialchars($schemaData) ?></textarea>
        </div>
        
        <div class="mt-6">
            <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md">
                Сохранить настройки
            </button>
        </div>
    </div>
</form>


