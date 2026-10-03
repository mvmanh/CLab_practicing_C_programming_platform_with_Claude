import { api } from '../api.js';
import { html, render, $, on, diffBadge, timeAgo, formatDate, pct, avatar, modal, toast } from '../util.js';
import { state, navigate } from '../app.js';

export default async function adminView({ app, query }) {
  if (state.user?.role !== 'admin') { navigate('/', { replace: true }); return; }
  const tab = query.get('tab') || 'users';
  const [ov, us] = await Promise.all([api.get('/api/admin/overview'), api.get('/api/admin/users')]);

  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const k = d.toISOString().slice(0, 10);
    days.push({ k, label: `${d.getUTCDate()}/${d.getUTCMonth() + 1}`, n: ov.perDay[k] || 0 });
  }
  const maxDay = Math.max(1, ...days.map((d) => d.n));

  render(app, html`
    <div class="container">
      <div class="page-head">
        <div><h1>Quản trị</h1><p>Theo dõi tiến độ học tập của sinh viên và thống kê bài tập.</p></div>
        <div class="row">
          <button class="btn" id="bulk-btn">＋ Tạo tài khoản hàng loạt</button>
          <a class="btn" href="/api/admin/export.csv" download>⤓ Xuất CSV tiến độ</a>
        </div>
      </div>
      <div class="grid grid-4" style="margin-bottom:16px">
        ${stat('👥', ov.users.total, `Người dùng · ${ov.users.active7} hoạt động 7 ngày qua`)}
        ${stat('📨', ov.submissions.total, 'Tổng lần nộp bài')}
        ${stat('📅', ov.submissions.today, 'Lần nộp trong 24 giờ qua')}
        ${stat('✅', pct(ov.submissions.accepted, ov.submissions.total) + '%', 'Tỉ lệ Accepted')}
      </div>
      <div class="card" style="margin-bottom:16px">
        <div class="card-title"><h3>Số lần nộp bài 14 ngày gần đây</h3></div>
        <div class="bars">${days.map((d) => html`<div class="bar" style="height:${(d.n / maxDay) * 100}%" title="${d.n} lần nộp"><span>${d.n || ''}</span></div>`)}</div>
        <div class="bars-labels">${days.map((d) => html`<span>${d.label}</span>`)}</div>
      </div>
      <div class="tabs" style="border-radius:10px 10px 0 0;border:1px solid var(--border);border-bottom:none">
        <a class="tab ${tab === 'users' ? 'active' : ''}" href="/admin?tab=users" data-link>👥 Sinh viên (${us.users.length})</a>
        <a class="tab ${tab === 'problems' ? 'active' : ''}" href="/admin?tab=problems" data-link>🧪 Thống kê bài tập</a>
      </div>
      <div id="admin-body"></div>
    </div>`);

  const body = $('#admin-body');
  if (tab === 'users') usersTab(body, us);
  else problemsTab(body, ov.problemStats);

  $('#bulk-btn').addEventListener('click', () => bulkCreate());
}

const stat = (icon, value, label) => html`
  <div class="card stat-card"><div class="stat-icon">${icon}</div><div class="stat"><span class="stat-value">${value}</span><span class="stat-label">${label}</span></div></div>`;

function usersTab(body, us) {
  render(body, html`
    <div class="card" style="border-radius:0 0 10px 10px">
      <div class="filters"><input class="input grow" id="u-q" placeholder="🔍 Tìm theo tên đăng nhập hoặc họ tên..."></div>
      <div id="u-table"></div>
    </div>`);
  let sortKey = 'solved';
  let sortDir = -1;
  const draw = () => {
    const q = $('#u-q').value.trim().toLowerCase();
    const rows = us.users
      .filter((u) => !q || u.username.toLowerCase().includes(q) || u.displayName.toLowerCase().includes(q))
      .sort((a, b) => {
        const x = a[sortKey] ?? 0;
        const y = b[sortKey] ?? 0;
        return (typeof x === 'string' ? x.localeCompare(y) : x - y) * sortDir;
      });
    const th = (key, label, cls = '') => html`<th class="sortable ${cls}" data-sort="${key}">${label}${sortKey === key ? (sortDir > 0 ? ' ▲' : ' ▼') : ''}</th>`;
    render($('#u-table'), rows.length ? html`
      <div class="table-wrap" style="border:none"><table class="table">
        <thead><tr>${th('displayName', 'Sinh viên')}${th('solved', 'Đã giải', 'num')}${th('attempted', 'Đang làm', 'num')}${th('submissions', 'Lần nộp', 'num')}<th>Tiến độ</th>${th('lastActivity', 'Hoạt động gần nhất')}${th('createdAt', 'Ngày tạo')}</tr></thead>
        <tbody>${rows.map((u) => html`
          <tr>
            <td><a class="row" style="gap:10px;flex-wrap:nowrap;color:var(--text)" href="/admin/users/${u.id}" data-link>${avatar(u.displayName)}<div><b>${u.displayName}</b> ${u.role === 'admin' ? html`<span class="badge admin">admin</span>` : ''}<div class="small faint">@${u.username}</div></div></a></td>
            <td class="num"><b>${u.solved}</b></td>
            <td class="num">${u.attempted}</td>
            <td class="num">${u.submissions}</td>
            <td style="min-width:120px"><div class="progress"><span style="width:${pct(u.solved, us.total)}%"></span></div><div class="small faint">${pct(u.solved, us.total)}%</div></td>
            <td class="small muted nowrap">${u.lastActivity ? timeAgo(u.lastActivity) : '—'}</td>
            <td class="small muted nowrap">${formatDate(u.createdAt)}</td>
          </tr>`)}</tbody>
      </table></div>` : html`<div class="empty">Không có người dùng phù hợp.</div>`);
  };
  on(body, 'click', '[data-sort]', (e, el) => {
    const k = el.dataset.sort;
    if (sortKey === k) sortDir = -sortDir; else { sortKey = k; sortDir = k === 'displayName' ? 1 : -1; }
    draw();
  });
  $('#u-q').addEventListener('input', draw);
  draw();
}

