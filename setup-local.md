# Локальная установка PostgreSQL

## Windows

### 1. Установка PostgreSQL
1. Скачайте PostgreSQL с [официального сайта](https://www.postgresql.org/download/windows/)
2. Запустите установщик
3. Установите на порт 5432
4. Запомните пароль для пользователя postgres

### 2. Создание базы данных
```sql
-- Подключитесь к PostgreSQL как postgres
CREATE DATABASE clinici_db;
CREATE USER clinici_user WITH PASSWORD 'clinici_password';
GRANT ALL PRIVILEGES ON DATABASE clinici_db TO clinici_user;
```

### 3. Настройка .env
```env
DATABASE_URL="postgresql://clinici_user:clinici_password@localhost:5432/clinici_db"
PORT=5000
NODE_ENV=development
```

## macOS

### 1. Установка через Homebrew
```bash
brew install postgresql@16
brew services start postgresql@16
```

### 2. Создание базы данных
```bash
createdb clinici_db
psql clinici_db
```

В psql:
```sql
CREATE USER clinici_user WITH PASSWORD 'clinici_password';
GRANT ALL PRIVILEGES ON DATABASE clinici_db TO clinici_user;
```

## Linux (Ubuntu/Debian)

### 1. Установка
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Создание базы данных
```bash
sudo -u postgres psql
```

В psql:
```sql
CREATE DATABASE clinici_db;
CREATE USER clinici_user WITH PASSWORD 'clinici_password';
GRANT ALL PRIVILEGES ON DATABASE clinici_db TO clinici_user;
\q
```

## Запуск проекта

После настройки PostgreSQL:

```bash
# Установка зависимостей
npm install

# Применение схемы
npm run db:push

# Заполнение данными
npx tsx server/seed.ts

# Запуск
npm run dev
```

Приложение будет доступно на http://localhost:5000
