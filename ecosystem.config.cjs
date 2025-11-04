module.exports = {
  apps: [{
    name: 'clinici-md',
    script: 'npm',
    args: 'start',
    cwd: './',
    watch: false,
    instances: 1,
    autorestart: true,
    max_memory_restart: '512M',
    min_uptime: '10s',
    max_restarts: 50,
    restart_delay: 5000,
    kill_timeout: 10000,
    listen_timeout: 10000,
    wait_ready: true,
    exp_backoff_restart_delay: 100,
    env: {
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://neondb_owner:npg_OIyN85pFxMlu@ep-raspy-cloud-a2o31v0k-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
      PORT: '5000'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
