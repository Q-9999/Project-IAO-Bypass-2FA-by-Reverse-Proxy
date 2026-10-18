const form = $('#register-form'), msg = $('#msg'), sendBtn = $('#send-code');
const fields = () => ({ username: form.username.value.trim(), email: form.email.value.trim() });

sendBtn.addEventListener('click', async () => {
  notify(msg, '', ''); const { username, email } = fields();
  if (!username || !email) return notify(msg, 'error', 'Enter a username and an email address first.');
  try {
    const d = await busy(sendBtn, () => api('/register/send-code', { username, email }));
    countdown(sendBtn, d.cooldown, 'Send verification code'); form.code.focus();
    notify(msg, 'success', `Code sent to ${email}. It expires in ${Math.round(d.expiresIn / 60)} minutes.`);
  } catch (err) {
    if (err.data?.retryAfter && err.data.retryAfter < 3600) countdown(sendBtn, err.data.retryAfter, 'Send verification code');
    notify(msg, 'error', err.message);
  }
});
form.addEventListener('submit', async (e) => {
  e.preventDefault(); notify(msg, '', '');
  const { username, email } = fields(), password = form.password.value, confirmPassword = form.confirmPassword.value, code = form.code.value;
  if (password !== confirmPassword) return notify(msg, 'error', 'Passwords do not match.');
  if (!/^\d{6}$/.test(code)) return notify(msg, 'error', 'Enter the 6-digit code sent to your email.');
  try {
    await busy($('#register-btn'), () => api('/register', { username, email, password, confirmPassword, code }));
    location.assign('/login?registered=1');
  } catch (err) { notify(msg, 'error', err.message); }
});
