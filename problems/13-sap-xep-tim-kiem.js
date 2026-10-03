const c = String.raw;

module.exports = {
  slug: 'thuat-toan-sap-xep',
  title: 'Thuật toán sắp xếp & tìm kiếm',
  icon: '📈',
  description: 'Cài đặt và phân tích các thuật toán sắp xếp kinh điển, tìm kiếm nhị phân nâng cao.',
  intro: `
    **Kiến thức cần nhớ**

    | Thuật toán | Độ phức tạp | Ý tưởng |
    |---|---|---|
    | Nổi bọt (Bubble) | O(n²) | Đổi chỗ các cặp kề nhau bị ngược thứ tự |
    | Chọn (Selection) | O(n²) | Chọn phần tử nhỏ nhất đưa lên đầu |
    | Chèn (Insertion) | O(n²) | Chèn từng phần tử vào đoạn đã sắp xếp |
    | Trộn (Merge) | O(n log n) | Chia đôi, sắp xếp từng nửa rồi trộn |
    | Nhanh (Quick) | O(n log n) trung bình | Chọn chốt, phân hoạch hai phía |

    Tìm kiếm nhị phân chỉ áp dụng được trên dãy **đã sắp xếp**, độ phức tạp O(log n).
  `,
  categories: [
    {
      slug: 'sap-xep-co-ban',
      title: 'Sắp xếp O(n²)',
      description: 'Theo dõi từng bước của các thuật toán cơ bản.',
      problems: [
        {
          slug: 'bubble-sort-tung-buoc',
          title: 'Nổi bọt từng lượt',
          difficulty: 'medium',
          statement: `
            Cài đặt thuật toán **nổi bọt** (bubble sort) sắp xếp tăng dần: ở lượt thứ \`i\` (i = 1, 2, ...), duyệt \`j\` từ 0 đến \`n − i − 1\`,
            nếu \`a[j] > a[j+1]\` thì đổi chỗ. Nếu một lượt không có lần đổi chỗ nào thì dừng thuật toán.

            Sau **mỗi lượt có ít nhất một lần đổi chỗ**, in trạng thái của mảng dạng \`Buoc i: a0 a1 ... an-1\`.
            Nếu mảng ban đầu đã sắp xếp, in \`Da sap xep\`.
          `,
          input: 'Dòng 1: `n` (1 ≤ n ≤ 100). Dòng 2: `n` số nguyên.',
          output: 'Các bước như mô tả.',
          solution: c`
            #include <stdio.h>
            int main() {
                int n, a[105], any = 0;
                scanf("%d", &n);
                for (int i = 0; i < n; i++) scanf("%d", &a[i]);
                for (int i = 1; i < n; i++) {
                    int sw = 0;
                    for (int j = 0; j < n - i; j++) if (a[j] > a[j + 1]) { int t = a[j]; a[j] = a[j + 1]; a[j + 1] = t; sw = 1; }
                    if (!sw) break;
                    any = 1;
                    printf("Buoc %d:", i);
                    for (int k = 0; k < n; k++) printf(" %d", a[k]);
                    printf("\n");
                }
                if (!any) printf("Da sap xep\n");
                return 0;
            }`,
          tests: ['5\n5 1 4 2 8', '3\n1 2 3', '4\n4 3 2 1', '1\n7', '6\n2 1 3 4 6 5'],
        },
        {
          slug: 'selection-sort-dem-doi-cho',
          title: 'Sắp xếp chọn: đếm số lần đổi chỗ',
          difficulty: 'medium',
          statement: `
            Cài đặt **sắp xếp chọn** tăng dần: với mỗi \`i\` từ 0 đến \`n − 2\`, tìm vị trí \`m\` của phần tử nhỏ nhất trong đoạn
            \`a[i..n−1]\` (nếu có nhiều phần tử nhỏ nhất, lấy vị trí **đầu tiên**). Nếu \`m ≠ i\` thì đổi chỗ \`a[i]\` và \`a[m]\`
            và tính là một lần đổi chỗ.

            In mảng sau khi sắp xếp và số lần đổi chỗ.
          `,
          input: 'Dòng 1: `n` (1 ≤ n ≤ 1000). Dòng 2: `n` số nguyên.',
          output: 'Dòng 1: mảng đã sắp xếp. Dòng 2: số lần đổi chỗ.',
          solution: c`
            #include <stdio.h>
            int main() {
                int n, a[1005], cnt = 0;
                scanf("%d", &n);
                for (int i = 0; i < n; i++) scanf("%d", &a[i]);
                for (int i = 0; i < n - 1; i++) {
                    int m = i;
                    for (int j = i + 1; j < n; j++) if (a[j] < a[m]) m = j;
                    if (m != i) { int t = a[i]; a[i] = a[m]; a[m] = t; cnt++; }
                }
                for (int i = 0; i < n; i++) printf(i ? " %d" : "%d", a[i]);
                printf("\n%d\n", cnt);
                return 0;
            }`,
          tests: ['5\n64 25 12 22 11', '3\n1 2 3', '4\n2 1 2 1', '1\n0', '6\n6 5 4 3 2 1'],
        },
        {
          slug: 'insertion-sort-dich-chuyen',
          title: 'Sắp xếp chèn: số lần dịch chuyển',
          difficulty: 'medium',
          statement: `
            Cài đặt **sắp xếp chèn** tăng dần. Mỗi khi một phần tử bị dịch sang phải một vị trí (\`a[j+1] = a[j]\`) thì tính là một
            lần dịch chuyển. In ra trạng thái mảng sau khi chèn xong mỗi phần tử \`a[i]\` (i = 1..n−1) và cuối cùng là tổng số lần dịch chuyển.
          `,
          input: 'Dòng 1: `n` (2 ≤ n ≤ 100). Dòng 2: `n` số nguyên.',
          output: '`n − 1` dòng trạng thái và một dòng tổng số lần dịch chuyển.',
          solution: c`
            #include <stdio.h>
            int main() {
                int n, a[105], cnt = 0;
                scanf("%d", &n);
                for (int i = 0; i < n; i++) scanf("%d", &a[i]);
                for (int i = 1; i < n; i++) {
                    int v = a[i], j = i - 1;
                    while (j >= 0 && a[j] > v) { a[j + 1] = a[j]; j--; cnt++; }
                    a[j + 1] = v;
                    for (int k = 0; k < n; k++) printf(k ? " %d" : "%d", a[k]);
                    printf("\n");
                }
                printf("%d\n", cnt);
                return 0;
            }`,
          tests: ['5\n5 2 4 6 1', '2\n1 2', '3\n3 2 1', '4\n1 3 2 3', '6\n10 9 8 1 2 3'],
        },
      ],
    },
    {
      slug: 'sap-xep-nhanh',
      title: 'Sắp xếp O(n log n)',
      description: 'Chia để trị: merge sort, quick sort.',
      problems: [
        {
          slug: 'dem-nghich-the',
          title: 'Đếm số nghịch thế',
          difficulty: 'hard',
          statement: `
            Cặp chỉ số (i, j) là một **nghịch thế** nếu i < j và a<sub>i</sub> > a<sub>j</sub>. Đếm số nghịch thế của mảng.

            Với n = 10<sup>5</sup>, cách duyệt mọi cặp O(n²) sẽ quá chậm. Hãy cải tiến **merge sort**: khi trộn, nếu lấy phần tử
            từ nửa phải trước thì nó tạo nghịch thế với tất cả phần tử còn lại của nửa trái.
          `,
          input: 'Dòng 1: `n` (1 ≤ n ≤ 10<sup>5</sup>). Dòng 2: `n` số nguyên (|a<sub>i</sub>| ≤ 10<sup>9</sup>).',
          output: 'Số nghịch thế.',
          timeLimitMs: 1000,
          solution: c`
            #include <stdio.h>
            int a[100005], tmp[100005];
            long long sortCount(int l, int r) {
                if (r - l < 1) return 0;
                int m = (l + r) / 2;
                long long c = sortCount(l, m) + sortCount(m + 1, r);
                int i = l, j = m + 1, k = l;
                while (i <= m && j <= r) {
                    if (a[i] <= a[j]) tmp[k++] = a[i++];
                    else { tmp[k++] = a[j++]; c += m - i + 1; }
                }
                while (i <= m) tmp[k++] = a[i++];
                while (j <= r) tmp[k++] = a[j++];
                for (int t = l; t <= r; t++) a[t] = tmp[t];
                return c;
            }
            int main() {
                int n;
                scanf("%d", &n);
                for (int i = 0; i < n; i++) scanf("%d", &a[i]);
                printf("%lld\n", sortCount(0, n - 1));
                return 0;
            }`,
          tests: ['5\n2 4 1 3 5', '1\n1', '4\n4 3 2 1', '5\n1 1 1 1 1', '6\n1 2 3 4 5 6', { input: '100000\n' + Array.from({ length: 100000 }, (_, i) => 100000 - i).join(' ') + '\n' }, { input: '100000\n' + Array.from({ length: 100000 }, (_, i) => (i * 48271) % 99991).join(' ') + '\n' }],
        },
        {
          slug: 'phan-tu-nho-thu-k',
          title: 'Phần tử nhỏ thứ k',
          difficulty: 'hard',
          statement: `
            Cho mảng \`n\` số nguyên và \`k\`. Tìm phần tử nhỏ thứ \`k\` (phần tử ở vị trí \`k\` nếu sắp xếp tăng dần, tính từ 1).

            Có thể sắp xếp toàn bộ mảng (O(n log n)) hoặc dùng thuật toán **Quickselect** dựa trên phân hoạch của quick sort (trung bình O(n)).
          `,
          input: 'Dòng 1: `n k` (1 ≤ k ≤ n ≤ 10<sup>6</sup>). Dòng 2: `n` số nguyên (|a<sub>i</sub>| ≤ 10<sup>9</sup>).',
          output: 'Phần tử nhỏ thứ k.',
          timeLimitMs: 2000,
          solution: c`
            #include <stdio.h>
            #include <stdlib.h>
            int a[1000005];
            int cmp(const void *p, const void *q) { int x = *(const int *)p, y = *(const int *)q; return (x > y) - (x < y); }
            int main() {
                int n, k;
                scanf("%d %d", &n, &k);
                for (int i = 0; i < n; i++) scanf("%d", &a[i]);
                qsort(a, n, sizeof(int), cmp);
                printf("%d\n", a[k - 1]);
                return 0;
            }`,
          tests: ['5 2\n7 10 4 3 20', '1 1\n-5', '6 6\n1 2 3 4 5 6', '6 3\n5 5 5 1 1 1', { input: '300000 150000\n' + Array.from({ length: 300000 }, (_, i) => ((i * 2654435761) % 2000000007) - 1000000000).join(' ') + '\n' }],
        },
      ],
    },
    {
      slug: 'tim-kiem-nhi-phan-nang-cao',
      title: 'Tìm kiếm nhị phân nâng cao',
      description: 'lower bound, upper bound, tìm kiếm trên đáp án.',
      problems: [
        {
          slug: 'dem-trong-doan',
          title: 'Đếm số phần tử trong đoạn [L, R]',
          difficulty: 'medium',
          statement: `
            Cho mảng \`n\` số nguyên và \`q\` truy vấn \`L R\`. Với mỗi truy vấn, đếm số phần tử có giá trị thuộc đoạn [L, R].

            Gợi ý: sắp xếp mảng một lần, sau đó mỗi truy vấn dùng tìm kiếm nhị phân để tìm vị trí phần tử đầu tiên ≥ L
            (lower bound) và phần tử đầu tiên > R (upper bound).
          `,
          input: 'Dòng 1: `n q` (1 ≤ n, q ≤ 10<sup>5</sup>). Dòng 2: `n` số nguyên. `q` dòng tiếp: `L R` (L ≤ R). Mọi giá trị trong [−10<sup>9</sup>, 10<sup>9</sup>].',
          output: 'Mỗi truy vấn một dòng.',
          timeLimitMs: 1000,
          solution: c`
            #include <stdio.h>
            #include <stdlib.h>
            int a[100005], n;
            int cmp(const void *p, const void *q) { int x = *(const int *)p, y = *(const int *)q; return (x > y) - (x < y); }
            int lowerBound(long long x) { int lo = 0, hi = n; while (lo < hi) { int m = (lo + hi) / 2; if (a[m] < x) lo = m + 1; else hi = m; } return lo; }
            int main() {
                int q;
                scanf("%d %d", &n, &q);
                for (int i = 0; i < n; i++) scanf("%d", &a[i]);
                qsort(a, n, sizeof(int), cmp);
                while (q--) {
                    long long L, R;
                    scanf("%lld %lld", &L, &R);
                    printf("%d\n", lowerBound(R + 1) - lowerBound(L));
                }
                return 0;
            }`,
          tests: ['6 3\n5 1 3 3 9 7\n3 7\n10 20\n1 1', '1 1\n0\n-1000000000 1000000000', '5 2\n2 2 2 2 2\n2 2\n3 4', { input: genQueries() }],
        },
        {
          slug: 'can-bac-hai-nguyen',
          title: 'Căn bậc hai nguyên',
          difficulty: 'medium',
          statement: 'Cho số nguyên `n`. Tìm số nguyên lớn nhất `x` sao cho x² ≤ n bằng **tìm kiếm nhị phân** (không dùng `sqrt`, vì sai số số thực có thể cho kết quả sai với n lớn).',
          input: 'Dòng 1: `t` (1 ≤ t ≤ 10<sup>5</sup>). `t` dòng tiếp mỗi dòng một số `n` (0 ≤ n ≤ 10<sup>18</sup>).',
          output: 'Mỗi số in kết quả trên một dòng.',
          hint: 'Tìm trên đoạn [0, 10<sup>9</sup> + 1]. Khi so sánh `mid * mid <= n` hãy dùng `unsigned long long` hoặc so sánh `mid <= n / mid` để tránh tràn số.',
          solution: c`
            #include <stdio.h>
            int main() {
                int t;
                scanf("%d", &t);
                while (t--) {
                    long long n;
                    scanf("%lld", &n);
                    long long lo = 0, hi = 1000000001LL;
                    while (lo < hi) {
                        long long mid = (lo + hi + 1) / 2;
                        if (mid * mid <= n) lo = mid; else hi = mid - 1;
                    }
                    printf("%lld\n", lo);
                }
                return 0;
            }`,
          tests: ['3\n10\n16\n0', '1\n1', '4\n999999999999999999\n1000000000000000000\n2\n3', '5\n99\n100\n101\n999999998000000001\n999999998000000000'],
        },
        {
          slug: 'cat-go',
          title: 'Cắt gỗ',
          difficulty: 'hard',
          statement: `
            Có \`n\` khúc gỗ với độ dài a<sub>1</sub>, ..., a<sub>n</sub>. Cần cắt ra **ít nhất** \`k\` đoạn có cùng độ dài nguyên \`L\`
            (phần thừa bỏ đi, không được nối gỗ). Tìm \`L\` lớn nhất có thể. Nếu không cắt được (kể cả với L = 1), in \`0\`.

            Gợi ý: **tìm kiếm nhị phân trên đáp án** — với một giá trị L, số đoạn cắt được là Σ ⌊a<sub>i</sub> / L⌋; hàm này giảm dần theo L.
          `,
          input: 'Dòng 1: `n k` (1 ≤ n ≤ 10<sup>5</sup>, 1 ≤ k ≤ 10<sup>9</sup>). Dòng 2: `n` số nguyên dương a<sub>i</sub> ≤ 10<sup>9</sup>.',
          output: 'Độ dài L lớn nhất.',
          timeLimitMs: 1000,
          solution: c`
            #include <stdio.h>
            long long a[100005];
            int main() {
                int n; long long k;
                scanf("%d %lld", &n, &k);
                for (int i = 0; i < n; i++) scanf("%lld", &a[i]);
                long long lo = 0, hi = 1000000000LL;
                while (lo < hi) {
                    long long mid = (lo + hi + 1) / 2, cnt = 0;
                    for (int i = 0; i < n && cnt < k; i++) cnt += a[i] / mid;
                    if (cnt >= k) lo = mid; else hi = mid - 1;
                }
                printf("%lld\n", lo);
                return 0;
            }`,
          tests: ['4 11\n802 743 457 539', '1 1\n1', '3 100\n1 1 1', '2 2\n1000000000 1000000000', '5 7\n10 20 30 40 50', { input: '100000 1000000000\n' + Array.from({ length: 100000 }, (_, i) => 1000000000 - i * 3).join(' ') + '\n' }],
        },
      ],
    },
  ],
};

function genQueries() {
  let s = 2024;
  const r = () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
  const n = 100000;
  const q = 100000;
  const a = Array.from({ length: n }, () => Math.floor(r() * 2e6) - 1e6);
  const lines = [];
  for (let i = 0; i < q; i++) {
    const x = Math.floor(r() * 2.2e6) - 1.1e6;
    const y = x + Math.floor(r() * 50000);
    lines.push(`${x} ${y}`);
  }
  return `${n} ${q}\n${a.join(' ')}\n${lines.join('\n')}\n`;
}
