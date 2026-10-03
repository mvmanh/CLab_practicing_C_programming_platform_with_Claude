#!/usr/bin/env node
'use strict';
/**
 * Build ngân hàng bài tập:
 *   - đọc các file nguồn problems/*.js
 *   - kiểm tra cấu trúc (mỗi bài 3–10 test, slug không trùng...)
 *   - biên dịch & chạy lời giải mẫu để sinh output mong đợi cho từng test
 *   - render đề bài Markdown -> HTML
 *   - ghi ra content/problems.json (server đọc file này khi khởi động)
 *
 * Chạy: npm run build:problems   (thêm --only=<slug-chủ-đề> để build nhanh một chủ đề, kết quả không ghi file)
 */
const fs = require('node:fs');
const path = require('node:path');
const { marked } = require('marked');
const judge = require('../server/judge');

const SRC_DIR = path.join(__dirname, '..', 'problems');
const OUT_FILE = path.join(__dirname, '..', 'content', 'problems.json');

const DEFAULT_STARTER = `#include <stdio.h>

int main() {
    // Viết mã của bạn ở đây

    return 0;
}
`;

const DIFFICULTIES = ['easy', 'medium', 'hard'];
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

marked.setOptions({ gfm: true, breaks: false });

function md(s) {
  return s ? marked.parse(dedent(s)) : '';
}

function dedent(s) {
  const lines = String(s).replace(/^\n+/, '').replace(/\s+$/, '').split('\n');
  const indents = lines.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length);
  const min = indents.length ? Math.min(...indents) : 0;
  return lines.map((l) => l.slice(min)).join('\n');
}

function normInput(s) {
  let t = String(s).replace(/\r\n?/g, '\n');
  if (t.length && !t.endsWith('\n')) t += '\n';
  return t;
}

function fail(msg) {
  throw new Error(msg);
}

function loadSources(only) {
  const files = fs.readdirSync(SRC_DIR).filter((f) => f.endsWith('.js')).sort();
  const topics = files.map((f) => {
    const t = require(path.join(SRC_DIR, f));
    t.__file = f;
    return t;
  });
  return only ? topics.filter((t) => t.slug === only) : topics;
}

function validate(topics) {
  const slugs = new Set();
  const topicSlugs = new Set();
  for (const t of topics) {
    const where = `[${t.__file}]`;
    if (!SLUG_RE.test(t.slug || '')) fail(`${where} slug chủ đề không hợp lệ: ${t.slug}`);
    if (topicSlugs.has(t.slug)) fail(`${where} trùng slug chủ đề ${t.slug}`);
    topicSlugs.add(t.slug);
    if (!t.title) fail(`${where} thiếu title`);
    if (!Array.isArray(t.categories) || !t.categories.length) fail(`${where} chưa có dạng bài nào`);
    for (const c of t.categories) {
      if (!SLUG_RE.test(c.slug || '')) fail(`${where} slug dạng bài không hợp lệ: ${c.slug}`);
      if (!Array.isArray(c.problems) || !c.problems.length) fail(`${where} dạng bài ${c.slug} chưa có bài tập`);
      for (const p of c.problems) {
        const w = `${where} bài "${p.slug}"`;
        if (!SLUG_RE.test(p.slug || '')) fail(`${w}: slug không hợp lệ`);
        if (slugs.has(p.slug)) fail(`${w}: trùng slug`);
        slugs.add(p.slug);
        if (!p.title) fail(`${w}: thiếu title`);
        if (!DIFFICULTIES.includes(p.difficulty)) fail(`${w}: difficulty phải là easy|medium|hard`);
        if (!p.statement) fail(`${w}: thiếu đề bài`);
        if (!p.solution) fail(`${w}: thiếu lời giải mẫu`);
        if (!Array.isArray(p.tests) || p.tests.length < 3 || p.tests.length > 10) fail(`${w}: cần 3–10 test (đang có ${p.tests?.length || 0})`);
      }
    }
  }
}

