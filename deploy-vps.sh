#!/bin/bash

# Скрипт развертывания на VPS
echo "🚀 Развертывание Clinici.md на VPS..."

# Обновляем систему
sudo apt update && sudo apt upgrade -y

# Устанавливаем Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Устанавливаем PM2
sudo npm install -g pm2

# Устанавливаем зависимости (без node_modules)
npm ci --only=production

# Собираем проект
npm run build

# Создаем .env файл (замените на ваши данные)
echo "DATABASE_URL=postgresql://your_user:your_password@your_host:5432/your_db" > .env
echo "NODE_ENV=production" >> .env

# Применяем миграции БД
npm run db:push

# Заполняем данными
npm run seed

# Запускаем через PM2
pm2 start ecosystem.config.js

# Сохраняем PM2 конфигурацию
pm2 save
pm2 startup

echo "✅ Развертывание завершено!"
echo "🌐 Сайт доступен на порту 5000"
echo "📊 PM2 статус: pm2 status"
echo "📝 Логи: pm2 logs clinici-md"
