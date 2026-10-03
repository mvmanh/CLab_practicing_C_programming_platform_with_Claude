const c = String.raw;

module.exports = {
  slug: 'cap-phat-dong',
  title: 'Cấp phát động & Danh sách liên kết',
  icon: '🧠',
  description: 'malloc, calloc, realloc, free; mảng động, ma trận động, danh sách liên kết, ngăn xếp và hàng đợi.',
  intro: `
    **Kiến thức cần nhớ**

    - \`int *a = (int *)malloc(n * sizeof(int));\` — cấp phát vùng nhớ cho \`n\` số nguyên (chưa khởi tạo).
    - \`calloc(n, sizeof(int))\` — cấp phát và gán toàn bộ bằng 0. \`realloc(a, m * sizeof(int))\` — thay đổi kích thước.
    - Luôn kiểm tra kết quả trả về khác \`NULL\` và \`free(a)\` khi không dùng nữa.
    - Danh sách liên kết đơn:
      \`\`\`c
      typedef struct Node { int data; struct Node *next; } Node;
      \`\`\`
    - Ngăn xếp (stack): vào sau ra trước (LIFO). Hàng đợi (queue): vào trước ra trước (FIFO).
  `,
  categories: [
    {
      slug: 'mang-dong',
      title: 'Mảng động',
      description: 'Cấp phát mảng có kích thước xác định lúc chạy.',
      problems: [
        {
          slug: 'mang-dong-co-ban',
          title: 'Mảng động: lọc số dương',
          difficulty: 'easy',
          statement: 'Nhập `n` rồi cấp phát động mảng `n` số nguyên. Tạo mảng động **thứ hai** vừa đủ chứa các số dương của mảng đầu (giữ thứ tự). In số lượng số dương và các số đó (nếu không có in `0` và một dòng trống). Nhớ giải phóng bộ nhớ.',
          input: 'Dòng 1: `n` (1 ≤ n ≤ 10<sup>6</sup>). Dòng 2: `n` số nguyên.',
          output: 'Dòng 1: số lượng. Dòng 2: các số dương.',
          starter: c`
            #include <stdio.h>
            #include <stdlib.h>

            int main() {
                int n;
                scanf("%d", &n);
                int *a = (int *)malloc(n * sizeof(int));
                // TODO: nhập mảng, đếm số dương, cấp phát mảng thứ hai, in kết quả

                free(a);
                return 0;
            }`,
          solution: c`
            #include <stdio.h>
            #include <stdlib.h>
            int main() {
                int n, k = 0;
                scanf("%d", &n);
                int *a = (int *)malloc(n * sizeof(int));
                for (int i = 0; i < n; i++) { scanf("%d", &a[i]); if (a[i] > 0) k++; }
                int *b = (int *)malloc((k ? k : 1) * sizeof(int));
                for (int i = 0, j = 0; i < n; i++) if (a[i] > 0) b[j++] = a[i];
                printf("%d\n", k);
                for (int i = 0; i < k; i++) printf(i ? " %d" : "%d", b[i]);
                printf("\n");
                free(a); free(b);
                return 0;
            }`,
          tests: ['6\n-1 2 0 3 -4 5', '3\n-1 -2 0', '1\n7', '5\n1 2 3 4 5', { input: '200000\n' + Array.from({ length: 200000 }, (_, i) => (i % 3 === 0 ? -i : i % 7)).join(' ') + '\n' }],
        },
        {
          slug: 'realloc-nhap-khong-biet-n',
          title: 'Nhập dãy không biết trước độ dài',
          difficulty: 'medium',
          statement: `
            Nhập một dãy số nguyên cho đến hết dữ liệu vào (không biết trước số lượng). Dùng mảng động và \`realloc\`
            (ví dụ: gấp đôi dung lượng mỗi khi đầy) để lưu dãy. In ra số lượng phần tử, sau đó in dãy theo thứ tự **ngược lại**.
          `,
          input: 'Các số nguyên (ít nhất 1 số, tối đa 10<sup>6</sup> số) cách nhau bởi khoảng trắng hoặc xuống dòng.',
          output: 'Dòng 1: số lượng. Dòng 2: dãy theo thứ tự ngược.',
          hint: '`while (scanf("%d", &x) == 1) { if (n == cap) { cap *= 2; a = realloc(a, cap * sizeof(int)); } a[n++] = x; }`',
          solution: c`
            #include <stdio.h>
            #include <stdlib.h>
            int main() {
                int cap = 4, n = 0, x;
                int *a = (int *)malloc(cap * sizeof(int));
                while (scanf("%d", &x) == 1) {
                    if (n == cap) { cap *= 2; a = (int *)realloc(a, cap * sizeof(int)); }
                    a[n++] = x;
                }
                printf("%d\n", n);
                for (int i = n - 1; i >= 0; i--) printf(i != n - 1 ? " %d" : "%d", a[i]);
                printf("\n");
                free(a);
                return 0;
            }`,
          tests: ['1 2 3 4 5', '42', '5\n4\n3\n2\n1', '-1 -2 -3 -4 -5 -6 -7 -8 -9 -10 -11', { input: Array.from({ length: 300000 }, (_, i) => (i * 7919) % 100003).join(' ') + '\n' }],
        },
        {
          slug: 'ma-tran-dong',
          title: 'Ma trận động: tam giác Pascal',
          difficulty: 'medium',
          statement: `
            Cấp phát động một "ma trận răng cưa": hàng \`i\` (từ 0) có đúng \`i + 1\` phần tử (\`long long\`). Điền tam giác Pascal
            vào đó: \`p[i][0] = p[i][i] = 1\`, \`p[i][j] = p[i-1][j-1] + p[i-1][j]\`.

            Sau đó trả lời \`q\` truy vấn, mỗi truy vấn \`i j\` in ra \`p[i][j]\`.
          `,
          input: 'Dòng 1: `n q` (1 ≤ n ≤ 60, 1 ≤ q ≤ 10<sup>4</sup>). `q` dòng tiếp: `i j` (0 ≤ j ≤ i < n).',
          output: 'Mỗi truy vấn một dòng.',
          hint: '`long long **p = malloc(n * sizeof(long long *)); p[i] = malloc((i + 1) * sizeof(long long));` — nhớ giải phóng từng hàng rồi đến mảng con trỏ.',
          solution: c`
            #include <stdio.h>
            #include <stdlib.h>
            int main() {
                int n, q;
                scanf("%d %d", &n, &q);
                long long **p = (long long **)malloc(n * sizeof(long long *));
                for (int i = 0; i < n; i++) {
                    p[i] = (long long *)malloc((i + 1) * sizeof(long long));
                    p[i][0] = p[i][i] = 1;
                    for (int j = 1; j < i; j++) p[i][j] = p[i - 1][j - 1] + p[i - 1][j];
                }
                while (q--) { int i, j; scanf("%d %d", &i, &j); printf("%lld\n", p[i][j]); }
                for (int i = 0; i < n; i++) free(p[i]);
                free(p);
                return 0;
            }`,
          tests: ['5 3\n4 2\n0 0\n3 1', '1 1\n0 0', '60 3\n59 29\n59 0\n58 30', '10 4\n9 4\n9 9\n5 2\n7 3'],
        },
      ],
    },
    {
      slug: 'danh-sach-lien-ket',
      title: 'Danh sách liên kết',
      description: 'Thêm, xóa, đảo ngược danh sách liên kết đơn.',
      problems: [
        {
          slug: 'dslk-them-dau-cuoi',
          title: 'Thêm vào đầu và cuối danh sách',
          difficulty: 'medium',
          statement: `
            Cài đặt danh sách liên kết đơn và thực hiện \`q\` thao tác:

            - \`F x\`: thêm \`x\` vào **đầu** danh sách.
            - \`B x\`: thêm \`x\` vào **cuối** danh sách.

            Sau tất cả thao tác, in danh sách từ đầu đến cuối (cách nhau một khoảng trắng).
          `,
          input: 'Dòng 1: `q` (1 ≤ q ≤ 10<sup>5</sup>). `q` dòng tiếp: `F x` hoặc `B x` (|x| ≤ 10<sup>9</sup>).',
          output: 'Danh sách sau các thao tác.',
          hint: 'Giữ thêm con trỏ `tail` trỏ tới nút cuối để thêm vào cuối trong O(1).',
          starter: c`
            #include <stdio.h>
            #include <stdlib.h>

            typedef struct Node {
                int data;
                struct Node *next;
            } Node;

            Node *taoNode(int x) {
                Node *p = (Node *)malloc(sizeof(Node));
                p->data = x;
                p->next = NULL;
                return p;
            }

            int main() {
                Node *head = NULL, *tail = NULL;
                int q;
                scanf("%d", &q);
                while (q--) {
                    char op;
                    int x;
                    scanf(" %c %d", &op, &x);
                    // TODO
                }
                // TODO: in danh sách và giải phóng bộ nhớ
                return 0;
            }`,
          solution: c`
            #include <stdio.h>
            #include <stdlib.h>
            typedef struct Node { int data; struct Node *next; } Node;
            Node *taoNode(int x) { Node *p = (Node *)malloc(sizeof(Node)); p->data = x; p->next = NULL; return p; }
            int main() {
                Node *head = NULL, *tail = NULL;
                int q;
                scanf("%d", &q);
                while (q--) {
                    char op; int x;
                    scanf(" %c %d", &op, &x);
                    Node *p = taoNode(x);
                    if (!head) head = tail = p;
                    else if (op == 'F') { p->next = head; head = p; }
                    else { tail->next = p; tail = p; }
                }
                for (Node *p = head; p; p = p->next) printf(p == head ? "%d" : " %d", p->data);
                printf("\n");
                while (head) { Node *t = head; head = head->next; free(t); }
                return 0;
            }`,
          tests: ['5\nB 1\nB 2\nF 0\nB 3\nF -1', '1\nF 5', '3\nF 1\nF 2\nF 3', '3\nB 1\nB 2\nB 3', { input: '100000\n' + Array.from({ length: 100000 }, (_, i) => `${i % 2 ? 'F' : 'B'} ${i}`).join('\n') + '\n' }],
        },
        {
          slug: 'dslk-xoa-gia-tri',
          title: 'Xóa các nút có giá trị x',
          difficulty: 'medium',
          statement: 'Tạo danh sách liên kết đơn từ `n` số nguyên (theo thứ tự nhập). Xóa **tất cả** các nút có giá trị bằng `x` (giải phóng bộ nhớ của nút bị xóa). In danh sách còn lại, hoặc `EMPTY` nếu rỗng.',
          input: 'Dòng 1: `n x` (1 ≤ n ≤ 10<sup>5</sup>). Dòng 2: `n` số nguyên.',
          output: 'Danh sách còn lại hoặc `EMPTY`.',
          hint: 'Cẩn thận khi xóa nút đầu danh sách. Một kỹ thuật gọn là dùng con trỏ cấp hai `Node **pp = &head;`.',
          solution: c`
            #include <stdio.h>
            #include <stdlib.h>
            typedef struct Node { int data; struct Node *next; } Node;
            int main() {
                int n, x;
                scanf("%d %d", &n, &x);
                Node *head = NULL, **tail = &head;
                for (int i = 0; i < n; i++) {
                    Node *p = (Node *)malloc(sizeof(Node));
                    scanf("%d", &p->data); p->next = NULL;
                    *tail = p; tail = &p->next;
                }
                for (Node **pp = &head; *pp;) {
                    if ((*pp)->data == x) { Node *t = *pp; *pp = t->next; free(t); }
                    else pp = &(*pp)->next;
                }
                if (!head) printf("EMPTY\n");
                else { for (Node *p = head; p; p = p->next) printf(p == head ? "%d" : " %d", p->data); printf("\n"); }
                while (head) { Node *t = head; head = head->next; free(t); }
                return 0;
            }`,
          tests: ['7 2\n2 1 2 3 2 4 2', '3 1\n1 1 1', '4 9\n1 2 3 4', '1 5\n6', '6 0\n0 1 0 0 1 0'],
        },
        {
          slug: 'dslk-dao-nguoc',
          title: 'Đảo ngược danh sách liên kết',
          difficulty: 'medium',
          statement: 'Tạo danh sách liên kết đơn từ `n` số nguyên, sau đó **đảo ngược các liên kết** (không tạo nút mới, không dùng mảng phụ). In danh sách sau khi đảo, và in phần tử ở giữa danh sách (nếu `n` chẵn, lấy phần tử thứ `n/2 + 1` của danh sách sau khi đảo).',
          input: 'Dòng 1: `n` (1 ≤ n ≤ 10<sup>5</sup>). Dòng 2: `n` số nguyên.',
          output: 'Dòng 1: danh sách sau khi đảo. Dòng 2: phần tử ở giữa.',
          hint: 'Dùng ba con trỏ `prev`, `cur`, `next`. Phần tử giữa: kỹ thuật "rùa và thỏ" — `slow` đi 1 bước, `fast` đi 2 bước.',
          solution: c`
            #include <stdio.h>
            #include <stdlib.h>
            typedef struct Node { int data; struct Node *next; } Node;
            int main() {
                int n;
                scanf("%d", &n);
                Node *head = NULL, **tail = &head;
                for (int i = 0; i < n; i++) {
                    Node *p = (Node *)malloc(sizeof(Node));
                    scanf("%d", &p->data); p->next = NULL;
                    *tail = p; tail = &p->next;
                }
                Node *prev = NULL, *cur = head;
                while (cur) { Node *nx = cur->next; cur->next = prev; prev = cur; cur = nx; }
                head = prev;
                for (Node *p = head; p; p = p->next) printf(p == head ? "%d" : " %d", p->data);
                printf("\n");
                Node *slow = head, *fast = head;
                while (fast && fast->next) { slow = slow->next; fast = fast->next->next; }
                printf("%d\n", slow->data);
                while (head) { Node *t = head; head = head->next; free(t); }
                return 0;
            }`,
          tests: ['5\n1 2 3 4 5', '1\n9', '4\n1 2 3 4', '2\n10 20', '6\n6 5 4 3 2 1'],
        },
        {
          slug: 'dslk-chen-co-thu-tu',
          title: 'Chèn giữ thứ tự tăng dần',
          difficulty: 'hard',
          statement: 'Bắt đầu với danh sách rỗng. Lần lượt chèn `n` số vào danh sách liên kết sao cho danh sách **luôn tăng dần** (số bằng nhau thì số chèn sau đứng sau). Sau mỗi `k` lần chèn (và sau lần chèn cuối cùng nếu `n` không chia hết cho `k`), in phần tử nhỏ nhất, lớn nhất và trung vị (phần tử thứ ⌈m/2⌉ với `m` là số phần tử hiện tại).',
          input: 'Dòng 1: `n k` (1 ≤ k ≤ n ≤ 5000). Dòng 2: `n` số nguyên.',
          output: 'Mỗi lần in một dòng `min max trung_vi`.',
          solution: c`
            #include <stdio.h>
            #include <stdlib.h>
            typedef struct Node { int data; struct Node *next; } Node;
            int main() {
                int n, k, m = 0;
                scanf("%d %d", &n, &k);
                Node *head = NULL;
                for (int i = 1; i <= n; i++) {
                    Node *p = (Node *)malloc(sizeof(Node));
                    scanf("%d", &p->data);
                    Node **pp = &head;
                    while (*pp && (*pp)->data <= p->data) pp = &(*pp)->next;
                    p->next = *pp; *pp = p; m++;
                    if (i % k == 0 || i == n) {
                        Node *t = head, *last = head, *med = head;
                        int pos = (m + 1) / 2;
                        for (int j = 1; t; j++, t = t->next) { if (j == pos) med = t; last = t; }
                        printf("%d %d %d\n", head->data, last->data, med->data);
                    }
                }
                while (head) { Node *t = head; head = head->next; free(t); }
                return 0;
            }`,
          tests: ['6 2\n5 1 4 2 3 6', '1 1\n7', '5 5\n9 7 5 3 1', '7 3\n1 1 1 2 2 2 0', '4 1\n-1 -2 -3 -4'],
        },
      ],
    },
    {
      slug: 'ngan-xep-hang-doi',
      title: 'Ngăn xếp & hàng đợi',
      description: 'Cài đặt và ứng dụng stack, queue.',
      problems: [
        {
          slug: 'ngoac-hop-le',
          title: 'Dấu ngoặc hợp lệ',
          difficulty: 'medium',
          statement: `
            Cho một chuỗi chỉ gồm các ký tự \`()[]{}\`. Kiểm tra chuỗi có phải là dãy ngoặc **hợp lệ** không
            (mỗi ngoặc mở có ngoặc đóng cùng loại tương ứng, đúng thứ tự). In \`YES\` hoặc \`NO\`.
          `,
          input: 'Dòng 1: `t` (1 ≤ t ≤ 100) — số chuỗi. `t` dòng tiếp theo, mỗi dòng một chuỗi (1 ≤ độ dài ≤ 10<sup>4</sup>).',
          output: 'Với mỗi chuỗi in `YES` hoặc `NO`.',
          hint: 'Dùng ngăn xếp: gặp ngoặc mở thì đẩy vào; gặp ngoặc đóng thì kiểm tra đỉnh ngăn xếp có khớp không rồi lấy ra.',
          solution: c`
            #include <stdio.h>
            char s[10005], st[10005];
            int main() {
                int t;
                scanf("%d", &t);
                while (t--) {
                    scanf("%10004s", s);
                    int top = 0, ok = 1;
                    for (int i = 0; s[i] && ok; i++) {
                        char ch = s[i];
                        if (ch == '(' || ch == '[' || ch == '{') st[top++] = ch;
                        else {
                            char need = ch == ')' ? '(' : ch == ']' ? '[' : '{';
                            if (top == 0 || st[top - 1] != need) ok = 0; else top--;
                        }
                    }
                    printf(ok && top == 0 ? "YES\n" : "NO\n");
                }
                return 0;
            }`,
          tests: ['3\n()[]{}\n([)]\n{[()()]}', '1\n(', '2\n)(\n((()))', '4\n{{{{}}}}\n[[]\n]\n()()()', { input: '1\n' + '('.repeat(5000) + ')'.repeat(5000) + '\n' }],
        },
        {
          slug: 'mo-phong-stack',
          title: 'Mô phỏng ngăn xếp',
          difficulty: 'easy',
          statement: `
            Cài đặt ngăn xếp số nguyên bằng mảng động và thực hiện các lệnh:

            - \`PUSH x\`: đẩy \`x\` vào ngăn xếp.
            - \`POP\`: lấy phần tử ở đỉnh ra (nếu rỗng thì bỏ qua).
            - \`TOP\`: in phần tử ở đỉnh, hoặc \`EMPTY\` nếu rỗng.
            - \`SIZE\`: in số phần tử.
          `,
          input: 'Dòng 1: `q` (1 ≤ q ≤ 10<sup>5</sup>). `q` dòng tiếp theo là các lệnh.',
          output: 'Kết quả các lệnh `TOP` và `SIZE`, mỗi kết quả một dòng.',
          solution: c`
            #include <stdio.h>
            #include <stdlib.h>
            #include <string.h>
            int main() {
                int q, n = 0, cap = 16;
                int *st = (int *)malloc(cap * sizeof(int));
                char cmd[16];
                scanf("%d", &q);
                while (q--) {
                    scanf("%15s", cmd);
                    if (strcmp(cmd, "PUSH") == 0) {
                        int x; scanf("%d", &x);
                        if (n == cap) { cap *= 2; st = (int *)realloc(st, cap * sizeof(int)); }
                        st[n++] = x;
                    } else if (strcmp(cmd, "POP") == 0) { if (n) n--; }
                    else if (strcmp(cmd, "TOP") == 0) { if (n) printf("%d\n", st[n - 1]); else printf("EMPTY\n"); }
                    else printf("%d\n", n);
                }
                free(st);
                return 0;
            }`,
          tests: ['7\nPUSH 1\nPUSH 2\nTOP\nPOP\nTOP\nSIZE\nPOP', '2\nTOP\nSIZE', '5\nPOP\nPUSH 5\nPUSH -5\nTOP\nSIZE', '6\nPUSH 1\nPOP\nPOP\nTOP\nPUSH 9\nTOP'],
        },
        {
          slug: 'hang-doi-xep-hang',
          title: 'Hàng đợi tại quầy',
          difficulty: 'medium',
          statement: `
            Một quầy giao dịch phục vụ khách theo thứ tự đến (hàng đợi). Có các sự kiện:

            - \`DEN x\`: khách mang số hiệu \`x\` đến xếp hàng.
            - \`PHUCVU\`: phục vụ khách đầu hàng — in số hiệu của khách đó, hoặc \`TRONG\` nếu hàng rỗng.
            - \`DAU\`: in số hiệu khách đầu hàng (không phục vụ), hoặc \`TRONG\`.

            Cuối cùng in số khách còn đang chờ.
          `,
          input: 'Dòng 1: `q` (1 ≤ q ≤ 10<sup>5</sup>). `q` dòng tiếp theo là các sự kiện.',
          output: 'Kết quả các lệnh `PHUCVU`, `DAU` và dòng cuối là số khách còn lại.',
          hint: 'Có thể dùng mảng với hai chỉ số `dau`, `cuoi` hoặc danh sách liên kết có con trỏ `head`, `tail`.',
          solution: c`
            #include <stdio.h>
            #include <string.h>
            int qu[100005];
            int main() {
                int q, h = 0, t = 0;
                char cmd[16];
                scanf("%d", &q);
                while (q--) {
                    scanf("%15s", cmd);
                    if (strcmp(cmd, "DEN") == 0) { scanf("%d", &qu[t++]); }
                    else if (strcmp(cmd, "PHUCVU") == 0) { if (h < t) printf("%d\n", qu[h++]); else printf("TRONG\n"); }
                    else { if (h < t) printf("%d\n", qu[h]); else printf("TRONG\n"); }
                }
                printf("%d\n", t - h);
                return 0;
            }`,
          tests: ['6\nDEN 1\nDEN 2\nDAU\nPHUCVU\nPHUCVU\nPHUCVU', '1\nDAU', '4\nDEN 5\nDEN 6\nDEN 7\nPHUCVU', '5\nPHUCVU\nDEN 9\nDAU\nDEN 8\nDAU'],
        },
        {
          slug: 'tinh-bieu-thuc-hau-to',
          title: 'Tính biểu thức hậu tố',
          difficulty: 'hard',
          statement: `
            Biểu thức hậu tố (ký pháp Ba Lan ngược) đặt toán tử sau các toán hạng, ví dụ \`3 4 + 2 *\` = (3 + 4) × 2 = 14.

            Nhập một biểu thức hậu tố gồm các số nguyên và các toán tử \`+ - * /\` (chia nguyên, cắt về 0 như trong C),
            các phần tử cách nhau bởi khoảng trắng. Tính giá trị biểu thức. Biểu thức luôn hợp lệ và không chia cho 0.
          `,
          input: 'Một dòng chứa biểu thức (≤ 1000 phần tử, mọi giá trị trung gian nằm trong `long long`).',
          output: 'Giá trị biểu thức.',
          hint: 'Đọc từng phần tử bằng `scanf("%s", tok)`. Nếu là số thì đẩy vào stack; nếu là toán tử thì lấy 2 số ra (chú ý thứ tự!), tính và đẩy kết quả vào.',
          solution: c`
            #include <stdio.h>
            #include <stdlib.h>
            #include <string.h>
            int main() {
                long long st[1005]; int top = 0;
                char tok[64];
                while (scanf("%63s", tok) == 1) {
                    if (strlen(tok) == 1 && strchr("+-*/", tok[0])) {
                        long long b = st[--top], a = st[--top], r;
                        switch (tok[0]) { case '+': r = a + b; break; case '-': r = a - b; break; case '*': r = a * b; break; default: r = a / b; }
                        st[top++] = r;
                    } else st[top++] = atoll(tok);
                }
                printf("%lld\n", st[0]);
                return 0;
            }`,
          tests: ['3 4 + 2 *', '5', '10 3 /', '2 3 4 * +', '-7 2 /', '5 1 2 + 4 * + 3 -', '100 20 - 4 / 3 *'],
          samples: 3,
        },
      ],
    },
  ],
};
