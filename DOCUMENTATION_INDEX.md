# 📚 Индекс документации Clinici.md

## 🎯 Основные документы

### 🚀 Разработка
- **[DEVELOPMENT_WORKFLOW.md](./DEVELOPMENT_WORKFLOW.md)** - Основной workflow (ЧИТАТЬ ПЕРВЫМ!)
- **[README.md](./README.md)** - Обзор проекта и установка
- **[TECHNICAL_PLAYBOOK.md](./TECHNICAL_PLAYBOOK.md)** - Техническая документация

### 🛡️ Безопасность и деплой
- **[DEPLOYMENT_SAFETY_GUIDE.md](./DEPLOYMENT_SAFETY_GUIDE.md)** - Защита фото клиник при деплое
- **[SECURITY_AUDIT_REPORT.md](./SECURITY_AUDIT_REPORT.md)** - Отчет о безопасности
- **[VPS_DEPLOYMENT_GUIDE.md](./VPS_DEPLOYMENT_GUIDE.md)** - Настройка VPS

### ⚙️ Технические детали
- **[CACHE_SYSTEM.md](./CACHE_SYSTEM.md)** - Система кэширования
- **[FIXES_AND_SOLUTIONS.md](./FIXES_AND_SOLUTIONS.md)** - Решения проблем
- **[CONTEXT.md](./CONTEXT.md)** - Контекст проекта

---

## 🎯 Быстрый старт

### Для новых разработчиков:
1. **Прочитайте** [DEVELOPMENT_WORKFLOW.md](./DEVELOPMENT_WORKFLOW.md)
2. **Настройте** локальную среду по [README.md](./README.md)
3. **Изучите** техническую документацию [TECHNICAL_PLAYBOOK.md](./TECHNICAL_PLAYBOOK.md)

### Для деплоя:
1. **Убедитесь** что фото защищены [DEPLOYMENT_SAFETY_GUIDE.md](./DEPLOYMENT_SAFETY_GUIDE.md)
2. **Следуйте** процессу в [DEVELOPMENT_WORKFLOW.md](./DEVELOPMENT_WORKFLOW.md)
3. **Проверьте** статус на [https://mdent.md/](https://mdent.md/)

---

## 🌐 Актуальные ссылки

### Основные адреса:
- **Продакшн сайт:** https://mdent.md/
- **Локальная разработка:** http://localhost:5000
- **GitHub Actions:** https://github.com/your-repo/actions

### Сервер:
- **SSH:** `ssh root@mdent.md`
- **Путь:** `/var/www/clinici.md`

---

## 📊 Архитектура

```
Локальная разработка → Git → GitHub → Auto Deploy → https://mdent.md/
    (localhost:5000)                                (production)
```

### Базы данных:
- **Development:** `ep-noisy-glade-a27o92qc` (для локальной разработки)
- **Production:** `ep-raspy-cloud-a2o31v0k` (для https://mdent.md/)

---

## 🔧 Частые задачи

### Обновление кода:
```bash
# Локально
npm run dev                    # Тестируем
git add . && git commit -m "..." # Коммитим
git push origin main           # Деплоим

# Результат автоматически на https://mdent.md/
```

### Добавление клиник:
1. Заходите на https://mdent.md/admin
2. Добавляете клинику через админку
3. Фото автоматически защищены при деплое

### Решение проблем:
1. Проверьте [FIXES_AND_SOLUTIONS.md](./FIXES_AND_SOLUTIONS.md)
2. Изучите логи: `pm2 logs clinici-md` (на сервере)
3. Проверьте GitHub Actions

---

## 📞 Поддержка

### При проблемах:
1. **Проверьте** статус сайта: https://mdent.md/
2. **Изучите** логи GitHub Actions
3. **Обратитесь** к соответствующей документации выше

### Контакты:
- **GitHub Issues:** [ваш-репозиторий/issues]
- **Сервер:** `ssh root@mdent.md`

---

## ✅ Статус проекта

- **SSL:** ✅ Let's Encrypt сертификат установлен
- **Домен:** ✅ https://mdent.md/ работает
- **Автодеплой:** ✅ GitHub Actions настроен
- **База данных:** ✅ Изолированные окружения
- **Безопасность:** ✅ Фото клиник защищены

**Проект готов к продуктивной работе!** 🎉
