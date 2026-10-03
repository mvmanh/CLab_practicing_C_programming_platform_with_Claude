'use strict';
/**
 * Kiểm tra toàn bộ ngân hàng bài tập: cấu trúc hợp lệ và lời giải mẫu vượt qua mọi test qua đúng bộ chấm thật.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const os = require('node:os');
const { ensureProblemsBuilt, PROBLEMS_FILE } = require('./helpers');

ensureProblemsBuilt();
const data = require(PROBLEMS_FILE);
const judge = require('../server/judge');

const problems = data.topics.flatMap((t) => t.categories.flatMap((c) => c.problems));

test('ngân hàng bài tập có cấu trúc hợp lệ', () => {
  assert.ok(data.topics.length >= 10, 'cần ít nhất 10 chủ đề');
  const slugs = new Set();
  for (const p of problems) {
    assert.ok(!slugs.has(p.slug), 'trùng slug ' + p.slug);
    slugs.add(p.slug);
    assert.ok(p.tests.length >= 3 && p.tests.length <= 10, `${p.slug}: số test ${p.tests.length}`);
    assert.ok(p.tests.some((t) => !t.hidden), `${p.slug}: cần ít nhất 1 test mẫu`);
    assert.ok(['easy', 'medium', 'hard'].includes(p.difficulty));
    assert.ok(p.statementHtml.length > 20);
    assert.ok(p.starter.includes('main'));
  }
});

test('lời giải mẫu của mọi bài đều Accepted', { timeout: 600000 }, async () => {
  const failures = [];
  let i = 0;
  const worker = async () => {
    while (i < problems.length) {
      const p = problems[i++];
      const r = await judge.judge(p.solution, p.tests, { timeLimitMs: p.timeLimitMs, memoryMb: p.memoryMb });
      if (r.verdict !== 'AC') failures.push(`${p.slug}: ${r.verdict} ${r.compileOutput || ''}`);
    }
  };
  await Promise.all(Array.from({ length: Math.max(2, os.cpus().length) }, worker));
  assert.deepEqual(failures, []);
});

test('mã khởi đầu biên dịch được (không lỗi cú pháp ngoài phần TODO)', { timeout: 600000 }, async () => {
  const bad = [];
  for (const p of problems) {
    const r = await judge.runCustom(p.starter, p.tests[0].input, { timeLimitMs: 2000 });
    if (r.status === 'CE') bad.push(`${p.slug}: ${r.compileOutput.split('\n').find((l) => l.includes('error')) || r.compileOutput}`);
  }
  assert.deepEqual(bad, []);
});
