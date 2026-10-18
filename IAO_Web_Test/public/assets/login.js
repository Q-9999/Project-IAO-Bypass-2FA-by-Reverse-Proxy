const form = $('#login-form'), otpForm = $('#otp-form'), msg = $('#msg');
let challenge = null;
if (params.get('registered')) notify(msg, 'success', 'Account created. Log in to continue.');
if (params.get('reset')) notify(msg, 'success', 'Password updated. Log in with your new password.');

form.addEventListener('submit', async (e) => {
  e.preventDefault(); notify(msg, '', '');
  const identifier = form.identifier.value.trim(), password = form.password.value;
  if (!identifier || !password) return notify(msg, 'error', 'Enter your username or email and your password.');
  try {
    const d = await busy($('#login-btn'), () => api('/login', { identifier, password }));
    challenge = d.challenge; form.password.value = '';
    $('#sent-to').textContent = d.email; form.hidden = true; otpForm.hidden = false; otpForm.code.focus();
    countdown($('#resend'), d.cooldown, 'Resend code');
    notify(msg, 'success', 'We emailed you a 6-digit code.');
  } catch (err) { notify(msg, 'error', err.message); }
});
otpForm.addEventListener('submit', async (e) => {
  e.preventDefault(); notify(msg, '', '');
  const code = otpForm.code.value;
  if (!/^\d{6}$/.test(code)) return notify(msg, 'error', 'Enter the 6-digit code from your email.');
  try {
    const d = await busy($('#verify-btn'), () => api('/login/verify', { challenge, code, remember: form.remember.checked }));
    location.assign(d.redirect);
  } catch (err) { notify(msg, 'error', err.message); otpForm.code.select(); }
});
$('#resend').addEventListener('click', async () => {
  notify(msg, '', '');
  try {
    const d = await busy($('#resend'), () => api('/login/resend', { challenge }));
    countdown($('#resend'), d.cooldown, 'Resend code'); notify(msg, 'success', 'A new code is on its way.');
  } catch (err) {
    if (err.data?.retryAfter) countdown($('#resend'), err.data.retryAfter, 'Resend code');
    notify(msg, 'error', err.message);
  }
});
$('#back').addEventListener('click', () => { challenge = null; otpForm.hidden = true; otpForm.code.value = ''; form.hidden = false; notify(msg, '', ''); });
