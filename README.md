# Clinici.md - Каталог стоматологических клиник Молдовы

Full-stack TypeScript приложение для поиска и сравнения стоматологических клиник в Молдове.

## Технологии

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Express.js + Drizzle ORM
- **База данных**: PostgreSQL (Neon)
- **i18n**: i18next (ru/ro)
- **UI**: Radix UI + Lucide Icons

## Установка и запуск

### 1. Установка зависимостей
```bash
npm install
```

### 2. Настройка базы данных

#### Вариант A: Локальная PostgreSQL
1. Установите PostgreSQL
2. Создайте базу данных:
```sql
CREATE DATABASE clinici_db;
```

#### Вариант B: Neon (облачная PostgreSQL)
1. Зарегистрируйтесь на [neon.tech](https://neon.tech)
2. Создайте новый проект
3. Скопируйте connection string

### 3. Переменные окружения
Создайте файл `.env` в корне проекта:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/clinici_db"
PORT=5000
NODE_ENV=development
```

### 4. Настройка базы данных
```bash
# Применить схему к базе данных
npm run db:push

# Заполнить тестовыми данными
npx tsx server/seed.ts
```

### 5. Запуск в режиме разработки
```bash
npm run dev
```

Приложение будет доступно по адресу: http://localhost:5000

## Структура проекта

```
├── client/           # Frontend React приложение
├── server/           # Backend Express API
├── shared/           # Общие типы и схема БД
├── locales/          # Файлы локализации
└── img/             # Изображения клиник
```

## API Endpoints

- `GET /api/clinics` - Список клиник с фильтрацией
- `GET /api/clinics/:slug` - Детальная информация о клинике
- `GET /api/cities` - Список городов
- `GET /api/districts` - Список районов

## Функции

- 🔍 Поиск клиник по названию и специализациям
- 🏥 Фильтрация по городу, району, языкам, ценам
- 📊 Рейтинговая система (D-score)
- 🌐 Двуязычный интерфейс (ru/ro)
- 📱 Адаптивный дизайн
- 💰 Сравнение цен на услуги

## Данные

Проект включает seed данные с 20 клиниками в разных городах Молдовы:
- Кишинёв: 12 клиник
- Бельцы: 3 клиники  
- Другие города: 5 клиник

## Deployment

Automatic deployment to VPS via GitHub Actions is configured.

Last updated: $(date)

Каждая клиника имеет:
- Основную информацию (название, адрес, контакты)
- Рейтинги (цена, доверие, отзывы, доступность)
- Пакеты услуг с ценами
- Специализации и языки
