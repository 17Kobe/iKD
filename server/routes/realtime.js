const router = require('express').Router();
const request = require('request');
const _ = require('lodash');

// 假設代理伺服器位於 http://your-proxy-server，端口為 8080
const proxyConfig = {
    host: '10.160.3.88',
    port: 8080,
    protocol: 'http'
};

const fetchWithProxy = (url, callback) => {
    // 設定代理
    const proxyUrl = `${proxyConfig.protocol}://${proxyConfig.host}:${proxyConfig.port}`;
    const options = {
        url: url,
        proxy: proxyUrl,
        headers: {
            // 如果代理伺服器需要驗證，可以在這裡添加相關的授權資訊
            // 'Proxy-Authorization': 'Basic ' + Buffer.from('username:password').toString('base64')
        }
    };

    request(options, (error, response, body) => {
        if (error) {
            callback(error, null);
        } else {
            try {
                const parsedBody = JSON.parse(body);
                callback(null, parsedBody);
            } catch (parseError) {
                callback(parseError, null);
            }
        }
    });
};

router.get('/', (req, res) => {
    const ids = req.query.ids;
    console.log(ids);

    const url = `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=${ids}`;
    console.log(url);

    fetchWithProxy(url, (error, response) => {
        if (error) {
            // 如果有錯誤，可以在這裡處理
            console.error('Error:', error.message);
            res.status(500).json({ error: error.message });
        } else {
            // 在這裡處理 response 的內容
            // console.log(response);

            const formattedData = _.map(response.msgArray, (item) => ({
                ch: item.ch,
                d: item.d,
                t: item.t,
                o: item.o,
                h: item.h,
                l: item.l,
                z: item.z,
                v: item.v,
            }));
            res.json({"data": formattedData});
        }
    });
});

module.exports = router;
