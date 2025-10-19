#!/bin/bash

# Скрипт безопасного деплоя для продакшена
echo "🚀 Начинаем безопасный деплой Clinici.md..."

# Создаем папку для логов если её нет
mkdir -p logs

# Останавливаем PM2 процесс
echo "⏹️ Останавливаем PM2 процесс..."
pm2 stop clinici-md || true

# Сохраняем важные файлы (фото клиник)
echo "💾 Сохраняем фото клиник..."
if [ -d "img" ]; then
    cp -r img img_backup_$(date +%Y%m%d_%H%M%S) || true
    echo "✅ Фото сохранены в img_backup_$(date +%Y%m%d_%H%M%S)"
else
    echo "⚠️ Папка img не найдена"
fi

# Обновляем код
echo "📥 Обновляем код из Git..."
git pull origin main

# Устанавливаем зависимости
echo "📦 Устанавливаем зависимости..."
npm ci --only=production

# Собираем проект
echo "🔨 Собираем проект..."
npm run build

# Восстанавливаем фото если они были
echo "🖼️ Проверяем фото клиник..."
if [ -d "img_backup_$(date +%Y%m%d_%H%M%S)" ]; then
    # Восстанавливаем последний backup
    latest_backup=$(ls -td img_backup_* | head -1)
    if [ -d "$latest_backup" ]; then
        cp -r "$latest_backup"/* img/ || true
        echo "✅ Фото восстановлены из $latest_backup"
    fi
fi

# Проверяем переменные окружения
echo "🔍 Проверяем переменные окружения..."
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️ DATABASE_URL не установлена, загружаем из .env"
    if [ -f ".env" ]; then
        export $(cat .env | grep -v '^#' | xargs)
    else
        echo "❌ Файл .env не найден!"
        exit 1
    fi
fi

# Запускаем через PM2
echo "🚀 Запускаем приложение через PM2..."
pm2 start ecosystem.config.cjs

# Ждем запуска
echo "⏳ Ждем запуска приложения..."
sleep 10

# Проверяем статус
echo "📊 Проверяем статус..."
pm2 status

# Проверяем health check
echo "🏥 Проверяем health check..."
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    echo "✅ Health check прошел успешно"
else
    echo "❌ Health check не прошел, проверяем логи..."
    pm2 logs clinici-md --lines 20
    exit 1
fi

echo "🎉 Деплой завершен успешно!"
echo "🌐 Сайт доступен на https://mdent.md/"
echo "📝 Логи: pm2 logs clinici-md"