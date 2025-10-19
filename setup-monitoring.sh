#!/bin/bash

# Скрипт настройки мониторинга на продакшене
echo "🔧 Настраиваем мониторинг приложения..."

# Делаем скрипты исполняемыми
chmod +x deploy-safe.sh
chmod +x scripts/monitor.sh

# Создаем папку для логов
mkdir -p logs

# Настраиваем cron для мониторинга каждые 5 минут
echo "⏰ Настраиваем cron мониторинг..."
(crontab -l 2>/dev/null; echo "*/5 * * * * cd /var/www/clinici.md && ./scripts/monitor.sh >> logs/monitor.log 2>&1") | crontab -

# Настраиваем ротацию логов
echo "📝 Настраиваем ротацию логов..."
cat > /etc/logrotate.d/clinici-md << EOF
/var/www/clinici.md/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    notifempty
    copytruncate
}
EOF

echo "✅ Мониторинг настроен!"
echo "📊 Проверка статуса: pm2 status"
echo "📝 Логи мониторинга: tail -f logs/monitor.log"
echo "🔄 Мониторинг запускается каждые 5 минут"
