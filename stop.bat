@echo off
echo 🛑 Остановка Clinici.md

REM Останавливаем PM2 процесс
echo 🔄 Останавливаем PM2 процесс...
pm2 stop clinici-md >nul 2>&1
pm2 delete clinici-md >nul 2>&1

REM Останавливаем процессы на порту 5000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do (
    echo Останавливаем процесс %%a на порту 5000
    taskkill /PID %%a /F >nul 2>&1
)

echo ✅ Сервер остановлен!

pause
