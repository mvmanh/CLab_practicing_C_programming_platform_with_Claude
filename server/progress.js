'use strict';
/** Các truy vấn về tiến độ học tập của sinh viên. */
const db = require('./db');
const problems = require('./problems');
const config = require('./config');

const DAY = 86400 * 1000;

/** Map slug -> { status, attempts, bestPassed, total } của một người dùng. */
function statusMap(userId) {
  const map = new Map();
  if (!userId) return map;
  const rows = db.get().prepare('SELECT * FROM user_problems WHERE user_id = ?').all(userId);
  for (const r of rows) {
    map.set(r.problem_slug, {
      status: r.status, attempts: r.attempts, bestPassed: r.best_passed, total: r.total,
      firstSolvedAt: r.first_solved_at, lastSubmittedAt: r.last_submitted_at,
    });
  }
  return map;
}

function isSolved(userId, slug) {
  const r = db.get().prepare('SELECT status FROM user_problems WHERE user_id = ? AND problem_slug = ?').get(userId, slug);
  return !!r && r.status === 'solved';
}

function recordActivity(userId, slug, kind) {
  const d = db.get();
  const t = Date.now();
  if (kind === 'open') {
    const last = d.prepare('SELECT created_at FROM activity WHERE user_id = ? AND problem_slug = ? ORDER BY id DESC LIMIT 1').get(userId, slug);
    if (last && t - last.created_at < 10 * 60 * 1000) return;
  }
  d.prepare('INSERT INTO activity (user_id, problem_slug, kind, created_at) VALUES (?, ?, ?, ?)').run(userId, slug, kind, t);
}

/** Cập nhật bảng tổng hợp sau mỗi lần nộp bài. */
function applySubmission(userId, slug, result, at) {
  const d = db.get();
  const solved = result.verdict === 'AC';
  const cur = d.prepare('SELECT * FROM user_problems WHERE user_id = ? AND problem_slug = ?').get(userId, slug);
  if (!cur) {
    d.prepare(`INSERT INTO user_problems (user_id, problem_slug, status, attempts, best_passed, total, first_solved_at, last_submitted_at)
               VALUES (?, ?, ?, 1, ?, ?, ?, ?)`)
      .run(userId, slug, solved ? 'solved' : 'attempted', result.passed, result.total, solved ? at : null, at);
    return { firstSolve: solved };
  }
  const firstSolve = solved && cur.status !== 'solved';
  d.prepare(`UPDATE user_problems SET status = ?, attempts = attempts + 1, best_passed = MAX(best_passed, ?), total = ?,
             first_solved_at = COALESCE(first_solved_at, ?), last_submitted_at = ? WHERE user_id = ? AND problem_slug = ?`)
    .run(cur.status === 'solved' || solved ? 'solved' : 'attempted', result.passed, result.total, solved ? at : null, at, userId, slug);
  return { firstSolve };
}

/** Tiến độ theo chủ đề. */
function topicProgress(userId) {
  const sm = statusMap(userId);
  return problems.getTopics().map((t) => {
    const all = t.categories.flatMap((c) => c.problems);
    const solved = all.filter((p) => sm.get(p.slug)?.status === 'solved').length;
    const attempted = all.filter((p) => sm.get(p.slug)?.status === 'attempted').length;
    return { slug: t.slug, title: t.title, icon: t.icon, order: t.order, total: all.length, solved, attempted };
  });
}

/**
 * Gom hoạt động thành các "buổi học": hai hoạt động cách nhau quá
 * config.sessionGapMinutes phút thì coi là hai buổi khác nhau.
 */
function studySessions(userId, limit = 5) {
  const rows = db.get().prepare('SELECT problem_slug, kind, created_at FROM activity WHERE user_id = ? ORDER BY created_at DESC LIMIT 2000').all(userId);
  const gap = config.sessionGapMinutes * 60 * 1000;
  const sessions = [];
  let cur = null;
  for (const r of rows) {
    if (!cur || cur.start - r.created_at > gap) {
      if (sessions.length >= limit) break;
      cur = { start: r.created_at, end: r.created_at, problems: new Map(), submits: 0, runs: 0 };
      sessions.push(cur);
    }
    cur.start = r.created_at;
    if (r.kind === 'submit') cur.submits++;
    if (r.kind === 'run') cur.runs++;
    if (!cur.problems.has(r.problem_slug)) cur.problems.set(r.problem_slug, r.created_at);
  }
  const sm = statusMap(userId);
  return sessions.map((s) => ({
    start: s.start,
    end: s.end,
    durationMin: Math.max(1, Math.round((s.end - s.start) / 60000)),
    submits: s.submits,
    runs: s.runs,
    problems: [...s.problems.entries()]
      .map(([slug, lastAt]) => {
        const p = problems.getProblem(slug);
        if (!p) return null;
        const st = sm.get(slug);
        return { ...problems.summary(p), lastAt, status: st ? st.status : 'opened', bestPassed: st?.bestPassed || 0, total: p.tests.length };
      })
      .filter(Boolean),
  }));
}

