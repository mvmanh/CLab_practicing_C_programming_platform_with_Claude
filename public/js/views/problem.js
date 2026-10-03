import { api } from '../api.js';
import {
  html, render, raw, $, $$, on, diffBadge, verdictTag, timeAgo, toast, copyText, debounce, celebrate,
  confirmDialog, modal, VERDICT_LABEL,
} from '../util.js';
import { state } from '../app.js';
import { createEditor, parseGccOutput } from '../editor.js';
import { resultView, bindResult } from './result.js';

const LS_KEY = (slug) => `draft:${state.user ? state.user.id : 'guest'}:${slug}`;

function readLocal(slug) {
  try { return JSON.parse(localStorage.getItem(LS_KEY(slug)) || 'null'); } catch { return null; }
}
function writeLocal(slug, code) {
  try { localStorage.setItem(LS_KEY(slug), JSON.stringify({ code, t: Date.now() })); } catch { /* bộ nhớ đầy */ }
}

export default async function problemView({ app, params, isCurrent }) {
  const data = await api.get('/api/problems/' + encodeURIComponent(params.slug));
  if (!isCurrent()) return;
  const p = data.problem;
  let status = data.status;
  let solution = p.solution || null;
  document.title = `${p.title} — C Lab`;
  document.body.classList.add('workspace-mode');

  // Chọn mã khởi đầu: bản nháp mới nhất (server hoặc trình duyệt), nếu không có dùng mã mẫu
  const local = readLocal(p.slug);
  let initial = p.starter;
  if (data.draft && (!local || local.t <= data.draft.updatedAt + 1000)) initial = data.draft.code;
  else if (local && local.code) initial = local.code;

  const leftW = localStorage.getItem('ws:left') || '42%';
  const bottomH = localStorage.getItem('ws:bottom') || '36%';

  render(app, html`
    <div class="ws" id="ws">
      <section class="ws-left" id="ws-left" style="width:${leftW}">
        <div class="tabs" id="left-tabs">
          <button class="tab active" data-ltab="desc">📄 Đề bài</button>
          <button class="tab" data-ltab="subs">🕘 Bài nộp ${status?.attempts ? html`<span class="count">${status.attempts}</span>` : ''}</button>
          <button class="tab" data-ltab="sol">${solution ? '💡' : '🔒'} Lời giải mẫu</button>
        </div>
        <div class="ws-scroll">
          <div class="ws-pane" data-lpane="desc">
            <div class="breadcrumb">
              <a href="/topics" data-link>Chủ đề</a><span>›</span>
              <a href="/topics/${p.topicSlug}" data-link>${p.topicTitle}</a><span>›</span>
              <a href="/topics/${p.topicSlug}#${p.categorySlug}" data-link>${p.categoryTitle}</a>
            </div>
            <h1 class="prob-title">${p.title}</h1>
            <div class="prob-meta">
              ${diffBadge(p.difficulty)}
              <span id="status-badge">${statusBadge(status)}</span>
              <span>⏱ ${p.timeLimitMs / 1000}s</span><span>💾 ${p.memoryMb} MB</span>
              <span>🧪 ${p.testCount} test (${p.samples.length} mẫu, ${p.hiddenCount} ẩn)</span>
            </div>
            <div class="statement">${raw(p.statementHtml)}</div>
            <h3 style="margin-top:22px">Ví dụ</h3>
            ${p.samples.map((s, i) => html`
              <div class="sample">
                <div class="sample-head"><span>Ví dụ ${i + 1}</span><button class="btn btn-sm btn-ghost" data-try="${i}">▶ Chạy thử với ví dụ này</button></div>
                <div class="sample-body">
                  <div><div class="sample-label">Input <button class="copy-btn" data-copy-sample="${i}" data-kind="input">Sao chép</button></div><pre>${s.input}</pre></div>
                  <div><div class="sample-label">Output <button class="copy-btn" data-copy-sample="${i}" data-kind="output">Sao chép</button></div><pre>${s.output}</pre></div>
                </div>
              </div>`)}
            ${p.hintHtml ? html`<details class="hint-box"><summary>💡 Gợi ý</summary><div class="statement">${raw(p.hintHtml)}</div></details>` : ''}
            <div class="small faint" style="margin-top:22px">Lưu ý: output được so sánh theo từng dòng, bỏ qua khoảng trắng thừa ở cuối dòng và các dòng trống ở cuối. Không in thêm thông báo kiểu "Nhap n:".</div>
          </div>
          <div class="ws-pane hidden" data-lpane="subs"><div id="subs-list"></div></div>
          <div class="ws-pane hidden" data-lpane="sol"><div id="sol-box"></div></div>
        </div>
        <div class="prob-nav">
          ${p.prev ? html`<a class="btn btn-sm" href="/problems/${p.prev}" data-link>← Bài trước</a>` : html`<span></span>`}
          <a class="btn btn-sm btn-ghost" href="/topics/${p.topicSlug}" data-link>☰ Danh sách bài</a>
          ${p.next ? html`<a class="btn btn-sm" href="/problems/${p.next}" data-link>Bài sau →</a>` : html`<span></span>`}
        </div>
      </section>
      <div class="gutter-x" id="gutter-x" title="Kéo để thay đổi kích thước"></div>
      <section class="ws-right" id="ws-right">
        <div class="editor-toolbar">
          <div class="file-tab"><span class="c-icon">C</span> main.c</div>
          <span class="save-state" id="save-state"></span>
          <span class="spacer"></span>
          <button class="icon-btn" id="font-dec" title="Giảm cỡ chữ">A−</button>
          <button class="icon-btn" id="font-inc" title="Tăng cỡ chữ">A+</button>
          <button class="btn btn-sm btn-ghost" id="reset-code" title="Khôi phục mã khởi đầu">↺ Đặt lại</button>
        </div>
        <div class="editor-host" id="editor-host"></div>
        <div class="gutter-y" id="gutter-y"></div>
        <div class="bottom-panel" id="bottom-panel" style="height:${bottomH}">
          <div class="tabs" id="bottom-tabs">
            <button class="tab active" data-btab="run">⌨ Chạy thử</button>
            <button class="tab" data-btab="result">🧪 Kết quả chấm <span id="result-dot"></span></button>
          </div>
          <div class="ws-scroll">
            <div class="console-pane" data-bpane="run">
              <div class="row" style="justify-content:space-between;margin-bottom:6px">
                <span class="small muted">Input (stdin)</span>
                <span class="row" style="gap:6px">${p.samples.map((_, i) => html`<button class="btn btn-sm" data-fill="${i}">Ví dụ ${i + 1}</button>`)}</span>
              </div>
              <textarea class="input" id="run-input" spellcheck="false" placeholder="Nhập dữ liệu vào cho chương trình...">${p.samples[0] ? p.samples[0].input : ''}</textarea>
              <div id="run-output" class="run-out"></div>
            </div>
            <div class="console-pane hidden" data-bpane="result">
              <div id="result-box"><div class="empty small">Nhấn <b>Nộp bài</b> để chấm với toàn bộ ${p.testCount} test case.</div></div>
            </div>
          </div>
          <div class="action-bar">
            <span class="hint-keys"><kbd>Ctrl</kbd>+<kbd>'</kbd> chạy thử · <kbd>Ctrl</kbd>+<kbd>Enter</kbd> nộp bài</span>
            <span class="spacer"></span>
            ${state.user ? html`
              <button class="btn" id="run-btn">▶ Chạy thử</button>
              <button class="btn btn-success" id="submit-btn">⬆ Nộp bài</button>` : html`
              <a class="btn btn-primary" href="/login?next=${encodeURIComponent('/problems/' + p.slug)}" data-link>Đăng nhập để chạy & nộp bài</a>`}
          </div>
        </div>
      </section>
    </div>`);

  /* ---------- Editor ---------- */
  const saveState = $('#save-state');
  const saveServer = debounce(async (code) => {
    if (!state.user) return;
    try {
      await api.put(`/api/problems/${p.slug}/draft`, { code });
      saveState.textContent = '✓ Đã lưu';
    } catch {
      saveState.textContent = '⚠ Lưu trên máy (mất kết nối)';
    }
  }, 1500);
  const saveLocal = debounce((code) => writeLocal(p.slug, code), 300);
  let dirty = false;
  const editor = await createEditor($('#editor-host'), {
    value: initial,
    onChange: (code) => {
      dirty = true;
      saveState.textContent = state.user ? 'Đang lưu…' : 'Đã lưu trên trình duyệt';
      saveLocal(code);
      saveServer(code);
    },
  });
  if (!isCurrent()) { editor.dispose(); return; }
  saveState.textContent = data.draft ? `Bản nháp ${timeAgo(data.draft.updatedAt)}` : '';

  let fontSize = Number(localStorage.getItem('editorFontSize')) || 14;
  const setFont = (n) => { fontSize = Math.max(10, Math.min(28, n)); editor.setFontSize(fontSize); localStorage.setItem('editorFontSize', fontSize); };
  $('#font-inc').addEventListener('click', () => setFont(fontSize + 1));
  $('#font-dec').addEventListener('click', () => setFont(fontSize - 1));
  $('#reset-code').addEventListener('click', async () => {
    if (await confirmDialog('Khôi phục mã khởi đầu? Mã hiện tại sẽ bị thay thế (bạn vẫn có thể nhấn Ctrl+Z để hoàn tác).', { okText: 'Đặt lại' })) {
      editor.setValue(p.starter);
      editor.focus();
    }
  });

  /* ---------- Tabs ---------- */
  const showLeft = (name) => {
    $$('#left-tabs .tab').forEach((t) => t.classList.toggle('active', t.dataset.ltab === name));
    $$('[data-lpane]').forEach((x) => x.classList.toggle('hidden', x.dataset.lpane !== name));
    if (name === 'subs') loadSubs();
    if (name === 'sol') renderSolution();
  };
  const showBottom = (name) => {
    $$('#bottom-tabs .tab').forEach((t) => t.classList.toggle('active', t.dataset.btab === name));
    $$('[data-bpane]').forEach((x) => x.classList.toggle('hidden', x.dataset.bpane !== name));
  };
  on(app, 'click', '[data-ltab]', (e, b) => showLeft(b.dataset.ltab));
  on(app, 'click', '[data-btab]', (e, b) => showBottom(b.dataset.btab));
  on(app, 'click', '[data-fill]', (e, b) => { $('#run-input').value = p.samples[Number(b.dataset.fill)].input; });
  on(app, 'click', '[data-copy-sample]', (e, b) => copyText(p.samples[Number(b.dataset.copySample)][b.dataset.kind]));
  on(app, 'click', '[data-try]', (e, b) => {
    $('#run-input').value = p.samples[Number(b.dataset.try)].input;
    showBottom('run');
    runCode();
  });

  /* ---------- Chạy thử ---------- */
  let busy = false;
  const setBusy = (v, which) => {
    busy = v;
    const rb = $('#run-btn');
    const sb = $('#submit-btn');
    if (!rb || !sb) return;
    rb.disabled = v; sb.disabled = v;
    rb.innerHTML = v && which === 'run' ? '<span class="spinner sm"></span> Đang chạy…' : '▶ Chạy thử';
    sb.innerHTML = v && which === 'submit' ? '<span class="spinner sm"></span> Đang chấm…' : '⬆ Nộp bài';
  };

  const applyMarkers = (compileOutput) => editor.setMarkers(parseGccOutput(compileOutput));

  async function runCode() {
    if (!state.user) { toast('Bạn cần đăng nhập để chạy thử.', 'err'); return; }
    if (busy) return;
    setBusy(true, 'run');
    showBottom('run');
    const out = $('#run-output');
    render(out, html`<div class="row small muted"><span class="spinner sm"></span> Đang biên dịch và chạy…</div>`);
    try {
      const { result: r } = await api.post(`/api/problems/${p.slug}/run`, { code: editor.getValue(), input: $('#run-input').value });
      applyMarkers(r.compileOutput);
      render(out, runResult(r));
      out.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    } catch (e) {
      render(out, html`<div class="form-error">${e.message}</div>`);
    } finally {
      setBusy(false);
    }
  }

  /* ---------- Nộp bài ---------- */
  let currentSub = null;
  bindResult($('#result-box'), () => currentSub);
  on($('#run-output'), 'click', '[data-copy]', (e, b) => copyText(b.dataset.copy));

  async function submitCode() {
    if (!state.user) { toast('Bạn cần đăng nhập để nộp bài.', 'err'); return; }
    if (busy) return;
    setBusy(true, 'submit');
    showBottom('result');
    const box = $('#result-box');
    render(box, html`<div class="row muted"><span class="spinner sm"></span> Đang chấm bài với ${p.testCount} test case…</div>`);
    try {
      saveServer.flush(editor.getValue());
      const r = await api.post(`/api/problems/${p.slug}/submit`, { code: editor.getValue() });
      currentSub = r.submission;
      applyMarkers(currentSub.compileOutput);
      render(box, html`${resultView(currentSub)}${currentSub.verdict === 'AC' ? acceptedActions() : ''}`);
      $('#result-dot').innerHTML = currentSub.verdict === 'AC' ? '<span style="color:var(--ok)">●</span>' : '<span style="color:var(--bad)">●</span>';
      status = {
        ...(status || {}),
        status: currentSub.verdict === 'AC' || status?.status === 'solved' ? 'solved' : 'attempted',
        attempts: (status?.attempts || 0) + 1,
      };
      $('#status-badge').innerHTML = statusBadge(status).s;
      const subTab = $('[data-ltab="subs"]');
      subTab.innerHTML = `🕘 Bài nộp <span class="count">${status.attempts}</span>`;
      subsLoaded = false;
      if (r.solution) {
        solution = r.solution;
        $('[data-ltab="sol"]').textContent = '💡 Lời giải mẫu';
      }
      if (currentSub.verdict === 'AC') {
        if (r.firstSolve) { celebrate(); toast('🎉 Chúc mừng! Bạn đã giải được bài này.', 'ok'); }
        else toast('✓ Accepted', 'ok');
      } else {
        toast(`${VERDICT_LABEL[currentSub.verdict]} — đúng ${currentSub.passed}/${currentSub.total} test`, 'err');
      }
    } catch (e) {
      render(box, html`<div class="form-error">${e.message}</div>`);
    } finally {
      setBusy(false);
    }
  }

  function acceptedActions() {
    return html`<div class="row" style="margin-top:16px">
      ${p.next ? html`<a class="btn btn-primary" href="/problems/${p.next}" data-link>Bài tiếp theo →</a>` : html`<a class="btn btn-primary" href="/topics" data-link>Chọn chủ đề khác</a>`}
      <button class="btn" data-ltab="sol">💡 Xem lời giải mẫu</button>
    </div>`;
  }

  $('#run-btn')?.addEventListener('click', runCode);
  $('#submit-btn')?.addEventListener('click', submitCode);
  editor.addKey("mod+'", runCode);
  editor.addKey('mod+enter', submitCode);
  editor.addKey('mod+s', () => { saveLocal.flush(editor.getValue()); saveServer.flush(editor.getValue()); toast('Đã lưu bản nháp', 'ok'); });
  const onKey = (e) => {
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.key === 'Enter') { e.preventDefault(); submitCode(); }
    else if (mod && e.key === "'") { e.preventDefault(); runCode(); }
    else if (mod && e.key.toLowerCase() === 's') { e.preventDefault(); }
  };
  document.addEventListener('keydown', onKey);

  /* ---------- Lịch sử nộp của bài này ---------- */
  let subsLoaded = false;
  async function loadSubs() {
    const box = $('#subs-list');
    if (!state.user) { render(box, html`<div class="empty">Đăng nhập để xem lịch sử nộp bài.</div>`); return; }
    if (subsLoaded) return;
    render(box, html`<div class="row muted small"><span class="spinner sm"></span> Đang tải…</div>`);
    try {
      const { submissions } = await api.get(`/api/problems/${p.slug}/submissions`);
      subsLoaded = true;
      render(box, submissions.length ? html`
        <div class="table-wrap"><table class="table">
          <thead><tr><th>Kết quả</th><th class="num">Test</th><th class="num">Thời gian</th><th>Lúc nộp</th><th></th></tr></thead>
          <tbody>${submissions.map((s) => html`
            <tr>
              <td>${verdictTag(s.verdict)}</td><td class="num">${s.passed}/${s.total}</td><td class="num">${s.timeMs} ms</td>
              <td class="small muted nowrap">${timeAgo(s.createdAt)}</td>
              <td class="nowrap"><button class="btn btn-sm" data-view-sub="${s.id}">Xem</button></td>
            </tr>`)}</tbody>
        </table></div>` : html`<div class="empty"><div class="big">📭</div>Bạn chưa nộp bài này lần nào.</div>`);
    } catch (e) {
      render(box, html`<div class="form-error">${e.message}</div>`);
    }
  }
  on(app, 'click', '[data-view-sub]', async (e, b) => {
    try {
      const { submission: s } = await api.get('/api/submissions/' + b.dataset.viewSub);
      const m = modal(html`
        <div class="row" style="justify-content:space-between;margin-bottom:10px"><h2 style="margin:0">Bài nộp #${s.id}</h2><button class="btn btn-sm btn-ghost" data-close>✕</button></div>
        <div class="row small muted" style="margin-bottom:10px">${verdictTag(s.verdict)}<span>${timeAgo(s.createdAt)}</span><span class="spacer"></span>
          <button class="btn btn-sm" data-load-code>⤓ Nạp mã này vào trình soạn thảo</button>
          <a class="btn btn-sm" href="/submissions/${s.id}" data-link data-close>Mở trang chi tiết</a></div>
        <pre style="max-height:300px">${s.code}</pre>
        <div style="margin-top:14px" data-sub-result>${resultView(s, { compact: true })}</div>`, { wide: true });
      bindResult(m.el, () => s);
      m.el.querySelector('[data-load-code]').addEventListener('click', () => { editor.setValue(s.code); m.close(); toast('Đã nạp mã vào trình soạn thảo'); });
    } catch (err) { toast(err.message, 'err'); }
  });

  /* ---------- Lời giải ---------- */
  function renderSolution() {
    const box = $('#sol-box');
    if (!solution) {
      render(box, html`<div class="empty"><div class="big">🔒</div><h3>Lời giải mẫu đang bị khóa</h3>
        <p>Hãy tự giải bài này trước! Lời giải mẫu sẽ mở khi bạn được <b>Accepted</b>.</p>
        <p class="small">Mẹo: đọc kỹ gợi ý, thử với các ví dụ, tự nghĩ thêm các trường hợp đặc biệt.</p></div>`);
      return;
    }
    render(box, html`
      <p class="muted small">Đây là một cách giải tham khảo. So sánh với bài làm của bạn để học thêm cách viết khác nhé.</p>
      <div class="row" style="justify-content:flex-end;margin-bottom:6px"><button class="btn btn-sm" data-copy-sol>Sao chép</button></div>
      <pre>${solution}</pre>`);
    box.querySelector('[data-copy-sol]').addEventListener('click', () => copyText(solution));
  }

  /* ---------- Kéo thay đổi kích thước ---------- */
  const offDrag = setupGutters();

  const onBeforeUnload = (e) => { if (dirty) { saveLocal.flush(editor.getValue()); } void e; };
  window.addEventListener('beforeunload', onBeforeUnload);

  return () => {
    if (dirty) { saveLocal.flush(editor.getValue()); saveServer.flush(editor.getValue()); }
    document.removeEventListener('keydown', onKey);
    window.removeEventListener('beforeunload', onBeforeUnload);
    offDrag();
    editor.dispose();
    document.title = 'C Lab — Luyện tập lập trình C';
  };
}

