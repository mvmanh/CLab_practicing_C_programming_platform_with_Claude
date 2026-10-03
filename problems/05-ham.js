const c = String.raw;

module.exports = {
  slug: 'ham',
  title: 'Hàm',
  icon: '🧩',
  description: 'Khai báo, định nghĩa và gọi hàm; tham số, giá trị trả về; truyền tham chiếu bằng con trỏ.',
  intro: `
    **Kiến thức cần nhớ**

    - Cú pháp: \`kieu_tra_ve ten_ham(danh_sach_tham_so) { ... return gia_tri; }\`
    - Hàm phải được khai báo (prototype) hoặc định nghĩa **trước** khi gọi.
    - Tham số trong C được truyền **theo giá trị** (bản sao). Muốn hàm sửa được biến bên ngoài, truyền **địa chỉ**: \`void f(int *x)\` và gọi \`f(&a)\`.
    - Chia nhỏ bài toán thành các hàm giúp mã dễ đọc, dễ kiểm thử và tái sử dụng.

    Trong các bài tập dưới đây, mã khởi đầu đã có sẵn khung hàm — bạn hãy hoàn thiện phần thân hàm.
  `,
  categories: [
    {
      slug: 'ham-co-ban',
      title: 'Viết hàm cơ bản',
      description: 'Hàm nhận tham số và trả về giá trị.',
      problems: [
        {
          slug: 'ham-max-bon-so',
          title: 'Hàm max của bốn số',
          difficulty: 'easy',
          statement: 'Viết hàm `int max2(int a, int b)` trả về số lớn hơn trong hai số. Sử dụng hàm đó để tìm số lớn nhất trong 4 số nguyên nhập vào.',
          input: 'Bốn số nguyên (|x| ≤ 10<sup>9</sup>).',
          output: 'Số lớn nhất.',
          starter: c`
            #include <stdio.h>

            int max2(int a, int b) {
                // TODO: trả về số lớn hơn

            }

            int main() {
                int a, b, c, d;
                scanf("%d %d %d %d", &a, &b, &c, &d);
                printf("%d\n", max2(max2(a, b), max2(c, d)));
                return 0;
            }`,
          solution: c`
            #include <stdio.h>
            int max2(int a, int b) { return a > b ? a : b; }
            int main() {
                int a, b, c, d;
                scanf("%d %d %d %d", &a, &b, &c, &d);
                printf("%d\n", max2(max2(a, b), max2(c, d)));
                return 0;
            }`,
          tests: ['1 2 3 4', '4 3 2 1', '-1 -2 -3 -4', '5 5 5 5', '0 1000000000 -1000000000 7'],
        },
        {
          slug: 'ham-luy-thua',
          title: 'Hàm lũy thừa',
          difficulty: 'easy',
          statement: `
            Viết hàm \`double luyThua(double x, int n)\` tính x<sup>n</sup> **không dùng** \`pow\`. Lưu ý \`n\` có thể âm
            (x<sup>−n</sup> = 1 / x<sup>n</sup>) và x<sup>0</sup> = 1.

            In kết quả với 4 chữ số thập phân.
          `,
          input: 'Số thực `x` (0 < |x| ≤ 10) và số nguyên `n` (|n| ≤ 30).',
          output: 'Giá trị x<sup>n</sup> với 4 chữ số thập phân.',
          starter: c`
            #include <stdio.h>

            double luyThua(double x, int n) {
                // TODO

            }

            int main() {
                double x;
                int n;
                scanf("%lf %d", &x, &n);
                printf("%.4f\n", luyThua(x, n));
                return 0;
            }`,
          solution: c`
            #include <stdio.h>
            double luyThua(double x, int n) {
                double r = 1;
                int m = n < 0 ? -n : n;
                for (int i = 0; i < m; i++) r *= x;
                return n < 0 ? 1 / r : r;
            }
            int main() {
                double x; int n;
                scanf("%lf %d", &x, &n);
                printf("%.4f\n", luyThua(x, n));
                return 0;
            }`,
          tests: ['2 10', '2 -2', '5 0', '-3 3', '1.5 4', '10 -5', '-2 30'],
        },
        {
          slug: 'ham-nguyen-to-doan',
          title: 'Số nguyên tố trong đoạn',
          difficulty: 'easy',
          statement: 'Viết hàm `int laNguyenTo(int n)` trả về 1 nếu `n` là số nguyên tố, ngược lại trả về 0. Dùng hàm này in ra các số nguyên tố trong đoạn [a, b] trên một dòng, dòng thứ hai in số lượng. Nếu không có số nào, dòng 1 in `-1`.',
          input: 'Hai số nguyên `a b` (1 ≤ a ≤ b ≤ 10<sup>5</sup>).',
          output: 'Hai dòng như mô tả.',
          starter: c`
            #include <stdio.h>

            int laNguyenTo(int n) {
                // TODO

            }

            int main() {
                int a, b;
                scanf("%d %d", &a, &b);
                // TODO: in các số nguyên tố trong [a, b] và số lượng

                return 0;
            }`,
          solution: c`
            #include <stdio.h>
            int laNguyenTo(int n) {
                if (n < 2) return 0;
                for (int i = 2; i * i <= n; i++) if (n % i == 0) return 0;
                return 1;
            }
            int main() {
                int a, b, cnt = 0;
                scanf("%d %d", &a, &b);
                for (int i = a; i <= b; i++) if (laNguyenTo(i)) { printf(cnt ? " %d" : "%d", i); cnt++; }
                if (!cnt) printf("-1");
                printf("\n%d\n", cnt);
                return 0;
            }`,
          tests: ['1 20', '14 16', '2 2', '90 100', '1 1', '99900 100000'],
        },
        {
          slug: 'rut-gon-phan-so',
          title: 'Rút gọn phân số',
          difficulty: 'medium',
          statement: `
            Viết hàm \`int uscln(int a, int b)\` và dùng nó để rút gọn phân số \`a/b\`.

            Yêu cầu:
            - Mẫu số sau khi rút gọn luôn **dương** (dấu âm, nếu có, đặt ở tử số).
            - Nếu mẫu số sau rút gọn bằng 1, chỉ in tử số.
            - Nếu \`b = 0\`, in \`Mau so khong hop le\`.
          `,
          input: 'Hai số nguyên `a b` (|a|, |b| ≤ 10<sup>9</sup>).',
          output: 'Phân số tối giản dạng `p/q`, hoặc một số nguyên, hoặc thông báo lỗi.',
          starter: c`
            #include <stdio.h>

            int uscln(int a, int b) {
                // TODO: thuật toán Euclid

            }

            int main() {
                int a, b;
                scanf("%d %d", &a, &b);
                // TODO

                return 0;
            }`,
          solution: c`
            #include <stdio.h>
            #include <stdlib.h>
            long long uscln(long long a, long long b) {
                a = llabs(a); b = llabs(b);
                while (b) { long long r = a % b; a = b; b = r; }
                return a;
            }
            int main() {
                long long a, b;
                scanf("%lld %lld", &a, &b);
                if (b == 0) { printf("Mau so khong hop le\n"); return 0; }
                if (a == 0) { printf("0\n"); return 0; }
                long long g = uscln(a, b);
                a /= g; b /= g;
                if (b < 0) { a = -a; b = -b; }
                if (b == 1) printf("%lld\n", a); else printf("%lld/%lld\n", a, b);
                return 0;
            }`,
          tests: ['6 8', '10 5', '3 -9', '-4 -6', '0 7', '5 0', '1000000000 999999999', '-12 4'],
        },
      ],
    },
    {
      slug: 'tham-so-con-tro',
      title: 'Truyền tham chiếu bằng con trỏ',
      description: 'Hàm thay đổi giá trị biến bên ngoài, trả về nhiều kết quả.',
      problems: [
        {
          slug: 'sap-xep-ba-so-swap',
          title: 'Sắp xếp ba số bằng hàm swap',
          difficulty: 'easy',
          statement: 'Viết hàm `void swap(int *a, int *b)` hoán đổi giá trị hai biến. Dùng hàm này để sắp xếp ba số nguyên theo thứ tự tăng dần.',
          input: 'Ba số nguyên `a b c` (|x| ≤ 10<sup>9</sup>).',
          output: 'Ba số sau khi sắp xếp tăng dần, cách nhau một khoảng trắng.',
          starter: c`
            #include <stdio.h>

            void swap(int *a, int *b) {
                // TODO

            }

            int main() {
                int a, b, c;
                scanf("%d %d %d", &a, &b, &c);
                if (a > b) swap(&a, &b);
                if (a > c) swap(&a, &c);
                if (b > c) swap(&b, &c);
                printf("%d %d %d\n", a, b, c);
                return 0;
            }`,
          solution: c`
            #include <stdio.h>
            void swap(int *a, int *b) { int t = *a; *a = *b; *b = t; }
            int main() {
                int a, b, c;
                scanf("%d %d %d", &a, &b, &c);
                if (a > b) swap(&a, &b);
                if (a > c) swap(&a, &c);
                if (b > c) swap(&b, &c);
                printf("%d %d %d\n", a, b, c);
                return 0;
            }`,
          tests: ['3 1 2', '1 2 3', '3 2 1', '5 5 1', '-1 -1000000000 1000000000'],
        },
        {
          slug: 'thong-ke-chu-so-con-tro',
          title: 'Hàm trả về nhiều giá trị',
          difficulty: 'medium',
          statement: `
            Viết hàm \`void thongKe(long long n, int *soChuSo, int *tong, int *lonNhat)\` tính số chữ số, tổng các chữ số
            và chữ số lớn nhất của số nguyên không âm \`n\`, trả kết quả qua các con trỏ.

            In ba giá trị trên cùng một dòng.
          `,
          input: 'Một số nguyên `n` (0 ≤ n ≤ 10<sup>18</sup>).',
          output: 'Số chữ số, tổng chữ số, chữ số lớn nhất.',
          starter: c`
            #include <stdio.h>

            void thongKe(long long n, int *soChuSo, int *tong, int *lonNhat) {
                // TODO

            }

            int main() {
                long long n;
                int dem, tong, ln;
                scanf("%lld", &n);
                thongKe(n, &dem, &tong, &ln);
                printf("%d %d %d\n", dem, tong, ln);
                return 0;
            }`,
          solution: c`
            #include <stdio.h>
            void thongKe(long long n, int *soChuSo, int *tong, int *lonNhat) {
                *soChuSo = 0; *tong = 0; *lonNhat = 0;
                do {
                    int d = n % 10;
                    (*soChuSo)++; *tong += d;
                    if (d > *lonNhat) *lonNhat = d;
                    n /= 10;
                } while (n > 0);
            }
            int main() {
                long long n; int dem, tong, ln;
                scanf("%lld", &n);
                thongKe(n, &dem, &tong, &ln);
                printf("%d %d %d\n", dem, tong, ln);
                return 0;
            }`,
          tests: ['12345', '0', '9', '1000000000000000000', '50721', '888'],
        },
        {
          slug: 'giai-he-hai-an',
          title: 'Giải hệ phương trình hai ẩn',
          difficulty: 'medium',
          statement: `
            Giải hệ phương trình:

            \`\`\`
            a1·x + b1·y = c1
            a2·x + b2·y = c2
            \`\`\`

            Viết hàm \`int giaiHe(double a1, double b1, double c1, double a2, double b2, double c2, double *x, double *y)\`
            trả về 1 nếu hệ có nghiệm duy nhất (và gán nghiệm vào \`*x\`, \`*y\`), trả về 0 nếu vô nghiệm, 2 nếu vô số nghiệm.

            Phương pháp Cramer: D = a1·b2 − a2·b1, Dx = c1·b2 − c2·b1, Dy = a1·c2 − a2·c1.

            - D ≠ 0: nghiệm duy nhất x = Dx/D, y = Dy/D → in \`x y\` với 2 chữ số thập phân.
            - D = 0 và (Dx ≠ 0 hoặc Dy ≠ 0): in \`VO NGHIEM\`.
            - D = Dx = Dy = 0: in \`VO SO NGHIEM\`.
          `,
          input: 'Hai dòng, mỗi dòng 3 số nguyên `a b c` (|giá trị| ≤ 1000).',
          output: 'Kết quả như mô tả.',
          solution: c`
            #include <stdio.h>
            #include <math.h>
            int giaiHe(double a1, double b1, double c1, double a2, double b2, double c2, double *x, double *y) {
                double D = a1 * b2 - a2 * b1, Dx = c1 * b2 - c2 * b1, Dy = a1 * c2 - a2 * c1;
                if (D != 0) { *x = Dx / D; *y = Dy / D; return 1; }
                return (Dx != 0 || Dy != 0) ? 0 : 2;
            }
            double fix(double v) { return fabs(v) < 0.005 ? 0.0 : v; }
            int main() {
                double a1, b1, c1, a2, b2, c2, x, y;
                scanf("%lf %lf %lf %lf %lf %lf", &a1, &b1, &c1, &a2, &b2, &c2);
                int r = giaiHe(a1, b1, c1, a2, b2, c2, &x, &y);
                if (r == 1) printf("%.2f %.2f\n", fix(x), fix(y));
                else printf(r == 0 ? "VO NGHIEM\n" : "VO SO NGHIEM\n");
                return 0;
            }`,
          tests: ['1 1 3\n1 -1 1', '1 2 3\n2 4 6', '1 2 3\n2 4 7', '2 3 13\n5 -1 7', '0 1 4\n1 0 -2', '3 0 0\n0 7 0'],
        },
      ],
    },
    {
      slug: 'ung-dung-ham',
      title: 'Phân rã bài toán bằng hàm',
      description: 'Kết hợp nhiều hàm nhỏ để giải bài toán lớn.',
      problems: [
        {
          slug: 'to-hop',
          title: 'Tổ hợp chập k của n',
          difficulty: 'medium',
          statement: `
            Viết hàm \`long long toHop(int n, int k)\` tính C(n, k) = n! / (k! (n − k)!).

            Với \`n\` tới 60, tính giai thừa trực tiếp sẽ bị tràn số. Gợi ý: C(n, k) = C(n, k−1) × (n − k + 1) / k.
          `,
          input: 'Hai số nguyên `n k` (0 ≤ k ≤ n ≤ 60).',
          output: 'Giá trị C(n, k).',
          solution: c`
            #include <stdio.h>
            long long toHop(int n, int k) {
                if (k > n - k) k = n - k;
                long long r = 1;
                for (int i = 1; i <= k; i++) r = r * (n - k + i) / i;
                return r;
            }
            int main() {
                int n, k;
                scanf("%d %d", &n, &k);
                printf("%lld\n", toHop(n, k));
                return 0;
            }`,
          tests: ['5 2', '10 0', '10 10', '20 10', '60 30', '52 5', '1 1'],
        },
        {
          slug: 'ngay-tiep-theo',
          title: 'Ngày tiếp theo',
          difficulty: 'medium',
          statement: `
            Nhập một ngày hợp lệ \`d/m/y\`. In ra ngày tiếp theo theo định dạng \`dd/mm/yyyy\` (ngày và tháng có 2 chữ số,
            năm có 4 chữ số).

            Gợi ý: viết các hàm \`int laNamNhuan(int y)\` và \`int soNgayTrongThang(int m, int y)\`.
          `,
          input: 'Ba số nguyên `d m y` cách nhau bởi khoảng trắng (1 ≤ y ≤ 9998).',
          output: 'Ngày tiếp theo dạng `dd/mm/yyyy`.',
          solution: c`
            #include <stdio.h>
            int laNamNhuan(int y) { return (y % 400 == 0) || (y % 4 == 0 && y % 100 != 0); }
            int soNgayTrongThang(int m, int y) {
                int t[] = {31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};
                return (m == 2 && laNamNhuan(y)) ? 29 : t[m - 1];
            }
            int main() {
                int d, m, y;
                scanf("%d %d %d", &d, &m, &y);
                d++;
                if (d > soNgayTrongThang(m, y)) { d = 1; m++; if (m > 12) { m = 1; y++; } }
                printf("%02d/%02d/%04d\n", d, m, y);
                return 0;
            }`,
          tests: ['15 3 2024', '28 2 2024', '28 2 2023', '29 2 2000', '31 12 1999', '30 4 2025', '31 1 1'],
        },
        {
          slug: 'doi-co-so',
          title: 'Đổi cơ số',
          difficulty: 'medium',
          statement: `
            Viết hàm \`void doiCoSo(long long n, int b)\` in biểu diễn của số nguyên không âm \`n\` trong hệ cơ số \`b\`
            (2 ≤ b ≤ 16). Các chữ số lớn hơn 9 dùng chữ in hoa \`A\`–\`F\`.
          `,
          input: 'Hai số nguyên `n b` (0 ≤ n ≤ 10<sup>18</sup>, 2 ≤ b ≤ 16).',
          output: 'Biểu diễn của `n` trong cơ số `b`.',
          hint: 'Lấy dư liên tiếp cho `b` và lưu các chữ số vào mảng, sau đó in ngược lại.',
          solution: c`
            #include <stdio.h>
            void doiCoSo(long long n, int b) {
                char s[70]; int k = 0;
                const char *digits = "0123456789ABCDEF";
                do { s[k++] = digits[n % b]; n /= b; } while (n > 0);
                while (k > 0) putchar(s[--k]);
                putchar('\n');
            }
            int main() {
                long long n; int b;
                scanf("%lld %d", &n, &b);
                doiCoSo(n, b);
                return 0;
            }`,
          tests: ['10 2', '255 16', '0 8', '100 3', '1000000000000000000 16', '35 7', '4095 2'],
        },
        {
          slug: 'dem-so-dep',
          title: 'Đếm số đẹp',
          difficulty: 'hard',
          statement: `
            Một số được gọi là **đẹp** nếu thỏa mãn đồng thời:

            1. Là số đối xứng (đọc xuôi ngược như nhau),
            2. Tổng các chữ số của nó là một số nguyên tố.

            Nhập \`a, b\`, đếm số lượng số đẹp trong đoạn [a, b].

            Hãy tổ chức chương trình thành các hàm: \`laDoiXung\`, \`tongChuSo\`, \`laNguyenTo\`.
          `,
          input: 'Hai số nguyên `a b` (1 ≤ a ≤ b ≤ 10<sup>6</sup>).',
          output: 'Số lượng số đẹp.',
          solution: c`
            #include <stdio.h>
            int laDoiXung(int n) { int t = n, r = 0; while (t) { r = r * 10 + t % 10; t /= 10; } return r == n; }
            int tongChuSo(int n) { int s = 0; while (n) { s += n % 10; n /= 10; } return s; }
            int laNguyenTo(int n) { if (n < 2) return 0; for (int i = 2; i * i <= n; i++) if (n % i == 0) return 0; return 1; }
            int main() {
                int a, b, cnt = 0;
                scanf("%d %d", &a, &b);
                for (int i = a; i <= b; i++) if (laDoiXung(i) && laNguyenTo(tongChuSo(i))) cnt++;
                printf("%d\n", cnt);
                return 0;
            }`,
          tests: ['1 100', '1 9', '10 20', '1 1000000', '500000 600000', '11 11'],
        },
      ],
    },
  ],
};
