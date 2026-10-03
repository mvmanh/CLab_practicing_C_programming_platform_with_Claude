'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { ensureProblemsBuilt } = require('./helpers');

ensureProblemsBuilt();
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'clab-test-'));
process.env.RATE_LIMIT_PER_MINUTE = '1000';
const db = require('../server/db');
const problems = require('../server/problems');
const judge = require('../server/judge');
const { createApp } = require('../server/app');

let server;
let base;

test.before(async () => {
  db.open(path.join(tmp, 'test.db'));
  problems.load();
  await judge.init();
  server = createApp().listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}`;
});

test.after(() => {
  server.close();
  db.close();
  fs.rmSync(tmp, { recursive: true, force: true });
});

function client() {
  let cookie = '';
  const call = async (method, url, body, extraHeaders = {}) => {
    const headers = { 'X-Requested-With': 'fetch', ...extraHeaders };
    if (cookie) headers.Cookie = cookie;
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    const res = await fetch(base + url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
    const set = res.headers.get('set-cookie');
    if (set) cookie = set.split(';')[0];
    const ct = res.headers.get('content-type') || '';
    return { status: res.status, body: ct.includes('json') ? await res.json() : await res.text() };
  };
  return {
    get: (u) => call('GET', u),
    post: (u, b = {}, h) => call('POST', u, b, h),
    put: (u, b = {}) => call('PUT', u, b),
    del: (u) => call('DELETE', u),
  };
}

const AC_CODE = '#include <stdio.h>\nint main(){long long a,b;scanf("%lld %lld",&a,&b);printf("%lld\\n",a+b);return 0;}';
const WA_CODE = '#include <stdio.h>\nint main(){int a,b;scanf("%d %d",&a,&b);printf("%d\\n",a+b);return 0;}';

test('luồng chính: đăng ký → làm bài → tiến độ', async () => {
  const admin = client();
  // Người đăng ký đầu tiên (khi chưa cấu hình ADMIN_USERNAME) trở thành admin
  let r = await admin.post('/api/auth/register', { username: 'giangvien', password: 'secret123', displayName: 'Giảng viên' });
  assert.equal(r.status, 201);
  assert.equal(r.body.user.role, 'admin');

  const sv = client();
  r = await sv.post('/api/auth/register', { username: 'sv01', password: 'secret123', displayName: 'Sinh viên 1' });
  assert.equal(r.status, 201);
  assert.equal(r.body.user.role, 'student');

  r = await sv.post('/api/auth/register', { username: 'SV01', password: 'secret123' });
  assert.equal(r.status, 409, 'tên đăng nhập không phân biệt hoa thường');

  r = await sv.get('/api/topics');
  assert.ok(r.body.topics.length >= 10);

  r = await sv.get('/api/problems/tong-hai-so');
  assert.equal(r.status, 200);
  assert.equal(r.body.problem.solution, undefined, 'chưa giải thì không thấy lời giải');
  assert.ok(r.body.problem.samples.length >= 1);
  assert.ok(!JSON.stringify(r.body).includes('"hidden":true'), 'không lộ test ẩn');

  r = await sv.put('/api/problems/tong-hai-so/draft', { code: 'int main(){}' });
  assert.equal(r.status, 200);
  r = await sv.get('/api/problems/tong-hai-so');
  assert.equal(r.body.draft.code, 'int main(){}');

  r = await sv.post('/api/problems/tong-hai-so/run', { code: AC_CODE, input: '3 5\n' });
  assert.equal(r.body.result.status, 'OK');
  assert.equal(r.body.result.stdout, '8\n');
  assert.equal(r.body.result.match, true);

  r = await sv.post('/api/problems/tong-hai-so/submit', { code: WA_CODE });
  assert.equal(r.body.submission.verdict, 'WA');
  assert.equal(r.body.solution, undefined);
  const hiddenTest = r.body.submission.tests.find((t) => t.hidden);
  assert.ok(hiddenTest && hiddenTest.input === undefined && hiddenTest.expected === undefined, 'test ẩn không lộ dữ liệu');

  r = await sv.post('/api/problems/tong-hai-so/submit', { code: AC_CODE });
  assert.equal(r.body.submission.verdict, 'AC');
  assert.equal(r.body.firstSolve, true);
  assert.ok(r.body.solution.includes('main'));

  r = await sv.post('/api/problems/tong-hai-so/submit', { code: AC_CODE });
  assert.equal(r.body.firstSolve, false);

  r = await sv.get('/api/problems/tong-hai-so');
  assert.ok(r.body.problem.solution, 'đã giải thì xem được lời giải');
  assert.equal(r.body.status.status, 'solved');
  assert.equal(r.body.status.attempts, 3);

  r = await sv.get('/api/dashboard?tz=-420');
  assert.equal(r.body.totals.solved, 1);
  assert.equal(r.body.totals.submissions, 3);
  assert.equal(r.body.streak, 1);
  assert.equal(r.body.sessions.length, 1);
  assert.equal(r.body.sessions[0].problems[0].slug, 'tong-hai-so');
  assert.ok(r.body.nextProblem);

  r = await sv.get('/api/submissions');
  assert.equal(r.body.total, 3);
  const subId = r.body.submissions[0].id;
  r = await sv.get('/api/submissions/' + subId);
  assert.equal(r.body.submission.code, AC_CODE);

  r = await sv.get('/api/leaderboard');
  assert.equal(r.body.leaders[0].username, 'sv01');

  // Sinh viên khác không xem được bài nộp
  const sv2 = client();
  await sv2.post('/api/auth/register', { username: 'sv02', password: 'secret123' });
  r = await sv2.get('/api/submissions/' + subId);
  assert.equal(r.status, 404);
  r = await sv2.get('/api/admin/users');
  assert.equal(r.status, 403);

  // Admin xem được tiến độ
  r = await admin.get('/api/admin/users');
  assert.equal(r.status, 200);
  const u = r.body.users.find((x) => x.username === 'sv01');
  assert.equal(u.solved, 1);
  r = await admin.get('/api/admin/users/' + u.id);
  assert.equal(r.body.topics.find((t) => t.slug === 'nhap-xuat').solved, 1);
  r = await admin.get('/api/admin/overview');
  assert.equal(r.body.submissions.total, 3);
  r = await admin.get('/api/admin/export.csv');
  assert.match(r.body, /sv01/);
  r = await admin.post('/api/admin/users/bulk', { text: 'sv10,abcdef,Sinh Vien 10\nbad\nsv01,abcdef,Trung' });
  assert.deepEqual(r.body.created, ['sv10']);
  assert.equal(r.body.errors.length, 2);
});

test('xác thực & bảo mật', async () => {
  const c = client();
  let r = await c.post('/api/problems/tong-hai-so/submit', { code: AC_CODE });
  assert.equal(r.status, 401);
  r = await c.post('/api/auth/login', { username: 'sv01', password: 'sai' });
  assert.equal(r.status, 401);
  r = await c.post('/api/auth/login', { username: 'sv01', password: 'secret123' });
  assert.equal(r.status, 200);
  r = await c.get('/api/auth/me');
  assert.equal(r.body.user.username, 'sv01');

  // Thiếu header chống CSRF
  const res = await fetch(base + '/api/auth/logout', { method: 'POST' });
  assert.equal(res.status, 403);

  r = await c.post('/api/auth/password', { current: 'secret123', next: 'newpass1' });
  assert.equal(r.status, 200);
  r = await c.post('/api/auth/logout');
  r = await c.get('/api/auth/me');
  assert.equal(r.body.user, null);
  r = await c.post('/api/auth/login', { username: 'sv01', password: 'newpass1' });
  assert.equal(r.status, 200);

  r = await c.get('/api/problems/khong-ton-tai');
  assert.equal(r.status, 404);
  r = await c.post('/api/problems/tong-hai-so/submit', { code: '' });
  assert.equal(r.status, 400);
});

test('trang SPA và tài nguyên tĩnh', async () => {
  let res = await fetch(base + '/problems/tong-hai-so', { headers: { Accept: 'text/html' } });
  assert.equal(res.status, 200);
  assert.match(await res.text(), /<div id="app"|id="app"/);
  assert.match(res.headers.get('content-security-policy'), /default-src 'self'/);
  res = await fetch(base + '/vendor/monaco/vs/loader.js');
  assert.equal(res.status, 200);
});
