const form = $('#forgot-form'), msg = $('#msg'), sendBtn = $('#send-code');
sendBtn.addEventListener('click', async () => {
  notify(msg, '', ''); const email = form.email.value.trim();
  if (!email) return notify(msg, 'error', 'Enter your email address first.');
  try {
    const d = await busy(sendBtn, () => api('/forgot', { email }));
    countdown(sendBtn, d.cooldown, 'Send verification code'); form.code.focus();
    notify(msg, 'success', 'If an account exists for that email, a code is on its way.');
  } catch (err) { notify(msg, 'error', err.message); }
});
form.addEventListener('submit', async (e) => {
  e.preventDefault(); notify(msg, '', '');
  const body = { email: form.email.value.trim(), code: form.code.value, password: form.password.value, confirmPassword: form.confirmPassword.value };
  if (body.password !== body.confirmPassword) return notify(msg, 'error', 'Passwords do not match.');
  try { await busy($('#reset-btn'), () => api('/reset', body)); location.assign('/login?reset=1'); }
  catch (err) { notify(msg, 'error', err.message); }
});
