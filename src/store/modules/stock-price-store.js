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
        //     name: '富邦金',
        //     id: '2881',
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
        GET_STOCK_PRICE(context) {
            console.log('GET_STOCK_PRICE');

            context.state.stockList.forEach((stcokObj) => {
                // 為了修改，所以多加 index 及 theArray 參數
                // console.log(stcokObj);

                // console.log(currStock[index]);

                const stockDataDaily = _.has(stcokObj, 'data.daily') ? stcokObj.data.daily : []; // 有可能是 null 就變成 []
                // 判斷若是沒值(即 [] 空array)，若從資料庫取得日期要加1天喔
                const stockStartDate = moment(
                    stockDataDaily.length === 0 ? '2010-01-01' : moment(stockDataDaily.at(-1)[0]).add(1, 'days')
                ).format('YYYY-MM-DD');

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
                            context.commit('SAVE_STOCK_PRICE', { stockId: stcokObj.id, data: res.data });
                        })
                        // 失敗
                        .catch((err) => {
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
            localStorage.setItem('stockList', JSON.stringify(state.stockList));
            this.dispatch('GET_STOCK_PRICE'); // 到時化優化成單1股票，或 SAVE STOCK PRICE有機制判斷是最好的
        },
        DEL_A_STOCK(state, data) {
            // data 是 object {name: XXX, id: XXX}
            console.log('DEL_A_STOCK');
            // 移除某個自選股
            _.remove(state.stockList, (obj) => obj.id === data);
            localStorage.setItem('stockList', JSON.stringify(state.stockList));
        },
        SAVE_STOCK_STAR(state, { stockId, star }) {
            console.log(stockId);
            console.log(star);

            // object of array 去 find 並 update
            const found = state.stockList.find((v) => v.id === stockId);
            found.star = 0;
            found.star = star; // 複製數據複本

            // save to localstorage
            localStorage.setItem('stockList', JSON.stringify(state.stockList));
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
        SAVE_STOCK_POLICY(state, { stockId, policyList }) {
            console.log(stockId);
            console.log(policyList);

            // object of array 去 find 並 update
            const found = state.stockList.find((v) => v.id === stockId);
            found.policy = { settings: {} };
            found.policy.settings = policyList; // 複製數據複本

            // save to localstorage
            localStorage.setItem('stockList', JSON.stringify(state.stockList));
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
                state.stockList[index].data.daily.push(...values);

                // theArray[index].data.daily.push(...res.data.data); // 塞入股價資料

                // 塞入漲跌幅、最後股價
                const v1 = state.stockList[index].data.daily.at(-1)[4];
                const v2 = state.stockList[index].data.daily.at(-2)[4];
                state.stockList[index].last_price = v1;

                const dayOfWeek = ['日', '一', '二', '三', '四', '五', '六'];
                const currStockLastDate = moment(state.stockList[index].data.daily.at(-1)[0]);
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
                localStorage.setItem('stockList', JSON.stringify(state.stockList)); // 要放在 then後才能保證完成，放在最後面還可能
                this.commit('SAVE_STOCK_MA', stockId); // 計算 MA線
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
            localStorage.setItem('stockList', JSON.stringify(state.stockList)); // 要放在 then後才能保證完成，放在最後面還可能
            console.log('SAVE_STOCK_MA OK');
        },
        SAVE_STOCK_POLICY_RESULT(state, stockId) {
            console.log('SAVE_STOCK_POLICY_RESULT');

            // object of array 去 find 並 update
            const foundStock = state.stockList.find((v) => v.id === stockId);

            // 黃金交叉、死亡交叉
            const policyResult = [];

            console.log(foundStock);
            if (_.has(foundStock, 'policy.settings.buy') || _.has(foundStock, 'policy.settings.sell')) {
                console.log('SAVE_STOCK_POLICY_RESULT foundStock');
                let foundKdGold = false;
                let foundKdTurnUp = false;
                let foundKdDead = false;
                let foundKdTurnDown = false;
                if (_.has(foundStock, 'policy.settings.buy')) {
                    foundKdGold = _.find(foundStock.policy.settings.buy, ['method', 'kd_gold']);
                    foundKdTurnUp = _.find(foundStock.policy.settings.buy, ['method', 'kd_turn_up']);
                }
                if (_.has(foundStock, 'policy.settings.sell')) {
                    foundKdDead = _.find(foundStock.policy.settings.sell, ['method', 'kd_dead']);
                    foundKdTurnDown = _.find(foundStock.policy.settings.sell, ['method', 'kd_turn_down']);
                }

                let kdGoldReady = false;
                let kdDeadReady = false;
                let preK = 0;
                let kdTurnUpReady = false;
                let kdTurnDownReady = false;
                foundStock.data.weekly_kd.forEach((item) => {
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
                            if (index === -1) policyResult.push({ date: item[0], isBuy: true, k });
                            else {
                                policyResult[index].isBuy = true;
                                policyResult[index].k = k;
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
                            if (index === -1) policyResult.push({ date: item[0], isBuy: true, k });
                            else {
                                policyResult[index].isBuy = true;
                                policyResult[index].k = k;
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
                            if (index === -1) policyResult.push({ date: item[0], isSell: true, k });
                            else {
                                policyResult[index].isSell = true;
                                policyResult[index].k = k;
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
                            if (index === -1) policyResult.push({ date: item[0], isSell: true, k });
                            else {
                                policyResult[index].isSell = true;
                                policyResult[index].k = k;
                            }
                            kdTurnDownReady = false;
                        }
                    }
                    preK = k;
                    console.log(item);
                });

                foundStock.policy.result = [];
                foundStock.policy.result.push(...policyResult);

                // save to localstorage
                localStorage.setItem('stockList', JSON.stringify(state.stockList));
            }
            console.log('SAVE_STOCK_POLICY_RESULT OK');
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
    },
};

export default stock;
