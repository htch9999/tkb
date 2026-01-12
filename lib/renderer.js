const nodeHtmlToImage = require('node-html-to-image');

async function renderToImage(htmlContent) {
  try {
    const image = await nodeHtmlToImage({
      html: htmlContent,
      quality: 100,
      type: 'png',
      puppeteerArgs: {
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ]
      },
      transparent: false,
      encoding: 'buffer'
    });

    return image;
  } catch (error) {
    console.error('Render error:', error);
    throw error;
  }
}

module.exports = { renderToImage };
