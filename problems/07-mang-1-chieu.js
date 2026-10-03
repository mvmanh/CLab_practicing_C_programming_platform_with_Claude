const c = String.raw;

module.exports = {
  slug: 'mang-1-chieu',
  title: 'Mảng một chiều',
  icon: '📊',
  description: 'Khai báo, duyệt mảng; thống kê, tìm kiếm, sắp xếp, thêm/xóa phần tử và các kỹ thuật trên mảng.',
  intro: `
    **Kiến thức cần nhớ**

    - Khai báo: \`int a[1000];\` — chỉ số từ \`0\` đến \`n − 1\`. Truy cập ngoài phạm vi là lỗi nghiêm trọng (không báo lỗi khi biên dịch!).
    - Nhập mảng: \`for (int i = 0; i < n; i++) scanf("%d", &a[i]);\`
    - Truyền mảng vào hàm: \`void xuat(int a[], int n)\` — hàm có thể sửa trực tiếp các phần tử.
    - Mảng lớn (≥ 10<sup>5</sup> phần tử) nên khai báo **toàn cục** để tránh tràn stack.
    - In mảng: các phần tử cách nhau một khoảng trắng, xuống dòng ở cuối.
  `,
  categories: [
    {
      slug: 'duyet-thong-ke',
      title: 'Duyệt & thống kê',
      description: 'Tổng, trung bình, lớn nhất/nhỏ nhất, đếm theo điều kiện.',
      problems: [
        {
          slug: 'tong-trung-binh-mang',
          title: 'Tổng và trung bình cộng',
          difficulty: 'easy',
          statement: 'Nhập mảng `n` số nguyên. In ra tổng các phần tử (dòng 1) và trung bình cộng với 2 chữ số thập phân (dòng 2).',
          input: 'Dòng 1: `n` (1 ≤ n ≤ 10<sup>5</sup>). Dòng 2: `n` số nguyên (|a<sub>i</sub>| ≤ 10<sup>9</sup>).',
          output: 'Hai dòng như mô tả.',
          solution: c`
            #include <stdio.h>
            int main() {
                int n; long long s = 0, x;
                scanf("%d", &n);
                for (int i = 0; i < n; i++) { scanf("%lld", &x); s += x; }
                printf("%lld\n%.2f\n", s, (double)s / n);
                return 0;
            }`,
          tests: ['5\n1 2 3 4 5', '1\n-7', '4\n1 2 3 5', '3\n1000000000 1000000000 1000000000', '6\n-1 -2 -3 4 5 6', '2\n0 1'],
        },
        {
          slug: 'max-min-vi-tri',
          title: 'Lớn nhất, nhỏ nhất và vị trí',
          difficulty: 'easy',
          statement: `
            Nhập mảng \`n\` số nguyên. In ra:

            - Dòng 1: giá trị lớn nhất và vị trí **đầu tiên** của nó (vị trí tính từ 1).
            - Dòng 2: giá trị nhỏ nhất và vị trí **cuối cùng** của nó.
          `,
          input: 'Dòng 1: `n` (1 ≤ n ≤ 10<sup>5</sup>). Dòng 2: `n` số nguyên (|a<sub>i</sub>| ≤ 10<sup>9</sup>).',
          output: 'Hai dòng như mô tả.',
          solution: c`
            #include <stdio.h>
            int a[100005];
            int main() {
                int n;
                scanf("%d", &n);
                for (int i = 0; i < n; i++) scanf("%d", &a[i]);
                int imax = 0, imin = 0;
                for (int i = 1; i < n; i++) {
                    if (a[i] > a[imax]) imax = i;
                    if (a[i] <= a[imin]) imin = i;
                }
                printf("%d %d\n%d %d\n", a[imax], imax + 1, a[imin], imin + 1);
                return 0;
            }`,
          tests: ['5\n3 9 1 9 1', '1\n42', '4\n-1 -1 -1 -1', '6\n5 4 3 2 1 0', '7\n-1000000000 1000000000 0 1000000000 -1000000000 3 3'],
        },
        {
          slug: 'dem-chan-le-am',
          title: 'Đếm theo điều kiện',
          difficulty: 'easy',
          statement: 'Nhập mảng `n` số nguyên. In ra trên một dòng: số lượng số chẵn, số lẻ, số âm, số chia hết cho 3.',
          input: 'Dòng 1: `n` (1 ≤ n ≤ 10<sup>5</sup>). Dòng 2: `n` số nguyên (|a<sub>i</sub>| ≤ 10<sup>9</sup>).',
          output: 'Bốn số nguyên cách nhau một khoảng trắng.',
          solution: c`
            #include <stdio.h>
            int main() {
                int n, x, ch = 0, le = 0, am = 0, b3 = 0;
                scanf("%d", &n);
                for (int i = 0; i < n; i++) {
                    scanf("%d", &x);
                    if (x % 2 == 0) ch++; else le++;
                    if (x < 0) am++;
                    if (x % 3 == 0) b3++;
                }
                printf("%d %d %d %d\n", ch, le, am, b3);
                return 0;
            }`,
          tests: ['6\n1 2 3 -4 -5 6', '1\n0', '5\n-3 -6 -9 -1 -2', '4\n7 11 13 17', '3\n1000000000 -999999999 2'],
        },
        {
          slug: 'phan-tu-lon-hon-trung-binh',
          title: 'Phần tử lớn hơn trung bình',
          difficulty: 'easy',
          statement: 'Nhập mảng `n` số nguyên. In ra các phần tử **lớn hơn** trung bình cộng của mảng (giữ nguyên thứ tự). Nếu không có, in `-1`.',
          input: 'Dòng 1: `n` (1 ≤ n ≤ 10<sup>5</sup>). Dòng 2: `n` số nguyên (|a<sub>i</sub>| ≤ 10<sup>6</sup>).',
          output: 'Các phần tử thỏa mãn, cách nhau một khoảng trắng; hoặc `-1`.',
          hint: 'Cần duyệt mảng hai lần: lần 1 tính trung bình, lần 2 in. So sánh `a[i] * n > tong` để tránh sai số số thực.',
          solution: c`
            #include <stdio.h>
            long long a[100005];
            int main() {
                int n, found = 0; long long s = 0;
                scanf("%d", &n);
                for (int i = 0; i < n; i++) { scanf("%lld", &a[i]); s += a[i]; }
                for (int i = 0; i < n; i++) if (a[i] * n > s) { printf(found ? " %lld" : "%lld", a[i]); found = 1; }
                printf(found ? "\n" : "-1\n");
                return 0;
            }`,
          tests: ['5\n1 2 3 4 5', '3\n4 4 4', '4\n-5 -1 0 10', '1\n9', '6\n1 1 1 1 1 2'],
        },
      ],
    },
    {
      slug: 'tim-kiem',
      title: 'Tìm kiếm',
      description: 'Tìm kiếm tuyến tính và tìm kiếm nhị phân.',
      problems: [
        {
          slug: 'tim-kiem-tuyen-tinh',
          title: 'Tìm kiếm tuyến tính',
          difficulty: 'easy',
          statement: 'Cho mảng `n` số nguyên và số `x`. In ra tất cả các vị trí (tính từ 1) mà `a[i] = x`. Nếu không có, in `-1`.',
          input: 'Dòng 1: `n x` (1 ≤ n ≤ 10<sup>5</sup>). Dòng 2: `n` số nguyên.',
          output: 'Các vị trí cách nhau một khoảng trắng, hoặc `-1`.',
          solution: c`
            #include <stdio.h>
            int main() {
                int n, x, v, found = 0;
                scanf("%d %d", &n, &x);
                for (int i = 1; i <= n; i++) {
                    scanf("%d", &v);
                    if (v == x) { printf(found ? " %d" : "%d", i); found = 1; }
                }
                printf(found ? "\n" : "-1\n");
                return 0;
            }`,
          tests: ['6 3\n1 3 5 3 7 3', '3 9\n1 2 3', '1 5\n5', '5 -2\n-2 -2 -2 -2 -2', '4 0\n1 0 1 0'],
        },
        {
          slug: 'tim-kiem-nhi-phan',
          title: 'Tìm kiếm nhị phân',
          difficulty: 'medium',
          statement: `
            Cho mảng \`n\` số nguyên **đã sắp xếp tăng dần** (các phần tử phân biệt) và \`q\` truy vấn. Mỗi truy vấn là một số \`x\`:
            in ra vị trí của \`x\` trong mảng (tính từ 1), hoặc \`-1\` nếu không có.

            Với n, q lên tới 10<sup>5</sup>, tìm kiếm tuyến tính cho mỗi truy vấn sẽ quá chậm — hãy dùng **tìm kiếm nhị phân**.
          `,
          input: 'Dòng 1: `n q`. Dòng 2: `n` số nguyên tăng dần. Dòng 3: `q` số nguyên là các truy vấn. (1 ≤ n, q ≤ 10<sup>5</sup>, |giá trị| ≤ 10<sup>9</sup>)',
          output: 'Mỗi truy vấn in kết quả trên một dòng.',
          hint: '`lo = 0, hi = n - 1; while (lo <= hi) { mid = (lo + hi) / 2; ... }`',
          timeLimitMs: 1000,
          solution: c`
            #include <stdio.h>
            int a[100005];
            int main() {
                int n, q, x;
                scanf("%d %d", &n, &q);
                for (int i = 0; i < n; i++) scanf("%d", &a[i]);
                while (q--) {
                    scanf("%d", &x);
                    int lo = 0, hi = n - 1, pos = -1;
                    while (lo <= hi) {
                        int mid = lo + (hi - lo) / 2;
                        if (a[mid] == x) { pos = mid + 1; break; }
                        if (a[mid] < x) lo = mid + 1; else hi = mid - 1;
                    }
                    printf("%d\n", pos);
                }
                return 0;
            }`,
          tests: [
            '5 3\n1 3 5 7 9\n7 4 1',
            '1 2\n10\n10 -10',
            '6 4\n-9 -4 0 2 8 100\n100 -9 3 0',
            '3 3\n1 2 3\n0 4 2',
            { input: genBinarySearch() },
          ],
        },
        {
          slug: 'phan-tu-xuat-hien-nhieu',
          title: 'Phần tử xuất hiện nhiều nhất',
          difficulty: 'medium',
          statement: 'Cho mảng `n` số nguyên trong đoạn [0, 1000]. Tìm giá trị xuất hiện nhiều lần nhất và số lần xuất hiện. Nếu có nhiều giá trị cùng số lần, chọn giá trị **nhỏ nhất**.',
          input: 'Dòng 1: `n` (1 ≤ n ≤ 10<sup>5</sup>). Dòng 2: `n` số nguyên trong [0, 1000].',
          output: 'Giá trị và số lần xuất hiện.',
          hint: 'Dùng mảng đếm `int dem[1001] = {0};` và tăng `dem[a[i]]++`.',
          solution: c`
            #include <stdio.h>
            int cnt[1001];
            int main() {
                int n, x;
                scanf("%d", &n);
                for (int i = 0; i < n; i++) { scanf("%d", &x); cnt[x]++; }
                int best = 0;
                for (int v = 1; v <= 1000; v++) if (cnt[v] > cnt[best]) best = v;
                printf("%d %d\n", best, cnt[best]);
                return 0;
            }`,
          tests: ['7\n1 2 2 3 3 3 2', '1\n1000', '4\n5 6 7 8', '6\n0 0 1000 1000 500 500', '5\n9 9 9 9 9'],
        },
      ],
    },
    {
      slug: 'sap-xep-mang',
      title: 'Sắp xếp',
      description: 'Sắp xếp tăng/giảm và sắp xếp theo điều kiện.',
      problems: [
        {
          slug: 'sap-xep-tang-dan',
          title: 'Sắp xếp tăng dần',
          difficulty: 'easy',
          statement: 'Nhập mảng `n` số nguyên, sắp xếp tăng dần và in ra. Hãy tự cài đặt một thuật toán sắp xếp (nổi bọt, chọn, chèn...).',
          input: 'Dòng 1: `n` (1 ≤ n ≤ 1000). Dòng 2: `n` số nguyên (|a<sub>i</sub>| ≤ 10<sup>9</sup>).',
          output: 'Mảng sau khi sắp xếp.',
          solution: c`
            #include <stdio.h>
            int main() {
                int n, a[1005];
                scanf("%d", &n);
                for (int i = 0; i < n; i++) scanf("%d", &a[i]);
                for (int i = 0; i < n - 1; i++)
                    for (int j = i + 1; j < n; j++)
                        if (a[j] < a[i]) { int t = a[i]; a[i] = a[j]; a[j] = t; }
                for (int i = 0; i < n; i++) printf(i ? " %d" : "%d", a[i]);
                printf("\n");
                return 0;
            }`,
          tests: ['5\n5 2 8 1 9', '1\n3', '4\n4 3 2 1', '6\n1 1 1 0 0 0', '5\n-1000000000 1000000000 0 -5 5'],
        },
        {
          slug: 'chan-truoc-le-sau',
          title: 'Chẵn trước, lẻ sau',
          difficulty: 'medium',
          statement: 'Sắp xếp mảng sao cho các số **chẵn** đứng trước, **lẻ** đứng sau; các số chẵn sắp xếp tăng dần, các số lẻ sắp xếp giảm dần.',
          input: 'Dòng 1: `n` (1 ≤ n ≤ 1000). Dòng 2: `n` số nguyên (|a<sub>i</sub>| ≤ 10<sup>6</sup>).',
          output: 'Mảng sau khi sắp xếp.',
          solution: c`
            #include <stdio.h>
            int cmpKey(int x, int y) {
                int ex = x % 2 == 0, ey = y % 2 == 0;
                if (ex != ey) return ex ? -1 : 1;
                if (ex) return x < y ? -1 : x > y;
                return x > y ? -1 : x < y;
            }
            int main() {
                int n, a[1005];
                scanf("%d", &n);
                for (int i = 0; i < n; i++) scanf("%d", &a[i]);
                for (int i = 1; i < n; i++) {
                    int v = a[i], j = i - 1;
                    while (j >= 0 && cmpKey(a[j], v) > 0) { a[j + 1] = a[j]; j--; }
                    a[j + 1] = v;
                }
                for (int i = 0; i < n; i++) printf(i ? " %d" : "%d", a[i]);
                printf("\n");
                return 0;
            }`,
          tests: ['7\n1 2 3 4 5 6 7', '3\n2 4 6', '3\n1 3 5', '6\n-3 -2 -1 0 1 2', '1\n0'],
        },
        {
          slug: 'sap-xep-qsort',
          title: 'Sắp xếp bằng qsort',
          difficulty: 'medium',
          statement: `
            Cho mảng \`n\` số nguyên với \`n\` lên tới 2 × 10<sup>5</sup>. Thuật toán O(n²) sẽ quá thời gian — hãy dùng hàm
            \`qsort\` trong \`<stdlib.h>\` để sắp xếp **giảm dần** và in ra.
          `,
          input: 'Dòng 1: `n` (1 ≤ n ≤ 2 × 10<sup>5</sup>). Dòng 2: `n` số nguyên (|a<sub>i</sub>| ≤ 10<sup>9</sup>).',
          output: 'Mảng sau khi sắp xếp giảm dần.',
          hint: 'Hàm so sánh: `int cmp(const void *a, const void *b) { int x = *(int*)a, y = *(int*)b; return (x < y) - (x > y); }` — tránh viết `y - x` vì có thể tràn số.',
          timeLimitMs: 1500,
          solution: c`
            #include <stdio.h>
            #include <stdlib.h>
            int a[200005];
            int cmp(const void *p, const void *q) { int x = *(const int *)p, y = *(const int *)q; return (x < y) - (x > y); }
            int main() {
                int n;
                scanf("%d", &n);
                for (int i = 0; i < n; i++) scanf("%d", &a[i]);
                qsort(a, n, sizeof(int), cmp);
                for (int i = 0; i < n; i++) printf(i ? " %d" : "%d", a[i]);
                printf("\n");
                return 0;
            }`,
          tests: ['5\n3 1 4 1 5', '1\n-1', '4\n-2147483647 2147483647 0 -1', { input: genLargeArray(100000, 12345) }],
        },
      ],
    },
    {
      slug: 'bien-doi-mang',
      title: 'Thêm, xóa & biến đổi mảng',
      description: 'Đảo ngược, chèn, xóa, xoay, loại bỏ trùng lặp.',
      problems: [
        {
          slug: 'dao-nguoc-mang',
          title: 'Đảo ngược mảng',
          difficulty: 'easy',
          statement: 'Đảo ngược thứ tự các phần tử của mảng **ngay trên mảng đó** (không dùng mảng phụ) rồi in ra.',
          input: 'Dòng 1: `n` (1 ≤ n ≤ 10<sup>5</sup>). Dòng 2: `n` số nguyên.',
          output: 'Mảng sau khi đảo ngược.',
          solution: c`
            #include <stdio.h>
            int a[100005];
            int main() {
                int n;
                scanf("%d", &n);
                for (int i = 0; i < n; i++) scanf("%d", &a[i]);
                for (int i = 0, j = n - 1; i < j; i++, j--) { int t = a[i]; a[i] = a[j]; a[j] = t; }
                for (int i = 0; i < n; i++) printf(i ? " %d" : "%d", a[i]);
                printf("\n");
                return 0;
            }`,
          tests: ['5\n1 2 3 4 5', '1\n7', '2\n1 2', '6\n6 5 4 3 2 1', '4\n-1 0 -1 0'],
        },
        {
          slug: 'chen-phan-tu',
          title: 'Chèn phần tử vào vị trí k',
          difficulty: 'easy',
          statement: 'Cho mảng `n` số nguyên, chèn giá trị `x` vào vị trí `k` (tính từ 1, phần tử mới sẽ là `a[k]` sau khi chèn; `k = n + 1` nghĩa là chèn vào cuối). In mảng sau khi chèn.',
          input: 'Dòng 1: `n` (1 ≤ n ≤ 1000). Dòng 2: `n` số nguyên. Dòng 3: `k x` (1 ≤ k ≤ n + 1).',
          output: 'Mảng sau khi chèn.',
          hint: 'Dời các phần tử từ cuối về vị trí `k` sang phải một ô, sau đó gán `a[k-1] = x` và tăng `n`.',
          solution: c`
            #include <stdio.h>
            int main() {
                int n, a[1005], k, x;
                scanf("%d", &n);
                for (int i = 0; i < n; i++) scanf("%d", &a[i]);
                scanf("%d %d", &k, &x);
                for (int i = n; i >= k; i--) a[i] = a[i - 1];
                a[k - 1] = x; n++;
                for (int i = 0; i < n; i++) printf(i ? " %d" : "%d", a[i]);
                printf("\n");
                return 0;
            }`,
          tests: ['5\n1 2 3 4 5\n3 99', '3\n1 2 3\n1 0', '3\n1 2 3\n4 4', '1\n5\n1 -5', '4\n7 7 7 7\n2 8'],
        },
        {
          slug: 'xoa-phan-tu-x',
          title: 'Xóa tất cả phần tử bằng x',
          difficulty: 'medium',
          statement: 'Xóa khỏi mảng tất cả các phần tử có giá trị bằng `x` (giữ nguyên thứ tự các phần tử còn lại). In mảng sau khi xóa, hoặc `EMPTY` nếu mảng rỗng.',
          input: 'Dòng 1: `n x` (1 ≤ n ≤ 10<sup>5</sup>). Dòng 2: `n` số nguyên.',
          output: 'Mảng sau khi xóa hoặc `EMPTY`.',
          hint: 'Kỹ thuật hai con trỏ: duyệt `i` và ghi các phần tử khác `x` vào vị trí `k`, sau đó `n = k`.',
          solution: c`
            #include <stdio.h>
            int a[100005];
            int main() {
                int n, x, k = 0;
                scanf("%d %d", &n, &x);
                for (int i = 0; i < n; i++) scanf("%d", &a[i]);
                for (int i = 0; i < n; i++) if (a[i] != x) a[k++] = a[i];
                if (!k) printf("EMPTY\n");
                else { for (int i = 0; i < k; i++) printf(i ? " %d" : "%d", a[i]); printf("\n"); }
                return 0;
            }`,
          tests: ['7 3\n1 3 2 3 3 4 3', '3 5\n5 5 5', '4 9\n1 2 3 4', '1 0\n1', '6 -1\n-1 2 -1 2 -1 2'],
        },
        {
          slug: 'xoay-mang',
          title: 'Xoay mảng sang trái k bước',
          difficulty: 'medium',
          statement: 'Xoay mảng sang trái `k` bước: mỗi bước, phần tử đầu tiên được chuyển xuống cuối mảng. Lưu ý `k` có thể rất lớn.',
          input: 'Dòng 1: `n k` (1 ≤ n ≤ 10<sup>5</sup>, 0 ≤ k ≤ 10<sup>18</sup>). Dòng 2: `n` số nguyên.',
          output: 'Mảng sau khi xoay.',
          hint: 'Xoay `n` bước thì mảng trở về như cũ, nên chỉ cần xoay `k % n` bước. Phần tử mới ở vị trí `i` là `a[(i + k) % n]`.',
          solution: c`
            #include <stdio.h>
            int a[100005];
            int main() {
                int n; long long k;
                scanf("%d %lld", &n, &k);
                for (int i = 0; i < n; i++) scanf("%d", &a[i]);
                k %= n;
                for (int i = 0; i < n; i++) printf(i ? " %d" : "%d", a[(i + k) % n]);
                printf("\n");
                return 0;
            }`,
          tests: ['5 2\n1 2 3 4 5', '3 0\n1 2 3', '3 3\n1 2 3', '4 1000000000000000001\n1 2 3 4', '1 99\n7', '6 4\n6 5 4 3 2 1'],
        },
        {
          slug: 'loai-bo-trung-lap',
          title: 'Loại bỏ phần tử trùng lặp',
          difficulty: 'medium',
          statement: 'Cho mảng `n` số nguyên. Chỉ giữ lại **lần xuất hiện đầu tiên** của mỗi giá trị (giữ nguyên thứ tự). In ra số phần tử còn lại và mảng kết quả.',
          input: 'Dòng 1: `n` (1 ≤ n ≤ 2000). Dòng 2: `n` số nguyên (|a<sub>i</sub>| ≤ 10<sup>9</sup>).',
          output: 'Dòng 1: số phần tử còn lại. Dòng 2: mảng kết quả.',
          solution: c`
            #include <stdio.h>
            int main() {
                int n, a[2005], k = 0;
                scanf("%d", &n);
                for (int i = 0; i < n; i++) {
                    int x, dup = 0;
                    scanf("%d", &x);
                    for (int j = 0; j < k; j++) if (a[j] == x) { dup = 1; break; }
                    if (!dup) a[k++] = x;
                }
                printf("%d\n", k);
                for (int i = 0; i < k; i++) printf(i ? " %d" : "%d", a[i]);
                printf("\n");
                return 0;
            }`,
          tests: ['8\n1 2 1 3 2 4 1 5', '1\n7', '5\n9 9 9 9 9', '6\n-1 1 -1 1 0 0', '4\n4 3 2 1'],
        },
      ],
    },
    {
      slug: 'ky-thuat-mang',
      title: 'Kỹ thuật trên mảng',
      description: 'Mảng cộng dồn, đoạn con, hai con trỏ.',
      problems: [
        {
          slug: 'tong-doan-con-lon-nhat',
          title: 'Đoạn con có tổng lớn nhất',
          difficulty: 'hard',
          statement: `
            Cho mảng \`n\` số nguyên. Tìm **đoạn con liên tiếp** (ít nhất 1 phần tử) có tổng lớn nhất, in ra tổng đó.

            Với n = 10<sup>5</sup>, thuật toán O(n²) sẽ quá chậm. Hãy tìm hiểu **thuật toán Kadane** (O(n)).
          `,
          input: 'Dòng 1: `n` (1 ≤ n ≤ 10<sup>5</sup>). Dòng 2: `n` số nguyên (|a<sub>i</sub>| ≤ 10<sup>9</sup>).',
          output: 'Tổng lớn nhất.',
          hint: 'Duy trì `cur` = tổng lớn nhất của đoạn kết thúc tại `i`: `cur = max(a[i], cur + a[i])`; đáp án là max của mọi `cur`.',
          timeLimitMs: 1000,
          solution: c`
            #include <stdio.h>
            int main() {
                int n; long long x, cur = 0, best = 0;
                scanf("%d", &n);
                for (int i = 0; i < n; i++) {
                    scanf("%lld", &x);
                    cur = (i == 0 || cur + x < x) ? x : cur + x;
                    if (i == 0 || cur > best) best = cur;
                }
                printf("%lld\n", best);
                return 0;
            }`,
          tests: ['9\n-2 1 -3 4 -1 2 1 -5 4', '1\n-5', '3\n-3 -1 -2', '5\n1 2 3 4 5', '4\n1000000000 1000000000 -1 1000000000', { input: genLargeArray(100000, 777, true) }],
        },
        {
          slug: 'tong-doan-truy-van',
          title: 'Truy vấn tổng đoạn',
          difficulty: 'medium',
          statement: `
            Cho mảng \`n\` số nguyên và \`q\` truy vấn, mỗi truy vấn gồm \`l r\`: tính tổng a<sub>l</sub> + a<sub>l+1</sub> + ... + a<sub>r</sub>
            (chỉ số từ 1).

            Gợi ý: dùng **mảng cộng dồn** \`S[i] = a[1] + ... + a[i]\`, khi đó tổng đoạn = \`S[r] − S[l−1]\`.
          `,
          input: 'Dòng 1: `n q` (1 ≤ n, q ≤ 10<sup>5</sup>). Dòng 2: `n` số nguyên (|a<sub>i</sub>| ≤ 10<sup>9</sup>). `q` dòng tiếp theo mỗi dòng `l r` (1 ≤ l ≤ r ≤ n).',
          output: 'Mỗi truy vấn in một dòng.',
          timeLimitMs: 1000,
          solution: c`
            #include <stdio.h>
            long long S[100005];
            int main() {
                int n, q;
                scanf("%d %d", &n, &q);
                for (int i = 1; i <= n; i++) { long long x; scanf("%lld", &x); S[i] = S[i - 1] + x; }
                while (q--) { int l, r; scanf("%d %d", &l, &r); printf("%lld\n", S[r] - S[l - 1]); }
                return 0;
            }`,
          tests: ['5 3\n1 2 3 4 5\n1 5\n2 4\n3 3', '1 1\n-7\n1 1', '4 2\n1000000000 1000000000 1000000000 1000000000\n1 4\n2 3', { input: genRangeQueries(100000, 100000) }],
        },
        {
          slug: 'day-tang-dai-nhat',
          title: 'Đoạn tăng liên tiếp dài nhất',
          difficulty: 'medium',
          statement: 'Tìm độ dài đoạn con liên tiếp **tăng nghiêm ngặt** dài nhất của mảng, và in ra đoạn đó (nếu có nhiều đoạn cùng độ dài, chọn đoạn xuất hiện đầu tiên).',
          input: 'Dòng 1: `n` (1 ≤ n ≤ 10<sup>5</sup>). Dòng 2: `n` số nguyên.',
          output: 'Dòng 1: độ dài. Dòng 2: các phần tử của đoạn.',
          solution: c`
            #include <stdio.h>
            int a[100005];
            int main() {
                int n;
                scanf("%d", &n);
                for (int i = 0; i < n; i++) scanf("%d", &a[i]);
                int bestLen = 1, bestStart = 0, start = 0;
                for (int i = 1; i < n; i++) {
                    if (a[i] <= a[i - 1]) start = i;
                    if (i - start + 1 > bestLen) { bestLen = i - start + 1; bestStart = start; }
                }
                printf("%d\n", bestLen);
                for (int i = 0; i < bestLen; i++) printf(i ? " %d" : "%d", a[bestStart + i]);
                printf("\n");
                return 0;
            }`,
          tests: ['8\n1 2 3 1 2 3 4 0', '1\n5', '5\n5 4 3 2 1', '6\n1 2 2 3 4 5', '6\n1 3 5 2 4 6'],
        },
        {
          slug: 'hai-so-co-tong-x',
          title: 'Cặp số có tổng bằng X',
          difficulty: 'hard',
          statement: `
            Cho mảng \`n\` số nguyên **đã sắp xếp tăng dần** và số \`X\`. Đếm số cặp chỉ số (i, j) với i < j sao cho a<sub>i</sub> + a<sub>j</sub> = X.

            Gợi ý: kỹ thuật **hai con trỏ** cho độ phức tạp O(n). Lưu ý các phần tử có thể trùng nhau.
          `,
          input: 'Dòng 1: `n X` (1 ≤ n ≤ 10<sup>5</sup>, |X| ≤ 2 × 10<sup>9</sup>). Dòng 2: `n` số nguyên tăng dần (không giảm), |a<sub>i</sub>| ≤ 10<sup>9</sup>.',
          output: 'Số cặp.',
          timeLimitMs: 1000,
          solution: c`
            #include <stdio.h>
            long long a[100005];
            int main() {
                int n; long long X, cnt = 0;
                scanf("%d %lld", &n, &X);
                for (int i = 0; i < n; i++) scanf("%lld", &a[i]);
                int i = 0, j = n - 1;
                while (i < j) {
                    long long s = a[i] + a[j];
                    if (s < X) i++;
                    else if (s > X) j--;
                    else if (a[i] == a[j]) { long long m = j - i + 1; cnt += m * (m - 1) / 2; break; }
                    else {
                        long long ci = 1, cj = 1;
                        while (i + 1 < j && a[i + 1] == a[i]) { i++; ci++; }
                        while (j - 1 > i && a[j - 1] == a[j]) { j--; cj++; }
                        cnt += ci * cj; i++; j--;
                    }
                }
                printf("%lld\n", cnt);
                return 0;
            }`,
          tests: ['6 7\n1 2 3 4 5 6', '5 4\n2 2 2 2 2', '4 100\n1 2 3 4', '7 0\n-3 -3 -1 0 1 3 3', '1 2\n1', { input: genSortedPairs(100000) }],
        },
      ],
    },
  ],
};

