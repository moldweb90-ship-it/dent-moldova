module.exports = {
  apps: [{
    name: 'clinici-md',
    script: 'node_modules/.bin/tsx',
    args: 'server/index.ts',
    cwd: './',
    watch: false,
    instances: 1,
    autorestart: true,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://neondb_owner:npg_OIyN85pFxMlu@ep-raspy-cloud-a2o31v0k-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
      PORT: '5000'
    }
  }]
};
