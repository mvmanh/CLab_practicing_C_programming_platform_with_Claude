/* Trình soạn thảo mã: Monaco Editor (lõi của VS Code), tự động dùng textarea nếu không tải được. */
import { currentTheme, onThemeChange } from './app.js';

let monacoPromise = null;

export function loadMonaco() {
  if (monacoPromise) return monacoPromise;
  monacoPromise = new Promise((resolve) => {
    if (window.monaco) { resolve(window.monaco); return; }
    const timer = setTimeout(() => resolve(null), 20000);
    const s = document.createElement('script');
    s.src = '/vendor/monaco/vs/loader.js';
    s.onload = () => {
      window.require.config({ paths: { vs: '/vendor/monaco/vs' } });
      window.require(['vs/editor/editor.main'], () => {
        clearTimeout(timer);
        setupLanguage(window.monaco);
        resolve(window.monaco);
      }, () => { clearTimeout(timer); resolve(null); });
    };
    s.onerror = () => { clearTimeout(timer); resolve(null); };
    document.head.appendChild(s);
  });
  return monacoPromise;
}

const C_SNIPPETS = [
  ['main', 'Khung chương trình', '#include <stdio.h>\n\nint main() {\n\t${0}\n\treturn 0;\n}'],
  ['for', 'Vòng lặp for', 'for (int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n\t${0}\n}'],
  ['fori', 'Vòng lặp for từ 1..n', 'for (int ${1:i} = 1; ${1:i} <= ${2:n}; ${1:i}++) {\n\t${0}\n}'],
  ['while', 'Vòng lặp while', 'while (${1:dieu_kien}) {\n\t${0}\n}'],
  ['dowhile', 'Vòng lặp do-while', 'do {\n\t${0}\n} while (${1:dieu_kien});'],
  ['if', 'Câu lệnh if', 'if (${1:dieu_kien}) {\n\t${0}\n}'],
  ['ifelse', 'Câu lệnh if-else', 'if (${1:dieu_kien}) {\n\t${2}\n} else {\n\t${0}\n}'],
  ['switch', 'Câu lệnh switch', 'switch (${1:bien}) {\n\tcase ${2:1}:\n\t\t${0}\n\t\tbreak;\n\tdefault:\n\t\tbreak;\n}'],
  ['printf', 'In ra màn hình', 'printf("${1:%d}\\n", ${2:x});'],
  ['scanf', 'Nhập dữ liệu', 'scanf("${1:%d}", &${2:x});'],
  ['struct', 'Khai báo struct', 'typedef struct {\n\t${0}\n} ${1:TenKieu};'],
  ['func', 'Khai báo hàm', '${1:int} ${2:tenHam}(${3}) {\n\t${0}\n}'],
  ['malloc', 'Cấp phát động mảng', '${1:int} *${2:a} = (${1:int} *)malloc(${3:n} * sizeof(${1:int}));'],
  ['readarr', 'Nhập mảng n phần tử', 'for (int i = 0; i < ${1:n}; i++) scanf("%d", &${2:a}[i]);'],
  ['printarr', 'In mảng n phần tử', 'for (int i = 0; i < ${1:n}; i++) printf(i ? " %d" : "%d", ${2:a}[i]);\nprintf("\\n");'],
];
const C_FUNCS = [
  ['printf', 'int printf(const char *format, ...)', 'stdio.h'], ['scanf', 'int scanf(const char *format, ...)', 'stdio.h'],
  ['puts', 'int puts(const char *s)', 'stdio.h'], ['putchar', 'int putchar(int c)', 'stdio.h'], ['getchar', 'int getchar(void)', 'stdio.h'],
  ['fgets', 'char *fgets(char *s, int n, FILE *stream)', 'stdio.h'], ['sprintf', 'int sprintf(char *s, const char *format, ...)', 'stdio.h'],
  ['sscanf', 'int sscanf(const char *s, const char *format, ...)', 'stdio.h'],
  ['strlen', 'size_t strlen(const char *s)', 'string.h'], ['strcpy', 'char *strcpy(char *dst, const char *src)', 'string.h'],
  ['strncpy', 'char *strncpy(char *dst, const char *src, size_t n)', 'string.h'], ['strcat', 'char *strcat(char *dst, const char *src)', 'string.h'],
  ['strcmp', 'int strcmp(const char *a, const char *b)', 'string.h'], ['strncmp', 'int strncmp(const char *a, const char *b, size_t n)', 'string.h'],
  ['strchr', 'char *strchr(const char *s, int c)', 'string.h'], ['strstr', 'char *strstr(const char *s, const char *sub)', 'string.h'],
  ['strtok', 'char *strtok(char *s, const char *delim)', 'string.h'], ['strcspn', 'size_t strcspn(const char *s, const char *reject)', 'string.h'],
  ['memset', 'void *memset(void *s, int c, size_t n)', 'string.h'], ['memcpy', 'void *memcpy(void *dst, const void *src, size_t n)', 'string.h'],
  ['malloc', 'void *malloc(size_t size)', 'stdlib.h'], ['calloc', 'void *calloc(size_t n, size_t size)', 'stdlib.h'],
  ['realloc', 'void *realloc(void *p, size_t size)', 'stdlib.h'], ['free', 'void free(void *p)', 'stdlib.h'],
  ['qsort', 'void qsort(void *base, size_t n, size_t size, int (*cmp)(const void *, const void *))', 'stdlib.h'],
  ['abs', 'int abs(int x)', 'stdlib.h'], ['llabs', 'long long llabs(long long x)', 'stdlib.h'], ['atoi', 'int atoi(const char *s)', 'stdlib.h'],
  ['atoll', 'long long atoll(const char *s)', 'stdlib.h'], ['rand', 'int rand(void)', 'stdlib.h'], ['exit', 'void exit(int status)', 'stdlib.h'],
  ['sqrt', 'double sqrt(double x)', 'math.h'], ['pow', 'double pow(double x, double y)', 'math.h'], ['fabs', 'double fabs(double x)', 'math.h'],
  ['floor', 'double floor(double x)', 'math.h'], ['ceil', 'double ceil(double x)', 'math.h'], ['round', 'double round(double x)', 'math.h'],
  ['sin', 'double sin(double x)', 'math.h'], ['cos', 'double cos(double x)', 'math.h'], ['log', 'double log(double x)', 'math.h'],
  ['isalpha', 'int isalpha(int c)', 'ctype.h'], ['isdigit', 'int isdigit(int c)', 'ctype.h'], ['isalnum', 'int isalnum(int c)', 'ctype.h'],
  ['isspace', 'int isspace(int c)', 'ctype.h'], ['isupper', 'int isupper(int c)', 'ctype.h'], ['islower', 'int islower(int c)', 'ctype.h'],
  ['toupper', 'int toupper(int c)', 'ctype.h'], ['tolower', 'int tolower(int c)', 'ctype.h'],
];

