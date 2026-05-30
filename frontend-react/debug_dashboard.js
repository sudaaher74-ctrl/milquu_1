import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
  console.log('Starting puppeteer...');
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

  console.log('Going to /admin/login to set origin...');
  await page.goto('http://localhost:4173/admin/login', { waitUntil: 'networkidle0' });
  
  console.log('Setting localStorage adminToken...');
  await page.evaluate(() => {
    localStorage.setItem('adminToken', JSON.stringify({
      token: 'mock-token',
      role: 'admin',
      name: 'Admin',
      email: 'admin@milquu.com'
    }));
  });

  console.log('Navigating to /admin...');
  await page.goto('http://localhost:4173/admin', { waitUntil: 'networkidle0' });
  
  console.log('Waiting a bit...');
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('Capturing HTML body...');
  const bodyHTML = await page.evaluate(() => document.body.innerHTML);
  fs.writeFileSync('dashboard_body.html', bodyHTML);
  console.log('Wrote HTML to dashboard_body.html');
  
  console.log('Taking screenshot...');
  await page.screenshot({ path: 'dashboard.png' });
  
  await browser.close();
  console.log('Done.');
})();
