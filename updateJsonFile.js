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

// 新的結構：將 fundName 和 urls 合併為一個物件數組
const funds = [
    {
        name: '富達全球科技基金',
        url: 'https://tw.stock.yahoo.com/_td-stock/api/resource/FundServices.fundsPriceHistory;fundId=F00000VTAH:FO;timeslot=2012-01-01T00:00:00Z-' +
            today +
            'T23:59:59Z?bkt=&device=desktop&ecma=modern&feature=ecmaModern,useVersionSwitch,useNewQuoteTabColor&intl=tw&lang=zh-Hant-TW&partner=none&prid=e4nof9lh3r54p&region=TW&site=finance&tz=Asia/Taipei&ver=1.2.1233&returnMeta=true',
        type: 'price',
        moneyDjUrl: 'https://www.moneydj.com/funddj/yp/yp010001.djhtm?a=FTZR0'
    },
    {
        name: '安聯台灣智慧基金',
        url: 'https://tw.stock.yahoo.com/_td-stock/api/resource/FundServices.fundsPriceHistory;fundId=F000001V09:FO;timeslot=2012-01-01T00:00:00Z-' +
            today +
            'T23:59:59Z?bkt=&device=desktop&ecma=modern&feature=ecmaModern,useVersionSwitch,useNewQuoteTabColor&intl=tw&lang=zh-Hant-TW&partner=none&prid=e4nof9lh3r54p&region=TW&site=finance&tz=Asia/Taipei&ver=1.2.1233&returnMeta=true',
        type: 'price',
        moneyDjUrl: 'https://www.moneydj.com/funddj/ya/yp010000.djhtm?a=ACDD19'
    },
    {
        name: '貝萊德世界黃金基金A2',
        url: 'https://tw.stock.yahoo.com/_td-stock/api/resource/FundServices.fundsPriceHistory;fundId=F0GBR04AR8:FO;timeslot=2012-01-01T00:00:00Z-' +
            today +
            'T23:59:59Z?bkt=&device=desktop&ecma=modern&feature=ecmaModern,useVersionSwitch,useNewQuoteTabColor&intl=tw&lang=zh-Hant-TW&partner=none&prid=e4nof9lh3r54p&region=TW&site=finance&tz=Asia/Taipei&ver=1.2.1233&returnMeta=true',
        type: 'price',
        moneyDjUrl: 'https://www.moneydj.com/funddj/ya/yp010001.djhtm?a=SHZ18'
    },
    // {
    //     name: '貝萊德世界能源基金A2',
    //     url: 'https://tw.stock.yahoo.com/_td-stock/api/resource/FundServices.fundsPriceHistory;fundId=F0GBR04K8F:FO;timeslot=2012-01-01T00:00:00Z-' +
    //         today +
    //         'T23:59:59Z?bkt=&device=desktop&ecma=modern&feature=ecmaModern,useVersionSwitch,useNewQuoteTabColor&intl=tw&lang=zh-Hant-TW&partner=none&prid=e4nof9lh3r54p&region=TW&site=finance&tz=Asia/Taipei&ver=1.2.1233&returnMeta=true',
    //     type: 'price',
    //     moneyDjUrl: 'https://www.moneydj.com/funddj/ya/yp010001.djhtm?a=shza6'
    // },
    {
        name: '元大2至10年投資級企業債券基金',
        url: 'https://tw.stock.yahoo.com/_td-stock/api/resource/FundServices.fundsPriceHistory;fundId=F00001EM6G:FO;timeslot=2012-01-01T00:00:00Z-' +
            today +
            'T23:59:59Z?bkt=&device=desktop&ecma=modern&feature=ecmaModern,useVersionSwitch,useNewQuoteTabColor&intl=tw&lang=zh-Hant-TW&partner=none&prid=e4nof9lh3r54p&region=TW&site=finance&tz=Asia/Taipei&ver=1.2.1233&returnMeta=true',
        type: 'price',
        moneyDjUrl: 'https://www.moneydj.com/funddj/ya/yp010000.djhtm?a=ACYT175'
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
];

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
                    if (body.data.dates.length > 0) {
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

                                    const lastValueDate = moment(_.last(values)[0], 'YYYY-MM-DD');
                                    data = data.reverse();
                                    for (let i = 0; i < data.length; i++) {
                                        const currentDate = moment(data[i][0], 'YYYY-MM-DD');

                                        if (currentDate.isAfter(lastValueDate)) {
                                            values.push(data[i]);
                                        }
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
                                const cashExDividendDate = $(tds[1]).text().trim();  // 除息日
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
                                    StockExDividendTradingDate: "",
                                    date: moment(date, 'YYYY/MM/DD').format('YYYY-MM-DD'),
                                    dividendYield: dividendYield  // 若無法算出配息率，可先填 null
                                });
                            }
                        });
                        
                        resolve({ 
                            name: fund.name, 
                            values: data.reverse(), 
                            type: fund.type 
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
                        const targetTable = $('table[data-v-f68ae462]');

                        targetTable.find('tbody tr').each((i, row) => {
                            const tds = $(row).find('td');
                        
                            if (tds.length >= 6) {
                                const date = ""; //配息基準日
                                const cashExDividendDate = $(tds[2]).text().trim();  // 除息日
                                const cashDividendPaymentDate = $(tds[3]).text().trim(); // 發放日
                                const cashEarningsDistribution = parseFloat($(tds[1]).text().trim()); // 每單位分配金額
                                const dividendYield = cashEarningsDistribution / parseFloat($(tds[4]).text().trim()) * 100; // 配息率
                        
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
                                    StockExDividendTradingDate: "",
                                    date: "",
                                    dividendYield: dividendYield  // 若無法算出配息率，可先填 null
                                });
                            }
                        });
                        
                        resolve({ 
                            name: fund.name, 
                            values: data.reverse(), 
                            type: fund.type 
                        });
                    } else {
                        console.error(`取得 ${fund.name} 股息數據時發生錯誤:`, error);
                        resolve({ name: fund.name, values: [], type: fund.type });
                    }
                }
            );
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

    results.forEach((result) => {
        const foundStock = myLocalstorageStockList.find((obj) => obj.name === result.name);
        if (!foundStock) {
            console.warn(`找不到名稱為 ${result.name} 的股票`);
            return; // 跳過這筆
        }
        
        // 只有在 type 為 'price' 時才更新資料
        if (result.type === 'price') {
            foundStock.data = foundStock.data || {};
            foundStock.data.daily = foundStock.data.daily || [];
            foundStock.data.daily = result.values;
        } else if (result.type === 'fund_dividend' || result.type === 'stock_dividend') {
            foundStock.data = foundStock.data || {};
            foundStock.data.dividend = foundStock.data.dividend || []; 
            foundStock.data.dividend = result.values;
        }
    });

    const defaultStockList = _.map(myLocalstorageStockList, (item) => {
        if (_.includes(item.name, '基金')) {
            item.data.daily = _.map(item.data.daily, ([date, value]) => [date, value]); // 移掉open close high low 節省空間
            return item;
        } else if (item.name === "元大美債20年" || item.name === "元大高股息") {
            // 先複製一份data.dividend用於保留
            const dividendData = _.get(item, 'data.dividend', null);
            
            // 刪除整個data對象，之後再將dividend放回去
            const newItem = _.omit(item, ['data', 'cost', 'crawler_dividend_last_date']);
            
            // 如果原本有dividend數據，則建立新的data對象只包含dividend
            if (dividendData) {
                newItem.data = { dividend: dividendData };
            }
            
            return newItem;
        } else {
            // 非基金，刪除 data, cost, calc_policy_date, crawler_dividend_last_date
            return _.omit(item, ['data', 'cost', 'crawler_dividend_last_date']);
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