'use strict';
const express = require('express');
const db = require('../db');
const auth = require('../auth');
const problems = require('../problems');
const progress = require('../progress');

const router = express.Router();
router.use(auth.requireAdmin);

const DAY = 86400 * 1000;

router.get('/overview', (_req, res) => {
  const d = db.get();
  const now = Date.now();
  const users = d.prepare(`SELECT COUNT(*) AS n, SUM(role = 'admin') AS admins, SUM(last_seen_at >= ?) AS active7 FROM users`).get(now - 7 * DAY);
  const subs = d.prepare(`SELECT COUNT(*) AS n, SUM(created_at >= ?) AS today, SUM(verdict = 'AC') AS ac FROM submissions`).get(now - DAY);
  const perProblem = d.prepare(`SELECT problem_slug, COUNT(*) AS subs, SUM(verdict = 'AC') AS ac FROM submissions GROUP BY problem_slug`).all();
  const solvers = d.prepare(`SELECT problem_slug, COUNT(*) AS tried, SUM(status = 'solved') AS solved FROM user_problems GROUP BY problem_slug`).all();
  const subMap = new Map(perProblem.map((r) => [r.problem_slug, r]));
  const solMap = new Map(solvers.map((r) => [r.problem_slug, r]));
  const problemStats = problems.allProblems().map((p) => {
    const s = subMap.get(p.slug) || { subs: 0, ac: 0 };
    const u = solMap.get(p.slug) || { tried: 0, solved: 0 };
    return { ...problems.summary(p), submissions: s.subs, accepted: s.ac || 0, triedUsers: u.tried, solvedUsers: u.solved || 0 };
  });
  const daily = d.prepare(`SELECT created_at FROM submissions WHERE created_at >= ?`).all(now - 14 * DAY);
  const perDay = {};
  for (const r of daily) {
    const k = new Date(r.created_at).toISOString().slice(0, 10);
    perDay[k] = (perDay[k] || 0) + 1;
  }
  res.json({
    users: { total: users.n || 0, admins: users.admins || 0, active7: users.active7 || 0 },
    submissions: { total: subs.n || 0, today: subs.today || 0, accepted: subs.ac || 0 },
    perDay,
    problemStats,
  });
});

function userRows(q) {
  const d = db.get();
  const params = [];
  let where = '1 = 1';
  if (q) { where = '(u.username LIKE ? OR u.display_name LIKE ?)'; params.push(`%${q}%`, `%${q}%`); }
  return d.prepare(`
    SELECT u.id, u.username, u.display_name, u.role, u.created_at, u.last_seen_at,
      (SELECT COUNT(*) FROM user_problems up WHERE up.user_id = u.id AND up.status = 'solved') AS solved,
      (SELECT COUNT(*) FROM user_problems up WHERE up.user_id = u.id AND up.status = 'attempted') AS attempted,
      (SELECT COUNT(*) FROM submissions s WHERE s.user_id = u.id) AS submissions,
      (SELECT MAX(created_at) FROM activity a WHERE a.user_id = u.id) AS last_activity
    FROM users u WHERE ${where} ORDER BY u.created_at DESC`).all(...params);
}

router.get('/users', (req, res) => {
  const q = String(req.query.q || '').trim().slice(0, 50);
  res.json({
    total: problems.allProblems().length,
    users: userRows(q).map((u) => ({
      id: u.id, username: u.username, displayName: u.display_name, role: u.role, createdAt: u.created_at,
      lastSeenAt: u.last_seen_at, lastActivity: u.last_activity, solved: u.solved, attempted: u.attempted, submissions: u.submissions,
    })),
  });
});

router.get('/users/:id', (req, res) => {
  const d = db.get();
  const u = d.prepare('SELECT * FROM users WHERE id = ?').get(Number(req.params.id));
  if (!u) return res.status(404).json({ error: 'Không tìm thấy người dùng.' });
  const sm = progress.statusMap(u.id);
  const recent = d.prepare(`SELECT id, problem_slug, verdict, passed, total, time_ms, created_at FROM submissions
                            WHERE user_id = ? ORDER BY id DESC LIMIT 30`).all(u.id).map(progress.submissionRow);
  const problemsStatus = problems.allProblems()
    .filter((p) => sm.has(p.slug))
    .map((p) => ({ ...problems.summary(p), ...sm.get(p.slug) }));
  res.json({
    user: { ...auth.publicUser(u), lastSeenAt: u.last_seen_at },
    topics: progress.topicProgress(u.id),
    problems: problemsStatus,
    recent,
    sessions: progress.studySessions(u.id, 5),
  });
});

