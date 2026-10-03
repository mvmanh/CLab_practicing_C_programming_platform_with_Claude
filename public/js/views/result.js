/* Hiển thị kết quả chấm bài (dùng chung cho trang làm bài và trang chi tiết bài nộp) */
import { html, esc, raw, VERDICT_LABEL, VERDICT_VI, on, $, copyText } from '../util.js';

const VERDICT_HELP = {
  WA: 'Chương trình chạy được nhưng in ra kết quả khác đáp án. Hãy so sánh output của bạn với output mong đợi (chú ý định dạng, khoảng trắng, xuống dòng, số chữ số thập phân).',
  TLE: 'Chương trình chạy quá lâu. Kiểm tra vòng lặp vô hạn, hoặc tìm thuật toán nhanh hơn.',
  RE: 'Chương trình bị lỗi khi chạy. Thường do truy cập mảng ngoài phạm vi, chia cho 0, con trỏ NULL, đệ quy quá sâu, hoặc hàm main không return 0.',
  CE: 'Mã nguồn không biên dịch được. Đọc thông báo lỗi bên dưới (dòng:cột) để sửa.',
  OLE: 'Chương trình in ra quá nhiều dữ liệu, có thể do vòng lặp in vô hạn.',
};

/** Đánh dấu các dòng output khác với output mong đợi. */
function diffLines(actual, expected) {
  const norm = (s) => String(s ?? '').replace(/\r/g, '').split('\n').map((l) => l.replace(/[ \t]+$/, ''));
  const a = norm(actual);
  const e = norm(expected);
  while (a.length && a[a.length - 1] === '') a.pop();
  while (e.length && e[e.length - 1] === '') e.pop();
  let firstDiff = -1;
  const lines = a.map((line, i) => {
    const bad = line !== e[i];
    if (bad && firstDiff < 0) firstDiff = i;
    return bad ? `<span class="diff-bad">${esc(line) || ' '}</span>` : esc(line) + '\n';
  });
  if (a.length < e.length && firstDiff < 0) firstDiff = a.length;
  return { html: lines.join('').replace(/\n$/, ''), firstDiff, missing: Math.max(0, e.length - a.length) };
}

export function testDetail(t) {
  if (!t) return '';
  if (t.hidden && t.input === undefined) {
    return html`<div class="test-detail"><p class="muted small">🔒 Test ẩn — nội dung không được hiển thị. ${t.verdict === 'AC' ? 'Bạn đã vượt qua test này.' : 'Hãy kiểm tra lại các trường hợp đặc biệt (giá trị biên, số âm, số 0, dữ liệu lớn...).'}</p>
      ${t.message ? html`<div class="form-error small">${t.message}</div>` : ''}</div>`;
  }
  const d = t.verdict === 'WA' ? diffLines(t.actual, t.expected) : null;
  return html`
    <div class="test-detail">
      ${t.message ? html`<div class="form-error small" style="margin-bottom:8px">${t.message}</div>` : ''}
      ${d && d.firstDiff >= 0 ? html`<div class="small muted" style="margin-bottom:6px">Khác biệt đầu tiên ở dòng ${d.firstDiff + 1} của output${d.missing ? ` · thiếu ${d.missing} dòng` : ''}.</div>` : ''}
      <div class="out-label">Input <button class="copy-btn" data-copy="${t.input}">Sao chép</button></div>
      <pre>${t.input}</pre>
      <div class="grid grid-2" style="margin-top:4px">
        <div><div class="out-label">Output của bạn</div><pre>${d ? raw(d.html) : t.actual || html`<span class="faint">(trống)</span>`}</pre></div>
        <div><div class="out-label">Output mong đợi</div><pre>${t.expected}</pre></div>
      </div>
      ${t.stderr ? html`<div class="out-label">stderr</div><pre class="compile-out warn">${t.stderr}</pre>` : ''}
    </div>`;
}

export function resultView(sub, { compact = false } = {}) {
  const v = sub.verdict;
  const cls = v === 'AC' ? 'AC' : v === 'TLE' || v === 'OLE' ? 'warn' : 'fail';
  const firstFail = (sub.tests || []).find((t) => t.verdict !== 'AC');
  const selected = firstFail || (sub.tests || [])[0];
  return html`
    <div class="result" data-result>
      <div class="verdict-banner ${cls}">
        <div>
          <div class="vb-title">${v === 'AC' ? '✓ ' : '✗ '}${VERDICT_LABEL[v] || v}</div>
          <div class="vb-sub">${VERDICT_VI[v]}${v !== 'CE' ? ` · Đúng ${sub.passed}/${sub.total} test · ${sub.timeMs} ms` : ''}</div>
        </div>
      </div>
      ${v !== 'AC' && VERDICT_HELP[v] && !compact ? html`<p class="small muted" style="margin-top:-4px">${VERDICT_HELP[v]}</p>` : ''}
      ${sub.compileOutput ? html`
        <div class="out-label">${v === 'CE' ? 'Lỗi biên dịch' : 'Cảnh báo của trình biên dịch'}</div>
        <pre class="compile-out ${v === 'CE' ? '' : 'warn'}">${sub.compileOutput}</pre>` : ''}
      ${(sub.tests || []).length ? html`
        <div class="out-label" style="margin-top:14px">Các test case</div>
        <div class="test-chips">
          ${sub.tests.map((t) => html`<button class="test-chip ${t.verdict === 'AC' ? 'AC' : 'fail'} ${t === selected ? 'active' : ''}" data-test="${t.index}" title="${VERDICT_VI[t.verdict] || ''} · ${t.timeMs} ms">
            ${t.verdict === 'AC' ? '✓' : '✗'} Test ${t.index}${t.hidden ? ' 🔒' : ''}</button>`)}
        </div>
        <div data-test-detail>${testDetail(selected)}</div>` : ''}
    </div>`;
}

/** Gắn sự kiện chọn test và sao chép cho vùng kết quả (gọi một lần cho mỗi root). */
export function bindResult(root, getSub) {
  on(root, 'click', '[data-test]', (e, btn) => {
    const box = btn.closest('[data-result]');
    const sub = getSub();
    if (!sub) return;
    const t = sub.tests.find((x) => String(x.index) === btn.dataset.test);
    box.querySelectorAll('.test-chip').forEach((b) => b.classList.toggle('active', b === btn));
    $('[data-test-detail]', box).innerHTML = testDetail(t).s;
  });
  on(root, 'click', '[data-copy]', (e, btn) => copyText(btn.dataset.copy));
}
