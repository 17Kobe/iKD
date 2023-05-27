import axios from 'axios';
import moment from 'moment';
import _ from 'lodash';

const defaultState = {
    usdExchange: 30,
    stockList: [], // 目前知道 ios 在 19支股票，>=19會不能儲存localstorage
    tempStockList: [], // 暫存股票data變一年以內
};

const stock = {
    // vue3 的 state 要用() 變是 func
    state() {
        return defaultState;
    },
    actions: {
        async GET_STOCK_PRICE({ state, commit }, force = false) {
            // GET_STOCK_PRICE(context, force = false) {
            console.log('GET_STOCK_PRICE 0');

            await Promise.all(
                _.map(state.stockList, async (stcokObj) => {
                    // 為了修改，所以多加 index 及 theArray 參數
                    // console.log(stcokObj);

                    // console.log(currStock[index]);
                    const isFund = stcokObj.type === 'fund'; // 判斷是否為基金
                    console.log('GET_STOCK_PRICE 1');
                    const stockDataDaily = _.has(stcokObj, 'data.daily') ? stcokObj.data.daily : []; // 有可能是 null 就變成 []
                    // console.log(stockDataDaily);
                    // 判斷若是沒值(即 [] 空array)，若從資料庫取得日期要加1天喔
                    const stockStartDate = moment(
                        stockDataDaily.length === 0
                            ? moment().subtract(10, 'years').format('YYYY-MM-DD')
                            : moment(stockDataDaily[stockDataDaily.length - 1][0]).add(1, 'days')
                    ).format('YYYY-MM-DD');

                    console.log('GET_STOCK_PRICE 2');
                    // 按照網站存在的日期才發出API需求
                    // https://stackoverflow.com/questions/36197031/how-to-use-moment-js-to-check-whether-the-current-time-is-between-2-times
                    const currentTime = moment(); // 目前時間
                    const today = currentTime.format('YYYY-MM-DD');
                    const stockMarketCloseTime = moment('13:30:00', 'hh:mm:ss');
                    let siteExistsLatestDate = moment().format('YYYY-MM-DD');
                    console.log(currentTime.day());
                    if (currentTime.day() === 6)
                        // 星期六，不算了，就減一天
                        siteExistsLatestDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
                    else if (currentTime.day() === 0)
                        // 星期日，不算了，就減二天
                        siteExistsLatestDate = moment().subtract(2, 'days').format('YYYY-MM-DD');
                    else if (currentTime.day() === 1 && currentTime.isBefore(stockMarketCloseTime))
                        // 星期一且還沒交易結束時間，不算了，就減三天
                        siteExistsLatestDate = moment().subtract(3, 'days').format('YYYY-MM-DD');
                    else if (currentTime.isBefore(stockMarketCloseTime))
                        // 如果目前時間少於交易結束時間，則要減一天
                        siteExistsLatestDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
                    // console.log(currentTime.format('YYYY-MM-DD hh:mm:ss'));
                    // console.log(stockMarketCloseTime.format('YYYY-MM-DD hh:mm:ss'));
                    // console.log(siteExistsLatestDate);
                    // console.log(stockData);
                    // console.log(stockData.at(-1)[0]);
                    // console.log(stockStartDate);

                    // 因為我有將 stockStartDate + 1天，所以有 Same
                    if (moment(siteExistsLatestDate).isSameOrAfter(stockStartDate) || force) {
                        console.log('GET_STOCK_PRICE 3');

                        // 股票
                        if (!isFund) {
                            console.log('GET_STOCK_PRICE 31');
                            // 因為 axios 是非同步，但我要確實等它執行完才 resolve
                            await axios
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
                                    commit('SAVE_STOCK_PRICE', { stockId: stcokObj.id, data: res.data });
                                })
                                // 失敗
                                .catch((err) => {
                                    console.log('GET_STOCK_PRICE error. ' + stcokObj.id);
                                    commit('SAVE_STOCK_POLICY_RESULT', stcokObj.id); // 跑此是為了有可能上回淨值新增了(這回沒要新增)，但是報酬率沒算完
                                    console.log(err);
                                });
                        } else {
                            console.log('GET_STOCK_PRICE 32');
                            // 基金
                            commit('SAVE_STOCK_PRICE', { stockId: stcokObj.id, data: { data: [] } });
                            // axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
                            // axios
                            //     .get(
                            //         'https://tw.stock.yahoo.com/_td-stock/api/resource/FundServices.fundsPriceHistory;fundId=' +
                            //             stcokObj.id +
                            //             ':FO;timeslot=' +
                            //             stockStartDate +
                            //             'T00:00:00Z-' +
                            //             today +
                            //             'T23:59:59Z?bkt=&device=desktop&ecma=modern&feature=ecmaModern,useVersionSwitch,useNewQuoteTabColor&intl=tw&lang=zh-Hant-TW&partner=none&prid=e4nof9lh3r54p&region=TW&site=finance&tz=Asia/Taipei&ver=1.2.1233&returnMeta=true'
                            //     )
                            //     // 成功
                            //     .then((res) => {
                            //         console.log('GET_STOCK_PRICE 4');
                            //         context.commit('SAVE_STOCK_PRICE', { stockId: stcokObj.id, data: res.data });
                            //     })
                            //     // 失敗
                            //     .catch((err) => {
                            //         console.log('GET_STOCK_PRICE error');
                            //         context.commit('SAVE_STOCK_POLICY_RESULT', stcokObj.id); // 跑此是為了有可能上回淨值新增了(這回沒要新增)，但是報酬率沒算完
                            //         console.log(err);
                            //     });
                        }
                    } else {
                        // 股票
                        if (!isFund) {
                            commit('SAVE_STOCK_POLICY_RESULT', stcokObj.id); // 跑此是為了有可能上回淨值新增了(這回沒要新增)，但是報酬率沒算完
                        } else {
                            // 基金
                            commit('SAVE_STOCK_PRICE', { stockId: stcokObj.id, data: { data: [] } });
                        }
                    }
                    return 'ok';
                })
            );
            console.log('all ok');
            // 為了股票值全部更新完去更新資產值
            // 並且該值要讀 localstorage 才是最新的，vuex若沒開啟資產配置是不會是最新值，只是預設值
            const localAssetList = JSON.parse(localStorage.getItem('assetList')) || [];
            // 必須曾經有改過才存到歷史存款去
            if (!_.isEmpty(localAssetList)) {
                const stockDeposit = state.stockList.reduce((acc, { cost }) => {
                    if (cost && cost.sum) return acc + cost.sum + cost.return;
                    return acc;
                }, 0);

                const tempAssets =
                    stockDeposit +
                    localAssetList.reduce((acc, { amount }) => {
                        if (amount >= 0) return acc + amount;
                        return acc;
                    }, 0);

                console.log('=======assets');

                // 存到歷史存款去
                // 歷史存款要先從 localstorage 讀到並且存到 vuex，因為這原本是 AssetAllocation才去做的。而ADD_OR_UPDATE_HISTORY_ASSET_LIST是判斷vuex內容去更新的
                const localHistoryAssettList = JSON.parse(localStorage.getItem('historyAssetList')) || [];
                commit('SAVE_HISTORY_ASSET_LIST', localHistoryAssettList);
                commit('ADD_OR_UPDATE_HISTORY_ASSET_LIST', [
                    moment().format('YYYY-MM-DD'), // 日期
                    tempAssets, // 總存款
                ]);
            }
        },
        async CALC_STOCK_WEEKLY({ state }, stockId) {
            console.log('CALC_STOCK_WEEKLY');
            // 塞入股價週線資料
            // const firstStockDate = moment(_.first(currStock[index].data.daily)[0]); // [] 不可能 undefined。因為是二維陣列，還要取第二維[0]代表date
            // const lastStockDate = moment(_.last(currStock[index].data.daily)[0]);

            // console.log(firstStockDate.format('YYYY-MM-DD HH:mm:ss'));
            // console.log(lastStockDate.format('YYYY-MM-DD HH:mm:ss'));

            // for moment 參考 https://stackoverflow.com/questions/52936352/javascript-for-loop-to-add-days-in-a-month-object-moment-js
            // lastStockDate.subtract(7, 'days') 因為我第一個要拿到就是減7天的值
            // 這裡要用 -6 才能最後面的資料也都算進去，不過可能實際因沒有資料而加上也沒到完整一週都有資料，
            const foundStock = state.stockList.find((v) => v.id === stockId);
            let resData = [];

            let i = foundStock.data.daily.length - 1;
            let j = i;
            const lastStockDate = moment(_.last(foundStock.data.daily)[0]);
            let firstDayOfWeek = lastStockDate.startOf('isoWeek');
            while (i >= 0) {
                // console.log(i);
                // console.log(moment(currStock[index].data.daily[i][0]).format('YYYY-MM-DD'));
                // console.log(firstDayOfWeek.format('YYYY-MM-DD'));
                // 不能用 isSame 因為有可能那週沒資料，或那週星期一也放假，所以要用 isBefore
                if (moment(foundStock.data.daily[i][0]).isBefore(firstDayOfWeek) || i === 0) {
                    // console.log('isBefore');
                    // 0最後一個也要跑進來

                    // startIndex 值要小於等於 endIndex，for 是由大到小, i<j
                    const startIndex = i + 1; // 因為是找到前一個才算後面1個
                    const endIndex = j; // 因為外層array 是從日期最現在，往以前日期去掃。endIndex應該是最現在日期. i比n大
                    const range2dArray = _.slice(foundStock.data.daily, startIndex, endIndex + 1);
                    const rangeHighArray = _.map(range2dArray, (v) => v[2]);
                    const rangeLowArray = _.map(range2dArray, (v) => v[3]);
                    // const rangeVolumeArray = _.map(range2dArray, (v) => v[5]);

                    const date = foundStock.data.daily[endIndex][0];
                    const open = foundStock.data.daily[startIndex][1]; // 上一個n的意思， 也許有 bug n+1應該要<這迴圈數量，若只有1個就有問題
                    const close = foundStock.data.daily[endIndex][4]; // 之前的i，還沒i=n是下一個
                    const low = _.min(rangeLowArray);
                    const high = _.max(rangeHighArray);
                    // const volume = _.sum(rangeVolumeArray);

                    resData.push([date, open, high, low, close]);
                    j = startIndex - 1;

                    // 要採用下個i值的該週第一天，不能用firstDayOfWeek-7天，因為有可能該週都沒值
                    firstDayOfWeek = moment(foundStock.data.daily[i][0]).startOf('isoWeek');
                }
                i -= 1;
            }

            // console.log(resData);
            // 必需要反轉，最小的值在最前面，最大的值在最後面，否則highcharts會只畫1個點
            // currStock[index].data.weekly = _.reverse(resData);
            // Vue.set(foundStock.data, 'weekly', _.reverse(resData));
            // foundStock.data.weekly = _.reverse(resData);
            return _.reverse(resData);
        },

        async CALC_STOCK_WEEKLY_KD({ state }, stockId) {
            console.log('CALC_STOCK_WEEKLY_KD');
            const foundStock = state.tempStockList.find((v) => v.id === stockId);
            let weeklyKdData = [];
            let rsv = 0;
            let preK = 0;
            let preD = 0;
            let todayK = 0;
            let todayD = 0;

            // 從最早日期開始算，因為公式有用昨天
            for (let k = 0; k <= foundStock.data.weekly.length - 1; k += 1) {
                const startIndex = k - 8 < 0 ? 0 : k - 8; // 如果減完小於0，就=0。正常寫法是-9+1，但我寫-8就好了
                const endIndex = k;
                const range2dArray = _.slice(foundStock.data.weekly, startIndex, endIndex + 1);
                const rangeHighArray = _.map(range2dArray, (v) => v[2]);
                const rangeLowArray = _.map(range2dArray, (v) => v[3]);
                const low = _.min(rangeLowArray);
                const high = _.max(rangeHighArray);

                rsv = ((foundStock.data.weekly[k][4] - low) / (high - low)) * 100; // (今日收盤價-最近9天最低價)/(最近9天最高價-最近9天最低價)*100
                todayK = (2 / 3) * preK + (1 / 3) * rsv; // k=2/3 * 昨日的k值 + 1/3*今日的RSV
                todayD = (2 / 3) * preD + (1 / 3) * todayK; // d=2/3 * 昨日的d值 + 1/3*今日的k值
                preK = todayK;
                preD = todayD;
                const date = foundStock.data.weekly[endIndex][0];

                weeklyKdData.push([date, todayK, todayD]);
            }
            return weeklyKdData;
            // commit('SAVE_STOCK_WEEKLY_KD', { stockId: stockId, data: weeklyKdData });
        },
        async CALC_STOCK_WEEKLY_RSI({ state }, stockId) {
            const period = 5;
            console.log('CALC_STOCK_WEEKLY_RSI');
            const foundStock = state.tempStockList.find((v) => v.id === stockId);
            let weeklyRsiData = [];
            let gains = [];
            let losses = [];
            let avgGain = 0;
            let avgLoss = 0;

            for (let i = 0; i < foundStock.data.weekly.length; i++) {
                let closePrice = foundStock.data.weekly[i][4];
                if (i === 0) {
                    gains.push(0);
                    losses.push(0);
                } else {
                    let diff = closePrice - foundStock.data.weekly[i - 1][4];
                    gains.push(Math.max(diff, 0));
                    losses.push(Math.max(-diff, 0));
                }

                if (i >= period) {
                    avgGain = (avgGain * (period - 1) + gains[i]) / period;
                    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
                } else {
                    avgGain = (avgGain * (i + 1) + gains[i]) / (i + 2);
                    avgLoss = (avgLoss * (i + 1) + losses[i]) / (i + 2);
                }

                if (i >= period - 1) {
                    let rs = avgGain / avgLoss;
                    weeklyRsiData.push([foundStock.data.weekly[i][0], 100 - 100 / (1 + rs)]);
                }
            }

            return weeklyRsiData;
        },

        async CALC_STOCK_WEEKLY_MA({ state }, stockId) {
            console.log('CALC_STOCK_WEEKLY_MA');

            // const index = _.findIndex(state.stockList, ['id', stockId]);
            const foundStock = state.tempStockList.find((v) => v.id === stockId);

            let weeklyMaData = { ma5: [], ma10: [], ma20: [] };
            [5, 10, 20].forEach((limit) => {
                let maDataX = [];
                for (let k = 0; k <= foundStock.data.weekly.length - 1; k += 1) {
                    const startIndex = k - limit - 1 < 0 ? 0 : k - limit - 1; // 如果減完小於0，就=0。正常寫法是-3+1，但我寫-2就好了
                    const endIndex = k;
                    const range2dArray = _.slice(foundStock.data.weekly, startIndex, endIndex + 1);
                    const rangeCloseArray = _.map(range2dArray, (v) => v[4]);
                    const average = _.mean(rangeCloseArray);

                    const date = foundStock.data.weekly[endIndex][0];

                    maDataX.push([date, average]);
                }
                weeklyMaData['ma' + limit] = maDataX;
            });
            return weeklyMaData;
        },
        async CALC_STOCK_WEEKLY_COST_LINE({ state }, stockId) {
            // 平均成本線
            console.log('CALC_STOCK_WEEKLY_COST_LINE');
            const foundStock = state.tempStockList.find((v) => v.id === stockId);
            const foundStockWithCost = state.stockList.find((v) => v.id === stockId);

            let weeklyCostLineData = [];
            if (
                _.has(foundStockWithCost, 'cost') &&
                _.has(foundStockWithCost, 'data.daily') &&
                foundStockWithCost.data.daily.length > 0 &&
                _.has(foundStockWithCost, 'cost.settings')
            ) {
                console.log('CALC_STOCK_WEEKLY_COST_LINE ING');
                let i = 0;
                let averageCost = 0;
                let sumCost = 0;
                let sumNumber = 0;
                for (let k = 0; k <= foundStock.data.weekly.length - 1; k += 1) {
                    const startIndex = k - 1 < 0 ? 0 : k - 1; // 如果減完小於0，就=0。正常寫法是-3+1，但我寫-2就好了
                    const endIndex = k;
                    const startDate = moment(foundStock.data.weekly[startIndex][0]).add(1, 'days');
                    const endDate = moment(foundStock.data.weekly[endIndex][0]);

                    // 目前加總總金額 除 目前總股數 就是 目前成本
                    while (i <= foundStockWithCost.cost.settings.length - 1) {
                        const costDate = moment(foundStockWithCost.cost.settings[i].buy_date);
                        // console.log('=============');
                        // console.log(i);
                        // console.log(costDate.format('YYYY-MM-DD'));
                        // console.log(moment(startDate).format('YYYY-MM-DD'));
                        // console.log(moment(endDate).format('YYYY-MM-DD'));
                        if (costDate.isAfter(endDate)) break;
                        else if (costDate.isSameOrAfter(startDate) && costDate.isSameOrBefore(endDate)) {
                            // found
                            sumNumber += foundStockWithCost.cost.settings[i].number;
                            sumCost += foundStockWithCost.cost.settings[i].number * foundStockWithCost.cost.settings[i].cost;
                            i += 1;
                        } else i += 1;
                    }

                    averageCost = sumNumber > 0 ? Math.round((sumCost * 100) / sumNumber) / 100 : 0;
                    if (averageCost > 0) weeklyCostLineData.push([endDate.format('YYYY-MM-DD'), averageCost]);
                }
            }

            return weeklyCostLineData;
        },
        // 訊號技術線報酬
        async CALC_STOCK_INDICATORS_RESULT({ state }, stockId) {
            const foundStock = state.stockList.find((v) => v.id === stockId);
            const foundTempStock = state.tempStockList.find((v) => v.id === stockId);

            // 黃金交叉、死亡交叉
            let policyResult = null;
            if (
                (_.has(foundStock, 'policy.settings.buy') || _.has(foundStock, 'policy.settings.sell')) &&
                (foundStock.calc_policy_date !== foundStock.last_price_date || !_.has(foundStock, 'policy.result')) // 日期判斷是有可能上回有淨值(此回沒有)，上回卻沒有計算完policy
                //曾經發現有policy.settings，但都沒有算 policy.result
            ) {
                policyResult = [];
                // 訊號開關
                console.log('SAVE_STOCK_POLICY_RESULT foundStock');
                let foundKdGold = false;
                let foundKdTurnUp = false;
                let foundKdDead = false;
                let foundKdTurnDown = false;
                let foundRsiOverSold = false;
                let foundRsiTurnUp = false;
                let foundRsiOverBought = false;
                let foundRsiTurnDown = false;
                let foundMaBuy = false;
                let foundMaSell = false;
                let foundAnnualFixedDateBuy = false;
                let foundAnnualFixedDateSell = false;

                if (_.has(foundStock, 'policy.settings.buy')) {
                    foundKdGold = _.find(foundStock.policy.settings.buy, ['method', 'kd_gold']);
                    foundKdTurnUp = _.find(foundStock.policy.settings.buy, ['method', 'kd_turn_up']);
                    foundRsiOverSold = _.find(foundStock.policy.settings.buy, ['method', 'rsi_over_sold']);
                    foundRsiTurnUp = _.find(foundStock.policy.settings.buy, ['method', 'rsi_turn_up']);
                    foundMaBuy = _.find(foundStock.policy.settings.buy, ['method', 'ma_buy']);
                    foundAnnualFixedDateBuy = _.find(foundStock.policy.settings.buy, ['method', 'annual_fixed_date_buy']);
                }
                if (_.has(foundStock, 'policy.settings.sell')) {
                    foundKdDead = _.find(foundStock.policy.settings.sell, ['method', 'kd_dead']);
                    foundKdTurnDown = _.find(foundStock.policy.settings.sell, ['method', 'kd_turn_down']);
                    foundRsiOverBought = _.find(foundStock.policy.settings.sell, ['method', 'rsi_over_bought']);
                    foundRsiTurnDown = _.find(foundStock.policy.settings.sell, ['method', 'rsi_turn_down']);
                    foundMaSell = _.find(foundStock.policy.settings.sell, ['method', 'ma_sell']);
                    foundAnnualFixedDateSell = _.find(foundStock.policy.settings.sell, ['method', 'annual_fixed_date_sell']);
                }

                // KD 相關訊號
                let kdGoldReady = false;
                let kdDeadReady = false;
                let preK = 0;
                let kdTurnUpReady = false;
                let kdTurnDownReady = false;

                let preDate = null;
                if (foundTempStock.data.weekly_kd.length > 0)
                    preDate = moment(foundTempStock.data.weekly_kd[0][0], 'YYYY-MM-DD').subtract(6, 'days');
                let annualFixedDateBuyCurrDate = null;
                if (foundAnnualFixedDateBuy && foundTempStock.data.weekly_kd.length > 0) {
                    // weekly 是記錄該週最後一天，也有可能星期三，但記著是最後一天
                    // 固定日期買，正顯要用daily來算，但我想畫在 weekly kd 上，所以在那週範圍的就買了
                    annualFixedDateBuyCurrDate = moment(
                        foundTempStock.data.weekly_kd[0][0].substring(0, 4) + '/' + foundAnnualFixedDateBuy.limit,
                        'YYYY/MM/DD'
                    );
                    if (moment(foundTempStock.data.weekly_kd[0][0], 'YYYY-MM-DD').isAfter(annualFixedDateBuyCurrDate))
                        annualFixedDateBuyCurrDate.add(1, 'years');
                }
                let annualFixedDateSellCurrDate = null;
                if (foundAnnualFixedDateSell && foundTempStock.data.weekly_kd.length > 0) {
                    annualFixedDateSellCurrDate = moment(
                        foundTempStock.data.weekly_kd[0][0].substring(0, 4) + '/' + foundAnnualFixedDateSell.limit,
                        'YYYY/MM/DD'
                    );
                    if (moment(foundTempStock.data.weekly_kd[0][0], 'YYYY-MM-DD').isAfter(annualFixedDateSellCurrDate))
                        annualFixedDateSellCurrDate.add(1, 'years');
                }
                foundTempStock.data.weekly_kd.forEach((item, dataIndex) => {
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
                            const dataWeeklyPrice = foundTempStock.data.weekly[dataIndex][4];
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
                            const dataWeeklyPrice = foundTempStock.data.weekly[dataIndex][4];
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
                            const dataWeeklyPrice = foundTempStock.data.weekly[dataIndex][4];
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
                            const dataWeeklyPrice = foundTempStock.data.weekly[dataIndex][4];
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

                    // 固定日期 買進訊號
                    // length =3 , 0, 1, 2，但到2時就不行
                    const nextDate =
                        dataIndex + 1 < foundTempStock.data.weekly_kd.length
                            ? foundTempStock.data.weekly_kd[dataIndex + 1][0]
                            : moment(foundTempStock.data.weekly_kd[dataIndex][0], 'YYYY-MM-DD')
                                  .add(7, 'days')
                                  .format('YYYY-MM-DD');
                    // console.log('==================');
                    // console.log(foundTempStock.data.weekly_kd);
                    // console.log(dataIndex);
                    // console.log(item[0]);
                    // console.log(nextDate);
                    if (foundAnnualFixedDateBuy) {
                        if (
                            // 在該週內的日期就買了
                            annualFixedDateBuyCurrDate.isAfter(preDate) &&
                            annualFixedDateBuyCurrDate.isSameOrBefore(moment(item[0], 'YYYY-MM-DD')) &&
                            moment(nextDate, 'YYYY-MM-DD').isAfter(annualFixedDateBuyCurrDate)
                        ) {
                            const index = _.findIndex(policyResult, ['date', item[0]]);
                            const dataWeeklyPrice = foundTempStock.data.weekly[dataIndex][4];
                            if (index === -1)
                                policyResult.push({
                                    date: item[0],
                                    is_buy: true,
                                    price: dataWeeklyPrice,
                                    reason: ['annual_fixed_date_buy'],
                                });
                            else {
                                policyResult[index].is_buy = true;
                                policyResult[index].reason.push('annual_fixed_date_buy');
                            }
                            annualFixedDateBuyCurrDate.add(1, 'years');
                        }
                    }
                    if (foundAnnualFixedDateSell) {
                        if (
                            // 在該週內的日期就買了
                            annualFixedDateSellCurrDate.isAfter(preDate) &&
                            annualFixedDateSellCurrDate.isSameOrBefore(moment(item[0], 'YYYY-MM-DD')) &&
                            moment(nextDate, 'YYYY-MM-DD').isAfter(annualFixedDateSellCurrDate)
                        ) {
                            const index = _.findIndex(policyResult, ['date', item[0]]);
                            const dataWeeklyPrice = foundTempStock.data.weekly[dataIndex][4];
                            if (index === -1)
                                policyResult.push({
                                    date: item[0],
                                    is_sell: true,
                                    price: dataWeeklyPrice,
                                    reason: ['annual_fixed_date_sell'],
                                });
                            else {
                                policyResult[index].is_sell = true;
                                policyResult[index].reason.push('annual_fixed_date_sell');
                            }
                            annualFixedDateSellCurrDate.add(1, 'years');
                        }
                    }

                    preDate = moment(item[0], 'YYYY-MM-DD');
                });

                // RSI 相關訊號
                // let rsiOverSoldReady = false;
                // let rsiOverBoughtReady = false;
                let preRsi = 0;
                let rsiTurnUpReady = false;
                let rsiTurnDownReady = false;
                foundTempStock.data.weekly_rsi.forEach((item, dataIndex) => {
                    const rsi = item[1];
                    // 週 RSI 超賣 買進訊號
                    if (foundRsiOverSold) {
                        if (rsi <= foundRsiOverSold.limit) {
                            // 寫這樣有錯，不是<=20，然後K>=D就是買進。正確要之前先有K<D
                            const index = _.findIndex(policyResult, ['date', item[0]]);
                            const dataWeeklyPrice = foundTempStock.data.weekly[dataIndex][4];
                            if (index === -1)
                                policyResult.push({
                                    date: item[0],
                                    is_buy: true,
                                    rsi,
                                    price: dataWeeklyPrice,
                                    reason: ['rsi_over_sold'],
                                });
                            else {
                                policyResult[index].is_buy = true;
                                policyResult[index].rsi = rsi;
                                policyResult[index].reason.push('rsi_over_sold');
                            }
                        }
                    }
                    // 週 RSI 往上轉折 買進訊號
                    if (foundRsiTurnUp) {
                        if (rsi < preRsi) {
                            rsiTurnUpReady = true;
                        }
                        if (preRsi <= foundRsiTurnUp.limit && rsi >= preRsi && rsiTurnUpReady) {
                            // 寫這樣有錯，不是<=20，然後K>=D就是買進。正確要之前先有K<D
                            const index = _.findIndex(policyResult, ['date', item[0]]);
                            const dataWeeklyPrice = foundTempStock.data.weekly[dataIndex][4];
                            if (index === -1)
                                policyResult.push({
                                    date: item[0],
                                    is_buy: true,
                                    rsi,
                                    price: dataWeeklyPrice,
                                    reason: ['rsi_turn_up'],
                                });
                            else {
                                policyResult[index].is_buy = true;
                                policyResult[index].rsi = rsi;
                                policyResult[index].reason.push('rsi_turn_up');
                            }
                            rsiTurnUpReady = false;
                        }
                    }

                    // 週 RSI 超買 賣出訊號
                    if (foundRsiOverBought) {
                        if (rsi >= foundRsiOverBought.limit) {
                            // 寫這樣有錯，不是<=20，然後K>=D就是買進。正確要之前先有K<D
                            const index = _.findIndex(policyResult, ['date', item[0]]);
                            const dataWeeklyPrice = foundTempStock.data.weekly[dataIndex][4];
                            if (index === -1)
                                policyResult.push({
                                    date: item[0],
                                    is_sell: true,
                                    rsi,
                                    price: dataWeeklyPrice,
                                    reason: ['rsi_over_bought'],
                                });
                            else {
                                policyResult[index].is_sell = true;
                                policyResult[index].rsi = rsi;
                                policyResult[index].reason.push('rsi_over_bought');
                            }
                        }
                    }
                    // 週 RSI 往下轉折 賣出訊號
                    if (foundRsiTurnDown) {
                        if (rsi > preRsi) {
                            rsiTurnDownReady = true;
                        }
                        if (preRsi >= foundRsiTurnDown.limit && rsi <= preRsi && rsiTurnDownReady) {
                            // 寫這樣有錯，不是<=20，然後K>=D就是買進。正確要之前先有K<D
                            const index = _.findIndex(policyResult, ['date', item[0]]);
                            const dataWeeklyPrice = foundTempStock.data.weekly[dataIndex][4];
                            if (index === -1)
                                policyResult.push({
                                    date: item[0],
                                    is_sell: true,
                                    rsi,
                                    price: dataWeeklyPrice,
                                    reason: ['rsi_turn_down'],
                                });
                            else {
                                policyResult[index].is_sell = true;
                                policyResult[index].rsi = rsi;
                                policyResult[index].reason.push('rsi_turn_down');
                            }
                            rsiTurnDownReady = false;
                        }
                    }
                    preRsi = rsi;
                });

                // 因為 KD完才RSI，日期會沒有按升序排，所以在這重排
                policyResult = _.sortBy(policyResult, 'date');

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
            }
            return policyResult;
        },
    },
    mutations: {
        SAVE_GLOBAL_SETTINGS(state, data) {
            console.log('SAVE_GLOBAL_SETTINGS');
            // console.log(data);
            state.usdExchange = data.usd_exchange;
        },
        // 將該股票的淨值儲存到 state 上
        SAVE_STOCK_LIST(state, data) {
            console.log('SAVE_STOCK_LIST');
            // console.log(data);
            console.log(typeof data);
            state.stockList = data;
            // console.log(state.currStockDayData);
        },
        SAVE_STOCK_DATA_AND_POLICY(state, dataList) {
            dataList.forEach((obj) => {
                const foundStock = state.stockList.find((v) => v.id === obj.id);
                if (obj.data) foundStock.data = obj.data; // if是判斷有可能 undefined
                // if (obj.policy) foundStock.policy = obj.policy; // if是判斷有可能 undefined
            });
            // console.log(state.currStockDayData);
        },
        SAVE_STOCK_LIST_WITH_DIVIDEND_LAST_DATE(state, { stockId, lastDate }) {
            console.log('SAVE_STOCK_LIST_WITH_DIVIDEND_LAST_DATE');
            const foundStock = state.stockList.find((v) => v.id === stockId);
            console.log(lastDate);
            if (lastDate) {
                foundStock.crawler_dividend_last_date = lastDate;
                localStorage.setItem('stockList', JSON.stringify(state.stockList));
            } else if (_.has(foundStock, 'crawler_dividend_last_date')) {
                // 有存在才去刪，避免初始還要去呼叫 setItem
                delete foundStock.crawler_dividend_last_date;
                localStorage.setItem('stockList', JSON.stringify(state.stockList));
            }
            // console.log(foundStock);
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
        SAVE_STOCK_DIVIDEND_LAST_DATE(state) {
            console.log('SAVE_STOCK_DIVIDEND_LAST_DATE');
            state.stockList.forEach((o) => {
                o.crawler_dividend_last_date = '2022-10-01';
            });

            localStorage.setItem('stockList', JSON.stringify(state.stockList));
        },
        ADD_A_STOCK_KEY(state, { stockId, isDvidend }) {
            console.log('ADD_A_STOCK_KEY');
            const foundStock = state.stockList.find((v) => v.id === stockId);
            foundStock.is_dividend = isDvidend;
            // state.stockList.push(data);
            localStorage.setItem('stockList', JSON.stringify(state.stockList));
        },
        MOVE_A_STOCK(state, { stockId, direction }) {
            // data 是 object {name: XXX, id: XXX}
            console.log('MOVE_A_STOCK');
            // const index = _.findIndex(state.stockList, ['id', stockId]);
            // console.log(index);

            // 先設定好原本的order，有可能原本都沒有
            const stockSortedList = _.orderBy(state.stockList, ['order'], ['asc']);
            stockSortedList.forEach((obj, index) => {
                const foundStock = state.stockList.find((v) => v.id === obj.id);
                foundStock.order = index + 1; // 順序從1開始
            });
            const foundStockMoveSrc = state.stockList.find((v) => v.id === stockId);

            const srcStockOrder = foundStockMoveSrc.order;
            let dstStockOrder = null;
            if (direction === 'bottom') dstStockOrder = srcStockOrder + 1;
            if (direction === 'top') dstStockOrder = srcStockOrder - 1;

            const foundStockMoveDst = state.stockList.find((v) => v.order === dstStockOrder);
            if (direction === 'bottom') {
                foundStockMoveSrc.order = foundStockMoveSrc.order + 1;
                foundStockMoveDst.order = foundStockMoveDst.order - 1;
            } else if (direction === 'top') {
                foundStockMoveSrc.order = foundStockMoveSrc.order - 1;
                foundStockMoveDst.order = foundStockMoveDst.order + 1;
            }

            localStorage.setItem('stockList', JSON.stringify(state.stockList));
        },
        DEL_A_STOCK(state, data) {
            // data 是 object {name: XXX, id: XXX}
            console.log('DEL_A_STOCK');
            // 移除某個自選股
            _.remove(state.stockList, (obj) => obj.id === data);
            localStorage.setItem('stockList', JSON.stringify(state.stockList));
        },
        DEL_10_YEARS_OLD(state, data) {
            // data 是 object {name: XXX, id: XXX}
            console.log('DEL_10_YEARS_OLD');
            _.forEach(state.stockList, (item) => {
                _.remove(item.data.daily, (daily) => {
                    const date = moment(daily[0]);
                    return date.isBefore(moment().subtract(10, 'years'), 'day');
                });
            });

            localStorage.setItem('stockList', JSON.stringify(state.stockList));
        },

        SAVE_STOCK_STAR(state, { stockId, star }) {
            // object of array 去 find 並 update
            const found = state.stockList.find((v) => v.id === stockId);
            found.star = 0;
            found.star = star; // 複製數據複本

            // save to localstorage
            localStorage.setItem('stockList', JSON.stringify(state.stockList));
        },
        SAVE_STOCK_BACKGROUND_COLOR(state, stockId) {
            // object of array 去 find 並 update
            const found = state.stockList.find((v) => v.id === stockId);
            if (found.background) {
                if (found.background === true) found.background = false;
                else found.background = true;
            } else {
                found.background = true;
            }
            // save to localstorage
            localStorage.setItem('stockList', JSON.stringify(state.stockList));
        },
        async SAVE_STOCK_COST(state, { stockId, costList, totalOfShares, averageCost, sumCost }) {
            console.log('SAVE_STOCK_COST');
            // object of array 去 find 並 update
            const foundStock = state.stockList.find((v) => v.id === stockId);

            if (costList.length === 0) {
                console.log('costList.length === 0');
                if (_.has(foundStock, 'cost.settings')) delete foundStock.cost;
            } else {
                console.log('costList.length> 0');
                // console.log(costList);
                foundStock.cost = {};
                foundStock.cost.settings = [];
                foundStock.cost.settings = costList; // 複製數據複本
                foundStock.cost.total = totalOfShares || 0; // null 則指定為0
                foundStock.cost.avg = averageCost || 0; // null 則指定為0
                foundStock.cost.sum = sumCost || 0; // null 則指定為0

                // save to localstorage
            }

            let tempStockListStockData = {};
            const weekly_data = await this.dispatch('CALC_STOCK_WEEKLY', stockId);
            tempStockListStockData.weekly = weekly_data;
            state.tempStockList.push({ id: stockId, data: tempStockListStockData });

            const weekly_cost_line_data = await this.dispatch('CALC_STOCK_WEEKLY_COST_LINE', stockId);

            foundStock.data.cost = _.slice(weekly_cost_line_data, -26);

            // save to localstorage
            localStorage.setItem('stockList', JSON.stringify(state.stockList));
            // 因為有可能是刪除的
            if (_.has(foundStock, 'cost.settings')) this.commit('SAVE_STOCK_COST_RETURN', stockId);
            this.dispatch('GET_DIVIDEND');

            // 算完就清除，如此不占用記憶體
            _.remove(state.tempStockList, (obj) => obj.id === stockId);
        },
        SAVE_STOCK_COST_RETURN(state, stockId) {
            console.log('SAVE_STOCK_COST_RETURN');
            // object of array 去 find 並 update
            const foundStock = state.stockList.find((v) => v.id === stockId);

            if (_.has(foundStock, 'cost') && _.has(foundStock, 'data.daily') && foundStock.data.daily.length > 0) {
                const close = foundStock.data.daily[foundStock.data.daily.length - 1][4];
                console.log(close);
                console.log(foundStock.cost.sum);

                // 若有 buy_exchange，則要取到最新匯率
                const exchange = foundStock.buy_exchange ? state.usdExchange : 1;
                foundStock.cost.return = 0;
                foundStock.cost.rate_of_return = 0;
                foundStock.cost.return = Math.round(close * foundStock.cost.total * exchange - foundStock.cost.sum);
                foundStock.cost.market_value = foundStock.cost.sum + foundStock.cost.return;
                foundStock.cost.rate_of_return =
                    foundStock.cost.sum === 0
                        ? null
                        : ((close * foundStock.cost.total * exchange - foundStock.cost.sum) * 100) / foundStock.cost.sum; // 只發股數，有可能股價輸入0，這時設為 null，顯示則為 N/A 無法計算，因為成本為0，報酬率為無限吧

                // save to localstorage
                localStorage.setItem('stockList', JSON.stringify(state.stockList));
            }
        },
        SAVE_STOCK_POLICY(state, { stockId, policyList }) {
            // object of array 去 find 並 update
            const foundStock = state.stockList.find((v) => v.id === stockId);

            // console.log(policyList);
            // console.log(policyList.buy.length);
            // console.log(policyList.sell.length);
            if (
                (!_.has(policyList, 'buy') || (_.has(policyList, 'buy') && policyList.buy.length === 0)) &&
                (!_.has(policyList, 'sell') || (_.has(policyList, 'sell') && policyList.sell.length === 0))
            ) {
                if (_.has(foundStock, 'policy')) delete foundStock.policy;
                delete foundStock.calc_policy_date;
                delete foundStock.data.ma_buy;
                delete foundStock.data.ma_sell;
            } else {
                foundStock.policy = { settings: { buy: [], sell: [] } };
                foundStock.policy.settings = policyList; // 複製數據複本

                // save to localstorage
            }
            // alert(JSON.stringify(state.stockList));
            try {
                localStorage.setItem('stockList', JSON.stringify(state.stockList)); // 要放在 then後才能保證完成，放在最後面還可能
            } catch (err) {
                alert(err);
            }
            this.commit('SAVE_STOCK_POLICY_RESULT', stockId);
        },
        async SAVE_STOCK_PRICE(state, { stockId, data }) {
            console.log('SAVE_STOCK_PRICE');
            console.log(stockId);
            const foundStock = state.stockList.find((v) => v.id === stockId);
            let currStockLastDate = null;
            if (data.data.length > 0) {
                // 在此其實不用"避免重覆"的資料，因我的我 start_date 已是控制好我的DB沒有的日期，若強制抓回只是 data.data=[] 沒有資料而已
                // 預設值
                // const index = _.findIndex(state.stockList, ['id', stockId]);
                // console.log(data.data);
                // console.log(foundStock.data.daily);
                // console.log(foundStock.data.daily[foundStock.data.daily.length - 1][0]);
                // return;
                foundStock.data = foundStock.data || {};
                foundStock.data.daily = foundStock.data.daily || []; // 有可能是 null 就變成 []
                foundStock.data.weekly = foundStock.data.weekly || []; // 有可能是 null 就變成 []
                foundStock.data.weekly_kd = foundStock.data.weekly_kd || []; // 有可能是 null 就變成 []
                foundStock.data.ma_buy = foundStock.data.ma_buy || []; // 有可能是 null 就變成 [] 第一條MA線
                foundStock.data.ma_sell = foundStock.data.ma_sell || []; // 有可能是 null 就變成 [] 第二條MA線
                foundStock.data.cost = foundStock.data.cost || []; // 有可能是 null 就變成 [] 第二條MA線
                foundStock.last_price = foundStock.last_price || null;
                foundStock.last_price_date = foundStock.last_price_date || null;
                foundStock.last_price_spread = foundStock.last_price_spread || null;

                // 塞入股價日線資料
                // console.log(res.data.data);
                const isFund = foundStock.type === 'fund'; // 判斷是否為基金
                const values = [];
                // 股票
                if (!isFund) {
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
                } else {
                    //基金
                    data.datas.forEach((date, index) => {
                        const closePrice = data.closePrices[index];
                        values.push([
                            date,
                            closePrice,
                            closePrice,
                            closePrice,
                            closePrice,
                            // element.Trading_Volume,
                        ]);
                    });
                }
                // console.log(foundStock.data.daily);
                // 怕一次重啟2個API呼叫(如2個分頁都在執行)，values 的 array 要去掉現有<=最後日期

                if (foundStock.data.daily.length > 0) {
                    //一開始可能都無資料
                    currStockLastDate = moment(foundStock.data.daily[foundStock.data.daily.length - 1][0]);
                    _.remove(values, function (array) {
                        return moment(array[0]).isSameOrBefore(currStockLastDate);
                    });
                }
                foundStock.data.daily.push(...values);
                // console.log(foundStock.data.daily);
                // console.log(values);

                // theArray[index].data.daily.push(...res.data.data); // 塞入股價資料
            }
            // console.log(foundStock.data);
            if (
                foundStock.data &&
                foundStock.data.daily.length > 0 &&
                (data.data.length > 0 || // 股票正常進來
                    !_.has(foundStock, 'data.weekly') || // 基金, 第一次
                    foundStock.data.weekly.length === 0 || // 第一次股票抓資料後，但沒更新 weekly時
                    (foundStock.data.weekly.length > 0 && // 基金，第二次以後
                        foundStock.data.daily[foundStock.data.daily.length - 1][0] !==
                            foundStock.data.weekly[foundStock.data.weekly.length - 1][0]))
            ) {
                console.log('weekly');
                // 塞入漲跌幅、最後股價
                const v1 = foundStock.data.daily[foundStock.data.daily.length - 1][4];
                const v2 = foundStock.data.daily[foundStock.data.daily.length - 2][4];
                foundStock.last_price = v1;

                const dayOfWeek = ['日', '一', '二', '三', '四', '五', '六'];
                currStockLastDate = moment(foundStock.data.daily[foundStock.data.daily.length - 1][0]);
                foundStock.last_price_date = `${currStockLastDate.format('YYYY-MM-DD')}`;

                foundStock.last_price_spread = parseFloat((((v1 - v2) * 100) / v2).toFixed(2));

                // ===================塞入股價週線KD資料===================
                let tempStockListStockData = {};
                const weekly_data = await this.dispatch('CALC_STOCK_WEEKLY', stockId);
                tempStockListStockData.weekly = weekly_data;
                state.tempStockList.push({ id: stockId, data: tempStockListStockData });

                const [weekly_kd_data, weekly_rsi_data, weekly_ma_data, weekly_cost_line_data] = await Promise.all([
                    this.dispatch('CALC_STOCK_WEEKLY_KD', stockId),
                    this.dispatch('CALC_STOCK_WEEKLY_RSI', stockId),
                    this.dispatch('CALC_STOCK_WEEKLY_MA', stockId),
                    this.dispatch('CALC_STOCK_WEEKLY_COST_LINE', stockId),
                ]);

                tempStockListStockData = {};
                tempStockListStockData.weekly_kd = weekly_kd_data;
                tempStockListStockData.weekly_rsi = weekly_rsi_data;
                tempStockListStockData.ma5 = weekly_ma_data.ma5;
                tempStockListStockData.ma10 = weekly_ma_data.ma10;
                tempStockListStockData.ma20 = weekly_ma_data.ma20;
                tempStockListStockData.cost = weekly_cost_line_data;
                const targetStock = _.find(state.tempStockList, { id: stockId });
                if (targetStock) {
                    _.assign(targetStock.data, tempStockListStockData);
                }

                foundStock.data.weekly = _.slice(weekly_data, -26);
                foundStock.data.weekly_kd = _.slice(weekly_kd_data, -26);
                foundStock.data.weekly_rsi = _.slice(weekly_rsi_data, -26);
                foundStock.data.ma5 = _.takeRight(weekly_ma_data.ma5, 26);
                foundStock.data.ma10 = _.takeRight(weekly_ma_data.ma10, 26);
                foundStock.data.ma20 = _.takeRight(weekly_ma_data.ma20, 26);
                foundStock.data.cost = _.slice(weekly_cost_line_data, -26);

                // console.log(foundStock);

                // ===================塞入localstorage===================
                localStorage.setItem('stockList', JSON.stringify(state.stockList)); // 要放在 then後才能保證完成，放在最後面還可能

                if (_.has(foundStock, 'cost.settings')) this.commit('SAVE_STOCK_COST_RETURN', stockId); // 有新值就要更新成本的報酬率
                console.log('SAVE_STOCK_PRICE OK');
            }
            this.commit('SAVE_STOCK_POLICY_RESULT', stockId);
            // 有可能有policy設定，有/無淨值，上回沒算完就關了，需要於 SAVE_STOCK_POLICY_RESULT 內部去確認有無算完
        },
        async SAVE_STOCK_POLICY_RESULT(state, stockId) {
            console.log('SAVE_STOCK_POLICY_RESULT');

            // object of array 去 find 並 update

            // 像是從 UI改policy會沒有 tempStockList，需要重新計算
            let foundTempStock = state.tempStockList.find((v) => v.id === stockId);
            if (typeof foundTempStock === 'undefined') {
                let tempStockListStockData = {};
                const weekly_data = await this.dispatch('CALC_STOCK_WEEKLY', stockId);
                tempStockListStockData.weekly = weekly_data;
                state.tempStockList.push({ id: stockId, data: tempStockListStockData }); // 新增 state.tempStockList 資料

                const [weekly_kd_data, weekly_rsi_data, weekly_ma_data, weekly_cost_line_data] = await Promise.all([
                    this.dispatch('CALC_STOCK_WEEKLY_KD', stockId),
                    this.dispatch('CALC_STOCK_WEEKLY_RSI', stockId),
                    this.dispatch('CALC_STOCK_WEEKLY_MA', stockId),
                    this.dispatch('CALC_STOCK_WEEKLY_COST_LINE', stockId),
                ]);

                tempStockListStockData = {};
                tempStockListStockData.weekly_kd = weekly_kd_data;
                tempStockListStockData.weekly_rsi = weekly_rsi_data;
                _.merge(tempStockListStockData, weekly_ma_data);
                tempStockListStockData.cost = weekly_cost_line_data;
                const targetStock = _.find(state.tempStockList, { id: stockId });
                if (targetStock) {
                    _.assign(targetStock.data, tempStockListStockData); // 修改 state.tempStockList 資料
                }
            }

            const foundStock = state.stockList.find((v) => v.id === stockId);
            const policyResult = await this.dispatch('CALC_STOCK_INDICATORS_RESULT', stockId);

            if (policyResult !== null) {
                // policyResult 有可能因為是calc一樣所以沒計算，此時就不要去異動 result
                foundStock.policy.result = [];
                foundStock.policy.result.push(...policyResult);
                // foundStock.policy.result.push(...policyResult);
                // save to localstorage
                // localStorage.setItem('stockList', JSON.stringify(state.stockList));
                if (Array.isArray(policyResult) && policyResult.length > 0) {
                    this.commit('SAVE_STOCK_POLICY_RETURN_RESULT', stockId); // 計算policy且有關報酬率的結果
                }
            }
            // 算完就清除，如此不占用記憶體
            _.remove(state.tempStockList, (obj) => obj.id === stockId);

            // 刪除台達電
            // _.remove(state.stockList, (obj) => obj.id === '2886');
            // localStorage.setItem('stockList', JSON.stringify(state.stockList));

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
                    if (foundCostDown && numberOfBuy >= 1) {
                        // 因為當前的雖然要=2，但是還沒有寫入，所以1時，也代表第2次了
                        // 會在買超過1次才會進來判斷，因為這樣才有之前報酬率
                        // foundCostDown.limit * numberOfBuy 代表，第二次是 limit *1, 第三次是 limit *2，
                        const rateOfReturn = (obj.price * numberOfBuy - accPriceOfBuy) / accPriceOfBuy;

                        // x=10, y=1,2,3,4,5

                        // 我想要得到方程式，用js寫，輸出是z
                        // y=1, z=10     -> z=x
                        // y=2, z=10+round(10/2)
                        // y=3, z=10+round(10/2)+round(10/3)
                        // answer: 10 15 18 21
                        let limitRateOfReturn = 0;
                        for (let x = 1; x <= numberOfBuy; x++) {
                            limitRateOfReturn += Math.round(foundCostDown.limit / x);
                        }
                        // console.log('====================');
                        // console.log(numberOfBuy);
                        // console.log(limitRateOfReturn);
                        if (rateOfReturn * 100 > -limitRateOfReturn) {
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
                            foundStock.badge = '買'; // 必定買
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
                            foundStock.badge = '賣'; // 必定賣
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
                                  reason: obj.reason,
                              };
                          }
                      )
                    : [];

            foundStock.policy.stats = {};

            // localStorage.setItem('stockList', JSON.stringify(state.stockList));
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
            // localStorage.setItem('stockList', JSON.stringify(state.stockList));
            this.commit('SAVE_STOCK_POLICY_RETURN_FUTURE_BADGE', stockId);
        },
        SAVE_STOCK_POLICY_RETURN_FUTURE_BADGE(state, stockId) {
            console.log('SAVE_STOCK_POLICY_RETURN_FUTURE_BADGE');

            const foundStock = state.stockList.find((v) => v.id === stockId);
            const foundTempStock = state.tempStockList.find((v) => v.id === stockId);
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
                        const lastArray = foundTempStock.data.weekly_kd[foundTempStock.data.weekly_kd.length - 1];
                        const lastK = lastArray[1];
                        const lastD = lastArray[2];
                        if (lastK <= foundKdGold.limit && lastK < lastD) foundStock.badge = '準買'; // K要小於D，才是訊號前的準備
                    }
                    if (foundKdTurnUp) {
                        const lastK = foundTempStock.data.weekly_kd[foundTempStock.data.weekly_kd.length - 1][1];
                        const lastSecondK = foundTempStock.data.weekly_kd[foundTempStock.data.weekly_kd.length - 2][1];
                        if (lastK <= foundKdTurnUp.limit && lastK < lastSecondK) foundStock.badge = '準買';
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
                            const lastArray = foundTempStock.data.weekly_kd[foundTempStock.data.weekly_kd.length - 1];
                            const lastK = lastArray[1];
                            const lastD = lastArray[2];
                            if (lastK >= foundKdDead.limit && lastK > lastD) foundStock.badge = '準賣'; // K要大於D，才是訊號前的準備
                        }
                        if (foundKdTurnDown) {
                            const lastestK = foundTempStock.data.weekly_kd[foundTempStock.data.weekly_kd.length - 1][1];
                            const lastSecondK = foundTempStock.data.weekly_kd[foundTempStock.data.weekly_kd.length - 2][1];
                            if (lastestK >= foundKdTurnDown.limit && lastestK > lastSecondK) foundStock.badge = '準賣';
                        }
                    }
                }
            }
            foundStock.calc_policy_date = foundStock.last_price_date; // 設成一樣，之後判斷有無相同來知道是否當天真的計算完成
            localStorage.setItem('stockList', JSON.stringify(state.stockList));
            console.log('SAVE_STOCK_POLICY_RETURN_FUTURE_BADGE OK');
        },
    },
    getters: {
        // http://localhost:3000/#/?export=true
        // 增加 query 判斷，query有可能是 {} 或 {export:true}，若 export =true 時才要 filter，否則不要filter
        getStockSortedList: (state) => (query) => {
            let filteredList = state.stockList;
            if (query && query.export) {
                filteredList = _.filter(filteredList, (stock) => {
                    return stock.badge === '買' || stock.badge === '賣';
                });
            }
            return _.orderBy(filteredList, ['order'], ['asc']);
        },
        // object of array to filter
        getStock: (state) => (id) => {
            // console.log('getStock');
            // return _.find(state.stockList, ['id', id]);
            return state.stockList.find((stock) => stock.id === id);
        },
        getStockLastPrice: (state, getters) => (id) => {
            console.log('getStockLastPrice');
            const found = getters.getStock(id);
            return found.last_price;
        },
        getStockDataWeekly: (state, getters) => (id) => {
            console.log('getStockDataWeekly');
            // if (_.has(getters.getStock(id), 'data.weekly')) console.log(getters.getStock(id).data.weekly.length);
            // const found = _.find(state.stockList, ['id', id]);
            const found = getters.getStock(id);
            // const found = getters.getStock(id);
            return found.data && found.data.weekly
                ? _.slice(found.data.weekly, -26).map((value) => [
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
            console.log('getStockDataWeeklyKd');
            // if (_.has(getters.getStock(id), 'data.weekly')) console.log(getters.getStock(id).data.weekly.length);
            const found = getters.getStock(id);
            console.log(id);
            console.log(found.data);
            // console.log(found.data.weekly_kd);
            if (found.data && found.data.weekly_kd) console.log(found.data.weekly_kd);

            return found.data && found.data.weekly_kd
                ? _.slice(found.data.weekly_kd, -26).map((value) => [moment(value[0]).valueOf(), value[1], value[2]])
                : [];
        },
        getStockDataWeeklyRsi: (state, getters) => (id) => {
            console.log('getStockDataWeeklyKd');
            // if (_.has(getters.getStock(id), 'data.weekly')) console.log(getters.getStock(id).data.weekly.length);
            const found = getters.getStock(id);
            return found.data && found.data.weekly_rsi
                ? _.slice(found.data.weekly_rsi, -26).map((value) => [moment(value[0]).valueOf(), value[1]])
                : [];
        },
        getStockDataWeeklyMa5: (state, getters) => (id) => {
            console.log('getStockDataWeeklyMa5');
            // if (_.has(getters.getStock(id), 'data.weekly')) console.log(getters.getStock(id).data.weekly.length);
            const found = getters.getStock(id);
            return found.data && found.data.ma5
                ? _.slice(found.data.ma5, -26).map((value) => [moment(value[0]).valueOf(), value[1]])
                : [];
        },
        getStockDataWeeklyMa10: (state, getters) => (id) => {
            console.log('getStockDataWeeklyMa10');
            // if (_.has(getters.getStock(id), 'data.weekly')) console.log(getters.getStock(id).data.weekly.length);
            const found = getters.getStock(id);
            return found.data && found.data.ma10
                ? _.slice(found.data.ma10, -26).map((value) => [moment(value[0]).valueOf(), value[1]])
                : [];
        },
        getStockDataWeeklyMa20: (state, getters) => (id) => {
            console.log('getStockDataWeeklyMa20');
            // if (_.has(getters.getStock(id), 'data.weekly')) console.log(getters.getStock(id).data.weekly.length);
            const found = getters.getStock(id);
            return found.data && found.data.ma20
                ? _.slice(found.data.ma20, -26).map((value) => [moment(value[0]).valueOf(), value[1]])
                : [];
        },
        getStockDataWeeklyMaBuy: (state, getters) => (id) => {
            console.log('getStockDataWeeklyMaBuy');
            // if (_.has(getters.getStock(id), 'data.weekly')) console.log(getters.getStock(id).data.weekly.length);
            const found = getters.getStock(id);
            return found.data && found.data.ma_buy
                ? _.slice(found.data.ma_buy, -26).map((value) => [moment(value[0]).valueOf(), value[1]])
                : [];
        },
        getStockDataWeeklyMaSell: (state, getters) => (id) => {
            console.log('getStockDataWeeklyMaSell');
            // if (_.has(getters.getStock(id), 'data.weekly')) console.log(getters.getStock(id).data.weekly.length);
            const found = getters.getStock(id);
            return found.data && found.data.ma_sell
                ? _.slice(found.data.ma_sell, -26).map((value) => [moment(value[0]).valueOf(), value[1]])
                : [];
        },
        getStockDataWeeklyCost: (state, getters) => (id) => {
            console.log('getStockDataWeeklyCost');
            // if (_.has(getters.getStock(id), 'data.weekly')) console.log(getters.getStock(id).data.weekly.length);
            const found = getters.getStock(id);
            return found.data && found.data.cost
                ? _.slice(found.data.cost, -26).map((value) => [moment(value[0]).valueOf(), value[1]])
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
                        if (obj.cost.rate_of_return !== null && Math.abs(obj.cost.rate_of_return) <= 1000)
                            // <=1000 才會列入計算
                            return Math.abs(obj.cost.rate_of_return);
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
            // else if (maxEarnOrLoseRate <= 2000) progressMultiple = 0.05;
            // else if (maxEarnOrLoseRate <= 10000) progressMultiple = 0.01;
            // state.progressMultiple = progressMultiple;
            return progressMultiple;
        },
        getNoBuyList: (state) => () => {
            console.log('getNoBuyList');
            return _.orderBy(
                _.filter(state.stockList, function (obj) {
                    return !obj.cost;
                }),
                [
                    (obj) => {
                        if (obj.badge === '買') {
                            return 0;
                        } else if (obj.badge === '準買') {
                            return 2;
                        } else if (obj.badge === '賣') {
                            return 3;
                        } else if (obj.badge === '準賣') {
                            return 4;
                        } else {
                            return 5;
                        }
                    },
                    ,
                    'order',
                ],
                ['asc', 'asc']
            );
        },
    },
};

export default stock;
