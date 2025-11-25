// const https = require('https');
const request = require('request');
const fs = require('fs'); //
const _ = require('lodash');
const axios = require('axios');
const moment = require('moment');
const os = require('os');
const HttpsProxyAgent = require('https-proxy-agent');
const cheerio = require('cheerio');

var interfaces = os.networkInterfaces();
var addresses = [];
for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family === 'IPv4' && !address.internal) {
            addresses.push(address.address);
        }
    }
}

// console.log(addresses);
const proxyHost = '10.160.3.88';
const proxyPort = 8080;

const proxy = addresses.includes('10.144.169.121') ? 'http://10.160.3.88:8080' : null;
const agent = addresses.includes('10.144.169.121') ? new HttpsProxyAgent('http://10.160.3.88:8080') : null;

console.log('proxy=' + proxy);

const today = moment().format('YYYY-MM-DD');

// Alpha Vantage API Keys (多組輪替使用)
const ALPHA_VANTAGE_API_KEYS = ['O9AQMAP6D3WFXVM6', '6NW4VW3GB1SYF7HD', '3DUVG0JCYIVKWJ6H'];
let currentApiKeyIndex = 0;

// 取得當前 API Key
function getCurrentApiKey() {
    return ALPHA_VANTAGE_API_KEYS[currentApiKeyIndex];
}

// 切換到下一組 API Key
function switchToNextApiKey() {
    const oldKey = ALPHA_VANTAGE_API_KEYS[currentApiKeyIndex];
    currentApiKeyIndex = (currentApiKeyIndex + 1) % ALPHA_VANTAGE_API_KEYS.length;
    const newKey = ALPHA_VANTAGE_API_KEYS[currentApiKeyIndex];
    console.log(`API Key 已達上限，從 ${oldKey.substring(0, 6)}... 切換到 ${newKey.substring(0, 6)}...`);
    return newKey;
}

// Alpha Vantage API 呼叫計數器和延遲設定
let alphaVantageCallCount = 0;
const ALPHA_VANTAGE_DELAY = 13000; // 13秒延遲 (每分鐘最多5次，免費版限制)

