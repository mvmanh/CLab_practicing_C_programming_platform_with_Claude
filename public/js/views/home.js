import { api } from '../api.js';
import {
  html, render, raw, diffBadge, verdictTag, statusDot, timeAgo, dayLabel, formatTime, duration, pct, DIFF_LABEL,
} from '../util.js';
import { state } from '../app.js';

export default async function home({ app }) {
  if (!state.user) return landing(app);
  const d = await api.get('/api/dashboard?tz=' + new Date().getTimezoneOffset());
  render(app, dashboard(d));
}

/* ===================== Trang giới thiệu cho khách ===================== */
async function landing(app) {
  let topics = [];
  try { topics = (await api.get('/api/topics')).topics; } catch { /* bỏ qua */ }
  const total = topics.reduce((s, t) => s + t.total, 0);
  render(app, html`
    <section class="landing-hero">
      <h1>Luyện lập trình <span class="grad">C</span> theo từng chủ đề</h1>
      <p>Hệ thống bài tập được thiết kế bám sát môn học: từ nhập xuất, vòng lặp, hàm, mảng, chuỗi đến con trỏ, cấp phát động
        và cấu trúc. Viết mã ngay trên trình duyệt, nhấn <b>Nộp bài</b> và nhận kết quả chấm tự động trong vài giây.</p>
      <div class="row" style="justify-content:center">
        ${state.config.allowRegistration ? html`<a class="btn btn-primary btn-lg" href="/register" data-link>Bắt đầu miễn phí</a>` : ''}
        <a class="btn btn-lg" href="/login" data-link>Đăng nhập</a>
        <a class="btn btn-lg btn-ghost" href="/topics" data-link>Xem chủ đề →</a>
      </div>
      <div class="code-preview">
        <div class="cp-head"><i style="background:#ef4444"></i><i style="background:#eab308"></i><i style="background:#22c55e"></i><span style="margin-left:8px">main.c</span></div>
        <pre>${raw(`<span class="tok-p">#include</span> <span class="tok-s">&lt;stdio.h&gt;</span>

<span class="tok-t">int</span> <span class="tok-f">main</span>() {
    <span class="tok-t">int</span> n;
    <span class="tok-f">scanf</span>(<span class="tok-s">"%d"</span>, &amp;n);
    <span class="tok-t">long long</span> s = <span class="tok-n">0</span>;
    <span class="tok-k">for</span> (<span class="tok-t">int</span> i = <span class="tok-n">1</span>; i &lt;= n; i++) s += i;
    <span class="tok-f">printf</span>(<span class="tok-s">"%lld\\n"</span>, s);   <span class="tok-c">// ✓ Accepted — 6/6 test</span>
    <span class="tok-k">return</span> <span class="tok-n">0</span>;
}`)}</pre>
      </div>
    </section>
    <div class="container" style="padding-top:10px">
      <div class="grid grid-4">
        ${feature('🗂️', `${topics.length || 14} chủ đề`, 'Tổ chức theo giáo trình môn Lập trình C, mỗi chủ đề có nhiều dạng bài.')}
        ${feature('🧪', `${total || 150}+ bài tập`, 'Mỗi bài có 3–10 test case, gồm test mẫu và test ẩn để kiểm tra kỹ.')}
        ${feature('⚡', 'Chấm tự động', 'Biên dịch bằng GCC thật, báo lỗi biên dịch, sai kết quả, quá thời gian...')}
        ${feature('📈', 'Theo dõi tiến độ', 'Biết mình đang ở đâu, buổi gần nhất làm bài gì để tiếp tục ngay.')}
      </div>
      ${topics.length ? html`
        <h2 style="margin-top:40px">Lộ trình học</h2>
        <div class="grid grid-3">
          ${topics.map((t) => html`
            <a class="card topic-card" href="/topics/${t.slug}" data-link>
              <div class="topic-card-head"><div class="topic-icon">${t.icon}</div>
                <div><div class="topic-num">Chủ đề ${t.order}</div><h3>${t.title}</h3></div></div>
              <p>${t.description}</p>
              <div class="topic-meta"><span>${t.total} bài tập</span><span>${t.categories.length} dạng bài</span></div>
            </a>`)}
        </div>` : ''}
      <div class="footer">C Lab — Nền tảng luyện tập lập trình C</div>
    </div>`);
}

const feature = (icon, title, text) => html`
  <div class="card feature"><div class="fi">${icon}</div><h3>${title}</h3><p>${text}</p></div>`;

