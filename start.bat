@echo off
echo 🚀 Быстрый запуск Clinici.md

REM Устанавливаем переменные окружения
set DATABASE_URL=postgresql://neondb_owner:npg_b0lfKBQnkx1W@ep-raspy-cloud-a2o31v0k-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
set PORT=5000
set NODE_ENV=production

REM Останавливаем процессы на порту 5000 если занят
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do (
    echo Останавливаем процесс %%a на порту 5000
    taskkill /PID %%a /F >nul 2>&1
)

REM Останавливаем PM2 процесс если запущен
echo 🔄 Останавливаем предыдущий процесс PM2...
pm2 stop clinici-md >nul 2>&1
pm2 delete clinici-md >nul 2>&1

echo 📦 Устанавливаем зависимости...
npm install

echo 🏗️ Собираем проект...
npm run build

echo 📦 Запускаем сервер через PM2...
pm2 start ecosystem.config.cjs

echo ✅ Сервер запущен в фоновом режиме!
echo 🌐 Сайт доступен по адресу: http://localhost:5000
echo 📊 Статус PM2: pm2 status
echo 📋 Логи: pm2 logs clinici-md
echo ⏹️  Остановить: pm2 stop clinici-md
echo 🔄 Перезапустить: pm2 restart clinici-md

pause
