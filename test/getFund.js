const https = require('https');
// const defaultStockList = require('../src/store/data/default-stock-list.json');
const fs = require('fs');
const _ = require('lodash');

const urls = [
    'https://tw.stock.yahoo.com/_td-stock/api/resource/FundServices.fundsPriceHistory;fundId=F00000VTAH:FO;timeslot=2012-03-28T00:00:00Z-2022-03-25T23:59:59Z?bkt=&device=desktop&ecma=modern&feature=ecmaModern,useVersionSwitch,useNewQuoteTabColor&intl=tw&lang=zh-Hant-TW&partner=none&prid=e4nof9lh3r54p&region=TW&site=finance&tz=Asia/Taipei&ver=1.2.1233&returnMeta=true',
    'https://tw.stock.yahoo.com/_td-stock/api/resource/FundServices.fundsPriceHistory;fundId=F0GBR04K8F:FO;timeslot=2012-03-28T00:00:00Z-2022-03-25T23:59:59Z?bkt=&device=desktop&ecma=modern&feature=ecmaModern,useVersionSwitch,useNewQuoteTabColor&intl=tw&lang=zh-Hant-TW&partner=none&prid=e4nof9lh3r54p&region=TW&site=finance&tz=Asia/Taipei&ver=1.2.1233&returnMeta=true',
    'https://tw.stock.yahoo.com/_td-stock/api/resource/FundServices.fundsPriceHistory;fundId=F0GBR04AR8:FO;timeslot=2012-03-28T00:00:00Z-2022-03-25T23:59:59Z?bkt=&device=desktop&ecma=modern&feature=ecmaModern,useVersionSwitch,useNewQuoteTabColor&intl=tw&lang=zh-Hant-TW&partner=none&prid=e4nof9lh3r54p&region=TW&site=finance&tz=Asia/Taipei&ver=1.2.1233&returnMeta=true',
    'https://tw.stock.yahoo.com/_td-stock/api/resource/FundServices.fundsPriceHistory;fundId=F000001V09:FO;timeslot=2012-03-28T00:00:00Z-2022-03-25T23:59:59Z?bkt=&device=desktop&ecma=modern&feature=ecmaModern,useVersionSwitch,useNewQuoteTabColor&intl=tw&lang=zh-Hant-TW&partner=none&prid=e4nof9lh3r54p&region=TW&site=finance&tz=Asia/Taipei&ver=1.2.1233&returnMeta=true',
];

const fundName = ['富達全球科技基金', '貝萊德世界能源基金A2', '貝萊德世界黃金基金A2', '安聯台灣智慧基金'];

const prices = {};

function getPromise(backend) {
    return new Promise(function (resolve) {
        https.get(backend, function (res) {
            console.log(`Got response: ${res.statusCode}`);
            var body = '';
            res.on('data', function (chunk) {
                body += chunk;
            });

            res.on('end', function () {
                var data = JSON.parse(body);
                // console.log('Got a response: ', data);
                const values = [];
                if (data.data.dates.length > 0) {
                    data.data.dates.forEach((date, index) => {
                        const closePrice = parseFloat(data.data.closePrices[index]);
                        values.push([date, closePrice, closePrice, closePrice, closePrice]);
                    });
                }
                console.log(values);
                // let rawdata = fs.readFileSync('../src/store/data/default-stock-list.json');
                // let defaultStockList = JSON.parse(rawdata);
                // console.log(defaultStockList);

                // const foundStock = defaultStockList.find((v) => v.name === '富達全球科技基金');
                // foundStock.data = foundStock.data || {};
                // foundStock.data.daily = foundStock.data.daily || [];
                // foundStock.data.daily = values;

                // let writeData = JSON.stringify(defaultStockList, null, 4); //t, null, 2

                // fs.writeFile('../src/store/data/default-stock-list.json', writeData, (err) => {
                //     if (err) throw err;
                //     console.log('Data written to file');
                // });
                resolve(res.statusCode === 200 ? values : []);
            });
        });
    });
}

Promise.all(urls.map(getPromise)).then(function (stats) {
    // console.log('ALL DONE!! stats is', stats);
    let rawdata = fs.readFileSync('../src/store/data/default-stock-list.json');
    let defaultStockList = JSON.parse(rawdata);
    console.log(defaultStockList);

    stats.forEach((price, index) => {
        const foundStock = defaultStockList.find((obj) => obj.name === fundName[index]);
        foundStock.data = foundStock.data || {};
        foundStock.data.daily = foundStock.data.daily || [];
        foundStock.data.daily = price;
    });

    let writeData = JSON.stringify(defaultStockList, null, 4); //t, null, 2

    fs.writeFile('../src/store/data/default-stock-list.json', writeData, (err) => {
        if (err) throw err;
        console.log('Data written to file');
    });
});

// https
//     .get(
//         'https://tw.stock.yahoo.com/_td-stock/api/resource/FundServices.fundsPriceHistory;fundId=F00000VTAH:FO;timeslot=2012-03-28T00:00:00Z-2022-03-25T23:59:59Z?bkt=&device=desktop&ecma=modern&feature=ecmaModern,useVersionSwitch,useNewQuoteTabColor&intl=tw&lang=zh-Hant-TW&partner=none&prid=e4nof9lh3r54p&region=TW&site=finance&tz=Asia/Taipei&ver=1.2.1233&returnMeta=true',
//         (res) => {
//             console.log(`Got response: ${res.statusCode}`);
//             var body = '';
//             res.on('data', function (chunk) {
//                 body += chunk;
//             });

//             res.on('end', function () {
//                 var data = JSON.parse(body);
//                 // console.log('Got a response: ', data);
//                 const values = [];
//                 if (data.data.dates.length > 0) {
//                     data.data.dates.forEach((date, index) => {
//                         const closePrice = parseFloat(data.data.closePrices[index]);
//                         values.push([date, closePrice, closePrice, closePrice, closePrice]);
//                     });
//                 }
//                 console.log(values);
//                 let rawdata = fs.readFileSync('../src/store/data/default-stock-list.json');
//                 let defaultStockList = JSON.parse(rawdata);
//                 console.log(defaultStockList);

//                 const foundStock = defaultStockList.find((v) => v.name === '富達全球科技基金');
//                 foundStock.data = foundStock.data || {};
//                 foundStock.data.daily = foundStock.data.daily || [];
//                 foundStock.data.daily = values;

//                 let writeData = JSON.stringify(defaultStockList, null, 4); //t, null, 2

//                 fs.writeFile('../src/store/data/default-stock-list.json', writeData, (err) => {
//                     if (err) throw err;
//                     console.log('Data written to file');
//                 });
//             });
//         }
//     )
//     .on('error', (e) => {
//         console.log(`Got error: ${e.message}`);
//     });
