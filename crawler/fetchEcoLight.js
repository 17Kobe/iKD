const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--disable-blink-features=AutomationControlled',
            '--no-sandbox',
            '--disable-setuid-sandbox',
        ],
        defaultViewport: { width: 1280, height: 800 },
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
    await page.goto('https://index.ndc.gov.tw/n/zh_tw', { waitUntil: 'networkidle2' });

    // 等待主燈號區塊出現，拉長 timeout
    await page.waitForSelector('.fraction', { visible: true, timeout: 15000 });
    await new Promise(res => setTimeout(res, 2000));

    const result = await page.evaluate(() => {
        const year = document.querySelector('.calendar .year')?.innerText.trim() || '';
        const month = document.querySelector('.calendar .month')?.innerText.replace(/\s+/g, '').replace(/月/, '') || '';
        const fraction = document.querySelectorAll('.fraction')[0];
        const score = fraction ? fraction.querySelector('span')?.innerText.trim() : '';
        return {
            date: year + '-' + month.padStart(2, '0'),
            score,
        };
    });

    await browser.close();
    if (result && result.date && result.score) {
        console.log(JSON.stringify(result));
    } else {
        console.error('無法取得景氣燈號');
        process.exit(1);
    }
})();
