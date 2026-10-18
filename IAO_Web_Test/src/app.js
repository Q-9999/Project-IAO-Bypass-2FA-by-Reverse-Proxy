const path = require('path');
const crypto = require('crypto');
const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const db = require('./db');
const config = require('./config');
const otp = require('./otp');
const mailer = require('./mailer');
const { HttpError, require_ } = require('./util');
const { createSession, currentSession, destroySession, requireAuth } = require('./sessions');

const BCRYPT_COST = 12;
const DUMMY_HASH = bcrypt.hashSync('timing-equaliser', BCRYPT_COST); // compared when the user doesn't exist
const mask = (e) => e.replace(/^(.).*(@.*)$/, '$1•••$2');

function createApp() {
  const app = express();
  if (config.trustProxy) app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(helmet({ contentSecurityPolicy: { useDefaults: true, directives: { 'upgrade-insecure-requests': config.prod ? [] : null } } }));
  app.use(express.json({ limit: '10kb' }));
  app.use(cookieParser());

  // CSRF defence: SameSite cookie + JSON-only bodies + same-origin check on writes.
  app.use((req, _res, next) => {
    const origin = req.get('origin');
    if (req.method !== 'GET' && origin && new URL(origin).host !== req.get('host')) return next(new HttpError(403, 'Cross-origin request blocked.'));
    next();
  });

  const limiter = (limit) => rateLimit({ windowMs: 15 * 60e3, limit, standardHeaders: true, legacyHeaders: false,
    message: { error: 'Too many requests. Please try again in a few seconds.' } });
  const strict = limiter(config.rate.strict);
  app.use('/api/auth', limiter(config.rate.general));

  const api = express.Router();
  const body = (req) => (req.body && typeof req.body === 'object' ? req.body : {});

  // ---- Registration ----------------------------------------------------
  const assertFree = ({ username, email }) => {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(normalizedEmail)) throw new HttpError(409, 'That email is already registered. Log in instead.', { field: 'email' });
    if (db.prepare('SELECT 1 FROM users WHERE username = ?').get(username)) throw new HttpError(409, 'That username is taken.', { field: 'username' });
  };
  api.post('/register/send-code', strict, async (req, res) => {
    const { username, email } = body(req);
    require_('username', username); require_('email', email); assertFree({ username, email });
    res.json({ ok: true, ...(await otp.issue({ purpose: 'register', email })) });
  });
  api.post('/register', strict, async (req, res) => {
    const { username, email, password, confirmPassword, code } = body(req);
    require_('username', username); require_('email', email); require_('password', password);
    if (password !== confirmPassword) throw new HttpError(400, 'Passwords do not match.', { field: 'confirmPassword' });
    assertFree({ username, email });
    otp.verify(otp.find('register', email), 'register', code); // consumes the code
    const hash = await bcrypt.hash(password, BCRYPT_COST);
    try {
      db.prepare('INSERT INTO users (username, email, password_hash, created_at) VALUES (?, ?, ?, ?)').run(username, email.toLowerCase(), hash, Date.now());
    } catch (e) { if (String(e.code).startsWith('SQLITE_CONSTRAINT')) throw new HttpError(409, 'That username or email is already registered.'); throw e; }
    res.status(201).json({ ok: true });
  });

  // ---- Login (password, then emailed OTP) ------------------------------
  api.post('/login', strict, async (req, res) => {
    const { identifier, password } = body(req);
    if (typeof identifier !== 'string' || typeof password !== 'string' || !identifier || !password || password.length > 200)
      throw new HttpError(400, 'Enter your username or email and your password.');
    const lookup = identifier.trim();
    const user = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(lookup, lookup.toLowerCase());
    const t = Date.now();
    if (user && user.locked_until > t) throw new HttpError(429, 'Too many failed attempts. This account is locked for a few minutes.', { retryAfter: Math.ceil((user.locked_until - t) / 1000) });
    const ok = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);
    if (!user || !ok) {
      if (user) {
        const fails = user.failed_logins + 1;
        db.prepare('UPDATE users SET failed_logins = ?, locked_until = ? WHERE id = ?').run(fails >= 5 ? 0 : fails, fails >= 5 ? t + 15 * 60e3 : 0, user.id);
      }
      throw new HttpError(401, 'Incorrect username/email or password.');
    }
    db.prepare('UPDATE users SET failed_logins = 0, locked_until = 0 WHERE id = ?').run(user.id);
    const token = crypto.randomBytes(24).toString('base64url');
    const sent = await otp.issue({ purpose: 'login', email: user.email, userId: user.id, token }); // always the registered email
    res.json({ ok: true, challenge: token, email: mask(user.email), ...sent });
  });
  api.post('/login/verify', strict, (req, res) => {
    const { challenge, code, remember } = body(req);
    const row = otp.findByToken(challenge);
    otp.verify(row, 'login', code);
    createSession(req, res, row.user_id, remember === true);
    res.json({ ok: true, redirect: '/dashboard' });
  });
  api.post('/login/resend', strict, async (req, res) => {
    const row = otp.findByToken(body(req).challenge);
    if (!row || row.used_at) throw new HttpError(400, 'This sign-in expired. Please log in again.');
    res.json({ ok: true, ...(await otp.issue({ purpose: 'login', email: row.email, userId: row.user_id, token: body(req).challenge })) });
  });

  // ---- Password reset --------------------------------------------------
  api.post('/forgot', strict, async (req, res) => {
    const { email } = body(req);
    require_('email', email);
    const user = db.prepare('SELECT id, email FROM users WHERE email = ?').get(email);
    if (user) {
      try { await otp.issue({ purpose: 'reset', email: user.email, userId: user.id }); }
      catch (e) { if (e.status !== 429) throw e; } // stay generic when throttled
    }
    res.json({ ok: true, cooldown: config.otp.cooldownSec }); // same answer whether or not the account exists
  });
  api.post('/reset', strict, async (req, res) => {
    const { email, code, password, confirmPassword } = body(req);
    require_('email', email); require_('password', password);
    if (password !== confirmPassword) throw new HttpError(400, 'Passwords do not match.', { field: 'confirmPassword' });
    const row = otp.find('reset', email);
    otp.verify(row, 'reset', code);
    const hash = await bcrypt.hash(password, BCRYPT_COST);
    db.transaction(() => {
      db.prepare('UPDATE users SET password_hash = ?, failed_logins = 0, locked_until = 0 WHERE id = ?').run(hash, row.user_id);
      db.prepare('DELETE FROM sessions WHERE user_id = ?').run(row.user_id); // sign out everywhere
    })();
    res.json({ ok: true });
  });

  // ---- Session ---------------------------------------------------------
  api.get('/me', requireAuth, (req, res) => {
    const u = req.user;
    res.set('Cache-Control', 'no-store').json({ username: u.username, email: u.email,
      loginAt: new Date(u.login_at).toISOString(), sessionExpiresAt: new Date(u.expires_at).toISOString(), memberSince: new Date(u.member_since).toISOString() });
  });
  api.post('/logout', (req, res) => { destroySession(req, res); res.json({ ok: true }); });
  app.use('/api/auth', api);
  app.use('/api', (_req, _res, next) => next(new HttpError(404, 'Not found.')));

  // ---- Pages (access decided on the server, never in the browser) ------
  const pub = path.join(__dirname, '..', 'public');
  const page = (name, { auth }) => (req, res) => {
    const signedIn = Boolean(currentSession(req));
    if (auth && !signedIn) return res.redirect('/login');
    if (!auth && signedIn) return res.redirect('/dashboard');
    res.set('Cache-Control', 'no-store').sendFile(path.join(pub, `${name}.html`));
  };
  app.get('/', (req, res) => res.redirect(currentSession(req) ? '/dashboard' : '/login'));
  for (const p of ['login', 'register', 'forgot']) app.get(`/${p}`, page(p, { auth: false }));
  app.get('/dashboard', page('dashboard', { auth: true }));
  app.use('/assets', express.static(path.join(pub, 'assets')));
  app.get('/config.json', (_req, res) => res.json({ appName: config.appName }));

  app.use((_req, res) => res.status(404).type('text').send('Not found'));
  app.use((err, _req, res, _next) => {
    if (err instanceof HttpError) return res.status(err.status).json({ error: err.message, ...err.extra });
    if (err.type === 'entity.parse.failed' || err.type === 'entity.too.large') return res.status(400).json({ error: 'Invalid request.' });
    console.error('Unhandled error:', err.message);
    res.status(500).json({ error: 'Something went wrong on our side. Try again.' });
  });

  // Housekeeping: purge expired sessions and old codes hourly.
  setInterval(() => {
    db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(Date.now());
    db.prepare('DELETE FROM otps WHERE expires_at < ?').run(Date.now() - 24 * 3600e3);
  }, 3600e3).unref();
  return app;
}
module.exports = { createApp };