/* ===================== Bảng điều khiển của sinh viên ===================== */
function dashboard(d) {
  const t = d.totals;
  const acRate = pct(t.accepted, t.submissions);
  return html`
    <div class="container">
      <div class="page-head">
        <div>
          <h1>Xin chào, ${state.user.displayName} 👋</h1>
          <p>${greetingLine(d)}</p>
        </div>
        <a class="btn" href="/topics" data-link>Tất cả chủ đề</a>
      </div>

      <div class="grid grid-4" style="margin-bottom:16px">
        ${statCard('✅', `${t.solved}/${t.problems}`, 'Bài đã giải')}
        ${statCard('🎯', `${acRate}%`, `Tỉ lệ đúng (${t.accepted}/${t.submissions} lần nộp)`)}
        ${statCard('🔥', `${d.streak} ngày`, `Chuỗi học liên tục · kỷ lục ${d.longestStreak}`)}
        ${statCard('🧩', `${t.attempted}`, 'Bài đang làm dở')}
      </div>

      <div class="dash-grid">
        <div class="stack" style="gap:16px">
          ${continueCard(d)}
          ${lastSessionCard(d.sessions)}
          <div class="card">
            <div class="card-title"><h3>Hoạt động trong năm</h3><span class="small muted">số lần nộp bài mỗi ngày</span></div>
            ${heatmap(d.heatmap)}
          </div>
          <div class="card">
            <div class="card-title"><h3>Bài nộp gần đây</h3><a class="small" href="/submissions" data-link>Xem tất cả →</a></div>
            ${d.recent.length ? html`
              <div class="table-wrap" style="border:none">
                <table class="table"><tbody>
                  ${d.recent.map((s) => html`
                    <tr>
                      <td><a href="/problems/${s.problemSlug}" data-link>${s.problemTitle}</a><div class="small faint">${s.topicTitle}</div></td>
                      <td><a href="/submissions/${s.id}" data-link>${verdictTag(s.verdict)}</a></td>
                      <td class="num small muted">${s.passed}/${s.total}</td>
                      <td class="num small muted nowrap">${timeAgo(s.createdAt)}</td>
                    </tr>`)}
                </tbody></table>
              </div>` : html`<div class="empty small">Chưa có bài nộp nào. Hãy bắt đầu với bài đầu tiên!</div>`}
          </div>
        </div>

        <div class="stack" style="gap:16px">
          <div class="card">
            <div class="card-title"><h3>Tổng quan</h3></div>
            <div class="row" style="gap:20px;flex-wrap:nowrap">
              <div class="ring" style="--p:${pct(t.solved, t.problems)}"><div><div class="stat-value">${pct(t.solved, t.problems)}%</div><div class="small muted">hoàn thành</div></div></div>
              <div style="flex:1;min-width:0">
                ${['easy', 'medium', 'hard'].map((k) => html`
                  <div class="diff-row" style="grid-template-columns:76px minmax(0,1fr) 54px">
                    <span>${diffBadge(k)}</span>
                    <div class="progress"><span style="width:${pct(d.byDifficulty[k].solved, d.byDifficulty[k].total)}%;background:var(--${k})"></span></div>
                    <span class="small muted num">${d.byDifficulty[k].solved}/${d.byDifficulty[k].total}</span>
                  </div>`)}
              </div>
            </div>
          </div>
          <div class="card">
            <div class="card-title"><h3>Tiến độ theo chủ đề</h3></div>
            ${d.topics.map((tp) => html`
              <div class="topic-progress-row">
                <span>${tp.icon}</span>
                <div>
                  <a href="/topics/${tp.slug}" data-link>${tp.order}. ${tp.title}</a>
                  <div class="progress" style="margin-top:5px">
                    <span style="width:${pct(tp.solved, tp.total)}%"></span>
                    <span class="att" style="width:${pct(tp.attempted, tp.total)}%"></span>
                  </div>
                </div>
                <span class="small muted num" style="text-align:right">${tp.solved}/${tp.total}</span>
              </div>`)}
          </div>
        </div>
      </div>
    </div>`;
}

function greetingLine(d) {
  if (!d.totals.submissions) return 'Chào mừng bạn đến với C Lab! Hãy bắt đầu từ chủ đề đầu tiên nhé.';
  if (d.streak >= 3) return `Bạn đang có chuỗi ${d.streak} ngày học liên tục — giữ vững phong độ nhé!`;
  if (d.sessions.length) return `Lần học gần nhất: ${timeAgo(d.sessions[0].end)}.`;
  return 'Tiếp tục luyện tập mỗi ngày để tiến bộ nhanh hơn.';
}

const statCard = (icon, value, label) => html`
  <div class="card stat-card"><div class="stat-icon">${icon}</div><div class="stat"><span class="stat-value">${value}</span><span class="stat-label">${label}</span></div></div>`;

