# C Lab — Nền tảng luyện tập lập trình C

Website luyện tập lập trình C **theo chủ đề của môn học**, giống LeetCode: sinh viên đọc đề, viết mã trong trình soạn thảo
kiểu VS Code ngay trên trình duyệt, nhấn **Nộp bài** và nhận kết quả chấm tự động sau vài giây.

## Tính năng

**Cho sinh viên**
- **14 chủ đề, 158 bài tập, 885 test case** bám sát giáo trình Lập trình C: nhập xuất → toán tử → rẽ nhánh → vòng lặp → hàm →
  đệ quy → mảng 1 chiều → ma trận → chuỗi → con trỏ → cấp phát động & danh sách liên kết → struct → thuật toán sắp xếp/tìm kiếm → thao tác bit.
  Mỗi chủ đề chia thành nhiều **dạng bài**, mỗi bài có 3–10 test (test mẫu hiển thị + test ẩn), có phần "Kiến thức cần nhớ" và gợi ý.
- **Trình soạn thảo Monaco** (lõi của VS Code): tô màu cú pháp, tự hoàn thành hàm thư viện C và snippet (`for`, `printf`, `scanf`...),
  **gạch chân dòng lỗi biên dịch** ngay trong editor, đổi cỡ chữ, giao diện sáng/tối.
- **Chạy thử** với input tùy ý hoặc ví dụ mẫu (`Ctrl + '`), **Nộp bài** chấm toàn bộ test (`Ctrl + Enter`).
- Kết quả chấm chi tiết: Accepted / Wrong Answer / Time Limit / Runtime Error (giải thích nguyên nhân: segfault, chia 0...) /
  Compile Error; so sánh output của bạn với output mong đợi, tô đỏ dòng khác biệt.
- **Tự động lưu bản nháp** (trên máy chủ + trình duyệt) — đóng trình duyệt, mở lại vẫn còn mã đang viết.
- **Theo dõi tiến độ**: số bài đã giải theo chủ đề/độ khó, chuỗi ngày học liên tục, bản đồ hoạt động cả năm,
  **"Buổi học gần nhất"** (đã làm những bài nào, bài nào chưa xong) và nút **Tiếp tục** đưa thẳng tới bài đang làm dở.
- Lời giải mẫu được mở khóa sau khi bài được Accepted. Lịch sử nộp bài, nạp lại mã cũ, bảng xếp hạng.

**Cho giảng viên (tài khoản admin)**
- Danh sách sinh viên với tiến độ, số lần nộp, thời điểm hoạt động gần nhất; xem chi tiết từng sinh viên
  (tiến độ theo chủ đề, các buổi học, bài đang gặp khó khăn, mã nguồn từng lần nộp).
- Thống kê từng bài tập (số SV thử/giải, tỉ lệ AC) để biết bài nào lớp đang gặp khó.
- Tạo tài khoản hàng loạt, đặt lại mật khẩu, phân quyền, **xuất CSV tiến độ** (mở bằng Excel).

## Công nghệ

| Thành phần | Công nghệ |
|---|---|
| Máy chủ | Node.js 22 + Express 5 |
| Cơ sở dữ liệu | SQLite (module `node:sqlite` có sẵn trong Node — không cần cài thêm) |
| Chấm bài | GCC + sandbox seccomp-bpf tự viết (`server/judge/sandbox.c`) |
| Giao diện | HTML/CSS/JS thuần (ES modules, không cần build) + Monaco Editor phục vụ trực tiếp từ máy chủ |

## Chạy nhanh (máy cá nhân, Linux/macOS/WSL)

Yêu cầu: **Node.js ≥ 22.13** và **gcc** (`sudo apt install gcc` trên Ubuntu/Debian). Sandbox dùng seccomp nên máy chủ chấm bài cần chạy trên **Linux** (WSL2 được).

```bash
npm install
npm start            # tự build ngân hàng đề lần đầu (~10 giây) rồi chạy ở http://localhost:3000
```

Người **đăng ký đầu tiên** sẽ trở thành quản trị viên (nếu chưa cấu hình `ADMIN_USERNAME`).

## Triển khai bằng Docker (khuyến nghị cho môi trường thật)

```bash
# Sửa ADMIN_PASSWORD trong docker-compose.yml trước!
docker compose up -d --build
```

Dữ liệu (SQLite) nằm trong volume `clab-data`. Sao lưu: sao chép file `/app/data/app.db` (khi server đang chạy nên dùng
`sqlite3 app.db ".backup backup.db"`).

