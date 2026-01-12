const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

async function renderToImage(htmlContent) {
  let browser;

  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      defaultViewport: {
        width: 2048,
        height: 2048
      }
    });

    const page = await browser.newPage();

    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0'
    });

    await new Promise(r => setTimeout(r, 300));

    const rect = await page.evaluate(() => {
      const table = document.querySelector('table');
      if (!table) return null;
      const r = table.getBoundingClientRect();
      return { x: r.x, y: r.y, w: r.width, h: r.height };
    });

    if (!rect) throw new Error('Table not found');

    const padding = 80;
    const size = Math.max(rect.w, rect.h) + padding * 2;

    const image = await page.screenshot({
      type: 'png',
      clip: {
        x: rect.x - (size - rect.w) / 2,
        y: rect.y - (size - rect.h) / 2,
        width: size,
        height: size
      }
    });

    return image;

  } finally {
    if (browser) await browser.close();
  }
}

module.exports = { renderToImage };
