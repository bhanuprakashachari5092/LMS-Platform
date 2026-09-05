module.exports = {
  apps: [
    {
      name: 'kaizenq-backend',
      script: 'dist/server.js',
      cwd: './backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
        NODE_OPTIONS: '--openssl-legacy-provider',
      },
    },
  ],
};
