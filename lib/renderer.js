const puppeteer = require('puppeteer');

async function renderToImage(htmlContent) {
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    });

    const page = await browser.newPage();

    await page.setViewport({
      width: 2048,
      height: 2048,
      deviceScaleFactor: 2,
    });

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const dimensions = await page.evaluate(() => {
      const table = document.querySelector('table');
      if (!table) return null;

      const rect = table.getBoundingClientRect();
      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      };
    });

    if (!dimensions) {
      throw new Error('Table not found in HTML');
    }

    const padding = 80;
    const size = Math.max(dimensions.width, dimensions.height) + padding * 2;

    return await page.screenshot({
      type: 'png',
      clip: {
        x: Math.max(dimensions.x - padding, 0),
        y: Math.max(dimensions.y - padding, 0),
        width: size,
        height: size,
      },
    });

  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = { renderToImage };
