// const https = require('https');
const request = require('request');
const fs = require('fs');
const _ = require('lodash');
const axios = require('axios');
const moment = require('moment');
const os = require('os');
const HttpsProxyAgent = require('https-proxy-agent')



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

const proxy = addresses.includes('10.144.169.121') ? 'http://10.160.3.88:8080' : null;
const agent = addresses.includes('10.144.169.121') ? new HttpsProxyAgent('http://10.160.3.88:8080') : null;

console.log('proxy=' + proxy);

const today = moment().format('YYYY-MM-DD');

const urls = [
    'https://tw.stock.yahoo.com/_td-stock/api/resource/FundServices.fundsPriceHistory;fundId=F00000VTAH:FO;timeslot=2012-01-01T00:00:00Z-' +
        today +
        'T23:59:59Z?bkt=&device=desktop&ecma=modern&feature=ecmaModern,useVersionSwitch,useNewQuoteTabColor&intl=tw&lang=zh-Hant-TW&partner=none&prid=e4nof9lh3r54p&region=TW&site=finance&tz=Asia/Taipei&ver=1.2.1233&returnMeta=true',
    'https://tw.stock.yahoo.com/_td-stock/api/resource/FundServices.fundsPriceHistory;fundId=F0GBR04K8F:FO;timeslot=2012-01-01T00:00:00Z-' +
        today +
        'T23:59:59Z?bkt=&device=desktop&ecma=modern&feature=ecmaModern,useVersionSwitch,useNewQuoteTabColor&intl=tw&lang=zh-Hant-TW&partner=none&prid=e4nof9lh3r54p&region=TW&site=finance&tz=Asia/Taipei&ver=1.2.1233&returnMeta=true',
    'https://tw.stock.yahoo.com/_td-stock/api/resource/FundServices.fundsPriceHistory;fundId=F0GBR04AR8:FO;timeslot=2012-01-01T00:00:00Z-' +
        today +
        'T23:59:59Z?bkt=&device=desktop&ecma=modern&feature=ecmaModern,useVersionSwitch,useNewQuoteTabColor&intl=tw&lang=zh-Hant-TW&partner=none&prid=e4nof9lh3r54p&region=TW&site=finance&tz=Asia/Taipei&ver=1.2.1233&returnMeta=true',
    'https://tw.stock.yahoo.com/_td-stock/api/resource/FundServices.fundsPriceHistory;fundId=F000001V09:FO;timeslot=2012-01-01T00:00:00Z-' +
        today +
        'T23:59:59Z?bkt=&device=desktop&ecma=modern&feature=ecmaModern,useVersionSwitch,useNewQuoteTabColor&intl=tw&lang=zh-Hant-TW&partner=none&prid=e4nof9lh3r54p&region=TW&site=finance&tz=Asia/Taipei&ver=1.2.1233&returnMeta=true',
];

const fundName = ['????????????????????????', '???????????????????????????A2', '???????????????????????????A2', '????????????????????????'];

function getPromise(url) {
    return new Promise(function (resolve) {
        request(
            {
                url: url,
                json: true,
                proxy: proxy,
            },
            (error, response, body) => {
                console.log(response.statusCode);
                const values = [];
                if (body.data.dates.length > 0) {
                    body.data.dates.forEach((date, index) => {
                        const closePrice = parseFloat(body.data.closePrices[index]);
                        values.push([date, closePrice, closePrice, closePrice, closePrice]);
                    });
                }
                resolve(response.statusCode === 200 ? values : []);
            }
        );
    });
}

Promise.all(urls.map(getPromise)).then(function (stats) {
    let rawdata = fs.readFileSync('./src/store/data/default-stock-list.json');
    let defaultStockList = JSON.parse(rawdata);
    // console.log(defaultStockList);

    stats.forEach((price, index) => {
        const foundStock = defaultStockList.find((obj) => obj.name === fundName[index]);
        foundStock.data = foundStock.data || {};
        foundStock.data.daily = foundStock.data.daily || [];
        foundStock.data.daily = price;
    });

    let writeData = JSON.stringify(defaultStockList, null, 4); //t, null, 2

    fs.writeFile('./src/store/data/default-stock-list.json', writeData, (err) => {
        if (err) throw err;
        console.log('Data written to file');
    });

    // console.log('ALL DONE!! stats is', stats);
    const oneMonthAgo = moment().subtract(30, 'days').format('YYYY-MM-DD'); // 30???????????????????????????????????????????????????????????????????????????
    axios
        .get('https://api.finmindtrade.com/api/v4/data', {
            httpsAgent: agent,
            params: {
                dataset: 'TaiwanExchangeRate',
                data_id: 'USD',
                start_date: oneMonthAgo,
                token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJkYXRlIjoiMjAyMi0wMi0wOCAxMzoyODozOCIsInVzZXJfaWQiOiIxN2tvYmUiLCJpcCI6IjIxMC43MS4yMTcuMjQ2In0.QZraZM9320Ut0rkes4YsqtqHR38NitKO-52Sk4KhYHE',
            },
        })
        // ??????
        .then((res) => {
            if (res.data.data.length > 0) {
                let rawdata = fs.readFileSync('./src/store/data/global-settings.json');
                let globalSettings = JSON.parse(rawdata);

                globalSettings.usd_exchange = res.data.data[res.data.data.length - 1].spot_buy;

                let writeData = JSON.stringify(globalSettings, null, 4); //t, null, 2

                fs.writeFile('./src/store/data/global-settings.json', writeData, (err) => {
                    if (err) throw err;
                    console.log('Data written to file');
                });
            }
            console.log('success!');
        })
        // ??????
        .catch((err) => {
            console.log('error!');
            console.log(err);
        });
});
