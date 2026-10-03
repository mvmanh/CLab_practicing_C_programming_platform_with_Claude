'use strict';
const path = require('node:path');
const express = require('express');
const config = require('./config');
const auth = require('./auth');

function createApp() {
  const app = express();
  app.disable('x-powered-by');
  if (config.trustProxy) app.set('trust proxy', /^\d+$/.test(config.trustProxy) ? Number(config.trustProxy) : config.trustProxy);

  app.use((req, res, next) => {
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'same-origin',
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data:",
        "font-src 'self' data:",
        "worker-src 'self' blob:",
        "connect-src 'self'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; '),
    });
    next();
  });

  app.use('/api', express.json({ limit: '256kb' }), auth.loadUser, auth.csrfGuard);
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/admin', require('./routes/admin'));
  app.use('/api', require('./routes/problems'));
  app.use('/api', (_req, res) => res.status(404).json({ error: 'Không tìm thấy API.' }));

  const root = path.join(__dirname, '..');
  app.use('/vendor/monaco', express.static(path.join(root, 'node_modules', 'monaco-editor', 'min'), { maxAge: '30d', immutable: true }));
  app.use(express.static(path.join(root, 'public'), { maxAge: '1h', index: 'index.html' }));
  app.get('/{*splat}', (req, res, next) => {
    if (req.accepts('html')) return res.sendFile(path.join(root, 'public', 'index.html'));
    next();
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, _next) => {
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Dữ liệu gửi lên không hợp lệ.' });
    if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Dữ liệu gửi lên quá lớn.' });
    console.error('[error]', req.method, req.originalUrl, err);
    res.status(500).json({ error: 'Lỗi máy chủ. Vui lòng thử lại.' });
  });
  return app;
}

module.exports = { createApp };
