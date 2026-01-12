const express = require('express');
const app = express();
const renderHandler = require('./api/render');

const PORT = process.env.PORT || 3000;

// Middleware để parse JSON và raw body
app.use(express.json({ limit: '50mb' }));
app.use(express.raw({ type: 'text/plain', limit: '50mb' }));

// Route chính
app.post('/api/render', renderHandler);

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Timetable API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
