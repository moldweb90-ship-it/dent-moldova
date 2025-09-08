#!/bin/bash

echo "🚀 Настройка проекта Clinici.md..."

# Проверка наличия Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен. Установите Node.js 18+"
    exit 1
fi

# Проверка версии Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Требуется Node.js 18+. Текущая версия: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) найден"

# Установка зависимостей
echo "📦 Установка зависимостей..."
npm install

# Проверка наличия .env файла
if [ ! -f .env ]; then
    echo "⚠️  Файл .env не найден"
    echo "📝 Создайте файл .env со следующим содержимым:"
    echo ""
    echo "DATABASE_URL=\"postgresql://username:password@localhost:5432/clinici_db\""
    echo "PORT=5000"
    echo "NODE_ENV=development"
    echo ""
    echo "🔗 Или используйте Neon (neon.tech) для облачной PostgreSQL"
    echo ""
    read -p "Продолжить без .env? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ Файл .env найден"
fi

# Проверка подключения к базе данных
echo "🔍 Проверка подключения к базе данных..."
if npm run db:push &> /dev/null; then
    echo "✅ Подключение к базе данных успешно"
    
    # Заполнение тестовыми данными
    echo "🌱 Заполнение базы тестовыми данными..."
    npx tsx server/seed.ts
    
    echo ""
    echo "🎉 Настройка завершена!"
    echo "🚀 Запустите проект командой: npm run dev"
    echo "🌐 Приложение будет доступно по адресу: http://localhost:5000"
else
    echo "❌ Ошибка подключения к базе данных"
    echo "📋 Убедитесь что:"
    echo "   - PostgreSQL запущен"
    echo "   - База данных создана"
    echo "   - DATABASE_URL в .env файле корректный"
    echo ""
    echo "🔗 Или используйте Neon (neon.tech) для облачной PostgreSQL"
fi
