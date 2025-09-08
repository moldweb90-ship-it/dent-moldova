FROM node:20-alpine

WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./
COPY tsconfig.json ./
COPY drizzle.config.ts ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./
COPY vite.config.ts ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY . .

# Применяем схему базы данных и заполняем данными
RUN npm run db:push
RUN npx tsx server/seed.ts

# Открываем порт
EXPOSE 5000

# Запускаем приложение
CMD ["npm", "run", "dev"]
