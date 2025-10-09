# 🚀 Руководство по развертыванию на VPS

## 📋 Подготовка проекта

### 1. Очистка зависимостей
```bash
# Удалить неиспользуемые пакеты (уже сделано)
# Проверить что в package.json нет:
# - @google-cloud/storage
# - @uppy/* пакеты
# - passport, passport-local
# - openid-client
# - google-auth-library
```

### 2. Проверить .env файл
```bash
# Убедиться что есть правильный DATABASE_URL для production
DATABASE_URL=postgresql://username:password@ep-raspy-cloud-XXXXX.eu-central-1.aws.neon.tech/neondb?sslmode=require
ADMIN_PASSWORD=надежный_пароль_администратора
SESSION_SECRET=случайная_строка_минимум_32_символа
NODE_ENV=production
PORT=5000
```

## 🖥️ Настройка VPS

### 1. Подключение к серверу
```bash
ssh root@5.35.126.5
cd /var/www/clinici.md
```

### 2. Установка зависимостей
```bash
# Удалить старые зависимости
rm -rf node_modules package-lock.json

# Установить заново
npm install
```

### 3. Настройка файрвола
```bash
# Открыть порты
ufw allow 80
ufw allow 5000
ufw status
```

## 🔧 Настройка Nginx

### 1. Создать конфигурацию
```bash
nano /etc/nginx/sites-available/clinici-md
```

### 2. Конфигурация Nginx
```nginx
server {
    listen 80;
    server_name 5.35.126.5;

    # Статические изображения клиник
    location /images/ {
        alias /var/www/clinici.md/img/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        proxy_pass http://[::1]:5000;  # IPv6 localhost
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Активировать сайт
```bash
ln -s /etc/nginx/sites-available/clinici-md /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

## 🚀 Запуск приложения

### 1. Запуск в dev режиме (рекомендуется)
```bash
# Остановить все процессы
pm2 stop all
pm2 delete all

# Запустить в dev режиме
pm2 start npm --name "clinici-md" -- run dev

# Проверить статус
pm2 status
pm2 logs clinici-md
```

### 2. Настройка автозапуска
```bash
pm2 save
pm2 startup
```

## 🔍 Проверка работы

### 1. Локальная проверка
```bash
# Проверить что приложение слушает
netstat -tlnp | grep :5000

# Проверить локально
curl http://localhost:5000
```

### 2. Внешняя проверка
```bash
# Проверить с внешнего IP
curl http://5.35.126.5
```

## ⚠️ Известные проблемы и решения

### 1. Проблема с продакшен сборкой
- **Проблема:** `Error: Dynamic require of "fs" is not supported`
- **Решение:** Использовать dev режим вместо продакшена

### 2. Проблема с IPv4/IPv6
- **Проблема:** Приложение слушает на IPv6, Nginx подключается по IPv4
- **Решение:** Использовать `proxy_pass http://[::1]:5000` в Nginx

### 3. Проблема с зависимостями
- **Проблема:** Старые неиспользуемые пакеты
- **Решение:** Очистить package.json перед загрузкой

### 4. Проблема с dotenv
- **Проблема:** `Cannot find module 'dotenv'`
- **Решение:** Убрать флаг `--packages=external` из сборки

### 5. Проблема с изображениями клиник
- **Проблема:** Логотипы клиник не отображаются на мобильных устройствах
- **Решение:** Добавить маршрут `/images/` в Nginx для статических файлов (код использует `/images/`)
- **Конфигурация:** `location /images/ { alias /var/www/clinici.md/img/; }`
- **Важно:** Путь должен быть `/images/`, а не `/img/`, так как код приложения ожидает `/images/`

## 📝 Команды для диагностики

```bash
# Статус PM2
pm2 status

# Логи приложения
pm2 logs clinici-md

# Проверка портов
netstat -tlnp | grep :5000

# Проверка Nginx
nginx -t
systemctl status nginx

# Проверка файрвола
ufw status
```

## 🎯 Итоговая конфигурация

- **Режим:** Development (стабильно работает)
- **Порт:** 5000 (приложение) + 80 (Nginx)
- **База данных:** PostgreSQL Neon
- **Процесс-менеджер:** PM2
- **Веб-сервер:** Nginx (reverse proxy)

## 🔄 Для обновления проекта

1. Загрузить новые файлы через SFTP
2. Выполнить `npm install` (если изменились зависимости)
3. Перезапустить: `pm2 restart clinici-md`
4. Проверить: `pm2 logs clinici-md`

## 🖼️ Настройка изображений

### 1. Структура папок
```
/var/www/clinici.md/
├── img/                    # Папка с изображениями клиник
│   ├── clinic-logo-*.jpg   # Логотипы клиник
│   └── ...
└── ...
```

### 2. Проверка изображений
```bash
# Проверить что папка img существует
ls -la /var/www/clinici.md/img/

# Проверить права доступа
sudo -u www-data ls /var/www/clinici.md/img/

# Проверить доступность изображения
curl http://5.35.126.5/images/clinic-logo-1755701483875-827367833.jpg
```

### 3. Очистка кеша
```bash
# Перезапустить приложение
pm2 restart clinici-md

# Перезагрузить Nginx
systemctl reload nginx

# Очистить кеш PM2
pm2 flush clinici-md
```

---
**Создано:** 27.08.2025  
**Последнее обновление:** 27.08.2025
