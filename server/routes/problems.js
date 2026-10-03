'use strict';
const express = require('express');
const db = require('../db');
const auth = require('../auth');
const config = require('../config');
const judge = require('../judge');
const problems = require('../problems');
const progress = require('../progress');

const router = express.Router();

const judgeLimiter = auth.rateLimiter({
  windowMs: 60 * 1000,
  max: config.rateLimitPerMinute,
  key: (req) => 'judge:' + req.user.id,
  message: 'Bạn chạy/nộp bài quá nhanh. Hãy đọc kỹ kết quả và thử lại sau ít giây.',
});

function findProblem(req, res) {
  const p = problems.getProblem(req.params.slug);
  if (!p) res.status(404).json({ error: 'Không tìm thấy bài tập.' });
  return p;
}

function getCode(req, res) {
  const code = req.body && req.body.code;
  if (typeof code !== 'string' || !code.trim()) { res.status(400).json({ error: 'Mã nguồn trống.' }); return null; }
  if (code.length > 64 * 1024) { res.status(400).json({ error: 'Mã nguồn quá dài (tối đa 64 KB).' }); return null; }
  return code;
}

/* Danh sách chủ đề kèm trạng thái từng bài */
router.get('/topics', (req, res) => {
  const sm = progress.statusMap(req.user?.id);
  const topics = problems.getTopics().map((t) => {
    const all = t.categories.flatMap((c) => c.problems);
    return {
      slug: t.slug, title: t.title, icon: t.icon, description: t.description, order: t.order,
      total: all.length,
      solved: all.filter((p) => sm.get(p.slug)?.status === 'solved').length,
      attempted: all.filter((p) => sm.get(p.slug)?.status === 'attempted').length,
      categories: t.categories.map((c) => ({ slug: c.slug, title: c.title, count: c.problems.length })),
      difficulties: {
        easy: all.filter((p) => p.difficulty === 'easy').length,
        medium: all.filter((p) => p.difficulty === 'medium').length,
        hard: all.filter((p) => p.difficulty === 'hard').length,
      },
    };
  });
  res.json({ topics });
});

router.get('/topics/:slug', (req, res) => {
  const t = problems.getTopic(req.params.slug);
  if (!t) return res.status(404).json({ error: 'Không tìm thấy chủ đề.' });
  const sm = progress.statusMap(req.user?.id);
  const topics = problems.getTopics();
  res.json({
    topic: {
      slug: t.slug, title: t.title, icon: t.icon, description: t.description, order: t.order,
      introHtml: t.introHtml || '',
      prev: t.order > 1 ? { slug: topics[t.order - 2].slug, title: topics[t.order - 2].title } : null,
      next: t.order < topics.length ? { slug: topics[t.order].slug, title: topics[t.order].title } : null,
      categories: t.categories.map((c) => ({
        slug: c.slug, title: c.title, description: c.description || '',
        problems: c.problems.map((p) => {
          const st = sm.get(p.slug);
          return { ...problems.summary(p), status: st?.status || null, attempts: st?.attempts || 0, bestPassed: st?.bestPassed || 0 };
        }),
      })),
    },
  });
});

/* Tất cả bài tập (lọc/tìm kiếm phía client) */
router.get('/problems', (req, res) => {
  const sm = progress.statusMap(req.user?.id);
  const rows = problems.allProblems().map((p) => {
    const st = sm.get(p.slug);
    return { ...problems.summary(p), status: st?.status || null, attempts: st?.attempts || 0 };
  });
  res.json({ problems: rows });
});

