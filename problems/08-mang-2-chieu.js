const c = String.raw;

module.exports = {
  slug: 'mang-2-chieu',
  title: 'Mảng hai chiều (Ma trận)',
  icon: '🔢',
  description: 'Nhập xuất ma trận, duyệt theo hàng/cột/đường chéo, phép toán ma trận và các cách duyệt đặc biệt.',
  intro: `
    **Kiến thức cần nhớ**

    - Khai báo: \`int a[100][100];\` — \`a[i][j]\` là phần tử hàng \`i\`, cột \`j\` (đếm từ 0).
    - Duyệt: hai vòng lặp lồng nhau \`for (i...) for (j...)\`.
    - Đường chéo chính: \`i == j\`; đường chéo phụ: \`i + j == n - 1\`.
    - Truyền ma trận vào hàm: \`void xuat(int a[][100], int m, int n)\`.
    - In ma trận: mỗi hàng một dòng, các phần tử cách nhau một khoảng trắng.
  `,
  categories: [
    {
      slug: 'duyet-ma-tran',
      title: 'Duyệt & thống kê ma trận',
      description: 'Tổng hàng, cột, đường chéo, lớn nhất mỗi hàng.',
      problems: [
        {
          slug: 'tong-hang-cot',
          title: 'Tổng từng hàng, từng cột',
          difficulty: 'easy',
          statement: 'Nhập ma trận `m × n`. Dòng 1 in tổng của từng hàng; dòng 2 in tổng của từng cột (cách nhau một khoảng trắng).',
          input: 'Dòng đầu: `m n` (1 ≤ m, n ≤ 100). `m` dòng tiếp theo, mỗi dòng `n` số nguyên (|a<sub>ij</sub>| ≤ 10<sup>6</sup>).',
          output: 'Hai dòng như mô tả.',
          solution: c`
            #include <stdio.h>
            int main() {
                int m, n, a[105][105];
                scanf("%d %d", &m, &n);
                for (int i = 0; i < m; i++) for (int j = 0; j < n; j++) scanf("%d", &a[i][j]);
                for (int i = 0; i < m; i++) { long long s = 0; for (int j = 0; j < n; j++) s += a[i][j]; printf(i ? " %lld" : "%lld", s); }
                printf("\n");
                for (int j = 0; j < n; j++) { long long s = 0; for (int i = 0; i < m; i++) s += a[i][j]; printf(j ? " %lld" : "%lld", s); }
                printf("\n");
                return 0;
            }`,
          tests: ['2 3\n1 2 3\n4 5 6', '1 1\n-5', '3 1\n1\n2\n3', '1 4\n1 -1 1 -1', '3 3\n1000000 1000000 1000000\n0 0 0\n-1 -2 -3'],
        },
        {
          slug: 'duong-cheo',
          title: 'Tổng đường chéo',
          difficulty: 'easy',
          statement: 'Nhập ma trận vuông `n × n`. In ra tổng các phần tử trên đường chéo chính và tổng các phần tử trên đường chéo phụ (cách nhau một khoảng trắng).',
          input: 'Dòng đầu: `n` (1 ≤ n ≤ 100). `n` dòng tiếp theo, mỗi dòng `n` số nguyên.',
          output: 'Hai số: tổng chéo chính và tổng chéo phụ.',
          solution: c`
            #include <stdio.h>
            int main() {
                int n, x; long long c1 = 0, c2 = 0;
                scanf("%d", &n);
                for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) {
                    scanf("%d", &x);
                    if (i == j) c1 += x;
                    if (i + j == n - 1) c2 += x;
                }
                printf("%lld %lld\n", c1, c2);
                return 0;
            }`,
          tests: ['3\n1 2 3\n4 5 6\n7 8 9', '1\n7', '2\n1 2\n3 4', '4\n1 0 0 2\n0 3 4 0\n0 5 6 0\n7 0 0 8'],
        },
        {
          slug: 'max-moi-hang',
          title: 'Phần tử lớn nhất mỗi hàng',
          difficulty: 'easy',
          statement: 'Nhập ma trận `m × n`. Với mỗi hàng, in ra giá trị lớn nhất của hàng đó (mỗi hàng một dòng). Dòng cuối cùng in ra chỉ số (từ 1) của hàng có tổng lớn nhất (nếu nhiều hàng bằng nhau chọn hàng đầu tiên).',
          input: 'Dòng đầu: `m n` (1 ≤ m, n ≤ 100). `m` dòng tiếp theo, mỗi dòng `n` số nguyên.',
          output: '`m + 1` dòng.',
          solution: c`
            #include <stdio.h>
            int main() {
                int m, n, x, best = 1; long long bestSum = 0;
                scanf("%d %d", &m, &n);
                for (int i = 1; i <= m; i++) {
                    int mx = 0; long long s = 0;
                    for (int j = 0; j < n; j++) { scanf("%d", &x); if (j == 0 || x > mx) mx = x; s += x; }
                    printf("%d\n", mx);
                    if (i == 1 || s > bestSum) { bestSum = s; best = i; }
                }
                printf("%d\n", best);
                return 0;
            }`,
          tests: ['3 3\n1 5 3\n9 2 1\n4 4 4', '1 1\n0', '2 2\n-1 -2\n-3 -4', '3 2\n1 1\n2 0\n0 2'],
        },
        {
          slug: 'dem-nguyen-to-ma-tran',
          title: 'Số nguyên tố trong ma trận',
          difficulty: 'medium',
          statement: 'Nhập ma trận `m × n`. Đếm số phần tử là số nguyên tố, và in ra vị trí (hàng, cột — tính từ 1) của các số nguyên tố theo thứ tự duyệt từng hàng, mỗi vị trí trên một dòng.',
          input: 'Dòng đầu: `m n` (1 ≤ m, n ≤ 50). `m` dòng tiếp theo, mỗi dòng `n` số nguyên (|a<sub>ij</sub>| ≤ 10<sup>6</sup>).',
          output: 'Dòng 1: số lượng. Các dòng tiếp theo: `hang cot`.',
          solution: c`
            #include <stdio.h>
            int isPrime(int n) { if (n < 2) return 0; for (int i = 2; i * i <= n; i++) if (n % i == 0) return 0; return 1; }
            int main() {
                int m, n, a[55][55], cnt = 0;
                scanf("%d %d", &m, &n);
                for (int i = 0; i < m; i++) for (int j = 0; j < n; j++) { scanf("%d", &a[i][j]); cnt += isPrime(a[i][j]); }
                printf("%d\n", cnt);
                for (int i = 0; i < m; i++) for (int j = 0; j < n; j++) if (isPrime(a[i][j])) printf("%d %d\n", i + 1, j + 1);
                return 0;
            }`,
          tests: ['2 3\n2 4 5\n6 7 1', '1 1\n1', '2 2\n4 6\n8 9', '3 3\n-2 3 -5\n11 0 13\n999983 1000000 17'],
        },
      ],
    },
    {
      slug: 'phep-toan-ma-tran',
      title: 'Phép toán ma trận',
      description: 'Cộng, nhân, chuyển vị ma trận.',
      problems: [
        {
          slug: 'chuyen-vi',
          title: 'Ma trận chuyển vị',
          difficulty: 'easy',
          statement: 'Nhập ma trận `m × n`, in ra ma trận chuyển vị kích thước `n × m` (hàng thành cột).',
          input: 'Dòng đầu: `m n` (1 ≤ m, n ≤ 100). `m` dòng tiếp theo, mỗi dòng `n` số nguyên.',
          output: 'Ma trận chuyển vị.',
          solution: c`
            #include <stdio.h>
            int main() {
                int m, n, a[105][105];
                scanf("%d %d", &m, &n);
                for (int i = 0; i < m; i++) for (int j = 0; j < n; j++) scanf("%d", &a[i][j]);
                for (int j = 0; j < n; j++) {
                    for (int i = 0; i < m; i++) printf(i ? " %d" : "%d", a[i][j]);
                    printf("\n");
                }
                return 0;
            }`,
          tests: ['2 3\n1 2 3\n4 5 6', '1 1\n9', '1 4\n1 2 3 4', '3 3\n1 2 3\n4 5 6\n7 8 9'],
        },
        {
          slug: 'cong-ma-tran',
          title: 'Cộng hai ma trận',
          difficulty: 'easy',
          statement: 'Nhập hai ma trận A và B cùng kích thước `m × n`, in ra ma trận C = A + B.',
          input: 'Dòng đầu: `m n` (1 ≤ m, n ≤ 100). Tiếp theo là `m` dòng của A, rồi `m` dòng của B.',
          output: 'Ma trận C.',
          solution: c`
            #include <stdio.h>
            int main() {
                int m, n, a[105][105], x;
                scanf("%d %d", &m, &n);
                for (int i = 0; i < m; i++) for (int j = 0; j < n; j++) scanf("%d", &a[i][j]);
                for (int i = 0; i < m; i++) for (int j = 0; j < n; j++) { scanf("%d", &x); a[i][j] += x; }
                for (int i = 0; i < m; i++) { for (int j = 0; j < n; j++) printf(j ? " %d" : "%d", a[i][j]); printf("\n"); }
                return 0;
            }`,
          tests: ['2 2\n1 2\n3 4\n5 6\n7 8', '1 1\n-1\n1', '2 3\n1 1 1\n1 1 1\n-1 0 1\n2 3 4', '3 1\n1\n2\n3\n10\n20\n30'],
        },
        {
          slug: 'nhan-ma-tran',
          title: 'Nhân hai ma trận',
          difficulty: 'medium',
          statement: `
            Cho ma trận A kích thước \`m × n\` và B kích thước \`n × p\`. Tính C = A × B kích thước \`m × p\` với

            C<sub>ij</sub> = Σ<sub>k</sub> A<sub>ik</sub> × B<sub>kj</sub>
          `,
          input: 'Dòng đầu: `m n p` (1 ≤ m, n, p ≤ 50). Tiếp theo `m` dòng của A (mỗi dòng `n` số), rồi `n` dòng của B (mỗi dòng `p` số). |phần tử| ≤ 10<sup>4</sup>.',
          output: 'Ma trận C.',
          hint: 'Phần tử của C có thể vượt quá `int`, dùng `long long`.',
          solution: c`
            #include <stdio.h>
            int main() {
                int m, n, p; long long A[55][55], B[55][55];
                scanf("%d %d %d", &m, &n, &p);
                for (int i = 0; i < m; i++) for (int j = 0; j < n; j++) scanf("%lld", &A[i][j]);
                for (int i = 0; i < n; i++) for (int j = 0; j < p; j++) scanf("%lld", &B[i][j]);
                for (int i = 0; i < m; i++) {
                    for (int j = 0; j < p; j++) {
                        long long s = 0;
                        for (int k = 0; k < n; k++) s += A[i][k] * B[k][j];
                        printf(j ? " %lld" : "%lld", s);
                    }
                    printf("\n");
                }
                return 0;
            }`,
          tests: ['2 2 2\n1 2\n3 4\n5 6\n7 8', '1 3 1\n1 2 3\n4\n5\n6', '2 3 2\n1 0 2\n-1 3 1\n3 1\n2 1\n1 0', '1 1 1\n10000\n10000', '3 3 3\n1 0 0\n0 1 0\n0 0 1\n9 8 7\n6 5 4\n3 2 1'],
        },
        {
          slug: 'ma-tran-doi-xung',
          title: 'Ma trận đối xứng',
          difficulty: 'easy',
          statement: 'Ma trận vuông A được gọi là đối xứng nếu A<sub>ij</sub> = A<sub>ji</sub> với mọi i, j. Nhập ma trận `n × n`, in `YES` nếu nó đối xứng, ngược lại in `NO`.',
          input: 'Dòng đầu: `n` (1 ≤ n ≤ 100). `n` dòng tiếp theo, mỗi dòng `n` số nguyên.',
          output: '`YES` hoặc `NO`.',
          solution: c`
            #include <stdio.h>
            int main() {
                int n, a[105][105], ok = 1;
                scanf("%d", &n);
                for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) scanf("%d", &a[i][j]);
                for (int i = 0; i < n && ok; i++) for (int j = 0; j < i; j++) if (a[i][j] != a[j][i]) { ok = 0; break; }
                printf(ok ? "YES\n" : "NO\n");
                return 0;
            }`,
          tests: ['3\n1 2 3\n2 5 6\n3 6 9', '3\n1 2 3\n4 5 6\n7 8 9', '1\n5', '2\n0 1\n1 0', '2\n0 1\n2 0'],
        },
      ],
    },
    {
      slug: 'duyet-dac-biet',
      title: 'Duyệt ma trận đặc biệt',
      description: 'Xoắn ốc, zigzag, điểm yên ngựa, xoay ma trận.',
      problems: [
        {
          slug: 'xoan-oc',
          title: 'Duyệt xoắn ốc',
          difficulty: 'hard',
          statement: `
            In các phần tử của ma trận \`m × n\` theo thứ tự **xoắn ốc** theo chiều kim đồng hồ, bắt đầu từ góc trên bên trái.

            Ví dụ:
            \`\`\`
            1 2 3
            4 5 6
            7 8 9
            \`\`\`
            → \`1 2 3 6 9 8 7 4 5\`
          `,
          input: 'Dòng đầu: `m n` (1 ≤ m, n ≤ 100). `m` dòng tiếp theo, mỗi dòng `n` số nguyên.',
          output: 'Các phần tử theo thứ tự xoắn ốc trên một dòng.',
          hint: 'Duy trì 4 biên `top, bottom, left, right` và thu hẹp sau mỗi lượt đi.',
          solution: c`
            #include <stdio.h>
            int main() {
                int m, n, a[105][105], first = 1;
                scanf("%d %d", &m, &n);
                for (int i = 0; i < m; i++) for (int j = 0; j < n; j++) scanf("%d", &a[i][j]);
                int top = 0, bot = m - 1, l = 0, r = n - 1;
                #define OUT(v) do { printf(first ? "%d" : " %d", v); first = 0; } while (0)
                while (top <= bot && l <= r) {
                    for (int j = l; j <= r; j++) OUT(a[top][j]);
                    top++;
                    for (int i = top; i <= bot; i++) OUT(a[i][r]);
                    r--;
                    if (top <= bot) { for (int j = r; j >= l; j--) OUT(a[bot][j]); bot--; }
                    if (l <= r) { for (int i = bot; i >= top; i--) OUT(a[i][l]); l++; }
                }
                printf("\n");
                return 0;
            }`,
          tests: ['3 3\n1 2 3\n4 5 6\n7 8 9', '1 1\n5', '3 4\n1 2 3 4\n5 6 7 8\n9 10 11 12', '4 1\n1\n2\n3\n4', '1 4\n1 2 3 4', '4 4\n1 2 3 4\n5 6 7 8\n9 10 11 12\n13 14 15 16', '2 3\n1 2 3\n4 5 6'],
        },
        {
          slug: 'diem-yen-ngua',
          title: 'Điểm yên ngựa',
          difficulty: 'medium',
          statement: 'Phần tử `a[i][j]` được gọi là **điểm yên ngựa** nếu nó là phần tử nhỏ nhất trên hàng `i` và lớn nhất trên cột `j`. In ra các điểm yên ngựa dạng `hang cot gia_tri` (tính từ 1, thứ tự duyệt theo hàng). Nếu không có, in `-1`.',
          input: 'Dòng đầu: `m n` (1 ≤ m, n ≤ 100). `m` dòng tiếp theo, mỗi dòng `n` số nguyên.',
          output: 'Mỗi điểm yên ngựa trên một dòng, hoặc `-1`.',
          solution: c`
            #include <stdio.h>
            int main() {
                int m, n, a[105][105], found = 0;
                scanf("%d %d", &m, &n);
                for (int i = 0; i < m; i++) for (int j = 0; j < n; j++) scanf("%d", &a[i][j]);
                for (int i = 0; i < m; i++) for (int j = 0; j < n; j++) {
                    int ok = 1;
                    for (int k = 0; k < n && ok; k++) if (a[i][k] < a[i][j]) ok = 0;
                    for (int k = 0; k < m && ok; k++) if (a[k][j] > a[i][j]) ok = 0;
                    if (ok) { printf("%d %d %d\n", i + 1, j + 1, a[i][j]); found = 1; }
                }
                if (!found) printf("-1\n");
                return 0;
            }`,
          tests: ['3 3\n3 8 9\n1 2 3\n2 5 4', '2 2\n1 2\n2 1', '1 1\n7', '2 2\n5 5\n5 5', '3 2\n10 20\n5 6\n1 30'],
        },
        {
          slug: 'xoay-ma-tran-90',
          title: 'Xoay ma trận 90°',
          difficulty: 'medium',
          statement: 'Xoay ma trận `m × n` một góc 90° theo chiều kim đồng hồ và in kết quả (kích thước `n × m`).',
          input: 'Dòng đầu: `m n` (1 ≤ m, n ≤ 100). `m` dòng tiếp theo, mỗi dòng `n` số nguyên.',
          output: 'Ma trận sau khi xoay.',
          hint: 'Phần tử hàng `i`, cột `j` của ma trận mới là `a[m - 1 - j][i]`.',
          solution: c`
            #include <stdio.h>
            int main() {
                int m, n, a[105][105];
                scanf("%d %d", &m, &n);
                for (int i = 0; i < m; i++) for (int j = 0; j < n; j++) scanf("%d", &a[i][j]);
                for (int i = 0; i < n; i++) {
                    for (int j = 0; j < m; j++) printf(j ? " %d" : "%d", a[m - 1 - j][i]);
                    printf("\n");
                }
                return 0;
            }`,
          tests: ['3 3\n1 2 3\n4 5 6\n7 8 9', '2 3\n1 2 3\n4 5 6', '1 1\n1', '1 3\n1 2 3', '3 1\n1\n2\n3'],
        },
        {
          slug: 'ma-tran-xoan-oc-sinh',
          title: 'Sinh ma trận xoắn ốc',
          difficulty: 'hard',
          statement: `
            Nhập \`n\`, tạo ma trận \`n × n\` chứa các số từ 1 đến n² được điền theo hình xoắn ốc (theo chiều kim đồng hồ,
            bắt đầu từ góc trên trái), rồi in ra.

            Ví dụ n = 3:
            \`\`\`
            1 2 3
            8 9 4
            7 6 5
            \`\`\`
          `,
          input: 'Một số nguyên `n` (1 ≤ n ≤ 50).',
          output: 'Ma trận xoắn ốc.',
          solution: c`
            #include <stdio.h>
            int main() {
                int n, a[55][55], v = 1;
                scanf("%d", &n);
                int top = 0, bot = n - 1, l = 0, r = n - 1;
                while (v <= n * n) {
                    for (int j = l; j <= r; j++) a[top][j] = v++;
                    top++;
                    for (int i = top; i <= bot; i++) a[i][r] = v++;
                    r--;
                    for (int j = r; j >= l; j--) a[bot][j] = v++;
                    bot--;
                    for (int i = bot; i >= top; i--) a[i][l] = v++;
                    l++;
                }
                for (int i = 0; i < n; i++) { for (int j = 0; j < n; j++) printf(j ? " %d" : "%d", a[i][j]); printf("\n"); }
                return 0;
            }`,
          tests: ['3', '1', '2', '4', '7', '50'],
        },
      ],
    },
  ],
};