function problemsTab(body, stats) {
  let sortKey = 'order';
  let sortDir = 1;
  stats.forEach((s, i) => { s.order = i; s.rate = s.submissions ? s.accepted / s.submissions : -1; });
  render(body, html`<div class="card" style="border-radius:0 0 10px 10px"><div id="p-table"></div></div>`);
  const draw = () => {
    const rows = [...stats].sort((a, b) => {
      const x = a[sortKey]; const y = b[sortKey];
      return (typeof x === 'string' ? x.localeCompare(y) : x - y) * sortDir;
    });
    const th = (key, label, cls = '') => html`<th class="sortable ${cls}" data-psort="${key}">${label}${sortKey === key ? (sortDir > 0 ? ' ▲' : ' ▼') : ''}</th>`;
    render($('#p-table'), html`
      <p class="small muted">Bài có tỉ lệ Accepted thấp hoặc nhiều người thử mà ít người giải là dấu hiệu sinh viên đang gặp khó khăn.</p>
      <div class="table-wrap" style="border:none"><table class="table">
        <thead><tr>${th('order', 'Bài tập')}${th('difficulty', 'Độ khó')}${th('triedUsers', 'Số SV thử', 'num')}${th('solvedUsers', 'Số SV giải', 'num')}${th('submissions', 'Lần nộp', 'num')}${th('rate', 'Tỉ lệ AC', 'num')}</tr></thead>
        <tbody>${rows.map((p) => html`
          <tr>
            <td><a href="/problems/${p.slug}" data-link>${p.title}</a><div class="small faint">${p.topicTitle} › ${p.categoryTitle}</div></td>
            <td>${diffBadge(p.difficulty)}</td>
            <td class="num">${p.triedUsers}</td>
            <td class="num">${p.solvedUsers}</td>
            <td class="num">${p.submissions}</td>
            <td class="num">${p.submissions ? pct(p.accepted, p.submissions) + '%' : '—'}</td>
          </tr>`)}</tbody>
      </table></div>`);
  };
  on(body, 'click', '[data-psort]', (e, el) => {
    const k = el.dataset.psort;
    if (sortKey === k) sortDir = -sortDir; else { sortKey = k; sortDir = k === 'order' || k === 'difficulty' ? 1 : -1; }
    draw();
  });
  draw();
}

function bulkCreate() {
  const m = modal(html`
    <h2>Tạo tài khoản hàng loạt</h2>
    <p class="small muted">Mỗi dòng một sinh viên theo định dạng: <code>tên_đăng_nhập,mật_khẩu,Họ và tên</code></p>
    <textarea class="input" id="bulk-text" rows="10" placeholder="sv001,matkhau123,Nguyễn Văn An&#10;sv002,matkhau456,Trần Thị Bình"></textarea>
    <div id="bulk-res" style="margin-top:10px"></div>
    <div class="modal-actions"><button class="btn" data-close>Đóng</button><button class="btn btn-primary" id="bulk-go">Tạo tài khoản</button></div>`);
  m.el.querySelector('#bulk-go').addEventListener('click', async () => {
    try {
      const r = await api.post('/api/admin/users/bulk', { text: m.el.querySelector('#bulk-text').value });
      render(m.el.querySelector('#bulk-res'), html`
        ${r.created.length ? html`<div class="form-ok">Đã tạo ${r.created.length} tài khoản: ${r.created.join(', ')}</div>` : ''}
        ${r.errors.length ? html`<div class="form-error" style="margin-top:8px">${r.errors.map((e) => html`<div>${e}</div>`)}</div>` : ''}`);
      if (r.created.length) toast(`Đã tạo ${r.created.length} tài khoản`, 'ok');
    } catch (e) { toast(e.message, 'err'); }
  });
}
