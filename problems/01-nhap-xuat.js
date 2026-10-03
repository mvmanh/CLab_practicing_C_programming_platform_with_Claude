const c = String.raw;

module.exports = {
  slug: 'nhap-xuat',
  title: 'Nhập xuất & Kiểu dữ liệu',
  icon: '⌨️',
  description: 'printf, scanf, các kiểu dữ liệu cơ bản (int, long long, float, double, char) và định dạng in.',
  intro: `
    **Kiến thức cần nhớ**

    - Mỗi chương trình C bắt đầu từ hàm \`main\`. Dùng \`#include <stdio.h>\` để có \`printf\` và \`scanf\`.
    - Định dạng thường dùng: \`%d\` (int), \`%lld\` (long long), \`%f\` (float khi in), \`%lf\` (double khi nhập), \`%c\` (char), \`%s\` (chuỗi).
    - In số thực với 2 chữ số thập phân: \`printf("%.2f", x);\`
    - \`scanf\` cần **địa chỉ** của biến: \`scanf("%d", &n);\`
    - Phép chia giữa hai số nguyên cho kết quả nguyên: \`7 / 2 == 3\`. Muốn chia thực hãy ép kiểu: \`(double)7 / 2\`.
  `,
  categories: [
    {
      slug: 'in-ra-man-hinh',
      title: 'In ra màn hình',
      description: 'Làm quen với printf và các ký tự đặc biệt.',
      problems: [
        {
          slug: 'xin-chao-c',
          title: 'Xin chào, C!',
          difficulty: 'easy',
          statement: `
            Bài tập đầu tiên! Hãy nhập vào **tên** của bạn (một từ, không có khoảng trắng) và in ra lời chào theo mẫu:

            \`\`\`
            Xin chao, <ten>!
            \`\`\`
          `,
          input: 'Một dòng chứa một từ là tên (không quá 50 ký tự).',
          output: 'In ra `Xin chao, <ten>!`',
          hint: 'Khai báo `char ten[51];` rồi đọc bằng `scanf("%s", ten);` (không cần dấu `&` với mảng ký tự).',
          solution: c`
            #include <stdio.h>
            int main() {
                char ten[64];
                scanf("%63s", ten);
                printf("Xin chao, %s!\n", ten);
                return 0;
            }`,
          tests: ['An', 'Binh', 'Linh', 'Nguyen', 'C_Programmer'],
        },
        {
          slug: 'in-thong-tin-ca-nhan',
          title: 'In thông tin cá nhân',
          difficulty: 'easy',
          statement: `
            Nhập vào năm sinh và năm hiện tại, hãy in ra số tuổi theo mẫu:

            \`\`\`
            Ban <tuoi> tuoi.
            \`\`\`

            Sau đó in thêm dòng thứ hai cho biết số tuổi khi tròn 10 năm nữa:

            \`\`\`
            10 nam nua ban <tuoi+10> tuoi.
            \`\`\`
          `,
          input: 'Một dòng gồm hai số nguyên: năm sinh và năm hiện tại (1900 ≤ năm sinh ≤ năm hiện tại ≤ 3000).',
          output: 'Hai dòng như mô tả.',
          solution: c`
            #include <stdio.h>
            int main() {
                int ns, nht;
                scanf("%d %d", &ns, &nht);
                printf("Ban %d tuoi.\n", nht - ns);
                printf("10 nam nua ban %d tuoi.\n", nht - ns + 10);
                return 0;
            }`,
          tests: ['2005 2025', '2000 2024', '1990 1990', '1950 2026', '2010 2030'],
        },
        {
          slug: 've-khung-chu-nhat',
          title: 'Vẽ khung chữ nhật',
          difficulty: 'easy',
          statement: `
            Nhập một từ \`s\` (không quá 30 ký tự). Hãy in từ đó nằm trong một khung làm bằng dấu \`*\`,
            cách viền trái/phải đúng **một** khoảng trắng.

            Ví dụ với \`s = Hello\`:

            \`\`\`
            *********
            * Hello *
            *********
            \`\`\`
          `,
          input: 'Một từ `s` không chứa khoảng trắng.',
          output: 'Ba dòng tạo thành khung.',
          hint: 'Độ dài khung = độ dài từ + 4. Dùng `strlen` trong `<string.h>` để lấy độ dài.',
          solution: c`
            #include <stdio.h>
            #include <string.h>
            int main() {
                char s[64];
                scanf("%63s", s);
                int n = strlen(s) + 4;
                for (int i = 0; i < n; i++) putchar('*');
                printf("\n* %s *\n", s);
                for (int i = 0; i < n; i++) putchar('*');
                printf("\n");
                return 0;
            }`,
          tests: ['Hello', 'C', 'LapTrinhC', 'abcdefghijklmnopqrstuvwxyz', 'Xin-chao'],
        },
      ],
    },
    {
      slug: 'nhap-va-tinh-toan',
      title: 'Nhập và tính toán cơ bản',
      description: 'Đọc dữ liệu bằng scanf và tính toán với các phép toán số học.',
      problems: [
        {
          slug: 'tong-hai-so',
          title: 'Tổng hai số',
          difficulty: 'easy',
          statement: `
            Nhập hai số nguyên \`a\` và \`b\`. In ra tổng \`a + b\`.

            Chú ý: giá trị có thể rất lớn, hãy chọn kiểu dữ liệu phù hợp.
          `,
          input: 'Một dòng gồm hai số nguyên `a`, `b` (|a|, |b| ≤ 10<sup>18</sup>/2).',
          output: 'Một số nguyên là `a + b`.',
          hint: '`int` chỉ chứa được tới khoảng 2.1 × 10<sup>9</sup>. Hãy dùng `long long` và định dạng `%lld`.',
          solution: c`
            #include <stdio.h>
            int main() {
                long long a, b;
                scanf("%lld %lld", &a, &b);
                printf("%lld\n", a + b);
                return 0;
            }`,
          tests: ['3 5', '-10 4', '0 0', '2000000000 2000000000', '-500000000000000000 499999999999999999', '123456789 987654321'],
        },
        {
          slug: 'chu-vi-dien-tich-hcn',
          title: 'Chu vi và diện tích hình chữ nhật',
          difficulty: 'easy',
          statement: `
            Nhập chiều dài \`a\` và chiều rộng \`b\` của hình chữ nhật (là các số thực).
            In ra chu vi và diện tích, mỗi giá trị trên một dòng, làm tròn **2 chữ số** thập phân.

            \`\`\`
            Chu vi: <P>
            Dien tich: <S>
            \`\`\`
          `,
          input: 'Hai số thực dương `a`, `b` (≤ 10<sup>4</sup>).',
          output: 'Hai dòng như mẫu.',
          hint: 'Dùng kiểu `double`, nhập bằng `%lf`, in bằng `%.2f`.',
          solution: c`
            #include <stdio.h>
            int main() {
                double a, b;
                scanf("%lf %lf", &a, &b);
                printf("Chu vi: %.2f\n", 2 * (a + b));
                printf("Dien tich: %.2f\n", a * b);
                return 0;
            }`,
          tests: ['5 3', '2.5 4', '10.25 0.5', '1000 999.9', '1.1 1.1', '7 7'],
        },
        {
          slug: 'doi-nhiet-do',
          title: 'Đổi độ C sang độ F',
          difficulty: 'easy',
          statement: `
            Nhập nhiệt độ \`C\` (độ Celsius, số thực). Đổi sang độ Fahrenheit theo công thức:

            F = C × 9 / 5 + 32

            In ra kết quả với **1 chữ số** thập phân.
          `,
          input: 'Một số thực `C` (−273.15 ≤ C ≤ 10<sup>4</sup>).',
          output: 'Một số thực là nhiệt độ F, làm tròn 1 chữ số thập phân.',
          hint: 'Cẩn thận: `9 / 5` với số nguyên bằng `1`! Hãy viết `9.0 / 5`.',
          solution: c`
            #include <stdio.h>
            int main() {
                double C;
                scanf("%lf", &C);
                printf("%.1f\n", C * 9.0 / 5 + 32);
                return 0;
            }`,
          tests: ['100', '0', '37', '-40', '25.5', '-273.15', '36.6'],
        },
        {
          slug: 'trung-binh-ba-so',
          title: 'Trung bình cộng ba số',
          difficulty: 'easy',
          statement: `
            Nhập ba số nguyên \`a\`, \`b\`, \`c\`. In ra trung bình cộng của chúng, làm tròn **2 chữ số** thập phân.
          `,
          input: 'Ba số nguyên `a`, `b`, `c` (|a|, |b|, |c| ≤ 10<sup>6</sup>) trên một dòng.',
          output: 'Trung bình cộng với 2 chữ số thập phân.',
          hint: '`(a + b + c) / 3` là phép chia nguyên! Hãy ép kiểu: `(a + b + c) / 3.0`.',
          solution: c`
            #include <stdio.h>
            int main() {
                int a, b, c;
                scanf("%d %d %d", &a, &b, &c);
                printf("%.2f\n", (a + b + c) / 3.0);
                return 0;
            }`,
          tests: ['1 2 3', '1 2 4', '-5 0 5', '10 10 11', '1000000 1000000 999999', '-7 -8 -10'],
        },
      ],
    },
    {
      slug: 'kieu-du-lieu',
      title: 'Kiểu dữ liệu & định dạng',
      description: 'Chia nguyên, chia lấy dư, ép kiểu và mã ASCII.',
      problems: [
        {
          slug: 'chia-nguyen-chia-du',
          title: 'Chia nguyên và chia lấy dư',
          difficulty: 'easy',
          statement: `
            Nhập hai số nguyên dương \`a\` và \`b\`. In ra trên 3 dòng:

            1. Thương nguyên \`a / b\`
            2. Số dư \`a % b\`
            3. Thương thực \`a / b\` làm tròn **3 chữ số** thập phân
          `,
          input: 'Hai số nguyên dương `a`, `b` (1 ≤ a, b ≤ 10<sup>9</sup>).',
          output: 'Ba dòng như mô tả.',
          solution: c`
            #include <stdio.h>
            int main() {
                int a, b;
                scanf("%d %d", &a, &b);
                printf("%d\n%d\n%.3f\n", a / b, a % b, (double)a / b);
                return 0;
            }`,
          tests: ['7 2', '10 5', '1 3', '1000000000 7', '5 10', '22 7'],
        },
        {
          slug: 'ma-ascii',
          title: 'Mã ASCII của ký tự',
          difficulty: 'easy',
          statement: `
            Nhập một ký tự \`ch\`. In ra mã ASCII của ký tự đó, sau đó in ký tự **liền sau** nó trong bảng mã ASCII.

            \`\`\`
            <ma ASCII>
            <ky tu lien sau>
            \`\`\`
          `,
          input: 'Một ký tự in được (không phải khoảng trắng, không phải `~`).',
          output: 'Hai dòng như mô tả.',
          hint: 'Ký tự trong C thực chất là số nguyên nhỏ: `printf("%d", ch)` in ra mã, `printf("%c", ch + 1)` in ký tự kế tiếp.',
          solution: c`
            #include <stdio.h>
            int main() {
                char ch;
                scanf(" %c", &ch);
                printf("%d\n%c\n", ch, ch + 1);
                return 0;
            }`,
          tests: ['A', 'a', '0', 'z', '#', 'Z'],
        },
        {
          slug: 'lam-tron-so-thuc',
          title: 'Làm tròn số thực',
          difficulty: 'medium',
          statement: `
            Nhập một số thực dương \`x\`. In ra 3 dòng:

            1. Phần nguyên của \`x\` (cắt bỏ phần thập phân)
            2. \`x\` làm tròn đến số nguyên **gần nhất** (0.5 làm tròn lên)
            3. Phần thập phân của \`x\` với 4 chữ số sau dấu phẩy
          `,
          input: 'Một số thực dương `x` (0 < x < 10<sup>9</sup>).',
          output: 'Ba dòng như mô tả.',
          hint: 'Phần nguyên: `(long long)x`. Làm tròn gần nhất với số dương: `(long long)(x + 0.5)`.',
          solution: c`
            #include <stdio.h>
            int main() {
                double x;
                scanf("%lf", &x);
                long long nguyen = (long long)x;
                printf("%lld\n%lld\n%.4f\n", nguyen, (long long)(x + 0.5), x - nguyen);
                return 0;
            }`,
          tests: ['3.7', '3.25', '10.5', '0.125', '123456.789', '7'],
        },
        {
          slug: 'doi-giay',
          title: 'Đổi giây ra giờ:phút:giây',
          difficulty: 'easy',
          statement: `
            Nhập số giây \`n\`. Đổi sang dạng \`hh:mm:ss\` (giờ, phút, giây), mỗi phần có **đúng 2 chữ số**
            (thêm số 0 ở đầu nếu cần). Số giờ có thể lớn hơn 24; nếu số giờ có từ 3 chữ số trở lên thì in bình thường.
          `,
          input: 'Một số nguyên `n` (0 ≤ n ≤ 10<sup>7</sup>).',
          output: 'Chuỗi dạng `hh:mm:ss`.',
          hint: 'Dùng `%02d` để in số có ít nhất 2 chữ số, thêm 0 ở đầu.',
          solution: c`
            #include <stdio.h>
            int main() {
                int n;
                scanf("%d", &n);
                printf("%02d:%02d:%02d\n", n / 3600, n % 3600 / 60, n % 60);
                return 0;
            }`,
          tests: ['3661', '0', '59', '86399', '90000', '10000000', '3600'],
        },
      ],
    },
  ],
};
