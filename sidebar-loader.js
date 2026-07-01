// ═══ sidebar-loader.js ═══
// Cara pakai di tiap page:
// 1. Pastikan <link rel="stylesheet" href="sidebar.css"> ada di <head>
// 2. Taruh <div id="sidebar-container"></div> + <div class="sidebar-overlay" id="sidebarOverlay"></div>
//    tepat setelah topbar (lihat contoh index.html)
// 3. Tambahkan tombol hamburger dengan id="sidebarMenuBtn" di dalam .topbar (untuk mobile)
// 4. Load script ini paling akhir sebelum </body>: <script src="sidebar-loader.js"></script>
// 5. Opsional: set <body data-active-page="task"> kalau nama file bukan task.html/design.html/dst
//    (misal disimpan sebagai index.html)

(function () {
  var container = document.getElementById('sidebar-container');
  if (!container) return;

  fetch('sidebar.html')
    .then(function (res) {
      if (!res.ok) throw new Error('Gagal load sidebar.html (' + res.status + ')');
      return res.text();
    })
    .then(function (html) {
      container.innerHTML = html;
      initSidebar();
    })
    .catch(function (err) {
      console.error(err);
      container.innerHTML = '<div style="padding:16px;font-size:12px;color:#b91c1c;">Sidebar gagal dimuat.</div>';
    });

  function initSidebar() {
    // Highlight menu aktif: prioritas ke atribut body[data-active-page],
    // fallback ke nama file di URL (berguna kalau file disimpan sebagai index.html)
    var currentFile = document.body.getAttribute('data-active-page')
      || window.location.pathname.split('/').pop().replace('.html', '')
      || 'task';

    document.querySelectorAll('.sidebar-link').forEach(function (link) {
      if (link.getAttribute('data-page') === currentFile) {
        link.classList.add('active');
      }
    });

    // Toggle sidebar mobile — tombol & overlay ada di halaman utama (topbar)
    var sidebar = document.getElementById('sidebar');
    var menuBtn = document.getElementById('sidebarMenuBtn');
    var overlay = document.getElementById('sidebarOverlay');
    if (!sidebar) return;

    function openSidebar() { sidebar.classList.add('open'); if (overlay) overlay.classList.add('show'); }
    function closeSidebar() { sidebar.classList.remove('open'); if (overlay) overlay.classList.remove('show'); }

    if (menuBtn) {
      menuBtn.addEventListener('click', function () {
        sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
      });
    }
    if (overlay) overlay.addEventListener('click', closeSidebar);

    document.querySelectorAll('.sidebar-link').forEach(function (link) {
      link.addEventListener('click', closeSidebar);
    });
  }
})();
