'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const config = require('./config');

let db = null;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT NOT NULL UNIQUE COLLATE NOCASE,
  display_name  TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'student',
  created_at    INTEGER NOT NULL,
  last_seen_at  INTEGER
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash  TEXT PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  INTEGER NOT NULL,
  expires_at  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS submissions (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  problem_slug   TEXT NOT NULL,
  code           TEXT NOT NULL,
  verdict        TEXT NOT NULL,
  passed         INTEGER NOT NULL DEFAULT 0,
  total          INTEGER NOT NULL DEFAULT 0,
  time_ms        INTEGER NOT NULL DEFAULT 0,
  compile_output TEXT,
  results_json   TEXT,
  created_at     INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sub_user ON submissions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sub_user_problem ON submissions(user_id, problem_slug, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sub_problem ON submissions(problem_slug);

CREATE TABLE IF NOT EXISTS user_problems (
  user_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  problem_slug      TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'attempted',
  attempts          INTEGER NOT NULL DEFAULT 0,
  best_passed       INTEGER NOT NULL DEFAULT 0,
  total             INTEGER NOT NULL DEFAULT 0,
  first_solved_at   INTEGER,
  last_submitted_at INTEGER,
  PRIMARY KEY (user_id, problem_slug)
);

CREATE TABLE IF NOT EXISTS drafts (
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  problem_slug TEXT NOT NULL,
  code         TEXT NOT NULL,
  updated_at   INTEGER NOT NULL,
  PRIMARY KEY (user_id, problem_slug)
);

CREATE TABLE IF NOT EXISTS activity (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  problem_slug TEXT NOT NULL,
  kind         TEXT NOT NULL,
  created_at   INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity(user_id, created_at DESC);
`;

function open(file) {
  const dbFile = file || config.dbFile || path.join(config.dataDir, 'app.db');
  if (dbFile !== ':memory:') fs.mkdirSync(path.dirname(dbFile), { recursive: true });
  db = new DatabaseSync(dbFile);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA busy_timeout = 5000;');
  db.exec(SCHEMA);
  return db;
}

function get() {
  if (!db) open();
  return db;
}

function close() {
  if (db) { db.close(); db = null; }
}

/** Chạy fn trong một transaction. */
function tx(fn) {
  const d = get();
  d.exec('BEGIN');
  try {
    const r = fn(d);
    d.exec('COMMIT');
    return r;
  } catch (e) {
    d.exec('ROLLBACK');
    throw e;
  }
}

module.exports = { open, get, close, tx };
