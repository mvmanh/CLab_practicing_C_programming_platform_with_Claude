const c = String.raw;

module.exports = {
  slug: 'toan-tu-bieu-thuc',
  title: 'Toán tử & Biểu thức',
  icon: '➗',
  description: 'Toán tử số học, quan hệ, logic, thư viện math.h và cách viết biểu thức đúng.',
  intro: `
    **Kiến thức cần nhớ**

    - Toán tử số học: \`+ - * / %\`. Toán tử \`%\` chỉ dùng cho số nguyên.
    - Toán tử quan hệ \`== != < > <= >=\` và logic \`&& || !\` cho kết quả 0 (sai) hoặc 1 (đúng).
    - Thư viện \`<math.h>\`: \`sqrt\`, \`pow\`, \`fabs\`, \`floor\`, \`ceil\`, \`round\`... (hệ thống chấm tự liên kết \`-lm\`).
    - Thứ tự ưu tiên: \`* / %\` trước \`+ -\`; khi không chắc chắn, hãy dùng ngoặc.
    - Tràn số: \`int\` chỉ tới 2 147 483 647 — với tích lớn hãy dùng \`long long\`.
  `,
  categories: [
    {
      slug: 'so-hoc',
      title: 'Toán tử số học',
      description: 'Tách chữ số, đổi đơn vị, công thức đơn giản.',
      problems: [
        {
          slug: 'tach-chu-so',
          title: 'Tách các chữ số của số có 3 chữ số',
          difficulty: 'easy',
          statement: `
            Nhập một số nguyên dương \`n\` có đúng 3 chữ số. In ra chữ số hàng trăm, hàng chục, hàng đơn vị
            (cách nhau bởi một khoảng trắng), và trên dòng thứ hai in tổng các chữ số.
          `,
          input: 'Một số nguyên `n` (100 ≤ n ≤ 999).',
          output: 'Dòng 1: ba chữ số cách nhau một khoảng trắng. Dòng 2: tổng các chữ số.',
          hint: 'Hàng đơn vị: `n % 10`; hàng chục: `n / 10 % 10`; hàng trăm: `n / 100`.',
          solution: c`
            #include <stdio.h>
            int main() {
                int n;
                scanf("%d", &n);
                int a = n / 100, b = n / 10 % 10, c = n % 10;
                printf("%d %d %d\n%d\n", a, b, c, a + b + c);
                return 0;
            }`,
          tests: ['123', '100', '999', '507', '840', '361'],
        },
        {
          slug: 'tien-le',
          title: 'Đổi tiền',
          difficulty: 'easy',
          statement: `
            Một máy ATM chỉ có các loại tờ tiền mệnh giá **500, 200, 100, 50, 20, 10** (nghìn đồng).
            Nhập số tiền \`n\` (nghìn đồng, chia hết cho 10), hãy đổi ra **ít tờ nhất** bằng cách
            ưu tiên mệnh giá lớn trước. In ra số tờ mỗi loại theo thứ tự mệnh giá giảm dần, mỗi loại một dòng:

            \`\`\`
            500: <so to>
            200: <so to>
            ...
            10: <so to>
            \`\`\`
          `,
          input: 'Một số nguyên `n` (10 ≤ n ≤ 10<sup>9</sup>, n chia hết cho 10).',
          output: '6 dòng như mô tả.',
          solution: c`
            #include <stdio.h>
            int main() {
                long long n;
                scanf("%lld", &n);
                int m[] = {500, 200, 100, 50, 20, 10};
                for (int i = 0; i < 6; i++) {
                    printf("%d: %lld\n", m[i], n / m[i]);
                    n %= m[i];
                }
                return 0;
            }`,
          tests: ['880', '10', '500', '1230', '999990', '70'],
        },
        {
          slug: 'luong-thuc-linh',
          title: 'Tính lương thực lĩnh',
          difficulty: 'easy',
          statement: `
            Một nhân viên có lương cơ bản \`L\` (nghìn đồng/tháng) và số ngày làm thêm \`d\`.
            Mỗi ngày làm thêm được thưởng **2%** lương cơ bản. Tổng thu nhập bị trừ **10.5%** bảo hiểm.

            In ra lương thực lĩnh, làm tròn 2 chữ số thập phân.
          `,
          input: 'Hai số nguyên `L` (1 ≤ L ≤ 10<sup>6</sup>) và `d` (0 ≤ d ≤ 31).',
          output: 'Lương thực lĩnh với 2 chữ số thập phân.',
          solution: c`
            #include <stdio.h>
            int main() {
                int L, d;
                scanf("%d %d", &L, &d);
                double tong = L + L * 0.02 * d;
                printf("%.2f\n", tong * (1 - 0.105));
                return 0;
            }`,
          tests: ['10000 0', '10000 5', '8500 3', '1 31', '1000000 20', '12345 7'],
        },
      ],
    },
    {
      slug: 'math-h',
      title: 'Thư viện math.h',
      description: 'sqrt, pow, fabs... và các công thức hình học.',
      problems: [
        {
          slug: 'khoang-cach-hai-diem',
          title: 'Khoảng cách giữa hai điểm',
          difficulty: 'easy',
          statement: `
            Cho hai điểm A(x1, y1) và B(x2, y2) trên mặt phẳng. Tính độ dài đoạn AB:

            AB = √((x2 − x1)² + (y2 − y1)²)

            In ra kết quả làm tròn 3 chữ số thập phân.
          `,
          input: 'Bốn số thực `x1 y1 x2 y2` (giá trị tuyệt đối ≤ 10<sup>4</sup>).',
          output: 'Độ dài AB với 3 chữ số thập phân.',
          hint: '`#include <math.h>` và dùng `sqrt()`.',
          solution: c`
            #include <stdio.h>
            #include <math.h>
            int main() {
                double x1, y1, x2, y2;
                scanf("%lf %lf %lf %lf", &x1, &y1, &x2, &y2);
                printf("%.3f\n", sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)));
                return 0;
            }`,
          tests: ['0 0 3 4', '1 1 1 1', '-1 -1 2 3', '1.5 2.5 -3.5 4', '10000 10000 -10000 -10000', '0 0 1 1'],
        },
        {
          slug: 'dien-tich-tam-giac-heron',
          title: 'Diện tích tam giác (Heron)',
          difficulty: 'easy',
          statement: `
            Cho độ dài ba cạnh \`a, b, c\` của một tam giác **hợp lệ**. Tính diện tích theo công thức Heron:

            p = (a + b + c) / 2, S = √(p(p − a)(p − b)(p − c))

            In ra chu vi và diện tích, mỗi số trên một dòng, làm tròn 2 chữ số thập phân.
          `,
          input: 'Ba số thực dương `a b c` tạo thành tam giác (≤ 10<sup>3</sup>).',
          output: 'Dòng 1: chu vi. Dòng 2: diện tích.',
          solution: c`
            #include <stdio.h>
            #include <math.h>
            int main() {
                double a, b, c;
                scanf("%lf %lf %lf", &a, &b, &c);
                double p = (a + b + c) / 2;
                printf("%.2f\n%.2f\n", a + b + c, sqrt(p * (p - a) * (p - b) * (p - c)));
                return 0;
            }`,
          tests: ['3 4 5', '1 1 1', '5 5 8', '7.5 8.5 10', '100 100 199', '2 3 4'],
        },
        {
          slug: 'lai-kep',
          title: 'Lãi suất kép',
          difficulty: 'medium',
          statement: `
            Gửi tiết kiệm số tiền \`P\` (triệu đồng) với lãi suất \`r\`% mỗi năm, lãi được nhập gốc hằng năm.
            Sau \`n\` năm, số tiền nhận được là:

            A = P × (1 + r/100)<sup>n</sup>

            In ra \`A\` và tiền lãi \`A − P\`, mỗi số một dòng, làm tròn 2 chữ số thập phân.
          `,
          input: 'Một dòng gồm `P` (số thực, 0 < P ≤ 10<sup>4</sup>), `r` (số thực, 0 ≤ r ≤ 20), `n` (số nguyên, 0 ≤ n ≤ 50).',
          output: 'Hai dòng: số tiền cuối kỳ và tiền lãi.',
          hint: 'Dùng `pow(1 + r / 100, n)` trong `<math.h>`.',
          solution: c`
            #include <stdio.h>
            #include <math.h>
            int main() {
                double P, r;
                int n;
                scanf("%lf %lf %d", &P, &r, &n);
                double A = P * pow(1 + r / 100, n);
                printf("%.2f\n%.2f\n", A, A - P);
                return 0;
            }`,
          tests: ['100 7 1', '100 7 10', '50 5.5 0', '1000 0 20', '250.5 6.8 15', '10000 12 50'],
        },
      ],
    },
    {
      slug: 'quan-he-logic',
      title: 'Toán tử quan hệ & logic',
      description: 'Biểu thức đúng/sai không dùng if.',
      problems: [
        {
          slug: 'bieu-thuc-logic',
          title: 'Kết quả biểu thức logic',
          difficulty: 'easy',
          statement: `
            Nhập ba số nguyên \`a, b, c\`. **Không dùng câu lệnh if**, hãy in ra giá trị (0 hoặc 1) của các biểu thức sau,
            mỗi biểu thức một dòng:

            1. \`a > b\`
            2. \`a == b || b == c\`
            3. \`a < b && b < c\` (ba số tăng dần)
            4. \`!(a % 2)\` (a là số chẵn)
            5. \`(a + b > c) && (a + c > b) && (b + c > a)\` (ba cạnh tam giác)
          `,
          input: 'Ba số nguyên `a b c` (|a|, |b|, |c| ≤ 10<sup>9</sup>).',
          output: '5 dòng, mỗi dòng là 0 hoặc 1.',
          hint: 'Trong C, `printf("%d", a > b);` in ra 1 nếu đúng và 0 nếu sai. Cẩn thận tràn số khi cộng!',
          solution: c`
            #include <stdio.h>
            int main() {
                long long a, b, c;
                scanf("%lld %lld %lld", &a, &b, &c);
                printf("%d\n%d\n%d\n%d\n%d\n", a > b, a == b || b == c, a < b && b < c, !(a % 2),
                       (a + b > c) && (a + c > b) && (b + c > a));
                return 0;
            }`,
          tests: ['3 4 5', '5 5 5', '1 2 10', '-4 0 7', '1000000000 1000000000 1000000000', '9 3 1', '2 2 3'],
        },
        {
          slug: 'nam-nhuan-mot-dong',
          title: 'Năm nhuận (một biểu thức)',
          difficulty: 'easy',
          statement: `
            Năm \`y\` là năm nhuận nếu nó chia hết cho 400, hoặc chia hết cho 4 nhưng không chia hết cho 100.

            Hãy viết **một biểu thức logic duy nhất** để kiểm tra và in ra \`1\` nếu \`y\` là năm nhuận, ngược lại in \`0\`.
          `,
          input: 'Một số nguyên `y` (1 ≤ y ≤ 10<sup>6</sup>).',
          output: '`1` hoặc `0`.',
          solution: c`
            #include <stdio.h>
            int main() {
                int y;
                scanf("%d", &y);
                printf("%d\n", (y % 400 == 0) || (y % 4 == 0 && y % 100 != 0));
                return 0;
            }`,
          tests: ['2024', '1900', '2000', '2023', '2100', '4', '1600'],
        },
      ],
    },
  ],
};
