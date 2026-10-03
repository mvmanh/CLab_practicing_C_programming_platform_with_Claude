const c = String.raw;

module.exports = {
  slug: 'thao-tac-bit',
  title: 'Thao tác bit',
  icon: '💡',
  description: 'Toán tử bit & | ^ ~ << >>, biểu diễn nhị phân và các mẹo xử lý bit.',
  intro: `
    **Kiến thức cần nhớ**

    | Toán tử | Ý nghĩa | Ví dụ (a = 6 = 110₂, b = 3 = 011₂) |
    |---|---|---|
    | \`a & b\` | AND từng bit | 2 (010₂) |
    | \`a \\| b\` | OR từng bit | 7 (111₂) |
    | \`a ^ b\` | XOR từng bit | 5 (101₂) |
    | \`~a\` | Đảo bit | |
    | \`a << k\` | Dịch trái k bit (nhân 2<sup>k</sup>) | 6 << 1 = 12 |
    | \`a >> k\` | Dịch phải k bit (chia 2<sup>k</sup>) | 6 >> 1 = 3 |

    - Kiểm tra bit thứ k: \`(n >> k) & 1\`. Bật bit k: \`n | (1u << k)\`. Tắt bit k: \`n & ~(1u << k)\`. Đảo bit k: \`n ^ (1u << k)\`.
    - Nên dùng kiểu không dấu (\`unsigned\`) khi thao tác bit để tránh hành vi không xác định với số âm.
  `,
  categories: [
    {
      slug: 'bit-co-ban',
      title: 'Thao tác bit cơ bản',
      description: 'Đọc, bật, tắt, đảo bit.',
      problems: [
        {
          slug: 'in-32-bit',
          title: 'Biểu diễn 32 bit',
          difficulty: 'easy',
          statement: 'Nhập số nguyên `n` (kiểu `int` 32 bit, có thể âm). In ra biểu diễn nhị phân **đủ 32 bit** của `n` (số âm theo dạng bù 2), từ bit cao nhất đến bit thấp nhất.',
          input: 'Một số nguyên `n` (−2<sup>31</sup> ≤ n < 2<sup>31</sup>).',
          output: 'Chuỗi 32 ký tự 0/1.',
          hint: 'Ép sang `unsigned int u = (unsigned int)n;` rồi in `(u >> i) & 1` với `i` từ 31 về 0.',
          solution: c`
            #include <stdio.h>
            int main() {
                int n;
                scanf("%d", &n);
                unsigned int u = (unsigned int)n;
                for (int i = 31; i >= 0; i--) putchar(((u >> i) & 1) ? '1' : '0');
                putchar('\n');
                return 0;
            }`,
          tests: ['5', '0', '-1', '2147483647', '-2147483648', '1024'],
        },
        {
          slug: 'bat-tat-bit',
          title: 'Bật, tắt, đảo bit',
          difficulty: 'easy',
          statement: 'Nhập số nguyên không âm `n` và vị trí bit `k` (bit 0 là bit thấp nhất). In ra 4 dòng: giá trị bit thứ `k` của `n`; `n` sau khi bật bit `k`; `n` sau khi tắt bit `k`; `n` sau khi đảo bit `k`.',
          input: 'Hai số nguyên `n k` (0 ≤ n < 2<sup>31</sup>, 0 ≤ k ≤ 30).',
          output: 'Bốn dòng như mô tả.',
          solution: c`
            #include <stdio.h>
            int main() {
                unsigned int n; int k;
                scanf("%u %d", &n, &k);
                printf("%u\n%u\n%u\n%u\n", (n >> k) & 1u, n | (1u << k), n & ~(1u << k), n ^ (1u << k));
                return 0;
            }`,
          tests: ['10 1', '10 2', '0 0', '2147483647 30', '1 0', '255 7'],
        },
        {
          slug: 'dem-bit-1',
          title: 'Đếm số bit 1',
          difficulty: 'easy',
          statement: 'Với mỗi số nguyên không âm `n`, đếm số bit 1 trong biểu diễn nhị phân của nó.',
          input: 'Dòng 1: `t` (1 ≤ t ≤ 10<sup>5</sup>). `t` dòng tiếp, mỗi dòng một số `n` (0 ≤ n ≤ 10<sup>18</sup>).',
          output: 'Mỗi số in kết quả trên một dòng.',
          hint: 'Mẹo: `n & (n - 1)` xóa bit 1 thấp nhất của `n`. Lặp cho tới khi `n == 0`.',
          solution: c`
            #include <stdio.h>
            int main() {
                int t;
                scanf("%d", &t);
                while (t--) {
                    unsigned long long n; int c = 0;
                    scanf("%llu", &n);
                    while (n) { n &= n - 1; c++; }
                    printf("%d\n", c);
                }
                return 0;
            }`,
          tests: ['3\n5\n0\n255', '1\n1', '2\n1000000000000000000\n576460752303423487', '4\n1024\n1023\n7\n8'],
        },
        {
          slug: 'luy-thua-cua-2',
          title: 'Lũy thừa của 2',
          difficulty: 'easy',
          statement: 'Với mỗi số nguyên `n`, kiểm tra `n` có phải là lũy thừa của 2 (1, 2, 4, 8, ...) không. Nếu đúng in `YES k` với n = 2<sup>k</sup>, ngược lại in `NO`.',
          input: 'Dòng 1: `t` (1 ≤ t ≤ 10<sup>5</sup>). `t` dòng tiếp, mỗi dòng một số `n` (|n| ≤ 10<sup>18</sup>).',
          output: 'Mỗi số in kết quả trên một dòng.',
          hint: '`n > 0 && (n & (n - 1)) == 0`.',
          solution: c`
            #include <stdio.h>
            int main() {
                int t;
                scanf("%d", &t);
                while (t--) {
                    long long n;
                    scanf("%lld", &n);
                    if (n > 0 && (n & (n - 1)) == 0) { int k = 0; while ((1LL << k) != n) k++; printf("YES %d\n", k); }
                    else printf("NO\n");
                }
                return 0;
            }`,
          tests: ['4\n1\n6\n8\n0', '1\n-8', '3\n1152921504606846976\n1152921504606846975\n2', '2\n1024\n1000'],
        },
      ],
    },
    {
      slug: 'ung-dung-bit',
      title: 'Ứng dụng thao tác bit',
      description: 'XOR, mặt nạ bit, duyệt tập con.',
      problems: [
        {
          slug: 'so-xuat-hien-le-lan',
          title: 'Số xuất hiện lẻ lần',
          difficulty: 'medium',
          statement: 'Cho dãy `n` số nguyên, trong đó **đúng một** số xuất hiện lẻ lần, các số còn lại đều xuất hiện chẵn lần. Tìm số đó. Hãy làm với bộ nhớ O(1) bằng phép XOR.',
          input: 'Dòng 1: `n` (1 ≤ n ≤ 10<sup>6</sup>, n lẻ). Dòng 2: `n` số nguyên (|a<sub>i</sub>| ≤ 10<sup>9</sup>).',
          output: 'Số xuất hiện lẻ lần.',
          hint: '`x ^ x = 0` và `x ^ 0 = x`, phép XOR có tính giao hoán và kết hợp.',
          solution: c`
            #include <stdio.h>
            int main() {
                int n, x, r = 0;
                scanf("%d", &n);
                for (int i = 0; i < n; i++) { scanf("%d", &x); r ^= x; }
                printf("%d\n", r);
                return 0;
            }`,
          tests: ['5\n1 2 3 2 1', '1\n-7', '7\n4 4 4 5 5 6 6', '3\n1000000000 -1000000000 1000000000', { input: '200001\n' + Array.from({ length: 100000 }, (_, i) => i * 7 - 300000).concat([123456789], Array.from({ length: 100000 }, (_, i) => (99999 - i) * 7 - 300000)).join(' ') + '\n' }],
        },
        {
          slug: 'duyet-tap-con-bitmask',
          title: 'Liệt kê tập con bằng mặt nạ bit',
          difficulty: 'medium',
          statement: `
            Cho \`n\` số nguyên. Duyệt tất cả các mặt nạ \`mask\` từ 0 đến 2<sup>n</sup> − 1; bit thứ \`i\` của \`mask\` bằng 1 nghĩa là chọn phần tử \`a[i]\`.

            Đếm số tập con có tổng chia hết cho \`m\` (kể cả tập rỗng), và in ra tổng lớn nhất của một tập con có tổng chia hết cho \`m\`.
          `,
          input: 'Dòng 1: `n m` (1 ≤ n ≤ 20, 1 ≤ m ≤ 1000). Dòng 2: `n` số nguyên (|a<sub>i</sub>| ≤ 10<sup>6</sup>).',
          output: 'Hai số: số tập con thỏa mãn và tổng lớn nhất.',
          hint: 'Cẩn thận với tổng âm: trong C, `-7 % 3 == -1`. Kiểm tra chia hết bằng `s % m == 0`.',
          solution: c`
            #include <stdio.h>
            int main() {
                int n, m; long long a[25];
                scanf("%d %d", &n, &m);
                for (int i = 0; i < n; i++) scanf("%lld", &a[i]);
                long long cnt = 0, best = 0;
                for (long long mask = 0; mask < (1LL << n); mask++) {
                    long long s = 0;
                    for (int i = 0; i < n; i++) if ((mask >> i) & 1) s += a[i];
                    if (s % m == 0) { cnt++; if (s > best) best = s; }
                }
                printf("%lld %lld\n", cnt, best);
                return 0;
            }`,
          tests: ['3 3\n1 2 3', '1 5\n5', '4 2\n-1 -2 -3 -4', '5 7\n10 20 30 40 50', '20 1000\n1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 1000000'],
        },
      ],
    },
  ],
};
