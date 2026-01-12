const express = require('express');
const path = require('path');

const renderHandler = require(
  path.join(__dirname, 'api', 'render.js')
);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.text({ limit: '50mb', type: 'text/plain' }));

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'timetable-api' });
});

app.post('/api/render', (req, res) => {
  return renderHandler(req, res);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
