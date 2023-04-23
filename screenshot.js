const chromePaths = require('chrome-paths');
const puppeteer = require('puppeteer-core');
const fs = require('fs');

const filename = 'D:\\Code\\ikd\\ikd-buy-sell-signal.png';

console.log('Deleting existing file...');
fs.unlink(filename, (err) => {
    if (err) {
        console.log('No existing file to delete.');
    } else {
        console.log('Existing file deleted.');
    }

    console.log('Launching Puppeteer...');
    (async () => {
        const browser = await puppeteer.launch({
            executablePath: chromePaths.chrome,
            // executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
            ignoreHTTPSErrors: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: false,
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 1366, height: 768 });

        const url = 'https://17kobe.github.io/iKD/#/?export=true';
        await page.goto(url, { timeout: 60000 }); // 設置等待時間為 60 秒
        await page.waitForSelector('.el-table__fixed-body-wrapper > .el-table__body > tbody tr', { timeout: 60000 }); // 設置等待時間為 60 秒

        const trs = await page.$$('.el-table__fixed-body-wrapper > .el-table__body > tbody tr');
        if (trs.length > 0) {
            // 確保所有元素都出現在屏幕上
            await page.evaluate(() => {
                const scrollHeight = document.documentElement.scrollHeight;
                window.scrollBy(0, scrollHeight);
            });
            await page.waitForTimeout(1000); // 等待 1 秒以讓所有元素出現在屏幕上
            await page.screenshot({ path: filename, fullPage: true });
            console.log(`Screenshot saved to ${filename}.`);
        } else {
            console.log('No screenshot taken.');
        }
        // await browser.close();
    })();
});
