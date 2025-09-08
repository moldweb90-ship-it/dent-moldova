@echo off
echo 🚀 Запуск Clinici.md в режиме разработки

REM Устанавливаем переменные окружения
set DATABASE_URL=postgresql://neondb_owner:npg_b0lfKBQnkx1W@ep-raspy-cloud-a2o31v0k-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
set PORT=5000
set NODE_ENV=development

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

echo 🏗️ Запускаем сервер в режиме разработки...
start "Clinici Server" cmd /k "npm run dev"

echo ⏳ Ждем запуска сервера...
timeout /t 3 /nobreak >nul

echo 🌐 Сайт доступен по адресу: http://localhost:5000
echo 📋 Для остановки закройте окно командной строки

pause
