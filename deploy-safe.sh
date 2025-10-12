#!/bin/bash

# Безопасный деплой с сохранением изображений

echo "🚀 Безопасный деплой с сохранением изображений..."

# 1. Сохраняем текущие изображения
echo "📸 Сохраняем текущие изображения..."
if [ -d "img" ]; then
    cp -r img img_backup_$(date +%Y%m%d_%H%M%S)
    echo "✅ Изображения сохранены в img_backup_*"
fi

# 2. Сохраняем robots.txt и sitemap.xml
echo "📄 Сохраняем robots.txt и sitemap.xml..."
git stash push -u public/robots.txt public/sitemap.xml 2>/dev/null || true

# 3. Обновляем код
echo "📦 Обновляем код..."
git pull origin main

# 4. Устанавливаем зависимости
echo "📥 Устанавливаем зависимости..."
npm install --production

# 5. Собираем проект
echo "🔨 Собираем проект..."
npm run build

# 6. Восстанавливаем изображения
echo "🔄 Восстанавливаем изображения..."
latest_backup=$(ls -td img_backup_* 2>/dev/null | head -1)
if [ -n "$latest_backup" ]; then
    cp -r $latest_backup/* img/ 2>/dev/null || true
    echo "✅ Изображения восстановлены из $latest_backup"
fi

# 7. Перезапускаем PM2
echo "🔄 Перезапускаем PM2..."
pm2 restart clinici-md

# 8. Проверяем статус
echo "✅ Проверяем статус..."
pm2 status clinici-md

echo "🎉 Деплой завершен! Изображения сохранены."
