'use strict';
/**
 * Bộ chấm bài C: biên dịch bằng gcc, chạy từng test case trong sandbox
 * (seccomp + rlimit, xem sandbox.c), so sánh output.
 */
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const config = require('../config');

const WORK_ROOT = path.join(os.tmpdir(), 'cjudge');
const SANDBOX_SRC = path.join(__dirname, 'sandbox.c');
const SANDBOX_OBJ = path.join(WORK_ROOT, 'sandbox.o');

const MAX_SOURCE_BYTES = 64 * 1024;
const MAX_OUTPUT_BYTES = 4 * 1024 * 1024;
const MAX_STDERR_BYTES = 16 * 1024;
const MAX_COMPILE_OUTPUT = 16 * 1024;
const RESULT_OUTPUT_PREVIEW = 4 * 1024;

const ALLOWED_INCLUDE_PREFIXES = ['/usr/include/', '/usr/lib/gcc/', '/usr/local/include/'];
const FORBIDDEN_TOKEN_RE = /\b_*(asm|constructor|section|ifunc|init_array|preinit_array|fini_array|init_priority)_*\b/;

const SIGNAL_MESSAGES = {
  SIGSEGV: 'Segmentation fault — truy cập bộ nhớ không hợp lệ (mảng vượt chỉ số, con trỏ NULL, đệ quy quá sâu...)',
  SIGFPE: 'Floating point exception — lỗi số học (thường là chia cho 0)',
  SIGABRT: 'Aborted — chương trình bị hủy (assert thất bại, lỗi free/malloc...)',
  SIGBUS: 'Bus error — truy cập bộ nhớ sai căn lề',
  SIGILL: 'Illegal instruction — thường do hành vi không xác định (chia cho 0, hàm thiếu return...)',
  SIGSYS: 'Bad system call — chương trình gọi chức năng hệ thống bị cấm',
};

let initPromise = null;

function init() {
  if (!initPromise) {
    initPromise = (async () => {
      await fsp.mkdir(WORK_ROOT, { recursive: true });
      const r = await exec('gcc', ['-O2', '-c', SANDBOX_SRC, '-o', SANDBOX_OBJ], { timeoutMs: 30000 });
      if (r.code !== 0) throw new Error('Không biên dịch được sandbox.c:\n' + r.stderr);
    })();
    initPromise.catch(() => { initPromise = null; });
  }
  return initPromise;
}

/* ---------- Hàng đợi giới hạn số tiến trình chấm đồng thời ---------- */
let active = 0;
const waiting = [];
function acquire() {
  if (active < config.judgeConcurrency) { active++; return Promise.resolve(); }
  return new Promise((resolve) => waiting.push(resolve));
}
function release() {
  const next = waiting.shift();
  if (next) next(); else active--;
}
async function withSlot(fn) {
  await acquire();
  try { return await fn(); } finally { release(); }
}
function queueStats() { return { active, waiting: waiting.length, concurrency: config.judgeConcurrency }; }

