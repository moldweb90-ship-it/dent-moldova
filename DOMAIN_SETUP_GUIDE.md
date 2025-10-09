# Руководство по настройке домена для clinici.md

## Текущие данные сервера
- **IP адрес:** 5.35.126.5
- **Порт приложения:** 5000
- **Nginx конфиг:** `/etc/nginx/sites-available/clinici-md`
- **Путь к проекту:** `/var/www/clinici.md/`
- **Пользователь:** root
- **ОС:** Ubuntu 22.04 LTS

## 1. DNS записи у регистратора домена

### A-запись (основная)
```
Имя: @ (или оставить пустым)
Тип: A
Значение: 5.35.126.5
TTL: 300
```

### CNAME-запись (для www)
```
Имя: www
Тип: CNAME
Значение: ваш-домен.com
TTL: 300
```

### Дополнительные A-записи (если нужны поддомены)
```
Имя: admin
Тип: A
Значение: 5.35.126.5
TTL: 300
```

## 2. Обновление Nginx конфигурации

### Файл: `/etc/nginx/sites-available/clinici-md`

```nginx
server {
    listen 80;
    server_name ваш-домен.com www.ваш-домен.com 5.35.126.5;

    # Редирект с www на основной домен
    if ($host = www.ваш-домен.com) {
        return 301 http://ваш-домен.com$request_uri;
    }

    # Static images
    location /images/ {
        alias /var/www/clinici.md/img/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Основное приложение
    location / {
        proxy_pass http://[::1]:5000;
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

## 3. Команды для настройки SSL (HTTPS)

### Установка Certbot
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

### Получение SSL сертификата
```bash
sudo certbot --nginx -d ваш-домен.com -d www.ваш-домен.com
```

### Автообновление сертификатов
```bash
sudo crontab -e
# Добавить строку:
0 12 * * * /usr/bin/certbot renew --quiet
```

## 4. Финальная конфигурация Nginx (после SSL)

### Обновленный файл после получения SSL
```nginx
server {
    listen 80;
    server_name ваш-домен.com www.ваш-домен.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name www.ваш-домен.com;
    return 301 https://ваш-домен.com$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ваш-домен.com;

    # SSL конфигурация (добавляется автоматически Certbot)
    ssl_certificate /etc/letsencrypt/live/ваш-домен.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ваш-домен.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Static images
    location /images/ {
        alias /var/www/clinici.md/img/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Основное приложение
    location / {
        proxy_pass http://[::1]:5000;
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

## 5. Команды для применения изменений

### Проверка и перезапуск Nginx
```bash
# Проверка синтаксиса
sudo nginx -t

# Перезапуск Nginx
sudo systemctl reload nginx

# Проверка статуса
sudo systemctl status nginx
```

### Проверка работы домена
```bash
# Проверка DNS
nslookup ваш-домен.com
dig ваш-домен.com

# Проверка доступности
curl -I http://ваш-домен.com
curl -I https://ваш-домен.com
```

## 6. Обновление переменных окружения (если нужно)

### Файл: `/var/www/clinici.md/.env`
```env
DATABASE_URL=postgresql://username:password@ep-raspy-cloud-XXXXX.eu-central-1.aws.neon.tech/neondb?sslmode=require
ADMIN_PASSWORD=надежный_пароль
SESSION_SECRET=случайная_строка_32_символа
NODE_ENV=production
PORT=5000
SKIP_MIGRATIONS=true
DOMAIN=ваш-домен.com
```

## 7. Обновление GitHub Actions (если нужно)

### Файл: `.github/workflows/deploy.yml`
```yaml
# Обновить URL в уведомлениях
- name: Notify deployment
  run: |
    echo "Сайт успешно задеплоен на https://ваш-домен.com"
```

## 8. Проверочный чек-лист

- [ ] DNS записи созданы (A и CNAME)
- [ ] Nginx конфигурация обновлена
- [ ] SSL сертификат получен
- [ ] Nginx перезапущен
- [ ] Домен работает по HTTP
- [ ] Домен работает по HTTPS
- [ ] Редирект с www работает
- [ ] Все функции сайта работают
- [ ] PM2 процесс запущен
- [ ] Автообновление SSL настроено

## 9. Полезные команды для диагностики

```bash
# Проверка логов Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Проверка статуса PM2
pm2 status
pm2 logs

# Проверка портов
netstat -tlnp | grep :80
netstat -tlnp | grep :443
netstat -tlnp | grep :5000

# Проверка DNS
host ваш-домен.com
```

## 10. Резервное копирование

```bash
# Бэкап текущей конфигурации Nginx
sudo cp /etc/nginx/sites-available/clinici-md /etc/nginx/sites-available/clinici-md.backup

# Бэкап SSL сертификатов
sudo cp -r /etc/letsencrypt /etc/letsencrypt.backup
```

---

**Примечание:** Замените `ваш-домен.com` на реальное имя домена при настройке.