function dayKey(ts, tzOffsetMin) {
  return new Date(ts - tzOffsetMin * 60000).toISOString().slice(0, 10);
}

function dashboard(userId, tzOffsetMin = 0) {
  const d = db.get();
  const sm = statusMap(userId);
  const all = problems.allProblems();

  const byDifficulty = { easy: { total: 0, solved: 0 }, medium: { total: 0, solved: 0 }, hard: { total: 0, solved: 0 } };
  for (const p of all) {
    const b = byDifficulty[p.difficulty];
    if (!b) continue;
    b.total++;
    if (sm.get(p.slug)?.status === 'solved') b.solved++;
  }
  const solved = [...sm.values()].filter((s) => s.status === 'solved').length;
  const attempted = [...sm.values()].filter((s) => s.status === 'attempted').length;

  const subStats = d.prepare(`SELECT COUNT(*) AS n, SUM(verdict = 'AC') AS ac FROM submissions WHERE user_id = ?`).get(userId);

  // Bản đồ hoạt động 1 năm (số lần nộp mỗi ngày)
  const since = Date.now() - 371 * DAY;
  const subs = d.prepare('SELECT created_at, verdict FROM submissions WHERE user_id = ? AND created_at >= ?').all(userId, since);
  const heat = {};
  for (const s of subs) {
    const k = dayKey(s.created_at, tzOffsetMin);
    heat[k] = (heat[k] || 0) + 1;
  }
  // Chuỗi ngày học liên tục (có ít nhất 1 lần nộp bài)
  let streak = 0;
  const today = dayKey(Date.now(), tzOffsetMin);
  let cursor = Date.now();
  if (!heat[today]) cursor -= DAY; // chưa học hôm nay thì vẫn giữ chuỗi tới hôm qua
  while (heat[dayKey(cursor, tzOffsetMin)]) { streak++; cursor -= DAY; }
  let longest = 0;
  {
    const days = Object.keys(heat).sort();
    let run = 0;
    let prev = null;
    for (const k of days) {
      const t = Date.parse(k + 'T00:00:00Z');
      run = prev !== null && t - prev === DAY ? run + 1 : 1;
      longest = Math.max(longest, run);
      prev = t;
    }
  }

  const recent = d.prepare(`SELECT id, problem_slug, verdict, passed, total, time_ms, created_at FROM submissions
                            WHERE user_id = ? ORDER BY id DESC LIMIT 8`).all(userId)
    .map((s) => submissionRow(s));

  const sessions = studySessions(userId, 3);

  // Gợi ý "tiếp tục": bài mở gần nhất chưa giải được; nếu không có thì bài tiếp theo chưa giải theo thứ tự giáo trình
  let continueProblem = null;
  const lastOpened = d.prepare(`SELECT problem_slug, MAX(created_at) AS t FROM activity WHERE user_id = ?
                                GROUP BY problem_slug ORDER BY t DESC LIMIT 20`).all(userId);
  for (const r of lastOpened) {
    const p = problems.getProblem(r.problem_slug);
    if (p && sm.get(p.slug)?.status !== 'solved') {
      const st = sm.get(p.slug);
      continueProblem = { ...problems.summary(p), lastAt: r.t, status: st ? st.status : 'opened', bestPassed: st?.bestPassed || 0, reason: 'in-progress' };
      break;
    }
  }
  const nextUnsolved = all.find((p) => sm.get(p.slug)?.status !== 'solved' && p.slug !== continueProblem?.slug) || null;

  return {
    totals: { problems: all.length, solved, attempted, submissions: subStats.n || 0, accepted: subStats.ac || 0 },
    byDifficulty,
    topics: topicProgress(userId),
    heatmap: heat,
    streak,
    longestStreak: longest,
    recent,
    sessions,
    continueProblem,
    nextProblem: nextUnsolved ? problems.summary(nextUnsolved) : null,
  };
}

function submissionRow(s) {
  const p = problems.getProblem(s.problem_slug);
  return {
    id: s.id,
    problemSlug: s.problem_slug,
    problemTitle: p ? p.title : s.problem_slug,
    topicTitle: p ? p.topicTitle : '',
    verdict: s.verdict,
    passed: s.passed,
    total: s.total,
    timeMs: s.time_ms,
    createdAt: s.created_at,
  };
}

module.exports = { statusMap, isSolved, recordActivity, applySubmission, topicProgress, studySessions, dashboard, submissionRow, dayKey };