router.get('/problems/:slug', (req, res) => {
  const p = findProblem(req, res);
  if (!p) return;
  let draft = null;
  let status = null;
  let solved = false;
  if (req.user) {
    const d = db.get().prepare('SELECT code, updated_at FROM drafts WHERE user_id = ? AND problem_slug = ?').get(req.user.id, p.slug);
    if (d) draft = { code: d.code, updatedAt: d.updated_at };
    const st = progress.statusMap(req.user.id).get(p.slug);
    status = st || null;
    solved = st?.status === 'solved';
    progress.recordActivity(req.user.id, p.slug, 'open');
  }
  res.json({ problem: problems.publicDetail(p, { includeSolution: solved }), draft, status });
});

router.put('/problems/:slug/draft', auth.requireAuth, (req, res) => {
  const p = findProblem(req, res);
  if (!p) return;
  const code = req.body && req.body.code;
  if (typeof code !== 'string' || code.length > 64 * 1024) return res.status(400).json({ error: 'Bản nháp không hợp lệ.' });
  const t = Date.now();
  db.get().prepare(`INSERT INTO drafts (user_id, problem_slug, code, updated_at) VALUES (?, ?, ?, ?)
                    ON CONFLICT(user_id, problem_slug) DO UPDATE SET code = excluded.code, updated_at = excluded.updated_at`)
    .run(req.user.id, p.slug, code, t);
  res.json({ ok: true, updatedAt: t });
});

router.delete('/problems/:slug/draft', auth.requireAuth, (req, res) => {
  db.get().prepare('DELETE FROM drafts WHERE user_id = ? AND problem_slug = ?').run(req.user.id, req.params.slug);
  res.json({ ok: true });
});

/* Chạy thử với input tùy chọn */
router.post('/problems/:slug/run', auth.requireAuth, judgeLimiter, async (req, res, next) => {
  try {
    const p = findProblem(req, res);
    if (!p) return;
    const code = getCode(req, res);
    if (code === null) return;
    const input = typeof req.body.input === 'string' ? req.body.input.slice(0, 64 * 1024) : '';
    const r = await judge.runCustom(code, input, { timeLimitMs: p.timeLimitMs, memoryMb: p.memoryMb });
    // Nếu input trùng một test mẫu, cho biết output mong đợi để tự so sánh
    const sample = p.tests.find((t) => !t.hidden && judge.normalize(t.input) === judge.normalize(input));
    if (sample) {
      r.expected = sample.output;
      if (r.status === 'OK') r.match = judge.outputsMatch(r.stdout, sample.output);
    }
    progress.recordActivity(req.user.id, p.slug, 'run');
    res.json({ result: r });
  } catch (e) { next(e); }
});

