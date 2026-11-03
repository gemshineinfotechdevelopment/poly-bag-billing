module.exports = {
  apps: [
    {
      name: 'polybag-billing',
      script: 'server/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 5025,
        MONGODB_URI: 'mongodb://127.0.0.1:27017/polybag_billing'
      }
    }
  ]
};

