const c = String.raw;

module.exports = {
  slug: 'con-tro',
  title: 'Con trỏ',
  icon: '👉',
  description: 'Địa chỉ, toán tử & và *, con trỏ và mảng, số học con trỏ, con trỏ hàm.',
  intro: `
    **Kiến thức cần nhớ**

    - \`int *p = &x;\` — \`p\` lưu địa chỉ của \`x\`; \`*p\` truy cập giá trị tại địa chỉ đó.
    - Tên mảng chính là địa chỉ phần tử đầu: \`a == &a[0]\`, và \`*(a + i) == a[i]\`.
    - Số học con trỏ: \`p + 1\` trỏ tới phần tử **kế tiếp** (tăng \`sizeof(*p)\` byte).
    - Con trỏ hàm: \`int (*f)(int, int) = cong;\` rồi gọi \`f(2, 3)\`.
    - Luôn khởi tạo con trỏ; không truy cập con trỏ \`NULL\` hoặc con trỏ "treo".

    Hệ thống chỉ chấm kết quả in ra, nhưng hãy luyện tập dùng con trỏ đúng như yêu cầu của đề — đó mới là mục tiêu của chủ đề này!
  `,
  categories: [
    {
      slug: 'con-tro-co-ban',
      title: 'Con trỏ cơ bản',
      description: 'Truy cập và thay đổi biến qua con trỏ.',
      problems: [
        {
          slug: 'thay-doi-qua-con-tro',
          title: 'Thay đổi biến qua con trỏ',
          difficulty: 'easy',
          statement: `
            Viết hàm \`void bienDoi(int *a, int *b)\` thực hiện: \`a\` mới = tổng hai số, \`b\` mới = hiệu (a cũ − b cũ).
            Sau đó gọi hàm này **hai lần liên tiếp** và in giá trị \`a b\` sau mỗi lần gọi (mỗi lần một dòng).
          `,
          input: 'Hai số nguyên `a b` (|a|, |b| ≤ 10<sup>8</sup>).',
          output: 'Hai dòng.',
          starter: c`
            #include <stdio.h>

            void bienDoi(int *a, int *b) {
                // TODO

            }

            int main() {
                int a, b;
                scanf("%d %d", &a, &b);
                bienDoi(&a, &b);
                printf("%d %d\n", a, b);
                bienDoi(&a, &b);
                printf("%d %d\n", a, b);
                return 0;
            }`,
          solution: c`
            #include <stdio.h>
            void bienDoi(int *a, int *b) { int s = *a + *b, d = *a - *b; *a = s; *b = d; }
            int main() {
                int a, b;
                scanf("%d %d", &a, &b);
                bienDoi(&a, &b); printf("%d %d\n", a, b);
                bienDoi(&a, &b); printf("%d %d\n", a, b);
                return 0;
            }`,
          tests: ['5 3', '0 0', '-4 7', '100000000 -100000000', '1 1'],
        },
        {
          slug: 'min-max-con-tro',
          title: 'Tìm min, max của mảng qua con trỏ',
          difficulty: 'easy',
          statement: 'Viết hàm `void minMax(int *a, int n, int *mn, int *mx)` tìm giá trị nhỏ nhất và lớn nhất của mảng, chỉ dùng **số học con trỏ** để duyệt (`*(a + i)` hoặc tăng con trỏ). In `min max`.',
          input: 'Dòng 1: `n` (1 ≤ n ≤ 10<sup>5</sup>). Dòng 2: `n` số nguyên.',
          output: 'Hai số `min max`.',
          starter: c`
            #include <stdio.h>

            int a[100005];

            void minMax(int *a, int n, int *mn, int *mx) {
                // TODO

            }

            int main() {
                int n, mn, mx;
                scanf("%d", &n);
                for (int *p = a; p < a + n; p++) scanf("%d", p);
                minMax(a, n, &mn, &mx);
                printf("%d %d\n", mn, mx);
                return 0;
            }`,
          solution: c`
            #include <stdio.h>
            int a[100005];
            void minMax(int *a, int n, int *mn, int *mx) {
                *mn = *mx = *a;
                for (int *p = a + 1; p < a + n; p++) { if (*p < *mn) *mn = *p; if (*p > *mx) *mx = *p; }
            }
            int main() {
                int n, mn, mx;
                scanf("%d", &n);
                for (int *p = a; p < a + n; p++) scanf("%d", p);
                minMax(a, n, &mn, &mx);
                printf("%d %d\n", mn, mx);
                return 0;
            }`,
          tests: ['5\n3 1 4 1 5', '1\n-9', '4\n-1 -2 -3 -4', '3\n2147483647 -2147483648 0'],
        },
        {
          slug: 'dao-mang-hai-con-tro',
          title: 'Đảo mảng bằng hai con trỏ',
          difficulty: 'easy',
          statement: 'Viết hàm `void daoMang(int *dau, int *cuoi)` đảo ngược đoạn mảng từ `dau` đến `cuoi` (bao gồm cả hai đầu) bằng cách tráo đổi `*dau` và `*cuoi` rồi dịch hai con trỏ vào giữa. Áp dụng: đảo đoạn từ vị trí `l` đến `r` (tính từ 1) của mảng và in mảng kết quả.',
          input: 'Dòng 1: `n l r` (1 ≤ l ≤ r ≤ n ≤ 10<sup>5</sup>). Dòng 2: `n` số nguyên.',
          output: 'Mảng sau khi đảo đoạn [l, r].',
          solution: c`
            #include <stdio.h>
            int a[100005];
            void daoMang(int *dau, int *cuoi) {
                while (dau < cuoi) { int t = *dau; *dau++ = *cuoi; *cuoi-- = t; }
            }
            int main() {
                int n, l, r;
                scanf("%d %d %d", &n, &l, &r);
                for (int i = 0; i < n; i++) scanf("%d", a + i);
                daoMang(a + l - 1, a + r - 1);
                for (int i = 0; i < n; i++) printf(i ? " %d" : "%d", a[i]);
                printf("\n");
                return 0;
            }`,
          tests: ['6 2 5\n1 2 3 4 5 6', '1 1 1\n7', '5 1 5\n1 2 3 4 5', '4 3 3\n9 8 7 6', '3 1 2\n1 2 3'],
        },
      ],
    },
    {
      slug: 'con-tro-chuoi',
      title: 'Con trỏ và chuỗi',
      description: 'Tự cài đặt các hàm xử lý chuỗi bằng con trỏ.',
      problems: [
        {
          slug: 'tu-viet-strlen-strcpy',
          title: 'Tự viết strlen và strcat',
          difficulty: 'medium',
          statement: `
            Tự cài đặt (không dùng \`<string.h>\`):

            - \`int myStrlen(const char *s)\` — trả về độ dài chuỗi.
            - \`void myStrcat(char *dst, const char *src)\` — nối \`src\` vào cuối \`dst\`.

            Nhập hai từ \`s1\`, \`s2\`. In độ dài \`s1\`, độ dài \`s2\`, sau đó in chuỗi \`s1\` sau khi nối \`s2\` và độ dài của nó.
          `,
          input: 'Hai từ `s1 s2` (không chứa khoảng trắng, mỗi từ ≤ 100 ký tự).',
          output: 'Dòng 1: `len1 len2`. Dòng 2: chuỗi sau khi nối và độ dài.',
          starter: c`
            #include <stdio.h>

            int myStrlen(const char *s) {
                // TODO

            }

            void myStrcat(char *dst, const char *src) {
                // TODO

            }

            int main() {
                char s1[205], s2[105];
                scanf("%100s %100s", s1, s2);
                printf("%d %d\n", myStrlen(s1), myStrlen(s2));
                myStrcat(s1, s2);
                printf("%s %d\n", s1, myStrlen(s1));
                return 0;
            }`,
          solution: c`
            #include <stdio.h>
            int myStrlen(const char *s) { const char *p = s; while (*p) p++; return (int)(p - s); }
            void myStrcat(char *dst, const char *src) { while (*dst) dst++; while ((*dst++ = *src++)); }
            int main() {
                char s1[205], s2[105];
                scanf("%100s %100s", s1, s2);
                printf("%d %d\n", myStrlen(s1), myStrlen(s2));
                myStrcat(s1, s2);
                printf("%s %d\n", s1, myStrlen(s1));
                return 0;
            }`,
          tests: ['Hello World', 'a b', 'lap_trinh C', 'xyz 1234567890', 'C Programming'],
        },
        {
          slug: 'dem-ky-tu-con-tro',
          title: 'Đếm số lần xuất hiện ký tự',
          difficulty: 'easy',
          statement: 'Viết hàm `int demKyTu(const char *s, char c)` dùng con trỏ duyệt chuỗi, đếm số lần ký tự `c` xuất hiện. Nhập ký tự `c` ở dòng 1 và một dòng văn bản ở dòng 2.',
          input: 'Dòng 1: một ký tự `c`. Dòng 2: văn bản (≤ 1000 ký tự).',
          output: 'Số lần xuất hiện.',
          solution: c`
            #include <stdio.h>
            int demKyTu(const char *s, char c) { int n = 0; for (; *s; s++) if (*s == c) n++; return n; }
            int main() {
                char c, s[1105];
                scanf(" %c", &c);
                getchar();
                if (!fgets(s, sizeof(s), stdin)) s[0] = 0;
                printf("%d\n", demKyTu(s, c));
                return 0;
            }`,
          tests: ['a\nbanana', 'z\nbanana', '-\na-b-c-d--', 'C\nC c C c C', 'o\nHello world, good morning'],
        },
      ],
    },
    {
      slug: 'con-tro-ham',
      title: 'Con trỏ hàm',
      description: 'Truyền hàm làm tham số.',
      problems: [
        {
          slug: 'bang-ham-con-tro',
          title: 'Máy tính dùng con trỏ hàm',
          difficulty: 'medium',
          statement: `
            Viết 4 hàm \`cong\`, \`tru\`, \`nhan\`, \`chiaNguyen\` cùng kiểu \`long long f(long long, long long)\`.
            Lưu chúng vào mảng con trỏ hàm \`long long (*ops[4])(long long, long long)\`.

            Nhập \`q\` truy vấn, mỗi truy vấn gồm mã phép toán \`k\` (0: cộng, 1: trừ, 2: nhân, 3: chia nguyên) và hai số \`a b\`.
            In kết quả \`ops[k](a, b)\` cho mỗi truy vấn. Với phép chia mà \`b = 0\`, in \`ERROR\`.
          `,
          input: 'Dòng 1: `q` (1 ≤ q ≤ 1000). `q` dòng tiếp theo: `k a b` (|a|, |b| ≤ 10<sup>9</sup>).',
          output: 'Mỗi truy vấn một dòng.',
          solution: c`
            #include <stdio.h>
            long long cong(long long a, long long b) { return a + b; }
            long long tru(long long a, long long b) { return a - b; }
            long long nhan(long long a, long long b) { return a * b; }
            long long chiaNguyen(long long a, long long b) { return a / b; }
            int main() {
                long long (*ops[4])(long long, long long) = {cong, tru, nhan, chiaNguyen};
                int q;
                scanf("%d", &q);
                while (q--) {
                    int k; long long a, b;
                    scanf("%d %lld %lld", &k, &a, &b);
                    if (k == 3 && b == 0) printf("ERROR\n");
                    else printf("%lld\n", ops[k](a, b));
                }
                return 0;
            }`,
          tests: ['4\n0 3 5\n1 3 5\n2 3 5\n3 17 5', '1\n3 1 0', '3\n2 1000000000 1000000000\n3 -7 2\n1 0 0', '2\n0 -1000000000 -1000000000\n3 9 3'],
        },
        {
          slug: 'sap-xep-tuy-chon',
          title: 'Sắp xếp với hàm so sánh tùy chọn',
          difficulty: 'hard',
          statement: `
            Viết hàm sắp xếp tổng quát \`void sapXep(int *a, int n, int (*truoc)(int, int))\` — sắp xếp sao cho với mọi cặp
            liền kề, \`truoc(a[i], a[i+1])\` không sai (hàm \`truoc(x, y)\` trả về 1 nếu x phải đứng trước y).

            Nhập mảng và một chế độ \`m\`:

            - \`m = 1\`: tăng dần.
            - \`m = 2\`: giảm dần.
            - \`m = 3\`: tăng dần theo **giá trị tuyệt đối**; nếu bằng nhau thì số âm đứng trước.
            - \`m = 4\`: tăng dần theo **tổng chữ số** (của giá trị tuyệt đối); nếu bằng nhau thì số nhỏ hơn đứng trước.
          `,
          input: 'Dòng 1: `n m` (1 ≤ n ≤ 1000, 1 ≤ m ≤ 4). Dòng 2: `n` số nguyên (|a<sub>i</sub>| ≤ 10<sup>6</sup>).',
          output: 'Mảng sau khi sắp xếp.',
          solution: c`
            #include <stdio.h>
            #include <stdlib.h>
            int tang(int x, int y) { return x < y; }
            int giam(int x, int y) { return x > y; }
            int tuyetDoi(int x, int y) { return abs(x) != abs(y) ? abs(x) < abs(y) : x < y; }
            int tcs(int x) { x = abs(x); int s = 0; while (x) { s += x % 10; x /= 10; } return s; }
            int chuSo(int x, int y) { return tcs(x) != tcs(y) ? tcs(x) < tcs(y) : x < y; }
            void sapXep(int *a, int n, int (*truoc)(int, int)) {
                for (int i = 1; i < n; i++) {
                    int v = a[i], j = i - 1;
                    while (j >= 0 && truoc(v, a[j])) { a[j + 1] = a[j]; j--; }
                    a[j + 1] = v;
                }
            }
            int main() {
                int n, m, a[1005];
                int (*f[5])(int, int) = {0, tang, giam, tuyetDoi, chuSo};
                scanf("%d %d", &n, &m);
                for (int i = 0; i < n; i++) scanf("%d", &a[i]);
                sapXep(a, n, f[m]);
                for (int i = 0; i < n; i++) printf(i ? " %d" : "%d", a[i]);
                printf("\n");
                return 0;
            }`,
          tests: ['5 1\n3 -1 2 -5 4', '5 2\n3 -1 2 -5 4', '6 3\n3 -3 1 -2 2 0', '6 4\n19 28 10 1 100 -37', '1 4\n5', '4 3\n-1 1 -1 1'],
          samples: 4,
        },
      ],
    },
  ],
};