function setupLanguage(monaco) {
  monaco.languages.registerCompletionItemProvider('c', {
    provideCompletionItems(model, position) {
      const word = model.getWordUntilPosition(position);
      const range = { startLineNumber: position.lineNumber, endLineNumber: position.lineNumber, startColumn: word.startColumn, endColumn: word.endColumn };
      const K = monaco.languages.CompletionItemKind;
      const Rule = monaco.languages.CompletionItemInsertTextRule;
      const words = new Set();
      for (const m of model.getValue().matchAll(/\b[A-Za-z_]\w{2,}\b/g)) words.add(m[0]);
      const suggestions = [
        ...C_SNIPPETS.map(([label, doc, text]) => ({ label, kind: K.Snippet, documentation: doc, detail: 'snippet', insertText: text, insertTextRules: Rule.InsertAsSnippet, range })),
        ...C_FUNCS.map(([label, sig, hdr]) => ({ label, kind: K.Function, detail: sig, documentation: `#include <${hdr}>`, insertText: label, range })),
        ...['int', 'long long', 'double', 'float', 'char', 'void', 'unsigned', 'const', 'static', 'struct', 'typedef', 'return', 'break', 'continue', 'sizeof', 'NULL']
          .map((label) => ({ label, kind: K.Keyword, insertText: label, range })),
        ...[...words].filter((w) => w !== word.word).map((label) => ({ label, kind: K.Text, insertText: label, range, sortText: 'z' + label })),
      ];
      return { suggestions };
    },
  });
}

/** Phân tích output của gcc thành danh sách marker cho editor. */
export function parseGccOutput(text) {
  const out = [];
  for (const line of String(text || '').split('\n')) {
    const m = /^main\.c:(\d+):(\d+):\s*(fatal error|error|warning|note):\s*(.*)$/.exec(line);
    if (m) out.push({ line: Number(m[1]), col: Number(m[2]), severity: m[3], message: m[4] });
  }
  return out;
}

/**
 * Tạo editor trong phần tử el.
 * Trả về đối tượng với các hàm getValue/setValue/setMarkers/focus/dispose/onRun/onSubmit.
 */
