const https = require('https');
const http = require('http');

async function renderToImage(htmlContent) {
  // Dùng API screenshot miễn phí
  const htmlBase64 = Buffer.from(htmlContent).toString('base64');
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'hcti.io',
      path: '/v1/image',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      auth: 'c5236667-9e47-4f8c-a0e0-311aca9e3f43:a37c7d23-df9d-4c84-8edb-e0b9ddfe08bb'
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.url) {
            // Download ảnh từ URL
            downloadImage(result.url, resolve, reject);
          } else {
            reject(new Error('Failed to generate image'));
          }
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify({ html: htmlBase64 }));
    req.end();
  });
}

function downloadImage(url, resolve, reject) {
  https.get(url, (res) => {
    const chunks = [];
    res.on('data', (chunk) => chunks.push(chunk));
    res.on('end', () => resolve(Buffer.concat(chunks)));
  }).on('error', reject);
}

module.exports = { renderToImage };
