import { api } from '../api.js';
import { html, render, $, verdictTag, timeAgo, formatDate, VERDICT_LABEL } from '../util.js';
import { navigate } from '../app.js';

export default async function submissionsView({ app, query }) {
  const page = Math.max(1, Number(query.get('page')) || 1);
  const verdict = query.get('verdict') || '';
  const r = await api.get(`/api/submissions?page=${page}${verdict ? '&verdict=' + verdict : ''}`);
  const link = (pg) => `/submissions?page=${pg}${verdict ? '&verdict=' + verdict : ''}`;
  render(app, html`
    <div class="container">
      <div class="page-head">
        <div><h1>Lịch sử nộp bài</h1><p>${r.total} lần nộp</p></div>
        <select class="input" id="v-filter" style="width:auto">
          <option value="">Tất cả kết quả</option>
          ${Object.entries(VERDICT_LABEL).map(([k, v]) => html`<option value="${k}" ${verdict === k ? 'selected' : ''}>${v}</option>`)}
        </select>
      </div>
      ${r.submissions.length ? html`
        <div class="table-wrap"><table class="table">
          <thead><tr><th>#</th><th>Bài tập</th><th>Kết quả</th><th class="num">Test</th><th class="num">Thời gian</th><th>Lúc nộp</th></tr></thead>
          <tbody>${r.submissions.map((s) => html`
            <tr>
              <td><a href="/submissions/${s.id}" data-link>#${s.id}</a></td>
              <td><a href="/problems/${s.problemSlug}" data-link>${s.problemTitle}</a><div class="small faint">${s.topicTitle}</div></td>
              <td><a href="/submissions/${s.id}" data-link>${verdictTag(s.verdict)}</a></td>
              <td class="num">${s.passed}/${s.total}</td>
              <td class="num">${s.timeMs} ms</td>
              <td class="small muted nowrap" title="${formatDate(s.createdAt, true)}">${timeAgo(s.createdAt)}</td>
            </tr>`)}</tbody>
        </table></div>
        ${r.pages > 1 ? html`<div class="pager">
          ${page > 1 ? html`<a class="btn btn-sm" href="${link(page - 1)}" data-link>← Trước</a>` : ''}
          <span class="small muted">Trang ${page}/${r.pages}</span>
          ${page < r.pages ? html`<a class="btn btn-sm" href="${link(page + 1)}" data-link>Sau →</a>` : ''}
        </div>` : ''}` : html`<div class="card empty"><div class="big">📭</div><p>Chưa có bài nộp nào${verdict ? ' với kết quả này' : ''}.</p><a class="btn btn-primary" href="/topics" data-link>Bắt đầu làm bài</a></div>`}
    </div>`);
  $('#v-filter').addEventListener('change', (e) => navigate('/submissions' + (e.target.value ? '?verdict=' + e.target.value : '')));
}
