<!-- SEO настройки -->
<form method="POST" action="?action=dashboard&tab=settings&section=seo" class="space-y-6">
    <input type="hidden" name="save_settings" value="1">
    
    <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">SEO настройки</h2>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Русская версия -->
            <div class="space-y-4">
                <h3 class="text-lg font-semibold flex items-center space-x-2">
                    <span>🇷🇺</span>
                    <span>Русская версия</span>
                </h3>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Название сайта (Title)</label>
                    <input type="text" name="settings[siteTitleRu]" value="<?= htmlspecialchars($siteTitleRu) ?>" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">H1 заголовок</label>
                    <input type="text" name="settings[h1Ru]" value="<?= htmlspecialchars($h1Ru) ?>" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Описание (Meta Description)</label>
                    <textarea name="settings[metaDescriptionRu]" rows="3" 
                              class="w-full px-3 py-2 border border-gray-300 rounded-md"><?= htmlspecialchars($metaDescriptionRu) ?></textarea>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Ключевые слова</label>
                    <input type="text" name="settings[keywordsRu]" value="<?= htmlspecialchars($keywordsRu) ?>" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Open Graph Title</label>
                    <input type="text" name="settings[ogTitleRu]" value="<?= htmlspecialchars($ogTitleRu) ?>" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Open Graph Description</label>
                    <textarea name="settings[ogDescriptionRu]" rows="2" 
                              class="w-full px-3 py-2 border border-gray-300 rounded-md"><?= htmlspecialchars($ogDescriptionRu) ?></textarea>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Open Graph Image URL</label>
                    <input type="url" name="settings[ogImageRu]" value="<?= htmlspecialchars($ogImageRu) ?>" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Canonical URL</label>
                    <input type="url" name="settings[canonicalRu]" value="<?= htmlspecialchars($canonicalRu) ?>" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>
            </div>
            
            <!-- Румынская версия -->
            <div class="space-y-4">
                <h3 class="text-lg font-semibold flex items-center space-x-2">
                    <span>🇷🇴</span>
                    <span>Румынская версия</span>
                </h3>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Название сайта (Title)</label>
                    <input type="text" name="settings[siteTitleRo]" value="<?= htmlspecialchars($siteTitleRo) ?>" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">H1 заголовок</label>
                    <input type="text" name="settings[h1Ro]" value="<?= htmlspecialchars($h1Ro) ?>" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Описание (Meta Description)</label>
                    <textarea name="settings[metaDescriptionRo]" rows="3" 
                              class="w-full px-3 py-2 border border-gray-300 rounded-md"><?= htmlspecialchars($metaDescriptionRo) ?></textarea>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Ключевые слова</label>
                    <input type="text" name="settings[keywordsRo]" value="<?= htmlspecialchars($keywordsRo) ?>" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Open Graph Title</label>
                    <input type="text" name="settings[ogTitleRo]" value="<?= htmlspecialchars($ogTitleRo) ?>" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Open Graph Description</label>
                    <textarea name="settings[ogDescriptionRo]" rows="2" 
                              class="w-full px-3 py-2 border border-gray-300 rounded-md"><?= htmlspecialchars($ogDescriptionRo) ?></textarea>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Open Graph Image URL</label>
                    <input type="url" name="settings[ogImageRo]" value="<?= htmlspecialchars($ogImageRo) ?>" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Canonical URL</label>
                    <input type="url" name="settings[canonicalRo]" value="<?= htmlspecialchars($canonicalRo) ?>" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>
            </div>
        </div>
        
        <!-- Общие настройки SEO -->
        <div class="mt-6 pt-6 border-t">
            <h3 class="text-lg font-semibold mb-4">Общие настройки</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Robots meta</label>
                    <input type="text" name="settings[robots]" value="<?= htmlspecialchars($robots) ?>" 
                           placeholder="index,follow" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Schema.org Type</label>
                    <input type="text" name="settings[schemaType]" value="<?= htmlspecialchars($schemaType) ?>" 
                           placeholder="Organization" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>
            </div>
        </div>
        
        <div class="mt-6">
            <button type="submit" class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md">
                Сохранить SEO настройки
            </button>
        </div>
    </div>
</form>


