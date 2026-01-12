const puppeteer = require('puppeteer');

async function renderToImage(htmlContent) {
  let browser = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();

    await page.setViewport({
      width: 2048,
      height: 2048,
      deviceScaleFactor: 2,
    });

    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
    });

    await new Promise(resolve => setTimeout(resolve, 500));

    const dimensions = await page.evaluate(() => {
      const table = document.querySelector('table');
      if (!table) return { width: 0, height: 0, x: 0, y: 0 };
      
      const rect = table.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
        x: rect.x,
        y: rect.y
      };
    });

    const padding = 80;
    const maxSize = Math.max(dimensions.width, dimensions.height) + padding * 2;
    const offsetX = (maxSize - dimensions.width) / 2;
    const offsetY = (maxSize - dimensions.height) / 2;

    const screenshot = await page.screenshot({
      type: 'png',
      clip: {
        x: dimensions.x - offsetX,
        y: dimensions.y - offsetY,
        width: maxSize,
        height: maxSize,
      },
    });

    return screenshot;

  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = { renderToImage };
