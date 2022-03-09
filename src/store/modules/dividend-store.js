import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';

const defaultState = {
    dividendList: [],
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
            const localcrawlerDividendLastDate =
                localStorage.getItem('crawlerDividendLastDate') || moment().subtract(1, 'days').format('YYYY-MM-DD');
            // 用字串比日期就好了
            if (today !== localcrawlerDividendLastDate) {
                context.rootState.price.stockList.forEach((stcokObj) => {
                    // 必須是有買的才要去抓未來配息
                    if (_.has(stcokObj, 'cost.settings')) {
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
                                    numberOfShares: stcokObj.cost.total,
                                    data: res.data,
                                });
                                localStorage.setItem('crawlerDividendLastDate', moment().format('YYYY-MM-DD'));
                                // 因為同一公司，可能屬不同產業，但同一個代碼，所以要過濾掉
                                console.log('GET_DIVIDEND OVER');
                            })
                            // 失敗
                            .catch((err) => {
                                console.log(err);
                            });
                    }
                });
            }
        },
    },
    mutations: {
        SAVE_DIVIDEND_LIST(state, data) {
            console.log('SAVE_DIVIDEND_LIST');
            // console.log(data);
            state.dividendList = data;
            // console.log(state.currStockDayData);
        },
        SAVE_DIVIDEND(state, { stockId, stockName, numberOfShares, data }) {
            console.log('SAVE_DIVIDEND');
            // 會清掉再全部重加
            _.remove(state.dividendList, (obj) => obj.id === stockId);

            const today = moment().startOf('day');

            if (_.has(data, 'data') && data.data.length > 0) {
                // 計算今年，現在日期以後確定會發的股利
                let thisYearLastCashDividendPaymentDate = null; // 用於算未確定的，要從這個日期以後
                const filterSureDividend = _.filter(data.data, (o) => moment(o.CashDividendPaymentDate).isSameOrAfter(today));
                filterSureDividend.forEach((dividendObj) => {
                    thisYearLastCashDividendPaymentDate = moment(dividendObj.CashDividendPaymentDate);
                    state.dividendList.push({
                        id: stockId,
                        name: stockName,
                        number_of_shares: numberOfShares,
                        payment_date: dividendObj.CashDividendPaymentDate,
                        trading_date: dividendObj.CashExDividendTradingDate,
                        earnings_distribution: dividendObj.CashEarningsDistribution,
                        isSure: true,
                    });
                });
                // 計算去年，>現在日期以後，可能會發的股利
                const lastYearStartDate = thisYearLastCashDividendPaymentDate || today;
                const thisDayLastYearAddOneMonth = lastYearStartDate.subtract(1, 'years').add(30, 'days');
                const theLastDayOfLastYear = moment().subtract(1, 'years').endOf('year').startOf('day'); // 去年的最後一天

                const filterNotSureDividend = _.filter(
                    data.data,
                    (o) =>
                        moment(o.CashDividendPaymentDate).isSameOrAfter(thisDayLastYearAddOneMonth) &&
                        moment(o.CashDividendPaymentDate).isSameOrBefore(theLastDayOfLastYear)
                );
                filterNotSureDividend.forEach((dividendObj) => {
                    state.dividendList.push({
                        id: stockId,
                        name: stockName,
                        number_of_shares: numberOfShares,
                        payment_date: moment(dividendObj.CashDividendPaymentDate).add(1, 'years').format('YYYY-MM-DD'),
                        trading_date: moment(dividendObj.CashExDividendTradingDate).add(1, 'years').format('YYYY-MM-DD'),
                        earnings_distribution: dividendObj.CashEarningsDistribution, // 此值用二年的預估比較準
                        isSure: false,
                    });
                });
                localStorage.setItem('dividendList', JSON.stringify(state.dividendList));
            }
            console.log('SAVE_DIVIDEND OVER');
        },
    },
    getters: {},
};

export default dividend;
