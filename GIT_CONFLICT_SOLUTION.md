# 🆘 Решение Git конфликтов на продакшене

## ⚠️ Проблема: "Your branch and 'origin/main' have diverged"

**Ошибка:**
```
Your branch and 'origin/main' have diverged,
and have 1 and 3 different commits each, respectively.
```

**Причина:** Изменения были сделаны **и локально, и на сервере** → ветки разошлись.

---

## ✅ Решение

### На сервере выполни:

```bash
cd /var/www/clinici.md
git fetch origin
git reset --hard origin/main
npm run build
pm2 restart clinici-md
```

**Это:**
1. Загружает последние изменения с GitHub
2. Сбрасывает локальную ветку на сервере к origin/main
3. Пересобирает проект
4. Перезапускает PM2

---

## 🚫 Как избежать в будущем

### Золотое правило деплоя:

1. ❌ **НИКОГДА** не меняй код напрямую на сервере
2. ✅ **ВСЕГДА** делай изменения только **локально**
3. ✅ **Порядок работы:**
   ```
   Локально → Коммит → Push → Автодеплой (GitHub Actions)
   ```

### Правильный workflow:

```bash
# ЛОКАЛЬНО
git add .
git commit -m "описание изменений"
git push origin main

# GitHub Actions автоматически задеплоит на сервер
# Ждем 1-2 минуты → проверяем сайт
```

### Неправильный workflow:

```bash
# ❌ НЕ ДЕЛАЙ ТАК!
ssh root@mdent.md
cd /var/www/clinici.md
nano server/routes.ts  # Редактирование на сервере
git add .
git commit -m "fix"
# Это создаст конфликт с локальными изменениями!
```

---

## 🔍 Диагностика проблем после деплоя

### 1. Проверить Git статус:
```bash
ssh root@mdent.md
cd /var/www/clinici.md
git status
git log --oneline -5
```

**Должно показать:**
```
On branch main
Your branch is up to date with 'origin/main'.
nothing to commit, working tree clean
```

### 2. Проверить PM2:
```bash
pm2 status
pm2 logs clinici-md --lines 20
```

### 3. Проверить что сборка прошла:
```bash
ls -la public/  # Должны быть свежие файлы
```

### 4. Очистить кеш браузера:
- `Ctrl+F5` или `Ctrl+Shift+R`
- Или открой в приватном окне

---

## 🛠️ Полный перезапуск (если ничего не помогло)

```bash
ssh root@mdent.md
cd /var/www/clinici.md

# Сброс к актуальной версии
git fetch origin
git reset --hard origin/main

# Чистая переустановка
rm -rf node_modules
npm install

# Пересборка
npm run build

# Перезапуск PM2
pm2 restart clinici-md

# Проверка логов
pm2 logs clinici-md --lines 30
```

---

## 📋 Чеклист перед деплоем

- [ ] Изменения сделаны **только локально**
- [ ] Протестировано на локальном сервере
- [ ] Закоммичено с понятным описанием
- [ ] Запушено на GitHub
- [ ] GitHub Actions успешно завершился (зеленая галочка)
- [ ] Проверен сайт в браузере (Ctrl+F5)

---

## 🎯 Итого

**НИКОГДА не редактируй код напрямую на сервере!**

Всегда используй workflow:
```
Локально → Git → GitHub → Auto-deploy → Сервер
```

Это исключит конфликты и сохранит историю изменений! ✅

