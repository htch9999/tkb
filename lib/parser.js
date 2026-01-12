const { JSDOM } = require('jsdom');

function extractTable(htmlContent, tableId, className) {
  const dom = new JSDOM(htmlContent);
  const document = dom.window.document;
  
  let table = null;

  if (tableId) {
    table = document.getElementById(tableId);
  }

  if (!table && className) {
    const tables = document.querySelectorAll('table');
    for (const t of tables) {
      const headers = t.querySelectorAll('th[colspan]');
      
      for (const header of headers) {
        const text = header.textContent.trim();
        if (text === className || text.includes(className)) {
          table = t;
          break;
        }
      }
      
      if (table) break;
    }
  }

  if (!table) {
    return null;
  }

  const caption = table.querySelector('caption');
  if (caption) caption.remove();
  
  const footer = table.querySelector('tr.foot');
  if (footer) footer.remove();

  // THÊM CLASS CHO CÁC Ô NGHỈ
  const cells = table.querySelectorAll('tbody td');
  cells.forEach(cell => {
    const text = cell.textContent.trim();
    if (text === '-x-' || text === '' || text.includes('-x-')) {
      cell.classList.add('休み'); // Thêm class 'break'
    }
  });

  const styledHtml = createStyledHtml(table.outerHTML);
  return styledHtml;
}

function createStyledHtml(tableHtml) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body, table, th, td {
      font-family: 'Quicksand', -apple-system, BlinkMacSystemFont,
                   'Segoe UI', Roboto, sans-serif;
    }

    th, td {
      font-weight: 900;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    html, body {
      width: 100%;
      height: 100%;
    }
    
    body {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 50px;
      background: #f8f9fa;
    }
    
    table {
      border-collapse: collapse;
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 5px 25px rgba(0, 0, 0, 0.1);
      margin: auto;
    }
    
    thead tr:first-child td {
      background: #6c5ce7;
      color: white;
      font-size: 20px;
      padding: 20px;
      text-align: center;
      font-weight: 700;
    }
    
    thead tr:first-child td::before {
      content: "=)";
      display: block;
      font-size: 24px;
      margin-bottom: 4px;
    }
    
    thead tr:first-child th {
      background: #6c5ce7;
      color: white;
      font-size: 25px;
      font-weight: 700;
      padding: 20px;
      text-align: center;
      letter-spacing: 0.5px;
    }
    
    thead tr:last-child th.xAxis {
      background: #a29bfe;
      color: white;
      font-size: 15px;
      font-weight: 700;
      padding: 14px 12px;
      text-align: center;
      border-right: 1px solid rgba(255, 255, 255, 0.15);
    }
    
    thead tr:last-child th:last-child {
      border-right: none;
    }
    
    th.yAxis {
      background: #a29bfe;
      color: white;
      font-weight: 600;
      font-size: 14px;
      padding: 14px 16px;
      min-width: 90px;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    td {
      padding: 16px 12px;
      text-align: center;
      font-size: 14px;
      line-height: 1.7;
      border: 1px solid #e9ecef;
      background: white;
      vertical-align: middle;
      color: #2d3436;
    }
    
    tbody tr:nth-child(odd) td {
      background: #ffffff;
    }
    
    tbody tr:nth-child(even) td {
      background: #fafafb;
    }
    
    /* Tiết nghỉ - màu tím nhạt hài hòa */
    tbody tr:nth-child(odd) td.休み {
      background: #f3f0ff !important;
      color: #a29bfe !important;
      font-style: italic;
    }
    
    tbody tr:nth-child(even) td.休み {
      background: #ede9fe !important;
      color: #a29bfe !important;
      font-style: italic;
    }
    
    tbody tr:hover td {
      background: #f3f0ff;
      transition: background 0.2s ease;
    }
    
    tbody tr:hover td.休み {
      background: #e5deff !important;
    }
    
    td br {
      display: block;
      content: "";
      margin: 3px 0;
    }
    
    thead tr:first-child td:first-child {
      border-top-left-radius: 10px;
    }
    
    thead tr:first-child th:last-child {
      border-top-right-radius: 10px;
    }
    
    tbody tr:last-child th:first-child {
      border-bottom-left-radius: 10px;
    }
    
    tbody tr:last-child td:last-child {
      border-bottom-right-radius: 10px;
    }
  </style>
</head>
<body>
  ${tableHtml}
</body>
</html>
  `.trim();
}

module.exports = { extractTable };
