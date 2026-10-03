'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const PROBLEMS_FILE = path.join(__dirname, '..', 'content', 'problems.json');

/** Đảm bảo đã có content/problems.json (build nếu thiếu hoặc cũ). */
function ensureProblemsBuilt() {
  execFileSync(process.execPath, [path.join(__dirname, '..', 'scripts', 'build-problems.js'), '--if-stale'], { stdio: 'inherit' });
  if (!fs.existsSync(PROBLEMS_FILE)) throw new Error('Không build được content/problems.json');
}

module.exports = { ensureProblemsBuilt, PROBLEMS_FILE };
