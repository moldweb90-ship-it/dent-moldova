#!/bin/bash

# Улучшенный скрипт диагностики продакшена MDent.md
# Использование: ./scripts/diagnose-improved.sh

echo "🔍 Диагностика продакшена MDent.md"
echo "=================================="

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функция для вывода статуса
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

echo ""
echo "1. 📊 Проверка статуса PM2..."
if pm2 status | grep -q "clinici-md.*online"; then
    print_status 0 "PM2 процесс запущен"
    pm2 status | grep clinici-md
else
    print_status 1 "PM2 процесс не запущен или недоступен"
fi

echo ""
echo "2. 🏥 Проверка health check..."
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health)
if [ "$HEALTH_RESPONSE" -eq 200 ]; then
    print_status 0 "Health check успешен (HTTP $HEALTH_RESPONSE)"
    curl -s http://localhost:5000/health | jq '.' 2>/dev/null || curl -s http://localhost:5000/health
else
    print_status 1 "Health check не пройден (HTTP $HEALTH_RESPONSE)"
fi

echo ""
echo "3. 🌐 Проверка доступности сайта..."
SITE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://mdent.md/)
if [ "$SITE_RESPONSE" -eq 200 ]; then
    print_status 0 "Сайт доступен (HTTP $SITE_RESPONSE)"
else
    print_status 1 "Сайт недоступен (HTTP $SITE_RESPONSE)"
fi

echo ""
echo "4. 📁 Проверка статических файлов..."
if [ -d "public/assets" ]; then
    INDEX_JS=$(ls public/assets/index-*.js 2>/dev/null | head -1)
    INDEX_CSS=$(ls public/assets/index-*.css 2>/dev/null | head -1)
    
    if [ -n "$INDEX_JS" ] && [ -n "$INDEX_CSS" ]; then
        print_status 0 "Статические файлы найдены"
        echo "   JS: $(basename $INDEX_JS)"
        echo "   CSS: $(basename $INDEX_CSS)"
        
        # Проверяем доступность через веб
        JS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "https://mdent.md/assets/$(basename $INDEX_JS)")
        CSS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "https://mdent.md/assets/$(basename $INDEX_CSS)")
        
        if [ "$JS_RESPONSE" -eq 200 ] && [ "$CSS_RESPONSE" -eq 200 ]; then
            print_status 0 "Статические файлы доступны через веб"
        else
            print_status 1 "Статические файлы недоступны через веб (JS: $JS_RESPONSE, CSS: $CSS_RESPONSE)"
        fi
    else
        print_status 1 "Статические файлы не найдены"
    fi
else
    print_status 1 "Папка public/assets не найдена"
fi

echo ""
echo "5. 📝 Проверка последних логов..."
echo "Последние 10 строк логов PM2:"
pm2 logs clinici-md --lines 10 --nostream 2>/dev/null || echo "Логи недоступны"

echo ""
echo "6. 💾 Проверка использования памяти..."
# Используем простую проверку через ps вместо PM2 API
MEMORY_KB=$(ps aux | grep "clinici-md" | grep -v grep | awk '{sum+=$6} END {print sum}')
if [ -n "$MEMORY_KB" ] && [ "$MEMORY_KB" -gt 0 ]; then
    MEMORY_MB=$((MEMORY_KB / 1024))
    if [ $MEMORY_MB -lt 200 ]; then
        print_status 0 "Память в норме (${MEMORY_MB}MB)"
    elif [ $MEMORY_MB -lt 500 ]; then
        print_warning "Высокое использование памяти (${MEMORY_MB}MB)"
    else
        print_status 1 "Критически высокое использование памяти (${MEMORY_MB}MB)"
    fi
else
    print_warning "Не удалось получить информацию о памяти"
fi

echo ""
echo "7. 🔄 Проверка перезапусков PM2..."
# Используем простую проверку через pm2 list
RESTARTS=$(pm2 list | grep clinici-md | awk '{print $12}' 2>/dev/null)
if [ -n "$RESTARTS" ]; then
    if [ "$RESTARTS" -eq 0 ]; then
        print_status 0 "Перезапусков не было"
    elif [ "$RESTARTS" -lt 5 ]; then
        print_warning "Было $RESTARTS перезапусков"
    else
        print_status 1 "Критически много перезапусков: $RESTARTS"
    fi
else
    print_warning "Не удалось получить информацию о перезапусках"
fi

echo ""
echo "8. ⏰ Проверка времени работы..."
# Используем простую проверку через pm2 list
UPTIME=$(pm2 list | grep clinici-md | awk '{print $8}' 2>/dev/null)
if [ -n "$UPTIME" ]; then
    print_status 0 "Приложение работает: $UPTIME"
else
    print_warning "Не удалось получить информацию о времени работы"
fi

echo ""
echo "9. 🔧 Проверка конфигурации..."
if [ -f "ecosystem.config.cjs" ]; then
    print_status 0 "Конфигурация PM2 найдена"
else
    print_status 1 "Конфигурация PM2 не найдена"
fi

if [ -f ".env" ]; then
    print_status 0 "Файл .env найден"
else
    print_status 1 "Файл .env не найден"
fi

echo ""
echo "=================================="
echo "🏁 Диагностика завершена"
echo ""
echo "💡 Рекомендации:"
echo "- Если есть проблемы - проверьте PRODUCTION_TROUBLESHOOTING.md"
echo "- Для перезапуска: pm2 restart clinici-md"
echo "- Для полного восстановления: pm2 stop clinici-md && npm run build && pm2 start ecosystem.config.cjs"
echo ""
echo "📊 Сводка:"
echo "- PM2 статус: $(pm2 status | grep clinici-md | awk '{print $10}' 2>/dev/null || echo 'неизвестно')"
echo "- Health check: HTTP $HEALTH_RESPONSE"
echo "- Сайт доступен: HTTP $SITE_RESPONSE"
echo "- Статические файлы: $([ -d "public/assets" ] && echo "найдены" || echo "не найдены")"
