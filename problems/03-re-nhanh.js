const c = String.raw;

module.exports = {
  slug: 're-nhanh',
  title: 'Cấu trúc rẽ nhánh',
  icon: '🔀',
  description: 'Câu lệnh if, if-else, else-if lồng nhau và switch-case.',
  intro: `
    **Kiến thức cần nhớ**

    - \`if (dieu_kien) { ... } else if (...) { ... } else { ... }\`
    - Đừng nhầm \`=\` (gán) với \`==\` (so sánh)!
    - \`switch (bieu_thuc) { case 1: ...; break; default: ...; }\` — nhớ \`break\` để không "rơi" xuống case kế tiếp.
    - So sánh số thực nên dùng sai số: \`fabs(a - b) < 1e-9\`.
  `,
  categories: [
    {
      slug: 'so-sanh-phan-loai',
      title: 'So sánh & phân loại',
      description: 'Tìm lớn nhất, kiểm tra tính chất, xếp loại.',
      problems: [
        {
          slug: 'chan-le-am-duong',
          title: 'Chẵn lẻ, âm dương',
          difficulty: 'easy',
          statement: `
            Nhập số nguyên \`n\`. In ra hai dòng:

            - Dòng 1: \`CHAN\` nếu \`n\` chẵn, \`LE\` nếu \`n\` lẻ.
            - Dòng 2: \`DUONG\` nếu \`n > 0\`, \`AM\` nếu \`n < 0\`, \`KHONG\` nếu \`n = 0\`.
          `,
          input: 'Một số nguyên `n` (|n| ≤ 10<sup>9</sup>).',
          output: 'Hai dòng như mô tả.',
          hint: 'Với số âm, `n % 2` có thể bằng `-1`, vì vậy hãy kiểm tra `n % 2 == 0` thay vì `n % 2 == 1`.',
          solution: c`
            #include <stdio.h>
            int main() {
                int n;
                scanf("%d", &n);
                printf("%s\n", n % 2 == 0 ? "CHAN" : "LE");
                if (n > 0) printf("DUONG\n");
                else if (n < 0) printf("AM\n");
                else printf("KHONG\n");
                return 0;
            }`,
          tests: ['4', '-7', '0', '15', '-1000000000', '999999999'],
        },
        {
          slug: 'so-lon-nhat-ba-so',
          title: 'Số lớn nhất trong ba số',
          difficulty: 'easy',
          statement: 'Nhập ba số nguyên `a, b, c`. In ra số lớn nhất và số nhỏ nhất (cách nhau một khoảng trắng).',
          input: 'Ba số nguyên `a b c` (|a|, |b|, |c| ≤ 10<sup>9</sup>).',
          output: 'Số lớn nhất và số nhỏ nhất.',
          solution: c`
            #include <stdio.h>
            int main() {
                int a, b, c;
                scanf("%d %d %d", &a, &b, &c);
                int mx = a, mn = a;
                if (b > mx) mx = b;
                if (c > mx) mx = c;
                if (b < mn) mn = b;
                if (c < mn) mn = c;
                printf("%d %d\n", mx, mn);
                return 0;
            }`,
          tests: ['1 2 3', '3 2 1', '5 5 5', '-1 -5 -3', '7 10 2', '1000000000 -1000000000 0'],
        },
        {
          slug: 'xep-loai-hoc-luc',
          title: 'Xếp loại học lực',
          difficulty: 'easy',
          statement: `
            Nhập điểm trung bình \`d\` (thang 10). Xếp loại theo bảng sau:

            | Điểm | Xếp loại |
            |---|---|
            | d ≥ 9.0 | \`Xuat sac\` |
            | 8.0 ≤ d < 9.0 | \`Gioi\` |
            | 6.5 ≤ d < 8.0 | \`Kha\` |
            | 5.0 ≤ d < 6.5 | \`Trung binh\` |
            | d < 5.0 | \`Yeu\` |

            Nếu điểm không nằm trong đoạn [0, 10] thì in \`Diem khong hop le\`.
          `,
          input: 'Một số thực `d`.',
          output: 'Xếp loại tương ứng.',
          solution: c`
            #include <stdio.h>
            int main() {
                double d;
                scanf("%lf", &d);
                if (d < 0 || d > 10) printf("Diem khong hop le\n");
                else if (d >= 9) printf("Xuat sac\n");
                else if (d >= 8) printf("Gioi\n");
                else if (d >= 6.5) printf("Kha\n");
                else if (d >= 5) printf("Trung binh\n");
                else printf("Yeu\n");
                return 0;
            }`,
          tests: ['9.5', '8', '7.9', '6.5', '5', '4.99', '10.5', '-1', '0', '10'],
        },
        {
          slug: 'so-ngay-cua-thang',
          title: 'Số ngày của tháng',
          difficulty: 'medium',
          statement: `
            Nhập tháng \`m\` và năm \`y\`. In ra số ngày của tháng đó. Nhớ rằng tháng 2 năm nhuận có 29 ngày.

            Năm nhuận: chia hết cho 400, hoặc chia hết cho 4 nhưng không chia hết cho 100.

            Nếu tháng không hợp lệ (không thuộc 1..12) in \`-1\`.
          `,
          input: 'Hai số nguyên `m y` (1 ≤ y ≤ 10<sup>5</sup>).',
          output: 'Số ngày của tháng, hoặc -1.',
          hint: 'Dùng `switch (m)` và gộp các case cùng số ngày: `case 1: case 3: case 5: ... return 31;`',
          solution: c`
            #include <stdio.h>
            int main() {
                int m, y;
                scanf("%d %d", &m, &y);
                int d;
                switch (m) {
                    case 1: case 3: case 5: case 7: case 8: case 10: case 12: d = 31; break;
                    case 4: case 6: case 9: case 11: d = 30; break;
                    case 2: d = ((y % 400 == 0) || (y % 4 == 0 && y % 100 != 0)) ? 29 : 28; break;
                    default: d = -1;
                }
                printf("%d\n", d);
                return 0;
            }`,
          tests: ['2 2024', '2 2023', '2 1900', '2 2000', '4 2025', '12 1', '13 2020', '0 2020'],
        },
      ],
    },
    {
      slug: 'giai-phuong-trinh',
      title: 'Giải phương trình',
      description: 'Phương trình bậc nhất, bậc hai — xét đầy đủ các trường hợp.',
      problems: [
        {
          slug: 'phuong-trinh-bac-nhat',
          title: 'Phương trình bậc nhất ax + b = 0',
          difficulty: 'easy',
          statement: `
            Giải phương trình \`ax + b = 0\` với \`a, b\` là số nguyên.

            - Nếu phương trình vô nghiệm, in \`VO NGHIEM\`.
            - Nếu có vô số nghiệm, in \`VO SO NGHIEM\`.
            - Ngược lại in nghiệm \`x\` làm tròn 2 chữ số thập phân.
          `,
          input: 'Hai số nguyên `a b` (|a|, |b| ≤ 10<sup>6</sup>).',
          output: 'Kết quả như mô tả.',
          hint: 'Cẩn thận trường hợp nghiệm là `-0.00`: hãy cộng thêm `0.0` hoặc xử lý riêng khi `b == 0`.',
          solution: c`
            #include <stdio.h>
            int main() {
                int a, b;
                scanf("%d %d", &a, &b);
                if (a == 0) printf(b == 0 ? "VO SO NGHIEM\n" : "VO NGHIEM\n");
                else {
                    double x = (double)-b / a;
                    if (x == 0) x = 0;
                    printf("%.2f\n", x);
                }
                return 0;
            }`,
          tests: ['2 -4', '0 0', '0 5', '3 1', '-7 0', '5 0', '-4 -6'],
        },
        {
          slug: 'phuong-trinh-bac-hai',
          title: 'Phương trình bậc hai',
          difficulty: 'medium',
          statement: `
            Giải phương trình \`ax² + bx + c = 0\` với \`a, b, c\` là số nguyên.

            - \`a = 0\`: giải như phương trình bậc nhất \`bx + c = 0\` (in \`VO NGHIEM\`, \`VO SO NGHIEM\`, hoặc nghiệm duy nhất).
            - \`Δ < 0\`: in \`VO NGHIEM\`.
            - \`Δ = 0\`: in \`NGHIEM KEP <x>\`.
            - \`Δ > 0\`: in hai nghiệm \`<x1> <x2>\` với **x1 < x2**.

            Tất cả các nghiệm in với 2 chữ số thập phân; không in \`-0.00\` (thay bằng \`0.00\`).
          `,
          input: 'Ba số nguyên `a b c` (|a|, |b|, |c| ≤ 1000).',
          output: 'Kết quả như mô tả.',
          solution: c`
            #include <stdio.h>
            #include <math.h>
            double fix(double x) { return fabs(x) < 0.005 ? 0.0 : x; }
            int main() {
                int a, b, c;
                scanf("%d %d %d", &a, &b, &c);
                if (a == 0) {
                    if (b == 0) printf(c == 0 ? "VO SO NGHIEM\n" : "VO NGHIEM\n");
                    else printf("%.2f\n", fix((double)-c / b));
                    return 0;
                }
                long long d = (long long)b * b - 4LL * a * c;
                if (d < 0) printf("VO NGHIEM\n");
                else if (d == 0) printf("NGHIEM KEP %.2f\n", fix(-b / (2.0 * a)));
                else {
                    double x1 = (-b - sqrt((double)d)) / (2.0 * a);
                    double x2 = (-b + sqrt((double)d)) / (2.0 * a);
                    if (x1 > x2) { double t = x1; x1 = x2; x2 = t; }
                    printf("%.2f %.2f\n", fix(x1), fix(x2));
                }
                return 0;
            }`,
          tests: ['1 -3 2', '1 2 1', '1 0 1', '0 0 0', '0 2 -3', '0 0 7', '-1 0 4', '2 5 0', '1 0 0'],
          samples: 3,
        },
      ],
    },
    {
      slug: 'switch-case',
      title: 'switch-case',
      description: 'Chọn nhánh theo giá trị.',
      problems: [
        {
          slug: 'thu-trong-tuan',
          title: 'Thứ trong tuần',
          difficulty: 'easy',
          statement: `
            Nhập số nguyên \`n\`. In ra tên thứ tương ứng: 1 → \`Chu nhat\`, 2 → \`Thu hai\`, 3 → \`Thu ba\`, 4 → \`Thu tu\`,
            5 → \`Thu nam\`, 6 → \`Thu sau\`, 7 → \`Thu bay\`. Giá trị khác in \`Khong hop le\`.
          `,
          input: 'Một số nguyên `n`.',
          output: 'Tên thứ hoặc `Khong hop le`.',
          solution: c`
            #include <stdio.h>
            int main() {
                int n;
                scanf("%d", &n);
                switch (n) {
                    case 1: printf("Chu nhat\n"); break;
                    case 2: printf("Thu hai\n"); break;
                    case 3: printf("Thu ba\n"); break;
                    case 4: printf("Thu tu\n"); break;
                    case 5: printf("Thu nam\n"); break;
                    case 6: printf("Thu sau\n"); break;
                    case 7: printf("Thu bay\n"); break;
                    default: printf("Khong hop le\n");
                }
                return 0;
            }`,
          tests: ['1', '2', '5', '7', '0', '8', '-3'],
        },
        {
          slug: 'may-tinh-don-gian',
          title: 'Máy tính đơn giản',
          difficulty: 'easy',
          statement: `
            Nhập một biểu thức dạng \`a op b\` với \`a, b\` là số nguyên và \`op\` là một trong các ký tự \`+ - * / %\`.
            In ra kết quả:

            - Với \`/\`: in kết quả chia **thực** với 2 chữ số thập phân.
            - Với \`%\`: in phần dư (số nguyên).
            - Nếu chia (hoặc chia lấy dư) cho 0, in \`Loi chia cho 0\`.
            - Nếu toán tử không hợp lệ, in \`Toan tu khong hop le\`.
          `,
          input: 'Một dòng `a op b`, các phần cách nhau bởi một khoảng trắng (|a|, |b| ≤ 10<sup>9</sup>).',
          output: 'Kết quả phép tính.',
          hint: 'Đọc bằng `scanf("%lld %c %lld", &a, &op, &b);` rồi `switch (op)`. Tích có thể vượt quá `int`.',
          solution: c`
            #include <stdio.h>
            int main() {
                long long a, b;
                char op;
                scanf("%lld %c %lld", &a, &op, &b);
                switch (op) {
                    case '+': printf("%lld\n", a + b); break;
                    case '-': printf("%lld\n", a - b); break;
                    case '*': printf("%lld\n", a * b); break;
                    case '/': if (b == 0) printf("Loi chia cho 0\n"); else printf("%.2f\n", (double)a / b); break;
                    case '%': if (b == 0) printf("Loi chia cho 0\n"); else printf("%lld\n", a % b); break;
                    default: printf("Toan tu khong hop le\n");
                }
                return 0;
            }`,
          tests: ['3 + 5', '10 / 4', '7 % 3', '6 / 0', '100000 * 100000', '5 ^ 2', '-9 - 11', '8 % 0'],
          samples: 3,
        },
      ],
    },
    {
      slug: 'bai-toan-thuc-te',
      title: 'Bài toán thực tế',
      description: 'Ứng dụng rẽ nhánh vào các bài toán đời sống.',
      problems: [
        {
          slug: 'tien-dien-bac-thang',
          title: 'Tính tiền điện bậc thang',
          difficulty: 'medium',
          statement: `
            Giá điện sinh hoạt được tính lũy tiến theo bậc:

            | Bậc | Số kWh | Đơn giá (đồng/kWh) |
            |---|---|---|
            | 1 | 0 – 50 | 1806 |
            | 2 | 51 – 100 | 1866 |
            | 3 | 101 – 200 | 2167 |
            | 4 | 201 – 300 | 2729 |
            | 5 | 301 – 400 | 3050 |
            | 6 | từ 401 trở lên | 3151 |

            Ví dụ dùng 120 kWh: 50 × 1806 + 50 × 1866 + 20 × 2167 = 226940 đồng.

            Nhập số kWh tiêu thụ, in ra số tiền phải trả (chưa tính thuế).
          `,
          input: 'Một số nguyên `k` (0 ≤ k ≤ 10<sup>6</sup>).',
          output: 'Số tiền (số nguyên).',
          solution: c`
            #include <stdio.h>
            int main() {
                long long k;
                scanf("%lld", &k);
                long long lim[] = {50, 100, 200, 300, 400};
                long long gia[] = {1806, 1866, 2167, 2729, 3050, 3151};
                long long tien = 0, prev = 0;
                for (int i = 0; i < 5 && k > prev; i++) {
                    long long dung = (k < lim[i] ? k : lim[i]) - prev;
                    tien += dung * gia[i];
                    prev = lim[i];
                }
                if (k > 400) tien += (k - 400) * gia[5];
                printf("%lld\n", tien);
                return 0;
            }`,
          tests: ['120', '0', '50', '100', '201', '400', '401', '1000000'],
        },
        {
          slug: 'phan-loai-tam-giac',
          title: 'Phân loại tam giác',
          difficulty: 'medium',
          statement: `
            Nhập độ dài ba cạnh \`a, b, c\` (số nguyên dương). In ra:

            - \`Khong phai tam giac\` nếu ba cạnh không tạo thành tam giác.
            - \`Tam giac deu\` nếu ba cạnh bằng nhau.
            - \`Tam giac vuong can\` nếu vừa vuông vừa cân.
            - \`Tam giac vuong\` nếu là tam giác vuông.
            - \`Tam giac can\` nếu có hai cạnh bằng nhau.
            - \`Tam giac thuong\` trong các trường hợp còn lại.

            Ưu tiên kiểm tra theo đúng thứ tự trên. (Lưu ý: với cạnh nguyên thì không tồn tại tam giác vuông cân.)
          `,
          input: 'Ba số nguyên dương `a b c` (≤ 10<sup>6</sup>).',
          output: 'Loại tam giác.',
          hint: 'Kiểm tra vuông bằng định lý Pytago với số nguyên (`long long`) để tránh sai số.',
          solution: c`
            #include <stdio.h>
            int main() {
                long long a, b, c;
                scanf("%lld %lld %lld", &a, &b, &c);
                if (a + b <= c || a + c <= b || b + c <= a) { printf("Khong phai tam giac\n"); return 0; }
                int vuong = a*a + b*b == c*c || a*a + c*c == b*b || b*b + c*c == a*a;
                int can = a == b || b == c || a == c;
                if (a == b && b == c) printf("Tam giac deu\n");
                else if (vuong && can) printf("Tam giac vuong can\n");
                else if (vuong) printf("Tam giac vuong\n");
                else if (can) printf("Tam giac can\n");
                else printf("Tam giac thuong\n");
                return 0;
            }`,
          tests: ['3 4 5', '2 2 2', '1 2 3', '5 5 8', '4 5 6', '13 5 12', '1000000 1000000 1', '7 10 3'],
        },
      ],
    },
  ],
};
