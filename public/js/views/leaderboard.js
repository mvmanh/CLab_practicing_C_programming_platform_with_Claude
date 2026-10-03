import { api } from '../api.js';
import { html, render, avatar, pct } from '../util.js';

export default async function leaderboardView({ app }) {
  const r = await api.get('/api/leaderboard');
  const medal = (i) => ['🥇', '🥈', '🥉'][i - 1] || i;
  render(app, html`
    <div class="container narrow">
      <div class="page-head"><div><h1>Bảng xếp hạng</h1><p>Xếp theo số bài đã giải; bằng nhau thì ai đạt trước xếp trên.</p></div></div>
      ${r.leaders.length ? html`
        <div class="table-wrap"><table class="table">
          <thead><tr><th style="width:60px">Hạng</th><th>Sinh viên</th><th class="num">Đã giải</th><th style="width:30%">Tiến độ</th></tr></thead>
          <tbody>${r.leaders.map((u) => html`
            <tr class="${u.isMe ? 'me' : ''}">
              <td style="font-size:${u.rank <= 3 ? '20px' : '14px'}">${medal(u.rank)}</td>
              <td><div class="row" style="gap:10px;flex-wrap:nowrap">${avatar(u.displayName)}<div><b>${u.displayName}</b>${u.isMe ? ' (bạn)' : ''}<div class="small faint">@${u.username}</div></div></div></td>
              <td class="num"><b>${u.solved}</b><span class="faint">/${r.total}</span></td>
              <td><div class="progress"><span style="width:${pct(u.solved, r.total)}%"></span></div></td>
            </tr>`)}</tbody>
        </table></div>` : html`<div class="card empty"><div class="big">🏁</div>Chưa có ai giải bài nào. Hãy là người đầu tiên!</div>`}
    </div>`);
}
