const puppeteer = require('puppeteer');
const fs = require('fs');

const filename = 'D:\\Code\\ikd-buy-sell-signal.png';

console.log('Deleting existing file...');
fs.unlink(filename, (err) => {
    if (err) {
        console.log('No existing file to delete.');
    } else {
        console.log('Existing file deleted.');
    }

    console.log('Launching Puppeteer...');
    (async () => {
        const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 720 });
        const url = 'https://17kobe.github.io/iKD/#/?export=true';
        await page.goto(url);
        const trs = await page.$$(
            '#app > div > main > div:nth-child(1) > div.el-table--fit.el-table--scrollable-x.el-table--enable-row-transition.el-table > div.el-table__fixed > div.el-table__fixed-body-wrapper > table > tbody tr'
        );
        if (trs.length > 0) {
            await page.screenshot({ path: filename, fullPage: true });
            console.log(`Screenshot saved to ${filename}.`);
        } else {
            console.log('No screenshot taken.');
        }
        await browser.close();
    })();
});
