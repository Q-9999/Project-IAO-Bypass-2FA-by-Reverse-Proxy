// Shared helpers for every page. No framework needed.
const $ = (sel, root = document) => root.querySelector(sel);

async function api(path, body, method = 'POST') {
  let res;
  try {
    res = await fetch('/api/auth' + path, { method, credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  } catch { throw new Error('Can’t reach the server. Check your connection and try again.'); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || 'Something went wrong. Try again.'), { status: res.status, data });
  return data;
}
function notify(el, type, text) { el.className = 'alert ' + type; el.textContent = text; el.hidden = !text; }
async function busy(btn, fn) { // disables a button + shows a spinner while fn runs
  btn.disabled = true; btn.classList.add('loading');
  try { return await fn(); } finally { btn.classList.remove('loading'); if (!btn.dataset.cd) btn.disabled = false; }
}
function countdown(btn, seconds, label) { // "Resend code (42s)"
  clearInterval(btn._timer); let left = Math.ceil(seconds); btn.dataset.cd = '1';
  const tick = () => {
    if (left <= 0) { clearInterval(btn._timer); delete btn.dataset.cd; btn.disabled = false; btn.textContent = label; return; }
    btn.disabled = true; btn.textContent = `${label} (${left--}s)`;
  };
  tick(); btn._timer = setInterval(tick, 1000);
}
document.querySelectorAll('[data-toggle-pw]').forEach((b) => b.addEventListener('click', () => {
  const input = document.getElementById(b.dataset.togglePw), show = input.type === 'password';
  input.type = show ? 'text' : 'password'; b.textContent = show ? 'Hide' : 'Show'; b.setAttribute('aria-pressed', show);
}));
document.querySelectorAll('.code').forEach((i) => i.addEventListener('input', () => { i.value = i.value.replace(/\D/g, '').slice(0, 6); }));
fetch('/config.json').then((r) => r.json()).then(({ appName }) => {
  document.querySelectorAll('.app-name').forEach((n) => { n.textContent = appName; });
  document.title = `${document.title.split(' · ')[0]} · ${appName}`;
}).catch(() => {});
const params = new URLSearchParams(location.search);