function statusBadge(st) {
  if (!st) return html`<span class="badge neutral">Chưa làm</span>`;
  if (st.status === 'solved') return html`<span class="badge easy">✓ Đã giải</span>`;
  return html`<span class="badge medium">Đang làm · ${st.attempts} lần nộp</span>`;
}

function runResult(r) {
  if (r.status === 'CE') {
    return html`<div class="verdict-banner fail"><div><div class="vb-title">Lỗi biên dịch</div><div class="vb-sub">Sửa các lỗi bên dưới rồi chạy lại (các dòng lỗi đã được gạch chân trong trình soạn thảo).</div></div></div>
      <pre class="compile-out">${r.compileOutput}</pre>`;
  }
  const ok = r.status === 'OK';
  const banner = !ok
    ? html`<div class="verdict-banner ${r.status === 'TLE' ? 'warn' : 'fail'}"><div><div class="vb-title">${VERDICT_LABEL[r.status] || r.status}</div><div class="vb-sub">${r.message}</div></div></div>`
    : r.match === true
      ? html`<div class="verdict-banner AC"><div><div class="vb-title">✓ Output khớp với ví dụ</div><div class="vb-sub">${r.timeMs} ms · Hãy nộp bài để chấm với toàn bộ test.</div></div></div>`
      : r.match === false
        ? html`<div class="verdict-banner fail"><div><div class="vb-title">✗ Output khác với ví dụ</div><div class="vb-sub">${r.timeMs} ms · So sánh output của bạn với output mong đợi.</div></div></div>`
        : html`<div class="small muted">Chạy xong trong ${r.timeMs} ms.</div>`;
  return html`
    ${banner}
    ${r.compileOutput ? html`<div class="out-label">Cảnh báo</div><pre class="compile-out warn">${r.compileOutput}</pre>` : ''}
    <div class="${r.expected !== undefined ? 'grid grid-2' : ''}">
      <div><div class="out-label">Output (stdout) <button class="copy-btn" data-copy="${r.stdout || ''}">Sao chép</button></div><pre>${r.stdout || html`<span class="faint">(không có output)</span>`}</pre></div>
      ${r.expected !== undefined ? html`<div><div class="out-label">Output mong đợi</div><pre>${r.expected}</pre></div>` : ''}
    </div>
    ${r.stderr ? html`<div class="out-label">stderr</div><pre class="compile-out warn">${r.stderr}</pre>` : ''}`;
}

