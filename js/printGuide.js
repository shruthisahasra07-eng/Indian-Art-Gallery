/**
 * KALAKRITI - Printable Beginner Masterclass Cheat Sheet Generator
 * Opens an elegant, print-ready student worksheet for any of the 35 art forms.
 */

function generatePrintableGuide(art) {
  if (!art) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to open the printable study guide.');
    return;
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${art.title} - Beginner Masterclass Guide | Kalakriti</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      color: #1a1a1a;
      background: #ffffff;
      padding: 32px;
      line-height: 1.5;
    }
    
    .header {
      border-bottom: 2px solid #d4af37;
      padding-bottom: 16px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .brand {
      font-family: 'Cinzel', serif;
      font-size: 13px;
      letter-spacing: 2px;
      color: #8c3b23;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    h1 {
      font-family: 'Cinzel', serif;
      font-size: 26px;
      color: #111;
      margin-bottom: 4px;
    }
    .meta-tags {
      font-size: 12px;
      color: #666;
    }
    .meta-badge {
      display: inline-block;
      background: #f4ede2;
      color: #8c3b23;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 600;
      margin-right: 6px;
    }
    
    .section-title {
      font-family: 'Cinzel', serif;
      font-size: 16px;
      color: #8c3b23;
      border-bottom: 1px solid #e0d5c1;
      padding-bottom: 4px;
      margin: 20px 0 12px 0;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .history-box {
      background: #fdfbf7;
      border-left: 3px solid #d4af37;
      padding: 12px 16px;
      font-size: 13px;
      margin-bottom: 18px;
    }
    
    .supplies-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }
    .supply-card {
      background: #fafafa;
      border: 1px solid #eee;
      border-radius: 6px;
      padding: 12px;
    }
    .supply-card h4 {
      font-size: 13px;
      color: #333;
      margin-bottom: 8px;
    }
    .supply-list {
      list-style: none;
      font-size: 12px;
    }
    .supply-list li {
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .supply-list input {
      accent-color: #8c3b23;
    }
    
    .palette-row {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .swatch {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #f9f9f9;
      border: 1px solid #eee;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
    }
    .swatch-color {
      width: 18px;
      height: 18px;
      border-radius: 3px;
      border: 1px solid rgba(0,0,0,0.15);
    }
    
    .step-list {
      list-style: none;
      counter-reset: step-counter;
      margin-bottom: 24px;
    }
    .step-item {
      counter-increment: step-counter;
      margin-bottom: 14px;
      display: flex;
      gap: 12px;
    }
    .step-num {
      width: 24px;
      height: 24px;
      background: #8c3b23;
      color: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .step-content h4 {
      font-size: 14px;
      color: #111;
      margin-bottom: 2px;
    }
    .step-content p {
      font-size: 12.5px;
      color: #444;
    }
    
    .protips-box {
      background: #f5f8f5;
      border: 1px solid #d7e4d8;
      border-radius: 6px;
      padding: 12px 16px;
      font-size: 12.5px;
      color: #2e5934;
      margin-bottom: 24px;
    }
    .protips-box ul {
      margin-left: 18px;
      margin-top: 6px;
    }
    
    .footer {
      border-top: 1px solid #eee;
      padding-top: 12px;
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #888;
    }
    
    .print-btn {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #8c3b23;
      color: #fff;
      border: none;
      padding: 10px 18px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    @media print {
      .print-btn { display: none; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">🖨️ Print or Save as PDF</button>

  <div class="header">
    <div>
      <div class="brand">Kalakriti • National Digital Indian Art Gallery</div>
      <h1>${art.title}</h1>
      <div class="meta-tags">
        <span class="meta-badge">${art.state}</span>
        <span class="meta-badge">${art.category}</span>
        <span class="meta-badge">${art.era}</span>
        <span class="meta-badge">${art.giStatus}</span>
        <span>Estimated Time: <strong>${art.beginnerTutorial.timeEstimate}</strong></span>
      </div>
    </div>
  </div>

  <div class="history-box">
    <strong>Historical Genesis:</strong> ${art.history.origin}
  </div>

  <h3 class="section-title">1. Starter Supply Checklist</h3>
  <div class="supplies-grid">
    <div class="supply-card">
      <h4>Affordable Beginner Kit:</h4>
      <ul class="supply-list">
        ${art.beginnerTutorial.supplies.beginnerKit.map(item => `<li><input type="checkbox"> <span>${item}</span></li>`).join('')}
      </ul>
    </div>
    <div class="supply-card">
      <h4>Traditional Master Supplies:</h4>
      <ul class="supply-list">
        ${art.beginnerTutorial.supplies.traditional.map(item => `<li><input type="checkbox"> <span>${item}</span></li>`).join('')}
      </ul>
    </div>
  </div>

  <h3 class="section-title">2. Authentic Color Palette</h3>
  <div class="palette-row">
    ${art.beginnerTutorial.colorPalette.map(c => `
      <div class="swatch">
        <div class="swatch-color" style="background-color: ${c.hex}"></div>
        <div>
          <strong>${c.name}</strong> (${c.hex})<br>
          <span style="color:#777">${c.origin}</span>
        </div>
      </div>
    `).join('')}
  </div>

  <h3 class="section-title">3. Step-by-Step Chronological Workflow</h3>
  <ul class="step-list">
    ${art.beginnerTutorial.steps.map((s, idx) => `
      <li class="step-item">
        <div class="step-num">${idx + 1}</div>
        <div class="step-content">
          <h4>${s.phase}</h4>
          <p>${s.instructions}</p>
        </div>
      </li>
    `).join('')}
  </ul>

  <div class="protips-box">
    <strong>💡 Master Artisan Pro-Tips:</strong>
    <ul>
      ${art.beginnerTutorial.proTips.map(tip => `<li>${tip}</li>`).join('')}
    </ul>
  </div>

  <div class="footer">
    <div>Curated with reverence by Kalakriti Digital Art Gallery • Preserving 5,000+ Years of Indian Heritage</div>
    <div>Page 1 of 1 • Beginner Student Study Sheet</div>
  </div>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

window.generatePrintableGuide = generatePrintableGuide;
