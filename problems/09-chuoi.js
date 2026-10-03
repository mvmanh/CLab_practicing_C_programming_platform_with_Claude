const c = String.raw;

module.exports = {
  slug: 'chuoi-ky-tu',
  title: 'Chuỗi ký tự',
  icon: '🔤',
  description: 'Mảng ký tự, thư viện string.h/ctype.h, xử lý từ, chuẩn hóa, tìm kiếm và thay thế chuỗi.',
  intro: `
    **Kiến thức cần nhớ**

    - Chuỗi trong C là mảng \`char\` kết thúc bằng ký tự \`'\\0'\`.
    - Đọc một từ: \`scanf("%s", s);\` — đọc cả dòng (có khoảng trắng): \`fgets(s, sizeof(s), stdin);\` rồi xóa ký tự \`'\\n'\` ở cuối:
      \`s[strcspn(s, "\\n")] = '\\0';\`
    - \`<string.h>\`: \`strlen\`, \`strcpy\`, \`strcat\`, \`strcmp\`, \`strstr\`, \`strchr\`, \`strtok\`...
    - \`<ctype.h>\`: \`isalpha\`, \`isdigit\`, \`isspace\`, \`isupper\`, \`islower\`, \`toupper\`, \`tolower\`.
    - Nếu vừa dùng \`scanf\` đọc số rồi mới \`fgets\`, nhớ đọc bỏ ký tự xuống dòng còn sót lại.
  `,
  categories: [
    {
      slug: 'xu-ly-ky-tu',
      title: 'Xử lý ký tự',
      description: 'Phân loại ký tự, đổi hoa thường.',
      problems: [
        {
          slug: 'dem-loai-ky-tu',
          title: 'Đếm chữ cái, chữ số, khoảng trắng',
          difficulty: 'easy',
          statement: 'Nhập một dòng văn bản. Đếm số chữ cái (a–z, A–Z), số chữ số, số khoảng trắng và số ký tự khác. In 4 số trên một dòng.',
          input: 'Một dòng văn bản (độ dài ≤ 1000, chỉ gồm ký tự ASCII in được).',
          output: 'Bốn số nguyên cách nhau một khoảng trắng.',
          solution: c`
            #include <stdio.h>
            #include <string.h>
            #include <ctype.h>
            int main() {
                char s[1105];
                if (!fgets(s, sizeof(s), stdin)) s[0] = 0;
                s[strcspn(s, "\r\n")] = 0;
                int a = 0, d = 0, sp = 0, o = 0;
                for (int i = 0; s[i]; i++) {
                    if (isalpha((unsigned char)s[i])) a++;
                    else if (isdigit((unsigned char)s[i])) d++;
                    else if (s[i] == ' ') sp++;
                    else o++;
                }
                printf("%d %d %d %d\n", a, d, sp, o);
                return 0;
            }`,
          tests: ['Hello World 2025!', 'abc', '1 2 3', 'C++ & Java: 50/50 ?', '   ', 'a1!b2@c3#'],
        },
        {
          slug: 'doi-hoa-thuong',
          title: 'Đảo chữ hoa – chữ thường',
          difficulty: 'easy',
          statement: 'Nhập một dòng văn bản. Đổi tất cả chữ hoa thành chữ thường và ngược lại; các ký tự khác giữ nguyên.',
          input: 'Một dòng văn bản (độ dài ≤ 1000).',
          output: 'Dòng văn bản sau khi đổi.',
          solution: c`
            #include <stdio.h>
            #include <string.h>
            #include <ctype.h>
            int main() {
                char s[1105];
                if (!fgets(s, sizeof(s), stdin)) s[0] = 0;
                s[strcspn(s, "\r\n")] = 0;
                for (int i = 0; s[i]; i++) {
                    unsigned char ch = s[i];
                    if (isupper(ch)) s[i] = tolower(ch);
                    else if (islower(ch)) s[i] = toupper(ch);
                }
                printf("%s\n", s);
                return 0;
            }`,
          tests: ['Hello World', 'ABC def 123', 'lap TRINH c', 'x', 'MiXeD CaSe!!'],
        },
        {
          slug: 'dem-nguyen-am',
          title: 'Đếm nguyên âm',
          difficulty: 'easy',
          statement: 'Nhập một dòng văn bản. Đếm số nguyên âm (`a, e, i, o, u` — không phân biệt hoa thường) và số phụ âm (các chữ cái còn lại).',
          input: 'Một dòng văn bản (độ dài ≤ 1000).',
          output: 'Số nguyên âm và số phụ âm.',
          solution: c`
            #include <stdio.h>
            #include <string.h>
            #include <ctype.h>
            int main() {
                char s[1105];
                if (!fgets(s, sizeof(s), stdin)) s[0] = 0;
                int v = 0, cons = 0;
                for (int i = 0; s[i]; i++) {
                    unsigned char ch = tolower((unsigned char)s[i]);
                    if (!isalpha(ch)) continue;
                    if (strchr("aeiou", ch)) v++; else cons++;
                }
                printf("%d %d\n", v, cons);
                return 0;
            }`,
          tests: ['Hello World', 'AEIOU aeiou', 'rhythm', '12345', 'Lap trinh C that thu vi'],
        },
        {
          slug: 'ma-hoa-caesar',
          title: 'Mã hóa Caesar',
          difficulty: 'medium',
          statement: `
            Mã hóa Caesar dịch mỗi chữ cái đi \`k\` vị trí trong bảng chữ cái (vòng lại từ đầu khi vượt quá \`z\`).
            Chữ hoa vẫn là chữ hoa, chữ thường vẫn là chữ thường; ký tự không phải chữ cái giữ nguyên.

            Ví dụ k = 3: \`Hello, xyz!\` → \`Khoor, abc!\`
          `,
          input: 'Dòng 1: số nguyên `k` (0 ≤ k ≤ 10<sup>9</sup>). Dòng 2: văn bản cần mã hóa (≤ 1000 ký tự).',
          output: 'Văn bản sau khi mã hóa.',
          hint: 'Sau khi `scanf("%d", &k)`, dùng `getchar()` để bỏ ký tự xuống dòng trước khi `fgets`. Công thức: `(ch - \'a\' + k) % 26 + \'a\'`.',
          solution: c`
            #include <stdio.h>
            #include <string.h>
            int main() {
                long long k; char s[1105];
                scanf("%lld", &k);
                getchar();
                if (!fgets(s, sizeof(s), stdin)) s[0] = 0;
                s[strcspn(s, "\r\n")] = 0;
                k %= 26;
                for (int i = 0; s[i]; i++) {
                    if (s[i] >= 'a' && s[i] <= 'z') s[i] = (s[i] - 'a' + k) % 26 + 'a';
                    else if (s[i] >= 'A' && s[i] <= 'Z') s[i] = (s[i] - 'A' + k) % 26 + 'A';
                }
                printf("%s\n", s);
                return 0;
            }`,
          tests: ['3\nHello, xyz!', '0\nKhong doi', '26\nVong tron', '1\nZz Aa', '1000000000\nLap trinh C 2025'],
        },
      ],
    },
    {
      slug: 'thao-tac-chuoi',
      title: 'Thao tác chuỗi',
      description: 'Đảo chuỗi, đối xứng, chuẩn hóa, đếm từ.',
      problems: [
        {
          slug: 'dao-chuoi',
          title: 'Đảo ngược chuỗi',
          difficulty: 'easy',
          statement: 'Nhập một dòng văn bản, in ra chuỗi đảo ngược.',
          input: 'Một dòng văn bản (1 ≤ độ dài ≤ 1000).',
          output: 'Chuỗi đảo ngược.',
          solution: c`
            #include <stdio.h>
            #include <string.h>
            int main() {
                char s[1105];
                if (!fgets(s, sizeof(s), stdin)) s[0] = 0;
                s[strcspn(s, "\r\n")] = 0;
                for (int i = strlen(s) - 1; i >= 0; i--) putchar(s[i]);
                putchar('\n');
                return 0;
            }`,
          tests: ['Hello', 'a', 'Lap trinh C', '12345 67890', 'racecar'],
        },
        {
          slug: 'chuoi-doi-xung',
          title: 'Chuỗi đối xứng',
          difficulty: 'easy',
          statement: 'Nhập một dòng văn bản. Bỏ qua các ký tự không phải chữ cái hoặc chữ số, và **không phân biệt hoa thường**, kiểm tra chuỗi có đối xứng không. In `YES` hoặc `NO`.',
          input: 'Một dòng văn bản (độ dài ≤ 1000).',
          output: '`YES` hoặc `NO`.',
          hint: 'Dùng hai chỉ số `i` từ đầu, `j` từ cuối; bỏ qua ký tự không phải `isalnum`.',
          solution: c`
            #include <stdio.h>
            #include <string.h>
            #include <ctype.h>
            int main() {
                char s[1105];
                if (!fgets(s, sizeof(s), stdin)) s[0] = 0;
                s[strcspn(s, "\r\n")] = 0;
                int i = 0, j = strlen(s) - 1, ok = 1;
                while (i < j) {
                    if (!isalnum((unsigned char)s[i])) { i++; continue; }
                    if (!isalnum((unsigned char)s[j])) { j--; continue; }
                    if (tolower((unsigned char)s[i]) != tolower((unsigned char)s[j])) { ok = 0; break; }
                    i++; j--;
                }
                printf(ok ? "YES\n" : "NO\n");
                return 0;
            }`,
          tests: ['A man, a plan, a canal: Panama', 'race a car', 'abba', 'x', 'No lemon, no melon', 'ab12 21BA', 'abc'],
        },
        {
          slug: 'dem-tu',
          title: 'Đếm số từ',
          difficulty: 'easy',
          statement: 'Nhập một dòng văn bản. "Từ" là dãy liên tiếp các ký tự không phải khoảng trắng. Đếm số từ trong dòng (lưu ý có thể có nhiều khoảng trắng liền nhau ở đầu, giữa hoặc cuối dòng).',
          input: 'Một dòng văn bản (độ dài ≤ 1000).',
          output: 'Số từ.',
          solution: c`
            #include <stdio.h>
            #include <ctype.h>
            int main() {
                char s[1105];
                if (!fgets(s, sizeof(s), stdin)) s[0] = 0;
                int cnt = 0, in = 0;
                for (int i = 0; s[i]; i++) {
                    if (isspace((unsigned char)s[i])) in = 0;
                    else if (!in) { in = 1; cnt++; }
                }
                printf("%d\n", cnt);
                return 0;
            }`,
          tests: ['Lap trinh C co ban', '   nhieu    khoang   trang   ', 'mot', '   ', 'a b c d e f g'],
        },
        {
          slug: 'chuan-hoa-ho-ten',
          title: 'Chuẩn hóa họ tên',
          difficulty: 'medium',
          statement: `
            Nhập họ tên (không dấu) có thể viết lộn xộn: thừa khoảng trắng, hoa thường lẫn lộn. Hãy chuẩn hóa:

            - Xóa khoảng trắng ở đầu, cuối; giữa các từ chỉ còn đúng một khoảng trắng.
            - Chữ cái đầu mỗi từ viết hoa, các chữ còn lại viết thường.

            Ví dụ: \`"  nGUYEN   van    aN "\` → \`Nguyen Van An\`
          `,
          input: 'Một dòng chứa họ tên (≤ 200 ký tự, có ít nhất một chữ cái).',
          output: 'Họ tên đã chuẩn hóa.',
          solution: c`
            #include <stdio.h>
            #include <ctype.h>
            int main() {
                char s[300], out[300];
                if (!fgets(s, sizeof(s), stdin)) s[0] = 0;
                int k = 0, newWord = 1;
                for (int i = 0; s[i]; i++) {
                    unsigned char ch = s[i];
                    if (isspace(ch)) { newWord = 1; continue; }
                    if (newWord && k > 0) out[k++] = ' ';
                    out[k++] = newWord ? toupper(ch) : tolower(ch);
                    newWord = 0;
                }
                out[k] = 0;
                printf("%s\n", out);
                return 0;
            }`,
          tests: ['  nGUYEN   van    aN ', 'tran thi b', 'LE', '   hoang    MINH   tuan   ', 'pHaM'],
        },
        {
          slug: 'tu-dai-nhat',
          title: 'Từ dài nhất',
          difficulty: 'medium',
          statement: 'Nhập một dòng văn bản gồm các từ cách nhau bởi khoảng trắng. In ra từ dài nhất và độ dài của nó (nếu có nhiều từ cùng độ dài, chọn từ xuất hiện đầu tiên).',
          input: 'Một dòng văn bản (≤ 1000 ký tự, có ít nhất một từ).',
          output: 'Từ dài nhất và độ dài, cách nhau một khoảng trắng.',
          hint: 'Có thể dùng `strtok(s, " ")` để tách từ, hoặc dùng `scanf("%s", w)` lặp cho tới khi hết dữ liệu.',
          solution: c`
            #include <stdio.h>
            #include <string.h>
            int main() {
                char w[1105], best[1105] = "";
                while (scanf("%1100s", w) == 1) if (strlen(w) > strlen(best)) strcpy(best, w);
                printf("%s %zu\n", best, strlen(best));
                return 0;
            }`,
          tests: ['Toi yeu lap trinh C', 'a bb ccc dd e', 'mot', '  xin   chao   cac ban  ', 'abc def ghi'],
        },
      ],
    },
    {
      slug: 'tim-kiem-thay-the',
      title: 'Tìm kiếm & thay thế',
      description: 'Chuỗi con, thay thế, nén chuỗi, tần suất.',
      problems: [
        {
          slug: 'dem-chuoi-con',
          title: 'Đếm số lần xuất hiện chuỗi con',
          difficulty: 'medium',
          statement: 'Cho chuỗi `s` và chuỗi `p`. Đếm số lần `p` xuất hiện trong `s` (các lần xuất hiện **được phép chồng lên nhau**). Ví dụ `s = aaaa`, `p = aa` → 3.',
          input: 'Dòng 1: chuỗi `s`. Dòng 2: chuỗi `p` (1 ≤ |p| ≤ |s| ≤ 1000, có thể chứa khoảng trắng).',
          output: 'Số lần xuất hiện.',
          hint: 'Dùng `strstr` lặp lại, mỗi lần bắt đầu tìm từ vị trí tìm thấy + 1.',
          solution: c`
            #include <stdio.h>
            #include <string.h>
            int main() {
                char s[1105], p[1105];
                if (!fgets(s, sizeof(s), stdin)) s[0] = 0;
                if (!fgets(p, sizeof(p), stdin)) p[0] = 0;
                s[strcspn(s, "\r\n")] = 0; p[strcspn(p, "\r\n")] = 0;
                int cnt = 0;
                char *q = s;
                while ((q = strstr(q, p)) != NULL) { cnt++; q++; }
                printf("%d\n", cnt);
                return 0;
            }`,
          tests: ['aaaa\naa', 'hello world\no', 'abcabcabc\nabc', 'abc\nd', 'lap trinh c la lap trinh\nlap trinh', 'ababab\naba'],
        },
        {
          slug: 'thay-the-tu',
          title: 'Thay thế từ',
          difficulty: 'medium',
          statement: 'Cho một câu và hai từ `a`, `b`. Thay thế tất cả các **từ** (cả từ, không phải một phần của từ) bằng `a` trong câu bằng `b`. Các từ trong câu cách nhau đúng một khoảng trắng.',
          input: 'Dòng 1: câu (≤ 1000 ký tự). Dòng 2: hai từ `a b`.',
          output: 'Câu sau khi thay thế.',
          solution: c`
            #include <stdio.h>
            #include <string.h>
            int main() {
                char s[1105], a[1105], b[1105];
                if (!fgets(s, sizeof(s), stdin)) s[0] = 0;
                s[strcspn(s, "\r\n")] = 0;
                scanf("%1100s %1100s", a, b);
                int first = 1;
                for (char *w = strtok(s, " "); w; w = strtok(NULL, " ")) {
                    if (!first) putchar(' ');
                    printf("%s", strcmp(w, a) == 0 ? b : w);
                    first = 0;
                }
                putchar('\n');
                return 0;
            }`,
          tests: ['toi thich hoc java va java\njava C', 'cat category cat\ncat dog', 'mot hai ba\nbon nam', 'a a a\na bb', 'xin chao\nchao tam_biet'],
        },
        {
          slug: 'nen-chuoi',
          title: 'Nén chuỗi',
          difficulty: 'medium',
          statement: `
            Nén chuỗi bằng cách thay mỗi đoạn ký tự giống nhau liên tiếp bằng ký tự đó kèm số lần lặp.
            Nếu ký tự chỉ xuất hiện 1 lần liên tiếp thì chỉ ghi ký tự.

            Ví dụ: \`aaabccdddd\` → \`a3bc2d4\`
          `,
          input: 'Một chuỗi gồm các chữ cái thường, không có khoảng trắng (1 ≤ độ dài ≤ 10<sup>5</sup>).',
          output: 'Chuỗi sau khi nén.',
          solution: c`
            #include <stdio.h>
            char s[100005];
            int main() {
                scanf("%100000s", s);
                for (int i = 0; s[i];) {
                    int j = i;
                    while (s[j] == s[i]) j++;
                    putchar(s[i]);
                    if (j - i > 1) printf("%d", j - i);
                    i = j;
                }
                putchar('\n');
                return 0;
            }`,
          tests: ['aaabccdddd', 'abc', 'a', 'zzzzzzzzzzzz', 'aabbaabb', 'x' + 'y'.repeat(12345) + 'x'],
        },
        {
          slug: 'tan-suat-ky-tu',
          title: 'Tần suất chữ cái',
          difficulty: 'easy',
          statement: 'Nhập một dòng văn bản. Thống kê số lần xuất hiện của mỗi chữ cái (không phân biệt hoa thường). In ra theo thứ tự bảng chữ cái, mỗi dòng dạng `chu: so_lan`, chỉ in các chữ có xuất hiện.',
          input: 'Một dòng văn bản (≤ 1000 ký tự, có ít nhất một chữ cái).',
          output: 'Mỗi dòng `c: k` với `c` là chữ thường.',
          solution: c`
            #include <stdio.h>
            #include <ctype.h>
            int main() {
                char s[1105]; int cnt[26] = {0};
                if (!fgets(s, sizeof(s), stdin)) s[0] = 0;
                for (int i = 0; s[i]; i++) if (isalpha((unsigned char)s[i])) cnt[tolower((unsigned char)s[i]) - 'a']++;
                for (int i = 0; i < 26; i++) if (cnt[i]) printf("%c: %d\n", 'a' + i, cnt[i]);
                return 0;
            }`,
          tests: ['Hello World', 'aAaA', 'The quick brown fox jumps over the lazy dog', 'C', 'zzz yyy 123 xxx'],
        },
        {
          slug: 'anagram',
          title: 'Kiểm tra đảo chữ (anagram)',
          difficulty: 'medium',
          statement: 'Hai chuỗi là **anagram** của nhau nếu sắp xếp lại các chữ cái của chuỗi này thì được chuỗi kia (không phân biệt hoa thường, bỏ qua khoảng trắng). Ví dụ `Listen` và `Silent`. In `YES` hoặc `NO`.',
          input: 'Hai dòng, mỗi dòng một chuỗi (≤ 1000 ký tự, chỉ gồm chữ cái và khoảng trắng).',
          output: '`YES` hoặc `NO`.',
          solution: c`
            #include <stdio.h>
            #include <ctype.h>
            int main() {
                char s[1105], t[1105]; int cnt[26] = {0};
                if (!fgets(s, sizeof(s), stdin)) s[0] = 0;
                if (!fgets(t, sizeof(t), stdin)) t[0] = 0;
                for (int i = 0; s[i]; i++) if (isalpha((unsigned char)s[i])) cnt[tolower((unsigned char)s[i]) - 'a']++;
                for (int i = 0; t[i]; i++) if (isalpha((unsigned char)t[i])) cnt[tolower((unsigned char)t[i]) - 'a']--;
                int ok = 1;
                for (int i = 0; i < 26; i++) if (cnt[i]) ok = 0;
                printf(ok ? "YES\n" : "NO\n");
                return 0;
            }`,
          tests: ['Listen\nSilent', 'hello\nworld', 'Dormitory\nDirty room', 'abc\nabcc', 'a\nA', 'Astronomer\nMoon starer'],
        },
        {
          slug: 'tach-ho-ten',
          title: 'Tách họ, tên đệm, tên',
          difficulty: 'medium',
          statement: `
            Nhập họ tên đầy đủ (không dấu, các từ cách nhau bởi một hoặc nhiều khoảng trắng, có ít nhất 2 từ). In ra 3 dòng:

            \`\`\`
            Ho: <từ đầu tiên>
            Ten dem: <các từ ở giữa, cách nhau một khoảng trắng; để trống nếu không có>
            Ten: <từ cuối cùng>
            \`\`\`

            Sau đó in thêm dòng thứ 4 là tên viết tắt: các chữ cái đầu của mỗi từ viết hoa, nối liền. Ví dụ \`Nguyen Van An\` → \`NVA\`.
          `,
          input: 'Một dòng chứa họ tên (≤ 200 ký tự).',
          output: '4 dòng như mô tả.',
          solution: c`
            #include <stdio.h>
            #include <ctype.h>
            int main() {
                char w[50][210]; int n = 0;
                while (n < 50 && scanf("%209s", w[n]) == 1) n++;
                printf("Ho: %s\n", w[0]);
                printf("Ten dem:");
                for (int i = 1; i < n - 1; i++) printf(i == 1 ? " %s" : " %s", w[i]);
                printf("\nTen: %s\n", w[n - 1]);
                for (int i = 0; i < n; i++) putchar(toupper((unsigned char)w[i][0]));
                putchar('\n');
                return 0;
            }`,
          tests: ['Nguyen Van An', 'Tran Binh', '  Le   Thi   Thu   Ha  ', 'ton that tung', 'Ho Chi Minh'],
        },
      ],
    },
  ],
};
