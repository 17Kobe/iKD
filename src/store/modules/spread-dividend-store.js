import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';

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
                if (
                    _.has(stcokObj, 'cost.settings') &&
                    stcokObj.type !== 'fund' &&
                    stcokObj.is_dividend &&
                    today !== localcrawlerDividendLastDate
                ) {
                    // 為了只下一次API，但還要抓二年的資料回來算平均
                    axios
                        .get('https://api.finmindtrade.com/api/v4/data', {
                            params: {
                                dataset: 'TaiwanStockDividend',
                                data_id: stcokObj.id,
                                start_date: `${theYearBeforeLast}-01-01`,
                                token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJkYXRlIjoiMjAyMi0wMi0wOCAxMzoyODozOCIsInVzZXJfaWQiOiIxN2tvYmUiLCJpcCI6IjIxMC43MS4yMTcuMjQ2In0.QZraZM9320Ut0rkes4YsqtqHR38NitKO-52Sk4KhYHE',
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
        SAVE_HISTORY_SPREAD_LIST(state, data) {
            console.log('SAVE_HISTORY_SPREAD_LIST');
            state.historySpreadList = data;
        },
        PUSH_HISTORY_DIVIDEND_LIST(state, data) {
            // { stockId, stockName, buyAverageCost, sellPrice, buySpend, sellRateOfReturn, sellSpread, sellNumber, sellDate }
            // id、股票名稱、成本價、賣價、本金、報酬率、價差、賣出股數、賣出日期
            console.log('PUSH_HISTORY_DIVIDEND_LIST');
            state.historySpreadList.push(data);
            localStorage.setItem('historySpreadList', JSON.stringify(state.historySpreadList));
        },
        SAVE_HISTORY_DIVIDEND_LIST(state, data) {
            console.log('SAVE_HISTORY_DIVIDEND_LIST');
            state.historyDividendList = data;
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

            if (_.has(data, 'data') && data.data.length > 0) {
                // 2022/01/01
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

                    console.log(accNumber);

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
                const filterSureDividend = _.filter(data.data, (o) => moment(o.CashDividendPaymentDate).isSameOrAfter(today)); // 發放日在今天以後，這是確定的喔

                filterSureDividend.forEach((dividendObj) => {
                    // 尋找小於等於除息日前的股票數目
                    const accNumber = stockCostSettings.reduce((acc, { number, buy_date }) => {
                        let addNumber = 0;
                        if (!buy_date || moment(buy_date).isSameOrBefore(dividendObj.CashExDividendTradingDate)) {
                            addNumber = number;
                        }
                        return acc + addNumber;
                    }, 0);

                    console.log(accNumber);

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

                // 曾經出現預估報酬率，去年的2021出現2筆tradingDate相同，PaymentDate也相同，但 date是未來2027日期的(現在是2022)
                const filterNotSureDividend = _.filter(data.data, (o) => {
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
        getSpreadList: (state, getters, rootState) => (mode) => {
            console.log('getSpreadList');
            // console.log(mode);
            // const { SpreadList } = state;
            let tempSpreadList = undefined;
            if (mode === '最新')
                tempSpreadList = _.filter(rootState.price.stockList, function (obj) {
                    return obj.cost;
                });
            else {
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
            }
            console.log(tempSpreadList);
            return _.orderBy(tempSpreadList, ['cost.sum'], ['desc']);
        },
        // 該股票的股數，是另外再去撈的，如此才能當股數改變時又能即時反應
        getDividendList: (state, getters, rootState) => (mode) => {
            console.log('getDividendList');
            // const { dividendList } = state;
            let tempDividendList = undefined;
            if (mode === '預估') tempDividendList = state.dividendList;
            else tempDividendList = state.historyDividendList; // 歷史

            // 若沒有股數，則加上股數
            tempDividendList.forEach((obj, index) => {
                const foundStock = _.find(rootState.price.stockList, ['id', obj.id]);
                if (!tempDividendList[index].number_of_shares) tempDividendList[index].number_of_shares = foundStock.cost.total;
            });
            return _.orderBy(tempDividendList, ['trading_date'], ['asc']);
        },
    },
};

export default dividend;
