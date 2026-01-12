const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

async function renderToImage(htmlContent) {
  let browser = null;

  try {
    // THÊM DÒNG NÀY - Quan trọng cho Vercel
    chromium.setHeadlessMode = true;
    chromium.setGraphicsMode = false;

    browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-sandbox',
        '--single-process',
        '--no-zygote'
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath({
        // THÊM OPTION NÀY
        lambdaFS: '/tmp'
      }),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
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

    await page.waitForTimeout(500);

    const dimensions = await page.evaluate(() => {
      const table = document.querySelector('table');
      if (!table) return { width: 0, height: 0 };
      
      const rect = table.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
      };
    });

    const padding = 80;
    const maxSize = Math.max(dimensions.width, dimensions.height) + padding * 2;

    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: false,
      clip: {
        x: 0,
        y: 0,
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
