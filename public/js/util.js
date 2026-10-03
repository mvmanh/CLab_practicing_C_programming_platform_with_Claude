/* Tiện ích dùng chung cho giao diện */

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

export class Raw { constructor(s) { this.s = s; } toString() { return this.s; } }
export const raw = (s) => new Raw(s ?? '');

function fmt(v) {
  if (v instanceof Raw) return v.s;
  if (Array.isArray(v)) return v.map(fmt).join('');
  if (v === null || v === undefined || v === false) return '';
  return esc(v);
}

/** Template an toàn: mọi giá trị chèn vào đều được escape trừ khi bọc bằng raw()/html``. */
export function html(strings, ...vals) {
  let out = '';
  strings.forEach((s, i) => { out += s + (i < vals.length ? fmt(vals[i]) : ''); });
  return new Raw(out);
}

export function render(el, content) {
  el.innerHTML = content instanceof Raw ? content.s : String(content);
}

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function on(root, event, selector, handler) {
  root.addEventListener(event, (e) => {
    const target = e.target.closest(selector);
    if (target && root.contains(target)) handler(e, target);
  });
}

/* ---------- Định dạng ---------- */
export const DIFF_LABEL = { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' };
export const VERDICT_LABEL = {
  AC: 'Accepted', WA: 'Wrong Answer', TLE: 'Time Limit Exceeded', RE: 'Runtime Error',
  CE: 'Compile Error', OLE: 'Output Limit Exceeded',
};
export const VERDICT_VI = {
  AC: 'Chính xác', WA: 'Sai kết quả', TLE: 'Quá thời gian', RE: 'Lỗi khi chạy', CE: 'Lỗi biên dịch', OLE: 'Output quá lớn',
};

export const diffBadge = (d) => html`<span class="badge ${d}">${DIFF_LABEL[d] || d}</span>`;
export const verdictTag = (v) => html`<span class="verdict ${v}" title="${VERDICT_VI[v] || ''}">${VERDICT_LABEL[v] || v}</span>`;

export function statusDot(status) {
  if (status === 'solved') return html`<span class="status-dot solved" title="Đã giải">✓</span>`;
  if (status === 'attempted') return html`<span class="status-dot attempted" title="Đã thử, chưa đúng">•</span>`;
  if (status === 'opened') return html`<span class="status-dot opened" title="Đã xem"></span>`;
  return html`<span class="status-dot none" title="Chưa làm"></span>`;
}

export function timeAgo(ts) {
  if (!ts) return '—';
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 45) return 'vừa xong';
  if (s < 3600) return `${Math.round(s / 60)} phút trước`;
  if (s < 86400) return `${Math.round(s / 3600)} giờ trước`;
  if (s < 86400 * 7) return `${Math.round(s / 86400)} ngày trước`;
  return formatDate(ts);
}

export function formatDate(ts, withTime = false) {
  if (!ts) return '—';
  const d = new Date(ts);
  const p = (n) => String(n).padStart(2, '0');
  const date = `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
  return withTime ? `${p(d.getHours())}:${p(d.getMinutes())} ${date}` : date;
}

export function formatTime(ts) {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function dayLabel(ts) {
  const d = new Date(ts);
  const today = new Date();
  const y = new Date(); y.setDate(today.getDate() - 1);
  const same = (a, b) => a.toDateString() === b.toDateString();
  if (same(d, today)) return 'Hôm nay';
  if (same(d, y)) return 'Hôm qua';
  const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
  return `${days[d.getDay()]}, ${formatDate(ts)}`;
}

export function duration(min) {
  if (min < 60) return `${min} phút`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} giờ ${m} phút` : `${h} giờ`;
}

export function pct(a, b) { return b ? Math.round((a / b) * 100) : 0; }

const AVATAR_COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#0891b2', '#4f46e5', '#ca8a04'];
export function avatar(name) {
  const n = String(name || '?');
  let h = 0;
  for (const ch of n) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const initials = n.trim().split(/\s+/).map((w) => w[0]).slice(-2).join('').toUpperCase();
  return html`<span class="avatar" style="background:${AVATAR_COLORS[h % AVATAR_COLORS.length]}">${initials}</span>`;
}

/* ---------- Thông báo & hộp thoại ---------- */
export function toast(msg, type = '') {
  const box = document.getElementById('toasts');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  box.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; }, 3200);
  setTimeout(() => el.remove(), 3600);
}

export function modal(content, { wide = false } = {}) {
  const back = document.createElement('div');
  back.className = 'modal-back';
  back.innerHTML = `<div class="modal ${wide ? 'wide' : ''}" role="dialog">${content instanceof Raw ? content.s : content}</div>`;
  document.body.appendChild(back);
  const close = () => { back.remove(); document.removeEventListener('keydown', onKey); };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey);
  back.addEventListener('mousedown', (e) => { if (e.target === back) close(); });
  on(back, 'click', '[data-close]', close);
  return { el: back.firstElementChild, close };
}

export function confirmDialog(message, { okText = 'Đồng ý', danger = false } = {}) {
  return new Promise((resolve) => {
    const m = modal(html`
      <h2>Xác nhận</h2>
      <p>${message}</p>
      <div class="modal-actions">
        <button class="btn" data-close>Hủy</button>
        <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-ok>${okText}</button>
      </div>`);
    m.el.querySelector('[data-ok]').addEventListener('click', () => { m.close(); resolve(true); });
    m.el.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => resolve(false)));
  });
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast('Đã sao chép', 'ok');
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    toast('Đã sao chép', 'ok');
  }
}

export function debounce(fn, ms) {
  let t;
  const d = (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  d.flush = (...args) => { clearTimeout(t); fn(...args); };
  d.cancel = () => clearTimeout(t);
  return d;
}

export function celebrate() {
  const box = document.createElement('div');
  box.className = 'celebrate';
  const colors = ['#22c55e', '#3b82f6', '#eab308', '#ec4899', '#a855f7', '#f97316'];
  for (let i = 0; i < 90; i++) {
    const p = document.createElement('i');
    p.style.left = Math.random() * 100 + 'vw';
    p.style.background = colors[i % colors.length];
    p.style.animationDelay = Math.random() * 0.6 + 's';
    p.style.animationDuration = 1.4 + Math.random() * 1.2 + 's';
    box.appendChild(p);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 3500);
}

export function loading() {
  return html`<div class="page-loading"><div class="spinner"></div></div>`;
}

export function errorView(msg) {
  return html`<div class="container narrow"><div class="card empty"><div class="big">⚠️</div><h2>Có lỗi xảy ra</h2><p>${msg}</p><a class="btn" href="/" data-link>Về trang chủ</a></div></div>`;
}
