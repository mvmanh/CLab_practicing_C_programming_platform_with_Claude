import { api } from '../api.js';
import { html, render, $, verdictTag, timeAgo, formatDate, pct, avatar, diffBadge, toast, confirmDialog, modal, dayLabel, formatTime, duration, statusDot } from '../util.js';
import { state, navigate } from '../app.js';

export default async function adminUserView({ app, params }) {
  if (state.user?.role !== 'admin') { navigate('/', { replace: true }); return; }
  const d = await api.get('/api/admin/users/' + encodeURIComponent(params.id));
  const u = d.user;
  const solved = d.problems.filter((p) => p.status === 'solved');
  const attempted = d.problems.filter((p) => p.status === 'attempted');
  const total = d.topics.reduce((s, t) => s + t.total, 0);
  const isSelf = u.id === state.user.id;

  render(app, html`
    <div class="container">
      <div class="breadcrumb"><a href="/admin" data-link>Quản trị</a><span>›</span><span>Sinh viên</span></div>
      <div class="page-head">
        <div class="row" style="gap:14px;flex-wrap:nowrap">${avatar(u.displayName)}
          <div><h1>${u.displayName} ${u.role === 'admin' ? html`<span class="badge admin">admin</span>` : ''}</h1>
            <p>@${u.username} · tham gia ${formatDate(u.createdAt)} · truy cập gần nhất ${u.lastSeenAt ? timeAgo(u.lastSeenAt) : '—'}</p></div></div>
        <div class="row">
          <button class="btn" id="reset-pw">🔑 Đặt lại mật khẩu</button>
          ${isSelf ? '' : html`<button class="btn" id="toggle-role">${u.role === 'admin' ? 'Hạ thành sinh viên' : 'Cấp quyền quản trị'}</button>
          <button class="btn btn-danger" id="del-user">Xóa tài khoản</button>`}
        </div>
      </div>
      <div class="grid grid-3" style="margin-bottom:16px">
        <div class="card stat-card"><div class="stat-icon">✅</div><div class="stat"><span class="stat-value">${solved.length}/${total}</span><span class="stat-label">Bài đã giải (${pct(solved.length, total)}%)</span></div></div>
        <div class="card stat-card"><div class="stat-icon">🧩</div><div class="stat"><span class="stat-value">${attempted.length}</span><span class="stat-label">Bài đang làm dở</span></div></div>
        <div class="card stat-card"><div class="stat-icon">📨</div><div class="stat"><span class="stat-value">${d.problems.reduce((s, p) => s + p.attempts, 0)}</span><span class="stat-label">Lần nộp bài</span></div></div>
      </div>
      <div class="dash-grid">
        <div class="stack" style="gap:16px">
          <div class="card">
            <h3>Các buổi học gần đây</h3>
            ${d.sessions.length ? d.sessions.map((s) => html`
              <div style="padding:8px 0;border-bottom:1px solid var(--border)">
                <div class="row" style="justify-content:space-between"><b>${dayLabel(s.end)}</b><span class="small muted">${formatTime(s.start)}–${formatTime(s.end)} · ${duration(s.durationMin)} · ${s.submits} lần nộp</span></div>
                <div class="row small" style="gap:6px 14px;margin-top:4px">${s.problems.map((p) => html`<span class="row" style="gap:5px">${statusDot(p.status)}${p.title}</span>`)}</div>
              </div>`) : html`<div class="empty small">Chưa có hoạt động.</div>`}
          </div>
          <div class="card">
            <h3>Bài nộp gần đây</h3>
            ${d.recent.length ? html`<div class="table-wrap" style="border:none"><table class="table"><tbody>
              ${d.recent.map((s) => html`<tr>
                <td>${s.problemTitle}<div class="small faint">${s.topicTitle}</div></td>
                <td><a href="/submissions/${s.id}" data-link>${verdictTag(s.verdict)}</a></td>
                <td class="num small">${s.passed}/${s.total}</td>
                <td class="small muted nowrap">${timeAgo(s.createdAt)}</td></tr>`)}
            </tbody></table></div>` : html`<div class="empty small">Chưa nộp bài nào.</div>`}
          </div>
          ${attempted.length ? html`<div class="card"><h3>Bài đang gặp khó khăn</h3>
            <div class="table-wrap" style="border:none"><table class="table"><tbody>
              ${attempted.sort((a, b) => b.attempts - a.attempts).map((p) => html`<tr>
                <td><a href="/problems/${p.slug}" data-link>${p.title}</a><div class="small faint">${p.topicTitle}</div></td>
                <td>${diffBadge(p.difficulty)}</td><td class="num small">${p.attempts} lần nộp</td><td class="num small">tốt nhất ${p.bestPassed}/${p.total}</td></tr>`)}
            </tbody></table></div></div>` : ''}
        </div>
        <div class="card">
          <h3>Tiến độ theo chủ đề</h3>
          ${d.topics.map((tp) => html`
            <div class="topic-progress-row"><span>${tp.icon}</span>
              <div><span class="small">${tp.order}. ${tp.title}</span>
                <div class="progress" style="margin-top:5px"><span style="width:${pct(tp.solved, tp.total)}%"></span><span class="att" style="width:${pct(tp.attempted, tp.total)}%"></span></div></div>
              <span class="small muted num" style="text-align:right">${tp.solved}/${tp.total}</span></div>`)}
        </div>
      </div>
    </div>`);

  $('#reset-pw').addEventListener('click', () => {
    const m = modal(html`<h2>Đặt lại mật khẩu cho @${u.username}</h2>
      <div class="field"><label>Mật khẩu mới (≥ 6 ký tự)</label><input class="input" id="new-pw" type="text" minlength="6"></div>
      <div class="modal-actions"><button class="btn" data-close>Hủy</button><button class="btn btn-primary" id="do-reset">Đặt lại</button></div>`);
    m.el.querySelector('#do-reset').addEventListener('click', async () => {
      try {
        await api.post(`/api/admin/users/${u.id}/password`, { password: m.el.querySelector('#new-pw').value });
        m.close();
        toast('Đã đặt lại mật khẩu', 'ok');
      } catch (e) { toast(e.message, 'err'); }
    });
  });
  $('#toggle-role')?.addEventListener('click', async () => {
    const role = u.role === 'admin' ? 'student' : 'admin';
    if (!(await confirmDialog(role === 'admin' ? `Cấp quyền quản trị cho ${u.displayName}?` : `Hạ ${u.displayName} thành sinh viên?`))) return;
    try { await api.post(`/api/admin/users/${u.id}/role`, { role }); toast('Đã cập nhật vai trò', 'ok'); navigate(location.pathname, { replace: true }); } catch (e) { toast(e.message, 'err'); }
  });
  $('#del-user')?.addEventListener('click', async () => {
    if (!(await confirmDialog(`Xóa vĩnh viễn tài khoản @${u.username} cùng toàn bộ bài nộp và tiến độ? Không thể hoàn tác.`, { okText: 'Xóa', danger: true }))) return;
    try { await api.del(`/api/admin/users/${u.id}`); toast('Đã xóa tài khoản', 'ok'); navigate('/admin'); } catch (e) { toast(e.message, 'err'); }
  });
}
