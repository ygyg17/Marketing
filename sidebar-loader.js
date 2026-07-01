// ═══ sidebar-loader.js ═══
// Cara pakai di tiap page:
// 1. Taruh <div id="sidebar-container"></div> di awal <div class="app-shell">
// 2. Load script ini paling akhir sebelum </body>: <script src="sidebar-loader.js"></script>

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
    // Highlight menu aktif berdasarkan nama file halaman saat ini
    var currentFile = window.location.pathname.split('/').pop().replace('.html', '') || 'task';
    document.querySelectorAll('.sidebar-link').forEach(function (link) {
      if (link.getAttribute('data-page') === currentFile) {
        link.classList.add('active');
      }
    });

    // Toggle sidebar mobile
    var sidebar = document.getElementById('sidebar');
    var menuBtn = document.getElementById('sidebarMenuBtn');
    var overlay = document.getElementById('sidebarOverlay');
    if (!sidebar || !menuBtn || !overlay) return;

    function openSidebar() { sidebar.classList.add('open'); overlay.classList.add('show'); }
    function closeSidebar() { sidebar.classList.remove('open'); overlay.classList.remove('show'); }

    menuBtn.addEventListener('click', function () {
      sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
    });
    overlay.addEventListener('click', closeSidebar);
    document.querySelectorAll('.sidebar-link').forEach(function (link) {
      link.addEventListener('click', closeSidebar);
    });
  }
})();