function statementMarkdown(p) {
  const parts = [dedent(p.statement)];
  if (p.input) parts.push('### Dữ liệu vào\n\n' + dedent(p.input));
  if (p.output) parts.push('### Kết quả\n\n' + dedent(p.output));
  if (p.constraints) parts.push('### Giới hạn\n\n' + dedent(p.constraints));
  return parts.join('\n\n');
}

async function buildProblem(p) {
  const inputs = p.tests.map((t) => normInput(typeof t === 'string' ? t : t.input));
  const outputs = await judge.runReference(dedent(p.solution) + '\n', inputs, { maxTimeMs: (p.timeLimitMs || 2000) / 2 });
  outputs.forEach((o, i) => {
    if (!o.trim()) fail(`Bài "${p.slug}" test ${i + 1}: output rỗng`);
  });
  const nSamples = p.samples ?? 2;
  const uniq = new Set(inputs);
  if (uniq.size !== inputs.length) fail(`Bài "${p.slug}": có test trùng nhau`);
  return {
    slug: p.slug,
    title: p.title,
    difficulty: p.difficulty,
    statementHtml: marked.parse(statementMarkdown(p)),
    hintHtml: p.hint ? md(p.hint) : null,
    starter: p.starter ? dedent(p.starter) + '\n' : DEFAULT_STARTER,
    solution: dedent(p.solution) + '\n',
    timeLimitMs: p.timeLimitMs || 2000,
    memoryMb: p.memoryMb || 256,
    tests: inputs.map((input, i) => ({ input, output: outputs[i], hidden: i >= nSamples })),
  };
}

async function pool(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

/** File kết quả chưa có hoặc cũ hơn file nguồn nào đó? */
function isStale() {
  if (!fs.existsSync(OUT_FILE)) return true;
  const out = fs.statSync(OUT_FILE).mtimeMs;
  const sources = [__filename, ...fs.readdirSync(SRC_DIR).filter((f) => f.endsWith('.js')).map((f) => path.join(SRC_DIR, f))];
  return sources.some((f) => fs.statSync(f).mtimeMs > out);
}

async function main() {
  const only = (process.argv.find((a) => a.startsWith('--only=')) || '').slice(7) || null;
  if (process.argv.includes('--if-stale') && !isStale()) return;
  const t0 = Date.now();
  await judge.init();
  const sources = loadSources(only);
  validate(sources);

  const jobs = [];
  for (const t of sources) for (const c of t.categories) for (const p of c.problems) jobs.push(p);
  let done = 0;
  const built = new Map();
  const errors = [];
  await pool(jobs, Math.max(2, require('node:os').cpus().length), async (p) => {
    try {
      built.set(p.slug, await buildProblem(p));
    } catch (e) {
      errors.push(`✗ ${p.slug}: ${e.message}`);
    }
    done++;
    if (process.stdout.isTTY) process.stdout.write(`\r  đã build ${done}/${jobs.length} bài`);
  });
  if (process.stdout.isTTY) process.stdout.write('\n');
  if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
  }

  const topics = sources.map((t) => ({
    slug: t.slug,
    title: t.title,
    icon: t.icon || '📘',
    description: t.description || '',
    introHtml: md(t.intro),
    categories: t.categories.map((c) => ({
      slug: c.slug,
      title: c.title,
      description: c.description || '',
      problems: c.problems.map((p) => built.get(p.slug)),
    })),
  }));

  const total = jobs.length;
  const testCount = [...built.values()].reduce((s, p) => s + p.tests.length, 0);
  if (only) {
    console.log(`OK: chủ đề "${only}" — ${total} bài, ${testCount} test (không ghi file khi dùng --only).`);
    return;
  }
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify({ version: 1, topics }, null, 1));
  console.log(`Đã build ${topics.length} chủ đề, ${total} bài, ${testCount} test → ${path.relative(process.cwd(), OUT_FILE)} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
