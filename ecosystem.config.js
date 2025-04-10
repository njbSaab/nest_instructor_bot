module.exports = {
  apps: [
    {
      name: '1xjet-b',
      script: 'dist/main.js',
      autorestart: true,
      watch: false, // или true, если хотите отслеживать изменения
      max_restarts: 10, // можно задать лимит перезапусков
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
