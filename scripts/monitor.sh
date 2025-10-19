#!/bin/bash

# Скрипт мониторинга и автовосстановления
echo "🔍 Проверяем статус приложения..."

# Проверяем PM2 статус
pm2_status=$(pm2 jlist | jq -r '.[] | select(.name=="clinici-md") | .pm2_env.status' 2>/dev/null)

if [ "$pm2_status" != "online" ]; then
    echo "❌ Приложение не работает, перезапускаем..."
    pm2 restart clinici-md
    sleep 5
fi

# Проверяем health check
if ! curl -f http://localhost:5000/health > /dev/null 2>&1; then
    echo "❌ Health check не прошел, перезапускаем..."
    pm2 restart clinici-md
    sleep 10
    
    # Проверяем еще раз
    if ! curl -f http://localhost:5000/health > /dev/null 2>&1; then
        echo "❌ Приложение не отвечает, проверяем логи..."
        pm2 logs clinici-md --lines 10
        exit 1
    fi
fi

echo "✅ Приложение работает нормально"
