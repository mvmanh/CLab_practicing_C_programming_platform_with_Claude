import { api } from '../api.js';
import { html, render, $, verdictTag, formatDate, copyText } from '../util.js';
import { state } from '../app.js';
import { createEditor } from '../editor.js';
import { resultView, bindResult } from './result.js';

export default async function submissionView({ app, params, isCurrent }) {
  const { submission: s } = await api.get('/api/submissions/' + encodeURIComponent(params.id));
  const isOther = s.user.id !== state.user.id;
  render(app, html`
    <div class="container">
      <div class="breadcrumb"><a href="${isOther ? '/admin/users/' + s.user.id : '/submissions'}" data-link>${isOther ? s.user.displayName : 'Lịch sử nộp bài'}</a><span>›</span><span>#${s.id}</span></div>
      <div class="page-head">
        <div>
          <h1>Bài nộp #${s.id}</h1>
          <p class="row" style="gap:10px"><a href="/problems/${s.problemSlug}" data-link>${s.problemTitle}</a> · ${verdictTag(s.verdict)} · ${s.passed}/${s.total} test · ${formatDate(s.createdAt, true)}${isOther ? html` · bởi <b>${s.user.displayName}</b> (@${s.user.username})` : ''}</p>
        </div>
        <div class="row">
          <button class="btn" id="copy-code">Sao chép mã</button>
          <a class="btn btn-primary" href="/problems/${s.problemSlug}" data-link>Mở bài tập</a>
        </div>
      </div>
      <div class="grid grid-2" style="align-items:start">
        <div class="card" style="padding:0;overflow:hidden"><div class="code-view" id="code-view" style="border:none;border-radius:0;height:560px"></div></div>
        <div class="card" id="res">${resultView(s)}</div>
      </div>
    </div>`);
  bindResult($('#res'), () => s);
  $('#copy-code').addEventListener('click', () => copyText(s.code));
  const ed = await createEditor($('#code-view'), { value: s.code, readOnly: true });
  if (!isCurrent()) { ed.dispose(); return; }
  return () => ed.dispose();
}
