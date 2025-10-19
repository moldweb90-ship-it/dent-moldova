# 🔧 Диагностика проблем продакшена MDent.md

## 🚨 Быстрые команды для диагностики

### 1. Проверка статуса PM2
```bash
pm2 status
pm2 logs clinici-md --lines 50
```

### 2. Проверка здоровья приложения
```bash
curl http://localhost:5000/health
curl https://mdent.md/health
```

### 3. Проверка доступности сайта
```bash
curl -I https://mdent.md/
curl https://mdent.md/ | head -20
```

### 4. Проверка статических файлов
```bash
ls -la public/assets/ | grep index
curl https://mdent.md/assets/index-*.js
curl https://mdent.md/assets/index-*.css
```

## 🔍 Типичные проблемы и решения

### Проблема: 502 Bad Gateway / 503 Service Unavailable
**Симптомы:** Сайт не доступен, nginx возвращает ошибки
**Диагностика:**
```bash
pm2 status
pm2 logs clinici-md --lines 100
curl http://localhost:5000/health
```
**Решение:**
```bash
pm2 restart clinici-md
# Если не помогает:
pm2 stop clinici-md
pm2 start ecosystem.config.cjs
```

### Проблема: Белая страница (CSS/JS не загружаются)
**Симптомы:** Сайт открывается, но показывает белую страницу, в консоли браузера 404 ошибки для CSS/JS
**Диагностика:**
```bash
curl https://mdent.md/ | grep -E "(index-.*\.js|index-.*\.css)"
ls -la public/assets/ | grep index
```
**Решение:**
```bash
npm run build
pm2 restart clinici-md
```

### Проблема: Development режим в продакшене
**Симптомы:** В логах PM2 видны сообщения "vite", "dev", "watch"
**Диагностика:**
```bash
pm2 show clinici-md
pm2 logs clinici-md --lines 20
```
**Решение:**
```bash
pm2 stop clinici-md
pm2 delete clinici-md
pm2 start ecosystem.config.cjs
```

### Проблема: Высокое потребление памяти
**Симптомы:** PM2 показывает высокое использование памяти (>500MB)
**Диагностика:**
```bash
pm2 monit
free -h
ps aux | grep clinici
```
**Решение:**
```bash
pm2 restart clinici-md
# Если не помогает:
pm2 stop clinici-md
npm run build
pm2 start ecosystem.config.cjs
```

## 🛠 Команды для полного восстановления

### Полный перезапуск приложения
```bash
pm2 stop clinici-md
pm2 delete clinici-md
npm run build
pm2 start ecosystem.config.cjs
pm2 status
```

### Проверка всех компонентов
```bash
# 1. PM2 статус
pm2 status

# 2. Здоровье приложения
curl http://localhost:5000/health

# 3. Доступность сайта
curl -I https://mdent.md/

# 4. Статические файлы
curl https://mdent.md/assets/index-*.js | head -5
curl https://mdent.md/assets/index-*.css | head -5

# 5. Логи
pm2 logs clinici-md --lines 20
```

## 📊 Мониторинг и автовосстановление

### Настройка мониторинга (если еще не настроено)
```bash
chmod +x scripts/monitor.sh
./scripts/setup-monitoring.sh
```

### Проверка работы мониторинга
```bash
./scripts/monitor.sh
crontab -l
```

### Ручной запуск мониторинга
```bash
./scripts/monitor.sh
```

## 🗂 Важные файлы и их назначение

- `ecosystem.config.cjs` - конфигурация PM2
- `public/assets/` - собранные статические файлы
- `public/index.html` - главная страница
- `scripts/monitor.sh` - скрипт мониторинга
- `logs/` - логи приложения (создается PM2)

## ⚡ Экстренное восстановление

Если сайт полностью недоступен:

```bash
# 1. Проверяем статус
pm2 status

# 2. Перезапускаем
pm2 restart clinici-md

# 3. Если не помогает - полный перезапуск
pm2 stop clinici-md
pm2 delete clinici-md
npm run build
pm2 start ecosystem.config.cjs

# 4. Проверяем результат
curl https://mdent.md/
```

## 📝 Логи для анализа

### Полезные команды для анализа логов
```bash
# Последние ошибки
pm2 logs clinici-md --err --lines 50

# Последние сообщения
pm2 logs clinici-md --out --lines 50

# Поиск ошибок
pm2 logs clinici-md --lines 200 | grep -i error
pm2 logs clinici-md --lines 200 | grep -i "502\|503"
```

## 🔄 Процесс обновления

При обновлении кода:
```bash
# 1. Останавливаем
pm2 stop clinici-md

# 2. Обновляем код
git pull origin main

# 3. Собираем
npm run build

# 4. Запускаем
pm2 start clinici-md

# 5. Проверяем
curl https://mdent.md/
```

---

**Дата создания:** 2025-10-19  
**Последнее обновление:** 2025-10-19  
**Статус:** Активная документация для диагностики продакшена
