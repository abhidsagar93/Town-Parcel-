/* ============================================================
   Town Parcel Admin — Shared UI Utilities
   Toasts, CSV export, formatting helpers, mobile sidebar toggle.
   ============================================================ */

/* ---------- TOASTS ---------- */
function ensureToastHost(){
  let host = document.getElementById('toastHost');
  if(!host){
    host = document.createElement('div');
    host.id = 'toastHost';
    document.body.appendChild(host);
  }
  return host;
}

function showToast(message, type){
  const host = ensureToastHost();
  const el = document.createElement('div');
  el.className = 'toast ' + (type || '');
  el.textContent = message;
  host.appendChild(el);
  setTimeout(()=>{
    el.style.transition = 'opacity .25s, transform .25s';
    el.style.opacity = '0';
    el.style.transform = 'translateY(6px)';
    setTimeout(()=> el.remove(), 250);
  }, 3200);
}

/* ---------- ESCAPING ---------- */
function escapeHtml(str){
  if(str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ---------- DATE FORMATTING ---------- */
function formatDateTime(iso){
  if(!iso) return '—';
  const d = new Date(iso);
  if(isNaN(d)) return '—';
  return d.toLocaleString('en-IN', {
    day:'2-digit', month:'short', year:'numeric',
    hour:'2-digit', minute:'2-digit'
  });
}
function formatDateOnly(iso){
  if(!iso) return '—';
  const d = new Date(iso);
  if(isNaN(d)) return '—';
  return d.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
}

/* ---------- BADGE CLASS FROM STATUS TEXT ---------- */
function statusBadgeClass(status){
  if(!status) return 'badge-pending';
  const key = String(status).toLowerCase().trim().replace(/\s+/g, '_');
  return 'badge-' + key;
}

/* ---------- CSV EXPORT ---------- */
function exportRowsToCsv(rows, columns, filename){
  if(!rows || rows.length === 0){
    showToast('Nothing to export for the current filter.', 'error');
    return;
  }
  const header = columns.map(c => `"${c.label.replace(/"/g,'""')}"`).join(',');
  const lines = rows.map(row =>
    columns.map(c => {
      let val = row[c.key];
      if(val === null || val === undefined) val = '';
      return `"${String(val).replace(/"/g,'""')}"`;
    }).join(',')
  );
  const csv = [header, ...lines].join('\r\n');
  const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast(`Exported ${rows.length} row(s) to ${filename}`, 'success');
}

/* ---------- DEBOUNCE ---------- */
function debounce(fn, wait){
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(()=> fn(...args), wait);
  };
}

/* ---------- MOBILE SIDEBAR TOGGLE ---------- */
function initMobileSidebar(){
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const openBtn = document.getElementById('mobileMenuBtn');
  if(!sidebar || !overlay || !openBtn) return;

  function open(){ sidebar.classList.add('open'); overlay.classList.add('show'); }
  function close(){ sidebar.classList.remove('open'); overlay.classList.remove('show'); }

  openBtn.addEventListener('click', open);
  overlay.addEventListener('click', close);
}

document.addEventListener('DOMContentLoaded', initMobileSidebar);
