const isLocal = process.env.VERCEL !== '1';
const puppeteer = isLocal 
  ? require('puppeteer')
  : require('puppeteer-core');

const chromium = isLocal ? null : require('@sparticuz/chromium');

async function renderToImage(htmlContent) {
  let browser = null;

  try {
    if (isLocal) {
      // Local: dùng Chromium có sẵn
      browser = await puppeteer.launch({ headless: true });
    } else {
      // Vercel: dùng @sparticuz/chromium
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

  // Tính kích thước canvas vuông
  const padding = 80;
  const maxSize = Math.max(dimensions.width, dimensions.height) + padding * 2;

  // Tính vị trí để căn giữa
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