'use strict';
/**
 * Nạp ngân hàng bài tập đã được build sẵn (content/problems.json).
 * File này được sinh bởi `npm run build:problems` từ các file nguồn trong thư mục problems/.
 */
const fs = require('node:fs');
const path = require('node:path');

const FILE = process.env.PROBLEMS_FILE || path.join(__dirname, '..', 'content', 'problems.json');

let topics = [];
const bySlug = new Map();

function load() {
  const raw = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  topics = raw.topics;
  bySlug.clear();
  topics.forEach((t, ti) => {
    t.order = ti + 1;
    t.categories.forEach((c) => {
      c.problems.forEach((p) => {
        p.topicSlug = t.slug;
        p.topicTitle = t.title;
        p.categorySlug = c.slug;
        p.categoryTitle = c.title;
        bySlug.set(p.slug, p);
      });
    });
  });
  return topics;
}

function allProblems() { return [...bySlug.values()]; }
function getProblem(slug) { return bySlug.get(slug) || null; }
function getTopics() { return topics; }
function getTopic(slug) { return topics.find((t) => t.slug === slug) || null; }

/** Thông tin rút gọn để hiển thị danh sách. */
function summary(p) {
  return {
    slug: p.slug, title: p.title, difficulty: p.difficulty,
    topicSlug: p.topicSlug, topicTitle: p.topicTitle, categorySlug: p.categorySlug, categoryTitle: p.categoryTitle,
    testCount: p.tests.length,
  };
}

/** Chi tiết bài tập gửi cho trình duyệt — không lộ lời giải và output test ẩn. */
function publicDetail(p, { includeSolution = false } = {}) {
  const topic = getTopic(p.topicSlug);
  const flat = topic.categories.flatMap((c) => c.problems);
  const idx = flat.findIndex((x) => x.slug === p.slug);
  return {
    ...summary(p),
    statementHtml: p.statementHtml,
    hintHtml: p.hintHtml || null,
    starter: p.starter,
    timeLimitMs: p.timeLimitMs,
    memoryMb: p.memoryMb,
    samples: p.tests.filter((t) => !t.hidden).map((t) => ({ input: t.input, output: t.output })),
    hiddenCount: p.tests.filter((t) => t.hidden).length,
    prev: idx > 0 ? flat[idx - 1].slug : null,
    next: idx < flat.length - 1 ? flat[idx + 1].slug : null,
    solution: includeSolution ? p.solution : undefined,
  };
}

module.exports = { load, allProblems, getProblem, getTopics, getTopic, summary, publicDetail, FILE };