export async function createEditor(el, { value = '', readOnly = false, onChange, fontSize } = {}) {
  const monaco = await loadMonaco();
  if (!monaco) return fallbackEditor(el, { value, readOnly, onChange });

  const theme = () => (currentTheme() === 'dark' ? 'vs-dark' : 'vs');
  const editor = monaco.editor.create(el, {
    value,
    language: 'c',
    theme: theme(),
    readOnly,
    automaticLayout: true,
    fontSize: fontSize || Number(localStorage.getItem('editorFontSize')) || 14,
    fontFamily: 'JetBrains Mono, Fira Code, Consolas, Menlo, monospace',
    fontLigatures: true,
    minimap: { enabled: !readOnly && el.clientWidth > 700 },
    scrollBeyondLastLine: false,
    tabSize: 4,
    insertSpaces: true,
    renderWhitespace: 'selection',
    bracketPairColorization: { enabled: true },
    guides: { bracketPairs: true, indentation: true },
    smoothScrolling: true,
    cursorBlinking: 'smooth',
    padding: { top: 10 },
    wordWrap: readOnly ? 'on' : 'off',
    stickyScroll: { enabled: false },
  });
  const offTheme = onThemeChange(() => monaco.editor.setTheme(theme()));
  let changeSub = null;
  if (onChange) changeSub = editor.onDidChangeModelContent(() => onChange(editor.getValue()));

  return {
    monaco: true,
    getValue: () => editor.getValue(),
    setValue: (v) => {
      // dùng executeEdits để còn Undo được
      const model = editor.getModel();
      editor.pushUndoStop();
      editor.executeEdits('set', [{ range: model.getFullModelRange(), text: v }]);
      editor.pushUndoStop();
    },
    setMarkers: (items) => {
      const sevMap = { error: monaco.MarkerSeverity.Error, 'fatal error': monaco.MarkerSeverity.Error, warning: monaco.MarkerSeverity.Warning, note: monaco.MarkerSeverity.Info };
      monaco.editor.setModelMarkers(editor.getModel(), 'gcc', (items || []).map((m) => ({
        startLineNumber: m.line, startColumn: m.col, endLineNumber: m.line, endColumn: m.col + 1,
        message: m.message, severity: sevMap[m.severity] || monaco.MarkerSeverity.Info,
      })));
    },
    reveal: (line) => { editor.revealLineInCenter(line); editor.setPosition({ lineNumber: line, column: 1 }); editor.focus(); },
    focus: () => editor.focus(),
    addKey: (combo, fn) => {
      const KM = monaco.KeyMod;
      const KC = monaco.KeyCode;
      const map = { 'mod+enter': KM.CtrlCmd | KC.Enter, "mod+'": KM.CtrlCmd | KC.Quote, 'mod+s': KM.CtrlCmd | KC.KeyS };
      if (map[combo]) editor.addCommand(map[combo], fn);
    },
    setFontSize: (n) => editor.updateOptions({ fontSize: n }),
    layout: () => editor.layout(),
    dispose: () => { offTheme(); changeSub?.dispose(); editor.getModel()?.dispose(); editor.dispose(); },
  };
}

function fallbackEditor(el, { value, readOnly, onChange }) {
  const ta = document.createElement('textarea');
  ta.className = 'fallback-editor';
  ta.value = value;
  ta.readOnly = readOnly;
  ta.spellcheck = false;
  ta.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const s = ta.selectionStart;
      ta.setRangeText('    ', s, ta.selectionEnd, 'end');
      onChange?.(ta.value);
    }
  });
  if (onChange) ta.addEventListener('input', () => onChange(ta.value));
  el.appendChild(ta);
  const keys = [];
  ta.addEventListener('keydown', (e) => {
    const mod = e.ctrlKey || e.metaKey;
    for (const [combo, fn] of keys) {
      if (combo === 'mod+enter' && mod && e.key === 'Enter') { e.preventDefault(); fn(); }
      if (combo === "mod+'" && mod && e.key === "'") { e.preventDefault(); fn(); }
      if (combo === 'mod+s' && mod && e.key.toLowerCase() === 's') { e.preventDefault(); fn(); }
    }
  });
  return {
    monaco: false,
    getValue: () => ta.value,
    setValue: (v) => { ta.value = v; onChange?.(v); },
    setMarkers: () => {},
    reveal: () => ta.focus(),
    focus: () => ta.focus(),
    addKey: (combo, fn) => keys.push([combo, fn]),
    setFontSize: (n) => { ta.style.fontSize = n + 'px'; },
    layout: () => {},
    dispose: () => ta.remove(),
  };
}
