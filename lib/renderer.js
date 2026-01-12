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

    // Tăng viewport để có không gian phóng to
    await page.setViewport({
      width: 3000,
      height: 3000,
      deviceScaleFactor: 2,
    });

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // Phóng to bảng và đo lại kích thước
    const dimensions = await page.evaluate(() => {
      const table = document.querySelector('table');
      if (!table) return null;

      // Phóng to bảng bằng CSS transform
      table.style.transform = 'scale(1.8)';
      table.style.transformOrigin = 'center center';

      // Đợi một chút để CSS áp dụng
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

    // Tính toán canvas vuông với padding nhỏ hơn
    const padding = 60;
    const tableSize = Math.max(dimensions.width, dimensions.height);
    const canvasSize = tableSize + padding * 2;

    // Tính vị trí để căn giữa bảng trong canvas vuông
    const offsetX = (canvasSize - dimensions.width) / 2;
    const offsetY = (canvasSize - dimensions.height) / 2;

    return await page.screenshot({
      type: 'png',
      clip: {
        x: Math.max(dimensions.x - offsetX, 0),
        y: Math.max(dimensions.y - offsetY, 0),
        width: canvasSize,
        height: canvasSize,
      },
    });

  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = { renderToImage };