// 新的結構:將 fundName 和 urls 合併為一個物件數組
const funds = [
    {
        name: '富達全球科技基金',
        url:
            'https://tw.stock.yahoo.com/_td-stock/api/resource/FundServices.fundsPriceHistory;fundId=F00000VTAH:FO;timeslot=2012-01-01T00:00:00Z-' +
            today +
            'T23:59:59Z?bkt=&device=desktop&ecma=modern&feature=ecmaModern,useVersionSwitch,useNewQuoteTabColor&intl=tw&lang=zh-Hant-TW&partner=none&prid=e4nof9lh3r54p&region=TW&site=finance&tz=Asia/Taipei&ver=1.2.1233&returnMeta=true',
        type: 'price',
        moneyDjUrl: 'https://www.moneydj.com/funddj/yp/yp010001.djhtm?a=FTZR0',
    },
    {
        name: '安聯台灣智慧基金',
        url:
            'https://tw.stock.yahoo.com/_td-stock/api/resource/FundServices.fundsPriceHistory;fundId=F000001V09:FO;timeslot=2012-01-01T00:00:00Z-' +
            today +
            'T23:59:59Z?bkt=&device=desktop&ecma=modern&feature=ecmaModern,useVersionSwitch,useNewQuoteTabColor&intl=tw&lang=zh-Hant-TW&partner=none&prid=e4nof9lh3r54p&region=TW&site=finance&tz=Asia/Taipei&ver=1.2.1233&returnMeta=true',
        type: 'price',
        moneyDjUrl: 'https://www.moneydj.com/funddj/ya/yp010000.djhtm?a=ACDD19',
    },
    {
        name: '貝萊德世界黃金基金A2',
        url:
            'https://tw.stock.yahoo.com/_td-stock/api/resource/FundServices.fundsPriceHistory;fundId=F0GBR04AR8:FO;timeslot=2012-01-01T00:00:00Z-' +
            today +
            'T23:59:59Z?bkt=&device=desktop&ecma=modern&feature=ecmaModern,useVersionSwitch,useNewQuoteTabColor&intl=tw&lang=zh-Hant-TW&partner=none&prid=e4nof9lh3r54p&region=TW&site=finance&tz=Asia/Taipei&ver=1.2.1233&returnMeta=true',
        type: 'price',
        moneyDjUrl: 'https://www.moneydj.com/funddj/ya/yp010001.djhtm?a=SHZ18',
    },
    {
        name: '貝萊德世界能源基金A2',
        url:
            'https://tw.stock.yahoo.com/_td-stock/api/resource/FundServices.fundsPriceHistory;fundId=F0GBR04K8F:FO;timeslot=2012-01-01T00:00:00Z-' +
            today +
            'T23:59:59Z?bkt=&device=desktop&ecma=modern&feature=ecmaModern,useVersionSwitch,useNewQuoteTabColor&intl=tw&lang=zh-Hant-TW&partner=none&prid=e4nof9lh3r54p&region=TW&site=finance&tz=Asia/Taipei&ver=1.2.1233&returnMeta=true',
        type: 'price',
        moneyDjUrl: 'https://www.moneydj.com/funddj/ya/yp010001.djhtm?a=shza6',
    },
    {
        name: '元大2至10年投資級企業債券基金',
        url:
            'https://tw.stock.yahoo.com/_td-stock/api/resource/FundServices.fundsPriceHistory;fundId=F00001EM6G:FO;timeslot=2012-01-01T00:00:00Z-' +
            today +
            'T23:59:59Z?bkt=&device=desktop&ecma=modern&feature=ecmaModern,useVersionSwitch,useNewQuoteTabColor&intl=tw&lang=zh-Hant-TW&partner=none&prid=e4nof9lh3r54p&region=TW&site=finance&tz=Asia/Taipei&ver=1.2.1233&returnMeta=true',
        type: 'price',
        moneyDjUrl: 'https://www.moneydj.com/funddj/ya/yp010000.djhtm?a=ACYT175',
    },
    {
        name: '元大2至10年投資級企業債券基金',
        url: 'https://www.moneydj.com/funddj/yp/funddividend.djhtm?a=ACYT175',
        type: 'fund_dividend',
    },
    {
        name: '元大美債20年',
        url: 'https://www.cmoney.tw/forum/stock/00679B?s=dividend',
        type: 'stock_dividend',
    },
    {
        name: '元大高股息',
        url: 'https://www.cmoney.tw/forum/stock/0056?s=dividend',
        type: 'stock_dividend',
    },
    {
        name: '彭博高收益債',
        url:
            'https://query1.finance.yahoo.com/v8/finance/chart/JNK?period1=1325376000&period2=' +
            moment().unix() +
            '&interval=1d&events=history',
        type: 'us_stock',
        // 不抓取 EPS 和 PE ratio (ETF)
    },
    {
        name: '微軟',
        url:
            'https://query1.finance.yahoo.com/v8/finance/chart/MSFT?period1=1325376000&period2=' +
            moment().unix() +
            '&interval=1d&events=history',
        type: 'us_stock',
        symbol: 'MSFT',
    },
    {
        name: '谷歌',
        url:
            'https://query1.finance.yahoo.com/v8/finance/chart/GOOGL?period1=1325376000&period2=' +
            moment().unix() +
            '&interval=1d&events=history',
        type: 'us_stock',
        symbol: 'GOOGL',
    },
    {
        name: '輝達',
        url:
            'https://query1.finance.yahoo.com/v8/finance/chart/NVDA?period1=1325376000&period2=' +
            moment().unix() +
            '&interval=1d&events=history',
        type: 'us_stock',
        symbol: 'NVDA',
    },
    {
        name: '蘋果',
        url:
            'https://query1.finance.yahoo.com/v8/finance/chart/AAPL?period1=1325376000&period2=' +
            moment().unix() +
            '&interval=1d&events=history',
        type: 'us_stock',
        symbol: 'AAPL',
    },
    {
        name: '波克夏',
        url:
            'https://query1.finance.yahoo.com/v8/finance/chart/BRK-B?period1=1325376000&period2=' +
            moment().unix() +
            '&interval=1d&events=history',
        type: 'us_stock',
        symbol: 'BRK-B',
    },
    {
        name: 'VOO',
        url:
            'https://query1.finance.yahoo.com/v8/finance/chart/VOO?period1=1325376000&period2=' +
            moment().unix() +
            '&interval=1d&events=history',
        type: 'us_stock',
        // 不抓取 EPS 和 PE ratio (ETF)
    },
    {
        name: 'QQQ',
        url:
            'https://query1.finance.yahoo.com/v8/finance/chart/QQQ?period1=1325376000&period2=' +
            moment().unix() +
            '&interval=1d&events=history',
        type: 'us_stock',
        // 不抓取 EPS 和 PE ratio (ETF)
    },
    {
        name: 'GDX',
        url:
            'https://query1.finance.yahoo.com/v8/finance/chart/GDX?period1=1325376000&period2=' +
            moment().unix() +
            '&interval=1d&events=history',
        type: 'us_stock',
        // 不抓取 EPS 和 PE ratio (ETF)
    },
    // {
    //     name: '群益ESG投等債20+',
    //     url: 'https://www.cmoney.tw/forum/stock/00937B?s=dividend',
    //     type: 'stock_dividend',
    // },
    {
        name: 'CNN Fear & Greed Index',
        url: 'https://money.cnn.com/data/fear-and-greed/',
        type: 'index',
    },
    {
        name: '景氣燈號',
        url: '',
        type: 'eco_light',
    },
];

