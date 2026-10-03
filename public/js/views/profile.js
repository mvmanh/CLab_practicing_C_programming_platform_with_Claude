import { api } from '../api.js';
import { html, render, $, toast, avatar, formatDate, dayLabel, formatTime, duration, statusDot } from '../util.js';
import { state, setUser, navigate } from '../app.js';

export default async function profileView({ app }) {
  if (!state.user) { navigate('/login?next=/profile', { replace: true }); return; }
  const { sessions } = await api.get('/api/sessions');
  const u = state.user;
  render(app, html`
    <div class="container">
      <div class="page-head"><div class="row" style="gap:14px">${avatar(u.displayName)}<div><h1>${u.displayName}</h1><p>@${u.username} · tham gia ${formatDate(u.createdAt)}</p></div></div></div>
      <div class="grid grid-2" style="align-items:start">
        <div class="stack" style="gap:16px">
          <div class="card">
            <h3>Thông tin cá nhân</h3>
            <form class="form" id="profile-form">
              <div class="field"><label>Tên hiển thị</label><input class="input" name="displayName" value="${u.displayName}" maxlength="60" required></div>
              <div><button class="btn btn-primary">Lưu thay đổi</button></div>
            </form>
          </div>
          <div class="card">
            <h3>Đổi mật khẩu</h3>
            <form class="form" id="pw-form">
              <div id="pw-msg" class="hidden"></div>
              <div class="field"><label>Mật khẩu hiện tại</label><input class="input" type="password" name="current" autocomplete="current-password" required></div>
              <div class="field"><label>Mật khẩu mới (≥ 6 ký tự)</label><input class="input" type="password" name="next" autocomplete="new-password" required minlength="6"></div>
              <div class="field"><label>Nhập lại mật khẩu mới</label><input class="input" type="password" name="next2" autocomplete="new-password" required></div>
              <div><button class="btn btn-primary">Đổi mật khẩu</button></div>
            </form>
          </div>
        </div>
        <div class="card">
          <h3>Nhật ký các buổi học</h3>
          ${sessions.length ? sessions.map((s) => html`
            <div style="padding:10px 0;border-bottom:1px solid var(--border)">
              <div class="row" style="justify-content:space-between"><b>${dayLabel(s.end)}</b><span class="small muted">${formatTime(s.start)}–${formatTime(s.end)} · ${duration(s.durationMin)}</span></div>
              <div class="small muted" style="margin:2px 0 6px">${s.problems.length} bài · ${s.submits} lần nộp · ${s.runs} lần chạy</div>
              <div class="row small" style="gap:6px 14px">${s.problems.map((p) => html`<span class="row" style="gap:5px">${statusDot(p.status)}<a href="/problems/${p.slug}" data-link>${p.title}</a></span>`)}</div>
            </div>`) : html`<div class="empty small">Chưa có buổi học nào.</div>`}
        </div>
      </div>
    </div>`);

  $('#profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const r = await api.post('/api/auth/profile', { displayName: new FormData(e.target).get('displayName') });
      setUser(r.user);
      toast('Đã cập nhật thông tin', 'ok');
      navigate('/profile', { replace: true });
    } catch (ex) { toast(ex.message, 'err'); }
  });
  $('#pw-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    const msg = $('#pw-msg');
    const show = (text, ok) => { msg.className = ok ? 'form-ok' : 'form-error'; msg.textContent = text; };
    if (d.next !== d.next2) return show('Mật khẩu nhập lại không khớp.', false);
    try {
      await api.post('/api/auth/password', { current: d.current, next: d.next });
      e.target.reset();
      show('Đổi mật khẩu thành công. Các phiên đăng nhập khác đã bị đăng xuất.', true);
    } catch (ex) { show(ex.message, false); }
  });
}
