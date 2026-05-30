const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  await page.goto('https://milquufresh.in', { waitUntil: 'networkidle0' });
  
  await page.evaluate(() => {
    localStorage.setItem('adminToken', JSON.stringify({ token: 'fake_token_123', role: 'admin' }));
  });
  
  await page.goto('https://milquufresh.in/admin/dashboard', { waitUntil: 'networkidle0' });
  
  await page.screenshot({ path: 'screenshot.png' });
  console.log("Screenshot saved!");
  
  const content = await page.content();
  console.log("HTML length:", content.length);
  if (content.length < 500) {
    console.log(content);
  }
  
  await browser.close();
})();
