/*
 * sandbox.c — liên kết cùng chương trình của người dùng.
 *
 * Hàm sandbox_init() được đặt trong .preinit_array nên chạy TRƯỚC mọi
 * constructor/hàm main của người dùng. Nó:
 *   1. Đặt giới hạn tài nguyên (CPU, bộ nhớ, stack, kích thước file, core dump)
 *      đọc từ biến môi trường SBX_CPU (giây) và SBX_MEM (MB).
 *   2. Cài bộ lọc seccomp-bpf theo kiểu whitelist: chỉ cho phép các system call
 *      cần cho tính toán + đọc/ghi stdin/stdout. Mọi syscall khác (open, socket,
 *      fork, execve, ...) trả về EPERM.
 *
 * Không cần quyền root: PR_SET_NO_NEW_PRIVS cho phép tiến trình thường cài seccomp.
 */
#define _GNU_SOURCE
#include <errno.h>
#include <stddef.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/prctl.h>
#include <sys/resource.h>
#include <sys/syscall.h>
#include <linux/audit.h>
#include <linux/filter.h>
#include <linux/seccomp.h>

#if defined(__x86_64__)
#define SBX_ARCH AUDIT_ARCH_X86_64
#elif defined(__aarch64__)
#define SBX_ARCH AUDIT_ARCH_AARCH64
#else
#error "Kiến trúc CPU chưa được hỗ trợ bởi sandbox"
#endif

#define ALLOW(sysno) \
    BPF_JUMP(BPF_JMP | BPF_JEQ | BPF_K, (sysno), 0, 1), \
    BPF_STMT(BPF_RET | BPF_K, SECCOMP_RET_ALLOW)

/* Cho phép syscall chỉ khi đối số đầu tiên == pid của chính tiến trình. */
#define ALLOW_SELF(sysno, pid) \
    BPF_JUMP(BPF_JMP | BPF_JEQ | BPF_K, (sysno), 0, 4), \
    BPF_STMT(BPF_LD | BPF_W | BPF_ABS, offsetof(struct seccomp_data, args[0])), \
    BPF_JUMP(BPF_JMP | BPF_JEQ | BPF_K, (pid), 0, 1), \
    BPF_STMT(BPF_RET | BPF_K, SECCOMP_RET_ALLOW), \
    BPF_STMT(BPF_LD | BPF_W | BPF_ABS, offsetof(struct seccomp_data, nr))

static void sbx_die(void) { _exit(121); }

static long env_long(const char *name, long def) {
    const char *s = getenv(name);
    if (!s || !*s) return def;
    long v = strtol(s, NULL, 10);
    return v > 0 ? v : def;
}

static void set_limit(int res, rlim_t soft, rlim_t hard) {
    struct rlimit rl = { soft, hard };
    if (setrlimit(res, &rl) != 0) {
        struct rlimit cur;
        if (getrlimit(res, &cur) == 0 && (cur.rlim_max == RLIM_INFINITY || cur.rlim_max > hard)) sbx_die();
    }
}

static void sandbox_init(void) {
    long cpu = env_long("SBX_CPU", 2);
    long mem = env_long("SBX_MEM", 256);

    set_limit(RLIMIT_CPU, (rlim_t)cpu, (rlim_t)cpu + 1);
    set_limit(RLIMIT_AS, (rlim_t)mem * 1024 * 1024, (rlim_t)mem * 1024 * 1024);
    set_limit(RLIMIT_FSIZE, 64UL * 1024 * 1024, 64UL * 1024 * 1024);
    set_limit(RLIMIT_CORE, 0, 0);
    {
        struct rlimit st;
        if (getrlimit(RLIMIT_STACK, &st) == 0) {
            rlim_t want = 64UL * 1024 * 1024;
            if (st.rlim_max != RLIM_INFINITY && st.rlim_max < want) want = st.rlim_max;
            st.rlim_cur = want;
            st.rlim_max = want;
            setrlimit(RLIMIT_STACK, &st);
        }
    }

    unsigned int pid = (unsigned int)getpid();

    struct sock_filter filter[] = {
        BPF_STMT(BPF_LD | BPF_W | BPF_ABS, offsetof(struct seccomp_data, arch)),
        BPF_JUMP(BPF_JMP | BPF_JEQ | BPF_K, SBX_ARCH, 1, 0),
        BPF_STMT(BPF_RET | BPF_K, SECCOMP_RET_KILL_PROCESS),
        BPF_STMT(BPF_LD | BPF_W | BPF_ABS, offsetof(struct seccomp_data, nr)),
#if defined(__x86_64__)
        /* chặn ABI x32 */
        BPF_JUMP(BPF_JMP | BPF_JGE | BPF_K, 0x40000000, 0, 1),
        BPF_STMT(BPF_RET | BPF_K, SECCOMP_RET_KILL_PROCESS),
#endif
        ALLOW(__NR_read),
        ALLOW(__NR_write),
        ALLOW(__NR_readv),
        ALLOW(__NR_writev),
        ALLOW(__NR_pread64),
        ALLOW(__NR_lseek),
        ALLOW(__NR_close),
        ALLOW(__NR_fstat),
#ifdef __NR_newfstatat
        ALLOW(__NR_newfstatat),
#endif
#ifdef __NR_statx
        ALLOW(__NR_statx),
#endif
        ALLOW(__NR_ioctl),
        ALLOW(__NR_fcntl),
        ALLOW(__NR_brk),
        ALLOW(__NR_mmap),
        ALLOW(__NR_munmap),
        ALLOW(__NR_mremap),
        ALLOW(__NR_mprotect),
        ALLOW(__NR_madvise),
        ALLOW(__NR_exit),
        ALLOW(__NR_exit_group),
        ALLOW(__NR_rt_sigaction),
        ALLOW(__NR_rt_sigprocmask),
        ALLOW(__NR_rt_sigreturn),
        ALLOW(__NR_sigaltstack),
        ALLOW(__NR_clock_gettime),
        ALLOW(__NR_clock_getres),
        ALLOW(__NR_gettimeofday),
#ifdef __NR_time
        ALLOW(__NR_time),
#endif
        ALLOW(__NR_nanosleep),
        ALLOW(__NR_clock_nanosleep),
        ALLOW(__NR_getrandom),
        ALLOW(__NR_futex),
        ALLOW(__NR_getpid),
        ALLOW(__NR_gettid),
        ALLOW(__NR_set_tid_address),
        ALLOW(__NR_set_robust_list),
#ifdef __NR_rseq
        ALLOW(__NR_rseq),
#endif
#ifdef __NR_arch_prctl
        ALLOW(__NR_arch_prctl),
#endif
        ALLOW(__NR_prlimit64),
        ALLOW(__NR_getrusage),
        ALLOW(__NR_times),
        ALLOW(__NR_sched_yield),
        ALLOW_SELF(__NR_tgkill, pid),
        ALLOW_SELF(__NR_kill, pid),
        BPF_STMT(BPF_RET | BPF_K, SECCOMP_RET_ERRNO | (EPERM & SECCOMP_RET_DATA)),
    };

    struct sock_fprog prog = {
        .len = (unsigned short)(sizeof(filter) / sizeof(filter[0])),
        .filter = filter,
    };

    if (prctl(PR_SET_NO_NEW_PRIVS, 1, 0, 0, 0) != 0) sbx_die();
    if (prctl(PR_SET_SECCOMP, SECCOMP_MODE_FILTER, &prog) != 0) sbx_die();
}

__attribute__((section(".preinit_array"), used))
static void (*const sbx_preinit)(void) = sandbox_init;
