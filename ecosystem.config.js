module.exports = {
  apps: [{
    name: 'clinici-md',
    script: 'npm',
    args: 'run dev',
    cwd: './',
    watch: false,
    instances: 1,
    autorestart: true,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 5000
    }
  }]
};