/* ---------- Tiện ích chạy tiến trình ---------- */
function exec(cmd, args, { cwd, input, timeoutMs = 10000, env, maxOut = MAX_OUTPUT_BYTES, maxErr = MAX_COMPILE_OUTPUT } = {}) {
  return new Promise((resolve) => {
    const started = process.hrtime.bigint();
    let stdout = Buffer.alloc(0);
    let stderr = Buffer.alloc(0);
    let outOverflow = false;
    let timedOut = false;
    let child;
    try {
      child = spawn(cmd, args, { cwd, env: env || { PATH: process.env.PATH, LANG: 'C', LC_ALL: 'C' }, stdio: ['pipe', 'pipe', 'pipe'] });
    } catch (e) {
      resolve({ code: -1, signal: null, stdout: '', stderr: String(e), timeMs: 0, timedOut: false, outOverflow: false, error: e });
      return;
    }
    const kill = () => { try { child.kill('SIGKILL'); } catch { /* đã thoát */ } };
    const timer = setTimeout(() => { timedOut = true; kill(); }, timeoutMs);
    child.stdout.on('data', (d) => {
      if (stdout.length + d.length > maxOut) {
        stdout = Buffer.concat([stdout, d.subarray(0, Math.max(0, maxOut - stdout.length))]);
        outOverflow = true;
        kill();
      } else stdout = Buffer.concat([stdout, d]);
    });
    child.stderr.on('data', (d) => {
      if (stderr.length < maxErr) stderr = Buffer.concat([stderr, d.subarray(0, maxErr - stderr.length)]);
    });
    child.stdin.on('error', () => { /* chương trình có thể thoát trước khi đọc hết input */ });
    child.on('error', (e) => {
      clearTimeout(timer);
      resolve({ code: -1, signal: null, stdout: '', stderr: String(e), timeMs: 0, timedOut, outOverflow, error: e });
    });
    child.on('close', (code, signal) => {
      clearTimeout(timer);
      const timeMs = Number(process.hrtime.bigint() - started) / 1e6;
      resolve({ code, signal, stdout: stdout.toString('utf8'), stderr: stderr.toString('utf8'), timeMs, timedOut, outOverflow });
    });
    if (input) child.stdin.end(input); else child.stdin.end();
  });
}

/* ---------- So sánh output ---------- */
function normalize(s) {
  return String(s)
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((l) => l.replace(/[ \t]+$/, ''))
    .join('\n')
    .replace(/\n+$/, '');
}
function outputsMatch(actual, expected) {
  return normalize(actual) === normalize(expected);
}

function truncate(s, n = RESULT_OUTPUT_PREVIEW) {
  if (s == null) return s;
  return s.length > n ? s.slice(0, n) + '\n… (đã cắt bớt)' : s;
}

/* ---------- Kiểm tra mã nguồn trước khi biên dịch ---------- */
function stripLiterals(code) {
  return code
    .replace(/"(?:\\.|[^"\\\n])*"/g, '""')
    .replace(/'(?:\\.|[^'\\\n])*'/g, "''");
}

async function securityCheck(dir) {
  // 1) Mọi file được #include phải là header hệ thống.
  const deps = await gcc(['-std=gnu11', '-M', 'main.c'], { cwd: dir, timeoutMs: 10000 });
  if (deps.timedOut || deps.outOverflow || deps.signal) return 'Mã nguồn quá phức tạp để tiền xử lý.';
  if (deps.code !== 0) return null; // lỗi cú pháp tiền xử lý: để bước biên dịch báo lỗi chi tiết
  const files = deps.stdout.replace(/\\\n/g, ' ').split(':').slice(1).join(':').trim().split(/\s+/).filter(Boolean);
  for (const f of files) {
    if (f === 'main.c') continue;
    const resolved = path.resolve(dir, f);
    if (!ALLOWED_INCLUDE_PREFIXES.some((p) => resolved.startsWith(p))) {
      return `Không được phép #include file "${f}". Chỉ dùng các thư viện chuẩn như <stdio.h>, <math.h>, <string.h>...`;
    }
  }
  // 2) Không dùng inline assembly / constructor / section (có thể vượt sandbox).
  const pre = await gcc(['-std=gnu11', '-E', 'main.c'], { cwd: dir, timeoutMs: 10000, maxOut: 8 * 1024 * 1024 });
  if (pre.timedOut || pre.outOverflow || pre.signal) return 'Mã nguồn sau tiền xử lý quá lớn (kiểm tra các macro).';
  if (pre.code !== 0) return null;
  let inMain = false;
  let lineNo = 0;
  for (const line of pre.stdout.split('\n')) {
    const marker = /^# (\d+) "([^"]*)"/.exec(line);
    if (marker) { inMain = marker[2] === 'main.c'; lineNo = Number(marker[1]); continue; }
    if (inMain) {
      const m = FORBIDDEN_TOKEN_RE.exec(stripLiterals(line));
      if (m) return `main.c:${lineNo}: không được phép sử dụng "${m[0]}" trong bài nộp.`;
    }
    lineNo++;
  }
  return null;
}

