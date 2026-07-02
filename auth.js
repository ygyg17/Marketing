// ═══ auth.js ═══
// Cara pakai di TIAP halaman yang mau diproteksi (administration, proposal, design, dst):
// 1. Load auth.js PALING AWAL di <head>, sebelum konten/CSS penting dirender —
//    <script src="config.js"></script>
//    <script src="auth.js"></script>
//    (auth.js akan langsung cek session; kalau tidak valid, redirect ke login.html
//    sebelum user sempat lihat isi halaman)
// 2. Di topbar, taruh <div id="authUserBox"></div> — auth.js akan isi otomatis
//    dengan nama user + tombol Logout.
// 3. Untuk fetch ke GAS backend masing-masing tool (administration, proposal, dst),
//    ganti fetch(GAS_URL, {...}) dengan SeminyakAuth.authFetch(GAS_URL, {...})
//    supaya token ikut terkirim di header X-Auth-Token.

(function () {
  var SESSION_KEY = 'seminyak_session';

  function getSession() {
    var raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      var s = JSON.parse(raw);
      if (!s.token || !s.expiresAt || s.expiresAt <= Date.now()) return null;
      return s;
    } catch (e) { return null; }
  }

  function goToLogin() {
    localStorage.removeItem(SESSION_KEY);
    var here = window.location.pathname.split('/').pop();
    window.location.href = 'login.html?redirect=' + encodeURIComponent(here || 'index.html');
  }

  var session = getSession();
  if (!session) {
    goToLogin();
    return; // stop di sini, halaman akan redirect
  }

  // ─── Render user box + logout di topbar ───
  function renderUserBox() {
    var box = document.getElementById('authUserBox');
    if (!box) return;
    box.innerHTML =
      '<div style="display:flex;align-items:center;gap:10px;margin-left:auto;">' +
        '<span style="font-family:\'JetBrains Mono\',monospace;font-size:11px;font-weight:600;color:var(--ink-2);">' + escapeHtml_(session.name || session.username) + '</span>' +
        '<button id="authLogoutBtn" style="font-family:\'JetBrains Mono\',monospace;font-size:10px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;padding:5px 11px;border-radius:6px;border:1px solid var(--line);background:var(--surface);color:var(--muted);cursor:pointer;">Logout</button>' +
      '</div>';
    document.getElementById('authLogoutBtn').addEventListener('click', logout);
  }

  function logout() {
    var authUrl = (typeof CONFIG !== 'undefined' && CONFIG.AUTH_GAS_WEB_APP_URL) || '';
    var token = session.token;
    localStorage.removeItem(SESSION_KEY);
    if (authUrl) {
      fetch(authUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'logout', token: token })
      }).catch(function () {});
    }
    window.location.href = 'login.html';
  }

  function escapeHtml_(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // ─── Wrapper fetch: otomatis lampirkan token, otomatis logout kalau 401/expired ───
  // PENTING: token dikirim lewat body (POST) atau query string (GET), BUKAN custom
  // header — custom header memicu CORS preflight (OPTIONS) yang tidak ditangani GAS
  // dengan baik, sama seperti alasan project lain pakai Content-Type: text/plain.
  function authFetch(url, options) {
    options = options || {};
    var method = (options.method || 'GET').toUpperCase();

    if (method === 'GET') {
      var sep = url.indexOf('?') === -1 ? '?' : '&';
      url = url + sep + 'token=' + encodeURIComponent(session.token);
    } else if (options.body) {
      try {
        var parsed = JSON.parse(options.body);
        parsed.token = session.token;
        options.body = JSON.stringify(parsed);
      } catch (e) { /* body bukan JSON, biarkan apa adanya */ }
    }

    return fetch(url, options).then(function (res) {
      return res.json().then(function (data) {
        if (data && data.authError) {
          goToLogin();
          throw new Error('Session expired');
        }
        return data;
      });
    });
  }

  // Cek ulang tiap 60 detik kalau-kalau expired saat halaman terbuka lama
  setInterval(function () {
    if (!getSession()) goToLogin();
  }, 60000);

  document.addEventListener('DOMContentLoaded', renderUserBox);
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    renderUserBox();
  }

  window.SeminyakAuth = {
    session: session,
    authFetch: authFetch,
    logout: logout
  };
})();
