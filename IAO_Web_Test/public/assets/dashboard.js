const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
const utc = (iso) => `${fmt.format(new Date(iso))} UTC`;

(async () => {
  try {
    const me = await api('/me', null, 'GET');
    $('#email').textContent = me.email; $('#who').textContent = `@${me.username}`;
    $('#login-time').textContent = utc(me.loginAt); $('#login-time').dateTime = me.loginAt;
    $('#i-username').textContent = me.username; $('#i-email').textContent = me.email;
    $('#i-since').textContent = utc(me.memberSince); $('#i-expires').textContent = utc(me.sessionExpiresAt);
    $('#content').hidden = false;
  } catch (err) { location.assign('/login'); }
})();
$('#logout').addEventListener('click', async (e) => {
  await busy(e.currentTarget, () => api('/logout').catch(() => {}));
  location.assign('/login');
});
