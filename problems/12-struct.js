const c = String.raw;

module.exports = {
  slug: 'cau-truc-struct',
  title: 'Kiểu cấu trúc (struct)',
  icon: '🗂️',
  description: 'Định nghĩa struct, typedef, mảng cấu trúc, con trỏ tới cấu trúc và các bài toán quản lý.',
  intro: `
    **Kiến thức cần nhớ**

    \`\`\`c
    typedef struct {
        char ten[50];
        int tuoi;
        double diem;
    } SinhVien;
    \`\`\`

    - Truy cập trường: \`sv.diem\`; qua con trỏ: \`p->diem\` (tương đương \`(*p).diem\`).
    - Có thể gán cả struct: \`SinhVien b = a;\` (sao chép toàn bộ các trường).
    - Truyền struct lớn vào hàm nên dùng con trỏ (\`const SinhVien *p\`) để tránh sao chép.
    - Sắp xếp mảng struct với \`qsort\` cần hàm so sánh nhận \`const void *\`.
  `,
  categories: [
    {
      slug: 'struct-toan-hoc',
      title: 'Struct trong toán học',
      description: 'Phân số, số phức, điểm, hình học.',
      problems: [
        {
          slug: 'cong-phan-so',
          title: 'Phép toán trên phân số',
          difficulty: 'medium',
          statement: `
            Định nghĩa \`typedef struct { long long tu, mau; } PhanSo;\` và viết các hàm rút gọn, cộng, trừ, nhân, chia phân số.

            Nhập hai phân số, in ra kết quả của \`p1 + p2\`, \`p1 - p2\`, \`p1 * p2\`, \`p1 / p2\` (mỗi kết quả một dòng)
            dưới dạng tối giản \`a/b\` với \`b > 0\`. Nếu mẫu bằng 1 thì chỉ in tử số. Nếu phép chia không thực hiện được (p2 = 0) in \`INVALID\`.
          `,
          input: 'Hai dòng, mỗi dòng `tu mau` của một phân số (mau ≠ 0, |tu|, |mau| ≤ 10<sup>4</sup>).',
          output: 'Bốn dòng như mô tả.',
          starter: c`
            #include <stdio.h>

            typedef struct {
                long long tu, mau;
            } PhanSo;

            PhanSo rutGon(PhanSo p) {
                // TODO
                return p;
            }

            // TODO: cong, tru, nhan, chia, inPhanSo

            int main() {
                PhanSo a, b;
                scanf("%lld %lld %lld %lld", &a.tu, &a.mau, &b.tu, &b.mau);
                // TODO
                return 0;
            }`,
          solution: c`
            #include <stdio.h>
            #include <stdlib.h>
            typedef struct { long long tu, mau; } PhanSo;
            long long gcd(long long a, long long b) { a = llabs(a); b = llabs(b); while (b) { long long r = a % b; a = b; b = r; } return a; }
            PhanSo rutGon(PhanSo p) {
                if (p.tu == 0) { p.mau = 1; return p; }
                long long g = gcd(p.tu, p.mau);
                p.tu /= g; p.mau /= g;
                if (p.mau < 0) { p.tu = -p.tu; p.mau = -p.mau; }
                return p;
            }
            PhanSo cong(PhanSo a, PhanSo b) { PhanSo r = {a.tu * b.mau + b.tu * a.mau, a.mau * b.mau}; return rutGon(r); }
            PhanSo tru(PhanSo a, PhanSo b) { PhanSo r = {a.tu * b.mau - b.tu * a.mau, a.mau * b.mau}; return rutGon(r); }
            PhanSo nhan(PhanSo a, PhanSo b) { PhanSo r = {a.tu * b.tu, a.mau * b.mau}; return rutGon(r); }
            PhanSo chia(PhanSo a, PhanSo b) { PhanSo r = {a.tu * b.mau, a.mau * b.tu}; return rutGon(r); }
            void in(PhanSo p) { if (p.mau == 1) printf("%lld\n", p.tu); else printf("%lld/%lld\n", p.tu, p.mau); }
            int main() {
                PhanSo a, b;
                scanf("%lld %lld %lld %lld", &a.tu, &a.mau, &b.tu, &b.mau);
                in(cong(a, b)); in(tru(a, b)); in(nhan(a, b));
                if (b.tu == 0) printf("INVALID\n"); else in(chia(a, b));
                return 0;
            }`,
          tests: ['1 2\n1 3', '3 4\n-3 4', '2 -6\n0 5', '5 1\n2 1', '-7 3\n7 -3', '10000 9999\n9999 10000'],
        },
        {
          slug: 'so-phuc',
          title: 'Số phức',
          difficulty: 'medium',
          statement: `
            Định nghĩa struct \`SoPhuc { double thuc, ao; }\`. Nhập hai số phức z1 = a + bi và z2 = c + di.
            In ra (mỗi kết quả một dòng, các số với 2 chữ số thập phân):

            1. z1 + z2 dạng \`x + yi\` hoặc \`x - yi\` (nếu y âm, in giá trị tuyệt đối sau dấu \`-\`)
            2. z1 × z2 cùng định dạng
            3. Mô-đun của z1: |z1| = √(a² + b²)
          `,
          input: 'Bốn số thực `a b c d` (|giá trị| ≤ 1000).',
          output: 'Ba dòng như mô tả.',
          solution: c`
            #include <stdio.h>
            #include <math.h>
            typedef struct { double thuc, ao; } SoPhuc;
            SoPhuc cong(SoPhuc x, SoPhuc y) { SoPhuc r = {x.thuc + y.thuc, x.ao + y.ao}; return r; }
            SoPhuc nhan(SoPhuc x, SoPhuc y) { SoPhuc r = {x.thuc * y.thuc - x.ao * y.ao, x.thuc * y.ao + x.ao * y.thuc}; return r; }
            double fix(double v) { return fabs(v) < 0.005 ? 0.0 : v; }
            void in(SoPhuc z) {
                double re = fix(z.thuc), im = fix(z.ao);
                if (im < 0) printf("%.2f - %.2fi\n", re, -im); else printf("%.2f + %.2fi\n", re, im);
            }
            int main() {
                SoPhuc a, b;
                scanf("%lf %lf %lf %lf", &a.thuc, &a.ao, &b.thuc, &b.ao);
                in(cong(a, b)); in(nhan(a, b));
                printf("%.2f\n", sqrt(a.thuc * a.thuc + a.ao * a.ao));
                return 0;
            }`,
          tests: ['1 2 3 4', '3 4 3 -4', '0 0 5 5', '-1.5 2.5 2 -3', '1 0 0 1', '1000 -1000 -1000 1000'],
        },
        {
          slug: 'diem-gan-goc-nhat',
          title: 'Các điểm gần gốc tọa độ nhất',
          difficulty: 'medium',
          statement: 'Cho `n` điểm có tọa độ nguyên và có tên (một từ). Sắp xếp các điểm theo khoảng cách tới gốc tọa độ O(0, 0) tăng dần; nếu bằng nhau thì theo tên theo thứ tự từ điển. In ra `k` điểm đầu tiên dạng `ten x y`.',
          input: 'Dòng 1: `n k` (1 ≤ k ≤ n ≤ 1000). `n` dòng tiếp theo: `ten x y` (tên ≤ 20 ký tự, |x|, |y| ≤ 10<sup>4</sup>).',
          output: '`k` dòng.',
          hint: 'So sánh bình phương khoảng cách (`x*x + y*y`) để tránh sai số số thực. Dùng `strcmp` để so sánh tên.',
          solution: c`
            #include <stdio.h>
            #include <stdlib.h>
            #include <string.h>
            typedef struct { char ten[25]; int x, y; } Diem;
            int cmp(const void *a, const void *b) {
                const Diem *p = a, *q = b;
                long long dp = (long long)p->x * p->x + (long long)p->y * p->y;
                long long dq = (long long)q->x * q->x + (long long)q->y * q->y;
                if (dp != dq) return dp < dq ? -1 : 1;
                return strcmp(p->ten, q->ten);
            }
            int main() {
                int n, k; Diem d[1005];
                scanf("%d %d", &n, &k);
                for (int i = 0; i < n; i++) scanf("%24s %d %d", d[i].ten, &d[i].x, &d[i].y);
                qsort(d, n, sizeof(Diem), cmp);
                for (int i = 0; i < k; i++) printf("%s %d %d\n", d[i].ten, d[i].x, d[i].y);
                return 0;
            }`,
          tests: ['4 2\nA 3 4\nB 1 1\nC -1 -1\nD 0 5', '1 1\nO 0 0', '3 3\nz 1 0\ny 0 1\nx -1 0', '5 3\nP1 10000 10000\nP2 -3 4\nP3 5 0\nP4 0 -5\nP5 1 2'],
        },
      ],
    },
    {
      slug: 'quan-ly-danh-sach',
      title: 'Bài toán quản lý',
      description: 'Mảng struct: sinh viên, sách, nhân viên.',
      problems: [
        {
          slug: 'sinh-vien-diem-cao-nhat',
          title: 'Sinh viên có điểm cao nhất',
          difficulty: 'easy',
          statement: `
            Nhập danh sách \`n\` sinh viên, mỗi sinh viên gồm mã số (một từ), điểm Toán, Lý, Hóa (số thực).
            Điểm trung bình = (Toán + Lý + Hóa) / 3.

            In ra mã số và điểm trung bình (2 chữ số thập phân) của sinh viên có điểm trung bình cao nhất (nếu nhiều sinh viên
            bằng nhau, chọn người xuất hiện đầu tiên), sau đó in số sinh viên có điểm trung bình ≥ 5.
          `,
          input: 'Dòng 1: `n` (1 ≤ n ≤ 1000). `n` dòng tiếp: `ma toan ly hoa`.',
          output: 'Dòng 1: `ma diem_tb`. Dòng 2: số sinh viên đạt.',
          solution: c`
            #include <stdio.h>
            typedef struct { char ma[32]; double toan, ly, hoa; } SinhVien;
            double tb(const SinhVien *s) { return (s->toan + s->ly + s->hoa) / 3; }
            int main() {
                int n, best = 0, dat = 0; SinhVien sv[1005];
                scanf("%d", &n);
                for (int i = 0; i < n; i++) {
                    scanf("%31s %lf %lf %lf", sv[i].ma, &sv[i].toan, &sv[i].ly, &sv[i].hoa);
                    if (tb(&sv[i]) > tb(&sv[best])) best = i;
                    if (tb(&sv[i]) >= 5) dat++;
                }
                printf("%s %.2f\n%d\n", sv[best].ma, tb(&sv[best]), dat);
                return 0;
            }`,
          tests: ['3\nSV01 8 7 9\nSV02 9 9 9\nSV03 4 5 5.5', '1\nA 0 0 0', '2\nX 5 5 5\nY 5 5 5', '4\nB1 10 10 9.5\nB2 3 4 5\nB3 6 6 6\nB4 10 9.5 10'],
        },
        {
          slug: 'sap-xep-sinh-vien',
          title: 'Sắp xếp danh sách sinh viên',
          difficulty: 'medium',
          statement: `
            Nhập danh sách \`n\` sinh viên gồm: mã số, họ tên (có thể có khoảng trắng), điểm trung bình.
            Sắp xếp theo điểm **giảm dần**; nếu bằng điểm thì theo mã số **tăng dần** (thứ tự từ điển).

            In danh sách sau khi sắp xếp, mỗi sinh viên một dòng: \`<STT>. <ma> | <ho ten> | <diem>\` (điểm 2 chữ số thập phân).
          `,
          input: 'Dòng 1: `n` (1 ≤ n ≤ 1000). Mỗi sinh viên gồm 3 dòng: mã số (một từ), họ tên, điểm trung bình.',
          output: '`n` dòng như mô tả.',
          hint: 'Đọc họ tên bằng `fgets` sau khi đã bỏ ký tự xuống dòng còn sót lại (`scanf(" ")` hoặc `getchar()`).',
          solution: c`
            #include <stdio.h>
            #include <stdlib.h>
            #include <string.h>
            typedef struct { char ma[32]; char ten[105]; double diem; } SV;
            int cmp(const void *a, const void *b) {
                const SV *p = a, *q = b;
                if (p->diem != q->diem) return p->diem > q->diem ? -1 : 1;
                return strcmp(p->ma, q->ma);
            }
            int main() {
                int n; static SV s[1005];
                scanf("%d", &n);
                for (int i = 0; i < n; i++) {
                    scanf("%31s", s[i].ma);
                    scanf(" ");
                    if (!fgets(s[i].ten, sizeof(s[i].ten), stdin)) s[i].ten[0] = 0;
                    s[i].ten[strcspn(s[i].ten, "\r\n")] = 0;
                    scanf("%lf", &s[i].diem);
                }
                qsort(s, n, sizeof(SV), cmp);
                for (int i = 0; i < n; i++) printf("%d. %s | %s | %.2f\n", i + 1, s[i].ma, s[i].ten, s[i].diem);
                return 0;
            }`,
          tests: [
            '3\nSV03\nNguyen Van A\n7.5\nSV01\nTran Thi B\n8.25\nSV02\nLe C\n7.5',
            '1\nX1\nMot Nguoi\n10',
            '4\nB\nHo Ten B\n5\nA\nHo Ten A\n5\nD\nHo Ten D\n9\nC\nHo Ten C\n0',
            '2\nSV10\nPham   Minh   Duc\n6.75\nSV09\nVu Hoang\n6.80',
          ],
        },
        {
          slug: 'thong-ke-sach',
          title: 'Thống kê thư viện',
          difficulty: 'medium',
          statement: `
            Mỗi cuốn sách gồm: mã sách, năm xuất bản, giá (nghìn đồng), thể loại (một từ). Nhập \`n\` cuốn sách và in ra:

            1. Tổng giá trị tất cả sách.
            2. Mã cuốn sách cũ nhất (năm nhỏ nhất; nếu bằng nhau chọn cuốn xuất hiện trước).
            3. Với mỗi thể loại (theo thứ tự xuất hiện lần đầu): \`<the loai>: <so cuon> cuon, gia TB <gia trung binh 2 chữ số>\`.
          `,
          input: 'Dòng 1: `n` (1 ≤ n ≤ 1000). `n` dòng tiếp: `ma nam gia the_loai` (giá là số nguyên ≤ 10<sup>6</sup>).',
          output: 'Như mô tả.',
          solution: c`
            #include <stdio.h>
            #include <string.h>
            typedef struct { char ma[32]; int nam; long long gia; char loai[32]; } Sach;
            int main() {
                int n, cu = 0; long long tong = 0; Sach s[1005];
                char loai[1005][32]; int dem[1005] = {0}; long long tg[1005] = {0}; int k = 0;
                scanf("%d", &n);
                for (int i = 0; i < n; i++) {
                    scanf("%31s %d %lld %31s", s[i].ma, &s[i].nam, &s[i].gia, s[i].loai);
                    tong += s[i].gia;
                    if (s[i].nam < s[cu].nam) cu = i;
                    int j = 0;
                    while (j < k && strcmp(loai[j], s[i].loai) != 0) j++;
                    if (j == k) strcpy(loai[k++], s[i].loai);
                    dem[j]++; tg[j] += s[i].gia;
                }
                printf("%lld\n%s\n", tong, s[cu].ma);
                for (int j = 0; j < k; j++) printf("%s: %d cuon, gia TB %.2f\n", loai[j], dem[j], (double)tg[j] / dem[j]);
                return 0;
            }`,
          tests: ['4\nS1 2010 120 KHTN\nS2 1999 80 VanHoc\nS3 2020 150 KHTN\nS4 1999 95 VanHoc', '1\nX 2000 1 A', '3\nA 2001 10 T\nB 2002 20 T\nC 2003 31 T', '5\nM1 1980 500 Su\nM2 1975 300 Dia\nM3 1990 250 Su\nM4 1975 100 Toan\nM5 2000 1000000 Toan'],
        },
        {
          slug: 'cong-thoi-gian',
          title: 'Cộng thời gian',
          difficulty: 'easy',
          statement: `
            Định nghĩa \`typedef struct { int gio, phut, giay; } ThoiGian;\`. Nhập một mốc thời gian trong ngày và một
            khoảng thời gian (tính bằng giây). In ra mốc thời gian sau khi cộng, dạng \`hh:mm:ss\` (24 giờ, quay vòng qua nửa đêm),
            kèm số ngày bị vượt qua: \`hh:mm:ss (+d ngay)\` nếu d > 0.
          `,
          input: 'Dòng 1: `gio phut giay` (thời gian hợp lệ trong ngày). Dòng 2: số giây cần cộng `s` (0 ≤ s ≤ 10<sup>9</sup>).',
          output: 'Thời gian kết quả.',
          solution: c`
            #include <stdio.h>
            typedef struct { int gio, phut, giay; } ThoiGian;
            int main() {
                ThoiGian t; long long s;
                scanf("%d %d %d %lld", &t.gio, &t.phut, &t.giay, &s);
                long long tong = t.gio * 3600LL + t.phut * 60 + t.giay + s;
                long long d = tong / 86400; tong %= 86400;
                t.gio = tong / 3600; t.phut = tong % 3600 / 60; t.giay = tong % 60;
                printf("%02d:%02d:%02d", t.gio, t.phut, t.giay);
                if (d > 0) printf(" (+%lld ngay)", d);
                printf("\n");
                return 0;
            }`,
          tests: ['10 30 0\n3600', '23 59 59\n1', '0 0 0\n0', '12 0 0\n1000000000', '8 15 30\n86400'],
        },
      ],
    },
  ],
};
