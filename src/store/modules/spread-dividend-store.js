import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';
import GlobalSettings from '@/store/data/global-settings.json';

const defaultState = {
    dividendList: [],
    historySpreadList: [],
    historyDividendList: [],
};

const dividend = {
    // vue3 的 state 要用() 變是 func
    state() {
        return defaultState;
    },
    actions: {
        GET_DIVIDEND(context) {
            console.log('GET_DIVIDEND');
            // console.log(context);
            // console.log(context.rootState.price.stockList);

            const theYearBeforeLast = moment().subtract(2, 'years').format('YYYY'); // 前年的日期

            // 一天應該只要呼叫一次API就好了
            const today = moment().format('YYYY-MM-DD');

            // 用字串比日期就好了
            context.rootState.price.stockList.forEach((stcokObj) => {
                const localcrawlerDividendLastDate =
                    stcokObj.crawler_dividend_last_date || moment().subtract(1, 'days').format('YYYY-MM-DD');
                // 必須是有買的才要去抓未來配息
                if (_.has(stcokObj, 'cost.settings') && stcokObj.is_dividend && today !== localcrawlerDividendLastDate) {
                    // 為了只下一次API，但還要抓二年的資料回來算平均
                    axios
                        .get('https://api.finmindtrade.com/api/v4/data', {
                            params: {
                                dataset: 'TaiwanStockDividend',
                                data_id: stcokObj.id,
                                start_date: `${theYearBeforeLast}-01-01`,
                                token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRlIjoiMjAyNC0wMS0wMiAxNTowODoyMyIsInVzZXJfaWQiOiIxN2tvYmUiLCJpcCI6IjIxMC43MS4yMTcuMjUxIn0.Dl5cEreMFOqT_4rrpwHwApyVn6vrEovKPMP3-zygpHk',
                            },
                        })
                        // 成功
                        .then((res) => {
                            console.log('GET_DIVIDEND PROCESS');
                            // 要傳那麼多主要是因為 stockList是rootState
                            context.commit('SAVE_DIVIDEND', {
                                stockId: stcokObj.id,
                                stockName: stcokObj.name,
                                stockCostSettings: stcokObj.cost.settings,
                                stockCrawlerDividendLastDate: localcrawlerDividendLastDate,
                                data: res.data,
                            });

                            // 因為同一公司，可能屬不同產業，但同一個代碼，所以要過濾掉
                            console.log('GET_DIVIDEND OVER');
                        })
                        // 失敗
                        .catch((err) => {
                            console.log(err);
                        });
                } else if (!_.has(stcokObj, 'cost.settings')) {
                    // 都沒有股數時，要刪除
                    context.commit('SAVE_DIVIDEND', {
                        stockId: stcokObj.id,
                        stockName: stcokObj.name,
                        stockCostSettings: [],
                        stockCrawlerDividendLastDate: '',
                        data: [],
                    });
                }
            });
        },
    },
    mutations: {
        SAVE_DIVIDEND_LIST(state, data) {
            console.log('SAVE_DIVIDEND_LIST');
            // console.log(data);
            state.dividendList = data;
            // console.log(state.currStockDayData);
        },
        SAVE_STOCK_HISTORY_DIVIDEND_LIST(state, { stockId, stcokObj }) {
            //  在抓完配息後，會去結算歷史配息(需要大於買的時間，還有最後一次結算歷史配息時間，都沒有則取有買且三個月內有配息)
            console.log('SAVE_STOCK_HISTORY_DIVIDEND_LIST');
            // console.log(stockId);
            // console.log(stcokObj);

            // 取得最後一次結算歷史配息時間，使用 _.maxBy 找到最晚的日期，預設值是十三個月前
            let latestPaymentDate = moment().subtract(13, 'months').format('YYYY-MM-DD');
            const filteredStockHistoryDividendData = _.filter(state.historyDividendList, { id: stockId });
            // console.log(filteredStockHistoryDividendData);
            if (filteredStockHistoryDividendData.length > 0) {
                latestPaymentDate = _.maxBy(filteredStockHistoryDividendData, 'payment_date').payment_date;
            }
            // console.log('latestPaymentDate=', latestPaymentDate);

            // 取得最早買的日期時間，這個一定要有
            let earliestBuyDate = stcokObj.cost.settings[0].buy_date;
            // console.log('earliestBuyDate=', earliestBuyDate);

            // 找到最後結算日期
            // 使用 Moment.js 進行日期比較
            const latestPaymentDateMoment = moment(latestPaymentDate);
            const earliestBuyDateMoment = moment(earliestBuyDate);

            const lastSettlementDate = moment.max(latestPaymentDateMoment, earliestBuyDateMoment);

            // console.log('lastSettlementDate=', lastSettlementDate.format('YYYY-MM-DD'));

            // 取出大於最後結算日期的所有配息，並且付款配息要小於等於今天日期
            const filteredStockDividendData = stcokObj.data.dividend.filter(
                (item) =>
                    item.CashDividendPaymentDate !== '' &&
                    moment(item.CashDividendPaymentDate).isAfter(lastSettlementDate) &&
                    moment(item.CashDividendPaymentDate).isSameOrBefore(moment(), 'day')
            );
            // console.log('filteredStockDividendData=', filteredStockDividendData);

            // 塞入至 state.historyDividendList
            let isSaveHistoryToLocalStorage = false;
            filteredStockDividendData.forEach((dividendObj) => {
                // 尋找小於等於除息日前的股票數目
                const accNumber = stcokObj.cost.settings.reduce((acc, { number, buy_date }) => {
                    let addNumber = 0;
                    if (!buy_date || moment(buy_date).isSameOrBefore(dividendObj.CashExDividendTradingDate)) {
                        addNumber = number;
                    }
                    return acc + addNumber;
                }, 0);

                // console.log(accNumber);

                if (accNumber > 0) {
                    state.historyDividendList.push({
                        id: stockId,
                        name: stcokObj.name,
                        payment_date: dividendObj.CashDividendPaymentDate,
                        trading_date: dividendObj.CashExDividendTradingDate,
                        earnings_distribution: dividendObj.CashEarningsDistribution,
                        number_of_shares: accNumber,
                        isSure: true,
                    });
                    isSaveHistoryToLocalStorage = true;
                }
            });
            if (isSaveHistoryToLocalStorage) {
                localStorage.setItem('historyDividendList', JSON.stringify(state.historyDividendList));
            }
        },
        // 一開始載入用，不用再存 localstorage
        SAVE_HISTORY_SPREAD_LIST(state, data) {
            console.log('SAVE_HISTORY_SPREAD_LIST');
            state.historySpreadList = data;
        },
        PUSH_HISTORY_SPREAD_LIST(state, data) {
            // { stockId, stockName, buyAverageCost, sellPrice, buySpend, sellRateOfReturn, sellSpread, sellNumber, sellDate }
            // id、股票名稱、成本價、賣價、本金、報酬率、價差、賣出股數、賣出日期
            console.log('PUSH_HISTORY_SPREAD_LIST');
            state.historySpreadList.push(data);
            localStorage.setItem('historySpreadList', JSON.stringify(state.historySpreadList));
        },
        SAVE_HISTORY_DIVIDEND_LIST(state, data) {
            console.log('SAVE_HISTORY_DIVIDEND_LIST');
            state.historyDividendList = data;
        },
        DEL_A_STOCK_DIVIDENDLIST(state, data) {
            // data 是 object {name: XXX, id: XXX}
            console.log('DEL_A_STOCK_DIVIDENDLIST');
            // 移除某個自選股
            _.remove(state.dividendList, (obj) => obj.id === data);
            localStorage.setItem('dividendList', JSON.stringify(state.dividendList));
        },
        DELETE_DUPLICATE_HISTORY_DIVIDEND_DATA(state, data) {
            console.log('DELETE_DUPLICATE_HISTORY_DIVIDEND_DATA');
            const isEqual = (obj1, obj2) => {
                return obj1.id === obj2.id && obj1.payment_date === obj2.payment_date;
            };

            const uniqueHistoryDividendList = _.uniqWith(state.historyDividendList, isEqual);
            state.historyDividendList = uniqueHistoryDividendList;
            localStorage.setItem('historyDividendList', JSON.stringify(state.historyDividendList));
        },
        SAVE_DIVIDEND(state, { stockId, stockName, stockCostSettings, stockCrawlerDividendLastDate, data }) {
            console.log('SAVE_DIVIDEND');
            // 會清掉再全部重加
            let isSaveToLocalStorage = false;
            if (_.findIndex(state.dividendList, { id: stockId }) !== -1) {
                // 必需要有找到，才要改localstorage
                _.remove(state.dividendList, (obj) => obj.id === stockId);
                isSaveToLocalStorage = true;
            }
            let isSaveHistoryToLocalStorage = false;

            const today = moment().startOf('day');
            // console.log(data);
            // console.log(stockCrawlerDividendLastDate);

            if (_.has(data, 'data') && data.data.length > 0) {
                // ===== 修正 FindMid 股利的 CashDividendPaymentDate 日期有誤 ====
                const found_index_0056 = _.findIndex(data.data, function (o) {
                    return o.stock_id === '0056' && o.date === '2022-10-25';
                });
                if (found_index_0056 > -1) {
                    data.data[found_index_0056].CashDividendPaymentDate = '2022-11-22';
                }

                // ===== 計算歷史股利 ====
                const filterSureDividendHistory = _.filter(
                    data.data,
                    (o) =>
                        moment(o.CashDividendPaymentDate).isSameOrBefore(today) &&
                        moment(o.CashDividendPaymentDate).isAfter(moment(stockCrawlerDividendLastDate))
                ); // 發放日在今天以前，並且是未曾計算日以後，這是確定的喔
                filterSureDividendHistory.forEach((dividendObj) => {
                    // 尋找小於等於除息日前的股票數目
                    const accNumber = stockCostSettings.reduce((acc, { number, buy_date }) => {
                        let addNumber = 0;
                        if (!buy_date || moment(buy_date).isSameOrBefore(dividendObj.CashExDividendTradingDate)) {
                            addNumber = number;
                        }
                        return acc + addNumber;
                    }, 0);

                    // console.log(accNumber);

                    if (accNumber > 0) {
                        state.historyDividendList.push({
                            id: stockId,
                            name: stockName,
                            payment_date: dividendObj.CashDividendPaymentDate,
                            trading_date: dividendObj.CashExDividendTradingDate,
                            earnings_distribution: dividendObj.CashEarningsDistribution,
                            number_of_shares: accNumber,
                            isSure: true,
                        });
                        isSaveHistoryToLocalStorage = true;
                    }
                });

                // ===== 計算今年，現在日期以後確定會發的股利 ====
                let thisYearLastCashDividendPaymentDate = null; // 用於算未確定的，要從這個日期以後
                const filterSureDividend = _.filter(
                    data.data,
                    (o) => moment(o.CashDividendPaymentDate).isSameOrAfter(today) //&& moment(o.date).isBefore(today) // 日期一樣不能是未來日期
                ); // 發放日在今天以後，這是確定的喔

                filterSureDividend.forEach((dividendObj) => {
                    // 尋找小於等於除息日前的股票數目
                    const accNumber = stockCostSettings.reduce((acc, { number, buy_date }) => {
                        let addNumber = 0;
                        if (!buy_date || moment(buy_date).isSameOrBefore(dividendObj.CashExDividendTradingDate)) {
                            addNumber = number;
                        }
                        return acc + addNumber;
                    }, 0);

                    // console.log(accNumber);

                    thisYearLastCashDividendPaymentDate = moment(dividendObj.CashDividendPaymentDate);
                    if (accNumber > 0) {
                        state.dividendList.push({
                            id: stockId,
                            name: stockName,
                            payment_date: dividendObj.CashDividendPaymentDate,
                            trading_date: dividendObj.CashExDividendTradingDate,
                            earnings_distribution: dividendObj.CashEarningsDistribution,
                            number_of_shares: accNumber,
                            isSure: true,
                        });
                    }
                });
                // ===== 計算去年，>現在日期以後，可能會發的股利 =====
                const lastYearStartDate = thisYearLastCashDividendPaymentDate || today;
                const thisDayLastYearAddOneMonth = lastYearStartDate.clone().subtract(1, 'years').add(30, 'days'); // 在此若沒加clone 會改變today值
                const theLastDayOfLastYear = moment().subtract(1, 'years').endOf('year').startOf('day'); // 去年的最後一天

                // console.log(thisYearLastCashDividendPaymentDate.format('YYYY-MM-DD'));
                // console.log(lastYearStartDate.format('YYYY-MM-DD'));
                // console.log(thisDayLastYearAddOneMonth.format('YYYY-MM-DD'));
                // console.log(theLastDayOfLastYear.format('YYYY-MM-DD'));
                // console.log(today.format('YYYY-MM-DD'));
                // 曾經出現預估報酬率，去年的2021出現2筆tradingDate相同，PaymentDate也相同，但 date是未來2027日期的(現在是2022)
                const filterNotSureDividend = _.filter(data.data, (o) => {
                    // console.log(moment(o.CashDividendPaymentDate).format('YYYY-MM-DD'));
                    // console.log(moment(o.CashExDividendTradingDate).format('YYYY-MM-DD'));
                    // console.log(moment(o.date).format('YYYY-MM-DD'));
                    return (
                        moment(o.CashDividendPaymentDate).isSameOrAfter(thisDayLastYearAddOneMonth) &&
                        moment(o.CashExDividendTradingDate).isSameOrBefore(theLastDayOfLastYear) && // 像台積電會少算12月配息日，因為拿到錢是1月份
                        moment(o.date).isBefore(today)
                    ); // date 不能是未來日期
                });
                filterNotSureDividend.forEach((dividendObj) => {
                    state.dividendList.push({
                        id: stockId,
                        name: stockName,
                        payment_date: moment(dividendObj.CashDividendPaymentDate).add(1, 'years').format('YYYY-MM-DD'),
                        trading_date: moment(dividendObj.CashExDividendTradingDate).add(1, 'years').format('YYYY-MM-DD'),
                        earnings_distribution: dividendObj.CashEarningsDistribution, // 此值用二年的預估比較準
                        isSure: false,
                    });
                });

                // const index = _.findIndex(state.stockList, ['id', stockId]);

                this.commit('SAVE_STOCK_LIST_WITH_DIVIDEND_LAST_DATE', {
                    stockId,
                    lastDate: moment().format('YYYY-MM-DD'),
                });
                // rootState.price.stockList[index].crawler_dividend_last_date = moment().format('YYYY-MM-DD');
                // localStorage.setItem('stockList', JSON.stringify(rootState.price.stockList));
                isSaveToLocalStorage = true;
            } else {
                // 沒資料代表 cost.settings 刪掉了。也可代表從來就沒有 cost.settings
                this.commit('SAVE_STOCK_LIST_WITH_DIVIDEND_LAST_DATE', {
                    stockId,
                    lastDate: null,
                });
            }
            if (isSaveToLocalStorage) {
                localStorage.setItem('dividendList', JSON.stringify(state.dividendList));
                console.log('SAVE_DIVIDEND OK');
            }
            if (isSaveHistoryToLocalStorage) {
                localStorage.setItem('historyDividendList', JSON.stringify(state.historyDividendList));
            }
        },
    },
    getters: {
        getSpreadList:
            (state, getters, rootState) =>
            (mode, isCurrentAndOnlyBuy = false) => {
                console.log('getSpreadList');
                // console.log(mode);
                // const { SpreadList } = state;
                let tempSpreadList = undefined;
                if (mode === '目前') {
                    tempSpreadList = _.orderBy(
                        _.filter(rootState.price.stockList, function (obj) {
                            return obj.cost;
                        }),
                        ['cost.market_value'],
                        ['desc']
                    );
                    if (!isCurrentAndOnlyBuy) {
                        let noBuyList = _.filter(rootState.price.stockList, function (obj) {
                            return !obj.cost;
                        });

                        tempSpreadList = _.orderBy(_.concat(tempSpreadList, noBuyList), ['order'], ['asc']);
                        const stockFairValueList = GlobalSettings.stock_fair_value;
                        tempSpreadList.forEach((obj) => {
                            const foundFairValueStock = stockFairValueList.find((v) => v.id === obj.id);
                            if (foundFairValueStock) {
                                obj.fair_value = foundFairValueStock.fair_value;
                            }
                        });
                    }
                } else {
                    // 歷史
                    tempSpreadList = state.historySpreadList;
                    tempSpreadList.forEach(function (obj, index) {
                        tempSpreadList[index].cost = {};
                        tempSpreadList[index].cost.avg = obj.buy_average_cost; // 成本價
                        tempSpreadList[index].cost.sum = obj.buy_spend; // 本金
                        tempSpreadList[index].cost.rate_of_return = obj.sell_rate_of_return; // 報酬率
                        tempSpreadList[index].cost.return = obj.sell_return; // 價差
                        tempSpreadList[index].cost.total = obj.sell_number; // 累積股數
                    });
                    tempSpreadList = _.orderBy(tempSpreadList, ['sell_date'], ['desc']);
                }
                // console.log(tempSpreadList);
                return tempSpreadList;
            },
        // 該股票的股數，是另外再去撈的，如此才能當股數改變時又能即時反應
        getDividendList: (state, getters, rootState) => (mode) => {
            console.log('getDividendList', mode);
            // const { dividendList } = state;
            let tempDividendList = [];

            if (mode === '未來') {
                const todayDate = moment();
                rootState.price.stockList.forEach((stcokObj) => {
                    // 過濾出CashDividendPaymentDate大於今天的元素
                    // 必需有買 cost，且有配息資料
                    if (stcokObj.cost && stcokObj.data && stcokObj.data.dividend) {
                        stcokObj.data.dividend.forEach((dividendObj) => {
                            if ('CashDividendPaymentDate' in dividendObj) {
                                const dividendPaymentDate = moment(dividendObj.CashDividendPaymentDate, 'YYYY-MM-DD');
                                if (dividendPaymentDate.isAfter(todayDate)) {
                                    // 將符合條件的元素加入結果陣列
                                    // filteredFutureDividendData.push(item);
                                    tempDividendList.push({
                                        id: stcokObj.id,
                                        name: stcokObj.name,
                                        payment_date: dividendObj.CashDividendPaymentDate,
                                        trading_date: dividendObj.CashExDividendTradingDate,
                                        earnings_distribution: dividendObj.CashEarningsDistribution,
                                        number_of_shares: stcokObj.cost.total,
                                        isSure: true,
                                    });
                                }
                            }
                        });
                    }

                    // const filteredFutureDividendData = stcokObj.data.dividend.filter((item) => {
                    //     if ('CashDividendPaymentDate' in item) {
                    //         const dividendPaymentDate = moment(item.CashDividendPaymentDate, 'YYYY-MM-DD');
                    //         return dividendPaymentDate.isValid() && dividendPaymentDate.isAfter(todayDate);
                    //     }
                    //     return false;
                    // });
                    // console.log(filteredFutureDividendData);
                });
            } else {
                // 歷史
                tempDividendList = state.historyDividendList;
            }

            // if (mode === '未來') tempDividendList = state.dividendList;
            // else tempDividendList = state.historyDividendList; // 歷史

            // // 若沒有股數，則加上股數
            // tempDividendList.forEach((obj, index) => {
            //     const foundStock = _.find(rootState.price.stockList, ['id', obj.id]);
            //     // 有可能清掉股票了，但 dividendlist 還保留著，所以要判斷
            //     // 也有可能股票 cost 還沒載入的樣子
            //     if (!tempDividendList[index].number_of_shares && !foundStock) return [];
            //     if (!tempDividendList[index].number_of_shares) tempDividendList[index].number_of_shares = foundStock.cost.total;
            // });

            if (mode === '歷史') return _.orderBy(tempDividendList, ['payment_date'], ['desc']);
            else return _.orderBy(tempDividendList, ['trading_date'], ['asc']);
        },
        // getStockDividendList: (state) => (stockId) => {
        //     console.log('getStockDividendList');
        //     return _.orderBy(
        //         _.concat(_.filter(state.dividendList, { id: stockId }), _.filter(state.historyDividendList, { id: stockId })),
        //         ['trading_date'],
        //         ['asc']
        //     );
        // },
    },
};

export default dividend;
