# 🚀 Быстрая диагностика MDent.md

## 📋 Что было исправлено

### Проблемы до исправления:
- ❌ 502/503 ошибки через 1-2 дня
- ❌ Белая страница (CSS/JS 404)
- ❌ Development режим в продакшене
- ❌ Отсутствие мониторинга

### Что исправили:
- ✅ Стабильная конфигурация PM2
- ✅ Обработка ошибок в коде
- ✅ Production режим
- ✅ Мониторинг и автовосстановление
- ✅ Правильная сборка статических файлов

## 🔧 Быстрая диагностика

### Если сайт упал - выполни эти команды:

```bash
# 1. Быстрая диагностика
./scripts/diagnose.sh

# 2. Проверка статуса
pm2 status

# 3. Перезапуск (если нужно)
pm2 restart clinici-md

# 4. Полное восстановление (если не помогает)
pm2 stop clinici-md
npm run build
pm2 start ecosystem.config.cjs
```

### Проверка здоровья:
```bash
curl http://localhost:5000/health
curl https://mdent.md/
```

## 📚 Документация

- `PRODUCTION_TROUBLESHOOTING.md` - полная диагностика
- `scripts/diagnose.sh` - автоматическая диагностика
- `scripts/monitor.sh` - мониторинг здоровья

## 🆘 Экстренное восстановление

```bash
pm2 stop clinici-md
pm2 delete clinici-md
npm run build
pm2 start ecosystem.config.cjs
curl https://mdent.md/
```

---
**Создано:** 2025-10-19  
**Для:** Быстрой диагностики проблем продакшена