// 抓取美股 EPS 歷史資料 (使用 Alpha Vantage API，支援多組 Key 輪替)
function fetchUSStockEPS(symbol, retryCount = 0) {
    return new Promise((resolve) => {
        // 如果已經試過所有 Key，放棄
        if (retryCount >= ALPHA_VANTAGE_API_KEYS.length) {
            console.error(`${symbol} EPS: 所有 API Key 都已達上限，無法抓取`);
            resolve([]);
            return;
        }

        // 延遲執行以避免超過 API 限制
        setTimeout(() => {
            alphaVantageCallCount++;
            const apiKey = getCurrentApiKey();
            console.log(`[Alpha Vantage] 呼叫 #${alphaVantageCallCount}: ${symbol} EPS (Key: ${apiKey.substring(0, 6)}...)`);

            const url = `https://www.alphavantage.co/query?function=EARNINGS&symbol=${symbol}&apikey=${apiKey}`;

            request(
                {
                    url: url,
                    json: true,
                    proxy: proxy,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    },
                },
                (error, response, body) => {
                    if (!error && response.statusCode === 200 && body.quarterlyEarnings) {
                        const epsData = body.quarterlyEarnings
                            .filter((item) => item.fiscalDateEnding && item.reportedEPS)
                            .map((item) => ({
                                date: item.fiscalDateEnding,
                                value: parseFloat(item.reportedEPS),
                            }))
                            .filter((item) => !isNaN(item.value))
                            .reverse(); // 由舊到新排序

                        if (epsData.length > 0) {
                            console.log(`成功抓取 ${symbol} EPS 資料，共 ${epsData.length} 筆`);
                            resolve(epsData);
                        } else {
                            console.log(`${symbol} 無 EPS 資料`);
                            resolve([]);
                        }
                    } else if (body?.Note || body?.Information?.includes('API rate limit')) {
                        console.warn(`${symbol} EPS API 限制: 已達每日上限，嘗試切換 Key...`);
                        switchToNextApiKey();
                        // 遞迴重試，使用下一組 Key
                        resolve(fetchUSStockEPS(symbol, retryCount + 1));
                    } else {
                        console.error(`抓取 ${symbol} EPS 失敗:`, error?.message || response?.statusCode);
                        resolve([]);
                    }
                }
            );
        }, alphaVantageCallCount * ALPHA_VANTAGE_DELAY);
    });
}