router.post('/users/:id/role', (req, res) => {
  const role = req.body && req.body.role;
  if (!['student', 'admin'].includes(role)) return res.status(400).json({ error: 'Vai trò không hợp lệ.' });
  const id = Number(req.params.id);
  if (id === req.user.id && role !== 'admin') return res.status(400).json({ error: 'Không thể tự hạ quyền của chính mình.' });
  const r = db.get().prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id);
  if (!r.changes) return res.status(404).json({ error: 'Không tìm thấy người dùng.' });
  res.json({ ok: true });
});

router.post('/users/:id/password', (req, res) => {
  const pw = req.body && req.body.password;
  if (typeof pw !== 'string' || pw.length < 6) return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự.' });
  const id = Number(req.params.id);
  const r = db.get().prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(auth.hashPassword(pw), id);
  if (!r.changes) return res.status(404).json({ error: 'Không tìm thấy người dùng.' });
  auth.destroyUserSessions(id);
  res.json({ ok: true });
});

router.delete('/users/:id', (req, res) => {
  const id = Number(req.params.id);
  if (id === req.user.id) return res.status(400).json({ error: 'Không thể tự xóa tài khoản của mình.' });
  const r = db.get().prepare('DELETE FROM users WHERE id = ?').run(id);
  if (!r.changes) return res.status(404).json({ error: 'Không tìm thấy người dùng.' });
  res.json({ ok: true });
});

/** Tạo nhiều tài khoản sinh viên cùng lúc. Mỗi dòng: username,mật khẩu,tên hiển thị */
router.post('/users/bulk', (req, res) => {
  const text = String((req.body && req.body.text) || '');
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).slice(0, 1000);
  const d = db.get();
  const created = [];
  const errors = [];
  for (const [i, line] of lines.entries()) {
    const [username, password, ...rest] = line.split(',').map((s) => s.trim());
    const displayName = rest.join(',').trim() || username;
    if (!/^[a-zA-Z0-9_.-]{3,32}$/.test(username || '')) { errors.push(`Dòng ${i + 1}: tên đăng nhập không hợp lệ`); continue; }
    if (!password || password.length < 6) { errors.push(`Dòng ${i + 1}: mật khẩu tối thiểu 6 ký tự`); continue; }
    if (d.prepare('SELECT 1 FROM users WHERE username = ?').get(username)) { errors.push(`Dòng ${i + 1}: "${username}" đã tồn tại`); continue; }
    d.prepare('INSERT INTO users (username, display_name, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)')
      .run(username, displayName.slice(0, 60), auth.hashPassword(password), 'student', Date.now());
    created.push(username);
  }
  res.json({ created, errors });
});

/** Xuất bảng tiến độ ra CSV (mở được bằng Excel). */
router.get('/export.csv', (_req, res) => {
  const topics = problems.getTopics();
  const header = ['username', 'display_name', 'role', 'solved', 'attempted', 'submissions', 'last_activity', ...topics.map((t) => t.title)];
  const esc = (v) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [header.map(esc).join(',')];
  for (const u of userRows('')) {
    const tp = progress.topicProgress(u.id);
    lines.push([
      u.username, u.display_name, u.role, u.solved, u.attempted, u.submissions,
      u.last_activity ? new Date(u.last_activity).toISOString() : '',
      ...tp.map((t) => `${t.solved}/${t.total}`),
    ].map(esc).join(','));
  }
  res.set('Content-Type', 'text/csv; charset=utf-8');
  res.set('Content-Disposition', 'attachment; filename="tien-do-sinh-vien.csv"');
  res.send('﻿' + lines.join('\r\n'));
});

module.exports = router;