/** Chạy gcc với giới hạn bộ nhớ ảo 1.5 GB và 20 giây CPU (chống mã nguồn làm treo/tràn bộ nhớ trình biên dịch). */
function gcc(args, opts) {
  return exec('/bin/sh', ['-c', 'ulimit -v 1572864 -t 20 2>/dev/null; exec gcc "$@"', 'gcc', ...args], opts);
}

function cleanCompilerOutput(s, dir) {
  return truncate(s.split(dir + path.sep).join('').split(dir).join('.'), MAX_COMPILE_OUTPUT);
}

/**
 * Biên dịch mã nguồn. Trả về { ok, dir, bin, output } — gọi cleanup(dir) sau khi dùng.
 */
async function compile(code) {
  await init();
  if (typeof code !== 'string' || !code.trim()) return { ok: false, output: 'Mã nguồn trống.' };
  if (Buffer.byteLength(code, 'utf8') > MAX_SOURCE_BYTES) return { ok: false, output: `Mã nguồn quá dài (tối đa ${MAX_SOURCE_BYTES / 1024} KB).` };

  const dir = await fsp.mkdtemp(path.join(WORK_ROOT, 'job-'));
  await fsp.writeFile(path.join(dir, 'main.c'), code, 'utf8');

  const violation = await securityCheck(dir);
  if (violation) return { ok: false, dir, output: violation };

  const r = await gcc([
    '-std=gnu11', '-O2', '-pipe', '-Wall', '-Wno-unused-result', '-fdiagnostics-color=never', '-fmax-errors=20',
    'main.c', SANDBOX_OBJ, '-o', 'prog', '-lm',
  ], { cwd: dir, timeoutMs: config.compileTimeoutMs });

  const output = cleanCompilerOutput(r.stderr, dir);
  if (r.timedOut) return { ok: false, dir, output: 'Biên dịch quá thời gian cho phép.' };
  if (r.code !== 0) return { ok: false, dir, output: output || 'Biên dịch thất bại.' };
  return { ok: true, dir, bin: path.join(dir, 'prog'), output };
}

async function cleanup(dir) {
  if (dir && dir.startsWith(WORK_ROOT)) await fsp.rm(dir, { recursive: true, force: true }).catch(() => {});
}

/**
 * Chạy chương trình đã biên dịch với một input.
 */
async function runBinary(bin, input, { timeLimitMs, memoryMb }) {
  const cpuSec = Math.max(1, Math.ceil(timeLimitMs / 1000));
  const r = await exec(bin, [], {
    cwd: path.dirname(bin),
    input,
    timeoutMs: timeLimitMs + 250,
    env: { SBX_CPU: String(cpuSec), SBX_MEM: String(memoryMb), LANG: 'C' },
    maxOut: MAX_OUTPUT_BYTES,
    maxErr: MAX_STDERR_BYTES,
  });
  let status = 'OK';
  let message = '';
  if (r.timedOut || r.signal === 'SIGXCPU' || r.timeMs > timeLimitMs) {
    status = 'TLE';
    message = `Chương trình chạy quá ${timeLimitMs} ms (vòng lặp vô hạn hoặc thuật toán chưa đủ nhanh?)`;
  } else if (r.outOverflow) {
    status = 'OLE';
    message = 'Output quá lớn (vượt 4 MB) — kiểm tra vòng lặp in ra.';
  } else if (r.signal) {
    status = 'RE';
    message = SIGNAL_MESSAGES[r.signal] || `Chương trình bị dừng bởi tín hiệu ${r.signal}`;
  } else if (r.code === 121) {
    status = 'RE';
    message = 'Không khởi tạo được môi trường chạy an toàn.';
  } else if (r.code !== 0) {
    status = 'RE';
    message = `Chương trình kết thúc với mã lỗi ${r.code} (hàm main nên return 0).`;
  }
  return { status, message, stdout: r.stdout, stderr: r.stderr, timeMs: Math.round(r.timeMs) };
}

