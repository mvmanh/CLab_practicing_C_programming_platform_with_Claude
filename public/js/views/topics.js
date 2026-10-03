import { api } from '../api.js';
import { html, render, pct } from '../util.js';
import { state } from '../app.js';

export default async function topicsView({ app }) {
  const { topics } = await api.get('/api/topics');
  const total = topics.reduce((s, t) => s + t.total, 0);
  const solved = topics.reduce((s, t) => s + t.solved, 0);
  render(app, html`
    <div class="container">
      <div class="page-head">
        <div>
          <h1>Chủ đề môn học</h1>
          <p>${topics.length} chủ đề · ${total} bài tập${state.user ? html` · bạn đã giải <b>${solved}</b> bài (${pct(solved, total)}%)` : ''}</p>
        </div>
      </div>
      <div class="grid grid-3">
        ${topics.map((t) => html`
          <a class="card topic-card" href="/topics/${t.slug}" data-link>
            <div class="topic-card-head">
              <div class="topic-icon">${t.icon}</div>
              <div><div class="topic-num">Chủ đề ${t.order}</div><h3>${t.title}</h3></div>
            </div>
            <p>${t.description}</p>
            <div class="small muted">${t.categories.map((c) => c.title).join(' · ')}</div>
            ${state.user ? html`
              <div class="progress"><span style="width:${pct(t.solved, t.total)}%"></span><span class="att" style="width:${pct(t.attempted, t.total)}%"></span></div>` : ''}
            <div class="topic-meta">
              <span>${state.user ? html`<b style="color:var(--text)">${t.solved}</b>/` : ''}${t.total} bài</span>
              <span><span style="color:var(--easy)">${t.difficulties.easy} dễ</span> · <span style="color:var(--medium)">${t.difficulties.medium} TB</span> · <span style="color:var(--hard)">${t.difficulties.hard} khó</span></span>
            </div>
          </a>`)}
      </div>
    </div>`);
}