function setupGutters() {
  const left = $('#ws-left');
  const ws = $('#ws');
  const gx = $('#gutter-x');
  const gy = $('#gutter-y');
  const right = $('#ws-right');
  const bottom = $('#bottom-panel');
  const drag = (gutter, onMove, onEnd) => {
    gutter.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      gutter.classList.add('dragging');
      gutter.setPointerCapture(e.pointerId);
      document.body.style.userSelect = 'none';
      const move = (ev) => onMove(ev);
      const up = () => {
        gutter.classList.remove('dragging');
        document.body.style.userSelect = '';
        gutter.removeEventListener('pointermove', move);
        gutter.removeEventListener('pointerup', up);
        onEnd();
      };
      gutter.addEventListener('pointermove', move);
      gutter.addEventListener('pointerup', up);
    });
  };
  drag(gx, (e) => {
    const r = ws.getBoundingClientRect();
    const pctW = Math.min(70, Math.max(22, ((e.clientX - r.left) / r.width) * 100));
    left.style.width = pctW + '%';
  }, () => localStorage.setItem('ws:left', left.style.width));
  drag(gy, (e) => {
    const r = right.getBoundingClientRect();
    const pctH = Math.min(80, Math.max(12, ((r.bottom - e.clientY) / r.height) * 100));
    bottom.style.height = pctH + '%';
  }, () => localStorage.setItem('ws:bottom', bottom.style.height));
  return () => {};
}

