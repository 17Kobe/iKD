const chromePaths = require('chrome-paths');
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

const now = moment();
const timestamp = now.format('YYYYMMDDHH');
const filename = `D:\\Code\\ikd\\dist\\assets\\images\\ikd-buy-sell-signal-${timestamp}.png`;

console.log('Delete image files older than one month...');
const imageDirectory = './dist/assets/images';
const files = fs.readdirSync(imageDirectory);
const oneMonthAgo = moment().subtract(1, 'month');
files.forEach((image) => {
    const imagePath = path.join(imageDirectory, image);
    const imageDate = moment(image.match(/(\d{10})/)[1], 'YYYYMMDDHH');
    if (imageDate.isBefore(oneMonthAgo)) {
        fs.unlinkSync(imagePath);
        console.log(`Image ${image} has been deleted.`);
    }
});
// 這樣寫法是讓刪除一定要在 puppeteer 前執行
// fs.unlink(filename, (err) => {
//     if (err) {
//         console.log('No existing file to delete.');
//     } else {
//         console.log('Existing file deleted.');
//     }

console.log('Launching Puppeteer...');
(async () => {
    const browser = await puppeteer.launch({
        executablePath: chromePaths.chrome,
        // executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
        ignoreHTTPSErrors: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true,
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1295, height: 512 });

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
        console.log(`ikd-buy-sell-signal-${timestamp}.png`);
    } else {
        console.log('No screenshot taken.');
        console.log('');
    }
    await browser.close();

    // fs.unlink(filename, (err) => {
    //     if (err) {
    //         console.log('No existing file to delete.');
    //     } else {
    //         console.log('Existing file deleted.');
    //     }
    // });
})();
// });
