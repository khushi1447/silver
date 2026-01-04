/** @type {import('pm2').StartOptions} */
module.exports = {
  apps: [
    {
      name: "silver",
      cwd: __dirname,
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
      time: true,
      autorestart: true,
      max_restarts: 10,
    },
  ],
};
