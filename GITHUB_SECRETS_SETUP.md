# 🔐 Настройка GitHub Secrets для автодеплоя

## 📋 Необходимые секреты

Перейдите в ваш репозиторий на GitHub: https://github.com/moldweb90-ship-it/dent-moldova

1. **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

### Добавьте следующие секреты:

#### 1. `SSH_PRIVATE_KEY`
- **Что это**: Приватный SSH ключ для подключения к серверу
- **Как получить**: После запуска `setup-server.sh` на сервере, выполните:
  ```bash
  cat ~/.ssh/github_actions_deploy_key
  ```
- **Скопируйте весь вывод** (включая `-----BEGIN OPENSSH PRIVATE KEY-----` и `-----END OPENSSH PRIVATE KEY-----`)

#### 2. `SSH_HOST`
- **Что это**: IP адрес или домен вашего VPS сервера
- **Пример**: `192.168.1.100` или `your-server.com`

#### 3. `SSH_USER`
- **Что это**: Имя пользователя на сервере (обычно `root` или `ubuntu`)
- **Пример**: `root`

#### 4. `DATABASE_URL`
- **Что это**: Строка подключения к вашей базе данных Neon (production)
- **Формат**: `postgresql://username:password@host.region.aws.neon.tech/dbname?sslmode=require`
- **Получить**: Neon Dashboard → вашбаза → Connection String

#### 5. `ADMIN_PASSWORD`
- **Что это**: Пароль для входа в админ-панель
- **Требования**: Минимум 8 символов, используйте надежный пароль

#### 6. `SESSION_SECRET`
- **Что это**: Секретный ключ для шифрования сессий
- **Генерация**: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## 🚀 После настройки секретов

1. Сделайте любой коммит и push в ветку `main`
2. GitHub Actions автоматически запустит деплой
3. Проверьте логи в **Actions** вкладке вашего репозитория

## 🔍 Проверка деплоя

После успешного деплоя ваше приложение будет доступно по адресу:
`http://YOUR_SERVER_IP:5000`
