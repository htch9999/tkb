const express = require('express');
const rendererHandler = require('./api/renderer');

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Middleware để parse JSON & text
 * multipart/form-data sẽ do Busboy xử lý trong renderer.js
 */
app.use(express.json({ limit: '50mb' }));
app.use(express.text({ limit: '50mb', type: 'text/plain' }));

// Health check (Railway thích có cái này)
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'timetable-renderer',
  });
});

// API chính
app.post('/api/render', async (req, res) => {
  // Renderer của cậu đã xử lý toàn bộ logic rồi
  return rendererHandler(req, res);
});

// Method không hỗ trợ
app.all('/api/render', (req, res) => {
  res.status(405).json({ error: 'Method not allowed. Use POST.' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
