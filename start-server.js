const { spawn } = require('child_process');

// Устанавливаем переменные окружения
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_b0lfKBQnkx1W@ep-raspy-cloud-a2o31v0k-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
process.env.PORT = '5000';
process.env.NODE_ENV = 'development';

// Запускаем сервер
const server = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  shell: true
});

server.on('error', (error) => {
  console.error('Ошибка запуска сервера:', error);
  process.exit(1);
});

server.on('close', (code) => {
  console.log(`Сервер завершился с кодом ${code}`);
  process.exit(code);
});
