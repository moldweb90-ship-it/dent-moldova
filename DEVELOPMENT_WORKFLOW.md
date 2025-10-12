# 🚀 Workflow разработки Clinici.md

## 📋 Обзор процесса

**Основной принцип:** Локальная разработка → Git → Автодеплой на домен

```
localhost:5000 → git push → GitHub → Auto Deploy → https://mdent.md/
    (dev)                                              (production)
```

---

## 🏠 Локальная разработка

### Настройка
```bash
# 1. Клонируем репозиторий
git clone https://github.com/your-repo/clinici.md.git
cd clinici.md

# 2. Устанавливаем зависимости
npm install

# 3. Настраиваем .env (используем development базу данных)
DATABASE_URL=postgresql://username:password@ep-noisy-glade-XXXXX.eu-central-1.aws.neon.tech/neondb?sslmode=require
ADMIN_PASSWORD=ваш_пароль_администратора
SESSION_SECRET=случайная_строка_минимум_32_символа
NODE_ENV=development
PORT=5000

# 4. Запускаем в режиме разработки
npm run dev
```

**Результат:** Сайт доступен на `http://localhost:5000`

---

## 💻 Рабочий процесс

### 1. Разработка
- Пишем код локально
- Тестируем на `http://localhost:5000`
- Используем development базу данных (изолированную от продакшена)

### 2. Коммит изменений
```bash
# Добавляем изменения
git add .

# Коммитим с описанием
git commit -m "feat: добавлена новая функция поиска"

# Пушим в GitHub
git push origin main
```

### 3. Автодеплой
- GitHub Actions автоматически получает изменения
- Деплоит на сервер `https://mdent.md/`
- Использует production базу данных
- Защищает фото клиник от потери

---

## 🌐 Окружения

### Development (локально)
- **URL:** `http://localhost:5000`
- **База данных:** `ep-noisy-glade-a27o92qc` (development branch)
- **Назначение:** Разработка и тестирование
- **Данные:** Тестовые клиники

### Production (домен)
- **URL:** `https://mdent.md/`
- **База данных:** `ep-raspy-cloud-a2o31v0k` (production branch)
- **Назначение:** Реальный сайт
- **Данные:** Настоящие клиники и фото

---

## 📊 База данных

### Изоляция окружений
```
Development DB ←→ Local Development
     ↓ (не связаны)
Production DB ←→ https://mdent.md/
```

**Важно:** 
- ✅ Локальные изменения не влияют на продакшн
- ✅ Продакшн данные не затрагиваются при разработке
- ✅ Можно безопасно тестировать любые изменения

---

## 🛡️ Безопасность

### Защита данных
- **Фото клиник:** Автоматически защищены при деплое
- **Админ пароли:** В переменных окружения (не в коде)
- **База данных:** Отдельные бранчи для dev/prod
- **SSL:** Let's Encrypt сертификат на домене

### Переменные окружения
```bash
# Development (.env в корне проекта)
DATABASE_URL=postgresql://...ep-noisy-glade-.../neondb
ADMIN_PASSWORD=dev_password
SESSION_SECRET=dev_session_secret

# Production (на сервере)
DATABASE_URL=postgresql://...ep-raspy-cloud-.../neondb
ADMIN_PASSWORD=production_password
SESSION_SECRET=production_session_secret
```

---

## 🔧 Команды

### Основные
```bash
npm run dev          # Запуск разработки
npm run build        # Сборка для продакшена
npm run check        # Проверка типов
npm run db:push      # Применить схему БД
```

### Git
```bash
git add .            # Добавить изменения
git commit -m "..."  # Коммит с сообщением
git push origin main # Отправить в GitHub
```

### Сервер (для экстренных случаев)
```bash
ssh root@mdent.md
cd /var/www/clinici.md
pm2 restart clinici-md
```

---

## 📈 Мониторинг

### Проверка деплоя
1. **GitHub Actions:** https://github.com/your-repo/actions
2. **Сайт:** https://mdent.md/
3. **Логи:** `pm2 logs clinici-md` (на сервере)

### Статус сервисов
```bash
# На сервере
pm2 status           # Статус процессов
pm2 logs clinici-md  # Логи приложения
systemctl status nginx # Статус веб-сервера
```

---

## 🎯 Лучшие практики

### ✅ Делайте
- Тестируйте локально перед коммитом
- Используйте осмысленные сообщения коммитов
- Проверяйте сайт после деплоя
- Работайте только с development базой локально

### ❌ Не делайте
- Не коммитьте .env файлы
- Не работайте с production базой локально
- Не деплойте без тестирования
- Не добавляйте клиники локально (только на продакшене)

---

## 🆘 Решение проблем

### Сайт не работает после деплоя
```bash
# Проверить логи
ssh root@mdent.md
pm2 logs clinici-md

# Перезапустить
pm2 restart clinici-md

# Проверить Nginx
nginx -t
systemctl reload nginx
```

### Ошибки базы данных
```bash
# Проверить подключение
docker exec clinici_md_app node -e "console.log('DB connection test')"

# Проверить переменные окружения
cat /var/www/clinici.md/.env
```

### Проблемы с SSL
```bash
# Проверить сертификат
certbot certificates

# Обновить сертификат
certbot renew --dry-run
```

---

## 🎉 Готово!

Теперь у вас есть четкий процесс разработки:
1. **Локально** - пишем и тестируем
2. **Git** - сохраняем изменения
3. **Домен** - автоматически обновляется

**Ваш сайт:** https://mdent.md/ 🔒