// 抓取美股本益比資料 (使用 Alpha Vantage API，支援多組 Key 輪替)
function fetchUSStockPE(symbol, retryCount = 0) {
    return new Promise((resolve) => {
        // 如果已經試過所有 Key，放棄
        if (retryCount >= ALPHA_VANTAGE_API_KEYS.length) {
            console.error(`${symbol} PE: 所有 API Key 都已達上限，無法抓取`);
            resolve(null);
            return;
        }

        // 延遲執行以避免超過 API 限制
        setTimeout(() => {
            alphaVantageCallCount++;
            const apiKey = getCurrentApiKey();
            console.log(`[Alpha Vantage] 呼叫 #${alphaVantageCallCount}: ${symbol} PE Ratio (Key: ${apiKey.substring(0, 6)}...)`);

            const url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${apiKey}`;

            request(
                {
                    url: url,
                    json: true,
                    proxy: proxy,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    },
                },
                (error, response, body) => {
                    if (!error && response.statusCode === 200 && body.PERatio) {
                        const peValue = parseFloat(body.PERatio);

                        if (!isNaN(peValue) && peValue > 0) {
                            const result = {
                                last: parseFloat(peValue.toFixed(2)),
                                mean: null, // Alpha Vantage 只提供當前值
                                median: null,
                                max: null,
                                min: null,
                            };
                            console.log(`成功抓取 ${symbol} 本益比: ${result.last}`);
                            resolve(result);
                        } else {
                            console.log(`${symbol} 本益比值無效`);
                            resolve(null);
                        }
                    } else if (body?.Note || body?.Information?.includes('API rate limit')) {
                        console.warn(`${symbol} PE API 限制: 已達每日上限，嘗試切換 Key...`);
                        switchToNextApiKey();
                        // 遞迴重試，使用下一組 Key
                        resolve(fetchUSStockPE(symbol, retryCount + 1));
                    } else {
                        console.error(`抓取 ${symbol} 本益比失敗:`, error?.message || response?.statusCode);
                        resolve(null);
                    }
                }
            );
        }, alphaVantageCallCount * ALPHA_VANTAGE_DELAY);
    });
}

function getPromise(fund) {
    return new Promise(function (resolve) {
        // 檢查類型是否為 'price'
        if (fund.type === 'price') {
            request(
                {
                    url: fund.url,
                    json: true,
                    proxy: proxy,
                },
                (error, response, body) => {
                    console.log(response.statusCode);
                    let values = [];
                    if (body && body.data && body.data.dates && body.data.dates.length > 0) {
                        body.data.dates.forEach((date, index) => {
                            const closePrice = parseFloat(body.data.closePrices[index]);
                            values.push([date, closePrice]);
                        });
                    }

                    const url2 = fund.moneyDjUrl;

                    if (url2 !== '') {
                        // proxy
                        // 如果IP地址存在於列表中，則設定代理
                        request(
                            {
                                url: url2,
                                proxy: proxy,
                            },
                            (err, res, html) => {
                                if (!err && res.statusCode === 200) {
                                    const $ = cheerio.load(html);
                                    const targetTable = $('td[width="33%"] > table.t01');
                                    let data = [];
                                    const today = moment();
                                    // console.log(url2);

                                    targetTable.find('tr').each((i, row) => {
                                        const td = $(row).find(
                                            'td.t3n0c1, td.t3n1, td.t3n1_rev, td.t3n0c1, td.t3n0, td.t3n0_rev, td.t3n0c1_rev'
                                        );
                                        const date = $(td[0]).text().trim();
                                        const value = $(td[1]).text().trim();

                                        // console.log(date);
                                        // console.log(value);
                                        if (date && value) {
                                            const extractDate = moment(today.format('YYYY') + '/' + date, 'YYYY/MM/DD');
                                            if (extractDate.isAfter(today) || !extractDate.isValid()) {
                                                extractDate.subtract(1, 'years');
                                            }

                                            data.push([extractDate.format('YYYY-MM-DD'), parseFloat(value)]);
                                        }
                                    });

                                    // 檢查 values 是否有資料，避免 undefined 錯誤
                                    if (values.length > 0) {
                                        const lastValueDate = moment(_.last(values)[0], 'YYYY-MM-DD');
                                        data = data.reverse();
                                        for (let i = 0; i < data.length; i++) {
                                            const currentDate = moment(data[i][0], 'YYYY-MM-DD');

                                            if (currentDate.isAfter(lastValueDate)) {
                                                values.push(data[i]);
                                            }
                                        }
                                    } else {
                                        // 如果 values 是空的，直接使用 data
                                        data = data.reverse();
                                        values = data;
                                    }
                                    resolve({ name: fund.name, values: values, type: fund.type });
                                } else {
                                    console.error('錯誤：', err);
                                    resolve({ name: fund.name, values: [], type: fund.type });
                                }
                            }
                        );
                    } else {
                        resolve({ name: fund.name, values: response.statusCode === 200 ? values : [], type: fund.type });
                    }
                }
            );
        } else if (fund.type === 'fund_dividend') {
            request(
                {
                    url: fund.url,
                    proxy: proxy,
                },
                (error, response, html) => {
                    if (!error && response.statusCode === 200) {
                        console.log(`處理 ${fund.name} 的股息數據`);

                        const $ = cheerio.load(html);
                        const data = [];

                        // 找到股息表格 - 這裡需要根據實際的網頁結構調整選擇器
                        // 這個範例假設股息信息在名為 "配息紀錄" 的表格中
                        const targetTable = $('table.t01');

                        targetTable.find('tbody tr').each((i, row) => {
                            const tds = $(row).find('td');

                            if (tds.length >= 6) {
                                const date = $(tds[0]).text().trim(); //配息基準日
                                const cashExDividendDate = $(tds[1]).text().trim(); // 除息日
                                const cashDividendPaymentDate = $(tds[2]).text().trim(); // 發放日
                                const cashEarningsDistribution = parseFloat($(tds[4]).text().trim()); // 每單位分配金額
                                const dividendYield = parseFloat($(tds[5]).text().trim()) / 4; // 年化配息率

                                // console.log('配息基準日:', date);
                                // console.log('除息日:', cashExDividendDate);
                                // console.log('發放日:', cashDividendPaymentDate);
                                // console.log('每單位分配金額:', cashEarningsDistribution);
                                // console.log('配息率:', dividendYield);

                                data.push({
                                    CashDividendPaymentDate: moment(cashDividendPaymentDate, 'YYYY/MM/DD').format('YYYY-MM-DD'),
                                    CashEarningsDistribution: cashEarningsDistribution,
                                    CashExDividendTradingDate: moment(cashExDividendDate, 'YYYY/MM/DD').format('YYYY-MM-DD'),
                                    StockEarningsDistribution: 0,
                                    StockExDividendTradingDate: '',
                                    date: moment(date, 'YYYY/MM/DD').format('YYYY-MM-DD'),
                                    dividendYield: dividendYield, // 若無法算出配息率，可先填 null
                                });
                            }
                        });

                        resolve({
                            name: fund.name,
                            values: data.reverse(),
                            type: fund.type,
                        });
                    } else {
                        console.error(`取得 ${fund.name} 股息數據時發生錯誤:`, error);
                        resolve({ name: fund.name, values: [], type: fund.type });
                    }
                }
            );
        } else if (fund.type === 'stock_dividend') {
            request(
                {
                    url: fund.url,
                    proxy: proxy,
                },
                (error, response, html) => {
                    if (!error && response.statusCode === 200) {
                        console.log(`處理 ${fund.name} 的股息數據`);

                        const $ = cheerio.load(html);
                        const data = [];

                        // 找到股息表格 - 這裡需要根據實際的網頁結構調整選擇器
                        // 這個範例假設股息信息在名為 "配息紀錄" 的表格中
                        const targetTable = $('table');

                        targetTable.find('tbody tr').each((i, row) => {
                            const tds = $(row).find('td');

                            if (tds.length >= 6) {
                                const date = ''; //配息基準日
                                const cashExDividendDate = $(tds[2]).text().trim(); // 除息日
                                const cashDividendPaymentDate = $(tds[3]).text().trim(); // 發放日
                                const cashEarningsDistribution = parseFloat($(tds[1]).text().trim()); // 每單位分配金額
                                const dividendYield = (cashEarningsDistribution / parseFloat($(tds[4]).text().trim())) * 100; // 配息率

                                // console.log('配息基準日:', date);
                                // console.log('除息日:', cashExDividendDate);
                                // console.log('發放日:', cashDividendPaymentDate);
                                // console.log('每單位分配金額:', cashEarningsDistribution);
                                // console.log('配息率:', dividendYield);

                                data.push({
                                    CashDividendPaymentDate: moment(cashDividendPaymentDate, 'YYYY/MM/DD').format('YYYY-MM-DD'),
                                    CashEarningsDistribution: cashEarningsDistribution,
                                    CashExDividendTradingDate: moment(cashExDividendDate, 'YYYY/MM/DD').format('YYYY-MM-DD'),
                                    StockEarningsDistribution: 0,
                                    StockExDividendTradingDate: '',
                                    date: '',
                                    dividendYield: dividendYield, // 若無法算出配息率，可先填 null
                                });
                            }
                        });

                        resolve({
                            name: fund.name,
                            values: data.reverse(),
                            type: fund.type,
                        });
                    } else {
                        console.error(`取得 ${fund.name} 股息數據時發生錯誤:`, error);
                        resolve({ name: fund.name, values: [], type: fund.type });
                    }
                }
            );
        } else if (fund.type === 'us_stock') {
            // 改用 request 並加 proxy
            request(
                {
                    url: fund.url,
                    json: true,
                    proxy: proxy,
                    headers: {
                        'User-Agent':
                            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                        Accept: 'application/json, text/plain, */*',
                        'Accept-Language': 'en-US,en;q=0.9',
                        Referer: 'https://finance.yahoo.com/',
                        Origin: 'https://finance.yahoo.com',
                    },
                },
                async (error, response, body) => {
                    if (
                        !error &&
                        response.statusCode === 200 &&
                        body &&
                        body.chart &&
                        body.chart.result &&
                        body.chart.result[0]
                    ) {
                        let values = [];
                        const data = body.chart.result[0];
                        const timestamps = data.timestamp;
                        const closes = data.indicators.quote[0].close;
                        for (let i = 0; i < timestamps.length; i++) {
                            const date = moment.unix(timestamps[i]).format('YYYY-MM-DD');
                            const close = closes[i];
                            if (close !== null) {
                                values.push([date, close]);
                            }
                        }

                        // 如果有 symbol，抓取 EPS 和本益比
                        let eps = [];
                        let per = null;
                        if (fund.symbol) {
                            console.log(`正在抓取 ${fund.name} (${fund.symbol}) 的 EPS 和本益比...`);
                            [eps, per] = await Promise.all([fetchUSStockEPS(fund.symbol), fetchUSStockPE(fund.symbol)]);
                        }

                        resolve({ name: fund.name, values: values, type: fund.type, eps: eps, per: per });
                    } else {
                        console.error(`${fund.name} 抓取失敗:`, error || (response && response.statusCode), body);
                        resolve({ name: fund.name, values: [], type: fund.type, eps: [], per: null });
                    }
                }
            );
        } else if (fund.type === 'index') {
            // 用axios 會有 data: "I'm a teapot. You're a bot."
            // 改用 request 也會有 data: "I'm a teapot. You're a bot."
            // request 加 header 才能正常抓取
            request(
                {
                    url: 'https://production.dataviz.cnn.io/index/fearandgreed/graphdata',
                    json: true,
                    proxy: proxy,
                    headers: {
                        'User-Agent':
                            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                        Accept: 'application/json, text/plain, */*',
                        'Accept-Language': 'en-US,en;q=0.9',
                        Referer: 'https://edition.cnn.com/markets/fear-and-greed',
                        Origin: 'https://edition.cnn.com',
                    },
                },
                (error, response, body) => {
                    console.log('CNN Index 回應 statusCode:', response && response.statusCode);
                    if (error) {
                        console.error('CNN Fear & Greed Index 抓取失敗 error:', error);
                        resolve({ name: fund.name, values: {}, type: fund.type });
                        return;
                    }
                    if (!body) {
                        console.error('CNN Fear & Greed Index 抓取失敗，body 為空:', body);
                        resolve({ name: fund.name, values: {}, type: fund.type });
                        return;
                    }
                    if (response.statusCode !== 200) {
                        console.error('CNN Fear & Greed Index 抓取失敗，statusCode:', response.statusCode, 'body:', body);
                        resolve({ name: fund.name, values: {}, type: fund.type });
                        return;
                    }
                    if (!body.fear_and_greed || !Array.isArray(body.fear_and_greed)) {
                        // 新版 API 結構
                        if (body.fear_and_greed && typeof body.fear_and_greed === 'object') {
                            const index = body.fear_and_greed.score || '';
                            const status = body.fear_and_greed.rating || '';
                            const updateText = body.fear_and_greed.timestamp
                                ? moment(body.fear_and_greed.timestamp).format('YYYY-MM-DD HH:mm:ss')
                                : '';
                            resolve({ name: fund.name, values: { index, status, updateText }, type: fund.type });
                        } else {
                            console.error('CNN Fear & Greed Index 抓取失敗，body 結構異常:', body);
                            resolve({ name: fund.name, values: {}, type: fund.type });
                        }
                        return;
                    }
                }
            );
        } else if (fund.type === 'eco_light') {
            // 呼叫 puppeteer 爬蟲腳本
            const { exec } = require('child_process');
            exec('node ./crawler/fetchEcoLight.js', (err, stdout, stderr) => {
                if (err) {
                    console.error('景氣燈號爬蟲執行失敗:', err);
                    resolve({ name: fund.name, values: {}, type: fund.type });
                    return;
                }
                try {
                    const result = JSON.parse(stdout);
                    resolve({ name: fund.name, values: result, type: fund.type });
                } catch (e) {
                    console.error('景氣燈號資料解析失敗:', e, stdout);
                    resolve({ name: fund.name, values: {}, type: fund.type });
                }
            });
        } else {
            // 如果不是 'price' 類型，直接返回空值
            resolve({ name: fund.name, values: [], type: fund.type });
        }
    });
}

// 使用 Promise.all 和映射新的 funds 結構
Promise.all(funds.map(getPromise)).then(function (results) {
    // 載入 JSON 資料，後面加日期是為了避免手機用快取下載，而非真正抓最新的資料
    const myLocalstorageFile = JSON.parse(fs.readFileSync('./dist/assets/data/my_localstorage1.json'));
    let myLocalstorageStockList = myLocalstorageFile.stockList;

    // console.log('抓取到的結果:', results);
    results.forEach((result) => {
        const foundStock = myLocalstorageStockList.find((obj) => obj.name === result.name);
        if (!foundStock && result.type !== 'index' && result.type !== 'eco_light') {
            console.warn(`找不到名稱為 ${result.name} 的股票`);
            return; // 跳過這筆
        }

        // 只有在 type 為 'price' 時才更新資料
        if (result.type === 'price' || result.type === 'us_stock') {
            if (result.type === 'us_stock') {
                console.log(`抓取到 ${result.name} 的股價數據`);
                if (result.eps && result.eps.length > 0) {
                    console.log(`抓取到 ${result.name} 的 EPS 數據，共 ${result.eps.length} 筆`);
                }
                if (result.per) {
                    console.log(`抓取到 ${result.name} 的本益比: ${result.per.last}`);
                }
            }
            foundStock.data = foundStock.data || {};
            foundStock.data.daily = foundStock.data.daily || [];
            foundStock.data.daily = result.values;

            // 儲存 EPS 和本益比資料
            if (result.type === 'us_stock') {
                if (result.eps && result.eps.length > 0) {
                    foundStock.data.eps = result.eps;
                }
                if (result.per) {
                    foundStock.data.per = result.per;
                }
            }
        } else if (result.type === 'fund_dividend' || result.type === 'stock_dividend') {
            foundStock.data = foundStock.data || {};
            foundStock.data.dividend = foundStock.data.dividend || [];
            foundStock.data.dividend = result.values;
        } else if (result.type === 'index') {
            // 寫入 global-settings.json
            let rawdata = fs.readFileSync('./src/store/data/global-settings.json');
            let globalSettings = JSON.parse(rawdata);
            globalSettings.cnn_fear_greed_index = result.values.index;
            globalSettings.cnn_fear_greed_status = result.values.status;
            globalSettings.cnn_fear_greed_update = result.values.updateText;
            let writeData = JSON.stringify(globalSettings, null, 4);
            fs.writeFileSync('./src/store/data/global-settings.json', writeData);
            console.log('CNN Fear & Greed Index written to file');
        } else if (result.type === 'eco_light') {
            // 寫入 global-settings.json
            let rawdata = fs.readFileSync('./src/store/data/global-settings.json');
            let globalSettings = JSON.parse(rawdata);
            globalSettings.eco_light_score = result.values.score;
            globalSettings.eco_light_signal = result.values.signal;
            globalSettings.eco_light_date = result.values.date;
            let writeData = JSON.stringify(globalSettings, null, 4);
            fs.writeFileSync('./src/store/data/global-settings.json', writeData);
            console.log('eco_light Index written to file');
        }
    });

    const defaultStockList = _.map(myLocalstorageStockList, (item) => {
        if (
            _.includes(item.name, '基金') ||
            item.name === '彭博高收益債' ||
            item.name === '微軟' ||
            item.name === '谷歌' ||
            item.name === '輝達' ||
            item.name === '蘋果' ||
            item.name === '波克夏' ||
            item.name === 'VOO' ||
            item.name === 'QQQ' ||
            item.name === 'GDX'
        ) {
            item.data.daily = _.map(item.data.daily, ([date, value]) => [date, value]); // 移掉open close high low 節省空間
            return item;
        } else if (item.name === '元大美債20年' || item.name === '元大高股息' || item.name === '群益ESG投等債20+') {
            // 先複製一份data.dividend用於保留
            const dividendData = _.get(item, 'data.dividend', null);

            // 刪除整個data對象，之後再將dividend放回去
            const newItem = _.omit(item, ['data', 'cost', 'crawler_dividend_last_date', 'crawler_eps_last_date']);

            // 如果原本有dividend數據，則建立新的data對象只包含dividend
            if (dividendData) {
                newItem.data = { dividend: dividendData };
            }

            return newItem;
        } else {
            // 非基金，刪除 data, cost, calc_policy_date, crawler_dividend_last_date, 'crawler_eps_last_date'
            return _.omit(item, ['data', 'cost', 'crawler_dividend_last_date', 'crawler_eps_last_date']);
        }
    });

    let writeData = JSON.stringify(defaultStockList); //t, null, 2

    fs.writeFile('./src/store/data/default-stock-list.json', writeData, (err) => {
        if (err) throw err;
        console.log('Data written to file');
    });

    myLocalstorageFile.stockList = myLocalstorageStockList;
    fs.writeFile('./dist/assets/data/my_localstorage1.json', JSON.stringify(myLocalstorageFile), (err) => {
        if (err) throw err;
        console.log('Data written to file');
    });

    // console.log('ALL DONE!! stats is', stats);
    // const oneMonthAgo = moment().subtract(30, 'days').format('YYYY-MM-DD'); // 30天前避免農曆年或近期取不到值，但最終只是要抓最新的
    // axios
    //     .get('https://api.finmindtrade.com/api/v4/data', {
    //         httpsAgent: agent,
    //         params: {
    //             dataset: 'TaiwanExchangeRate',
    //             data_id: 'USD',
    //             start_date: oneMonthAgo,
    //             token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRlIjoiMjAyNC0wMS0wMiAxNTowODoyMyIsInVzZXJfaWQiOiIxN2tvYmUiLCJpcCI6IjIxMC43MS4yMTcuMjUxIn0.Dl5cEreMFOqT_4rrpwHwApyVn6vrEovKPMP3-zygpHk',
    //         },
    //     })
    //     // 成功
    //     .then((res) => {
    //         if (res.data.data.length > 0) {
    //             let rawdata = fs.readFileSync('./src/store/data/global-settings.json');
    //             let globalSettings = JSON.parse(rawdata);

    //             globalSettings.usd_exchange = res.data.data[res.data.data.length - 1].spot_buy;

    //             let writeData = JSON.stringify(globalSettings, null, 4); //t, null, 2

    //             fs.writeFile('./src/store/data/global-settings.json', writeData, (err) => {
    //                 if (err) throw err;
    //                 console.log('Data written to file');
    //             });
    //         }
    //         console.log('success!');
    //     })
    //     // 失敗
    //     .catch((err) => {
    //         console.log('error!');
    //         console.log(err);
    //     });
});
