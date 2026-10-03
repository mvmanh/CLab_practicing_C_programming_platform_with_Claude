import { api } from '../api.js';
import { html, render, $, diffBadge, statusDot } from '../util.js';
import { state } from '../app.js';

export default async function problemsView({ app, query }) {
  const { problems } = await api.get('/api/problems');
  const topics = [...new Map(problems.map((p) => [p.topicSlug, p.topicTitle])).entries()];
  const f = { q: query.get('q') || '', topic: query.get('topic') || '', diff: query.get('diff') || '', status: query.get('status') || '' };

  render(app, html`
    <div class="container">
      <div class="page-head"><div><h1>Tất cả bài tập</h1><p>${problems.length} bài tập thuộc ${topics.length} chủ đề</p></div></div>
      <div class="filters">
        <input class="input grow" id="f-q" placeholder="🔍 Tìm theo tên bài..." value="${f.q}">
        <select class="input" id="f-topic"><option value="">Mọi chủ đề</option>${topics.map(([s, t]) => html`<option value="${s}" ${f.topic === s ? 'selected' : ''}>${t}</option>`)}</select>
        <select class="input" id="f-diff">
          <option value="">Mọi độ khó</option>
          <option value="easy" ${f.diff === 'easy' ? 'selected' : ''}>Dễ</option>
          <option value="medium" ${f.diff === 'medium' ? 'selected' : ''}>Trung bình</option>
          <option value="hard" ${f.diff === 'hard' ? 'selected' : ''}>Khó</option>
        </select>
        ${state.user ? html`
        <select class="input" id="f-status">
          <option value="">Mọi trạng thái</option>
          <option value="todo" ${f.status === 'todo' ? 'selected' : ''}>Chưa làm</option>
          <option value="attempted" ${f.status === 'attempted' ? 'selected' : ''}>Đang làm</option>
          <option value="solved" ${f.status === 'solved' ? 'selected' : ''}>Đã giải</option>
        </select>` : ''}
      </div>
      <div id="plist"></div>
    </div>`);

  const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
  const draw = () => {
    f.q = $('#f-q').value; f.topic = $('#f-topic').value; f.diff = $('#f-diff').value; f.status = $('#f-status')?.value || '';
    const q = norm(f.q.trim());
    const rows = problems.filter((p) =>
      (!q || norm(p.title).includes(q) || p.slug.includes(q)) &&
      (!f.topic || p.topicSlug === f.topic) &&
      (!f.diff || p.difficulty === f.diff) &&
      (!f.status || (f.status === 'todo' ? !p.status : p.status === f.status)));
    const params = new URLSearchParams(Object.entries(f).filter(([, v]) => v));
    history.replaceState({}, '', '/problems' + (params.toString() ? '?' + params : ''));
    render($('#plist'), rows.length ? html`
      <div class="small muted" style="margin-bottom:8px">${rows.length} bài</div>
      <div class="plist">${rows.map((p) => html`
        <a class="plist-row" href="/problems/${p.slug}" data-link>
          ${statusDot(p.status)}
          <div><div class="ptitle">${p.title}</div><div class="psub">${p.topicTitle} › ${p.categoryTitle}</div></div>
          ${diffBadge(p.difficulty)}<span class="muted">›</span>
        </a>`)}</div>` : html`<div class="card empty"><div class="big">🔎</div>Không có bài tập nào phù hợp.</div>`);
  };
  app.querySelectorAll('.filters .input').forEach((el) => el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', draw));
  draw();
}
