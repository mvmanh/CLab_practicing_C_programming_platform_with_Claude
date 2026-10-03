'use strict';
const crypto = require('node:crypto');
const db = require('./db');
const config = require('./config');

const COOKIE = 'sid';
const now = () => Date.now();

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$${salt.toString('base64')}$${hash.toString('base64')}`;
}

function verifyPassword(password, stored) {
  const [alg, saltB64, hashB64] = String(stored).split('$');
  if (alg !== 'scrypt' || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, 'base64');
  const actual = crypto.scryptSync(password, Buffer.from(saltB64, 'base64'), expected.length, { N: 16384, r: 8, p: 1 });
  return crypto.timingSafeEqual(expected, actual);
}

const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

function createSession(userId) {
  const token = crypto.randomBytes(32).toString('base64url');
  const expires = now() + config.sessionDays * 86400 * 1000;
  db.get().prepare('INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)')
    .run(sha256(token), userId, now(), expires);
  return { token, expires };
}

function destroySession(token) {
  if (token) db.get().prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha256(token));
}

function destroyUserSessions(userId, exceptToken) {
  if (exceptToken) db.get().prepare('DELETE FROM sessions WHERE user_id = ? AND token_hash <> ?').run(userId, sha256(exceptToken));
  else db.get().prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
}

function purgeExpiredSessions() {
  db.get().prepare('DELETE FROM sessions WHERE expires_at < ?').run(now());
}

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    const k = part.slice(0, i).trim();
    const v = part.slice(i + 1).trim();
    try { out[k] = decodeURIComponent(v); } catch { out[k] = v; }
  }
  return out;
}

function setSessionCookie(res, token, expires) {
  res.cookie(COOKIE, token, {
    httpOnly: true, sameSite: 'lax', secure: config.secureCookies, expires: new Date(expires), path: '/',
  });
}

function clearSessionCookie(res) {
  res.clearCookie(COOKIE, { path: '/' });
}

const publicUser = (u) => u && ({ id: u.id, username: u.username, displayName: u.display_name, role: u.role, createdAt: u.created_at });

/** Middleware: gắn req.user nếu có phiên hợp lệ. */
function loadUser(req, _res, next) {
  const token = parseCookies(req.headers.cookie)[COOKIE];
  req.sessionToken = token || null;
  req.user = null;
  if (token) {
    const row = db.get().prepare(`
      SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = ? AND s.expires_at > ?`).get(sha256(token), now());
    if (row) {
      req.user = row;
      if (!row.last_seen_at || now() - row.last_seen_at > 60000) {
        db.get().prepare('UPDATE users SET last_seen_at = ? WHERE id = ?').run(now(), row.id);
      }
    }
  }
  next();
}

function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Bạn cần đăng nhập để thực hiện thao tác này.' });
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Bạn cần đăng nhập.' });
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Chỉ giảng viên/quản trị viên mới truy cập được.' });
  next();
}

/** Chống CSRF: mọi request thay đổi dữ liệu phải gửi header tùy chỉnh (trình duyệt không tự gửi cross-site). */
function csrfGuard(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  if (req.get('X-Requested-With') !== 'fetch') return res.status(403).json({ error: 'Yêu cầu không hợp lệ.' });
  next();
}

/** Giới hạn tần suất đơn giản trong bộ nhớ. */
function rateLimiter({ windowMs, max, key, message }) {
  const hits = new Map();
  setInterval(() => {
    const t = now();
    for (const [k, arr] of hits) {
      const kept = arr.filter((x) => t - x < windowMs);
      if (kept.length) hits.set(k, kept); else hits.delete(k);
    }
  }, windowMs).unref();
  return (req, res, next) => {
    const k = key(req);
    const t = now();
    const arr = (hits.get(k) || []).filter((x) => t - x < windowMs);
    if (arr.length >= max) {
      const retry = Math.ceil((windowMs - (t - arr[0])) / 1000);
      res.set('Retry-After', String(retry));
      return res.status(429).json({ error: message || `Bạn thao tác quá nhanh, thử lại sau ${retry} giây.` });
    }
    arr.push(t);
    hits.set(k, arr);
    next();
  };
}

/** Tạo/cập nhật tài khoản admin từ biến môi trường. */
function ensureAdminFromEnv() {
  if (!config.adminUsername || !config.adminPassword) return;
  const d = db.get();
  const u = d.prepare('SELECT * FROM users WHERE username = ?').get(config.adminUsername);
  if (!u) {
    d.prepare('INSERT INTO users (username, display_name, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)')
      .run(config.adminUsername, 'Quản trị viên', hashPassword(config.adminPassword), 'admin', now());
    console.log(`[auth] Đã tạo tài khoản quản trị "${config.adminUsername}".`);
  } else if (u.role !== 'admin') {
    d.prepare("UPDATE users SET role = 'admin' WHERE id = ?").run(u.id);
  }
}

module.exports = {
  hashPassword, verifyPassword, createSession, destroySession, destroyUserSessions, purgeExpiredSessions,
  setSessionCookie, clearSessionCookie, loadUser, requireAuth, requireAdmin, csrfGuard, rateLimiter,
  publicUser, ensureAdminFromEnv, parseCookies,
};
