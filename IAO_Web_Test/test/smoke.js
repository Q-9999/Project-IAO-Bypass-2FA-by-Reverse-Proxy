// End-to-end check: real HTTP server + real SQLite + real SMTP delivery to a local capture server.
process.env.SESSION_SECRET = 'test-secret-'.padEnd(48, 'x');
process.env.DATABASE_PATH = ':memory:';
process.env.SMTP_HOST = '127.0.0.1'; process.env.SMTP_PORT = '2526'; process.env.MAIL_FROM = 'Test <t@example.com>';
process.env.RATE_LIMIT_STRICT = '1000'; process.env.RATE_LIMIT_GENERAL = '1000';
const assert = require('assert');
const { SMTPServer } = require('smtp-server');

const inbox = [];
const smtp = new SMTPServer({ authOptional: true, disabledCommands: ['STARTTLS', 'AUTH'], onData(stream, _s, cb) {
  let raw = ''; stream.on('data', (c) => (raw += c)); stream.on('end', () => { inbox.push(raw); cb(); });
} });
const lastCode = () => inbox.at(-1).match(/Code: (\d{6})/)[1];

(async () => {
  await new Promise((r) => smtp.listen(2526, '127.0.0.1', r));
  const server = require('../src/app').createApp().listen(0);
  const base = `http://127.0.0.1:${server.address().port}`;
  let cookie = '';
  const call = async (path, body, method = 'POST') => {
    const res = await fetch(base + path, { method, redirect: 'manual', headers: { 'Content-Type': 'application/json', cookie }, body: body && JSON.stringify(body) });
    const sc = res.headers.get('set-cookie'); if (sc) cookie = sc.split(';')[0];
    return { status: res.status, data: await res.json().catch(() => ({})), res };
  };
  const ok = (n) => console.log('  ✓', n);
  const u = { username: 'alice_1', email: 'Alice@Example.com', password: 'correct horse 9' };

  assert.equal((await call('/dashboard', null, 'GET')).status, 302); ok('dashboard redirects when logged out');
  assert.equal((await call('/api/auth/me', null, 'GET')).status, 401); ok('/me requires auth');

  let r = await call('/api/auth/register/send-code', u); assert.equal(r.status, 200); assert.equal(inbox.length, 1); ok('registration code delivered over SMTP');
  assert.equal((await call('/api/auth/register/send-code', u)).status, 429); ok('resend cooldown enforced');
  const reg = { ...u, confirmPassword: u.password };
  assert.equal((await call('/api/auth/register', { ...reg, code: '000000' })).status, 400); ok('wrong registration code rejected');
  assert.equal((await call('/api/auth/register', { ...reg, confirmPassword: 'nope', code: lastCode() })).status, 400); ok('password mismatch rejected');
  const regCode = lastCode();
  assert.equal((await call('/api/auth/register', { ...reg, code: regCode })).status, 201); ok('account created');
  assert.equal((await call('/api/auth/register', { ...reg, code: regCode })).status, 409); ok('duplicate / reused code rejected');

  assert.equal((await call('/api/auth/login', { identifier: 'alice_1', password: 'wrong-password1' })).status, 401); ok('bad password rejected');
  r = await call('/api/auth/login', { identifier: 'ALICE@example.com', password: u.password }); assert.equal(r.status, 200);
  assert.equal(inbox.length, 2); assert.ok(inbox[1].includes('To: alice@example.com')); ok('login OTP sent to registered email only');
  assert.equal((await call('/api/auth/me', null, 'GET')).status, 401); ok('password alone does not authenticate');
  const challenge = r.data.challenge, code = lastCode();
  const wrong = code === '123456' ? '654321' : '123456';
  assert.equal((await call('/api/auth/login/verify', { challenge, code: wrong })).status, 400); ok('wrong login code rejected');
  assert.equal((await call('/api/auth/login/verify', { challenge, code })).status, 200); ok('correct code signs in');
  assert.equal((await call('/api/auth/login/verify', { challenge, code })).status, 400); ok('used login code rejected');
  r = await call('/api/auth/me', null, 'GET'); assert.equal(r.data.email, 'alice@example.com'); assert.ok(r.data.loginAt); ok('/me returns the signed-in user');
  assert.equal((await call('/dashboard', null, 'GET')).status, 200); ok('dashboard served when logged in');
  await call('/api/auth/logout'); cookie = '';
  assert.equal((await call('/api/auth/me', null, 'GET')).status, 401); ok('logout invalidates session');

  server.close(); smtp.close(); console.log('All checks passed.'); process.exit(0);
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
