import axios from 'axios';
import moment from 'moment';
import _ from 'lodash';

const defaultState = {
    stockList: [
        {
            name: '元大高股息',
            id: '0056',
        },
        {
            name: '台積電',
            id: '2330',
        },
        // {
        //     name: '聯發科',
        //     id: '2454',
        // },
        // {
        //     name: '大立光',
        //     id: '3008',
        // },
        // {
        //     name: '台達電',
        //     id: '2308',
        // },
        // {
        //     name: '元大金',
        //     id: '2885',
        // },
        // {
        //     name: '玉山金',
        //     id: '2884',
        // },
        // {
        //     name: '卜蜂',
        //     id: '1215',
        // },
        // {
        //     name: '統一',
        //     id: '1216',
        // },
        // {
        //     name: '中華電',
        //     id: '2412',
        // },
        // {
        //     name: '統一FANG+',
        //     id: '00757',
        // },
        // {
        //     name: '期元大 S&P 黃金',
        //     id: '00635U',
        // },
    ],
};

const stock = {
    // vue3 的 state 要用() 變是 func
    state() {
        return defaultState;
    },
    actions: {
        // 從 server 去取得該股票的淨值
        // GET_STAR(context) {
        //     return (
        //         // 注意一下fullPath的大小寫，如此還可以帶query喔
        //         axios
        //             .get(`http://localhost:2412/star`)
        //             // 成功
        //             .then((res) => {
        //                 console.log(res);
        //                 context.commit('SAVE_STOCK', res.data);
        //                 // context.commit('SAVE_CONTACT', res.data);
        //             })
        //             // 失敗
        //             .catch((err) => {
        //                 console.log(err);
        //             })
        //     );
        // },
        // 從 server 去取得該股票的淨值
    },
    mutations: {
        // 將該股票的淨值儲存到 state 上
        SAVE_STOCK_LIST(state, data) {
            console.log('SAVE_STOCK_LIST');
            // console.log(data);
            state.stockList = data;
            // console.log(state.currStockDayData);
        },
        SAVE_STOCK_COST(state, { stockId, costList, totalOfShares, averageCost, sumCost }) {
            console.log(stockId);
            console.log(costList);

            // object of array 去 find 並 update
            const found = state.stockList.find((v) => v.id === stockId);
            found.cost = {};
            found.cost.settings = [];
            found.cost.settings = costList; // 複製數據複本
            console.log(found.cost.cost_list);
            found.cost.total = totalOfShares || 0; // null 則指定為0
            found.cost.avg = averageCost || 0; // null 則指定為0
            found.cost.sum = sumCost || 0; // null 則指定為0

            // save to localstorage
            localStorage.setItem('stockList', JSON.stringify(state.stockList));
        },
        SAVE_STOCK_PRICE(state) {
            console.log('SAVE_STOCK_PRICE');
            console.log(state.stockList);
            // for stockList
            state.stockList.forEach((stcokInfo, index, currStock) => {
                // 為了修改，所以多加 index 及 theArray 參數
                console.log(stcokInfo);

                console.log(currStock[index]);

                const stockData = stcokInfo.data_daily || []; // 有可能是 null 就變成 []
                // 判斷若是沒值(即 [] 空array)，若從資料庫取得日期要加1天喔
                const stockStartDate = moment(
                    stockData.length === 0 ? '2010-01-01' : moment(stockData.at(-1).date).add(1, 'days')
                ).format('YYYY-MM-DD');
                console.log(stockStartDate);

                axios
                    .get('https://api.finmindtrade.com/api/v4/data', {
                        params: {
                            dataset: 'TaiwanStockPrice',
                            data_id: stcokInfo.id,
                            start_date: stockStartDate,
                            token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJkYXRlIjoiMjAyMi0wMi0wOCAxMzoyODozOCIsInVzZXJfaWQiOiIxN2tvYmUiLCJpcCI6IjIxMC43MS4yMTcuMjQ2In0.QZraZM9320Ut0rkes4YsqtqHR38NitKO-52Sk4KhYHE',
                        },
                    })
                    // 成功
                    .then((res) => {
                        // 預設值
                        currStock[index].data_daily = currStock[index].data_daily || []; // 有可能是 null 就變成 []
                        currStock[index].data_weekly = currStock[index].data_weekly || []; // 有可能是 null 就變成 []
                        currStock[index].data_weekly_kd = currStock[index].data_weekly_kd || []; // 有可能是 null 就變成 []
                        currStock[index].last_price = currStock[index].last_price || null;
                        currStock[index].last_price_date = currStock[index].last_price_date || null;
                        currStock[index].last_price_spread = currStock[index].last_price_spread || null;

                        // 塞入股價日線資料
                        console.log(res.data.data);

                        const values = [];
                        res.data.data.forEach((element) => {
                            values.push([
                                element.date,
                                element.open,
                                element.max,
                                element.min,
                                element.close,
                                // element.Trading_Volume,
                            ]);
                        });
                        currStock[index].data_daily.push(...values);

                        // theArray[index].data_daily.push(...res.data.data); // 塞入股價資料

                        // 塞入漲跌幅、最後股價
                        if (res.data.data.length > 0) {
                            const v1 = currStock[index].data_daily.at(-1)[4];
                            const v2 = currStock[index].data_daily.at(-2)[4];
                            currStock[index].last_price = v1;

                            const dayOfWeek = ['日', '一', '二', '三', '四', '五', '六'];
                            const currStockLastDate = moment(currStock[index].data_daily.at(-1)[0]);
                            currStock[index].last_price_date = `${currStockLastDate.format('MM/DD')}(${
                                dayOfWeek[currStockLastDate.day()]
                            })`;

                            currStock[index].last_price_spread = parseFloat((((v1 - v2) * 100) / v2).toFixed(2));
                        }

                        // 塞入股價週線資料
                        if (res.data.data.length > 0) {
                            // const firstStockDate = moment(_.first(currStock[index].data_daily)[0]); // [] 不可能 undefined。因為是二維陣列，還要取第二維[0]代表date
                            // const lastStockDate = moment(_.last(currStock[index].data_daily)[0]);

                            // console.log(firstStockDate.format('YYYY-MM-DD HH:mm:ss'));
                            // console.log(lastStockDate.format('YYYY-MM-DD HH:mm:ss'));

                            // for moment 參考 https://stackoverflow.com/questions/52936352/javascript-for-loop-to-add-days-in-a-month-object-moment-js
                            // lastStockDate.subtract(7, 'days') 因為我第一個要拿到就是減7天的值
                            // 這裡要用 -6 才能最後面的資料也都算進去，不過可能實際因沒有資料而加上也沒到完整一週都有資料，
                            const resData = [];

                            let i = currStock[index].data_daily.length - 1;
                            let j = i;
                            const lastStockDate = moment(_.last(currStock[index].data_daily)[0]);
                            let firstDayOfWeek = lastStockDate.startOf('isoWeek');
                            while (i >= 0) {
                                // console.log(i);
                                // console.log(moment(currStock[index].data_daily[i][0]).format('YYYY-MM-DD'));
                                // console.log(firstDayOfWeek.format('YYYY-MM-DD'));
                                // 不能用 isSame 因為有可能那週沒資料，或那週星期一也放假，所以要用 isBefore
                                if (moment(currStock[index].data_daily[i][0]).isBefore(firstDayOfWeek) || i === 0) {
                                    // console.log('isBefore');
                                    // 0最後一個也要跑進來

                                    // startIndex 值要小於等於 endIndex，for 是由大到小, i<j
                                    const startIndex = i + 1; // 因為是找到前一個才算後面1個
                                    const endIndex = j; // 因為外層array 是從日期最現在，往以前日期去掃。endIndex應該是最現在日期. i比n大
                                    const range2dArray = _.slice(currStock[index].data_daily, startIndex, endIndex + 1);
                                    const rangeHighArray = _.map(range2dArray, (v) => v[2]);
                                    const rangeLowArray = _.map(range2dArray, (v) => v[3]);
                                    // const rangeVolumeArray = _.map(range2dArray, (v) => v[5]);

                                    const date = currStock[index].data_daily[endIndex][0];
                                    const open = currStock[index].data_daily[startIndex][1]; // 上一個n的意思， 也許有 bug n+1應該要<這迴圈數量，若只有1個就有問題
                                    const close = currStock[index].data_daily[endIndex][4]; // 之前的i，還沒i=n是下一個
                                    const low = _.min(rangeLowArray);
                                    const high = _.max(rangeHighArray);
                                    // const volume = _.sum(rangeVolumeArray);

                                    resData.push([date, open, high, low, close]);
                                    j = startIndex - 1;

                                    // 要採用下個i值的該週第一天，不能用firstDayOfWeek-7天，因為有可能該週都沒值
                                    firstDayOfWeek = moment(currStock[index].data_daily[i][0]).startOf('isoWeek');
                                }
                                i -= 1;
                            }

                            console.log(resData);
                            // 必需要反轉，最小的值在最前面，最大的值在最後面，否則highcharts會只畫1個點
                            currStock[index].data_weekly = _.reverse(resData);
                        }

                        // 塞入股價週線KD資料
                        if (res.data.data.length > 0) {
                            const resData = [];
                            let rsv = 0;
                            let preK = 0;
                            let preD = 0;
                            let todayK = 0;
                            let todayD = 0;

                            // 從最早日期開始算，因為公式有用昨天
                            for (let i = 0; i <= currStock[index].data_weekly.length - 1; i += 1) {
                                const startIndex = i - 8 < 0 ? 0 : i - 8; // 如果減完小於0，就=0。正常寫法是-9+1，但我寫-8就好了
                                const endIndex = i;
                                const range2dArray = _.slice(currStock[index].data_weekly, startIndex, endIndex + 1);
                                const rangeHighArray = _.map(range2dArray, (v) => v[2]);
                                const rangeLowArray = _.map(range2dArray, (v) => v[3]);
                                const low = _.min(rangeLowArray);
                                const high = _.max(rangeHighArray);

                                rsv = ((currStock[index].data_weekly[i][4] - low) / (high - low)) * 100; // (今日收盤價-最近9天最低價)/(最近9天最高價-最近9天最低價)*100
                                todayK = (2 / 3) * preK + (1 / 3) * rsv; // k=2/3 * 昨日的k值 + 1/3*今日的RSV
                                todayD = (2 / 3) * preD + (1 / 3) * todayK; // d=2/3 * 昨日的d值 + 1/3*今日的k值
                                preK = todayK;
                                preD = todayD;
                                const date = currStock[index].data_weekly[endIndex][0];

                                resData.push([date, todayK, todayD]);
                            }
                            currStock[index].data_weekly_kd = resData;
                        }

                        localStorage.setItem('stockList', JSON.stringify(state.stockList)); // 要放在 then後才能保證完成，放在最後面還可能
                        // console.log('GET_STOCK_VALUE_OK');
                        // context.commit('SAVE_STOCK_VALUE', res.data);
                        // context.commit('SAVE_CONTACT', res.data);
                    })
                    // 失敗
                    .catch((err) => {
                        console.log(err);
                    });
            });
        },
    },
    getters: {
        // object of array to filter
        getStock: (state) => (id) => _.find(state.stockList, ['id', id]),
    },
};

export default stock;
