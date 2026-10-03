'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const judge = require('../server/judge');

const tests = [
  { input: '1 2\n', output: '3\n', hidden: false },
  { input: '5 7\n', output: '12\n', hidden: true },
];
const run = (code, opts) => judge.judge(code, tests, { timeLimitMs: 1000, ...opts });

test('chấp nhận lời giải đúng (AC)', async () => {
  const r = await run('#include <stdio.h>\nint main(){int a,b;scanf("%d%d",&a,&b);printf("%d\\n",a+b);return 0;}');
  assert.equal(r.verdict, 'AC');
  assert.equal(r.passed, 2);
});

test('bỏ qua khoảng trắng cuối dòng và dòng trống cuối', async () => {
  const r = await run('#include <stdio.h>\nint main(){int a,b;scanf("%d%d",&a,&b);printf("%d   \\n\\n\\n",a+b);return 0;}');
  assert.equal(r.verdict, 'AC');
});

test('sai kết quả (WA)', async () => {
  const r = await run('#include <stdio.h>\nint main(){int a,b;scanf("%d%d",&a,&b);printf("%d\\n",a*b);return 0;}');
  assert.equal(r.verdict, 'WA');
  assert.equal(r.passed, 0);
  assert.equal(r.tests[0].actual, '2\n');
});

test('lỗi biên dịch (CE) kèm thông báo của gcc', async () => {
  const r = await run('int main(){ return x; }');
  assert.equal(r.verdict, 'CE');
  assert.match(r.compileOutput, /main\.c:1:\d+: error/);
  assert.doesNotMatch(r.compileOutput, /cjudge/);
});

test('quá thời gian (TLE)', async () => {
  const r = await run('int main(){ volatile int x = 0; while (1) x++; }', { timeLimitMs: 500 });
  assert.equal(r.verdict, 'TLE');
});

test('lỗi khi chạy (RE) — segmentation fault', async () => {
  const r = await run('int main(){ int *p = 0; *p = 1; return 0; }');
  assert.equal(r.verdict, 'RE');
  assert.match(r.tests[0].message, /Segmentation/);
});

test('main trả về khác 0 bị tính là RE', async () => {
  const r = await run('#include <stdio.h>\nint main(){int a,b;scanf("%d%d",&a,&b);printf("%d\\n",a+b);return 3;}');
  assert.equal(r.verdict, 'RE');
});

test('output quá lớn (OLE)', async () => {
  const r = await run('#include <stdio.h>\nint main(){ for(;;) puts("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"); }');
  assert.equal(r.verdict, 'OLE');
});

test('sandbox: không mở được file, không fork, không tạo socket', async () => {
  const code = `#include <stdio.h>
#include <unistd.h>
#include <sys/socket.h>
int main(){
  FILE *f = fopen("/etc/passwd", "r");
  int pid = fork();
  int s = socket(AF_INET, SOCK_STREAM, 0);
  printf("%d %d %d\\n", f == NULL, pid < 0, s < 0);
  return 0;
}`;
  const r = await judge.judge(code, [{ input: '', output: '1 1 1\n' }], { timeLimitMs: 1000 });
  assert.equal(r.verdict, 'AC', JSON.stringify(r.tests));
});

test('sandbox: chặn #include file ngoài thư viện chuẩn', async () => {
  const r = await run('#include "/etc/passwd"\nint main(){return 0;}');
  assert.equal(r.verdict, 'CE');
  assert.match(r.compileOutput, /Không được phép #include/);
  assert.doesNotMatch(r.compileOutput, /root:/);
});

test('sandbox: chặn inline asm và constructor (kể cả qua macro)', async () => {
  const a = await run('int main(){ __asm__("nop"); return 0; }');
  assert.equal(a.verdict, 'CE');
  const b = await run('#define K(x,y) x##y\n__attribute__((K(constr,uctor))) static void f(void){}\nint main(){return 0;}');
  assert.equal(b.verdict, 'CE');
  assert.match(b.compileOutput, /constructor/);
});

test('chuỗi chứa từ khóa bị cấm vẫn hợp lệ', async () => {
  const r = await judge.judge('#include <stdio.h>\nint main(){ printf("asm section constructor\\n"); return 0; }',
    [{ input: '', output: 'asm section constructor\n' }]);
  assert.equal(r.verdict, 'AC');
});

test('runCustom trả về stdout', async () => {
  const r = await judge.runCustom('#include <stdio.h>\nint main(){int n;scanf("%d",&n);printf("%d\\n",n*2);return 0;}', '21\n');
  assert.equal(r.status, 'OK');
  assert.equal(r.stdout, '42\n');
});

test('normalize/outputsMatch', () => {
  assert.ok(judge.outputsMatch('1 2  \r\n3\n\n', '1 2\n3'));
  assert.ok(!judge.outputsMatch('1  2', '1 2'));
});

test('sandbox: không thể vượt kiểm tra bằng cách làm phình output tiền xử lý', async () => {
  const code = `#define A x x x x x x x x x x x x x x x x
#define B A A A A A A A A A A A A A A A A
#define C B B B B B B B B B B B B B B B B
#define D C C C C C C C C C C C C C C C C
#define E D D D D D D D D D D D D D D D D
#define F E E E E E E E E E E E E E E E E
#if 0
F
#endif
static int junk[] = { 0 };
int main(){ __asm__("nop"); return junk[0]; }
F`;
  const r = await run(code);
  assert.equal(r.verdict, 'CE');
});