/* ---- Sinh dữ liệu test lớn (giả ngẫu nhiên, cố định theo seed) ---- */
function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
function genLargeArray(n, seed, signed = true) {
  const r = rng(seed);
  const a = [];
  for (let i = 0; i < n; i++) a.push(Math.floor((r() * 2 - (signed ? 1 : 0)) * 1e9));
  return `${n}\n${a.join(' ')}\n`;
}
function genBinarySearch() {
  const r = rng(42);
  const n = 100000;
  const a = [];
  let v = -1e9;
  for (let i = 0; i < n; i++) { v += 1 + Math.floor(r() * 15000); a.push(v); }
  const q = [];
  for (let i = 0; i < 100000; i++) q.push(r() < 0.5 ? a[Math.floor(r() * n)] : Math.floor(r() * 2e9 - 1e9));
  return `${n} ${q.length}\n${a.join(' ')}\n${q.join(' ')}\n`;
}
function genRangeQueries(n, q) {
  const r = rng(7);
  const a = Array.from({ length: n }, () => Math.floor(r() * 2e9 - 1e9));
  const lines = [];
  for (let i = 0; i < q; i++) {
    let l = 1 + Math.floor(r() * n);
    let rr = 1 + Math.floor(r() * n);
    if (l > rr) [l, rr] = [rr, l];
    lines.push(`${l} ${rr}`);
  }
  return `${n} ${q}\n${a.join(' ')}\n${lines.join('\n')}\n`;
}
function genSortedPairs(n) {
  const r = rng(99);
  const a = Array.from({ length: n }, () => Math.floor(r() * 2000) - 1000).sort((x, y) => x - y);
  return `${n} 0\n${a.join(' ')}\n`;
}
