const c = String.raw;

module.exports = {
  slug: 'vong-lap',
  title: 'Vòng lặp',
  icon: '🔁',
  description: 'for, while, do-while, break/continue: tính tổng dãy, xử lý chữ số, số học và vẽ hình.',
  intro: `
    **Kiến thức cần nhớ**

    - \`for (khoi_tao; dieu_kien; buoc_nhay) { ... }\` — dùng khi biết trước số lần lặp.
    - \`while (dieu_kien) { ... }\` — lặp khi điều kiện còn đúng; \`do { ... } while (dieu_kien);\` chạy ít nhất 1 lần.
    - \`break\` thoát vòng lặp, \`continue\` bỏ qua phần còn lại của lần lặp hiện tại.
    - Tách chữ số: lặp \`while (n > 0) { d = n % 10; n /= 10; }\`.
    - Kiểm tra nguyên tố hiệu quả: chỉ cần thử các ước tới \`√n\` (\`i * i <= n\`).
  `,
  categories: [
    {
      slug: 'tong-day-so',
      title: 'Tính tổng & dãy số',
      description: 'Tổng, tích, dãy số có quy luật.',
      problems: [
        {
          slug: 'tong-1-den-n',
          title: 'Tổng từ 1 đến n',
          difficulty: 'easy',
          statement: 'Nhập số nguyên dương `n`. Tính tổng S = 1 + 2 + ... + n và tổng các số chẵn trong đoạn [1, n]. In mỗi tổng trên một dòng.',
          input: 'Một số nguyên `n` (1 ≤ n ≤ 10<sup>6</sup>).',
          output: 'Hai dòng: tổng 1..n và tổng các số chẵn.',
          hint: 'Tổng có thể vượt quá `int`, dùng `long long`.',
          solution: c`
            #include <stdio.h>
            int main() {
                int n;
                scanf("%d", &n);
                long long s = 0, e = 0;
                for (int i = 1; i <= n; i++) { s += i; if (i % 2 == 0) e += i; }
                printf("%lld\n%lld\n", s, e);
                return 0;
            }`,
          tests: ['5', '1', '10', '100', '1000000', '7'],
        },
        {
          slug: 'giai-thua',
          title: 'Giai thừa',
          difficulty: 'easy',
          statement: 'Nhập số nguyên `n`. Tính n! = 1 × 2 × ... × n (quy ước 0! = 1).',
          input: 'Một số nguyên `n` (0 ≤ n ≤ 20).',
          output: 'Giá trị n!.',
          hint: '20! ≈ 2.4 × 10<sup>18</sup> vẫn vừa kiểu `long long` (hoặc `unsigned long long`).',
          solution: c`
            #include <stdio.h>
            int main() {
                int n;
                scanf("%d", &n);
                long long f = 1;
                for (int i = 2; i <= n; i++) f *= i;
                printf("%lld\n", f);
                return 0;
            }`,
          tests: ['5', '0', '1', '10', '15', '20'],
        },
        {
          slug: 'tong-nghich-dao',
          title: 'Tổng nghịch đảo',
          difficulty: 'easy',
          statement: `
            Nhập số nguyên dương \`n\`. Tính tổng:

            S = 1 + 1/2 + 1/3 + ... + 1/n

            In kết quả với 4 chữ số thập phân.
          `,
          input: 'Một số nguyên `n` (1 ≤ n ≤ 10<sup>6</sup>).',
          output: 'Giá trị S với 4 chữ số thập phân.',
          hint: '`1 / i` với `i` nguyên luôn bằng 0 khi i > 1. Hãy dùng `1.0 / i`.',
          solution: c`
            #include <stdio.h>
            int main() {
                int n;
                scanf("%d", &n);
                double s = 0;
                for (int i = 1; i <= n; i++) s += 1.0 / i;
                printf("%.4f\n", s);
                return 0;
            }`,
          tests: ['1', '2', '3', '10', '1000', '1000000'],
        },
        {
          slug: 'day-fibonacci',
          title: 'Dãy Fibonacci',
          difficulty: 'easy',
          statement: `
            Dãy Fibonacci: F1 = 1, F2 = 1, Fn = Fn−1 + Fn−2 (n ≥ 3).

            Nhập \`n\`, in ra \`n\` số Fibonacci đầu tiên trên một dòng, cách nhau một khoảng trắng.
          `,
          input: 'Một số nguyên `n` (1 ≤ n ≤ 90).',
          output: '`n` số Fibonacci đầu tiên.',
          solution: c`
            #include <stdio.h>
            int main() {
                int n;
                scanf("%d", &n);
                long long a = 1, b = 1;
                for (int i = 1; i <= n; i++) {
                    printf(i == 1 ? "%lld" : " %lld", a);
                    long long t = a + b; a = b; b = t;
                }
                printf("\n");
                return 0;
            }`,
          tests: ['10', '1', '2', '20', '90', '5'],
        },
        {
          slug: 'tinh-pi',
          title: 'Xấp xỉ số π',
          difficulty: 'medium',
          statement: `
            Công thức Leibniz: π/4 = 1 − 1/3 + 1/5 − 1/7 + ...

            Nhập số nguyên \`n\`, tính tổng \`n\` số hạng đầu tiên của chuỗi rồi nhân 4 để được xấp xỉ π.
            In kết quả với 6 chữ số thập phân.
          `,
          input: 'Một số nguyên `n` (1 ≤ n ≤ 10<sup>7</sup>).',
          output: 'Xấp xỉ π với 6 chữ số thập phân.',
          solution: c`
            #include <stdio.h>
            int main() {
                int n;
                scanf("%d", &n);
                double s = 0;
                for (int i = 0; i < n; i++) s += (i % 2 == 0 ? 1.0 : -1.0) / (2 * i + 1);
                printf("%.6f\n", 4 * s);
                return 0;
            }`,
          tests: ['1', '2', '10', '1000', '1000000', '10000000'],
        },
      ],
    },
    {
      slug: 'xu-ly-chu-so',
      title: 'Xử lý chữ số',
      description: 'Tách, đếm, đảo ngược chữ số của số nguyên.',
      problems: [
        {
          slug: 'dem-va-tong-chu-so',
          title: 'Đếm và tính tổng chữ số',
          difficulty: 'easy',
          statement: 'Nhập số nguyên không âm `n`. In ra số lượng chữ số của `n` và tổng các chữ số (cách nhau một khoảng trắng).',
          input: 'Một số nguyên `n` (0 ≤ n ≤ 10<sup>18</sup>).',
          output: 'Số chữ số và tổng chữ số.',
          hint: 'Chú ý trường hợp `n = 0` có 1 chữ số. Có thể dùng vòng lặp `do-while`.',
          solution: c`
            #include <stdio.h>
            int main() {
                long long n;
                scanf("%lld", &n);
                int cnt = 0, s = 0;
                do { s += n % 10; cnt++; n /= 10; } while (n > 0);
                printf("%d %d\n", cnt, s);
                return 0;
            }`,
          tests: ['12345', '0', '7', '1000000000000000000', '999999999', '1020304'],
        },
        {
          slug: 'dao-nguoc-so',
          title: 'Đảo ngược số',
          difficulty: 'easy',
          statement: 'Nhập số nguyên dương `n`. In ra số đảo ngược của `n` (bỏ các số 0 ở đầu sau khi đảo). Ví dụ: 1230 → 321.',
          input: 'Một số nguyên `n` (1 ≤ n ≤ 10<sup>9</sup>).',
          output: 'Số đảo ngược.',
          solution: c`
            #include <stdio.h>
            int main() {
                long long n, r = 0;
                scanf("%lld", &n);
                while (n > 0) { r = r * 10 + n % 10; n /= 10; }
                printf("%lld\n", r);
                return 0;
            }`,
          tests: ['12345', '1230', '7', '1000000000', '1000000009', '121'],
        },
        {
          slug: 'so-doi-xung',
          title: 'Số đối xứng',
          difficulty: 'easy',
          statement: 'Số đối xứng (palindrome) là số đọc xuôi hay ngược đều giống nhau, ví dụ 12321. Nhập `n`, in `YES` nếu `n` là số đối xứng, ngược lại in `NO`.',
          input: 'Một số nguyên `n` (0 ≤ n ≤ 10<sup>18</sup>).',
          output: '`YES` hoặc `NO`.',
          solution: c`
            #include <stdio.h>
            int main() {
                long long n;
                scanf("%lld", &n);
                long long t = n, r = 0;
                while (t > 0) { r = r * 10 + t % 10; t /= 10; }
                printf(r == n ? "YES\n" : "NO\n");
                return 0;
            }`,
          tests: ['12321', '123', '0', '9', '1000000000000000001', '10', '45677654'],
        },
        {
          slug: 'so-armstrong',
          title: 'Số Armstrong',
          difficulty: 'medium',
          statement: `
            Số Armstrong là số có \`k\` chữ số và bằng tổng lũy thừa bậc \`k\` của các chữ số của nó.
            Ví dụ: 153 = 1³ + 5³ + 3³; 9474 = 9⁴ + 4⁴ + 7⁴ + 4⁴.

            Nhập \`a\` và \`b\`, in ra tất cả số Armstrong trong đoạn [a, b] trên một dòng, cách nhau một khoảng trắng.
            Nếu không có số nào, in \`-1\`.
          `,
          input: 'Hai số nguyên `a b` (1 ≤ a ≤ b ≤ 10<sup>6</sup>).',
          output: 'Các số Armstrong hoặc `-1`.',
          hint: 'Viết vòng lặp đếm số chữ số `k`, sau đó vòng lặp thứ hai tính tổng lũy thừa (tự nhân, không cần `pow`).',
          solution: c`
            #include <stdio.h>
            int isArm(int n) {
                int k = 0, t = n;
                while (t > 0) { k++; t /= 10; }
                long long s = 0; t = n;
                while (t > 0) {
                    int d = t % 10; long long p = 1;
                    for (int i = 0; i < k; i++) p *= d;
                    s += p; t /= 10;
                }
                return s == n;
            }
            int main() {
                int a, b, found = 0;
                scanf("%d %d", &a, &b);
                for (int i = a; i <= b; i++) if (isArm(i)) { printf(found ? " %d" : "%d", i); found = 1; }
                printf(found ? "\n" : "-1\n");
                return 0;
            }`,
          tests: ['100 999', '1 10', '10 100', '1 1000000', '9475 54747', '370 371'],
        },
      ],
    },
    {
      slug: 'so-hoc',
      title: 'Số học',
      description: 'Ước số, số nguyên tố, USCLN, BSCNN.',
      problems: [
        {
          slug: 'kiem-tra-nguyen-to',
          title: 'Kiểm tra số nguyên tố',
          difficulty: 'easy',
          statement: 'Nhập số nguyên `n`. In `YES` nếu `n` là số nguyên tố, ngược lại in `NO`.',
          input: 'Một số nguyên `n` (|n| ≤ 2 × 10<sup>9</sup>).',
          output: '`YES` hoặc `NO`.',
          hint: 'Số nguyên tố phải lớn hơn 1. Chỉ cần thử chia cho các số `i` với `i * i <= n` (dùng `long long` cho `i * i`).',
          solution: c`
            #include <stdio.h>
            int main() {
                long long n;
                scanf("%lld", &n);
                int ok = n > 1;
                for (long long i = 2; i * i <= n && ok; i++) if (n % i == 0) ok = 0;
                printf(ok ? "YES\n" : "NO\n");
                return 0;
            }`,
          tests: ['7', '1', '2', '91', '1999999973', '-7', '1000000007', '2000000000'],
        },
        {
          slug: 'uscln-bscnn',
          title: 'USCLN và BSCNN',
          difficulty: 'easy',
          statement: 'Nhập hai số nguyên dương `a, b`. In ra ước số chung lớn nhất và bội số chung nhỏ nhất của chúng (cách nhau một khoảng trắng).',
          input: 'Hai số nguyên `a b` (1 ≤ a, b ≤ 10<sup>9</sup>).',
          output: 'USCLN và BSCNN.',
          hint: 'Thuật toán Euclid: `while (b != 0) { r = a % b; a = b; b = r; }`. BSCNN = a / USCLN × b (chia trước để tránh tràn số).',
          solution: c`
            #include <stdio.h>
            int main() {
                long long a, b;
                scanf("%lld %lld", &a, &b);
                long long x = a, y = b;
                while (y) { long long r = x % y; x = y; y = r; }
                printf("%lld %lld\n", x, a / x * b);
                return 0;
            }`,
          tests: ['12 18', '7 13', '100 10', '1 1', '1000000000 999999999', '48 180'],
        },
        {
          slug: 'liet-ke-uoc',
          title: 'Liệt kê ước số',
          difficulty: 'easy',
          statement: 'Nhập số nguyên dương `n`. Dòng 1 in ra tất cả các ước dương của `n` theo thứ tự tăng dần; dòng 2 in số lượng ước; dòng 3 in tổng các ước.',
          input: 'Một số nguyên `n` (1 ≤ n ≤ 10<sup>6</sup>).',
          output: 'Ba dòng như mô tả.',
          solution: c`
            #include <stdio.h>
            int main() {
                int n, cnt = 0;
                long long s = 0;
                scanf("%d", &n);
                for (int i = 1; i <= n; i++) if (n % i == 0) { printf(cnt ? " %d" : "%d", i); cnt++; s += i; }
                printf("\n%d\n%lld\n", cnt, s);
                return 0;
            }`,
          tests: ['12', '1', '13', '36', '1000000', '720720'],
        },
        {
          slug: 'so-hoan-hao',
          title: 'Số hoàn hảo',
          difficulty: 'medium',
          statement: `
            Số hoàn hảo là số nguyên dương bằng tổng các ước dương **nhỏ hơn nó**. Ví dụ: 6 = 1 + 2 + 3, 28 = 1 + 2 + 4 + 7 + 14.

            Nhập \`n\`, in ra tất cả các số hoàn hảo không vượt quá \`n\` (cách nhau một khoảng trắng). Nếu không có in \`-1\`.
          `,
          input: 'Một số nguyên `n` (1 ≤ n ≤ 10<sup>5</sup>).',
          output: 'Các số hoàn hảo hoặc `-1`.',
          hint: 'Duyệt ước tới √i để tính tổng ước nhanh, nếu không chương trình sẽ quá thời gian với n = 10<sup>5</sup>.',
          solution: c`
            #include <stdio.h>
            int main() {
                int n, found = 0;
                scanf("%d", &n);
                for (int x = 2; x <= n; x++) {
                    long long s = 1;
                    for (int i = 2; (long long)i * i <= x; i++) if (x % i == 0) { s += i; if (i != x / i) s += x / i; }
                    if (s == x) { printf(found ? " %d" : "%d", x); found = 1; }
                }
                printf(found ? "\n" : "-1\n");
                return 0;
            }`,
          tests: ['30', '5', '1', '500', '10000', '100000'],
        },
        {
          slug: 'phan-tich-thua-so',
          title: 'Phân tích thừa số nguyên tố',
          difficulty: 'medium',
          statement: `
            Nhập số nguyên \`n > 1\`. Phân tích \`n\` thành tích các thừa số nguyên tố theo dạng \`p1^a1 * p2^a2 * ...\`
            với p1 < p2 < ... . Nếu số mũ bằng 1 thì chỉ in \`p\`.

            Ví dụ: 360 = \`2^3 * 3^2 * 5\`.
          `,
          input: 'Một số nguyên `n` (2 ≤ n ≤ 10<sup>12</sup>).',
          output: 'Dạng phân tích như mô tả.',
          solution: c`
            #include <stdio.h>
            int main() {
                long long n;
                scanf("%lld", &n);
                int first = 1;
                for (long long p = 2; p * p <= n; p++) {
                    if (n % p) continue;
                    int a = 0;
                    while (n % p == 0) { n /= p; a++; }
                    if (!first) printf(" * ");
                    first = 0;
                    if (a > 1) printf("%lld^%d", p, a); else printf("%lld", p);
                }
                if (n > 1) { if (!first) printf(" * "); printf("%lld", n); }
                printf("\n");
                return 0;
            }`,
          tests: ['360', '2', '97', '1024', '999999999989', '600851475143', '1000000000000'],
        },
      ],
    },
    {
      slug: 've-hinh',
      title: 'Vẽ hình bằng ký tự',
      description: 'Vòng lặp lồng nhau.',
      problems: [
        {
          slug: 'tam-giac-sao',
          title: 'Tam giác vuông bằng dấu *',
          difficulty: 'easy',
          statement: `
            Nhập \`n\`, in ra tam giác vuông cao \`n\` dòng, dòng thứ \`i\` có \`i\` dấu \`*\`.

            Ví dụ n = 4:

            \`\`\`
            *
            **
            ***
            ****
            \`\`\`
          `,
          input: 'Một số nguyên `n` (1 ≤ n ≤ 50).',
          output: 'Tam giác như mô tả.',
          solution: c`
            #include <stdio.h>
            int main() {
                int n;
                scanf("%d", &n);
                for (int i = 1; i <= n; i++) {
                    for (int j = 0; j < i; j++) putchar('*');
                    putchar('\n');
                }
                return 0;
            }`,
          tests: ['4', '1', '2', '7', '50'],
        },
        {
          slug: 'kim-tu-thap',
          title: 'Kim tự tháp',
          difficulty: 'easy',
          statement: `
            Nhập \`n\`, in kim tự tháp cao \`n\` dòng. Dòng thứ \`i\` gồm \`n − i\` khoảng trắng rồi \`2i − 1\` dấu \`*\`
            (không in khoảng trắng ở cuối dòng).

            Ví dụ n = 3:

            \`\`\`
              *
             ***
            *****
            \`\`\`
          `,
          input: 'Một số nguyên `n` (1 ≤ n ≤ 50).',
          output: 'Kim tự tháp như mô tả.',
          solution: c`
            #include <stdio.h>
            int main() {
                int n;
                scanf("%d", &n);
                for (int i = 1; i <= n; i++) {
                    for (int j = 0; j < n - i; j++) putchar(' ');
                    for (int j = 0; j < 2 * i - 1; j++) putchar('*');
                    putchar('\n');
                }
                return 0;
            }`,
          tests: ['3', '1', '5', '10', '50'],
        },
        {
          slug: 'hinh-vuong-rong',
          title: 'Hình vuông rỗng',
          difficulty: 'easy',
          statement: `
            Nhập \`n\`, in hình vuông kích thước \`n × n\` chỉ có viền là dấu \`#\`, bên trong là dấu \`.\`.

            Ví dụ n = 4:

            \`\`\`
            ####
            #..#
            #..#
            ####
            \`\`\`
          `,
          input: 'Một số nguyên `n` (1 ≤ n ≤ 50).',
          output: 'Hình vuông như mô tả.',
          solution: c`
            #include <stdio.h>
            int main() {
                int n;
                scanf("%d", &n);
                for (int i = 0; i < n; i++) {
                    for (int j = 0; j < n; j++) putchar(i == 0 || j == 0 || i == n - 1 || j == n - 1 ? '#' : '.');
                    putchar('\n');
                }
                return 0;
            }`,
          tests: ['4', '1', '2', '3', '8', '50'],
        },
        {
          slug: 'bang-cuu-chuong',
          title: 'Bảng cửu chương',
          difficulty: 'easy',
          statement: `
            Nhập \`n\`, in bảng cửu chương của \`n\` từ 1 đến 10, mỗi dòng có dạng \`n x i = n*i\`.

            Ví dụ n = 2, dòng đầu: \`2 x 1 = 2\`
          `,
          input: 'Một số nguyên `n` (1 ≤ n ≤ 1000).',
          output: '10 dòng.',
          solution: c`
            #include <stdio.h>
            int main() {
                int n;
                scanf("%d", &n);
                for (int i = 1; i <= 10; i++) printf("%d x %d = %d\n", n, i, n * i);
                return 0;
            }`,
          tests: ['2', '9', '1', '13', '1000'],
        },
      ],
    },
    {
      slug: 'vong-lap-dieu-kien',
      title: 'Lặp với điều kiện dừng',
      description: 'while, do-while, break khi chưa biết trước số lần lặp.',
      problems: [
        {
          slug: 'nhap-den-khi-gap-0',
          title: 'Nhập đến khi gặp số 0',
          difficulty: 'easy',
          statement: 'Nhập lần lượt các số nguyên cho đến khi gặp số `0` (số 0 không tính). In ra: số lượng số đã nhập, tổng, số lớn nhất. Nếu không có số nào (số đầu tiên là 0), in `0 0 0`.',
          input: 'Dãy số nguyên (|x| ≤ 10<sup>6</sup>) cách nhau bởi khoảng trắng hoặc xuống dòng, kết thúc bằng số 0.',
          output: 'Ba số: số lượng, tổng, giá trị lớn nhất.',
          solution: c`
            #include <stdio.h>
            int main() {
                long long x, s = 0, mx = 0;
                int cnt = 0;
                while (scanf("%lld", &x) == 1 && x != 0) {
                    if (cnt == 0 || x > mx) mx = x;
                    s += x; cnt++;
                }
                printf("%d %lld %lld\n", cnt, s, mx);
                return 0;
            }`,
          tests: ['3 5 -2 8 0', '0', '-5 -3 -9 0', '7\n0', '1 2 3 4 5 6 7 8 9 10 0', '1000000 -1000000 999999 0'],
        },
        {
          slug: 'collatz',
          title: 'Dãy Collatz',
          difficulty: 'medium',
          statement: `
            Bắt đầu từ \`n\`: nếu \`n\` chẵn thì \`n = n / 2\`, nếu lẻ thì \`n = 3n + 1\`. Lặp cho tới khi \`n = 1\`.

            In ra dãy các giá trị (kể cả \`n\` ban đầu và số 1 cuối cùng) trên một dòng, sau đó dòng thứ hai in số bước biến đổi.
          `,
          input: 'Một số nguyên `n` (1 ≤ n ≤ 10<sup>6</sup>).',
          output: 'Dòng 1: dãy giá trị. Dòng 2: số bước.',
          hint: 'Giá trị trung gian có thể vượt quá `int`, dùng `long long`.',
          solution: c`
            #include <stdio.h>
            int main() {
                long long n;
                int steps = 0;
                scanf("%lld", &n);
                printf("%lld", n);
                while (n != 1) {
                    n = n % 2 == 0 ? n / 2 : 3 * n + 1;
                    printf(" %lld", n);
                    steps++;
                }
                printf("\n%d\n", steps);
                return 0;
            }`,
          tests: ['6', '1', '7', '27', '837799', '1024'],
        },
        {
          slug: 'gui-tiet-kiem',
          title: 'Gửi tiết kiệm đến khi đủ tiền',
          difficulty: 'easy',
          statement: `
            Bạn gửi \`P\` triệu đồng với lãi suất \`r\`%/năm (lãi nhập gốc hằng năm). Hỏi sau ít nhất bao nhiêu năm
            thì số tiền đạt **ít nhất** \`T\` triệu đồng? In số năm và số tiền lúc đó (2 chữ số thập phân).
          `,
          input: 'Ba số: `P` (thực, > 0), `r` (thực, 0 < r ≤ 50), `T` (thực, T > 0). Tất cả ≤ 10<sup>6</sup>.',
          output: 'Số năm và số tiền, cách nhau một khoảng trắng.',
          solution: c`
            #include <stdio.h>
            int main() {
                double P, r, T;
                int y = 0;
                scanf("%lf %lf %lf", &P, &r, &T);
                while (P < T) { P = P * (1 + r / 100); y++; }
                printf("%d %.2f\n", y, P);
                return 0;
            }`,
          tests: ['100 10 150', '100 5 100', '200 7 100', '1 50 1000000', '500.5 6.5 1000', '10 0.5 11'],
        },
      ],
    },
  ],
};
