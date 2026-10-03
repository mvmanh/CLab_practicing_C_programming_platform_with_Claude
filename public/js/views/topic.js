import { api } from '../api.js';
import { html, render, raw, diffBadge, statusDot, pct } from '../util.js';
import { state } from '../app.js';

export default async function topicView({ app, params }) {
  const { topic: t } = await api.get('/api/topics/' + encodeURIComponent(params.slug));
  const all = t.categories.flatMap((c) => c.problems);
  const solved = all.filter((p) => p.status === 'solved').length;
  const firstTodo = all.find((p) => p.status !== 'solved');
  document.title = `${t.title} — C Lab`;
  render(app, html`
    <div class="container">
      <div class="breadcrumb"><a href="/topics" data-link>Chủ đề</a><span>›</span><span>Chủ đề ${t.order}</span></div>
      <div class="page-head">
        <div class="row" style="gap:16px;align-items:flex-start;flex-wrap:nowrap">
          <div class="topic-icon" style="width:58px;height:58px;font-size:30px">${t.icon}</div>
          <div><h1>${t.title}</h1><p>${t.description}</p></div>
        </div>
        ${firstTodo ? html`<a class="btn btn-primary" href="/problems/${firstTodo.slug}" data-link>${solved ? 'Làm tiếp' : 'Bắt đầu'} →</a>` : ''}
      </div>
      ${state.user ? html`
        <div class="card" style="margin-bottom:20px;padding:14px 18px">
          <div class="row" style="justify-content:space-between;margin-bottom:8px"><b>Tiến độ chủ đề</b><span class="muted small">${solved}/${all.length} bài (${pct(solved, all.length)}%)</span></div>
          <div class="progress lg"><span style="width:${pct(solved, all.length)}%"></span></div>
        </div>` : ''}
      ${t.introHtml ? html`<details class="intro-box" open><summary>📘 Kiến thức cần nhớ</summary><div class="statement">${raw(t.introHtml)}</div></details>` : ''}
      ${t.categories.map((c, ci) => html`
        <section class="category" id="${c.slug}">
          <div class="category-head"><h2>${ci + 1}. ${c.title}</h2><span class="muted small">${c.description}</span>
            <span class="spacer"></span><span class="small muted">${c.problems.filter((p) => p.status === 'solved').length}/${c.problems.length}</span></div>
          <div class="plist">
            ${c.problems.map((p) => html`
              <a class="plist-row" href="/problems/${p.slug}" data-link>
                ${statusDot(p.status)}
                <div><div class="ptitle">${p.title}</div><div class="psub">${p.testCount} test${p.attempts ? ` · ${p.attempts} lần nộp` : ''}${p.status === 'attempted' ? ` · tốt nhất ${p.bestPassed}/${p.testCount}` : ''}</div></div>
                ${diffBadge(p.difficulty)}
                <span class="muted">›</span>
              </a>`)}
          </div>
        </section>`)}
      <div class="row" style="justify-content:space-between;margin-top:10px">
        ${t.prev ? html`<a class="btn" href="/topics/${t.prev.slug}" data-link>← ${t.prev.title}</a>` : html`<span></span>`}
        ${t.next ? html`<a class="btn" href="/topics/${t.next.slug}" data-link>${t.next.title} →</a>` : ''}
      </div>
    </div>`);
  return () => { document.title = 'C Lab — Luyện tập lập trình C'; };
}
