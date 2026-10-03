'use strict';
const express = require('express');
const db = require('../db');
const auth = require('../auth');
const config = require('../config');

const router = express.Router();

const USERNAME_RE = /^[a-zA-Z0-9_.-]{3,32}$/;

const loginLimiter = auth.rateLimiter({
  windowMs: 15 * 60 * 1000, max: 30, key: (req) => 'login:' + req.ip,
  message: 'Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau ít phút.',
});
const registerLimiter = auth.rateLimiter({
  windowMs: 60 * 60 * 1000, max: 20, key: (req) => 'reg:' + req.ip,
  message: 'Bạn đã tạo quá nhiều tài khoản. Vui lòng thử lại sau.',
});

function validatePassword(pw) {
  if (typeof pw !== 'string' || pw.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự.';
  if (pw.length > 200) return 'Mật khẩu quá dài.';
  return null;
}

function cleanDisplayName(name, fallback) {
  const s = String(name || '').replace(/\s+/g, ' ').trim().slice(0, 60);
  return s || fallback;
}

router.get('/config', (_req, res) => {
  res.json({ allowRegistration: config.allowRegistration });
});

router.get('/me', (req, res) => {
  res.json({ user: auth.publicUser(req.user) });
});

router.post('/register', registerLimiter, (req, res) => {
  if (!config.allowRegistration) return res.status(403).json({ error: 'Hệ thống đang tắt chức năng đăng ký. Liên hệ giảng viên để được cấp tài khoản.' });
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || !USERNAME_RE.test(username)) {
    return res.status(400).json({ error: 'Tên đăng nhập 3–32 ký tự, chỉ gồm chữ cái không dấu, số, dấu chấm, gạch dưới, gạch ngang.' });
  }
  const pwErr = validatePassword(password);
  if (pwErr) return res.status(400).json({ error: pwErr });
  const d = db.get();
  if (d.prepare('SELECT 1 FROM users WHERE username = ?').get(username)) {
    return res.status(409).json({ error: 'Tên đăng nhập đã tồn tại.' });
  }
  const isFirst = d.prepare('SELECT COUNT(*) AS n FROM users').get().n === 0;
  const role = isFirst && !config.adminUsername ? 'admin' : 'student';
  const info = d.prepare('INSERT INTO users (username, display_name, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)')
    .run(username, cleanDisplayName(req.body.displayName, username), auth.hashPassword(password), role, Date.now());
  const user = d.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
  const s = auth.createSession(user.id);
  auth.setSessionCookie(res, s.token, s.expires);
  res.status(201).json({ user: auth.publicUser(user) });
});

router.post('/login', loginLimiter, (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || typeof password !== 'string') return res.status(400).json({ error: 'Thiếu tên đăng nhập hoặc mật khẩu.' });
  const user = db.get().prepare('SELECT * FROM users WHERE username = ?').get(username.trim());
  if (!user || !auth.verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
  }
  const s = auth.createSession(user.id);
  auth.setSessionCookie(res, s.token, s.expires);
  res.json({ user: auth.publicUser(user) });
});

router.post('/logout', (req, res) => {
  auth.destroySession(req.sessionToken);
  auth.clearSessionCookie(res);
  res.json({ ok: true });
});

router.post('/profile', auth.requireAuth, (req, res) => {
  const name = cleanDisplayName(req.body && req.body.displayName, '');
  if (!name) return res.status(400).json({ error: 'Tên hiển thị không được để trống.' });
  db.get().prepare('UPDATE users SET display_name = ? WHERE id = ?').run(name, req.user.id);
  const user = db.get().prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  res.json({ user: auth.publicUser(user) });
});

router.post('/password', auth.requireAuth, (req, res) => {
  const { current, next } = req.body || {};
  if (!auth.verifyPassword(String(current || ''), req.user.password_hash)) {
    return res.status(400).json({ error: 'Mật khẩu hiện tại không đúng.' });
  }
  const pwErr = validatePassword(next);
  if (pwErr) return res.status(400).json({ error: pwErr });
  db.get().prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(auth.hashPassword(next), req.user.id);
  auth.destroyUserSessions(req.user.id, req.sessionToken);
  res.json({ ok: true });
});

module.exports = router;
