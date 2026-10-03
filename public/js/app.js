import { api } from './api.js';
import { html, render, $, on, avatar, toast, errorView, loading } from './util.js';

/* ---------- Trạng thái toàn cục ---------- */
export const state = { user: null, config: { allowRegistration: true } };
const listeners = new Set();
export function onThemeChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }
export function currentTheme() { return document.documentElement.getAttribute('data-theme') || 'dark'; }

/* ---------- Bộ định tuyến ---------- */
const routes = [
  ['/', () => import('./views/home.js')],
  ['/topics', () => import('./views/topics.js')],
  ['/topics/:slug', () => import('./views/topic.js')],
  ['/problems', () => import('./views/problems.js')],
  ['/problems/:slug', () => import('./views/problem.js')],
  ['/submissions', () => import('./views/submissions.js')],
  ['/submissions/:id', () => import('./views/submission.js')],
  ['/leaderboard', () => import('./views/leaderboard.js')],
  ['/login', () => import('./views/auth.js'), 'login'],
  ['/register', () => import('./views/auth.js'), 'register'],
  ['/profile', () => import('./views/profile.js')],
  ['/admin', () => import('./views/admin.js')],
  ['/admin/users/:id', () => import('./views/admin-user.js')],
];

function match(path) {
  for (const [pattern, loader, variant] of routes) {
    const keys = [];
    const re = new RegExp('^' + pattern.replace(/:(\w+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '/?$');
    const m = re.exec(path);
    if (m) {
      const params = {};
      keys.forEach((k, i) => { params[k] = decodeURIComponent(m[i + 1]); });
      return { loader, params, variant };
    }
  }
  return null;
}

let cleanup = null;
let navToken = 0;

export async function navigate(url, { replace = false } = {}) {
  if (replace) history.replaceState({}, '', url); else history.pushState({}, '', url);
  await route();
}

async function route() {
  const token = ++navToken;
  const url = new URL(location.href);
  const app = $('#app');
  if (cleanup) { try { cleanup(); } catch (e) { console.error(e); } cleanup = null; }
  document.body.classList.remove('workspace-mode');
  $('#mainnav').classList.remove('open');
  renderNav(url.pathname);
  const m = match(url.pathname);
  if (!m) { render(app, errorView('Không tìm thấy trang bạn yêu cầu.')); return; }
  render(app, loading());
  try {
    const mod = await m.loader();
    if (token !== navToken) return;
    const result = await mod.default({ app, params: m.params, query: url.searchParams, variant: m.variant, isCurrent: () => token === navToken });
    if (token !== navToken) { if (typeof result === 'function') result(); return; }
    if (typeof result === 'function') cleanup = result;
    if (!url.hash) window.scrollTo(0, 0);
  } catch (e) {
    if (token !== navToken) return;
    if (e.status === 401) { navigate('/login?next=' + encodeURIComponent(url.pathname + url.search), { replace: true }); return; }
    console.error(e);
    render(app, errorView(e.message || 'Đã có lỗi xảy ra.'));
  }
}

/* ---------- Thanh điều hướng ---------- */
function renderNav(path) {
  const links = [
    ['/', 'Trang chủ'],
    ['/topics', 'Chủ đề'],
    ['/problems', 'Bài tập'],
    ...(state.user ? [['/submissions', 'Lịch sử nộp']] : []),
    ['/leaderboard', 'Xếp hạng'],
    ...(state.user?.role === 'admin' ? [['/admin', 'Quản trị']] : []),
  ];
  const isActive = (href) => (href === '/' ? path === '/' : path === href || path.startsWith(href + '/'));
  render($('#mainnav'), html`${links.map(([href, label]) => html`<a href="${href}" data-link class="${isActive(href) ? 'active' : ''}">${label}</a>`)}`);

  const ua = $('#user-area');
  if (!state.user) {
    render(ua, html`<a class="btn btn-sm btn-ghost" href="/login" data-link>Đăng nhập</a>${state.config.allowRegistration ? html`<a class="btn btn-sm btn-primary" href="/register" data-link>Đăng ký</a>` : ''}`);
  } else {
    const u = state.user;
    render(ua, html`
      <div class="user-menu">
        <button class="user-chip" id="user-chip">${avatar(u.displayName)}<span class="nowrap">${u.displayName}</span></button>
        <div class="dropdown hidden" id="user-dd">
          <div class="dd-head"><strong>${u.displayName}</strong><div class="small muted">@${u.username}${u.role === 'admin' ? ' · Quản trị viên' : ''}</div></div>
          <a href="/" data-link>📊 Tiến độ của tôi</a>
          <a href="/submissions" data-link>🕘 Lịch sử nộp bài</a>
          <a href="/profile" data-link>⚙️ Tài khoản</a>
          ${u.role === 'admin' ? html`<a href="/admin" data-link>🛠️ Quản trị</a>` : ''}
          <button id="logout-btn">↪ Đăng xuất</button>
        </div>
      </div>`);
  }
}

document.addEventListener('click', (e) => {
  const chip = e.target.closest('#user-chip');
  const dd = $('#user-dd');
  if (chip && dd) { dd.classList.toggle('hidden'); return; }
  if (dd && !e.target.closest('#user-dd')) dd.classList.add('hidden');
});

on(document, 'click', '#logout-btn', async () => {
  try { await api.post('/api/auth/logout'); } catch { /* bỏ qua */ }
  state.user = null;
  toast('Đã đăng xuất');
  navigate('/');
});

/* Chặn link nội bộ để điều hướng không tải lại trang */
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[data-link]');
  if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === '_blank') return;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin) return;
  e.preventDefault();
  $('#user-dd')?.classList.add('hidden');
  if (url.pathname + url.search === location.pathname + location.search) return;
  navigate(url.pathname + url.search + url.hash);
});
window.addEventListener('popstate', route);

/* Đổi giao diện sáng/tối */
const themeBtn = $('#theme-toggle');
const paintThemeBtn = () => { themeBtn.textContent = currentTheme() === 'dark' ? '☀️' : '🌙'; };
paintThemeBtn();
themeBtn.addEventListener('click', () => {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  try { localStorage.setItem('theme', next); } catch { /* bỏ qua */ }
  paintThemeBtn();
  listeners.forEach((fn) => fn(next));
});

/* Menu trên màn hình nhỏ */
$('#nav-toggle').addEventListener('click', (e) => { e.stopPropagation(); $('#mainnav').classList.toggle('open'); });
document.addEventListener('click', (e) => { if (!e.target.closest('#mainnav')) $('#mainnav').classList.remove('open'); });

export async function refreshUser() {
  const r = await api.get('/api/auth/me');
  state.user = r.user;
  return state.user;
}

export function setUser(u) { state.user = u; }

/* Khởi động */
(async () => {
  try {
    const [me, cfg] = await Promise.all([api.get('/api/auth/me'), api.get('/api/auth/config')]);
    state.user = me.user;
    state.config = cfg;
  } catch (e) {
    console.error(e);
  }
  route();
})();
