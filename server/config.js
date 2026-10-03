'use strict';
const os = require('node:os');
const path = require('node:path');

const int = (v, d) => (v !== undefined && v !== '' && !Number.isNaN(Number(v)) ? Number(v) : d);

module.exports = {
  port: int(process.env.PORT, 3000),
  host: process.env.HOST || '0.0.0.0',
  dataDir: process.env.DATA_DIR || path.join(__dirname, '..', 'data'),
  dbFile: process.env.DB_FILE || '',
  judgeConcurrency: Math.max(1, int(process.env.JUDGE_CONCURRENCY, Math.max(1, os.cpus().length))),
  compileTimeoutMs: int(process.env.COMPILE_TIMEOUT_MS, 15000),
  defaultTimeLimitMs: int(process.env.TIME_LIMIT_MS, 2000),
  defaultMemoryMb: int(process.env.MEMORY_LIMIT_MB, 256),
  sessionDays: int(process.env.SESSION_DAYS, 30),
  secureCookies: process.env.SECURE_COOKIES === '1',
  trustProxy: process.env.TRUST_PROXY || '',
  allowRegistration: process.env.ALLOW_REGISTRATION !== '0',
  adminUsername: process.env.ADMIN_USERNAME || '',
  adminPassword: process.env.ADMIN_PASSWORD || '',
  // Giới hạn số lần chạy/nộp mỗi phút cho một người dùng
  rateLimitPerMinute: int(process.env.RATE_LIMIT_PER_MINUTE, 20),
  // Khoảng nghỉ (phút) để tách "buổi học"
  sessionGapMinutes: int(process.env.STUDY_SESSION_GAP_MINUTES, 90),
};
