// All configuration comes from environment variables (see .env.example).
require('dotenv').config({ quiet: true });
const e = process.env;

const config = {
  env: e.NODE_ENV || 'development',
  port: Number(e.PORT) || 3000,
  appName: e.APP_NAME || 'Northgate',
  dbPath: e.DATABASE_PATH || './data/app.db',
  secret: e.SESSION_SECRET || '',
  trustProxy: e.TRUST_PROXY === 'true',
  smtp: {
    host: e.SMTP_HOST, port: Number(e.SMTP_PORT) || 587, secure: e.SMTP_SECURE === 'true',
    user: e.SMTP_USER, pass: e.SMTP_PASS, from: e.MAIL_FROM,
  },
  otp: { ttlMin: 5, maxAttempts: 5, cooldownSec: 5, maxPerHour: 1000 },
  rate: { general: Number(e.RATE_LIMIT_GENERAL) || 1000, strict: Number(e.RATE_LIMIT_STRICT) || 200 },
};
config.prod = config.env === 'production';

if (config.secret.length < 32) {
  console.error('SESSION_SECRET is missing or shorter than 32 characters.\n' +
    'Generate one with:  node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"\n' +
    'then put it in your .env file.');
  process.exit(1);
}
module.exports = config;
