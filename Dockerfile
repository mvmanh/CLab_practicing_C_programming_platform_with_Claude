# ---- C Lab: nền tảng luyện tập lập trình C ----
FROM node:22-bookworm-slim

# gcc + thư viện chuẩn C để biên dịch bài nộp
RUN apt-get update \
 && apt-get install -y --no-install-recommends gcc libc6-dev tini \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY . .
# Sinh đáp án cho toàn bộ test case từ lời giải mẫu
RUN node scripts/build-problems.js

# Chạy bằng user không có quyền root
RUN useradd --create-home --uid 10001 clab && mkdir -p /app/data /tmp/cjudge && chown -R clab:clab /app/data /tmp/cjudge
USER clab

ENV PORT=3000 DATA_DIR=/app/data
EXPOSE 3000
VOLUME ["/app/data"]
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "--disable-warning=ExperimentalWarning", "server/index.js"]
