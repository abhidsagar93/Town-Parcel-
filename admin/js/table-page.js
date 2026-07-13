/* ============================================================
   Town Parcel Admin — Generic Table Page Engine
   Powers bookings.html, partners.html, riders.html, messages.html
   via a small config object passed to initTablePage().
   ============================================================ */

let TP_STATE = {
  allRows: [],
  filteredRows: [],
  page: 1,
  pageSize: 10,
  sortKey: null,
  sortDir: 'desc',
  config: null
};

function tpGet(row, key){
  return row[key];
}

async function initTablePage(config){
  TP_STATE.config = config;

  document.getElementById('pageTitle').textContent = config.title;
  document.getElementById('pageSub').textContent = config.subtitle;

  // Build status filter options
  const statusFilterEl = document.getElementById('statusFilter');
  statusFilterEl.innerHTML = '<option value="">All Statuses</option>' +
    config.statusOptions.map(s => `<option value="${s}">${s.replace(/_/g,' ')}</option>`).join('');

  document.getElementById('searchInput').addEventListener('input', debounce(applyFilters, 250));
  statusFilterEl.addEventListener('change', applyFilters);
  document.getElementById('exportBtn').addEventListener('click', exportCsv);
  const excelBtn = document.getElementById('exportExcelBtn');
  if(excelBtn) excelBtn.addEventListener('click', exportExcel);
  document.getElementById('refreshBtn').addEventListener('click', loadRows);

  await loadRows();
}

async function loadRows(){
  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = `<tr><td colspan="20"><div class="skel skel-line" style="width:100%;"></div></td></tr>`;

  try{
    const { data, error } = await sb.from(TP_STATE.config.tableName)
      .select('*')
      .order('created_at', { ascending: false });
    if(error) throw error;

    TP_STATE.allRows = data;
    applyFilters();
    showToast(`Loaded ${data.length} record(s)`, 'success');
  }catch(err){
    console.error('Load failed:', err);
    tbody.innerHTML = `<tr class="empty-row"><td colspan="20">Could not load data. Check your connection and try refreshing.</td></tr>`;
    showToast('Failed to load data — check your connection', 'error');
  }
}

