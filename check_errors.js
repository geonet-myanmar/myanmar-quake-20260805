import puppeteer from 'puppeteer';

(async () => {
  try {
    const browser = await puppeteer.launch({ 
      headless: true,
      executablePath: 'C:\\Users\\Tin Ko Oo\\.cache\\puppeteer\\chrome\\win64-151.0.7922.71\\chrome-win64\\chrome.exe'
    });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

    console.log('Navigating to live site...');
    await page.goto('https://geonet-myanmar.github.io/myanmar-quake-20260805/', { waitUntil: 'networkidle0' });
    
    await browser.close();
  } catch (e) {
    console.error(e);
  }
})();
