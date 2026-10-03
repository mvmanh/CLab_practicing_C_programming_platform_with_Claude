'use strict';
const config = require('./config');
const db = require('./db');
const auth = require('./auth');
const problems = require('./problems');
const judge = require('./judge');
const { createApp } = require('./app');

async function main() {
  db.open();
  problems.load();
  auth.ensureAdminFromEnv();
  auth.purgeExpiredSessions();
  setInterval(() => auth.purgeExpiredSessions(), 3600 * 1000).unref();
  judge.sweepStaleJobs();
  await judge.init();

  const app = createApp();
  const server = app.listen(config.port, config.host, () => {
    console.log(`[server] C Lab đang chạy tại http://${config.host === '0.0.0.0' ? 'localhost' : config.host}:${config.port}`);
    console.log(`[server] ${problems.allProblems().length} bài tập, ${problems.getTopics().length} chủ đề, chấm song song ${config.judgeConcurrency} bài.`);
  });

  const shutdown = () => {
    console.log('[server] Đang dừng...');
    server.close(() => { db.close(); process.exit(0); });
    setTimeout(() => process.exit(0), 5000).unref();
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