function applyFilters(){
  const config = TP_STATE.config;
  const search = document.getElementById('searchInput').value.trim().toLowerCase();
  const status = document.getElementById('statusFilter').value;

  let rows = TP_STATE.allRows.slice();

  if(status){
    rows = rows.filter(r => (r[config.statusField] || '').toLowerCase() === status.toLowerCase());
  }

  if(search){
    rows = rows.filter(r =>
      config.searchFields.some(f => (r[f] || '').toString().toLowerCase().includes(search))
    );
  }

  if(TP_STATE.sortKey){
    rows.sort((a,b)=>{
      const av = a[TP_STATE.sortKey] || '';
      const bv = b[TP_STATE.sortKey] || '';
      if(av < bv) return TP_STATE.sortDir === 'asc' ? -1 : 1;
      if(av > bv) return TP_STATE.sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }

  TP_STATE.filteredRows = rows;
  TP_STATE.page = 1;
  renderTable();
}

function sortBy(key){
  if(TP_STATE.sortKey === key){
    TP_STATE.sortDir = TP_STATE.sortDir === 'asc' ? 'desc' : 'asc';
  }else{
    TP_STATE.sortKey = key;
    TP_STATE.sortDir = 'asc';
  }
  applyFilters();
}

function renderTable(){
  const config = TP_STATE.config;
  const thead = document.getElementById('tableHead');
  const tbody = document.getElementById('tableBody');

  // Header
  thead.innerHTML = '<tr>' + config.columns.map(c => {
    const arrow = TP_STATE.sortKey === c.key ? (TP_STATE.sortDir === 'asc' ? ' <span class="arrow">&#9650;</span>' : ' <span class="arrow">&#9660;</span>') : '';
    return `<th onclick="sortBy('${c.key}')">${escapeHtml(c.label)}${arrow}</th>`;
  }).join('') + '<th class="no-sort">Actions</th></tr>';

  const start = (TP_STATE.page - 1) * TP_STATE.pageSize;
  const pageRows = TP_STATE.filteredRows.slice(start, start + TP_STATE.pageSize);

  if(pageRows.length === 0){
    tbody.innerHTML = `<tr class="empty-row"><td colspan="${config.columns.length+1}">No records match your search/filter.</td></tr>`;
  }else{
    tbody.innerHTML = pageRows.map(row => renderRow(row)).join('');
  }

  renderPagination();
}

function renderRow(row){
  const config = TP_STATE.config;
  const cells = config.columns.map(c => {
    let val = row[c.key];
    if(c.type === 'date'){
      return `<td>${formatDateTime(val)}</td>`;
    }
    if(c.type === 'status'){
      return `<td><span class="badge ${statusBadgeClass(val)}">${escapeHtml(val || 'pending')}</span></td>`;
    }
    if(c.type === 'money'){
      return `<td>${val !== null && val !== undefined ? '₹' + val : '—'}</td>`;
    }
    return `<td>${escapeHtml(val)}</td>`;
  }).join('');

  const quickLinks = config.quickLinks ? config.quickLinks(row).map(l =>
    `<a class="quick-link" href="${l.href}" target="_blank" title="${l.label}">${l.icon}</a>`
  ).join('') : '';

  const extraActions = config.extraRowActions ? config.extraRowActions(row) : '';

  const statusOptionsHtml = config.statusOptions.map(s =>
    `<option value="${s}" ${((row[config.statusField]||'').toLowerCase()===s.toLowerCase()) ? 'selected':''}>${s.replace(/_/g,' ')}</option>`
  ).join('');

  return `<tr>
    ${cells}
    <td>
      <div class="cell-actions">
        <select class="status-select" onchange="quickStatusChange('${row[config.idField]}', this.value)">
          ${statusOptionsHtml}
        </select>
        ${quickLinks}
        ${extraActions}
        <button class="btn btn-sm btn-outline" onclick="openViewModal('${row[config.idField]}')">View</button>
        <button class="btn btn-sm btn-dark" onclick="openEditModal('${row[config.idField]}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteRow('${row[config.idField]}')">Delete</button>
      </div>
    </td>
  </tr>`;
}

function renderPagination(){
  const total = TP_STATE.filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(total / TP_STATE.pageSize));
  if(TP_STATE.page > totalPages) TP_STATE.page = totalPages;

  const el = document.getElementById('paginationBar');
  const start = total === 0 ? 0 : (TP_STATE.page - 1) * TP_STATE.pageSize + 1;
  const end = Math.min(TP_STATE.page * TP_STATE.pageSize, total);

  let btns = '';
  for(let p=1; p<=totalPages; p++){
    if(p === 1 || p === totalPages || Math.abs(p - TP_STATE.page) <= 1){
      btns += `<button class="btn btn-sm ${p===TP_STATE.page?'btn-gold':'btn-outline'}" onclick="goToPage(${p})">${p}</button>`;
    }else if(Math.abs(p - TP_STATE.page) === 2){
      btns += `<span class="text-muted">…</span>`;
    }
  }

  el.innerHTML = `
    <div class="info">Showing ${start}–${end} of ${total}</div>
    <div class="page-btns">${btns}</div>
  `;
}

function goToPage(p){
  TP_STATE.page = p;
  renderTable();
}

async function quickStatusChange(id, newStatus){
  const config = TP_STATE.config;
  try{
    const { error } = await sb.from(config.tableName)
      .update({ [config.statusField]: newStatus })
      .eq(config.idField, id);
    if(error) throw error;

    const row = TP_STATE.allRows.find(r => String(r[config.idField]) === String(id));
    if(row) row[config.statusField] = newStatus;
    showToast('Status updated', 'success');
    applyFilters();
  }catch(err){
    console.error('Status update failed:', err);
    showToast('Could not update status — check your connection', 'error');
    applyFilters();
  }
}

async function deleteRow(id){
  const config = TP_STATE.config;
  if(!confirm('Delete this record permanently? This cannot be undone.')) return;

  try{
    const { error } = await sb.from(config.tableName).delete().eq(config.idField, id);
    if(error) throw error;

    TP_STATE.allRows = TP_STATE.allRows.filter(r => String(r[config.idField]) !== String(id));
    showToast('Record deleted', 'success');
    applyFilters();
  }catch(err){
    console.error('Delete failed:', err);
    showToast('Could not delete — check your connection', 'error');
  }
}

/* ---------- VIEW MODAL (read-only) ---------- */
function openViewModal(id){
  const config = TP_STATE.config;
  const row = TP_STATE.allRows.find(r => String(r[config.idField]) === String(id));
  if(!row) return;

  const body = document.getElementById('viewModalBody');
  body.innerHTML = Object.keys(row).map(key => `
    <div class="modal-field">
      <label>${escapeHtml(key.replace(/_/g,' '))}</label>
      <input class="readonly" value="${escapeHtml(row[key])}" readonly>
    </div>
  `).join('');

  document.getElementById('viewModalOverlay').classList.add('show');
}
function closeViewModal(){
  document.getElementById('viewModalOverlay').classList.remove('show');
}

/* ---------- EDIT MODAL ---------- */
function openEditModal(id){
  const config = TP_STATE.config;
  const row = TP_STATE.allRows.find(r => String(r[config.idField]) === String(id));
  if(!row) return;

  document.getElementById('editModalId').value = id;
  const body = document.getElementById('editModalBody');

  body.innerHTML = config.editableFields.map(f => {
    const val = row[f.key] !== null && row[f.key] !== undefined ? row[f.key] : '';
    if(f.type === 'textarea'){
      return `<div class="modal-field full">
        <label>${escapeHtml(f.label)}</label>
        <textarea id="ef_${f.key}">${escapeHtml(val)}</textarea>
      </div>`;
    }
    if(f.type === 'select'){
      const opts = f.options.map(o => `<option value="${o}" ${o.toLowerCase()===String(val).toLowerCase()?'selected':''}>${o.replace(/_/g,' ')}</option>`).join('');
      return `<div class="modal-field">
        <label>${escapeHtml(f.label)}</label>
        <select id="ef_${f.key}">${opts}</select>
      </div>`;
    }
    return `<div class="modal-field">
      <label>${escapeHtml(f.label)}</label>
      <input type="${f.type || 'text'}" id="ef_${f.key}" value="${escapeHtml(val)}">
    </div>`;
  }).join('');

  document.getElementById('editModalOverlay').classList.add('show');
}
function closeEditModal(){
  document.getElementById('editModalOverlay').classList.remove('show');
}

async function saveEditModal(){
  const config = TP_STATE.config;
  const id = document.getElementById('editModalId').value;
  const update = {};
  config.editableFields.forEach(f => {
    const el = document.getElementById('ef_' + f.key);
    update[f.key] = el.value;
  });

  const saveBtn = document.getElementById('editSaveBtn');
  const originalText = saveBtn.innerHTML;
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<span class="spinner"></span> Saving...';

  try{
    const { error } = await sb.from(config.tableName).update(update).eq(config.idField, id);
    if(error) throw error;

    const row = TP_STATE.allRows.find(r => String(r[config.idField]) === String(id));
    if(row) Object.assign(row, update);

    showToast('Changes saved', 'success');
    closeEditModal();
    applyFilters();
  }catch(err){
    console.error('Save failed:', err);
    showToast('Could not save changes — check your connection', 'error');
  }finally{
    saveBtn.disabled = false;
    saveBtn.innerHTML = originalText;
  }
}

/* ---------- CSV EXPORT ---------- */
function exportCsv(){
  const config = TP_STATE.config;
  const columns = config.columns.map(c => ({ key: c.key, label: c.label }));
  exportRowsToCsv(TP_STATE.filteredRows, columns, config.csvFilename);
}

/* ---------- EXCEL EXPORT ---------- */
function exportExcel(){
  const config = TP_STATE.config;
  const columns = config.columns.map(c => ({ key: c.key, label: c.label }));
  const filename = config.csvFilename.replace(/\.csv$/i, '.xlsx');
  exportRowsToExcel(TP_STATE.filteredRows, columns, filename, config.title);
}
