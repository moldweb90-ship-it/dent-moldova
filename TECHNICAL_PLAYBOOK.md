## Clinici.md – Technical Playbook

### 1) Architecture
- Frontend: React + Vite, build output in `public/`
- Backend: Express (Node 20, ESM), Drizzle ORM
- DB: Neon PostgreSQL (serverless HTTP driver)
- Container: Docker + docker-compose (`app`)
- CI/CD: GitHub Actions → SSH to VPS → `docker-compose up -d --build`

### 2) Environments
- Local (dev): `npm run dev` (Express + Vite middleware), app on `http://localhost:5000`
- Production (VPS): build in Docker image, run `node dist/index.js`

### 3) Env variables
- `DATABASE_URL` (required). Use non-pooled host and no channel_binding:
  `postgresql://username:password@ep-raspy-cloud-XXXXX.eu-central-1.aws.neon.tech/neondb?sslmode=require`
- `ADMIN_PASSWORD` (required). Admin panel password
- `SESSION_SECRET` (required). Secret key for sessions (min 32 chars)
- `NODE_ENV`: `development` locally, `production` on VPS
- `SKIP_MIGRATIONS`: `true` on VPS

### 4) Local workflow (golden rule)
1. Тестируем локально на `http://localhost:5000`
2. Если всё ок → `git add/commit/push` в `main`
3. GitHub Actions автодеплоит на VPS → `http://5.35.126.5:5000`

### 5) Commands
```
npm install
npm run dev        # local dev
npm run build      # production build during Docker image build
npm run check      # type check
```

### 6) Docker / Compose
- `Dockerfile` делает `vite build` (frontend) и `esbuild` (server → `dist/`)
- В `docker-compose.yml` НЕ монтируем `./public` вовнутрь контейнера
- Порты: `5000:5000`
- Env: `DATABASE_URL`, `NODE_ENV=production`, `SKIP_MIGRATIONS=true`

Перезапуск на VPS:
```
cd /var/www/clinici.md
docker-compose down
docker-compose up -d --build
docker-compose logs -f
```

### 7) CI/CD (GitHub Actions)
- Workflow: `.github/workflows/deploy.yml`
- Secrets (repo → Settings → Secrets → Actions):
  - `SSH_PRIVATE_KEY`, `SSH_HOST` (5.35.126.5), `SSH_USER` (root)
  - `DATABASE_URL` – прод-строка подключения

### 8) Server layout (VPS)
- Repo: `/var/www/clinici.md`
- `.env` (production):
  - `DATABASE_URL=...`
  - `NODE_ENV=production`
  - `SKIP_MIGRATIONS=true`

### 9) Static assets & MIME
- Прод-ассеты: `/app/public/assets` внутри контейнера
- `server/vite.ts` раздаёт `/assets` с корректным MIME:
  - `.js` → `application/javascript`
  - `.css` → `text/css`

### 10) DB (Neon)
- Драйвер: `@neondatabase/serverless`
- В dev `.env` подхватывается автоматически; в prod — `process.env.DATABASE_URL`
- Смена пароля: Neon → VPS `.env` → GH Secret → redeploy

Проверка соединения в контейнере:
```
docker exec clinici_md_app node -e "import('@neondatabase/serverless').then(async m=>{const {neon}=m;const c=neon(process.env.DATABASE_URL);await c`select 1`;console.log('DB OK')}).catch(e=>console.error(e.message))"
```

### 11) Troubleshooting
- Белая страница/MIME:
  - Убедиться, что volume `./public:/app/public` отсутствует
  - `docker-compose up -d --build`
  - `curl -I http://127.0.0.1:5000/assets/<hash>.js`
- БД auth failed:
  - Проверить `DATABASE_URL` (без `-pooler`, без `channel_binding`)
  - Обновить пароль по цепочке и пересобрать
- Порт 5000 занят локально:
  - Завершить процесс и `npm run dev` снова

### 12) Operational policy
- Не коммитим `.env`
- Прод-секреты только в GitHub Secrets и на VPS `.env`
- Перед пушем в `main` всегда проверяем локально


