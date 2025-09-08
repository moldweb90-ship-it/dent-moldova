@echo off
chcp 65001 >nul
echo 🚀 Настройка проекта Clinici.md...

REM Проверка наличия Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js не установлен. Установите Node.js 18+
    pause
    exit /b 1
)

echo ✅ Node.js найден

REM Установка зависимостей
echo 📦 Установка зависимостей...
call npm install

REM Проверка наличия .env файла
if not exist .env (
    echo ⚠️  Файл .env не найден
    echo 📝 Создайте файл .env со следующим содержимым:
    echo.
    echo DATABASE_URL="postgresql://username:password@localhost:5432/clinici_db"
    echo PORT=5000
    echo NODE_ENV=development
    echo.
    echo 🔗 Или используйте Neon (neon.tech) для облачной PostgreSQL
    echo.
    set /p continue="Продолжить без .env? (y/n): "
    if /i not "%continue%"=="y" exit /b 1
) else (
    echo ✅ Файл .env найден
)

REM Проверка подключения к базе данных
echo 🔍 Проверка подключения к базе данных...
call npm run db:push >nul 2>&1
if errorlevel 1 (
    echo ❌ Ошибка подключения к базе данных
    echo 📋 Убедитесь что:
    echo    - PostgreSQL запущен
    echo    - База данных создана
    echo    - DATABASE_URL в .env файле корректный
    echo.
    echo 🔗 Или используйте Neon (neon.tech) для облачной PostgreSQL
    pause
    exit /b 1
) else (
    echo ✅ Подключение к базе данных успешно
    
    REM Заполнение тестовыми данными
    echo 🌱 Заполнение базы тестовыми данными...
    call npx tsx server/seed.ts
    
    echo.
    echo 🎉 Настройка завершена!
    echo 🚀 Запустите проект командой: npm run dev
    echo 🌐 Приложение будет доступно по адресу: http://localhost:5000
)

pause
