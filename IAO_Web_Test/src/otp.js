// One-time codes: issue (with cooldown + hourly cap) and verify (with attempt limit, expiry, single use).
const crypto = require('crypto');
const db = require('./db');
const config = require('./config');
const { HttpError, hmac, safeEqual } = require('./util');
const { sendOtpMail } = require('./mailer');
const o = config.otp;

const codeHash = (purpose, email, code) => hmac(`${purpose}:${email.toLowerCase()}:${code}`);
const find = (purpose, email) => db.prepare('SELECT * FROM otps WHERE purpose = ? AND email = ?').get(purpose, email.toLowerCase());
const findByToken = (token) => (typeof token === 'string' && token
  ? db.prepare("SELECT * FROM otps WHERE purpose = 'login' AND token_hash = ?").get(hmac(token)) : undefined);

async function issue({ purpose, email, userId = null, token = null }) {
  email = email.toLowerCase();
  const t = Date.now(), row = find(purpose, email);
  let sent = 1, windowStart = t;
  if (row) {
    const wait = Math.ceil((row.last_sent_at + o.cooldownSec * 1000 - t) / 1000);
    if (wait > 0) {
      if (config.env === 'development' && wait <= 5) {
        throw new HttpError(429, `Please wait ${wait}s before requesting another code.`, { retryAfter: wait });
      }
      if (config.env !== 'development') {
        throw new HttpError(429, `Please wait ${wait}s before requesting another code.`, { retryAfter: wait });
      }
    }
    if (t - row.window_start < 3600e3) {
      if (config.env !== 'development' && row.sent_count >= o.maxPerHour) {
        throw new HttpError(429, 'Too many codes requested. Try again in an hour.', { retryAfter: 3600 });
      }
      sent = row.sent_count + 1; windowStart = row.window_start;
    }
  }
  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0'); // CSPRNG, uniform
  db.prepare(`INSERT INTO otps (purpose, email, user_id, token_hash, code_hash, expires_at, last_sent_at, window_start, sent_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT (purpose, email) DO UPDATE SET user_id = excluded.user_id, token_hash = excluded.token_hash,
      code_hash = excluded.code_hash, expires_at = excluded.expires_at, attempts = 0, used_at = NULL,
      last_sent_at = excluded.last_sent_at, window_start = excluded.window_start, sent_count = excluded.sent_count`)
    .run(purpose, email, userId, token && hmac(token), codeHash(purpose, email, code), t + o.ttlMin * 60e3, t, windowStart, sent);
  try {
    await sendOtpMail(email, purpose, code, o.ttlMin);
  } catch (err) { // nothing was delivered: kill the code and free the cooldown
    db.prepare('UPDATE otps SET used_at = ?, last_sent_at = 0 WHERE purpose = ? AND email = ?').run(t, purpose, email);
    throw err;
  }
  return { cooldown: o.cooldownSec, expiresIn: o.ttlMin * 60 };
}

// Synchronous on purpose: with SQLite this check-and-consume cannot race.
function verify(row, purpose, code) {
  const invalid = new HttpError(400, 'This code is invalid or has expired. Request a new one.');
  if (!row || row.used_at || row.expires_at < Date.now()) throw invalid;
  if (row.attempts >= o.maxAttempts) throw new HttpError(429, 'Too many incorrect attempts. Request a new code.');
  const ok = typeof code === 'string' && /^\d{6}$/.test(code) && safeEqual(codeHash(purpose, row.email, code), row.code_hash);
  if (!ok) {
    db.prepare('UPDATE otps SET attempts = attempts + 1 WHERE id = ?').run(row.id);
    const left = o.maxAttempts - row.attempts - 1;
    throw new HttpError(400, left > 0 ? `Incorrect code. ${left} attempt${left === 1 ? '' : 's'} left.` : 'Incorrect code. Request a new one.');
  }
  if (!db.prepare('UPDATE otps SET used_at = ? WHERE id = ? AND used_at IS NULL').run(Date.now(), row.id).changes) throw invalid;
}
module.exports = { issue, verify, find, findByToken };