/**
 * Chấm bài: biên dịch rồi chạy tất cả test.
 * tests: [{ input, output, hidden }]
 */
async function judge(code, tests, { timeLimitMs = config.defaultTimeLimitMs, memoryMb = config.defaultMemoryMb } = {}) {
  return withSlot(async () => {
    const c = await compile(code);
    try {
      if (!c.ok) {
        return { verdict: 'CE', compileOutput: c.output, passed: 0, total: tests.length, timeMs: 0, tests: [] };
      }
      const results = [];
      let passed = 0;
      let maxTime = 0;
      let verdict = 'AC';
      for (let i = 0; i < tests.length; i++) {
        const t = tests[i];
        const r = await runBinary(c.bin, t.input, { timeLimitMs, memoryMb });
        let v = r.status;
        if (v === 'OK') v = outputsMatch(r.stdout, t.output) ? 'AC' : 'WA';
        if (v === 'AC') passed++;
        else if (verdict === 'AC') verdict = v;
        maxTime = Math.max(maxTime, r.timeMs);
        results.push({
          index: i + 1,
          verdict: v,
          timeMs: r.timeMs,
          hidden: !!t.hidden,
          message: r.message,
          input: truncate(t.input),
          expected: truncate(t.output),
          actual: truncate(r.stdout),
          stderr: truncate(r.stderr, 2048),
        });
      }
      return { verdict, compileOutput: c.output, passed, total: tests.length, timeMs: maxTime, tests: results };
    } finally {
      await cleanup(c.dir);
    }
  });
}

/**
 * Chạy thử với input tùy ý (không chấm điểm).
 */
async function runCustom(code, input, { timeLimitMs = config.defaultTimeLimitMs, memoryMb = config.defaultMemoryMb } = {}) {
  return withSlot(async () => {
    const c = await compile(code);
    try {
      if (!c.ok) return { status: 'CE', compileOutput: c.output };
      const r = await runBinary(c.bin, input || '', { timeLimitMs, memoryMb });
      return {
        status: r.status, message: r.message, compileOutput: c.output,
        stdout: truncate(r.stdout, 64 * 1024), stderr: truncate(r.stderr, 4096), timeMs: r.timeMs,
      };
    } finally {
      await cleanup(c.dir);
    }
  });
}

/** Dùng cho script sinh đáp án: chạy lời giải mẫu không qua hàng đợi giới hạn thời gian chặt. */
async function runReference(code, inputs, opts = {}) {
  const c = await compile(code);
  try {
    if (!c.ok) throw new Error('Lời giải mẫu không biên dịch được:\n' + c.output);
    const outs = [];
    for (const input of inputs) {
      const r = await runBinary(c.bin, input, { timeLimitMs: opts.timeLimitMs || 5000, memoryMb: opts.memoryMb || 256 });
      if (r.status !== 'OK') throw new Error(`Lời giải mẫu lỗi ${r.status} (${r.message}) với input:\n${input}`);
      if (opts.maxTimeMs && r.timeMs > opts.maxTimeMs) throw new Error(`Lời giải mẫu chạy quá chậm (${r.timeMs} ms > ${opts.maxTimeMs} ms) với input:\n${input.slice(0, 200)}`);
      outs.push(r.stdout);
    }
    return outs;
  } finally {
    await cleanup(c.dir);
  }
}

function sweepStaleJobs() {
  try {
    if (!fs.existsSync(WORK_ROOT)) return;
    for (const name of fs.readdirSync(WORK_ROOT)) {
      if (name.startsWith('job-')) fs.rmSync(path.join(WORK_ROOT, name), { recursive: true, force: true });
    }
  } catch { /* bỏ qua */ }
}

module.exports = { init, judge, runCustom, runReference, outputsMatch, normalize, queueStats, sweepStaleJobs };
