const crypto = require('crypto');
const config = require('./config');

class HttpError extends Error {
  constructor(status, message, extra = {}) { super(message); this.status = status; this.extra = extra; }
}
const sha256 = (v) => crypto.createHash('sha256').update(v).digest('hex');
const hmac = (v) => crypto.createHmac('sha256', config.secret).update(v).digest('hex');
const safeEqual = (a, b) => a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));

const validators = {
  username: (v) => typeof v === 'string' && /^[A-Za-z0-9_]{3,24}$/.test(v),
  email: (v) => typeof v === 'string' && v.length <= 254 && /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/.test(v),
  // bcrypt only uses the first 72 bytes, so cap there.
  password: (v) => typeof v === 'string' && v.length >= 10 && Buffer.byteLength(v) <= 72 && /[A-Za-z]/.test(v) && /\d/.test(v),
};
const messages = {
  username: 'Username must be 3–24 characters: letters, numbers or underscores.',
  email: 'Enter a valid email address.',
  password: 'Password must be 10–72 characters and include at least one letter and one number.',
};
function require_(field, value) { if (!validators[field](value)) throw new HttpError(400, messages[field], { field }); }

module.exports = { HttpError, sha256, hmac, safeEqual, require_ };
