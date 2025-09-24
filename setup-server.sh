#!/bin/bash

# Скрипт для настройки VPS сервера для автодеплоя
# Запускать на сервере: bash setup-server.sh

echo "🚀 Настройка VPS сервера для автодеплоя Clinici.md"

# Обновляем систему
echo "📦 Обновление системы..."
sudo apt update && sudo apt upgrade -y

# Устанавливаем Docker
echo "🐳 Установка Docker..."
sudo apt install docker.io -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Устанавливаем Docker Compose
echo "🔧 Установка Docker Compose..."
sudo apt install docker-compose -y

# Устанавливаем Git
echo "📁 Установка Git..."
sudo apt install git -y

# Создаем директорию для проекта
echo "📂 Создание директории проекта..."
sudo mkdir -p /var/www/clinici.md
sudo chown $USER:$USER /var/www/clinici.md

# Клонируем репозиторий
echo "📥 Клонирование репозитория..."
cd /var/www/clinici.md
git clone https://github.com/moldweb90-ship-it/dent-moldova.git .

# Создаем .env файл
echo "⚙️ Создание .env файла..."
cat > .env << EOF
DATABASE_URL=postgresql://neondb_owner:npg_b01fKBQnkx1W@ep-raspy-cloud-a2o31v0k-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NODE_ENV=production
EOF

# Настраиваем SSH для GitHub Actions
echo "🔑 Настройка SSH..."
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Генерируем SSH ключи для GitHub Actions
echo "🔐 Генерация SSH ключей..."
ssh-keygen -t rsa -b 4096 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy_key -N ""

# Добавляем публичный ключ в authorized_keys
cat ~/.ssh/github_actions_deploy_key.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

echo "✅ Настройка сервера завершена!"
echo ""
echo "📋 Следующие шаги:"
echo "1. Скопируйте приватный ключ:"
echo "   cat ~/.ssh/github_actions_deploy_key"
echo ""
echo "2. Добавьте его в GitHub Secrets как SSH_PRIVATE_KEY"
echo "3. Добавьте в GitHub Secrets:"
echo "   - SSH_HOST: IP адрес вашего сервера"
echo "   - SSH_USER: $USER"
echo "   - DATABASE_URL: ваша строка подключения к БД"
echo ""
echo "4. После настройки GitHub Secrets, сделайте push в main ветку для тестирования деплоя"
