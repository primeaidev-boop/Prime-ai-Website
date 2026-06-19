// PM2 process manager config for Prim AI Institute backend (NestJS)
// Usage: pm2 start ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'primai-backend',
      script: 'dist/src/main.js',
      cwd: '/var/www/primai/backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      // PM2 reads the .env file in the same directory automatically
      // (via dotenv) but NestJS @nestjs/config also picks it up.
      error_file: '/var/log/pm2/primai-backend-error.log',
      out_file: '/var/log/pm2/primai-backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