Khi đặt sau HTTPS reverse proxy (nginx/Caddy), đặt `SECURE_COOKIES=1` và `TRUST_PROXY=1`. Ví dụ nginx:

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 120s;
}
```

### Biến môi trường

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `PORT` / `HOST` | `3000` / `0.0.0.0` | Cổng và địa chỉ lắng nghe |
| `DATA_DIR` | `./data` | Thư mục chứa cơ sở dữ liệu |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD` | — | Tạo sẵn tài khoản quản trị khi khởi động |
| `ALLOW_REGISTRATION` | `1` | `0` = tắt tự đăng ký (giảng viên tạo tài khoản hàng loạt) |
| `JUDGE_CONCURRENCY` | số CPU | Số bài được chấm song song |
| `TIME_LIMIT_MS`, `MEMORY_LIMIT_MB` | `2000`, `256` | Giới hạn mặc định cho mỗi test (bài có thể ghi đè) |
| `RATE_LIMIT_PER_MINUTE` | `20` | Số lần chạy/nộp tối đa mỗi phút của một người |
| `STUDY_SESSION_GAP_MINUTES` | `90` | Nghỉ quá bao lâu thì tính là "buổi học" mới |
| `SESSION_DAYS` | `30` | Thời hạn đăng nhập |
| `SECURE_COOKIES`, `TRUST_PROXY` | — | Dùng khi chạy sau HTTPS proxy |

## An toàn khi chạy mã của sinh viên

Mỗi bài nộp được biên dịch với một đối tượng `sandbox.o`. Hàm khởi tạo của nó nằm trong `.preinit_array` nên chạy **trước** mọi
mã của người dùng, và:

1. Đặt giới hạn CPU, bộ nhớ (RLIMIT_AS), kích thước file, stack.
2. Cài bộ lọc **seccomp-bpf dạng whitelist**: chỉ cho phép đọc/ghi stdin/stdout, cấp phát bộ nhớ, lấy thời gian, thoát.
   Mọi thao tác khác — mở file, mạng, `fork`/`exec`, gửi tín hiệu tới tiến trình khác — đều bị từ chối.

Ngoài ra máy chủ: chỉ cho phép `#include` header hệ thống (kiểm tra bằng `gcc -M`), chặn inline assembly/constructor/section
(kiểm tra trên mã đã tiền xử lý nên không lách được bằng macro), giới hạn thời gian thực, kích thước output, bộ nhớ của chính gcc,
số bài chấm đồng thời, tần suất nộp bài. Trong Docker, ứng dụng chạy bằng user không có quyền root. Không cần quyền root hay
cấu hình đặc biệt cho Docker (profile seccomp mặc định của Docker cho phép tiến trình tự cài seccomp).

## Thêm / sửa bài tập

Ngân hàng đề nằm trong `problems/*.js` — mỗi file là một chủ đề. Đáp án của test **không viết tay** mà được sinh ra bằng cách chạy
lời giải mẫu, nên chỉ cần viết input:

```js
{
  slug: 'tong-hai-so',                 // duy nhất, dùng làm URL
  title: 'Tổng hai số',
  difficulty: 'easy',                  // easy | medium | hard
  statement: 'Nhập hai số nguyên `a` và `b`. In ra tổng `a + b`.',   // Markdown
  input: 'Một dòng gồm hai số nguyên...',
  output: 'Một số nguyên là `a + b`.',
  hint: 'Dùng `long long` và `%lld`.', // không bắt buộc
  starter: c`...`,                     // mã khởi đầu, không bắt buộc
  solution: c`#include <stdio.h> ...`, // lời giải mẫu (bắt buộc)
  tests: ['3 5', '-10 4', '0 0', '2000000000 2000000000'],  // 3–10 input
  samples: 2,                          // số test đầu được hiển thị làm ví dụ (mặc định 2)
  timeLimitMs: 2000,                   // không bắt buộc
}
```

Sau khi sửa, chạy `npm run build:problems` (hoặc chỉ cần khởi động lại `npm start` — đề được build lại khi file nguồn thay đổi).
Script kiểm tra cấu trúc, đảm bảo lời giải mẫu chạy được và đủ nhanh (≤ 1/2 giới hạn thời gian), rồi ghi `content/problems.json`.
Dùng `node scripts/build-problems.js --only=<slug-chủ-đề>` để kiểm tra nhanh một chủ đề.

> Output được so sánh theo từng dòng, bỏ qua khoảng trắng cuối dòng và dòng trống ở cuối. Với số thực, hãy yêu cầu định dạng cụ thể (`%.2f`).

## Kiểm thử

```bash
npm test
```

Gồm: kiểm thử bộ chấm & sandbox (AC/WA/TLE/RE/CE/OLE, chặn mở file, fork, socket, include, asm...), kiểm thử API
(đăng ký, nộp bài, tiến độ, phân quyền, CSRF), và **chấm lại lời giải mẫu của toàn bộ 158 bài** qua đúng bộ chấm thật.

## Cấu trúc thư mục

```
server/
  index.js            khởi động máy chủ
  app.js              cấu hình Express, bảo mật header, định tuyến
  config.js           đọc biến môi trường
  db.js               SQLite schema
  auth.js             mật khẩu (scrypt), phiên đăng nhập, phân quyền, chống CSRF, giới hạn tần suất
  problems.js         nạp ngân hàng đề
  progress.js         tiến độ, buổi học, bảng điều khiển
  judge/              bộ chấm bài + sandbox.c
  routes/             API: auth, problems/submissions, admin
problems/             nguồn ngân hàng đề (mỗi file một chủ đề)
scripts/build-problems.js
public/               giao diện (SPA thuần JS)
test/                 kiểm thử tự động
```
