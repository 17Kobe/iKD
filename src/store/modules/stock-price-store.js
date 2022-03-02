import axios from 'axios';
import moment from 'moment';
import _ from 'lodash';

const defaultState = {
    // progressMultiple: 0.5, //* 4 則最大值為25%。 * 2 則最大值為50%。 * 1 則最大值為100%。 0.6%最大值為166% 0.5最大值為200%  0.2 最大值為500% 0.1 最大值為1000%
    stockList: [
        {
            name: '元大高股息',
            id: '0056',
        },
        {
            name: '台積電',
            id: '2330',
        },
        {
            name: '聯發科',
            id: '2454',
        },

        {
            name: '統一FANG+',
            id: '00757',
        },
        {
            name: '大立光',
            id: '3008',
        },
        {
            name: '台達電',
            id: '2308',
        },
        {
            name: '富邦金',
            id: '2881',
        },
        // {
        //     name: '元大金',
        //     id: '2885',
        // },
        // {
        //     name: '玉山金',
        //     id: '2884',
        // },

        {
            name: '卜蜂',
            id: '1215',
        },
        {
            name: '統一',
            id: '1216',
        },
        {
            name: '中華電',
            id: '2412',
        },

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
        GET_STOCK_PRICE(context) {
            console.log('GET_STOCK_PRICE 0');

            context.state.stockList.forEach((stcokObj) => {
                // 為了修改，所以多加 index 及 theArray 參數
                // console.log(stcokObj);

                // console.log(currStock[index]);

                console.log('GET_STOCK_PRICE 1');
                const stockDataDaily = _.has(stcokObj, 'data.daily') ? stcokObj.data.daily : []; // 有可能是 null 就變成 []
                console.log(stockDataDaily);
                // 判斷若是沒值(即 [] 空array)，若從資料庫取得日期要加1天喔
                const stockStartDate = moment(
                    stockDataDaily.length === 0
                        ? '2010-01-01'
                        : moment(stockDataDaily[stockDataDaily.length - 1][0]).add(1, 'days')
                ).format('YYYY-MM-DD');

                console.log('GET_STOCK_PRICE 2');
                // 按照網站存在的日期才發出API需求
                // https://stackoverflow.com/questions/36197031/how-to-use-moment-js-to-check-whether-the-current-time-is-between-2-times
                const currentTime = moment();
                const stockMarketCloseTime = moment('13:30:00', 'hh:mm:ss');
                let siteExistsLatestDate = moment().format('YYYY-MM-DD');
                if (currentTime.isBefore(stockMarketCloseTime))
                    siteExistsLatestDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
                // console.log(currentTime.format('YYYY-MM-DD hh:mm:ss'));
                // console.log(stockMarketCloseTime.format('YYYY-MM-DD hh:mm:ss'));
                // console.log(siteExistsLatestDate);
                // console.log(stockData);
                // console.log(stockData.at(-1)[0]);
                // console.log(stockStartDate);

                // 因為我有將 stockStartDate + 1天，所以有 Same
                if (moment(siteExistsLatestDate).isSameOrAfter(stockStartDate)) {
                    console.log('GET_STOCK_PRICE 3');
                    axios
                        .get('https://api.finmindtrade.com/api/v4/data', {
                            params: {
                                dataset: 'TaiwanStockPrice',
                                data_id: stcokObj.id,
                                start_date: stockStartDate,
                                token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJkYXRlIjoiMjAyMi0wMi0wOCAxMzoyODozOCIsInVzZXJfaWQiOiIxN2tvYmUiLCJpcCI6IjIxMC43MS4yMTcuMjQ2In0.QZraZM9320Ut0rkes4YsqtqHR38NitKO-52Sk4KhYHE',
                            },
                        })
                        // 成功
                        .then((res) => {
                            console.log('GET_STOCK_PRICE 4');
                            context.commit('SAVE_STOCK_PRICE', { stockId: stcokObj.id, data: res.data });
                        })
                        // 失敗
                        .catch((err) => {
                            console.log('GET_STOCK_PRICE error');
                            console.log(err);
                        });
                }
            });
        },
    },
    mutations: {
        // 將該股票的淨值儲存到 state 上
        SAVE_STOCK_LIST(state, data) {
            console.log('SAVE_STOCK_LIST');
            // console.log(data);
            state.stockList = data;
            // console.log(state.currStockDayData);
        },
        SAVE_A_STOCK(state, data) {
            // data 是 object {name: XXX, id: XXX}
            console.log('SAVE_A_STOCK');
            // console.log(data);
            state.stockList.push(data);
            // console.log(state.currStockDayData);
            localStorage.removeItem('stockList');
            localStorage.setItem('stockList', JSON.stringify(state.stockList));
            this.dispatch('GET_STOCK_PRICE'); // 到時化優化成單1股票，或 SAVE STOCK PRICE有機制判斷是最好的
        },
        MOVE_A_STOCK(state, { stockId, direction }) {
            // data 是 object {name: XXX, id: XXX}
            console.log('MOVE_A_STOCK');
            const index = _.findIndex(state.stockList, ['id', stockId]);
            console.log(index);

            const tmpStock = state.stockList.splice(index, 1)[0]; // 找出來是[{}]，所以要加[0]
            if (direction === 'bottom') {
                state.stockList.splice(index + 1, 0, tmpStock);
            }
            if (direction === 'top') {
                state.stockList.splice(index - 1, 0, tmpStock);
            }
            // console.log(state.currStockDayData);
            localStorage.removeItem('stockList');
            localStorage.setItem('stockList', JSON.stringify(state.stockList));
        },
        DEL_A_STOCK(state, data) {
            // data 是 object {name: XXX, id: XXX}
            console.log('DEL_A_STOCK');
            // 移除某個自選股
            _.remove(state.stockList, (obj) => obj.id === data);
            localStorage.removeItem('stockList');
            localStorage.setItem('stockList', JSON.stringify(state.stockList));
        },
        SAVE_STOCK_STAR(state, { stockId, star }) {
            // object of array 去 find 並 update
            const found = state.stockList.find((v) => v.id === stockId);
            found.star = 0;
            found.star = star; // 複製數據複本

            // save to localstorage
            localStorage.removeItem('stockList');
            localStorage.setItem('stockList', JSON.stringify(state.stockList));
        },
        SAVE_STOCK_COST(state, { stockId, costList, totalOfShares, averageCost, sumCost }) {
            console.log('SAVE_STOCK_COST');
            // object of array 去 find 並 update
            const foundStock = state.stockList.find((v) => v.id === stockId);

            if (costList.length === 0 && _.has(foundStock, 'cost.settings')) {
                delete foundStock.cost;
            } else {
                foundStock.cost = {};
                foundStock.cost.settings = [];
                foundStock.cost.settings = costList; // 複製數據複本
                foundStock.cost.total = totalOfShares || 0; // null 則指定為0
                foundStock.cost.avg = averageCost || 0; // null 則指定為0
                foundStock.cost.sum = sumCost || 0; // null 則指定為0

                // save to localstorage
            }

            // save to localstorage
            localStorage.removeItem('stockList');
            localStorage.setItem('stockList', JSON.stringify(state.stockList));
        },
        SAVE_STOCK_POLICY(state, { stockId, policyList }) {
            // object of array 去 find 並 update
            const foundStock = state.stockList.find((v) => v.id === stockId);
            if (
                _.has(foundStock, 'policy.settings') &&
                (!_.has(policyList, 'buy') ||
                    !_.has(policyList, 'sell') ||
                    (policyList.buy.length === 0 && policyList.sell.length === 0))
            ) {
                delete foundStock.policy;
            } else {
                foundStock.policy = { settings: { buy: [], sell: [] } };
                foundStock.policy.settings = policyList; // 複製數據複本

                // save to localstorage
            }
            // alert(JSON.stringify(state.stockList));
            try {
                localStorage.removeItem('stockList');
                localStorage.setItem('stockList', JSON.stringify(state.stockList)); // 要放在 then後才能保證完成，放在最後面還可能
            } catch (err) {
                alert(err);
            }

            this.commit('SAVE_STOCK_MA', stockId); // 計算 MA線, 看console.log會依序執行commit，一個一個執行完才執行下個，看起來沒問題
            this.commit('SAVE_STOCK_POLICY_RESULT', stockId);
        },
        SAVE_STOCK_PRICE(state, { stockId, data }) {
            console.log('SAVE_STOCK_PRICE');
            if (data.data.length > 0) {
                // 預設值
                const index = _.findIndex(state.stockList, ['id', stockId]);
                state.stockList[index].data = state.stockList[index].data || {};
                state.stockList[index].data.daily = state.stockList[index].data.daily || []; // 有可能是 null 就變成 []
                state.stockList[index].data.weekly = state.stockList[index].data.weekly || []; // 有可能是 null 就變成 []
                state.stockList[index].data.weekly_kd = state.stockList[index].data.weekly_kd || []; // 有可能是 null 就變成 []
                state.stockList[index].data.ma_buy = state.stockList[index].data.ma_buy || []; // 有可能是 null 就變成 [] 第一條MA線
                state.stockList[index].data.ma_sell = state.stockList[index].data.ma_sell || []; // 有可能是 null 就變成 [] 第二條MA線
                state.stockList[index].last_price = state.stockList[index].last_price || null;
                state.stockList[index].last_price_date = state.stockList[index].last_price_date || null;
                state.stockList[index].last_price_spread = state.stockList[index].last_price_spread || null;

                // 塞入股價日線資料
                // console.log(res.data.data);

                const values = [];
                data.data.forEach((element) => {
                    values.push([
                        element.date,
                        element.open,
                        element.max,
                        element.min,
                        element.close,
                        // element.Trading_Volume,
                    ]);
                });
                console.log(state.stockList[index].data.daily);
                state.stockList[index].data.daily.push(...values);
                console.log(state.stockList[index].data.daily);
                console.log(values);

                // theArray[index].data.daily.push(...res.data.data); // 塞入股價資料

                // 塞入漲跌幅、最後股價
                const v1 = state.stockList[index].data.daily[state.stockList[index].data.daily.length - 1][4];
                const v2 = state.stockList[index].data.daily[state.stockList[index].data.daily.length - 2][4];
                state.stockList[index].last_price = v1;

                const dayOfWeek = ['日', '一', '二', '三', '四', '五', '六'];
                const currStockLastDate = moment(
                    state.stockList[index].data.daily[state.stockList[index].data.daily.length - 1][0]
                );
                state.stockList[index].last_price_date = `${currStockLastDate.format('M/DD')}(${
                    dayOfWeek[currStockLastDate.day()]
                })`;

                state.stockList[index].last_price_spread = parseFloat((((v1 - v2) * 100) / v2).toFixed(2));

                // 塞入股價週線資料
                // const firstStockDate = moment(_.first(currStock[index].data.daily)[0]); // [] 不可能 undefined。因為是二維陣列，還要取第二維[0]代表date
                // const lastStockDate = moment(_.last(currStock[index].data.daily)[0]);

                // console.log(firstStockDate.format('YYYY-MM-DD HH:mm:ss'));
                // console.log(lastStockDate.format('YYYY-MM-DD HH:mm:ss'));

                // for moment 參考 https://stackoverflow.com/questions/52936352/javascript-for-loop-to-add-days-in-a-month-object-moment-js
                // lastStockDate.subtract(7, 'days') 因為我第一個要拿到就是減7天的值
                // 這裡要用 -6 才能最後面的資料也都算進去，不過可能實際因沒有資料而加上也沒到完整一週都有資料，
                let resData = [];

                let i = state.stockList[index].data.daily.length - 1;
                let j = i;
                const lastStockDate = moment(_.last(state.stockList[index].data.daily)[0]);
                let firstDayOfWeek = lastStockDate.startOf('isoWeek');
                while (i >= 0) {
                    // console.log(i);
                    // console.log(moment(currStock[index].data.daily[i][0]).format('YYYY-MM-DD'));
                    // console.log(firstDayOfWeek.format('YYYY-MM-DD'));
                    // 不能用 isSame 因為有可能那週沒資料，或那週星期一也放假，所以要用 isBefore
                    if (moment(state.stockList[index].data.daily[i][0]).isBefore(firstDayOfWeek) || i === 0) {
                        // console.log('isBefore');
                        // 0最後一個也要跑進來

                        // startIndex 值要小於等於 endIndex，for 是由大到小, i<j
                        const startIndex = i + 1; // 因為是找到前一個才算後面1個
                        const endIndex = j; // 因為外層array 是從日期最現在，往以前日期去掃。endIndex應該是最現在日期. i比n大
                        const range2dArray = _.slice(state.stockList[index].data.daily, startIndex, endIndex + 1);
                        const rangeHighArray = _.map(range2dArray, (v) => v[2]);
                        const rangeLowArray = _.map(range2dArray, (v) => v[3]);
                        // const rangeVolumeArray = _.map(range2dArray, (v) => v[5]);

                        const date = state.stockList[index].data.daily[endIndex][0];
                        const open = state.stockList[index].data.daily[startIndex][1]; // 上一個n的意思， 也許有 bug n+1應該要<這迴圈數量，若只有1個就有問題
                        const close = state.stockList[index].data.daily[endIndex][4]; // 之前的i，還沒i=n是下一個
                        const low = _.min(rangeLowArray);
                        const high = _.max(rangeHighArray);
                        // const volume = _.sum(rangeVolumeArray);

                        resData.push([date, open, high, low, close]);
                        j = startIndex - 1;

                        // 要採用下個i值的該週第一天，不能用firstDayOfWeek-7天，因為有可能該週都沒值
                        firstDayOfWeek = moment(state.stockList[index].data.daily[i][0]).startOf('isoWeek');
                    }
                    i -= 1;
                }

                // console.log(resData);
                // 必需要反轉，最小的值在最前面，最大的值在最後面，否則highcharts會只畫1個點
                // currStock[index].data.weekly = _.reverse(resData);
                // Vue.set(state.stockList[index].data, 'weekly', _.reverse(resData));
                state.stockList[index].data.weekly = _.reverse(resData);
                // this.$set(state.stockList[index].data, 'weekly', _.reverse(resData));

                // ===================塞入股價週線KD資料===================
                resData = [];
                let rsv = 0;
                let preK = 0;
                let preD = 0;
                let todayK = 0;
                let todayD = 0;

                // 從最早日期開始算，因為公式有用昨天
                for (let k = 0; k <= state.stockList[index].data.weekly.length - 1; k += 1) {
                    const startIndex = k - 8 < 0 ? 0 : k - 8; // 如果減完小於0，就=0。正常寫法是-9+1，但我寫-8就好了
                    const endIndex = k;
                    const range2dArray = _.slice(state.stockList[index].data.weekly, startIndex, endIndex + 1);
                    const rangeHighArray = _.map(range2dArray, (v) => v[2]);
                    const rangeLowArray = _.map(range2dArray, (v) => v[3]);
                    const low = _.min(rangeLowArray);
                    const high = _.max(rangeHighArray);

                    rsv = ((state.stockList[index].data.weekly[k][4] - low) / (high - low)) * 100; // (今日收盤價-最近9天最低價)/(最近9天最高價-最近9天最低價)*100
                    todayK = (2 / 3) * preK + (1 / 3) * rsv; // k=2/3 * 昨日的k值 + 1/3*今日的RSV
                    todayD = (2 / 3) * preD + (1 / 3) * todayK; // d=2/3 * 昨日的d值 + 1/3*今日的k值
                    preK = todayK;
                    preD = todayD;
                    const date = state.stockList[index].data.weekly[endIndex][0];

                    resData.push([date, todayK, todayD]);
                }
                state.stockList[index].data.weekly_kd = resData;

                // ===================塞入localstorage===================
                localStorage.removeItem('stockList');
                localStorage.setItem('stockList', JSON.stringify(state.stockList)); // 要放在 then後才能保證完成，放在最後面還可能
                this.commit('SAVE_STOCK_MA', stockId); // 計算 MA線
                this.commit('SAVE_STOCK_POLICY_RESULT', stockId);
                console.log('SAVE_STOCK_PRICE OK');
            }
        },
        SAVE_STOCK_MA(state, stockId) {
            console.log('SAVE_STOCK_MA');

            const index = _.findIndex(state.stockList, ['id', stockId]);
            state.stockList[index].data.ma_buy = [];
            state.stockList[index].data.ma_sell = [];
            let resData = [];
            let preMaLimit = 0; // 先前的MA參數值，不可能為0，所以設為0
            // ===================塞入股價週線MA1資料===================
            if (_.has(state.stockList[index], 'policy.settings.buy')) {
                const foundMaBuy = _.find(state.stockList[index].policy.settings.buy, ['method', 'ma_buy']);
                if (foundMaBuy) {
                    resData = [];
                    const maBuyLimit = foundMaBuy.limit;
                    preMaLimit = maBuyLimit;
                    for (let k = 0; k <= state.stockList[index].data.weekly.length - 1; k += 1) {
                        const startIndex = k - maBuyLimit - 1 < 0 ? 0 : k - maBuyLimit - 1; // 如果減完小於0，就=0。正常寫法是-3+1，但我寫-2就好了
                        const endIndex = k;
                        const range2dArray = _.slice(state.stockList[index].data.weekly, startIndex, endIndex + 1);
                        const rangeCloseArray = _.map(range2dArray, (v) => v[4]);
                        const average = _.mean(rangeCloseArray);

                        const date = state.stockList[index].data.weekly[endIndex][0];

                        resData.push([date, average]);
                    }
                    state.stockList[index].data.ma_buy = resData;
                }
            }
            // ===================塞入股價週線MA BUY資料(有可能最後是塞MA1，若MA1沒資料的話)===================
            if (_.has(state.stockList[index], 'policy.settings.sell')) {
                const foundMaSell = _.find(state.stockList[index].policy.settings.sell, ['method', 'ma_sell']);
                if (foundMaSell && preMaLimit !== foundMaSell.limit) {
                    resData = [];
                    const maSellLimit = foundMaSell.limit;
                    for (let k = 0; k <= state.stockList[index].data.weekly.length - 1; k += 1) {
                        const startIndex = k - maSellLimit - 1 < 0 ? 0 : k - maSellLimit - 1; // 如果減完小於0，就=0。正常寫法是-3+1，但我寫-2就好了
                        const endIndex = k;
                        const range2dArray = _.slice(state.stockList[index].data.weekly, startIndex, endIndex + 1);
                        const rangeCloseArray = _.map(range2dArray, (v) => v[4]);
                        const average = _.mean(rangeCloseArray);

                        const date = state.stockList[index].data.weekly[endIndex][0];

                        resData.push([date, average]);
                    }
                    // if (_.has(state.stockList[index], 'data.ma1') && _.isEmpty(state.stockList[index].data.ma1)) {
                    //     state.stockList[index].data.ma1 = resData;
                    // } else {
                    state.stockList[index].data.ma_sell = resData;
                    // }
                }
            }

            // ===================塞入localstorage===================
            localStorage.removeItem('stockList');
            localStorage.setItem('stockList', JSON.stringify(state.stockList)); // 要放在 then後才能保證完成，放在最後面還可能
            console.log('SAVE_STOCK_MA OK');
        },
        SAVE_STOCK_POLICY_RESULT(state, stockId) {
            console.log('SAVE_STOCK_POLICY_RESULT');

            // object of array 去 find 並 update
            const foundStock = state.stockList.find((v) => v.id === stockId);

            // 黃金交叉、死亡交叉
            const policyResult = [];

            if (_.has(foundStock, 'policy.settings.buy') || _.has(foundStock, 'policy.settings.sell')) {
                console.log('SAVE_STOCK_POLICY_RESULT foundStock');
                let foundKdGold = false;
                let foundKdTurnUp = false;
                let foundKdDead = false;
                let foundKdTurnDown = false;
                let foundMaBuy = false;
                let foundMaSell = false;
                if (_.has(foundStock, 'policy.settings.buy')) {
                    foundKdGold = _.find(foundStock.policy.settings.buy, ['method', 'kd_gold']);
                    foundKdTurnUp = _.find(foundStock.policy.settings.buy, ['method', 'kd_turn_up']);
                    foundMaBuy = _.find(foundStock.policy.settings.buy, ['method', 'ma_buy']);
                }
                if (_.has(foundStock, 'policy.settings.sell')) {
                    foundKdDead = _.find(foundStock.policy.settings.sell, ['method', 'kd_dead']);
                    foundKdTurnDown = _.find(foundStock.policy.settings.sell, ['method', 'kd_turn_down']);
                    foundMaSell = _.find(foundStock.policy.settings.sell, ['method', 'ma_sell']);
                }

                let kdGoldReady = false;
                let kdDeadReady = false;
                let preK = 0;
                let kdTurnUpReady = false;
                let kdTurnDownReady = false;
                foundStock.data.weekly_kd.forEach((item, dataIndex) => {
                    const k = item[1];
                    const d = item[2];
                    // 週 KD 黃金交叉 買進訊號
                    if (foundKdGold) {
                        if (k < d) {
                            kdGoldReady = true;
                        }
                        if (k <= foundKdGold.limit && k >= d && kdGoldReady) {
                            // 寫這樣有錯，不是<=20，然後K>=D就是買進。正確要之前先有K<D
                            const index = _.findIndex(policyResult, ['date', item[0]]);
                            const dataWeeklyPrice = foundStock.data.weekly[dataIndex][4];
                            if (index === -1)
                                policyResult.push({
                                    date: item[0],
                                    is_buy: true,
                                    k,
                                    price: dataWeeklyPrice,
                                    reason: ['kd_gold'],
                                });
                            else {
                                policyResult[index].is_buy = true;
                                policyResult[index].k = k;
                                policyResult[index].reason.push('kd_gold');
                            }
                            kdGoldReady = false;
                        }
                    }
                    // 週 KD 往上轉折 買進訊號
                    if (foundKdTurnUp) {
                        if (k < preK) {
                            kdTurnUpReady = true;
                        }
                        if (k <= foundKdTurnUp.limit && k >= preK && kdTurnUpReady) {
                            // 寫這樣有錯，不是<=20，然後K>=D就是買進。正確要之前先有K<D
                            const index = _.findIndex(policyResult, ['date', item[0]]);
                            const dataWeeklyPrice = foundStock.data.weekly[dataIndex][4];
                            if (index === -1)
                                policyResult.push({
                                    date: item[0],
                                    is_buy: true,
                                    k,
                                    price: dataWeeklyPrice,
                                    reason: ['kd_turn_up'],
                                });
                            else {
                                policyResult[index].is_buy = true;
                                policyResult[index].k = k;
                                policyResult[index].reason.push('kd_turn_up');
                            }
                            kdTurnUpReady = false;
                        }
                    }

                    // 週 KD 死亡交叉 賣出訊號
                    if (foundKdDead) {
                        if (k > d) {
                            kdDeadReady = true;
                        }
                        if (k >= foundKdDead.limit && k <= d && kdDeadReady) {
                            // 寫這樣有錯，不是<=20，然後K>=D就是買進。正確要之前先有K<D
                            const index = _.findIndex(policyResult, ['date', item[0]]);
                            const dataWeeklyPrice = foundStock.data.weekly[dataIndex][4];
                            if (index === -1)
                                policyResult.push({
                                    date: item[0],
                                    is_sell: true,
                                    k,
                                    price: dataWeeklyPrice,
                                    reason: ['kd_dead'],
                                });
                            else {
                                policyResult[index].is_sell = true;
                                policyResult[index].k = k;
                                policyResult[index].reason.push('kd_dead');
                            }
                            kdDeadReady = false;
                        }
                    }
                    // 週 KD 往下轉折 賣出訊號
                    if (foundKdTurnDown) {
                        if (k > preK) {
                            kdTurnDownReady = true;
                        }
                        if (k >= foundKdTurnDown.limit && k <= preK && kdTurnDownReady) {
                            // 寫這樣有錯，不是<=20，然後K>=D就是買進。正確要之前先有K<D
                            const index = _.findIndex(policyResult, ['date', item[0]]);
                            const dataWeeklyPrice = foundStock.data.weekly[dataIndex][4];
                            if (index === -1)
                                policyResult.push({
                                    date: item[0],
                                    is_sell: true,
                                    k,
                                    price: dataWeeklyPrice,
                                    reason: ['kd_turn_down'],
                                });
                            else {
                                policyResult[index].is_sell = true;
                                policyResult[index].k = k;
                                policyResult[index].reason.push('kd_turn_down');
                            }
                            kdTurnDownReady = false;
                        }
                    }
                    preK = k;
                });

                // 搭配 MA 均線 日均線之上
                policyResult.forEach((item) => {
                    // 買進時，找出該天的日均線
                    if (item.is_buy && foundMaBuy) {
                        const foundDataMaBuy = _.find(foundStock.data.ma_buy, (array) => array[0] === item.date);
                        const maBuyValue = foundDataMaBuy[1];
                        // const foundDataWeekly = _.find(foundStock.data.weekly, (array) => array[0] === item.date);
                        // const priceValueForBuy = foundDataWeekly[4];
                        if (item.price <= maBuyValue) {
                            item.is_buy_cancel = true;
                            // item.price = priceValueForBuy;
                            item.ma_buy = maBuyValue;
                            item.reason.push('ma_buy');
                        }
                    }
                    // 賣出時，找出該天的日均線
                    if (item.is_sell && foundMaSell) {
                        const foundDataMaSell = _.find(foundStock.data.ma_sell, (array) => array[0] === item.date);
                        const maSellValue = foundDataMaSell[1];
                        // const foundDataWeekly = _.find(foundStock.data.weekly, (array) => array[0] === item.date);
                        // const priceValueForSell = foundDataWeekly[4];
                        if (item.price >= maSellValue) {
                            item.is_sell_cancel = true;
                            // item.price = priceValueForSell;
                            item.ma_buy = maSellValue;
                            item.reason.push('ma_sell');
                        }
                    }
                });

                foundStock.policy.result = [];
                foundStock.policy.result.push(...policyResult);
                // save to localstorage
                localStorage.removeItem('stockList');
                localStorage.setItem('stockList', JSON.stringify(state.stockList));

                this.commit('SAVE_STOCK_POLICY_RETURN_RESULT', stockId); // 計算policy且有關報酬率的結果
            }
            console.log('SAVE_STOCK_POLICY_RESULT OK');
        },
        SAVE_STOCK_POLICY_RETURN_RESULT(state, stockId) {
            console.log('SAVE_STOCK_POLICY_RETURN_RESULT');

            const foundStock = state.stockList.find((v) => v.id === stockId);
            // 一定有 policy.settings.buy 及 sell 因為前面SAVE_STOCK_POLICYRESULT 已經判斷過了

            let foundCostDown = false;
            let foundEarn = false;
            if (_.has(foundStock, 'policy.settings.buy')) {
                foundCostDown = _.find(foundStock.policy.settings.buy, ['method', 'cost_down']);
            }
            if (_.has(foundStock, 'policy.settings.sell')) {
                foundEarn = _.find(foundStock.policy.settings.sell, ['method', 'earn']);
            }

            // 最後一天強制再多塞入一個is_latest來計算最新的報酬率
            let dataDailyLastDate = null;
            if (foundStock.policy.result.length > 0) {
                const policyResultLastDate = moment(foundStock.policy.result[foundStock.policy.result.length - 1].date);
                dataDailyLastDate = moment(foundStock.data.daily[foundStock.data.daily.length - 1][0]);

                if (dataDailyLastDate.isAfter(policyResultLastDate)) {
                    foundStock.policy.result.push({
                        date: dataDailyLastDate.format('YYYY-MM-DD'),
                        is_latest: true,
                        price: foundStock.data.daily[foundStock.data.daily.length - 1][4],
                        reason: ['latest'],
                    });
                }
            }

            let isReadyToSell = false;
            let numberOfBuy = 0;
            let accPriceOfBuy = 0;
            let dateOfFirstBuy = '';
            foundStock.badge = null;
            foundStock.policy.result.forEach((obj) => {
                // 必需有買才要在第一次賣時算報酬率
                if (obj.is_buy && !obj.is_sell && !obj.is_buy_cancel) {
                    // !isReadyToSell && 不需要這個判斷，因為隨時都可買
                    // 如果有 搭配 成本價跌超過，則在此決定那個買是否真的要買
                    let isCancelToBuy = false;
                    if (foundCostDown && numberOfBuy > 1) {
                        // 會在買超過1次才會進來判斷，因為這樣才有之前報酬率
                        const rateOfReturn = (obj.price * numberOfBuy - accPriceOfBuy) / accPriceOfBuy;
                        if (rateOfReturn * 100 > -foundCostDown) {
                            // 比負10還大，就是沒超過，就不買了。foundCostDown都是正值，但實際人認知是負值
                            isCancelToBuy = true;
                            obj.is_buy_cancel = true;
                            obj.reason.push('cost_down');
                        }
                    }
                    // 去累加買入訊號單位
                    // console.log(obj);
                    // console.log(isCancelToBuy);
                    if (!isCancelToBuy) {
                        numberOfBuy += 1;
                        // console.log(numberOfBuy);
                        if (numberOfBuy === 1) dateOfFirstBuy = obj.date; // 賣出要記，之後可以知道該次賣出最早的買進時間，然後再算總期間累計報酬
                        accPriceOfBuy += obj.price;
                        obj.is_sure_buy = true;
                        isReadyToSell = true;
                        // 如果最後一天剛好也是買，那也需要算報酬率, 但算完可能也是0(也許不用算直接給0)
                        if (dataDailyLastDate.isSame(moment(obj.date))) {
                            obj.date_of_first_buy = dateOfFirstBuy;
                            obj.rate_of_return = (obj.price * numberOfBuy - accPriceOfBuy) / accPriceOfBuy;
                            obj.number_of_buy = numberOfBuy;
                            foundStock.badge = '買訊'; // 必定買
                        }
                    }
                } else if (isReadyToSell && ((obj.is_sell && !obj.is_buy && !obj.is_sell_cancel) || obj.is_latest)) {
                    // 不能同時當天有買也有賣，這樣也會取消
                    // 去累加買入訊號單位
                    const rateOfReturn = (obj.price * numberOfBuy - accPriceOfBuy) / accPriceOfBuy;

                    // 搭配 絕對正報酬
                    let isCancelToSell = false;
                    if (foundEarn && rateOfReturn * 100 < foundEarn.limit) {
                        isCancelToSell = true;
                        obj.is_sell_cancel = true;
                        obj.reason.push('earn');
                    }
                    if (!isCancelToSell || obj.is_latest) {
                        // 就算是取消賣，最後一天也是要去算最新報酬喔
                        obj.rate_of_return = rateOfReturn;
                        obj.number_of_buy = numberOfBuy;
                        obj.date_of_first_buy = dateOfFirstBuy;
                        if (obj.is_sell) obj.is_sure_sell = true; // 最後一個日期如果真的是賣才會有確定賣，
                        dateOfFirstBuy = '';
                        numberOfBuy = 0;
                        accPriceOfBuy = 0;
                        isReadyToSell = false;

                        // 如果最後一天剛好也是賣
                        if (obj.is_sure_sell && dataDailyLastDate.isSame(moment(obj.date))) {
                            foundStock.badge = '賣訊'; // 必定賣
                        }

                        // 如果是最後一個日期，且也不是賣，並且之前有買，這時要算一下最新狀態，有可能是要買入或賣出或都沒有，
                    }
                } else if (!isReadyToSell && obj.is_latest) {
                    // 如果最新日期，但是前面沒有買，而且也沒有賣，代表也不用算現在報酬率，所以要取消
                    foundStock.policy.result.pop(); // 移除最後一個元素
                }
            });

            // 算歷史報酬列表
            foundStock.policy.history =
                foundStock.policy && foundStock.policy.result
                    ? _.map(
                          _.reverse(
                              _.filter(
                                  foundStock.policy.result,
                                  (obj) =>
                                      moment().diff(obj.date, 'years') <= 9 &&
                                      (obj.is_sure_buy || obj.is_sure_sell || obj.is_latest)
                              )
                          ),
                          (obj) => {
                              let buyOrSell = '現在';
                              if (obj.is_sure_sell) {
                                  buyOrSell = '賣';
                              } else if (obj.is_sure_buy) {
                                  buyOrSell = '買';
                              }
                              return {
                                  date: obj.date,
                                  buy_or_sell: buyOrSell,
                                  price: obj.price,
                                  rate_of_return: obj.rate_of_return ? `${Number((obj.rate_of_return * 100).toFixed(1))}%` : '',
                              };
                          }
                      )
                    : [];

            foundStock.policy.stats = {};

            localStorage.removeItem('stockList');
            localStorage.setItem('stockList', JSON.stringify(state.stockList));
            this.commit('SAVE_STOCK_POLICY_RETURN_STATS', stockId);

            console.log('SAVE_STOCK_POLICY_RETURN_RESULT OK');
        },

        SAVE_STOCK_POLICY_RETURN_STATS(state, stockId) {
            console.log('SAVE_STOCK_POLICY_RETURN_STATS');

            const foundStock = state.stockList.find((v) => v.id === stockId);

            // 必需有買或賣的設定
            if (
                (_.has(foundStock, 'policy.settings.buy') && foundStock.policy.settings.buy.length > 0) ||
                (_.has(foundStock, 'policy.settings.sell') && foundStock.policy.settings.sell.length > 0)
            ) {
                foundStock.policy.stats = {};
                let numberOfSell = 0;
                let sumOfReturns = 0;
                let dateOfFirstBuy = '';
                let holdDays = 0;
                let sumOfBuyNumber = 0;
                let maxEarn = -999999;
                let maxLose = 999999;
                let compoundOfReturns = 1; // 複利報酬率，為了算年均及年化報酬率，本是1

                foundStock.policy.result.forEach((obj) => {
                    if (moment().diff(obj.date, 'years') <= 9) {
                        if (obj.is_sure_sell || obj.is_latest) {
                            numberOfSell += 1;
                            // 為了算"計算期間"，第一個買入的日期要知道
                            sumOfReturns += obj.rate_of_return;
                            if (numberOfSell === 1) {
                                // 賣的第一個要計時間
                                dateOfFirstBuy = obj.date_of_first_buy;
                            }
                            holdDays += moment(obj.date).diff(moment(obj.date_of_first_buy), 'days');
                            sumOfBuyNumber += obj.number_of_buy;

                            // 算最大賺及最大賠
                            if (obj.rate_of_return > maxEarn) maxEarn = obj.rate_of_return;
                            if (obj.rate_of_return < maxLose) maxLose = obj.rate_of_return;

                            compoundOfReturns += compoundOfReturns * obj.rate_of_return;
                        }
                        // 如今天是2022-02-25，則會算到2012-02-26。2012-02-25就不算了
                    }
                });
                let diffYearsFloat = 0;

                foundStock.policy.stats.diff_years = 0;
                foundStock.policy.stats.diff_remaining_days = 0;
                if (dateOfFirstBuy !== '') {
                    const diffDays = moment().diff(moment(dateOfFirstBuy), 'days');
                    const diffYears = diffDays / 365 > 0 ? diffDays / 365 : 0;
                    const diffRemainingDays = diffDays % 365 > 0 ? diffDays % 365 : 0;
                    foundStock.policy.stats.diff_years = diffYears;
                    foundStock.policy.stats.diff_remaining_days = diffRemainingDays;
                    diffYearsFloat = diffDays / 365;
                }

                foundStock.policy.stats.sum_of_returns = sumOfReturns;
                foundStock.policy.stats.average_of_returns = numberOfSell === 0 ? 0 : sumOfReturns / numberOfSell;
                foundStock.policy.stats.average_hold_days = numberOfSell === 0 ? 0 : Math.floor(holdDays / numberOfSell);
                foundStock.policy.stats.average_buy_number = numberOfSell === 0 ? 0 : sumOfBuyNumber / numberOfSell;

                // 若真的都沒有買賣，則顯示為0
                if (maxEarn === -999999) maxEarn = 0;
                if (maxLose === 999999) maxLose = 0;
                foundStock.policy.stats.max_earn = maxEarn;
                foundStock.policy.stats.max_lose = maxLose;
                foundStock.policy.stats.number_of_sell = numberOfSell;
                // foundStock.policy.stats.average_annual_return = (compoundOfReturns - 1) / diffYearsFloat;
                foundStock.policy.stats.average_annual_return = sumOfReturns / diffYearsFloat;
                foundStock.policy.stats.internal_of_return =
                    diffYearsFloat === 0 ? 0 : compoundOfReturns ** (1 / diffYearsFloat) - 1;
            } else if (_.has(foundStock, 'policy.stats')) {
                delete foundStock.policy.stats;
            }
            localStorage.removeItem('stockList');
            localStorage.setItem('stockList', JSON.stringify(state.stockList));
            this.commit('SAVE_STOCK_POLICY_RETURN_FUTURE_BADGE', stockId);
        },
        SAVE_STOCK_POLICY_RETURN_FUTURE_BADGE(state, stockId) {
            console.log('SAVE_STOCK_POLICY_RETURN_FUTURE_BADGE');

            const foundStock = state.stockList.find((v) => v.id === stockId);
            // 如果是最後一個日期，且也不是賣，並且之前有買，這時要算一下最新狀態，有可能是要買入或賣出或都沒有，
            if (!foundStock.badge && _.has(foundStock, 'policy.result') && foundStock.policy.result.length >= 1) {
                // 代表沒有確定買跟確定賣，需要確定之前有買才有預測賣，若是預測買就不用看了
                // 預測買看KD黃金交叉跟黃金轉折
                // 預測賣看KD死亡交叉跟死亡轉折，停利停損之後再看
                if (_.has(foundStock, 'policy.settings.buy')) {
                    let foundKdGold = false;
                    let foundKdTurnUp = false;
                    foundKdGold = _.find(foundStock.policy.settings.buy, ['method', 'kd_gold']);
                    foundKdTurnUp = _.find(foundStock.policy.settings.buy, ['method', 'kd_turn_up']);
                    if (foundKdGold) {
                        const lastestK = foundStock.data.weekly_kd[foundStock.data.weekly_kd.length - 1][1];
                        if (lastestK <= foundKdGold.limit) foundStock.badge = '準買訊';
                    }
                    if (foundKdTurnUp) {
                        const lastestK = foundStock.data.weekly_kd[foundStock.data.weekly_kd.length - 1][1];
                        if (lastestK <= foundKdTurnUp.limit) foundStock.badge = '準買訊';
                    }
                }

                if (
                    foundStock.policy.result[foundStock.policy.result.length - 1].date ===
                    foundStock.data.daily[foundStock.data.daily.length - 1][0]
                ) {
                    // 等於代表沒pop，可預測賣
                    if (_.has(foundStock, 'policy.settings.sell')) {
                        let foundKdDead = false;
                        let foundKdTurnDown = false;
                        foundKdDead = _.find(foundStock.policy.settings.sell, ['method', 'kd_dead']);
                        foundKdTurnDown = _.find(foundStock.policy.settings.sell, ['method', 'kd_turn_down']);
                        if (foundKdDead) {
                            const lastestK = foundStock.data.weekly_kd[foundStock.data.weekly_kd.length - 1][1];

                            if (lastestK >= foundKdDead.limit) foundStock.badge = '準賣訊';
                        }
                        if (foundKdTurnDown) {
                            const lastestK = foundStock.data.weekly_kd[foundStock.data.weekly_kd.length - 1][1];
                            if (lastestK >= foundKdTurnDown.limit) foundStock.badge = '準賣訊';
                        }
                    }
                }
            }
            console.log('SAVE_STOCK_POLICY_RETURN_FUTURE_BADGE OK');
        },
    },
    getters: {
        // object of array to filter
        getStock: (state) => (id) => {
            console.log('getStock');
            return _.find(state.stockList, ['id', id]);
        },
        getStockDataWeekly: (state, getters) => (id) => {
            console.log('getStockDataWeekly');
            // if (_.has(getters.getStock(id), 'data.weekly')) console.log(getters.getStock(id).data.weekly.length);
            const found = getters.getStock(id);
            return found.data && found.data.weekly
                ? _.slice(found.data.weekly, -52).map((value) => [
                      moment(value[0]).valueOf(),
                      value[1],
                      value[2],
                      value[3],
                      value[4],
                  ])
                : [];
            // kd 一定要去直取 policy，而非取 stock，才能Policy有改有連動
            // getStockPolicy: (state, getters) => (id) => _.has(getters.getStock(id), 'policy') ? getters.getStock(id).policy : null,
            // _.has(_.find(state.stockList, ['id', id]), 'policy') ? _.find(state.stockList, ['id', id]).policy : null,
        },
        getStockDataWeeklyKd: (state, getters) => (id) => {
            console.log('getStockDataWeekly');
            // if (_.has(getters.getStock(id), 'data.weekly')) console.log(getters.getStock(id).data.weekly.length);
            const found = getters.getStock(id);
            return found.data && found.data.weekly_kd
                ? _.slice(found.data.weekly_kd, -52).map((value) => [moment(value[0]).valueOf(), value[1], value[2]])
                : [];
        },
        getStockDataWeeklyMaBuy: (state, getters) => (id) => {
            console.log('getStockDataWeeklyMaBuy');
            // if (_.has(getters.getStock(id), 'data.weekly')) console.log(getters.getStock(id).data.weekly.length);
            const found = getters.getStock(id);
            return found.data && found.data.ma_buy
                ? _.slice(found.data.ma_buy, -52).map((value) => [moment(value[0]).valueOf(), value[1]])
                : [];
        },
        getStockDataWeeklyMaSell: (state, getters) => (id) => {
            console.log('getStockDataWeeklyMaSell');
            // if (_.has(getters.getStock(id), 'data.weekly')) console.log(getters.getStock(id).data.weekly.length);
            const found = getters.getStock(id);
            return found.data && found.data.ma_sell
                ? _.slice(found.data.ma_sell, -52).map((value) => [moment(value[0]).valueOf(), value[1]])
                : [];
        },
        getStockPolicyMa: (state, getters) => (id) => {
            console.log('getStockPolicyMa');
            const ret = { ma_buy_limit: 0, ma_sell_limit: 0 };
            // if (_.has(getters.getStock(id), 'data.weekly')) console.log(getters.getStock(id).data.weekly.length);
            const found = getters.getStock(id);
            if (_.has(found, 'policy.settings.buy')) {
                const maBuy = _.find(found.policy.settings.buy, ['method', 'ma_buy']);
                if (maBuy) ret.ma_buy_limit = maBuy.limit;
            }
            if (_.has(found, 'policy.settings.sell')) {
                const maSell = _.find(found.policy.settings.sell, ['method', 'ma_sell']);
                if (maSell) ret.ma_sell_limit = maSell.limit;
            }
            return ret;
        },
        getProgressMultiple: (state) => () => {
            console.log('getProgressMultiple');

            const maxEarnOrLoseRate = _.max(
                _.map(state.stockList, (obj) => {
                    if (obj.cost) {
                        return Math.abs(
                            Number((((obj.last_price * obj.cost.total - obj.cost.sum) * 100) / obj.cost.sum).toFixed(2))
                        );
                    }

                    return 0;
                })
            );
            let progressMultiple = 1; // 預設值
            //* 4 則最大值為25%。 * 2 則最大值為50%。 * 1 則最大值為100%。 0.6%最大值為166% 0.5最大值為200%  0.2 最大值為500% 0.1 最大值為1000%  0.05最大值為2000  0.01 最大值為10000%
            if (maxEarnOrLoseRate <= 25) progressMultiple = 4;
            else if (maxEarnOrLoseRate <= 50) progressMultiple = 2;
            else if (maxEarnOrLoseRate <= 100) progressMultiple = 1;
            else if (maxEarnOrLoseRate <= 166) progressMultiple = 0.6;
            else if (maxEarnOrLoseRate <= 500) progressMultiple = 0.2;
            else if (maxEarnOrLoseRate <= 1000) progressMultiple = 0.1;
            else if (maxEarnOrLoseRate <= 2000) progressMultiple = 0.05;
            else if (maxEarnOrLoseRate <= 10000) progressMultiple = 0.01;
            // state.progressMultiple = progressMultiple;
            return progressMultiple;
        },
    },
};

export default stock;
