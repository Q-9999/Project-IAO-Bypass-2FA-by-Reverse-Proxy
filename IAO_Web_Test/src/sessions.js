const crypto = require('crypto');
const db = require('./db');
const config = require('./config');
const { HttpError, sha256 } = require('./util');

const HOUR = 3600e3;
function createSession(req, res, userId, remember) {
  const id = crypto.randomBytes(32).toString('base64url'); // fresh id on every login (no fixation)
  const t = Date.now(), ttl = remember ? 30 * 24 * HOUR : 8 * HOUR;
  db.prepare('INSERT INTO sessions (id_hash, user_id, created_at, expires_at, ip, user_agent) VALUES (?, ?, ?, ?, ?, ?)')
    .run(sha256(id), userId, t, t + ttl, req.ip, String(req.get('user-agent') || '').slice(0, 200));
  res.cookie('sid', id, { httpOnly: true, sameSite: 'lax', secure: config.prod, path: '/', ...(remember ? { maxAge: ttl } : {}) });
}
function currentSession(req) {
  const id = req.cookies?.sid;
  if (typeof id !== 'string' || !id) return null;
  const row = db.prepare(`SELECT s.id_hash, s.created_at AS login_at, s.expires_at, u.id, u.username, u.email, u.created_at AS member_since
    FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id_hash = ?`).get(sha256(id));
  if (row && row.expires_at < Date.now()) { destroySession(req); return null; }
  return row || null;
}
function destroySession(req, res) {
  const id = req.cookies?.sid;
  if (typeof id === 'string') db.prepare('DELETE FROM sessions WHERE id_hash = ?').run(sha256(id));
  res?.clearCookie('sid', { httpOnly: true, sameSite: 'lax', secure: config.prod, path: '/' });
}
function requireAuth(req, _res, next) {
  const s = currentSession(req);
  if (!s) throw new HttpError(401, 'Please log in.');
  req.user = s; next();
}
module.exports = { createSession, currentSession, destroySession, requireAuth };
