const isLocal = process.env.VERCEL !== '1';

let puppeteer, chromium;

if (isLocal) {
  puppeteer = require('puppeteer');
} else {
  puppeteer = require('puppeteer-core');
  chromium = require('@sparticuz/chromium');
}

async function renderToImage(htmlContent) {
  let browser = null;

  try {
    if (isLocal) {
      browser = await puppeteer.launch({ headless: true });
    } else {
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      });
    }

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
