const c = String.raw;

module.exports = {
  slug: 'de-quy',
  title: 'Đệ quy',
  icon: '🌀',
  description: 'Hàm gọi lại chính nó: điều kiện dừng, công thức truy hồi, quay lui.',
  intro: `
    **Kiến thức cần nhớ**

    - Một hàm đệ quy luôn có **điều kiện dừng** (trường hợp cơ sở) và **lời gọi đệ quy** với bài toán nhỏ hơn.
    - Ví dụ: \`long long gt(int n) { if (n <= 1) return 1; return n * gt(n - 1); }\`
    - Đệ quy quá sâu có thể gây tràn stack (Segmentation fault).
    - Một số bài (Fibonacci) nếu đệ quy "ngây thơ" sẽ rất chậm — hãy nghĩ tới việc lưu lại kết quả đã tính (memoization).
    - **Quay lui** (backtracking): thử từng lựa chọn, đệ quy, rồi hoàn tác lựa chọn.
  `,
  categories: [
    {
      slug: 'de-quy-co-ban',
      title: 'Đệ quy cơ bản',
      description: 'Chuyển công thức truy hồi thành hàm đệ quy.',
      problems: [
        {
          slug: 'tong-chu-so-de-quy',
          title: 'Tổng chữ số (đệ quy)',
          difficulty: 'easy',
          statement: 'Viết hàm đệ quy `int tongChuSo(long long n)` tính tổng các chữ số của số nguyên không âm `n`.',
          input: 'Một số nguyên `n` (0 ≤ n ≤ 10<sup>18</sup>).',
          output: 'Tổng các chữ số.',
          starter: c`
            #include <stdio.h>

            int tongChuSo(long long n) {
                // TODO: điều kiện dừng + lời gọi đệ quy

            }

            int main() {
                long long n;
                scanf("%lld", &n);
                printf("%d\n", tongChuSo(n));
                return 0;
            }`,
          solution: c`
            #include <stdio.h>
            int tongChuSo(long long n) { return n < 10 ? (int)n : (int)(n % 10) + tongChuSo(n / 10); }
            int main() {
                long long n;
                scanf("%lld", &n);
                printf("%d\n", tongChuSo(n));
                return 0;
            }`,
          tests: ['123', '0', '9', '999999999999999999', '1000000000000000000', '40506'],
        },
        {
          slug: 'luy-thua-nhanh',
          title: 'Lũy thừa nhanh theo modulo',
          difficulty: 'medium',
          statement: `
            Tính a<sup>n</sup> mod m với \`n\` rất lớn. Dùng đệ quy chia để trị:

            - a<sup>0</sup> = 1
            - a<sup>n</sup> = (a<sup>n/2</sup>)² nếu n chẵn
            - a<sup>n</sup> = (a<sup>n/2</sup>)² · a nếu n lẻ

            (mọi phép tính lấy dư cho m)
          `,
          input: 'Ba số nguyên `a n m` (0 ≤ a ≤ 10<sup>9</sup>, 0 ≤ n ≤ 10<sup>18</sup>, 1 ≤ m ≤ 10<sup>9</sup>).',
          output: 'Giá trị a<sup>n</sup> mod m.',
          hint: 'Vòng lặp nhân `n` lần sẽ quá thời gian. Với đệ quy chia đôi, chỉ cần khoảng log₂(n) ≈ 60 bước. Nhớ dùng `long long` khi nhân.',
          solution: c`
            #include <stdio.h>
            long long pw(long long a, long long n, long long m) {
                if (n == 0) return 1 % m;
                long long h = pw(a, n / 2, m);
                h = h * h % m;
                if (n % 2) h = h * (a % m) % m;
                return h;
            }
            int main() {
                long long a, n, m;
                scanf("%lld %lld %lld", &a, &n, &m);
                printf("%lld\n", pw(a, n, m));
                return 0;
            }`,
          tests: ['2 10 1000', '3 0 7', '2 1000000000000000000 1000000007', '0 5 13', '123456789 987654321 1000000000', '5 3 1', '10 18 999999999'],
        },
        {
          slug: 'fibonacci-de-quy',
          title: 'Số Fibonacci thứ n',
          difficulty: 'medium',
          statement: `
            F(0) = 0, F(1) = 1, F(n) = F(n−1) + F(n−2). Nhập \`n\`, in ra F(n).

            Với n lên tới 90, cách đệ quy trực tiếp sẽ cần hàng tỷ tỷ lần gọi hàm. Hãy dùng **đệ quy có nhớ** (lưu các giá trị
            đã tính vào mảng) để chương trình chạy nhanh.
          `,
          input: 'Một số nguyên `n` (0 ≤ n ≤ 90).',
          output: 'Giá trị F(n).',
          solution: c`
            #include <stdio.h>
            long long memo[91];
            long long F(int n) {
                if (n < 2) return n;
                if (memo[n]) return memo[n];
                return memo[n] = F(n - 1) + F(n - 2);
            }
            int main() {
                int n;
                scanf("%d", &n);
                printf("%lld\n", F(n));
                return 0;
            }`,
          tests: ['10', '0', '1', '2', '50', '90'],
        },
        {
          slug: 'nhi-phan-de-quy',
          title: 'In số nhị phân bằng đệ quy',
          difficulty: 'easy',
          statement: 'Viết hàm đệ quy `void inNhiPhan(long long n)` in biểu diễn nhị phân của số nguyên không âm `n` (không có số 0 thừa ở đầu, riêng n = 0 in `0`).',
          input: 'Một số nguyên `n` (0 ≤ n ≤ 10<sup>18</sup>).',
          output: 'Biểu diễn nhị phân.',
          hint: 'In nhị phân của `n / 2` trước, sau đó in `n % 2`.',
          solution: c`
            #include <stdio.h>
            void inNhiPhan(long long n) {
                if (n >= 2) inNhiPhan(n / 2);
                printf("%lld", n % 2);
            }
            int main() {
                long long n;
                scanf("%lld", &n);
                inNhiPhan(n);
                printf("\n");
                return 0;
            }`,
          tests: ['10', '0', '1', '255', '1024', '1000000000000000000'],
        },
        {
          slug: 'uscln-de-quy',
          title: 'USCLN của dãy số (đệ quy)',
          difficulty: 'easy',
          statement: 'Viết hàm đệ quy `long long gcd(long long a, long long b)` theo Euclid: gcd(a, 0) = a, gcd(a, b) = gcd(b, a mod b). Dùng nó tính USCLN của `n` số nguyên dương.',
          input: 'Dòng 1: `n` (1 ≤ n ≤ 1000). Dòng 2: `n` số nguyên dương ≤ 10<sup>18</sup>.',
          output: 'USCLN của `n` số.',
          solution: c`
            #include <stdio.h>
            long long gcd(long long a, long long b) { return b == 0 ? a : gcd(b, a % b); }
            int main() {
                int n; long long g = 0, x;
                scanf("%d", &n);
                for (int i = 0; i < n; i++) { scanf("%lld", &x); g = gcd(g, x); }
                printf("%lld\n", g);
                return 0;
            }`,
          tests: ['3\n12 18 24', '1\n7', '4\n5 7 11 13', '2\n1000000000000000000 999999999999999999', '5\n100 200 300 400 500', '3\n36 60 84'],
        },
      ],
    },
    {
      slug: 'chia-de-tri',
      title: 'Bài toán đệ quy kinh điển',
      description: 'Tháp Hà Nội, tổ hợp Pascal...',
      problems: [
        {
          slug: 'thap-ha-noi',
          title: 'Tháp Hà Nội',
          difficulty: 'medium',
          statement: `
            Có 3 cọc A, B, C và \`n\` đĩa kích thước khác nhau đặt ở cọc A (đĩa lớn ở dưới). Cần chuyển toàn bộ đĩa sang cọc C,
            mỗi lần chỉ chuyển một đĩa và không được đặt đĩa lớn lên đĩa nhỏ.

            In ra từng bước chuyển theo dạng \`Chuyen dia <k> tu <X> sang <Y>\` (k là số hiệu đĩa, đĩa nhỏ nhất là 1),
            sau đó in dòng \`Tong so buoc: <S>\`.

            Thuật toán chuẩn: chuyển n−1 đĩa từ A sang B (qua C), chuyển đĩa n từ A sang C, rồi chuyển n−1 đĩa từ B sang C (qua A).
          `,
          input: 'Một số nguyên `n` (1 ≤ n ≤ 12).',
          output: 'Các bước chuyển và tổng số bước.',
          solution: c`
            #include <stdio.h>
            int cnt = 0;
            void hanoi(int n, char a, char b, char c) {
                if (n == 0) return;
                hanoi(n - 1, a, c, b);
                printf("Chuyen dia %d tu %c sang %c\n", n, a, c);
                cnt++;
                hanoi(n - 1, b, a, c);
            }
            int main() {
                int n;
                scanf("%d", &n);
                hanoi(n, 'A', 'B', 'C');
                printf("Tong so buoc: %d\n", cnt);
                return 0;
            }`,
          tests: ['2', '1', '3', '5', '12'],
        },
        {
          slug: 'tam-giac-pascal',
          title: 'Tam giác Pascal',
          difficulty: 'medium',
          statement: `
            Giá trị tại hàng \`i\`, cột \`j\` của tam giác Pascal (bắt đầu từ 0) là C(i, j), với:
            C(i, 0) = C(i, i) = 1 và C(i, j) = C(i−1, j−1) + C(i−1, j).

            Nhập \`n\`, in \`n\` hàng đầu tiên của tam giác Pascal, các số trên mỗi hàng cách nhau một khoảng trắng.
          `,
          input: 'Một số nguyên `n` (1 ≤ n ≤ 30).',
          output: '`n` hàng của tam giác Pascal.',
          hint: 'Đệ quy thuần cho n = 30 vẫn chạy được nhưng chậm; hãy kết hợp mảng nhớ `long long memo[31][31]`.',
          solution: c`
            #include <stdio.h>
            long long memo[31][31];
            long long C(int i, int j) {
                if (j == 0 || j == i) return 1;
                if (memo[i][j]) return memo[i][j];
                return memo[i][j] = C(i - 1, j - 1) + C(i - 1, j);
            }
            int main() {
                int n;
                scanf("%d", &n);
                for (int i = 0; i < n; i++) {
                    for (int j = 0; j <= i; j++) printf(j ? " %lld" : "%lld", C(i, j));
                    printf("\n");
                }
                return 0;
            }`,
          tests: ['5', '1', '2', '10', '30'],
        },
        {
          slug: 'dem-cach-leo-cau-thang',
          title: 'Leo cầu thang',
          difficulty: 'medium',
          statement: `
            Một cầu thang có \`n\` bậc. Mỗi bước bạn có thể leo **1, 2 hoặc 3** bậc. Hỏi có bao nhiêu cách khác nhau để leo
            lên đến bậc thứ \`n\`?

            Ví dụ n = 3 có 4 cách: 1+1+1, 1+2, 2+1, 3.
          `,
          input: 'Một số nguyên `n` (1 ≤ n ≤ 70).',
          output: 'Số cách leo.',
          hint: 'Gọi f(n) là số cách: f(n) = f(n−1) + f(n−2) + f(n−3), f(0) = 1. Dùng mảng nhớ để tránh tính lặp.',
          solution: c`
            #include <stdio.h>
            long long memo[71];
            long long f(int n) {
                if (n < 0) return 0;
                if (n == 0) return 1;
                if (memo[n]) return memo[n];
                return memo[n] = f(n - 1) + f(n - 2) + f(n - 3);
            }
            int main() {
                int n;
                scanf("%d", &n);
                printf("%lld\n", f(n));
                return 0;
            }`,
          tests: ['3', '1', '2', '4', '10', '70'],
        },
      ],
    },
    {
      slug: 'quay-lui',
      title: 'Quay lui (Backtracking)',
      description: 'Liệt kê cấu hình bằng đệ quy.',
      problems: [
        {
          slug: 'sinh-nhi-phan',
          title: 'Sinh các xâu nhị phân',
          difficulty: 'medium',
          statement: 'Nhập `n`, liệt kê tất cả các xâu nhị phân độ dài `n` theo thứ tự từ điển, mỗi xâu trên một dòng.',
          input: 'Một số nguyên `n` (1 ≤ n ≤ 12).',
          output: '2<sup>n</sup> dòng, mỗi dòng một xâu nhị phân.',
          hint: 'Hàm `Try(i)`: lần lượt gán `x[i] = 0` rồi `1`; nếu `i == n` thì in cấu hình, ngược lại gọi `Try(i + 1)`.',
          solution: c`
            #include <stdio.h>
            int n; char x[20];
            void Try(int i) {
                if (i == n) { x[n] = 0; puts(x); return; }
                for (char v = '0'; v <= '1'; v++) { x[i] = v; Try(i + 1); }
            }
            int main() {
                scanf("%d", &n);
                Try(0);
                return 0;
            }`,
          tests: ['2', '1', '3', '5', '12'],
        },
        {
          slug: 'sinh-hoan-vi',
          title: 'Sinh hoán vị',
          difficulty: 'medium',
          statement: 'Nhập `n`, liệt kê tất cả hoán vị của các số 1, 2, ..., n theo thứ tự từ điển. Mỗi hoán vị trên một dòng, các số cách nhau một khoảng trắng.',
          input: 'Một số nguyên `n` (1 ≤ n ≤ 8).',
          output: 'n! dòng, mỗi dòng một hoán vị.',
          hint: 'Dùng mảng `daDung[]` để đánh dấu số đã chọn; nhớ bỏ đánh dấu sau khi quay lui.',
          solution: c`
            #include <stdio.h>
            int n, x[10], used[10];
            void Try(int i) {
                if (i == n) {
                    for (int k = 0; k < n; k++) printf(k ? " %d" : "%d", x[k]);
                    printf("\n");
                    return;
                }
                for (int v = 1; v <= n; v++) if (!used[v]) {
                    used[v] = 1; x[i] = v; Try(i + 1); used[v] = 0;
                }
            }
            int main() {
                scanf("%d", &n);
                Try(0);
                return 0;
            }`,
          tests: ['3', '1', '2', '4', '8'],
        },
        {
          slug: 'to-hop-chap-k',
          title: 'Liệt kê tổ hợp',
          difficulty: 'medium',
          statement: 'Nhập `n` và `k`, liệt kê tất cả các tập con `k` phần tử của {1, 2, ..., n}. Mỗi tập in các phần tử tăng dần trên một dòng; các tập được in theo thứ tự từ điển.',
          input: 'Hai số nguyên `n k` (1 ≤ k ≤ n ≤ 15).',
          output: 'C(n, k) dòng.',
          solution: c`
            #include <stdio.h>
            int n, k, x[20];
            void Try(int i, int start) {
                if (i == k) {
                    for (int j = 0; j < k; j++) printf(j ? " %d" : "%d", x[j]);
                    printf("\n");
                    return;
                }
                for (int v = start; v <= n - (k - i) + 1; v++) { x[i] = v; Try(i + 1, v + 1); }
            }
            int main() {
                scanf("%d %d", &n, &k);
                Try(0, 1);
                return 0;
            }`,
          tests: ['4 2', '3 3', '5 1', '6 3', '15 7'],
        },
        {
          slug: 'tong-tap-con',
          title: 'Tập con có tổng bằng S',
          difficulty: 'hard',
          statement: `
            Cho dãy \`n\` số nguyên dương và số \`S\`. Đếm số **tập con** (chọn hoặc không chọn mỗi phần tử, các phần tử ở vị trí
            khác nhau được coi là khác nhau) có tổng đúng bằng \`S\`. Tập rỗng có tổng bằng 0.
          `,
          input: 'Dòng 1: `n S` (1 ≤ n ≤ 20, 0 ≤ S ≤ 10<sup>9</sup>). Dòng 2: `n` số nguyên dương ≤ 10<sup>7</sup>.',
          output: 'Số tập con có tổng bằng `S`.',
          solution: c`
            #include <stdio.h>
            int n; long long S, a[25]; long long cnt = 0;
            void Try(int i, long long sum) {
                if (sum > S) return;
                if (i == n) { if (sum == S) cnt++; return; }
                Try(i + 1, sum);
                Try(i + 1, sum + a[i]);
            }
            int main() {
                scanf("%d %lld", &n, &S);
                for (int i = 0; i < n; i++) scanf("%lld", &a[i]);
                Try(0, 0);
                printf("%lld\n", cnt);
                return 0;
            }`,
          tests: ['4 5\n1 2 3 4', '3 0\n1 2 3', '3 100\n1 2 3', '20 10\n1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1', '5 7\n2 3 5 7 4', '20 50\n1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20'],
        },
      ],
    },
  ],
};
