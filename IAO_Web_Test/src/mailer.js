const nodemailer = require('nodemailer');
const config = require('./config');
const { HttpError } = require('./util');

const s = config.smtp;
const configured = Boolean(s.host && s.from);
let transport;
const getTransport = () => (transport ||= nodemailer.createTransport({
  host: s.host, port: s.port, secure: s.secure, requireTLS: config.prod && !s.secure,
  auth: s.user ? { user: s.user, pass: s.pass } : undefined,
}));

const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const TITLES = { register: 'Verify your email', login: 'Your sign-in code', reset: 'Reset your password' };

function render(purpose, code, minutes) {
  const app = config.appName, title = TITLES[purpose];
  const text = `${app}: ${title}\n\nCode: ${code}\n\nThis code expires in ${minutes} minutes.\nNever share it with anyone. ${app} staff will never ask for it.\nIf you did not request this, you can ignore this email.`;
  const html = `<!doctype html><html><body style="margin:0;background:#eef3f3;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#10242e">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="440" style="max-width:440px;background:#fff;border:1px solid #d3dde0;border-radius:10px">
<tr><td style="padding:28px 32px 8px;font:700 20px Georgia,serif">${esc(app)}</td></tr>
<tr><td style="padding:0 32px"><p style="font-size:16px;margin:12px 0">${esc(title)}. Enter this code to continue:</p>
<p style="font:700 34px/1 Consolas,monospace;letter-spacing:8px;background:#eef3f3;border-radius:8px;padding:18px;text-align:center;margin:16px 0">${esc(code)}</p>
<p style="font-size:14px;margin:0 0 16px">This code expires in <b>${minutes} minutes</b> and works once.</p></td></tr>
<tr><td style="padding:16px 32px 28px;font-size:13px;color:#52666f;border-top:1px solid #e3eaec">Security notice: never share this code with anyone. ${esc(app)} will never ask you for it. If you didn’t request it, ignore this email — your account is safe.</td></tr>
</table></td></tr></table></body></html>`;
  return { subject: `${code} is your ${app} code`, text, html };
}

async function sendOtpMail(to, purpose, code, minutes) {
  if (!configured) throw new HttpError(503, 'Email delivery is not configured on the server. Set the SMTP_* variables in .env (see README).');
  try {
    await getTransport().sendMail({ from: s.from, to, ...render(purpose, code, minutes) });
  } catch (err) {
    console.error('Email delivery failed:', err.code || err.message); // never log the code
    throw new HttpError(502, 'We couldn’t send the email. Try again in a moment.');
  }
}
module.exports = { sendOtpMail, configured };
