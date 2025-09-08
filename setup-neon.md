# Настройка облачной базы данных Neon

## 1. Регистрация на Neon
1. Перейдите на [neon.tech](https://neon.tech)
2. Зарегистрируйтесь (можно через GitHub)
3. Создайте новый проект

## 2. Получение connection string
1. В панели управления найдите "Connection Details"
2. Скопируйте connection string
3. Он выглядит примерно так:
```
postgresql://username:password@ep-xxx-xxx-xxx.region.aws.neon.tech/neondb
```

## 3. Настройка .env файла
Создайте файл `.env` в корне проекта:
```env
DATABASE_URL="postgresql://username:password@ep-xxx-xxx-xxx.region.aws.neon.tech/neondb"
PORT=5000
NODE_ENV=development
```

## 4. Запуск проекта
```bash
# Установка зависимостей
npm install

# Применение схемы к облачной базе
npm run db:push

# Заполнение тестовыми данными
npx tsx server/seed.ts

# Запуск приложения
npm run dev
```

## Преимущества Neon
- ✅ Бесплатный план (до 3 ГБ)
- ✅ Автоматические бэкапы
- ✅ Веб-интерфейс для управления
- ✅ Не нужно устанавливать PostgreSQL локально
- ✅ Работает из любой точки мира

## Доступ к данным
В панели Neon вы можете:
- Просматривать таблицы
- Выполнять SQL запросы
- Экспортировать данные
- Мониторить производительность
