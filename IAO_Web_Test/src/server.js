const config = require('./config');
const { configured } = require('./mailer');
const { createApp } = require('./app');

createApp().listen(config.port, () => {
  console.log(`${config.appName} running at http://localhost:${config.port} (${config.env})`);
  if (!configured) console.warn('⚠  SMTP is not configured: registration and login codes cannot be emailed. See README → "Email setup".');
});