function continueCard(d) {
  const c = d.continueProblem;
  const n = d.nextProblem;
  if (c) {
    return html`
      <div class="card hero-continue">
        <div class="small muted">▶ Tiếp tục bài đang làm · ${timeAgo(c.lastAt)}</div>
        <div class="continue-title">${c.title}</div>
        <div class="row small muted" style="margin-bottom:14px">${diffBadge(c.difficulty)}<span>${c.topicTitle} › ${c.categoryTitle}</span>
          ${c.status === 'attempted' ? html`<span>· Đã qua ${c.bestPassed}/${c.testCount} test</span>` : ''}</div>
        <div class="row">
          <a class="btn btn-primary" href="/problems/${c.slug}" data-link>Tiếp tục làm bài</a>
          ${n ? html`<a class="btn btn-ghost" href="/problems/${n.slug}" data-link>Hoặc bài tiếp theo: ${n.title}</a>` : ''}
        </div>
      </div>`;
  }
  if (n) {
    return html`
      <div class="card hero-continue">
        <div class="small muted">${d.totals.solved ? '▶ Bài tiếp theo trong lộ trình' : '🚀 Bắt đầu hành trình'}</div>
        <div class="continue-title">${n.title}</div>
        <div class="row small muted" style="margin-bottom:14px">${diffBadge(n.difficulty)}<span>${n.topicTitle} › ${n.categoryTitle}</span></div>
        <a class="btn btn-primary" href="/problems/${n.slug}" data-link>${d.totals.solved ? 'Làm bài tiếp theo' : 'Làm bài đầu tiên'}</a>
      </div>`;
  }
  return html`<div class="card hero-continue"><div class="continue-title">🏆 Xuất sắc! Bạn đã giải hết tất cả bài tập.</div><p class="muted">Hãy xem lại các lời giải mẫu hoặc thử tối ưu hóa bài làm của mình.</p></div>`;
}

function lastSessionCard(sessions) {
  if (!sessions.length) {
    return html`<div class="card"><div class="card-title"><h3>Buổi học gần nhất</h3></div><div class="empty small">Chưa có buổi học nào được ghi nhận.</div></div>`;
  }
  const s = sessions[0];
  const statusText = { solved: 'Đã giải', attempted: 'Chưa đúng', opened: 'Mới xem' };
  return html`
    <div class="card">
      <div class="card-title">
        <h3>Buổi học gần nhất</h3>
        <span class="small muted">${dayLabel(s.end)} · ${formatTime(s.start)}–${formatTime(s.end)} · ${duration(s.durationMin)}</span>
      </div>
      <div class="small muted" style="margin-bottom:6px">${s.problems.length} bài · ${s.submits} lần nộp · ${s.runs} lần chạy thử</div>
      ${s.problems.map((p) => html`
        <div class="session-item">
          ${statusDot(p.status)}
          <div style="flex:1;min-width:0"><a href="/problems/${p.slug}" data-link>${p.title}</a>
            <div class="small faint">${p.topicTitle} · ${DIFF_LABEL[p.difficulty]}</div></div>
          <span class="small ${p.status === 'solved' ? '' : 'muted'}" style="color:${p.status === 'solved' ? 'var(--ok)' : ''}">${statusText[p.status] || ''}${p.status === 'attempted' ? ` (${p.bestPassed}/${p.total})` : ''}</span>
          ${p.status !== 'solved' ? html`<a class="btn btn-sm" href="/problems/${p.slug}" data-link>Làm tiếp</a>` : ''}
        </div>`)}
      ${sessions.length > 1 ? html`
        <details style="margin-top:10px"><summary class="small muted" style="cursor:pointer">Các buổi trước</summary>
          ${sessions.slice(1).map((ss) => html`
            <div style="margin-top:10px">
              <div class="small"><b>${dayLabel(ss.end)}</b> <span class="muted">· ${formatTime(ss.start)}–${formatTime(ss.end)} · ${ss.problems.length} bài</span></div>
              <div class="row small" style="gap:6px 14px;margin-top:4px">${ss.problems.map((p) => html`<span class="row" style="gap:5px">${statusDot(p.status)}<a href="/problems/${p.slug}" data-link>${p.title}</a></span>`)}</div>
            </div>`)}
        </details>` : ''}
    </div>`;
}

function heatmap(data) {
  const DAY = 86400000;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today.getTime() - 52 * 7 * DAY);
  start.setDate(start.getDate() - start.getDay()); // về Chủ nhật
  const cells = [];
  let total = 0;
  for (let t = start.getTime(); t <= today.getTime(); t += DAY) {
    const d = new Date(t);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const n = data[key] || 0;
    total += n;
    const lvl = n === 0 ? 0 : n < 3 ? 1 : n < 6 ? 2 : n < 10 ? 3 : 4;
    cells.push(html`<div class="d ${lvl ? 'l' + lvl : ''}" title="${n} lần nộp · ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}"></div>`);
  }
  return html`
    <div class="heatmap-wrap"><div class="heatmap">${cells}</div></div>
    <div class="heat-legend"><span style="margin-right:auto">${total} lần nộp trong 12 tháng</span>Ít
      <span class="d" style="background:var(--heat-0)"></span><span class="d" style="background:var(--heat-1)"></span>
      <span class="d" style="background:var(--heat-2)"></span><span class="d" style="background:var(--heat-3)"></span>
      <span class="d" style="background:var(--heat-4)"></span>Nhiều</div>`;
}