/* Nộp bài — chấm với toàn bộ test */
router.post('/problems/:slug/submit', auth.requireAuth, judgeLimiter, async (req, res, next) => {
  try {
    const p = findProblem(req, res);
    if (!p) return;
    const code = getCode(req, res);
    if (code === null) return;
    const result = await judge.judge(code, p.tests, { timeLimitMs: p.timeLimitMs, memoryMb: p.memoryMb });
    const at = Date.now();
    const { id, firstSolve } = db.tx((d) => {
      const info = d.prepare(`INSERT INTO submissions (user_id, problem_slug, code, verdict, passed, total, time_ms, compile_output, results_json, created_at)
                              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(req.user.id, p.slug, code, result.verdict, result.passed, result.total, result.timeMs, result.compileOutput || '', JSON.stringify(result.tests), at);
      const r = progress.applySubmission(req.user.id, p.slug, result, at);
      d.prepare(`INSERT INTO drafts (user_id, problem_slug, code, updated_at) VALUES (?, ?, ?, ?)
                 ON CONFLICT(user_id, problem_slug) DO UPDATE SET code = excluded.code, updated_at = excluded.updated_at`)
        .run(req.user.id, p.slug, code, at);
      return { id: Number(info.lastInsertRowid), firstSolve: r.firstSolve };
    });
    progress.recordActivity(req.user.id, p.slug, 'submit');
    res.json({
      submission: {
        id, verdict: result.verdict, passed: result.passed, total: result.total, timeMs: result.timeMs,
        compileOutput: result.compileOutput, tests: redactTests(result.tests), createdAt: at,
      },
      firstSolve,
      solution: result.verdict === 'AC' ? p.solution : undefined,
    });
  } catch (e) { next(e); }
});

router.get('/problems/:slug/submissions', auth.requireAuth, (req, res) => {
  const rows = db.get().prepare(`SELECT id, problem_slug, verdict, passed, total, time_ms, created_at FROM submissions
                                 WHERE user_id = ? AND problem_slug = ? ORDER BY id DESC LIMIT 50`).all(req.user.id, req.params.slug);
  res.json({ submissions: rows.map(progress.submissionRow) });
});

/* Lịch sử nộp bài của tôi */
router.get('/submissions', auth.requireAuth, (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const size = 30;
  const params = [req.user.id];
  let where = 'user_id = ?';
  if (req.query.verdict && /^[A-Z]{2,3}$/.test(req.query.verdict)) { where += ' AND verdict = ?'; params.push(req.query.verdict); }
  const total = db.get().prepare(`SELECT COUNT(*) AS n FROM submissions WHERE ${where}`).get(...params).n;
  const rows = db.get().prepare(`SELECT id, problem_slug, verdict, passed, total, time_ms, created_at FROM submissions
                                 WHERE ${where} ORDER BY id DESC LIMIT ? OFFSET ?`).all(...params, size, (page - 1) * size);
  res.json({ submissions: rows.map(progress.submissionRow), page, pages: Math.max(1, Math.ceil(total / size)), total });
});

router.get('/submissions/:id', auth.requireAuth, (req, res) => {
  const s = db.get().prepare('SELECT s.*, u.username, u.display_name FROM submissions s JOIN users u ON u.id = s.user_id WHERE s.id = ?').get(Number(req.params.id));
  if (!s || (s.user_id !== req.user.id && req.user.role !== 'admin')) return res.status(404).json({ error: 'Không tìm thấy bài nộp.' });
  const isAdmin = req.user.role === 'admin';
  const tests = JSON.parse(s.results_json || '[]');
  res.json({
    submission: {
      ...progress.submissionRow(s),
      code: s.code,
      compileOutput: s.compile_output,
      tests: isAdmin ? tests : redactTests(tests),
      user: { id: s.user_id, username: s.username, displayName: s.display_name },
    },
  });
});

/** Ẩn input/output của test ẩn. */
function redactTests(tests) {
  return tests.map((t) => (t.hidden ? { index: t.index, verdict: t.verdict, timeMs: t.timeMs, hidden: true, message: t.message } : t));
}

router.get('/dashboard', auth.requireAuth, (req, res) => {
  const tz = Number(req.query.tz);
  res.json(progress.dashboard(req.user.id, Number.isFinite(tz) ? tz : 0));
});

router.get('/sessions', auth.requireAuth, (req, res) => {
  res.json({ sessions: progress.studySessions(req.user.id, 20) });
});

router.get('/leaderboard', (req, res) => {
  const rows = db.get().prepare(`
    SELECT u.id, u.username, u.display_name,
           SUM(up.status = 'solved') AS solved,
           SUM(up.attempts) AS attempts,
           MAX(up.first_solved_at) AS last_solved
    FROM users u JOIN user_problems up ON up.user_id = u.id
    WHERE u.role = 'student'
    GROUP BY u.id HAVING solved > 0
    ORDER BY solved DESC, last_solved ASC LIMIT 100`).all();
  res.json({
    total: problems.allProblems().length,
    leaders: rows.map((r, i) => ({ rank: i + 1, id: r.id, username: r.username, displayName: r.display_name, solved: r.solved, attempts: r.attempts, isMe: req.user?.id === r.id })),
  });
});

router.get('/health', (_req, res) => {
  res.json({ ok: true, problems: problems.allProblems().length, queue: judge.queueStats() });
});

module.exports = router;
